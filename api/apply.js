// POST /api/apply: sayt formasidan (oddiy brauzer yoki Mini App) ariza qabul qiladi
// va uni bot orqali administratorga yuboradi.
import { env, tg, cors, readBody, parseApplication, verifyInitData, applicationText, thanksText } from '../lib/telegram.js';

export default async function handler(req, res) {
  const allowed = cors(req, res);
  if (req.method === 'OPTIONS') { res.status(allowed ? 204 : 403).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ ok: false, error: 'method_not_allowed' }); return; }
  if (!allowed) { res.status(403).json({ ok: false, error: 'origin_not_allowed' }); return; }
  if (!env.token || !env.admin) { res.status(503).json({ ok: false, error: 'not_configured' }); return; }

  const body = readBody(req);
  // Robotlar uchun yashirin maydon to'ldirilgan bo'lsa, jim qabul qilgandek javob beramiz.
  if (body.website) { res.status(200).json({ ok: true }); return; }

  const app = parseApplication(body);
  if (!app) { res.status(400).json({ ok: false, error: 'invalid' }); return; }

  const user = verifyInitData(body.initData);
  const sent = await tg('sendMessage', {
    chat_id: env.admin,
    text: applicationText(app, user, user ? 'Mini App (bot)' : 'Sayt'),
    parse_mode: 'HTML',
    link_preview_options: { is_disabled: true },
  });
  if (!sent.ok) { res.status(502).json({ ok: false, error: 'telegram' }); return; }

  // Mini App foydalanuvchisiga bot chatida tasdiq (bot bilan suhbati bo'lsa ishlaydi).
  if (user && user.id) await tg('sendMessage', { chat_id: user.id, text: thanksText(app.name), parse_mode: 'HTML' });

  res.status(200).json({ ok: true });
}
