# Global Trainings — «Professional psixolog trener» landing sahifasi va bot

Mijoz: **Global Trainings Group** (Toshkent). Ustoz: **Dilshod Mannopov**, psixolog trener.
Sahifaning yagona maqsadi: odamni **12-noyabr, 15:00 dagi bepul tanishtiruv kuniga** yozdirish.
Sahifa tili: o‘zbek (lotin). O‘ va G‘ harflarida apostrof sifatida `‘` (U+2018) ishlatiladi.
Bu belgi "6" shaklida ko‘rinishi uchun alohida shriftdan olinadi (pastda batafsil).

## Fayllar

- `index.html`: butun sahifa shu bitta faylda.
  - Ichida: CSS, JS, Manrope shrifti (base64), `UzApos` shrifti (base64), Phosphor ikonkalari (sprite).
  - `UzApos` bu Montserrat'ning faqat `‘ ’` belgilari. U O‘/G‘ dagi belgi "6" shaklida chiqishi uchun kerak, Manrope'da bu belgi to‘g‘ri chiziq ko‘rinishida.
  - Tashqi kutubxonalar (CDN): GSAP 3.12.5 + ScrollTrigger (cdnjs), Lenis 1.1.13 (unpkg). Ular yuklanmasa ham sahifa ishlaydi.
