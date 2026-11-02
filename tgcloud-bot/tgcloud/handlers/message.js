// Global Trainings · «Professional psixolog trener» boti (Telegram Serverless / tgcloud).
//
// Bitta fayl: BotFather → Serverless → Handlers → message bo‘limiga to‘liq nusxalab qo‘yiladi.
// Ma’lumotlar bazasi jadvallarini fayl o‘zi yaratadi (Database bo‘limida hech narsa qilish shart emas).
//
// Nima qiladi:
//   /start          → kutib olish xabari + «Kurs sayti va yozilish» (Mini App) va «Raqamni yuborish» tugmalari;
//                     odam botga birinchi marta kirsa, administratorga qisqa ma’lumoti boradi.
//   Raqam yuborsa   → ismi va telefoni administratorga boradi.
//   Formani yuborsa → saytdagi to‘liq ariza (Mini App sendData) administratorga boradi.
//   Oddiy xabar     → savol sifatida administratorga yetkaziladi.
//   @Global_Admin19 → botga /start bosganda administrator sifatida ulanadi; shundan keyin
//                     hamma arizalar shu chatga keladi. Ulanguncha kelganlari ham yo‘qolmaydi.
//   /id             → chat raqamini ko‘rsatadi.   /stats → administrator uchun statistika.

import { api, db } from 'sdk';
import { sql } from 'sdk/db';

// ---------------------------------------------------------------- sozlamalar
const ADMIN_USERNAME = 'Global_Admin19';            // arizalar shu profilga keladi
const ADMIN_CHAT_ID = 0;                            // ixtiyoriy: raqamini bilsangiz yozing, aks holda 0
const SITE_URL = 'https://nshakhobiddin.github.io/GTGTrenerKurs/';
const APP_URL = SITE_URL + '?src=bot';                // sayt boshidan to‘liq ochiladi
const COURSE = '«Professional psixolog trener»';
const EVENT = '12-noyabr, payshanba, 15:00';
const ADDRESS = 'Toshkent, Chilonzor, 11-a uy (Kohinur «Korzinka» ro‘parasi)';
const MAP_URL = 'https://yandex.uz/maps/org/global_trainings/17100811275/?lang=ru&ll=69.204693%2C41.273786&source=wizbiz_new_map_single&z=15';
const PHONE = '+998 90 005 00 19';

// ---------------------------------------------------------------- yordamchilar
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function clean(v, max, keepNewlines = false) {
  let s = String(v ?? '');
  s = keepNewlines ? s.replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, ' ') : s.replace(/[\u0000-\u001f\u007f]/g, ' ');
  return s.replace(/[ \t]+/g, ' ').trim().slice(0, max);
}

function normPhone(p) {
  let d = String(p || '').replace(/\D/g, '');
  if (d.length === 9) d = '998' + d;
  return /^998\d{9}$/.test(d) ? '+' + d : (d ? '+' + d : '');
}

function prettyPhone(p) {
  const m = /^\+998(\d{2})(\d{3})(\d{2})(\d{2})$/.exec(p);
  return m ? `+998 ${m[1]} ${m[2]} ${m[3]} ${m[4]}` : p;
}

function tashkentNow() {
  const d = new Date(Date.now() + 5 * 3600 * 1000);
  const p = (n) => String(n).padStart(2, '0');
  return `${p(d.getUTCDate())}.${p(d.getUTCMonth() + 1)}.${d.getUTCFullYear()} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}`;
}

const fullName = (u) => [u.first_name, u.last_name].filter(Boolean).join(' ') || 'Foydalanuvchi';

/** Administrator xabari oxiridagi «kim yubordi» bloki. */
function whoLines(u) {
  return [
    `Telegram: <a href="tg://user?id=${Number(u.id)}">${esc(fullName(u))}</a>${u.username ? ' · @' + esc(u.username) : ''}`,
    `ID: <code>${Number(u.id)}</code>`,
    `Vaqt: ${tashkentNow()} (Toshkent)`,
  ];
}

const userKeyboard = {
  keyboard: [
    [{ text: '🌐 Kurs sayti va yozilish', web_app: { url: APP_URL } }],
    [{ text: '📱 Raqamni yuborish', request_contact: true }],
  ],
  resize_keyboard: true,
  is_persistent: true,
  input_field_placeholder: 'Savolingizni yozing',
};

const infoButtons = {
  inline_keyboard: [
    [{ text: '📍 Xaritada ochish', url: MAP_URL }],
    [{ text: '💬 Administratorga yozish', url: `https://t.me/${ADMIN_USERNAME}` }],
  ],
};

