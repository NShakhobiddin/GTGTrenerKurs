// Global Trainings bot: umumiy yordamchi funksiyalar (Vercel serverless, Node 18+).
// Hech qanday tashqi paket kerak emas: fetch va crypto Node'ning o'zida bor.
import crypto from 'node:crypto';

export const env = {
  token: (process.env.BOT_TOKEN || '').trim(),
  admin: (process.env.ADMIN_CHAT_ID || '').trim(),
  site: (process.env.SITE_URL || 'https://nshakhobiddin.github.io/GTGTrenerKurs/').trim(),
  secret: (process.env.WEBHOOK_SECRET || '').trim(),
  setupKey: (process.env.SETUP_KEY || '').trim(),
  origins: (process.env.ALLOWED_ORIGINS || 'https://nshakhobiddin.github.io')
    .split(',').map((s) => s.trim()).filter(Boolean),
};

export const COURSE = '«Professional psixolog trener»';
export const EVENT = '12-noyabr, 15:00';
export const ADDRESS = 'Toshkent, Chilonzor, 11-a uy (Kohinur «Korzinka» ro‘parasi)';
export const ADMIN_USERNAME = 'Global_Admin19';

/** Telegram Bot API chaqiruvi. Xatoni tashlamaydi, javob obyektini qaytaradi. */
export async function tg(method, payload = {}) {
  try {
    const r = await fetch(`https://api.telegram.org/bot${env.token}/${method}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const j = await r.json().catch(() => ({ ok: false, description: 'bad json' }));
    if (!j.ok) console.error('Telegram', method, j.description || j);
    return j;
  } catch (e) {
    console.error('Telegram', method, e);
    return { ok: false, description: String(e) };
  }
}

export const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Matnni tozalaydi: boshqaruv belgilarini olib tashlaydi, uzunlikni cheklaydi. */
export function clean(v, max, keepNewlines = false) {
  let s = String(v ?? '');
  s = keepNewlines ? s.replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, ' ') : s.replace(/[\u0000-\u001f\u007f]/g, ' ');
  return s.replace(/[ \t]+/g, ' ').trim().slice(0, max);
}

export function prettyPhone(p) {
  const m = /^\+998(\d{2})(\d{3})(\d{2})(\d{2})$/.exec(p);
  return m ? `+998 ${m[1]} ${m[2]} ${m[3]} ${m[4]}` : p;
}

/** Saytdan yoki Mini App'dan kelgan arizani tekshiradi. Noto‘g‘ri bo‘lsa null. */
export function parseApplication(b) {
  if (!b || typeof b !== 'object') return null;
  const name = clean(b.name, 80);
  const phone = String(b.phone || '').replace(/[^\d+]/g, '');
  if (name.length < 2 || !/^\+998\d{9}$/.test(phone)) return null;
  const goals = (Array.isArray(b.goals) ? b.goals : []).slice(0, 5).map((g) => clean(g, 60)).filter(Boolean);
  return {
    name,
    phone,
    format: clean(b.format, 20) || 'Oflayn',
    goals,
    exp: clean(b.exp, 40),
    src: clean(b.src, 40),
    note: clean(b.note, 500, true),
  };
}

function tashkentNow() {
  const d = new Date(Date.now() + 5 * 3600 * 1000);
  const p = (n) => String(n).padStart(2, '0');
  return `${p(d.getUTCDate())}.${p(d.getUTCMonth() + 1)}.${d.getUTCFullYear()} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}`;
}

/** Administratorga boradigan xabar (HTML). */
export function applicationText(a, user, source) {
  const lines = [
    `<b>Yangi ariza</b> · ${COURSE}`,
    '',
    `Ism: <b>${esc(a.name)}</b>`,
    `Telefon: <code>${esc(prettyPhone(a.phone))}</code>`,
    `Format: ${esc(a.format)}`,
  ];
  if (a.goals.length) lines.push(`Maqsadi: ${a.goals.map(esc).join(', ')}`);
  if (a.exp) lines.push(`Tajribasi: ${esc(a.exp)}`);
  if (a.src) lines.push(`Qayerdan bildi: ${esc(a.src)}`);
  if (a.note) lines.push(`Izoh: ${esc(a.note)}`);
  lines.push('');
  if (user && user.id) {
    const full = [user.first_name, user.last_name].filter(Boolean).join(' ') || 'Profil';
    lines.push(`Telegram: <a href="tg://user?id=${Number(user.id)}">${esc(full)}</a>${user.username ? ' @' + esc(user.username) : ''}`);
  }
  lines.push(`Manba: ${esc(source)}`);
  lines.push(`Vaqt: ${tashkentNow()} (Toshkent)`);
  return lines.join('\n');
}

export function thanksText(name) {
  return [
    `Rahmat, ${esc(name)}. Arizangiz qabul qilindi.`,
    'Administrator tez orada siz bilan bog‘lanadi.',
    '',
    `Tanishtiruv kuni: <b>${EVENT}</b>, bepul`,
    `Manzil: ${ADDRESS}`,
  ].join('\n');
}

/**
 * Mini App initData imzosini tekshiradi (Telegram hujjatidagi HMAC-SHA256 usuli).
 * To‘g‘ri bo‘lsa foydalanuvchi obyektini, aks holda null qaytaradi.
 */
export function verifyInitData(initData, maxAgeSec = 86400) {
  if (!initData || typeof initData !== 'string' || !env.token) return null;
  const p = new URLSearchParams(initData);
  const hash = p.get('hash');
  if (!hash) return null;
  p.delete('hash');
  const dataCheck = [...p.entries()].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)).map(([k, v]) => `${k}=${v}`).join('\n');
  const secret = crypto.createHmac('sha256', 'WebAppData').update(env.token).digest();
  const calc = crypto.createHmac('sha256', secret).update(dataCheck).digest('hex');
  if (calc.length !== hash.length || !crypto.timingSafeEqual(Buffer.from(calc), Buffer.from(hash))) return null;
  const auth = Number(p.get('auth_date')) || 0;
  if (maxAgeSec && Date.now() / 1000 - auth > maxAgeSec) return null;
  try { return JSON.parse(p.get('user') || 'null'); } catch { return null; }
}

/** CORS: faqat ruxsat etilgan saytlardan so‘rov qabul qilinadi. */
export function cors(req, res) {
  const origin = req.headers.origin || '';
  const host = req.headers['x-forwarded-host'] || req.headers.host || '';
  let sameHost = false;
  try { sameHost = !!origin && new URL(origin).host === host; } catch { sameHost = false; }
  const ok = !origin || sameHost || env.origins.includes(origin);
  if (ok && origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Max-Age', '86400');
  }
  return ok;
}

export function readBody(req) {
  let b = req.body;
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch { b = null; } }
  return b && typeof b === 'object' ? b : {};
}

/** /start xabaridagi tugmalar. */
export function startKeyboard() {
  return {
    keyboard: [[{ text: '📝 Bepul darsga yozilish', web_app: { url: withParams(env.site, 'src=bot&to=yozilish') } }]],
    resize_keyboard: true,
    input_field_placeholder: 'Pastdagi tugmani bosing',
  };
}

export function startInline() {
  return {
    inline_keyboard: [
      [{ text: 'Kurs haqida batafsil', web_app: { url: withParams(env.site, 'src=bot') } }],
      [{ text: 'Administratorga yozish', url: `https://t.me/${ADMIN_USERNAME}` }],
    ],
  };
}

export function withParams(url, q) {
  return url + (url.includes('?') ? '&' : '?') + q;
}
