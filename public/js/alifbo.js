/* Alifbo — 🔤 Alifbo: xarita va harf darslari */
/* ---------- XARITA ---------- */
let cleanup=[];
function clean(){ cleanup.forEach(f=>{try{f()}catch(e){}}); cleanup=[]; try{curAudio&&curAudio.pause()}catch(e){} }
function unlocked(i){ return S.unlockAll || i===0 || (S.stars[i-1]||0)>0 || (S.stars[i]||0)>0; }
function curIndex(){ for(let i=0;i<LESSONS.length;i++) if(!(S.stars[i]>0)) return i; return LESSONS.length-1; }
function kind(L){ return L.t==="unli"?"v":L.t==="belgi"?"b":"c"; }
function cap(L){ return L.l==="'"?"ʼ":L.l; }
function pair(L){ if(L.l==="'") return "ʼ"; const lo=L.l.toLowerCase(); return L.l+lo; }

function home(){
  clean();
  const n=LESSONS.length, cur=curIndex(), H=170, top=70, W=100;
  const pts=LESSONS.map((L,i)=>({x:[50,74,80,62,36,22,28,50][i%8], y:top+i*H/1.25}));
  const height=top+(n-1)*H/1.25+120;
  const d=pts.map((p,i)=>i?`S ${(pts[i-1].x+p.x)/2+ (i%2?14:-14)} ${p.y-50}, ${p.x} ${p.y}`:`M ${p.x} ${p.y}`).join(" ");
  const done=Object.values(S.stars).filter(x=>x>0).length;
  const decos=["🌳","🌼","🦋","🌷","🍄","🐞","☁️","🌲","🐦","🌻"];
  S.mode="alifbo"; save();
  app.innerHTML=`${modeSwitch()}
    <p class="greet">Salom, o'quvchi! 👋</p>
    <p class="sub">${done?`${done} ta harf o'rganildi. Davom etamiz!`:"Harflar yo'liga xush kelibsan! Birinchi harfni bos."}</p>
    <div class="hero">
      <button class="pill p-or" id="cont">▶ Davom etish: ${cap(LESSONS[cur])}</button>
      <button class="pill p-gr" id="fast">⚡ Tez o'qi</button>
      <button class="pill p-mi" id="shop">🎁 Do'kon</button>
      <button class="pill p-sk" id="par">👪 Ota-onalar</button>
    </div>
    <div class="map" style="height:${height}px">
      <svg class="path" viewBox="0 0 100 ${height}" preserveAspectRatio="none"><path d="${d}" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" vector-effect="non-scaling-stroke" opacity=".85"/>
        <path d="${d}" fill="none" stroke="#F3D58A" stroke-width="3" stroke-dasharray="2 14" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg>
      ${pts.map((p,i)=>`<div class="deco" style="left:${p.x>50?6+(i*7)%18:74+(i*5)%18}%;top:${p.y-20}px">${decos[i%decos.length]}</div>`).join("")}
      ${LESSONS.map((L,i)=>{ const u=unlocked(i), st=S.stars[i]||0;
        return `<button class="node ${u?kind(L):"lock"} ${i===cur&&u?"cur":""}" data-i="${i}" style="left:${pts[i].x}%;top:${pts[i].y}px">
          <span class="num">${i+1}</span>${cap(L)}${u?"":'<span class="lk">🔒</span>'}
          <span class="st">${u?("⭐".repeat(st)+"☆".repeat(3-st)):""}</span></button>`; }).join("")}
      <div class="flag" style="left:50%;top:${height-40}px">🏆</div>
    </div>`;
  app.querySelectorAll(".node").forEach(b=>b.onclick=()=>{ const i=+b.dataset.i;
    if(!unlocked(i)){ ding(false); toast(`🔒 Avval <b>${cap(LESSONS[i-1])}</b> harfini o'rgan`,1500); return; } lesson(i); });
  bindMode();
  $("#cont").onclick=()=>lesson(cur); $("#fast").onclick=fast; $("#shop").onclick=shop; $("#par").onclick=parents;
  const node=app.querySelector(".node.cur"); if(node && S.stars[0]) setTimeout(()=>node.scrollIntoView({behavior:"smooth",block:"center"}),150);
}
$("#home").onclick=()=>S.mode==="ravon"?ravon():home();

