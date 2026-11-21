/* Alifbo — AI ovoz (VoiceLab) va mikrofon */
/* ---------- OVOZ (AI) ---------- */
let CFG={ provider:"aisha", aProxy:"", aMood:"Cheerful", aSpeed:0.85, aVoiceId:"", key:"", region:"", voice:"uz-UZ-MadinaNeural", rate:-15 };
try{ const c=localStorage.getItem("oqiymiz_ai"); if(c) CFG=Object.assign(CFG,JSON.parse(c)); }catch(e){}
if(ON_SERVER){ CFG.provider="aisha"; CFG.aProxy=location.origin; }
function saveCfg(){ try{ localStorage.setItem("oqiymiz_ai",JSON.stringify(CFG)); }catch(e){} }
const aiCache=new Map(); let uzVoice=null;
function findUzVoice(){ try{ const vs=speechSynthesis.getVoices(); uzVoice=vs.find(v=>/^uz/i.test(v.lang)&&/natural|online|neural/i.test(v.name))||vs.find(v=>/^uz/i.test(v.lang))||null; }catch(e){} }
try{ findUzVoice(); speechSynthesis.onvoiceschanged=findUzVoice; }catch(e){}
function aiReady(){ return CFG.provider==="aisha" ? !!CFG.aProxy : !!(CFG.key&&CFG.region); }
function uzText(t){ return t.replace(/([oOgG])['’‘`ʼ]/g,"$1ʻ").replace(/['’`]/g,"ʼ"); }
const xmlEsc=s=>s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
function aiAudio(text){
  let k, run;
  if(CFG.provider==="aisha"){
    const base=CFG.aProxy.trim().replace(/\/+$/,"");
    k=`${base}/tts?text=${encodeURIComponent(uzText(text))}&mood=${CFG.aMood}&speed=${CFG.aSpeed}&voice=${CFG.aVoiceId||""}`;
    run=async()=>{ const r=await fetch(k); if(!r.ok) throw new Error("HTTP "+r.status); return URL.createObjectURL(await r.blob()); };
  } else {
    k="az|"+CFG.voice+"|"+CFG.rate+"|"+text;
    run=async()=>{ const ssml=`<speak version="1.0" xml:lang="uz-UZ"><voice name="${CFG.voice}"><prosody rate="${CFG.rate}%">${xmlEsc(uzText(text))}</prosody></voice></speak>`;
      const r=await fetch(`https://${CFG.region.trim()}.tts.speech.microsoft.com/cognitiveservices/v1`,{method:"POST",headers:{"Ocp-Apim-Subscription-Key":CFG.key.trim(),"Content-Type":"application/ssml+xml","X-Microsoft-OutputFormat":"audio-24khz-48kbitrate-mono-mp3"},body:ssml});
      if(!r.ok) throw new Error("HTTP "+r.status); return URL.createObjectURL(await r.blob()); };
  }
  if(aiCache.has(k)) return aiCache.get(k);
  const pr=run(); aiCache.set(k,pr); pr.catch(()=>aiCache.delete(k)); return pr;
}
function prefetch(...t){ if(!aiReady()) return; for(const x of t){ if(x) aiAudio(plain(x)).catch(()=>{}); } }
function errText(m){ if(m==="HTTP 401"||m==="HTTP 403") return "Kalit noto'g'ri yoki ruxsati yetmaydi"; if(m==="HTTP 402") return "Limit tugagan";
  if(m==="HTTP 500") return "Serverda kalit sozlanmagan"; if(/^HTTP/.test(m)) return "Xato: "+m; return "Internetni tekshiring"; }
let curAudio=null, warned=false;
async function speak(text){
  text=plain(text);
  try{ curAudio&&curAudio.pause(); speechSynthesis.cancel(); }catch(e){}
  if(aiReady()){
    try{ const url=await aiAudio(text); return await new Promise(res=>{ curAudio=new Audio(url); curAudio.onended=res; curAudio.onerror=res; curAudio.play().catch(res); }); }
    catch(e){ toast(`Ovoz chiqmadi 😕<div style="font:800 16px Nunito">${errText(String(e.message||e))}</div>`,1800); return; }
  }
  if(uzVoice){ return new Promise(res=>{ try{ const u=new SpeechSynthesisUtterance(text); u.voice=uzVoice; u.lang=uzVoice.lang; u.rate=.85; u.onend=res; u.onerror=res; speechSynthesis.speak(u);}catch(e){res()} }); }
  if(!warned){ warned=true; toast(`🔊 AI ovoz ulanmagan<div style="font:800 16px Nunito">⚙️ sozlamalarni oching</div>`,1800); }
}

