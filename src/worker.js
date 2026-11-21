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

