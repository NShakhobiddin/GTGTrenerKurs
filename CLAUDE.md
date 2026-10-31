# Global Trainings — «Professional psixolog trener» landing sahifasi

Mijoz: **Global Trainings Group** (Toshkent). Ustoz: **Dilshod Mannopov**, psixolog trener.
Sahifaning yagona maqsadi: odamni **12-noyabr, 15:00 dagi bepul tanishtiruv kuniga** yozdirish.
Sahifa tili: o‘zbek (lotin). O‘ va G‘ harflarida apostrof sifatida `‘` (U+2018) ishlatiladi.

## Fayllar

- `index.html`: butun sahifa shu bitta faylda (CSS, JS, Manrope shrifti base64 ko‘rinishida, Phosphor ikonkalari `<symbol>` sprite sifatida).
- Tashqi kutubxonalar CDN orqali yuklanadi:
  - GSAP 3.12.5 va ScrollTrigger (cdnjs)
  - Lenis 1.1.13 (unpkg, silliq skroll)

  Ular yuklanmasa ham sahifa harakatsiz holda to‘liq ishlaydi.
- `media/`:
  - `hero2.mp4` / `hero2.jpg`: hero video panel (muted loop)
  - `trailer.mp4` / `trailer.jpg`: "Ustoz bilan tanishing" kartasi (muted loop)
  - `v1.mp4 … v5.mp4` va `v1.jpg … v5.jpg`: to‘liq videolar va posterlari (pleyer modalida ochiladi)
  - `m1.jpg … m4.jpg`: modul kartalari fonlari
  - `portrait.jpg`, `avatar.jpg`, `cta.jpg`, `logo.png`: ustoz portreti va avatari, yakuniy blok foni, logotip (logo CSS mask sifatida ishlatiladi)

Asl videolar repoga kiritilmagan (egasining kompyuterida, `Montaj` papkasida). Media fayllar ulardan ffmpeg bilan siqib olingan.

## Bo‘limlar (id bo‘yicha)

1. `#top`: hero. Chap tomonda sarlavha, CTA va tadbir ma’lumotlari; o‘ng tomonda video panel va countdown.
2. Mavzular marquee'si. Skroll tezligiga qarab tezlashadi.
3. `#tamoyil`: manifest. Desktopda pin qilinadi. So‘zlar birma-bir yonadi, logodagi yarim oy to‘liq halqaga aylanadi (SVG mask, `#ring-inner`).
4. Raqamlar (count-up): 5 oy, 3 marta, 4 modul, 12 mavzu, 1 kun.
5. `#dastur`: 4 modul va yakuniy karta. Desktopda (≥1024px) gorizontal pin galereya, mobilda vertikal.
6. `#ustoz`: treyler kartasi skroll bilan kattalashadi. Ostida bio va ustozning qoidasi.
7. `#videolar`: video lentasi. Sudrash mumkin, hover'da preview o‘ynaydi, bosilganda pleyer modali ochiladi.
8. `#mos`: "Bu kurs sizga mosmi?". Belgilangan bandlar formadagi "Maqsadingiz" chiplariga ko‘chadi.
9. `#qanday`: 3 qadam, skroll bilan to‘ladigan chiziq.
10. `#savollar`: FAQ.
11. `#yozilish`: yakuniy CTA, katta countdown va ariza formasi.
12. Pastki panel (`#dock`): hero'dan keyin chiqadi va `#yozilish` ko‘ringanda yashirinadi.

## Ariza oqimi (muhim)

- Forma ma’lumotlari: ism, telefon, format, maqsad, tajriba, qayerdan bilgani, izoh. Ular o‘zbekcha xabarga yig‘iladi va `https://t.me/Global_Admin19?text=...` havolasi orqali Telegram'da ochiladi. Foydalanuvchi faqat «Yuborish»ni bosadi.
- Admin username'i JS ichida `TG_USER` o‘zgaruvchisida turadi.
- Telegram ichidagi brauzerda `t.me` havolalari o‘sha oynaning o‘zida ochiladi, chunki Telegram ularni ushlab, chatni ochadi.
- Mini App rejimi (bot orqali ochilganda):
  - `telegram-web-app.js` dinamik yuklanadi;
  - sahifa butun ekranga yoyiladi (`expand`), header qora rangga o‘tadi;
  - ism Telegram profilidan to‘ldiriladi;
  - Telegram'ning MainButton tugmasi chiqadi.