/* ---------- MIKROFON ---------- */
const CYR={"а":"a","б":"b","в":"v","г":"g","д":"d","е":"e","ё":"yo","ж":"j","з":"z","и":"i","й":"y","к":"k","л":"l","м":"m","н":"n","о":"o","п":"p","р":"r","с":"s","т":"t","у":"u","ф":"f","х":"x","ц":"s","ч":"ch","ш":"sh","щ":"sh","ъ":"","ы":"i","ь":"","э":"e","ю":"yu","я":"ya","ў":"o","қ":"q","ғ":"g","ҳ":"h"};
function norm(s){ s=s.toLowerCase().split("").map(c=>CYR[c]??c).join(""); return s.replace(/[ʻʼ’‘`'"]/g,"").replace(/[^a-z\s]/g," ").replace(/\s+/g," ").trim(); }
function lev(a,b){ const m=[...Array(b.length+1).keys()]; for(let i=1;i<=a.length;i++){let p=m[0];m[0]=i;for(let j=1;j<=b.length;j++){const t=m[j];m[j]=Math.min(m[j]+1,m[j-1]+1,p+(a[i-1]===b[j-1]?0:1));p=t;}} return m[b.length]; }
function wordOk(h,t){ return h===t || (t.length>=6 && lev(h,t)<=1); }
function matches(heard,target){ const h=norm(heard), t=norm(plain(target)); if(!h) return false;
  const tw=t.split(" "), hw=h.split(" ");
  if(tw.length===1) return hw.some(w=>wordOk(w,t)) || wordOk(h.replace(/ /g,""),t);
  let k=0; for(const w of hw){ if(k<tw.length && wordOk(w,tw[k])) k++; } return k===tw.length; }
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
const inClaude=!!(window.claude&&window.claude.use);
let dict=null;
function micAvailable(){ return !!((SR&&!inClaude)||dict); }
/* listen(onText, opts) -> stop(). continuous: uzluksiz tinglash (Tez o'qish uchun) */
function listen(onText,onEnd,continuous=false){
  if(SR && !inClaude){
    let stopped=false; const r=new SR(); r.lang="uz-UZ"; r.interimResults=true; r.maxAlternatives=3; r.continuous=continuous;
    r.onresult=e=>{ for(let i=e.resultIndex;i<e.results.length;i++){ let j=0; for(const alt of e.results[i]) onText(alt.transcript,e.results[i].isFinal,i,j++); } };
    r.onerror=e=>{ if(e.error==="not-allowed"||e.error==="service-not-allowed"){ stopped=true; onEnd&&onEnd("denied"); } };
    r.onend=()=>{ if(continuous&&!stopped){ try{r.start()}catch(e){} } else onEnd&&onEnd("end"); };
    r.start(); return ()=>{ stopped=true; try{r.stop()}catch(e){} };
  }
  if(dict){ dictHandler=onText; dict.start().catch(err=>{ onEnd&&onEnd(((err&&err.code)||err)==="not_granted"?"denied":"err"); });
    return ()=>{ dictHandler=null; dict.stop().catch(()=>{}); }; }
  onEnd&&onEnd("none"); return ()=>{};
}
let dictHandler=null;

/* Bitta so'z/gap uchun mikrofon tugmasi */
function micTry(btn,target,onOk,hintEl,heardEl){
  let stop=null, timer=null, done=false, last="";
  const end=(msg)=>{ if(done) return; done=true; clearTimeout(timer); stop&&stop(); btn.classList.remove("listening"); if(msg!==undefined) hintEl.textContent=msg; };
  btn.onclick=()=>{
    if(btn.classList.contains("listening")){ end(""); return; }
    done=false; last=""; heardEl.textContent=""; hintEl.textContent="Gapir... 🎙️"; btn.classList.add("listening");
    stop=listen((t)=>{ if(done) return; if(t){ last=t; heardEl.textContent=`Eshitdim: "${t}"`; }
        if(matches(t,target)){ end(""); onOk(btn); } },
      (why)=>{ if(why==="denied") end("Mikrofonga ruxsat bering 🎙️"); else if(why==="end") setTimeout(()=>{ if(!done){ ding(false); end(last?"Unday emas — yana urinib ko'r! 💪":"Eshitmadim. Balandroq gapir 🎙️"); } },350); });
    timer=setTimeout(()=>{ if(!done){ ding(false); end(last?"Unday emas — 🔊 tingla va yana ayt":"Eshitmadim. Balandroq gapir 🎙️"); } },7000);
  };
  return ()=>end();
}
