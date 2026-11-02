# Bot: Telegram Serverless (BotFather ichida)

Bu papka @GTGtrener_bot uchun **Telegram Serverless** (tgcloud) kodini saqlaydi. Serverless rejimida alohida server, Vercel yoki tokenni sozlash kerak emas, kod Telegram'ning o‘zida ishlaydi.

Butun bot bitta faylda: `tgcloud/handlers/message.js`. Bazadagi jadvallarni fayl o‘zi yaratadi.

## Bot nima qiladi

| Foydalanuvchi | Bot | @Global_Admin19 ga keladigan xabar |
|---|---|---|
| Botga kiradi (`/start`) | Salomlashadi, ikki tugma chiqaradi: «📝 Arizani to‘ldirish» va «📱 Raqamni yuborish» | 👤 Botga yangi odam kirdi: ismi, username, profil havolasi |
| «📱 Raqamni yuborish» | Rahmat aytadi | 📱 Raqam qoldirdi: ismi va telefoni |
| «📝 Arizani to‘ldirish» → saytdagi forma | Rahmat aytadi | 📝 Yangi ariza: forma maydonlarining hammasi |
| Raqamini qo‘lda yozadi | Rahmat aytadi | 📱 Raqam qoldirdi |
| Savol yozadi | «Administratorga yetkazildi» deydi | 💬 Savol / xabar |

Har bir xabarda foydalanuvchi profiliga havola bo‘ladi. Uni bosib, odamga to‘g‘ridan to‘g‘ri yozish mumkin.

**Administrator:** @Global_Admin19 akkauntidan botga bir marta `/start` bosiladi. Shundan keyin hamma xabarlar shu chatga keladi. Administrator ulanmasidan oldin kelgan arizalar ham saqlanib turadi va ulanganda birdaniga yuboriladi. `/stats` buyrug‘i statistikani ko‘rsatadi.

## O‘rnatish (BotFather ichida, kompyutersiz)

1. @BotFather → botingiz → **Serverless** yoqilgan bo‘lsin.
2. **Handlers** → **message** → muharrirga `tgcloud/handlers/message.js` faylini to‘liq nusxalab qo‘ying → saqlang.
3. **Database** va **Library** bo‘limlariga tegmang.
4. @Global_Admin19 akkauntidan botni ochib, `/start` bosing. «✅ Siz administrator sifatida ulangansiz» xabari chiqishi kerak.
5. Boshqa akkauntdan botga kirib sinab ko‘ring: administrator chatiga «Botga yangi odam kirdi» xabari keladi.

## O‘rnatish (CLI orqali, ixtiyoriy)

```
npm create @tgcloud/bot GTGtrener_bot
```
Yaratilgan loyihadagi `tgcloud/handlers/message.js` o‘rniga shu papkadagi faylni qo‘ying, keyin `npx tgcloud push`.

## Muhim

- Forma arizasi botga avtomatik kelishi uchun saytni botdagi **«📝 Arizani to‘ldirish»** tugmasi orqali ochish kerak. Telegram `sendData` imkoniyatini faqat shu turdagi tugma uchun beradi.
- Sayt menyu tugmasidan ochilsa, forma ham ishlaydi. Unda ariza @Global_Admin19 chatiga tayyor xabar bo‘lib ochiladi, foydalanuvchi faqat «Yuborish»ni bosadi.
- Sozlamalar fayl boshida: `ADMIN_USERNAME`, `SITE_URL`, sana, manzil va telefon.
