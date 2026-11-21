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
  js/main.js               ← ishga tushirish
src/worker.js              ← server: /tts (AI ovoz), /check (kalitni tekshirish)
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

**Kompyuterda sinash:**
```
npm install
echo "AISHA_API_KEY=vlk_..." > .dev.vars
npm run dev        # http://localhost:8787
```

> ⚠️ VoiceLab kalitini hech qachon kodga yoki GitHub'ga yozmang. U faqat Cloudflare'da (Secret) va `.dev.vars` faylida turadi. Bu fayl GitHub'ga yuborilmaydi.
