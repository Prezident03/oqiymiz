/* =====================================================================
   🚀 RAVON O'QISH — harflarni biladigan, lekin qo'shib o'qishga qiynaladigan bolalar uchun
   ===================================================================== */
S.lv = S.lv ?? 0; S.wpm = S.wpm || []; S.streak = S.streak || {last:"", n:0};
S.flashMs = S.flashMs || 1500; S.raceBest = S.raceBest || 0; S.fl = S.fl || {blend:0,pyr:0,chain:0,flash:0,race:0,story:0};
const today = () => new Date().toISOString().slice(0,10);
function near(a,b){ if(a===b) return true; if(b.length>=4 && lev(a,b)<=1) return true; if(b.length>=8 && lev(a,b)<=2) return true; return false; }
function lvWords(lv=S.lv){ return LEVELS2[lv].w; }
function streakStr(){ const s=S.streak; if(!s.n) return "0"; const y=new Date(Date.now()-864e5).toISOString().slice(0,10); return (s.last===today()||s.last===y)?String(s.n):"0"; }
function markDay(){ const t=today(); if(S.streak.last===t) return; const y=new Date(Date.now()-864e5).toISOString().slice(0,10);
  S.streak.n = S.streak.last===y ? S.streak.n+1 : 1; S.streak.last=t; save(); }

/* --- umumiy ramka --- */
let flow=null;   // bugungi mashq oqimi
function fFrame(title, body, prog){
  const dl = flow ? `<div class="steps">${flow.list.map((_,k)=>`<i class="${k<flow.i?"on":k===flow.i?"now":""}"></i>`).join("")}</div>` : `<div style="flex:1"></div>`;
  app.innerHTML=`<div class="topbar"><button class="back" id="bk">← ${flow?"To'xtatish":"Orqaga"}</button>${dl}</div>
    <div class="panel"><div class="stitle">${title}</div>${prog?`<div class="counter">${prog}</div>`:""}${body}</div>`;
  $("#bk").onclick=()=>{ flow=null; ravon(); };
}
function fDone(emoji, title, sub, again){
  if(flow) { flow.i++; return nextFlow(); }
  confetti(); ding(true);
  app.innerHTML=`<div class="panel done"><div style="font-size:80px">${emoji}</div><h2 class="stitle" style="font-size:30px">${title}</h2><p class="sub">${sub||""}</p>
    <div class="row"><button class="btn b-mint" id="ag">↻ Yana</button><button class="btn b-ghost" id="hb">🚀 Mashqlar</button></div></div>`;
  $("#ag").onclick=again; $("#hb").onclick=ravon;
}