// ---------------------------------------------------------------- baza
let ready = null;
function ensureTables() {
  if (!ready) {
    ready = (async () => {
      await db.run(sql`CREATE TABLE IF NOT EXISTS gt_users (
        tg_id INTEGER PRIMARY KEY,
        first_name TEXT, last_name TEXT, username TEXT, lang TEXT,
        phone TEXT, start_param TEXT,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        last_seen_at INTEGER NOT NULL DEFAULT (unixepoch()))`);
      await db.run(sql`CREATE TABLE IF NOT EXISTS gt_settings (key TEXT PRIMARY KEY, value TEXT)`);
      await db.run(sql`CREATE TABLE IF NOT EXISTS gt_leads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tg_id INTEGER, kind TEXT NOT NULL, text TEXT NOT NULL,
        delivered INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()))`);
    })().catch((e) => { ready = null; throw e; });
  }
  return ready;
}

async function getSetting(key) {
  const row = await db.get(sql`SELECT value FROM gt_settings WHERE key = ${key}`);
  return row ? row.value : null;
}

async function setSetting(key, value) {
  await db.run(sql`INSERT INTO gt_settings (key, value) VALUES (${key}, ${String(value)})
    ON CONFLICT(key) DO UPDATE SET value = excluded.value`);
}

/** Foydalanuvchini saqlaydi. Birinchi marta kelgan bo‘lsa true qaytaradi. */
async function saveUser(u, startParam) {
  const old = await db.get(sql`SELECT tg_id FROM gt_users WHERE tg_id = ${u.id}`);
  if (old) {
    await db.run(sql`UPDATE gt_users SET first_name = ${u.first_name || ''}, last_name = ${u.last_name || ''},
      username = ${u.username || ''}, lang = ${u.language_code || ''}, last_seen_at = unixepoch()
      WHERE tg_id = ${u.id}`);
    return false;
  }
  await db.run(sql`INSERT INTO gt_users (tg_id, first_name, last_name, username, lang, start_param)
    VALUES (${u.id}, ${u.first_name || ''}, ${u.last_name || ''}, ${u.username || ''}, ${u.language_code || ''}, ${startParam || ''})`);
  return true;
}

async function adminChatId() {
  if (ADMIN_CHAT_ID) return ADMIN_CHAT_ID;
  const v = await getSetting('admin_chat_id');
  return v ? Number(v) : 0;
}

const isAdminUser = (u) => (u.username || '').toLowerCase() === ADMIN_USERNAME.toLowerCase()
  || (ADMIN_CHAT_ID && u.id === ADMIN_CHAT_ID);

/** Arizani bazaga yozadi va administratorga yuboradi. Administrator hali ulanmagan bo‘lsa kutib turadi. */
async function notifyAdmin(fromId, kind, html) {
  const res = await db.run(sql`INSERT INTO gt_leads (tg_id, kind, text) VALUES (${fromId}, ${kind}, ${html})`);
  const id = res.lastInsertRowid;
  const admin = await adminChatId();
  if (!admin) return false;
  try {
    await api.sendMessage({ chat_id: admin, text: html, parse_mode: 'HTML', link_preview_options: { is_disabled: true } });
    await db.run(sql`UPDATE gt_leads SET delivered = 1 WHERE id = ${id}`);
    return true;
  } catch (e) {
    console.error('admin send failed', e.code, e.description);
    return false;
  }
}

/** Administrator ulanganda yetkazilmay qolgan arizalarni yuboradi. */
async function flushPending(admin) {
  const rows = await db.all(sql`SELECT id, text FROM gt_leads WHERE delivered = 0 ORDER BY id LIMIT 30`);
  for (const r of rows) {
    try {
      await api.sendMessage({ chat_id: admin, text: r.text, parse_mode: 'HTML', link_preview_options: { is_disabled: true } });
      await db.run(sql`UPDATE gt_leads SET delivered = 1 WHERE id = ${r.id}`);
    } catch (e) {
      console.error('flush failed', e.code, e.description);
      break;
    }
  }
  return rows.length;
}

const send = (chat_id, text, extra = {}) =>
  api.sendMessage({ chat_id, text, parse_mode: 'HTML', link_preview_options: { is_disabled: true }, ...extra });