/* ---------- DARS ---------- */
function learnedUpTo(i){ return LESSONS.slice(0,i+1); }
function lesson(i){
  clean();
  const L=LESSONS[i]; let mistakes=0;
  const words=L.w.filter(w=>plain(w[0]).length>=2);
  const steps=[intro, syllables];
  if(words.length) steps.push(readWords);
  steps.push(games);
  if(L.s.length) steps.push(sentences);
  let si=0;
  prefetch(`${L.l==="'"?"Tutuq belgisi":L.l+" harfi"}`, ...L.hear.map(h=>h[0]));
  function frame(title,body,nextLabel){
    app.innerHTML=`<div class="topbar"><button class="back" id="bk">← Xarita</button>
      <div class="steps">${steps.map((_,k)=>`<i class="${k<si?"on":k===si?"now":""}"></i>`).join("")}</div></div>
      <div class="panel"><div class="stitle">${title}</div>${body}
      <button class="btn b-mint next ${nextLabel?"":"hidden"}" id="nx">${nextLabel||"Keyingi"} ▶</button></div>`;
    $("#bk").onclick=home; const nx=$("#nx"); nx.onclick=()=>go(); return nx;
  }
  function go(){ clean(); si++; if(si>=steps.length) return finish(); steps[si](); }

  function intro(){
    const say=L.l==="'"?"Tutuq belgisi":`${L.l} harfi. ${L.t==="unli"?"Unli tovush.":"Undosh tovush."}`;
    const nx=frame(`${si+1}. Yangi ${L.l==="'"?"belgi":"harf"}`,`
      <div class="bigletter ${kind(L)==="v"?"V":kind(L)==="b"?"":"C"}" id="bl" style="${kind(L)==="b"?"color:var(--grape)":""}">${pair(L)}</div>
      <div style="text-align:center"><span class="badge ${kind(L)==="v"?"bv":kind(L)==="b"?"bb":"bc"}">${L.t==="unli"?"🔴 Unli tovush":L.t==="belgi"?"🟣 Tutuq belgisi":"🔵 Undosh tovush"}</span></div>
      <div class="row"><button class="btn b-sky" id="pl"><span class="big">🔊</span>Tingla</button></div>
      <div class="hint">Bu harf bor so'zlarni bosib tingla 👇</div>
      <div class="cards">${L.hear.map(([w,e])=>`<button class="hcard" data-w="${w}"><div class="e">${e}</div><div class="w">${hl(w,L.l)}</div></button>`).join("")}</div>`,"Bo'g'inlarga o'tamiz");
    const p=()=>speak(say); $("#pl").onclick=p; $("#bl").onclick=p;
    app.querySelectorAll(".hcard").forEach(b=>b.onclick=()=>speak(b.dataset.w));
    setTimeout(p,250);
    prefetch(...L.syl);
  }
  function hl(w,l){ const ll=l.toLowerCase(); return units(w).map(u=>u.toLowerCase()===ll?`<span class="hl ${VOWELS.has(ll)?"V":"C"}">${u}</span>`:u).join(""); }

  function syllables(){
    const syl=L.syl;
    const nx=frame(`${si+1}. Bo'g'inlar`,`
      <div class="hint">Har birini bosib tingla, keyin o'yinga o't</div>
      <div class="sylgrid" id="sg">${syl.map(s=>`<button class="syl" data-s="${s}">${color(s)}</button>`).join("")}</div>
      <div class="row"><button class="btn b-rose" id="qz"><span class="big">🎯</span>Topchi-chi?</button></div>`, "");
    app.querySelectorAll("#sg .syl").forEach(b=>b.onclick=()=>speak(b.dataset.s));
    nx.classList.remove("hidden"); nx.textContent="O'tkazib yuborish ▶"; nx.className="btn b-ghost next";
    $("#qz").onclick=()=>quiz();
    if(syl.length<2){ $("#qz").classList.add("hidden"); nx.className="btn b-mint next"; nx.textContent="Keyingi ▶"; }
    function quiz(){
      const pool=[...new Set([...syl, ...learnedUpTo(i).slice(-3,-1).flatMap(x=>x.syl)])];
      const rounds=sample(syl,Math.min(4,syl.length)); let r=0;
      function q(){
        if(r>=rounds.length){ ding(true); toast("Bo'g'inlar o'rganildi! 🎉",1100); setTimeout(go,900); return; }
        const t=rounds[r], opts=shuffle([t,...sample(pool.filter(x=>x!==t),Math.min(3,pool.length-1))]); let wrong=false;
        frame(`${si+1}. Qaysi bo'g'in aytildi?`,`
          <div class="row" style="margin-top:4px"><button class="btn b-sky" id="pl"><span class="big">🔊</span>Yana eshit</button></div>
          <div class="counter" style="margin-top:8px">${r+1} / ${rounds.length}</div>
          <div class="choices">${opts.map(o=>`<button class="choice" data-o="${o}">${color(o)}</button>`).join("")}</div>`,"");
        $("#pl").onclick=()=>speak(t); setTimeout(()=>speak(t),200);
        app.querySelectorAll(".choice").forEach(b=>b.onclick=()=>{
          if(b.dataset.o===t){ b.classList.add("good"); app.querySelectorAll(".choice").forEach(x=>x.disabled=true);
            if(!wrong) reward(REWARD.quiz,b,true); else ding(true); r++; setTimeout(q,850); }
          else { wrong=true; mistakes++; b.classList.remove("bad"); void b.offsetWidth; b.classList.add("bad"); ding(false); speak(t); }
        });
      }
      q();
    }
  }

  function readWords(){
    const list=words.slice(0,6); let k=0;
    function show(){
      if(k>=list.length) return go();
      const [w,e]=list[k], parts=w.split("-");
      frame(`${si+1}. So'zni o'qi`,`
        <div class="counter">${k+1} / ${list.length}</div>
        <div class="emo">${e||""}</div>
        <div class="wordbox">${parts.map((p,j)=>`${j?'<span class="sep">-</span>':""}<button class="chip" data-p="${p}">${color(p)}</button>`).join("")}</div>
        <div class="hint" id="hint">${parts.length>1?"Bo'g'inlarni bosib o'qi, keyin butun so'zni ayt 🎤":"O'qi va ayt 🎤"}</div>
        <div class="heard" id="heard"></div>
        <div class="row">
          <button class="btn b-sky" id="pl"><span class="big">🔊</span>Tingla</button>
          <button class="btn b-rose ${micAvailable()?"":"hidden"}" id="mic"><span class="big">🎤</span>Ayt</button>
        </div>
        ${micAvailable()?"":`<p class="note" style="text-align:center">🎤 Mikrofon uchun sahifani Chrome brauzerida oching</p>`}
        <div class="row"><button class="btn b-ghost" id="sk">O'tkazib yuborish →</button></div>`,"");
      app.querySelectorAll(".chip").forEach(c=>c.onclick=()=>{ app.querySelectorAll(".chip").forEach(x=>x.classList.remove("lit")); c.classList.add("lit"); speak(c.dataset.p); });
      $("#pl").onclick=async()=>{ for(const c of app.querySelectorAll(".chip")){ c.classList.add("lit"); } await speak(w); app.querySelectorAll(".chip").forEach(x=>x.classList.remove("lit")); };
      $("#sk").onclick=()=>{ mistakes++; k++; show(); };
      prefetch(w,...parts, list[k+1]&&list[k+1][0]);
      if(micAvailable()) cleanup.push(micTry($("#mic"),w,(el)=>{ S.stats.words++; reward(REWARD.word,el); k++; setTimeout(show,1200); },$("#hint"),$("#heard")));
    }
    show();
  }

  function games(){
    const seq=["balloons"];
    const multi=learnedUpTo(i).flatMap(x=>x.w).filter(w=>w[0].includes("-"));
    const pics=learnedUpTo(i).flatMap(x=>x.w).filter(w=>w[1]);
    if(pics.length>=3) seq.push("pictures");
    if(multi.length>=2) seq.push("build");
    let g=0;
    const next=()=>{ clean(); g++; if(g>=seq.length) return go(); run(); };
    const run=()=>({balloons,pictures,build})[seq[g]]();
    run();

    function balloons(){
      const target=L.l==="'"?"ʼ":L.l, tl=target.toLowerCase();
      const others=[...new Set(learnedUpTo(i).map(x=>x.l).filter(x=>x!==L.l&&x!=="'"))];
      const extra=["O","A","N","T","I","L","M","U","S","R","B","K"].filter(x=>x!==L.l);
      const dpool=others.length>=3?others:[...others,...extra];
      const need=5; let got=0, alive=true;
      const nx=frame(`${si+1}. Pufakchalar 🎈`,`
        <div class="hint" style="font-size:20px;color:var(--ink);font-weight:900">Faqat <span class="${kind(L)==="v"?"V":"C"}" style="font-size:30px">${pair(L)}</span> harfli pufakchalarni yorib chiq!</div>
        <div class="counter" id="cnt">0 / ${need}</div><div class="sky" id="sky"></div>`,"");
      const sky=$("#sky"), cols=["#FF6B8B","#3BA4FF","#2FC28A","#FFB020","#8E62FF","#FF8A3C"];
      let n=0;
      function spawn(){
        if(!alive) return;
        const isT=Math.random()<.45 || n%4===0; n++;
        let txt=isT?target:dpool[Math.random()*dpool.length|0]; if(L.l==="'"&&!isT) txt=dpool[Math.random()*dpool.length|0];
        const lower=Math.random()<.5 && txt!=="ʼ"; const show=lower?txt.toLowerCase():txt;
        const b=document.createElement("button"); b.className="balloon";
        b.style.left=(4+Math.random()*78)+"%"; b.style.bottom="-110px"; const dur=6+Math.random()*3; b.style.animationDuration=dur+"s";
        b.innerHTML=`<div class="bb" style="background:${cols[Math.random()*cols.length|0]}">${show}</div>`;
        b.onclick=()=>{ if(b.dataset.x) return; b.dataset.x=1;
          if(txt===target){ b.classList.add("pop"); got++; $("#cnt").textContent=`${got} / ${need}`; reward(REWARD.game,b,true);
            speak(L.l==="'"?"tutuq belgisi":L.l.toLowerCase());
            if(got>=need){ alive=false; S.stats.games++; save(); toast("Hammasini topding! 🎉",1100); setTimeout(next,1200); } }
          else { mistakes++; ding(false); b.animate([{transform:"translateX(-8px)"},{transform:"translateX(8px)"},{transform:"none"}],{duration:300}); delete b.dataset.x; }
          setTimeout(()=>b.remove(),260); };
        b.addEventListener("animationend",()=>b.remove());
        sky.appendChild(b);
      }
      const iv=setInterval(spawn,850); spawn(); setTimeout(spawn,400);
      cleanup.push(()=>{ alive=false; clearInterval(iv); });
    }

    function pictures(){
      const pool=pics; const seen=new Set();
      const rounds=[...shuffle(pics.filter(w=>LESSONS[i].w.includes(w))),...shuffle(pool)].filter(w=>!seen.has(w[0])&&seen.add(w[0])).slice(0,3); let r=0;
      function q(){
        if(r>=rounds.length){ S.stats.games++; save(); return next(); }
        const [w,e]=rounds[r]; const opts=shuffle([w,...sample(pool.map(x=>x[0]).filter(x=>x!==w),2)]); let wrong=false;
        frame(`${si+1}. Rasmga mos so'zni top`,`
          <div class="emo" style="font-size:90px">${e}</div>
          <div class="hint">O'qib ko'r va to'g'ri so'zni bos</div>
          <div class="choices" style="grid-template-columns:1fr">${opts.map(o=>`<button class="choice" data-o="${o}">${color(plain(o))}</button>`).join("")}</div>`,"");
        app.querySelectorAll(".choice").forEach(b=>b.onclick=()=>{
          if(b.dataset.o===w){ b.classList.add("good"); app.querySelectorAll(".choice").forEach(x=>x.disabled=true); speak(w);
            if(!wrong) reward(REWARD.game,b,true); else ding(true); r++; setTimeout(q,1100); }
          else{ wrong=true; mistakes++; b.classList.add("bad"); ding(false); }
        });
      }
      q();
    }

    function build(){
      const own=multi.filter(w=>LESSONS[i].w.includes(w)); const rounds=sample(own.length>=2?own:multi,2); let r=0;
      function q(){
        if(r>=rounds.length){ S.stats.games++; save(); return next(); }
        const [w,e]=rounds[r], parts=w.split("-"); let placed=0, wrong=0;
        const allSyl=[...new Set(learnedUpTo(i).flatMap(x=>x.syl))].filter(x=>!parts.includes(x));
        const pieces=shuffle([...parts.map((p,k)=>({p,k})),...sample(allSyl,2).map(p=>({p,k:-1}))]);
        frame(`${si+1}. So'z yig' 🧩`,`
          <div class="emo">${e||"❓"}</div>
          <div class="row" style="margin-top:4px"><button class="btn b-ghost" id="pl">🔊 So'zni eshit</button></div>
          <div class="slots">${parts.map(()=>`<div class="slot"></div>`).join("")}</div>
          <div class="pieces">${pieces.map((x,j)=>`<button class="piece" data-j="${j}">${color(x.p)}</button>`).join("")}</div>`,"");
        $("#pl").onclick=()=>speak(w); setTimeout(()=>speak(w),200);
        const slots=app.querySelectorAll(".slot");
        app.querySelectorAll(".piece").forEach(b=>b.onclick=()=>{
          const x=pieces[+b.dataset.j];
          if(x.p===parts[placed]){ slots[placed].innerHTML=color(x.p); slots[placed].classList.add("fill"); placed++; b.disabled=true; speak(x.p);
            if(placed===parts.length){ setTimeout(()=>speak(w),450); if(wrong<2) reward(REWARD.game*2,slots[slots.length-1],true); else ding(true); r++; setTimeout(q,1600); } }
          else { wrong++; mistakes++; ding(false); b.animate([{transform:"translateX(-6px)"},{transform:"translateX(6px)"},{transform:"none"}],{duration:300}); }
        });
      }
      q();
    }
  }

  function sentences(){
    let k=0;
    function show(){
      if(k>=L.s.length) return go();
      const s=L.s[k];
      frame(`${si+1}. Gapni o'qi`,`
        <div class="counter">${k+1} / ${L.s.length}</div>
        <div class="sent" id="st">${s.split(" ").map(w=>`<span data-w="${w}">${color(w)}</span>`).join(" ")}</div>
        <div class="hint" id="hint">So'zlarni bosib o'qi, keyin butun gapni ayt 🎤</div>
        <div class="heard" id="heard"></div>
        <div class="row">
          <button class="btn b-sky" id="pl"><span class="big">🔊</span>Tingla</button>
          <button class="btn b-rose ${micAvailable()?"":"hidden"}" id="mic"><span class="big">🎤</span>Ayt</button>
        </div>
        <div class="row"><button class="btn b-ghost" id="sk">O'tkazib yuborish →</button></div>`,"");
      app.querySelectorAll("#st span").forEach(sp=>sp.onclick=()=>{ app.querySelectorAll("#st span").forEach(x=>x.classList.remove("lit")); sp.classList.add("lit"); speak(sp.dataset.w.replace(/[.,!?]/g,"")); });
      $("#pl").onclick=()=>speak(s);
      $("#sk").onclick=()=>{ mistakes++; k++; show(); };
      prefetch(s, L.s[k+1]);
      if(micAvailable()) cleanup.push(micTry($("#mic"),s.replace(/[.,!?]/g,""),(el)=>{ S.stats.sents++; reward(REWARD.sent,el); k++; setTimeout(show,1300); },$("#hint"),$("#heard")));
    }
    show();
  }

  function finish(){
    const stars=mistakes<=2?3:mistakes<=6?2:1;
    const first=!(S.stars[i]>0);
    S.stars[i]=Math.max(S.stars[i]||0,stars); if(first) S.stats.lessons++; save();
    confetti(); ding(true);
    const nxt=i+1<LESSONS.length?LESSONS[i+1]:null;
    app.innerHTML=`<div class="panel done">
      <div style="font-size:84px">${["","🙂","😃","🤩"][stars]}</div>
      <div class="stars">${"⭐".repeat(stars)}${"☆".repeat(3-stars)}</div>
      <h2 class="stitle" style="font-size:30px">${pair(L)} ${L.l==="'"?"belgisi":"harfi"} o'rganildi!</h2>
      <p class="sub">${stars===3?"Ajoyib! Hech xato qilmading deyarli.":"Yaxshi! Xohlasang, qayta o'ynab 3 ta yulduz ol."}</p>
      <div class="row">
        ${nxt?`<button class="btn b-mint" id="nn">Keyingi harf: ${cap(nxt)} ▶</button>`:`<button class="btn b-mint" id="nn">🏆 Alifbo tugadi!</button>`}
        <button class="btn b-ghost" id="rp">↻ Qayta</button><button class="btn b-ghost" id="mp">🗺️ Xarita</button>
      </div></div>`;
    if(first) setTimeout(()=>reward(REWARD.lesson,$(".stars")),500);
    $("#nn").onclick=()=>nxt?lesson(i+1):home(); $("#rp").onclick=()=>lesson(i); $("#mp").onclick=home;
  }
  steps[0]();
}