/* --- 🚀 BOSH SAHIFA (ravon o'qish) --- */
function ravon(){
  clean(); flow=null; S.mode="ravon"; save();
  const last=S.wpm.slice(-10), max=Math.max(20,...last.map(x=>x.v));
  const doneToday=S.streak.last===today();
  const tiles=[
    ["blend","🧲","Qo'shib o'qi","Bo'g'inlarni birlashtir","#FF5C80","#DE3B60"],
    ["pyr","🔺","O'qish piramidasi","Gap o'sib boradi","#8E62FF","#6E42E0"],
    ["chain","🔗","So'z zanjiri","Bitta harf o'zgaradi","#2FC28A","#1F9C6C"],
    ["flash","👁️","Tez ko'z","Bir qarashda tani","#FF9A3C","#E07A1A"],
    ["race","🏁","Bo'g'in poygasi","Eshit va tez top","#3BA4FF","#1E82DE"],
    ["story","📖","Hikoya o'qi","Mikrofon kuzatadi","#F25FB8","#C83E92"],
    ["fastlv","⚡","Tez o'qi","60 soniya","#FFB020","#D99100"],
  ];
  app.innerHTML=`${modeSwitch()}
    <div class="panel" style="padding:16px">
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;justify-content:space-between">
        <div><div class="stitle" style="text-align:left;margin:0">🚀 Ravon o'qish</div><div class="note">Harflarni bilasanmi? Endi tez va ravon o'qishni o'rganamiz!</div></div>
        <div style="display:flex;gap:8px"><span class="stat">🔥 ${streakStr()} kun</span><span class="stat">📈 ${last.length?last[last.length-1].v:0} so'z/daq</span></div>
      </div>
      <div class="levels" style="display:flex;gap:6px;flex-wrap:wrap;margin:12px 0 4px">${LEVELS2.map((L,k)=>`<button class="lvb ${k===S.lv?"on":""}" data-l="${k}">${L.name}</button>`).join("")}</div>
      <div class="note">Hozirgi daraja: <b>${LEVELS2[S.lv].name}</b> — masalan: ${LEVELS2[S.lv].hint}</div>
      <button class="btn b-mint" id="daily" style="width:100%;justify-content:center;margin-top:14px;font-size:22px;padding:18px">
        📅 ${doneToday?"Bugungi mashq bajarildi ✅ — yana bir bor":"Bugungi mashq (≈10 daqiqa)"}</button>
    </div>
    <div class="tiles">${tiles.map(([k,e,t,s,c,cd])=>`<button class="ftile" data-k="${k}" style="background:${c};box-shadow:0 6px 0 ${cd}"><span class="fe">${e}</span>${t}<small>${s}</small></button>`).join("")}</div>
    <div class="panel" style="margin-top:16px">
      <div class="stitle" style="font-size:20px;text-align:left">📈 O'qish tezligim (so'z / daqiqa)</div>
      ${last.length?`<div class="chart">${last.map(x=>`<div class="bar"><b>${x.v}</b><i style="height:${Math.max(6,x.v/max*120)}px"></i><span>${x.d.slice(5).replace("-",".")}</span></div>`).join("")}</div>`
        :`<p class="note">Hikoya o'qisang yoki "Tez o'qi" o'ynasang — tezliging shu yerda ko'rinadi.</p>`}
    </div>`;
  bindMode();
  app.querySelectorAll(".lvb").forEach(b=>b.onclick=()=>{ S.lv=+b.dataset.l; save(); ravon(); });
  app.querySelectorAll(".ftile").forEach(b=>b.onclick=()=>({blend,pyr:pyramid,chain,flash,race,story:storyPick,fastlv:()=>fastLevel()})[b.dataset.k]());
  $("#daily").onclick=startDaily;
}
function modeSwitch(){ return `<div class="modes"><button class="mode ${S.mode!=="ravon"?"on":""}" data-m="alifbo">🔤 Alifbo</button><button class="mode ${S.mode==="ravon"?"on":""}" data-m="ravon">🚀 Ravon o'qish</button></div>`; }
function bindMode(){ app.querySelectorAll(".mode").forEach(b=>b.onclick=()=>{ S.mode=b.dataset.m; save(); S.mode==="ravon"?ravon():home(); }); }

/* --- 📅 Bugungi mashq --- */
function startDaily(){
  const st=STORIES.filter(s=>s.lv<=S.lv+1);
  flow={ i:0, list:[ ()=>blend(), ()=>flash(), ()=>chain(), ()=>pyramid(), ()=>story(st[Math.random()*st.length|0]) ] };
  nextFlow();
}
function nextFlow(){
  clean();
  if(flow.i>=flow.list.length){ flow=null; markDay(); S.coins+=10; save(); renderCoins(); confetti(); ding(true);
    app.innerHTML=`<div class="panel done"><div style="font-size:84px">🏅</div><h2 class="stitle" style="font-size:30px">Bugungi mashq tugadi!</h2>
      <p class="sub">🔥 ${S.streak.n} kun ketma-ket! Bonus: +10 🪙</p><p class="sub">Ertaga yana kel — har kuni ozgina mashq katta natija beradi.</p>
      <div class="row"><button class="btn b-mint" id="hb">🚀 Mashqlar</button></div></div>`;
    $("#hb").onclick=ravon; return; }
  flow.list[flow.i]();
}

/* --- 🧲 Qo'shib o'qi --- */
function blend(){
  clean();
  const list=sample(lvWords(),5); let k=0, ok=0;
  function show(){
    if(k>=list.length){ S.fl.blend++; save(); return fDone("🧲","Qo'shib o'qish — zo'r!",`${ok} / ${list.length} so'z to'g'ri o'qildi`,blend); }
    const [w,e]=list[k]; const p=plain(w);
    const parts = w.includes("-") ? w.split("-") : units(p);
    fFrame("🧲 Qo'shib o'qi",`
      <div class="emo" id="em" style="opacity:.15">${e||"❓"}</div>
      <div class="blendrow" id="br">${parts.map(x=>`<button class="btile" data-p="${x}">${color(x)}</button>`).join("")}</div>
      <div class="hint" id="hint">${w.includes("-")?"Har bir bo'g'inni bosib o'qi 👆":"Har bir harfga qara 👀"} — keyin <b>Qo'sh</b> tugmasini bos</div>
      <div class="heard" id="heard"></div>
      <div class="row" id="r1"><button class="btn b-sky" id="mg"><span class="big">🧲</span>Qo'sh!</button></div>
      <div class="row hidden" id="r2">
        <button class="btn b-sky" id="pl"><span class="big">🔊</span>Tingla</button>
        <button class="btn b-rose ${micAvailable()?"":"hidden"}" id="mic"><span class="big">🎤</span>Ayt</button>
      </div>
      <div class="row"><button class="btn b-ghost" id="sk">Keyingisi →</button></div>`, `${k+1} / ${list.length}`);
    prefetch(w,...(w.includes("-")?parts:[]));
    app.querySelectorAll(".btile").forEach(b=>b.onclick=()=>{ b.classList.add("seen"); if(w.includes("-")) speak(b.dataset.p); });
    $("#mg").onclick=async()=>{ $("#br").classList.add("merged"); $("#r1").classList.add("hidden"); await sleep(650);
      $("#em").style.opacity=1; $("#r2").classList.remove("hidden"); $("#hint").textContent="Endi butun so'zni o'zing ayt 🎤"; speak(w);
      if(!micAvailable()) $("#hint").textContent="Butun so'zni ovoz chiqarib o'qi 🗣️"; };
    $("#pl").onclick=()=>speak(w);
    $("#sk").onclick=()=>{ k++; show(); };
    if(micAvailable()) cleanup.push(micTry($("#mic"),w,(el)=>{ ok++; S.stats.words++; reward(REWARD.word,el); k++; setTimeout(show,1200); },$("#hint"),$("#heard")));
  }
  show();
}

/* --- 🔺 O'qish piramidasi --- */
function pyramid(){
  clean();
  const P=PYRAMIDS[Math.random()*PYRAMIDS.length|0]; let k=0;
  function show(){
    if(k>=P.length){ S.fl.pyr++; save(); return fDone("🔺","Piramida cho'qqisiga chiqding!","Har qator uzunroq edi — sen uddalading!",pyramid); }
    fFrame("🔺 O'qish piramidasi",`
      <div class="pyr">${P.map((row,j)=>`<div class="prow ${j<k?"ok":j===k?"cur":"fut"}">${j<=k?row.split(" ").map(x=>color(x)).join(" "):row.split(" ").map(()=>"▢").join(" ")}</div>`).join("")}</div>
      <div class="hint" id="hint">Belgilangan qatorni o'qi 🎤</div><div class="heard" id="heard"></div>
      <div class="row"><button class="btn b-sky" id="pl"><span class="big">🔊</span>Tingla</button>
        <button class="btn b-rose ${micAvailable()?"":"hidden"}" id="mic"><span class="big">🎤</span>Ayt</button>
        <button class="btn b-ghost ${micAvailable()?"hidden":""}" id="nx2">O'qidim ✓</button></div>
      <div class="row"><button class="btn b-ghost" id="sk">Keyingi qator →</button></div>`, `${k+1} / ${P.length}`);
    $("#pl").onclick=()=>speak(P[k]); prefetch(P[k],P[k+1]);
    $("#sk").onclick=()=>{ k++; show(); }; $("#nx2").onclick=()=>{ k++; show(); };
    if(micAvailable()) cleanup.push(micTry($("#mic"),P[k].replace(/[.,!?]/g,""),(el)=>{ S.stats.sents++; reward(2,el,true); k++; setTimeout(show,700); },$("#hint"),$("#heard")));
  }
  show();
}

/* --- 🔗 So'z zanjiri --- */
function chain(){
  clean();
  const C=CHAINS[Math.random()*CHAINS.length|0]; let k=0;
  function show(){
    if(k>=C.length){ S.fl.chain++; save(); return fDone("🔗","Zanjir tugadi!",C.join(" → "),chain); }
    const w=C[k], u=units(w), pu=k?units(C[k-1]):null;
    const html=u.map((x,j)=>{ const ch=pu&&pu[j]!==x; const cls=VOWELS.has(x.toLowerCase())?"V":"C"; return `<span class="${cls} ${ch?"chg":""}">${x}</span>`; }).join("");
    fFrame("🔗 So'z zanjiri",`
      <div class="chainline">${C.map((x,j)=>`<span class="${j<k?"ok":j===k?"cur":""}">${j<=k?x:"?"}</span>`).join(" → ")}</div>
      <div class="sent" style="font-size:clamp(64px,18vw,110px);margin:6px 0">${html}</div>
      <div class="hint" id="hint">${k?"Sariq harf o'zgardi! Diqqat bilan o'qi 👀":"Birinchi so'zni o'qi"}</div><div class="heard" id="heard"></div>
      <div class="row"><button class="btn b-sky" id="pl"><span class="big">🔊</span>Tingla</button>
        <button class="btn b-rose ${micAvailable()?"":"hidden"}" id="mic"><span class="big">🎤</span>Ayt</button>
        <button class="btn b-ghost ${micAvailable()?"hidden":""}" id="nx2">O'qidim ✓</button></div>
      <div class="row"><button class="btn b-ghost" id="sk">Keyingisi →</button></div>`, `${k+1} / ${C.length}`);
    $("#pl").onclick=()=>speak(w); prefetch(w,C[k+1]);
    $("#sk").onclick=()=>{ k++; show(); }; $("#nx2").onclick=()=>{ k++; show(); };
    if(micAvailable()) cleanup.push(micTry($("#mic"),w,(el)=>{ S.stats.words++; reward(2,el,true); k++; setTimeout(show,700); },$("#hint"),$("#heard")));
  }
  show();
}

/* --- 👁️ Tez ko'z --- */
function flash(){
  clean();
  const pool=[...lvWords(), ...(LEVELS2[S.lv+1]?LEVELS2[S.lv+1].w:[]), ...(LEVELS2[S.lv-1]?LEVELS2[S.lv-1].w:[])].map(x=>plain(x[0]));
  const rounds=sample(lvWords().map(x=>plain(x[0])),6); let r=0, ok=0;
  function q(){
    if(r>=rounds.length){ S.fl.flash++; save(); return fDone("👁️","Ko'zing o'tkir!",`${ok} / ${rounds.length} to'g'ri · ko'rsatish vaqti: ${(S.flashMs/1000).toFixed(1)} s`,flash); }
    const w=rounds[r];
    const sim=[...new Set(pool.filter(x=>x!==w))].sort((a,b)=>lev(a,w)-lev(b,w)).slice(0,6);
    const opts=shuffle([w,...sample(sim,3)]);
    fFrame("👁️ Tez ko'z",`
      <div class="hint">So'z bir lahza ko'rinadi — yaxshilab qara!</div>
      <div class="flashbox" id="fb"><span>👀</span></div>
      <div class="choices hidden" id="ch">${opts.map(o=>`<button class="choice" data-o="${o}">${color(o)}</button>`).join("")}</div>`, `${r+1} / ${rounds.length} · ${(S.flashMs/1000).toFixed(1)} s`);
    setTimeout(()=>{ const fb=$("#fb"); if(!fb) return; fb.innerHTML=`<span>${color(w)}</span>`;
      setTimeout(()=>{ if(!$("#fb")) return; $("#fb").innerHTML=`<span style="color:#C2CBDA">❓</span>`; $("#ch").classList.remove("hidden"); },S.flashMs); },700);
    app.querySelectorAll(".choice").forEach(b=>b.onclick=()=>{
      app.querySelectorAll(".choice").forEach(x=>x.disabled=true);
      if(b.dataset.o===w){ b.classList.add("good"); ok++; S.flashMs=Math.max(400,S.flashMs-150); reward(1,b,true); }
      else { b.classList.add("bad"); app.querySelector(`.choice[data-o="${w}"]`).classList.add("good"); ding(false); S.flashMs=Math.min(2500,S.flashMs+200); }
      save(); speak(w); r++; setTimeout(q,1300);
    });
  }
  q();
}

/* --- 🏁 Bo'g'in poygasi --- */
function race(){
  clean();
  const all=[...new Set(LESSONS.flatMap(L=>L.syl).filter(s=>s.length>=2&&s.length<=3&&!s.includes("'")))];
  const grid=sample(all,12); const rounds=sample(grid,10); let r=0, miss=0; const t0=Date.now();
  fFrame("🏁 Bo'g'in poygasi",`
    <div class="hint" style="font-size:19px;color:var(--ink);font-weight:800">Eshitgan bo'g'iningni tez top va bos!</div>
    <div class="row" style="margin-top:4px"><button class="btn b-sky" id="pl"><span class="big">🔊</span>Yana eshit</button></div>
    <div class="counter" id="rc">1 / ${rounds.length}</div>
    <div class="sylgrid" style="grid-template-columns:repeat(4,1fr)">${grid.map(s=>`<button class="syl" data-s="${s}">${color(s)}</button>`).join("")}</div>`,"");
  prefetch(...rounds);
  const say=()=>speak(rounds[r]); $("#pl").onclick=say; setTimeout(say,300);
  app.querySelectorAll(".syl").forEach(b=>b.onclick=()=>{
    if(r>=rounds.length) return;
    if(b.dataset.s===rounds[r]){ b.classList.add("good"); ding(true); setTimeout(()=>b.classList.remove("good"),400); r++;
      if(r>=rounds.length){ const sec=Math.round((Date.now()-t0)/1000); const best=!S.raceBest||sec<S.raceBest; if(best) S.raceBest=sec; S.fl.race++; save();
        reward(Math.max(2,10-miss),b,true); setTimeout(()=>fDone("🏁",`${sec} soniya!`,best?"🏆 Yangi rekord!":`Rekord: ${S.raceBest} soniya`,race),700); return; }
      $("#rc").textContent=`${r+1} / ${rounds.length}`; setTimeout(say,350); }
    else { miss++; b.classList.remove("bad"); void b.offsetWidth; b.classList.add("bad"); ding(false); }
  });
}

/* --- 📖 Hikoya o'qish (mikrofon kuzatib boradi) --- */
function storyPick(){
  clean();
  fFrame("📖 Hikoya tanla",`<div class="storylist">${STORIES.map((s,k)=>`<button class="storyb ${s.lv>S.lv+2?"hard":""}" data-k="${k}"><span style="font-size:40px">${s.e}</span>
    <b>${s.t}</b><small>${s.x.split(" ").length} so'z · ${"●".repeat(s.lv)}${"○".repeat(6-s.lv)}</small></button>`).join("")}</div>`,"");
  app.querySelectorAll(".storyb").forEach(b=>b.onclick=()=>story(STORIES[+b.dataset.k]));
}
function story(st){
  clean();
  const words=st.x.split(/\s+/), toks=words.map(w=>norm(w));
  const sents=st.x.match(/[^.!?]+[.!?]/g)||[st.x];
  let p=0, t0=0, running=false, stop=null;
  fFrame(`${st.e} ${st.t}`,`
    <div class="story" id="tx">${words.map((w,k)=>`<span data-k="${k}">${w}</span>`).join(" ")}</div>
    <div class="heard" id="heard"></div>
    <div class="row">
      <button class="btn b-sky" id="pl"><span class="big">🔊</span>Avval tingla</button>
      <button class="btn b-rose ${micAvailable()?"":"hidden"}" id="go"><span class="big">🎤</span>O'qishni boshlash</button>
      <button class="btn b-mint hidden" id="fin">✅ Tugatdim</button>
    </div>
    ${micAvailable()?"":`<p class="note" style="text-align:center">🎤 Mikrofon bilan o'qish uchun sahifani Chrome'da oching. Hozircha tinglab, ovoz chiqarib o'qi.</p>`}
    <div class="hint" id="hint">${micAvailable()?"Ovoz chiqarib o'qi — o'qigan so'zlaring yashil bo'ladi":""}</div>`,"");
  const spans=[...app.querySelectorAll("#tx span")];
  const paint=()=>spans.forEach((s,k)=>{ s.className=k<p?"rd":k===p&&running?"nx":""; });
  // tinglash: gapma-gap, yoritib
  $("#pl").onclick=async()=>{
    if(running) return; let idx=0;
    for(const s of sents){ const n=s.trim().split(/\s+/).length; spans.forEach((x,k)=>x.classList.toggle("lit",k>=idx&&k<idx+n)); await speak(s.trim()); idx+=n; if(!$("#tx")) return; }
    spans.forEach(x=>x.classList.remove("lit"));
  };
  sents.forEach(s=>prefetch(s.trim()));
  let finals={}, interim="", accF="";
  const align=(text)=>{ const hw=norm(text).split(" ").filter(Boolean); let q=0;
    for(const h of hw){ if(q<toks.length && near(h,toks[q])) q++; else if(q+1<toks.length && near(h,toks[q+1])) q+=2; else if(q+2<toks.length && toks[q].length<=2 && near(h,toks[q+2])) q+=3; }
    return q; };
  const finish=()=>{ if(!running) return; running=false; stop&&stop(); const min=Math.max((Date.now()-t0)/60000,1/60);
    const wpm=Math.round(p/min); S.wpm.push({d:today(),v:wpm}); S.wpm=S.wpm.slice(-30); S.fl.story++; save();
    if(p) reward(Math.max(2,Math.round(p/3)),$("#tx"),true);
    setTimeout(()=>fDone("📖",`${wpm} so'z / daqiqa`,`${p} / ${toks.length} so'z o'qildi${p>=toks.length?" — butun hikoya! 🎉":""}`,()=>story(st)),600); };
  $("#fin").onclick=finish;
  $("#go").onclick=()=>{
    if(running) return; running=true; p=0; finals={}; interim=""; accF=""; t0=Date.now(); paint();
    $("#go").classList.add("hidden"); $("#fin").classList.remove("hidden"); $("#pl").classList.add("hidden");
    stop=listen((t,fin,idx,alt)=>{
      if(!running || (alt!==undefined && alt>0)) return;
      let full;
      if(idx!==undefined){ if(fin){ finals[idx]=t; interim=""; } else interim=t; full=Object.keys(finals).sort((a,b)=>a-b).map(k=>finals[k]).join(" ")+" "+interim; }
      else { if(fin){ accF+=" "+t; interim=""; } else interim=t; full=accF+" "+interim; }
      $("#heard").textContent=t;
      const q=align(full); if(q>p){ p=q; paint(); }
      if(p>=toks.length) finish();
    },(why)=>{ if(why==="denied"){ running=false; toast("Mikrofonga ruxsat bering 🎙️",1600); } },true);
    cleanup.push(()=>{ running=false; stop&&stop(); });
  };
}

/* --- ⚡ Tez o'qi (daraja so'zlari bilan) --- */
function fastLevel(){ fast(lvWords().concat(S.lv>0?LEVELS2[S.lv-1].w:[]).map(x=>plain(x[0])), ravon); }