// ---------------------------------------------------------------- ariza matnlari
function appFromForm(data) {
  let b;
  try { b = JSON.parse(data); } catch { return null; }
  if (!b || typeof b !== 'object') return null;
  const name = clean(b.name, 80);
  const phone = normPhone(b.phone);
  if (name.length < 2 || !/^\+998\d{9}$/.test(phone)) return null;
  return {
    name, phone,
    format: clean(b.format, 20) || 'Oflayn',
    goals: (Array.isArray(b.goals) ? b.goals : []).slice(0, 5).map((g) => clean(g, 60)).filter(Boolean),
    exp: clean(b.exp, 40),
    src: clean(b.src, 40),
    note: clean(b.note, 500, true),
  };
}

function formLeadText(a, u) {
  const lines = [
    `📝 <b>Yangi ariza</b> · ${COURSE}`,
    '',
    `Ism: <b>${esc(a.name)}</b>`,
    `Telefon: <code>${esc(prettyPhone(a.phone))}</code>`,
    `Format: ${esc(a.format)}`,
  ];
  if (a.goals.length) lines.push(`Maqsadi: ${a.goals.map(esc).join(', ')}`);
  if (a.exp) lines.push(`Tajribasi: ${esc(a.exp)}`);
  if (a.src) lines.push(`Qayerdan bildi: ${esc(a.src)}`);
  if (a.note) lines.push(`Izoh: ${esc(a.note)}`);
  lines.push('', 'Manba: bot, Mini App forma', ...whoLines(u));
  return lines.join('\n');
}

const thanks = (name) => [
  `Rahmat, ${esc(name)}! Ma’lumotlaringiz administratorga yuborildi.`,
  'Tez orada siz bilan bog‘lanishadi.',
  '',
  `🗓 Tanishtiruv kuni: <b>${EVENT}</b>, bepul`,
  `📍 ${ADDRESS}`,
].join('\n');

