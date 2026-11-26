# 🔤 Alifbo — o'qishni o'rganish platformasi

1-sinf **"Alifbe"** darsligi asosida qurilgan interaktiv platforma. Unda ikki bo'lim bor:

- **🔤 Alifbo.** Harflarni noldan o'rganish uchun: 30 ta dars kitobdagi tartibda (O → T → A → N → … → Ng → tutuq belgisi). Har bir darsda faqat shu paytgacha o'rganilgan harflar ishlatiladi.
- **🚀 Ravon o'qish.** Harflarni taniydigan, lekin qo'shib o'qishga qiynaladigan bolalar uchun: qo'shib o'qish, o'qish piramidasi, so'z zanjiri, tez ko'z, bo'g'in poygasi, hikoya o'qish (mikrofon kuzatadi), tez o'qish va bugungi mashq.

O'zbekcha ovozni **VoiceLab** AI beradi, mikrofon Chrome'ning o'zbekcha nutqni tanish xizmati orqali ishlaydi.

## 📁 Tuzilishi

```
public/                    ← sahifa (Cloudflare avtomatik beradi)
  index.html
  css/style.css            ← butun dizayn
  data/alifbe-darslar.js   ← 30 ta dars: harf, bo'g'inlar, so'zlar, gaplar
  data/ravon-oqish.js      ← darajalar, so'z zanjirlari, piramidalar, hikoyalar
  js/core.js               ← holat (tangalar, yulduzlar), yordamchi funksiyalar
  js/voice.js              ← AI ovoz va mikrofon
  js/alifbo.js             ← xarita va harf darslari
  js/ravon.js              ← ravon o'qish mashqlari
  js/tez-oqish.js          ← "Tez o'qi" o'yini
  js/boshqa.js             ← do'kon, ota-onalar bo'limi, sozlamalar
  js/telegram.js           ← Telegram Mini App (orqaga tugmasi, tebranish, bulutda saqlash)
  js/main.js               ← ishga tushirish
src/worker.js              ← server: /tts (AI ovoz), /check (kalitni tekshirish), /tg/* (Telegram bot)
scripts/tekshir.js         ← darslar qoidaga mosligini tekshiradi
wrangler.jsonc             ← Cloudflare sozlamalari
```

## ✏️ Qanday o'zgartiriladi

**Yangi so'z qo'shish.** `public/data/alifbe-darslar.js` faylidagi kerakli harfning `w:` ro'yxatiga yozing: `["ki-tob","📖"]`. So'zni bo'g'inlarga chiziqcha bilan bo'ling, rasm (emoji) qo'yish ixtiyoriy.

**Yangi hikoya qo'shish.** `public/data/ravon-oqish.js` faylidagi `STORIES` ro'yxatiga qo'shing.

**Tekshirish.** O'zgartirgandan keyin `npm run tekshir` buyrug'ini ishga tushiring. U har bir darsda faqat o'rganilgan harflar ishlatilganini va so'z zanjirlarida har qadamda bitta harf o'zgarishini tekshiradi.

## 🚀 Joylash (Cloudflare)

Repozitoriy Cloudflare Worker'iga ulangan. `main` branch'ga har bir o'zgarish yuborilganda platforma avtomatik yangilanadi.

**Bir martalik sozlamalar:**
1. Cloudflare → Workers & Pages → **alifbo** → Settings → **Build** → *Connect* → shu GitHub repozitoriyni tanlang.
2. Settings → **Variables and Secrets** → `AISHA_API_KEY` = VoiceLab kaliti (`vlk_...`, turi: *Secret*).
3. Ixtiyoriy: `VOICE_ID` — boshqa ovoz tanlash uchun. Mavjud ovozlar ro'yxati `/check` sahifasida chiqadi.

## 🤖 Telegram bot va Mini App

Platforma Telegram ichida ham ochiladi: bot `/start` ga javob beradi va "🔤 Alifboni ochish" tugmasini yuboradi, chap pastda esa doimiy **Alifbo** menyu tugmasi turadi. Telegram ichida ochilganda:
- bolaning ismi bilan salomlashadi;
- Telegram'ning "Orqaga" tugmasi ishlaydi, pastga surganda ilova yopilib qolmaydi;
- to'g'ri/noto'g'ri javobda telefon tebranadi;
- tangalar va yulduzlar Telegram bulutida saqlanadi (boshqa telefondan kirsa ham yo'qolmaydi).

**Bir martalik sozlash:**
1. Telegram'da [@BotFather](https://t.me/BotFather) → `/newbot` → nom va username bering → **token**ni oling.
2. Cloudflare → alifbo → Settings → **Variables and Secrets** (turi: *Secret*):
   - `TELEGRAM_BOT_TOKEN` = BotFather bergan token
   - `TG_WEBHOOK_SECRET` = o'zingiz o'ylab topgan maxfiy so'z (faqat harf, raqam, `_`, `-`), masalan `alifbo_2026_xyz`
3. Brauzerda bir marta oching: `https://<sizning-sayt>/tg/setup?key=<TG_WEBHOOK_SECRET>`
   Hamma qatorda ✅ chiqsa — tayyor. Bu webhook, menyu tugmasi, buyruqlar va tavsifni o'rnatadi.
4. Ixtiyoriy: BotFather → `/newapp` — Mini App'ni `t.me/<bot>/<nom>` qisqa havolasi bilan ham ochish uchun (URL: sayt manzili).

> 🎙️ Mikrofon (nutqni tanish) brauzerga bog'liq: Telegram ichidagi oynada, ayniqsa Android'da, ishlamasligi mumkin. Unda mikrofonli mashqlar o'rniga qolgan barcha mashqlar ishlayveradi.

**Kompyuterda sinash:**
```
npm install
echo "AISHA_API_KEY=vlk_..." > .dev.vars   # Telegram uchun: TELEGRAM_BOT_TOKEN=..., TG_WEBHOOK_SECRET=...
npm run dev        # http://localhost:8787
```

> ⚠️ VoiceLab kalitini hech qachon kodga yoki GitHub'ga yozmang. U faqat Cloudflare'da (Secret) va `.dev.vars` faylida turadi. Bu fayl GitHub'ga yuborilmaydi.
