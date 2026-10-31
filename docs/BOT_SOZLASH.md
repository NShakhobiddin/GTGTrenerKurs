# Telegram bot va serverless sozlash (Vercel)

**Natija.** Sayt va bot bitta Vercel loyihasida ishlaydi, alohida server ijaraga olish shart emas. Sayt formasidan va botdagi Mini App'dan kelgan arizalar administratorga **avtomatik** keladi. Foydalanuvchidan hech qanday qo‘shimcha «Yuborish» talab qilinmaydi.

```
Sayt formasi ──► /api/apply ──► Bot API sendMessage ──► Administrator (ADMIN_CHAT_ID)
Telegram ─────► /api/telegram (webhook) ──► /start, /id, Mini App'dan ariza
Siz ──────────► /api/setup?key=... ──► webhook, buyruqlar, menyu tugmasi, tavsif
```

Kerakli fayllar repoda tayyor: `api/`, `lib/`, `brand/` (rasmlar), `.env.example`.

---

## 1. BotFather (5 daqiqa)

1. Telegram'da **@BotFather** → `/mybots` → botingizni tanlang → **API Token**. Tokenni nusxalab oling.
   Token bu botning paroli: uni hech kimga bermang va hech qachon GitHub'ga yozmang.
2. Profil rasmi: `/setuserpic` → botni tanlang → `brand/bot-avatar.png` faylini yuboring.
3. Ism (ixtiyoriy): `/setname` → masalan «Global Trainings».
4. Tavsif rasmi (ixtiyoriy): `/mybots` → bot → **Edit Bot** → **Edit Description Picture** → `brand/bot-description.jpg`.
   Bu rasm botni birinchi ochganda «Start» tugmasi ustida ko‘rinadi.

Tavsif matni, buyruqlar va «Kurs» menyu tugmasini 3-qadamdagi sozlash sahifasi o‘zi o‘rnatadi.
BotFather menyusidagi tugma nomlari versiyaga qarab biroz farq qilishi mumkin.

## 2. Vercel'ga joylash (10 daqiqa)

1. **vercel.com** saytiga GitHub akkauntingiz bilan kiring.
2. **Add New → Project** → `GTGTrenerKurs` reposini tanlang → **Import**.
3. **Framework Preset: Other**. Build va Output maydonlarini bo‘sh qoldiring.
4. **Environment Variables** bo‘limiga quyidagilarni kiriting:

   | Nomi | Qiymati |
   |---|---|
   | `BOT_TOKEN` | BotFather bergan token |
   | `WEBHOOK_SECRET` | o‘zingiz o‘ylab toping: faqat harf, raqam, `_` va `-` (masalan `gt_2026_k7f3`) |
   | `SETUP_KEY` | sozlash sahifasi uchun maxfiy so‘z (o‘zingiz o‘ylab toping) |
   | `SITE_URL` | hozircha bo‘sh qoldiring, 6-bandda to‘ldirasiz |
   | `ADMIN_CHAT_ID` | hozircha bo‘sh, 4-qadamda to‘ldirasiz |

5. **Deploy** tugmasini bosing. Vercel sizga manzil beradi, masalan `https://gtgtrenerkurs.vercel.app`.
6. **Settings → Environment Variables** bo‘limida `SITE_URL` ga shu manzilni oxiriga `/` qo‘yib yozing (`https://gtgtrenerkurs.vercel.app/`). Keyin **Deployments → … → Redeploy** qiling.

Vercel'da sayt ham, bot ham shu bitta manzilda ishlaydi. Forma arizani o‘zi `/api/apply` ga yuboradi, buning uchun alohida sozlash kerak emas.

> Eslatma: Vercel'ning bepul Hobby tarifi shaxsiy loyihalar uchun mo‘ljallangan. Mijoz loyihasi uchun tarif shartlarini tekshiring. Kod oddiy `fetch` bilan yozilgan, kerak bo‘lsa Netlify yoki Cloudflare'ga ko‘chirish oson.

## 3. Botni ulash (1 daqiqa)

Brauzerda bitta havolani oching (o‘z manzilingiz va kalitingiz bilan):

