// Alifbo — server qismi (Cloudflare Worker)
// Vazifasi: o'zbekcha AI ovoz (VoiceLab) — /tts, kalitni tekshirish — /check.
// Sahifaning o'zi public/ papkasidan avtomatik beriladi (wrangler.jsonc → assets).
// VoiceLab kaliti: Cloudflare → Worker → Settings → Variables and Secrets → AISHA_API_KEY

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};
const API = "https://api.voicelab.uz";
// Zaxira o'zbekcha ovoz (agar ovozlar ro'yxatini olib bo'lmasa)
const FALLBACK_VOICE = "voice_2QZX3LFMkNO0lNyrOZ-WwJxK";
let voiceCache = null;

async function vl(path, KEY, init = {}) {
  const headers = new Headers(init.headers || {});
  headers.set("Authorization", `Bearer ${KEY}`);
  return fetch(API + path, { ...init, headers });
}

async function uzVoices(KEY) {
  const r = await vl("/v1/voices?language=uz", KEY);
  if (!r.ok) throw new Error(`HTTP ${r.status}: ${await r.text()}`);
  const j = await r.json();
  return (j.data || []).map(v => ({ id: v.id, name: v.display_name || v.displayName || v.id, kind: v.kind, desc: v.short_description || "" }));
}

async function pickVoice(env, KEY) {
  if (env.VOICE_ID) return String(env.VOICE_ID).trim();
  if (voiceCache) return voiceCache;
  try {
    const list = await uzVoices(KEY);
    if (list.length) {
      const fem = list.find(v => /gulnoza|madina|zamira|nigora|female|ayol/i.test(v.name + " " + v.desc));
      voiceCache = (fem || list[0]).id;
      return voiceCache;
    }
  } catch (e) {}
  return FALLBACK_VOICE;
}

async function sha(s) {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(d)].map(b => b.toString(16).padStart(2, "0")).join("").slice(0, 48);
}

export default {
  async fetch(request, env, ctx) {
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });
    const url = new URL(request.url);

    const KEY = cleanKey(env.AISHA_API_KEY || env.VOICELAB_API_KEY);

    // Telegram bot: webhook va bir martalik sozlash
    if (url.pathname === "/tg/webhook" && request.method === "POST") return tgWebhook(request, env, url);
    if (url.pathname === "/tg/setup") return tgSetup(env, url);

    if (url.pathname === "/check") {
      const raw = String(env.AISHA_API_KEY || env.VOICELAB_API_KEY || "");
      let out = !raw ? "❌ AISHA_API_KEY kiritilmagan\n" :
        `Kalit: ${KEY.slice(0, 4)}…${KEY.slice(-2)} (${KEY.length} belgi)\n` +
        `Format: ${/^vlk_[A-Za-z0-9_-]+$/.test(KEY) ? "vlk_ ✅" : "❌ vlk_ bilan boshlanmaydi yoki ortiqcha belgi bor"}\n`;
      if (KEY) {
        try {
          const list = await uzVoices(KEY);
          out += `\nO'zbekcha ovozlar (${list.length}):\n` + list.map(v => `  ${v.id}  —  ${v.name}${v.desc ? " (" + v.desc + ")" : ""}`).join("\n");
        } catch (e) { out += `\nOvozlar ro'yxati olinmadi: ${e.message}\n(bu muhim emas, zaxira ovoz ishlatiladi)`; }
        out += `\n\nIshlatilayotgan ovoz: ${await pickVoice(env, KEY)}`;
      }
      return new Response(out, { headers: { ...CORS, "Content-Type": "text/plain; charset=utf-8" } });
    }

    // /tts va /check dan boshqa hamma narsa — public/ papkasidagi fayllar (sahifa, css, js)
    if (url.pathname !== "/tts") return env.ASSETS.fetch(request);
    if (!KEY) return err(500, "AISHA_API_KEY sozlanmagan");

    const text = (url.searchParams.get("text") || "").trim().slice(0, 300);
    if (!text) return err(400, "text bo'sh");
    const sp = Number(url.searchParams.get("speed"));
    const speed = sp >= 0.5 && sp <= 2 ? sp : undefined;
    const qVoice = (url.searchParams.get("voice") || "").replace(/[^A-Za-z0-9_-]/g, "");
    const voice = qVoice.startsWith("voice_") ? qVoice : await pickVoice(env, KEY);

    // Kesh: bir xil so'z ikkinchi marta VoiceLab'ga bormaydi (limit tejaladi)
    const cacheKey = new Request(`${url.origin}/tts?text=${encodeURIComponent(text)}&speed=${speed ?? ""}&voice=${voice}`);
    const cache = caches.default;
    const hit = await cache.match(cacheKey);
    if (hit) return hit;

    const synth = async (withSpeed) => {
      const body = { text, language: "uz", voice_id: voice };
      if (withSpeed && speed !== undefined) body.speed = speed;
      return vl("/v1/tts", KEY, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "audio/wav",
                   "Idempotency-Key": "oqiymiz-" + await sha(JSON.stringify(body)) },
        body: JSON.stringify(body),
      });
    };
    let r = await synth(true);
    if (r.status === 400 || r.status === 422) r = await synth(false); // tezlik qabul qilinmasa — usiz
    if (!r.ok) return err(r.status, await r.text());

    const res = new Response(await r.arrayBuffer(), {
      headers: { ...CORS, "Content-Type": r.headers.get("Content-Type") || "audio/wav",
                 "Cache-Control": "public, max-age=31536000" },
    });
    ctx.waitUntil(cache.put(cacheKey, res.clone()));
    return res;
  },
};