- Shaxsiy akkaunt arizani avtomatik qabul qila olmaydi. Avtomatik qabul kerak bo‘lsa: bot yaratiladi, server tomonda kichik endpoint yoziladi va u Telegram Bot API `sendMessage` orqali yuboradi. **Bot tokenini hech qachon frontend'ga yozma.** Ulanadigan joy submit handler ichida izoh bilan belgilangan.

## Faktlar (faqat mijoz postlaridan)

- Kurs: 5 oy, haftada 3 marta. Onlayn yoki oflayn qatnashish mumkin.
- Sertifikat: "sertifikatga ega bo‘lish imkoniyati" bor (aynan shu so‘z bilan).
- Har bir modulda alohida professional psixolog bilan ishlanadi.
- 4 modul, jami 12 mavzu. Ro‘yxati `#dastur` bo‘limida.
- Tanishtiruv kuni: 12-noyabr 2026, payshanba, 15:00, bepul.
  - Manzil: Toshkent, Chilonzor, 11-a uy.
  - Mo‘ljal: Kohinur «Korzinka» ro‘parasi.
  - Countdown sanasi JS'da: `Date.UTC(2026,10,12,10,0,0)` (Toshkent vaqti bilan 15:00).
- Aloqa: +998 90 005 00 19, Telegram @Global_Admin19.
- Ustoz qoidasi (iqtibos): "Psixolog trener ichki va tashqi olami mujassam muvozanatda bo‘lgan, professional va yetuk shaxs bo‘lishi lozim."

**O‘ylab topma:** narx, sertifikat shartlari, sharhlar, o‘quvchilar soni, statistikalar. Ma’lumot yo‘q bo‘lsa, administratorga yo‘naltir.

## Ochiq vazifalar

- Video nomlari hozircha joyiga qarab qo‘yilgan ("Kutubxonadagi suhbat" va h.k.), chunki videolar ovozi o‘rganilmagan. Haqiqiy mavzular mijozdan olinishi kerak.
- Narx noma’lum.
- @treningsuz qaysi platformada ekani noma’lum (video oxirida ko‘rsatilgan).
- Avtomatik ariza qabul qilish uchun bot (ixtiyoriy).
- Hosting / domen. Repo ochiq bo‘lsa, GitHub Pages bilan ildiz papkadan (`/`) to‘g‘ridan to‘g‘ri ishlaydi. `.nojekyll` fayli qo‘yilgan.

## Dizayn qoidalari (landing-page-design skill asosida)

- **Shrift:** faqat Manrope. Italic ishlatilmaydi. Og‘irlik 800 dan oshmaydi (900/black yo‘q).
- **Matn o‘lchamlari:** faqat Tailwind shkalasidagi qadamlar. Nomlangan uslublar (`heading-*`, `title-*`, `body-*`, `caption-*`, `display-*`) CSS boshida berilgan.
- **Bo‘shliqlar:** faqat 0, 2, 4, 8, 12, 16, 24, 32, 40, 48, 64, 80, 96px (`--s-*` tokenlari).
- **Burchak radiuslari:** faqat Tailwind qiymatlari. Ichma-ich shakllarda: ichki radius = tashqi radius − oraliq.
- **Fon:** gradient ishlatilmaydi. Qorong‘i fonlar faqat `#000000`, `#181818`, `#1F1F1F`, `#272727`, `#313131`, `#131209` dan olinadi. Gradient faqat hero sarlavhasi matnida bor.
- **Ikonkalar:** faqat Phosphor (sprite'ga qo‘shib ishlatiladi).
- **Animatsiya:** asosiy egri chiziq `cubic-bezier(.22,1,.36,1)`. Faqat `transform` va `opacity` animatsiya qilinadi. `prefers-reduced-motion` hurmat qilinadi.
- **Matn:** chiziqcha tinish belgisi sifatida ishlatilmaydi. O‘zbek imlosidagi chiziqchalar qoladi ("yuzma-yuz", "12-noyabr").
- **Asosiy rang:** brend binafsha (logo `#7600A2`). Tugmalar `#8E1FC4`, qorong‘i fondagi matn `#D3A6EE`.
- **Tekshirish:** 390px kenglikda gorizontal skroll bo‘lmasligi kerak. Telegram ichidagi brauzerda ham tekshiriladi.
