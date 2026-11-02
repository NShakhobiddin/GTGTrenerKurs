// GET /api/setup?key=SETUP_KEY: bir martalik sozlash.
// Webhook, buyruqlar, menyu tugmasi (Mini App) va bot tavsifini o'rnatadi.
import { env, tg, esc, COURSE } from '../lib/telegram.js';

export default async function handler(req, res) {
  const url = new URL(req.url, 'http://localhost');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  if (!env.setupKey || url.searchParams.get('key') !== env.setupKey) {
    res.status(403).send(page('Ruxsat yo‘q', ['SETUP_KEY berilmagan yoki manzildagi key noto‘g‘ri.']));
    return;
  }
  if (!env.token) { res.status(500).send(page('BOT_TOKEN yo‘q', ['Vercel sozlamalarida BOT_TOKEN qiymatini kiriting va qayta deploy qiling.'])); return; }

  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const webhook = `https://${host}/api/telegram`;
  const steps = [];
  const run = async (label, method, payload) => {
    const r = await tg(method, payload);
    steps.push(`${r.ok ? '✅' : '❌'} ${label}${r.ok ? '' : ': ' + esc(r.description || 'xato')}`);
    return r;
  };

  const me = await run('Bot topildi', 'getMe');
  await run(`Webhook: ${webhook}`, 'setWebhook', {
    url: webhook,
    ...(env.secret ? { secret_token: env.secret } : {}),
    allowed_updates: ['message'],
    drop_pending_updates: true,
  });
  await run('Buyruqlar (/start, /id)', 'setMyCommands', {
    commands: [
      { command: 'start', description: 'Boshlash va yozilish' },
      { command: 'id', description: 'Chat ID ni bilish (administrator uchun)' },
    ],
  });
  await run(`Menyu tugmasi: Kurs → ${env.site}`, 'setChatMenuButton', {
    menu_button: { type: 'web_app', text: 'Kurs', web_app: { url: env.site } },
  });
  await run('Bot tavsifi', 'setMyDescription', {
    description: `Global Trainings Group: ${COURSE} kursi. Ustoz Dilshod Mannopov. 3 oy, haftada 2 marta, onlayn yoki oflayn. Bepul tanishtiruv kuni: 12-noyabr, 15:00, Toshkent, Chilonzor. Yozilish uchun «Start» tugmasini bosing.`,
  });
  await run('Qisqa tavsif', 'setMyShortDescription', {
    short_description: `${COURSE} kursi. 1-kun bepul: 12-noyabr, 15:00.`,
  });

  const notes = [];
  if (!env.admin) notes.push('ADMIN_CHAT_ID hali berilmagan. Administrator botga /id yuborsin, chiqqan raqamni Vercel\'da ADMIN_CHAT_ID ga yozib, qayta deploy qiling.');
  if (!env.secret) notes.push('WEBHOOK_SECRET berilmagan. Xavfsizlik uchun uni ham qo‘shish tavsiya etiladi.');
  const name = me.ok ? '@' + esc(me.result.username) : 'bot';
  res.status(200).send(page(`${name} sozlandi`, steps.concat(notes.length ? ['', ...notes] : [])));
}

function page(title, lines) {
  return `<!doctype html><html lang="uz"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title>
<style>body{margin:0;background:#000;color:#fff;font:16px/1.5 system-ui,sans-serif;padding:32px 16px}main{max-width:640px;margin:auto}h1{font-size:24px;line-height:32px}li{margin:8px 0;list-style:none}</style></head>
<body><main><h1>${title}</h1><ul>${lines.map((l) => `<li>${l || '&nbsp;'}</li>`).join('')}</ul></main></body></html>`;
}