// ---------------------------------------------------------------- asosiy handler
export default async function (message) {
  const from = message.from;
  if (!from || from.is_bot) return;
  const chatId = message.chat.id;
  const isPrivate = message.chat.type === 'private';
  const text = (message.text || '').trim();
  const [cmdRaw, ...rest] = text.startsWith('/') ? text.split(/\s+/) : [''];
  const cmd = cmdRaw.toLowerCase().split('@')[0];

  if (cmd === '/id') {
    await send(chatId, `Chat ID: <code>${chatId}</code>`);
    return;
  }
  if (!isPrivate) return;

  await ensureTables();

  // ---- administrator
  if (isAdminUser(from)) {
    if (cmd === '/stats') {
      const u = await db.get(sql`SELECT count(*) AS c FROM gt_users`);
      const all = await db.get(sql`SELECT count(*) AS c FROM gt_leads WHERE kind IN ('form', 'phone')`);
      const today = await db.get(sql`SELECT count(*) AS c FROM gt_leads WHERE kind IN ('form', 'phone')
        AND created_at >= unixepoch('now', '+5 hours', 'start of day', '-5 hours')`);
      await send(chatId, [
        '📊 <b>Statistika</b>',
        `Botga kirganlar: <b>${u ? u.c : 0}</b>`,
        `Arizalar (forma + raqam): <b>${all ? all.c : 0}</b>`,
        `Bugun: <b>${today ? today.c : 0}</b>`,
      ].join('\n'));
      return;
    }
    const prev = await getSetting('admin_chat_id');
    const fresh = String(prev) !== String(chatId);
    if (fresh) await setSetting('admin_chat_id', chatId);
    const sent = await flushPending(chatId);
    if (fresh || cmd === '/start' || sent) {
      await send(chatId, [
        '✅ <b>Siz administrator sifatida ulangansiz.</b>',
        'Botga kirganlar, qoldirilgan raqamlar, arizalar va savollar shu chatga keladi.',
        sent ? `\nKutib turgan ${sent} ta xabar yuborildi.` : '',
        '\n/stats: statistika',
      ].join('\n'), { reply_markup: { remove_keyboard: true } });
    } else {
      await send(chatId, 'Administrator rejimi. /stats: statistika');
    }
    return;
  }

  // ---- /start
  if (cmd === '/start') {
    const param = clean(rest.join(' '), 64);
    const isNew = await saveUser(from, param);
    if (isNew) {
      const lines = ['👤 <b>Botga yangi odam kirdi</b>', '', `Ism: <b>${esc(fullName(from))}</b>`];
      lines.push(from.username ? `Username: @${esc(from.username)}` : 'Username: yo‘q');
      if (from.language_code) lines.push(`Til: ${esc(from.language_code)}`);
      if (param) lines.push(`Qayerdan: ${esc(param)}`);
      lines.push('', ...whoLines(from));
      await notifyAdmin(from.id, 'start', lines.join('\n'));
    }
    await send(chatId, [
      `Assalomu alaykum, <b>${esc(from.first_name || 'do‘st')}</b>! 👋`,
      '',
      `Bu <b>Global Trainings</b> boti. ${COURSE} kursining bepul tanishtiruv kuniga shu yerda yozilasiz.`,
      '',
      `🗓 <b>${EVENT}</b>, bepul`,
      `📍 ${ADDRESS}`,
      '',
      'Yozilishning ikki yo‘li bor:',
      '🌐 <b>Kurs sayti va yozilish</b>: kurs haqida hammasi, video va qisqa forma',
      '📱 <b>Raqamni yuborish</b>: bir bosishda, administrator o‘zi qo‘ng‘iroq qiladi',
      '',
      'Savolingiz bo‘lsa, shu yerga yozing.',
    ].join('\n'), { reply_markup: userKeyboard });
    await send(chatId, 'Manzil va aloqa:', { reply_markup: infoButtons });
    return;
  }

  await saveUser(from, '');

  // ---- forma (Mini App sendData)
  if (message.web_app_data) {
    const a = appFromForm(message.web_app_data.data);
    if (!a) {
      await send(chatId, 'Arizani o‘qib bo‘lmadi. Iltimos, «🌐 Kurs sayti va yozilish» tugmasi orqali qayta yuboring yoki raqamingizni yuboring.', { reply_markup: userKeyboard });
      return;
    }
    await db.run(sql`UPDATE gt_users SET phone = ${a.phone} WHERE tg_id = ${from.id}`);
    await notifyAdmin(from.id, 'form', formLeadText(a, from));
    await send(chatId, thanks(a.name), { reply_markup: userKeyboard });
    return;
  }

  // ---- kontakt (Raqamni yuborish tugmasi)
  if (message.contact) {
    const c = message.contact;
    if (c.user_id && c.user_id !== from.id) {
      await send(chatId, 'Iltimos, o‘zingizning raqamingizni «📱 Raqamni yuborish» tugmasi orqali yuboring.', { reply_markup: userKeyboard });
      return;
    }
    const phone = normPhone(c.phone_number);
    await db.run(sql`UPDATE gt_users SET phone = ${phone} WHERE tg_id = ${from.id}`);
    await notifyAdmin(from.id, 'phone', [
      '📱 <b>Raqam qoldirdi</b> · tanishtiruv kuniga yozilmoqchi',
      '',
      `Ism: <b>${esc([c.first_name, c.last_name].filter(Boolean).join(' ') || fullName(from))}</b>`,
      `Telefon: <code>${esc(prettyPhone(phone))}</code>`,
      '',
      ...whoLines(from),
    ].join('\n'));
    await send(chatId, thanks(c.first_name || from.first_name || ''), { reply_markup: userKeyboard });
    return;
  }

  // ---- oddiy matn: telefon raqami yoki savol
  if (text && !text.startsWith('/')) {
    const maybePhone = normPhone(text);
    if (/^\+998\d{9}$/.test(maybePhone) && text.replace(/[\s()+-]/g, '').length <= 12) {
      await db.run(sql`UPDATE gt_users SET phone = ${maybePhone} WHERE tg_id = ${from.id}`);
      await notifyAdmin(from.id, 'phone', [
        '📱 <b>Raqam qoldirdi</b> (qo‘lda yozdi)',
        '',
        `Ism: <b>${esc(fullName(from))}</b>`,
        `Telefon: <code>${esc(prettyPhone(maybePhone))}</code>`,
        '',
        ...whoLines(from),
      ].join('\n'));
      await send(chatId, thanks(from.first_name || ''), { reply_markup: userKeyboard });
      return;
    }
    await notifyAdmin(from.id, 'question', [
      '💬 <b>Savol / xabar</b>',
      '',
      esc(clean(text, 1500, true)),
      '',
      ...whoLines(from),
    ].join('\n'));
    await send(chatId, 'Xabaringiz administratorga yetkazildi. Javobni shu yerda yoki Telegram orqali olasiz.', { reply_markup: userKeyboard });
    return;
  }

  // ---- boshqa narsa (rasm, stiker va h.k.)
  await send(chatId, 'Yozilish uchun pastdagi tugmalardan birini bosing yoki savolingizni matn bilan yozing.', { reply_markup: userKeyboard });
}