```
https://gtgtrenerkurs.vercel.app/api/setup?key=SETUP_KEY
```

Sahifada barcha qatorlar ✅ bo‘lishi kerak: bot, webhook, buyruqlar, menyu tugmasi va tavsif.

## 4. Administrator chat ID

1. @Global_Admin19 akkauntidan botni oching → **Start** → `/id` yuboring.
2. Bot raqam yuboradi, masalan `123456789`. Shu raqamni Vercel'da `ADMIN_CHAT_ID` ga yozing va **Redeploy** qiling.

Arizalar bir nechta administratorga borishi kerak bo‘lsa: botni Telegram guruhga qo‘shing va guruhda `/id` yozing. Bunday raqam `-100…` bilan boshlanadi, uni `ADMIN_CHAT_ID` ga yozasiz.

Tekshirish uchun sozlash sahifasini qayta oching: `ADMIN_CHAT_ID` haqidagi ogohlantirish yo‘qolishi kerak.

## 5. Sinab ko‘rish

- **Bot:** `/start` → «📝 Bepul darsga yozilish» → forma Mini App ichida ochiladi → to‘ldiring → «Arizani yuborish». Administratorga ariza, sizga esa «Rahmat» xabari keladi.
- **Menyu tugmasi:** chat pastidagi **Kurs** tugmasi saytni to‘liq Mini App sifatida ochadi.
- **Oddiy brauzer:** `https://gtgtrenerkurs.vercel.app/` → formani to‘ldiring → «Arizangiz qabul qilindi» chiqadi va ariza administratorga keladi.

Ixtiyoriy qadam: BotFather'da **Bot Settings → Configure Mini App** orqali «Main Mini App» yoqilsa, bot profilida ham ilovani ochish tugmasi paydo bo‘ladi (URL: Vercel manzilingiz).

## 6. GitHub Pages nusxasi (ixtiyoriy)

`nshakhobiddin.github.io/GTGTrenerKurs` manzili ham ishlab turadi. Undagi forma ham avtomatik ishlashi uchun:

1. `index.html` faylida `<meta name="gt-api" content="">` qatorini `content="https://gtgtrenerkurs.vercel.app/api/apply"` qilib o‘zgartiring.
2. Vercel'da `ALLOWED_ORIGINS` qiymatini `https://nshakhobiddin.github.io` qilib qo‘ying.

Tavsiya: bot va reklamalarda asosiy manzil sifatida Vercel manzilini ishlating.

## Xavfsizlik

- Token faqat Vercel'ning Environment Variables bo‘limida turadi. `.env` fayli `.gitignore` ga qo‘shilgan, GitHub'ga yuklanmaydi.
- Token oshkor bo‘lib qolsa: BotFather → `/revoke` → yangi token oling → Vercel'da almashtiring → Redeploy → sozlash sahifasini qayta oching.
- `WEBHOOK_SECRET` faqat Telegram'ning o‘zi botga yoza olishini ta’minlaydi.
- Mini App'dan kelgan foydalanuvchi ma’lumoti Telegram imzosi orqali tekshiriladi, soxta ma’lumot qabul qilinmaydi.
- Formada robotlarga qarshi yashirin maydon bor. Ism va telefon server tomonda ham tekshiriladi.

## Muammo bo‘lsa

| Belgi | Sabab va yechim |
|---|---|
| Sozlash sahifasida ❌ «Unauthorized» | `BOT_TOKEN` noto‘g‘ri. Tokenni qayta nusxalab, Redeploy qiling. |
| Bot `/start` ga javob bermayapti | Sozlash sahifasini qayta oching. Vercel → **Logs** bo‘limida xatoni ko‘ring. |
| Ariza administratorga kelmayapti | `ADMIN_CHAT_ID` to‘g‘rimi va administrator botda **Start** bosganmi, tekshiring. |
| Saytda «Telegram ochilishi kerak» chiqyapti | API javob bermadi va sayt zaxira usulga (Telegram havolasiga) o‘tdi. Environment Variables'ni tekshiring. |
