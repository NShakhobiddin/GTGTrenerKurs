// POST /api/telegram: Telegram webhook. /start, /id va Mini App'dan (klaviatura tugmasi) kelgan arizalar.
import { env, tg, parseApplication, applicationText, thanksText, startKeyboard, startInline, esc, COURSE, EVENT, ADDRESS } from '../lib/telegram.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(200).send('Global Trainings bot ishlayapti.'); return; }
  if (env.secret && req.headers['x-telegram-bot-api-secret-token'] !== env.secret) { res.status(401).end(); return; }

  const update = typeof req.body === 'string' ? safeJson(req.body) : (req.body || {});
  const m = update.message;
  try {
    if (m) await onMessage(m);
  } catch (e) {
    console.error('webhook', e);
  }
  // Telegram'ga har doim 200 qaytaramiz, aks holda u xabarni qayta-qayta yuboradi.
  res.status(200).json({ ok: true });
}

async function onMessage(m) {
  const chat = m.chat.id;
  const text = (m.text || '').trim();

  // Mini App klaviatura tugmasidan ochilib, Telegram.WebApp.sendData orqali yuborilgan ariza.
  if (m.web_app_data) {
    const app = parseApplication(safeJson(m.web_app_data.data));
    if (!app) { await tg('sendMessage', { chat_id: chat, text: 'Arizani o‘qib bo‘lmadi. Iltimos, qaytadan urinib ko‘ring.' }); return; }
    if (env.admin) {
      await tg('sendMessage', { chat_id: env.admin, text: applicationText(app, m.from, 'Mini App (bot)'), parse_mode: 'HTML', link_preview_options: { is_disabled: true } });
    } else {
      console.warn('ADMIN_CHAT_ID berilmagan, ariza faqat logda:', JSON.stringify(app));
    }
    await tg('sendMessage', { chat_id: chat, text: thanksText(app.name), parse_mode: 'HTML', reply_markup: startKeyboard() });
    return;
  }

  if (/^\/start\b/.test(text)) {
    await tg('sendMessage', {
      chat_id: chat,
      parse_mode: 'HTML',
      text: [
        `Assalomu alaykum, ${esc(m.from?.first_name || '')}.`.replace(', .', '.'),
        '',
        `Global Trainings Group ${COURSE} kursiga taklif qiladi. Ustoz: Dilshod Mannopov.`,
        '',
        `Bepul tanishtiruv kuni: <b>${EVENT}</b>`,
        `Manzil: ${ADDRESS}`,
        '',
        'Yozilish uchun pastdagi «📝 Bepul darsga yozilish» tugmasini bosing.',
      ].join('\n'),
      reply_markup: startKeyboard(),
    });
    await tg('sendMessage', { chat_id: chat, text: 'Kurs dasturi, ustoz videolari va savollar:', reply_markup: startInline() });
    return;
  }

  if (/^\/id\b/.test(text)) {
    await tg('sendMessage', { chat_id: chat, parse_mode: 'HTML', text: `Bu chat ID: <code>${chat}</code>\nUni Vercel'dagi ADMIN_CHAT_ID qiymatiga yozing.` });
    return;
  }

  if (m.chat.type === 'private') {
    await tg('sendMessage', { chat_id: chat, text: 'Yozilish uchun pastdagi «📝 Bepul darsga yozilish» tugmasini bosing.', reply_markup: startKeyboard() });
  }
}

function safeJson(s) { try { return JSON.parse(s); } catch { return null; } }