function cleanKey(k) {
  return String(k || "").trim()
    .replace(/^["'`]+|["'`]+$/g, "")
    .replace(/^(Bearer|Token|X-Api-Key:?)\s+/i, "")
    .trim();
}

function err(status, msg) {
  return new Response(msg, { status, headers: { ...CORS, "Content-Type": "text/plain; charset=utf-8" } });
}


/* ---------- TELEGRAM BOT ----------
   Cloudflare → Variables and Secrets:
     TELEGRAM_BOT_TOKEN  — @BotFather bergan token (Secret)
     TG_WEBHOOK_SECRET   — o'zingiz o'ylab topgan maxfiy so'z, faqat harf/raqam/_/- (Secret)
   Keyin bir marta brauzerda oching: https://<sayt>/tg/setup?key=<TG_WEBHOOK_SECRET>
*/
async function tg(env, method, body) {
  const r = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/${method}`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body || {}),
  });
  return r.json().catch(() => ({ ok: false, description: "HTTP " + r.status }));
}

const appButton = url => ({ inline_keyboard: [[{ text: "🔤 Alifboni ochish", web_app: { url: url.origin + "/" } }]] });

async function tgWebhook(request, env, url) {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TG_WEBHOOK_SECRET ||
      request.headers.get("X-Telegram-Bot-Api-Secret-Token") !== env.TG_WEBHOOK_SECRET)
    return new Response("forbidden", { status: 403 });
  let u = {}; try { u = await request.json(); } catch (e) {}
  const m = u.message;
  if (m && m.chat) {
    const t = String(m.text || "").trim();
    const name = (m.from && m.from.first_name) || "do'stim";
    let text;
    if (/^\/start\b/.test(t)) text =
      `Salom, ${name}! 👋\n\n<b>Alifbo</b> — harfma-harf o'qishni o'rganish platformasi.\n\n` +
      `🔤 <b>Alifbo</b> — 30 ta dars, 1-sinf "Alifbe" darsligi tartibida\n` +
      `🚀 <b>Ravon o'qish</b> — qo'shib o'qish, piramida, hikoyalar va tez o'qish\n\n` +
      `Boshlash uchun pastdagi tugmani bosing 👇`;
    else if (/^\/help\b/.test(t)) text =
      `ℹ️ Ilovani ochish uchun pastdagi tugmani yoki chap pastdagi <b>Alifbo</b> menyu tugmasini bosing.\n\n` +
      `Natijalar (tangalar, yulduzlar) Telegram hisobingizda saqlanadi — boshqa telefondan ochsangiz ham yo'qolmaydi.`;
    else text = `O'qishni boshlash uchun tugmani bosing 👇`;
    await tg(env, "sendMessage", { chat_id: m.chat.id, text, parse_mode: "HTML", reply_markup: appButton(url) });
  }
  return new Response("ok");
}

async function tgSetup(env, url) {
  const txt = s => new Response(s, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  if (!env.TELEGRAM_BOT_TOKEN) return txt("❌ TELEGRAM_BOT_TOKEN kiritilmagan");
  if (!env.TG_WEBHOOK_SECRET) return txt("❌ TG_WEBHOOK_SECRET kiritilmagan");
  if (url.searchParams.get("key") !== env.TG_WEBHOOK_SECRET) return txt("❌ ?key=... noto'g'ri");
  if (url.protocol !== "https:") return txt("❌ Telegram faqat https manzilni qabul qiladi");
  const res = [];
  const step = async (name, method, body) => { const r = await tg(env, method, body);
    res.push(`${r.ok ? "✅" : "❌"} ${name}${r.ok ? "" : " — " + r.description}`); return r; };
  const me = await step("Bot tokeni", "getMe");
  await step("Webhook", "setWebhook", { url: url.origin + "/tg/webhook", secret_token: env.TG_WEBHOOK_SECRET,
    allowed_updates: ["message"], drop_pending_updates: true });
  await step("Menyu tugmasi", "setChatMenuButton", { menu_button: { type: "web_app", text: "Alifbo", web_app: { url: url.origin + "/" } } });
  await step("Buyruqlar", "setMyCommands", { commands: [
    { command: "start", description: "Ilovani ochish" }, { command: "help", description: "Yordam" }] });
  await step("Tavsif", "setMyDescription", { description:
    "Alifbo — 1-sinf \"Alifbe\" darsligi asosida harfma-harf o'qishni o'rganish va ravon o'qish platformasi. O'zbekcha AI ovoz bilan." });
  await step("Qisqa tavsif", "setMyShortDescription", { short_description: "Bolalar uchun o'qishni o'rganish platformasi 🔤" });
  if (me.ok) res.push(`\nBot: https://t.me/${me.result.username}\nMini App manzili: ${url.origin}/`);
  return txt(res.join("\n"));
}