- `media/`: sahifadagi videolar va rasmlar.
  - `hero-m.jpg`: hero uchun harakatsiz rasm (telefon va Telegram'da ishlatiladi).
  - `hero2.mp4`: hero video (faqat sichqonchali kompyuterda).
  - `trailer.*`, `v1–v5.mp4/jpg`, `m1–m4.jpg`, `portrait.jpg`, `avatar.jpg`, `cta.jpg`.
  - `og.jpg`: havola ulashilganda chiqadigan preview, 1200x630.
  - `icon-180.png`, `favicon-32.png`.
  - `logo.svg`: footerda CSS mask sifatida ishlatiladi.
  - `logo.png`: eski fayl.
- `api/`: Vercel serverless funksiyalari (Node 18+, tashqi paketsiz).
  - `apply.js`: `POST`, sayt formasidan arizani qabul qilib, administratorga yuboradi.
  - `telegram.js`: Telegram webhook. `/start`, `/id` va Mini App'dan `sendData` orqali kelgan ariza.
  - `setup.js`: `GET ?key=SETUP_KEY`. Webhook, buyruqlar, menyu tugmasi va tavsifni o‘rnatadi.
- `lib/telegram.js`: umumiy funksiyalar.
  - Bot API chaqiruvi, ariza tekshiruvi, xabar matni.
  - Mini App `initData` imzosini HMAC bilan tekshirish.
  - CORS va bot tugmalari.
- `brand/`: chizilgan brend fayllari.
  - `logo.svg`, `logo-white.svg`, `logo-dark.svg`: asl logoning vektor ko‘rinishi (asl JPG ustiga qo‘yib solishtirilgan).
  - `bot-avatar.png` (640x640), `bot-description.jpg` (640x360), `icon-512.png`, `mark.svg`.
- `docs/BOT_SOZLASH.md`: BotFather va Vercel sozlash bo‘yicha qadamma-qadam yo‘riqnoma.
- `.env.example`: kerakli o‘zgaruvchilar ro‘yxati.
  - `BOT_TOKEN`, `ADMIN_CHAT_ID`, `SITE_URL`, `WEBHOOK_SECRET`, `SETUP_KEY`, `ALLOWED_ORIGINS`.
  - **Tokenni hech qachon kodga yoki repoga yozma.**

## Bo‘limlar (id bo‘yicha)

1. `#top`: hero va countdown.
2. Mavzular marquee'si.
3. `#tamoyil`: manifest. Yarim oy to‘liq halqaga aylanadi (`#ring-inner`, `setRing`).
4. Raqamlar.
5. `#dastur`: modullar. Desktopda gorizontal pin galereya.
6. `#ustoz`: treyler va bio.
7. `#videolar`: video lentasi.
8. `#mos`: "Bu kurs sizga mosmi?".
9. `#qanday`: 3 qadam.
10. `#savollar`: FAQ.
11. `#yozilish`: yakuniy CTA va forma.
12. `#dock`: pastki panel.

URL parametrlari:
- `?to=yozilish`: sahifa ochilishi bilan formaga o‘tadi.
- `?src=bot`: Mini App bot klaviaturasidan ochilgan bo‘ladi.

## Telefon va Telegram rejimi (`lite`)

`lite` rejimi yoqiladigan holatlar: sensorli qurilma, Telegram ichidagi brauzer yoki Mini App, yoki `saveData` yoqilgan bo‘lsa.

Bu rejimda:
- Hech qanday video o‘zi o‘ynamaydi va oldindan yuklanmaydi.
- Hero'da harakatsiz rasm (`hero-m.jpg`) ko‘rinadi, unga sekin zoom effekti beriladi.
- Videolar faqat bosilganda pleyerda ochiladi. Telefonda pleyer butun ekranni egallaydi.
- Pleyer ochiq bo‘lganda sahifa skrolli qulflanadi.
- Lenis (silliq skroll) o‘chiriladi.
- Fon videolariga `pointer-events:none` berilgan, shuning uchun ular teginishlarni ushlab qolmaydi.

Sahifa yoki Mini App fonga o‘tganda barcha videolar pauza qilinadi.

**Mini App** (`telegram-web-app.js` faqat Telegram ichida dinamik yuklanadi):
- `ready` va `expand` chaqiriladi. Header, fon va pastki panel rangi qora qilinadi. `disableVerticalSwipes` yoqiladi.
- **MainButton** matni holatga qarab o‘zgaradi:
  - odatda: «Bepul darsga yozilish» (bosilsa formaga o‘tadi);
  - forma ko‘rinib turganda: «Arizani yuborish» (bosilsa formani yuboradi).
- **BackButton** pleyer va mobil menyuni yopadi.
- Haptik javob beriladi. Forma to‘ldirilayotganda yopishdan oldin tasdiq so‘raladi.
- Ism Telegram profilidan o‘zi to‘ldiriladi.
- Havolalar: `t.me` havolalari `openTelegramLink` bilan Telegram ichida ochiladi, boshqa saytlar `openLink` bilan tashqarida ochiladi.

## Ariza oqimi

1. **API bor bo‘lsa.** API manzili `<meta name="gt-api">` dan olinadi, Vercel'da esa avtomatik `/api/apply` bo‘ladi.
   - Forma `POST` qiladi. Mini App'da `initData` ham yuboriladi.
   - Muvaffaqiyatli bo‘lsa, «Arizangiz qabul qilindi» chiqadi.
2. **API ishlamasa yoki yo‘q bo‘lsa:**
   - Mini App `?src=bot` bilan ochilgan bo‘lsa: `Telegram.WebApp.sendData`, ariza webhook orqali administratorga boradi.
   - Aks holda: `https://t.me/Global_Admin19?text=...` tayyor xabar bilan ochiladi va foydalanuvchi «Yuborish»ni bosadi.
- Forma maydonlari: ism, telefon, format, maqsad, tajriba, qayerdan bilgani, izoh. Spamga qarshi yashirin `website` maydoni bor.
- Server tomonda ham tekshiriladi: ism kamida 2 belgi, telefon `+998` va 9 raqam, matnlar uzunligi cheklangan.

## Faktlar (faqat mijoz postlaridan)

- Kurs: 5 oy, haftada 3 marta. Onlayn yoki oflayn qatnashish mumkin.
- Sertifikat: "sertifikatga ega bo‘lish imkoniyati" bor (aynan shu so‘z bilan).
- Har bir modulda alohida professional psixolog bilan ishlanadi.
- 4 modul, jami 12 mavzu.
- Tanishtiruv kuni: 12-noyabr 2026, payshanba, 15:00, bepul.
  - Manzil: Toshkent, Chilonzor, 11-a uy.
  - Mo‘ljal: Kohinur «Korzinka» ro‘parasi.
  - Countdown sanasi JS'da: `Date.UTC(2026,10,12,10,0,0)` (Toshkent vaqti bilan 15:00).
- Aloqa: +998 90 005 00 19, Telegram @Global_Admin19.
- Ustoz qoidasi (iqtibos): "Psixolog trener ichki va tashqi olami mujassam muvozanatda bo‘lgan, professional va yetuk shaxs bo‘lishi lozim."

**O‘ylab topma:** narx, sertifikat shartlari, sharhlar, o‘quvchilar soni, statistikalar.

## Ochiq vazifalar

- Vercel'ga deploy qilish, `SITE_URL` va `ADMIN_CHAT_ID` ni to‘ldirish (`docs/BOT_SOZLASH.md` ga qarang).
- Video nomlari hozircha joyiga qarab qo‘yilgan. Haqiqiy mavzular mijozdan olinishi kerak.
- Narx noma’lum.
- @treningsuz qaysi platformada ekani noma’lum.

## Dizayn qoidalari (landing-page-design skill asosida)

- **Shrift:** faqat Manrope (O‘/G‘ apostrofi bundan istisno). Italic ishlatilmaydi. Og‘irlik 800 dan oshmaydi.
- **Matn o‘lchamlari:** faqat Tailwind shkalasi. Nomlangan uslublar CSS boshida berilgan.
- **Bo‘shliqlar:** faqat 0, 2, 4, 8, 12, 16, 24, 32, 40, 48, 64, 80, 96px (`--s-*`).
- **Burchak radiuslari:** faqat Tailwind qiymatlari. Ichma-ich shakllarda: ichki radius = tashqi radius − oraliq.
- **Fon:** gradient ishlatilmaydi. Qorong‘i fonlar faqat `#000000`, `#181818`, `#1F1F1F`, `#272727`, `#313131`, `#131209`.
- **Ikonkalar:** faqat Phosphor.
- **Animatsiya:** egri chiziq `cubic-bezier(.22,1,.36,1)`. Faqat `transform` va `opacity`. `prefers-reduced-motion` hurmat qilinadi.
- **Matn:** chiziqcha tinish belgisi sifatida ishlatilmaydi. O‘zbek imlosidagi chiziqchalar qoladi.
- **Ranglar:** brend binafsha `#7600A2`, tugmalar `#8E1FC4`, qorong‘i fondagi matn `#D3A6EE`.
- **Yarim oy (logo geometriyasi), viewBox 0 0 100 100:**
  - tashqi aylana: markaz (50, 50), r = 48;
  - ichki aylana: markaz (54.79, 45.88), r = 42.63;
  - path: `M66.02 4.75A48 48 0 1 0 97.15 41.01A42.63 42.63 0 1 1 66.02 4.75Z`.
- **Tekshirish:** 390px kenglikda gorizontal skroll bo‘lmasligi kerak. Telegram Mini App'da ham tekshiriladi.
