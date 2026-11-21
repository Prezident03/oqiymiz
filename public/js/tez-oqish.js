/* Alifbo — ⚡ Tez o'qi */
/* ---------- TEZ O'QISH ---------- */
function fast(poolOver, backFn){
  clean(); backFn=backFn||home;
  const learnedIdx=LESSONS.map((_,k)=>k).filter(k=>S.stars[k]>0);
  const upto=learnedIdx.length?Math.max(...learnedIdx):Math.min(3,LESSONS.length-1);
  const pool=poolOver?[...new Set(poolOver)]:[...new Set(LESSONS.slice(0,upto+1).flatMap(x=>x.w.map(w=>plain(w[0]))).filter(w=>w.length>=2))];
  app.innerHTML=`<div class="topbar"><button class="back" id="bk">← Xarita</button></div>
    <div class="panel" style="text-align:center">
      <div class="stitle" style="font-size:30px">⚡ Tez o'qi!</div>
      <p class="sub">60 soniya ichida iloji boricha ko'p so'z o'qi. So'zni to'g'ri aytsang — keyingisi chiqadi.</p>
      <div class="big-n">${S.best||0}</div><div class="counter">eng yaxshi natija</div>
      <p class="note">${poolOver?`${pool.length} ta so'z: ${LEVELS2[S.lv].name}`:`${pool.length} ta so'z: ${LESSONS[0].l} dan ${cap(LESSONS[upto])} gacha o'rganilgan harflardan`}</p>
      ${micAvailable()?`<div class="row"><button class="btn b-rose" id="go"><span class="big">🎤</span>Boshlash</button></div>`:`<p class="hint">🎤 Bu o'yin uchun mikrofon kerak. Sahifani Chrome'da oching.</p>`}
    </div>`;
  $("#bk").onclick=backFn;
  if(!micAvailable()) return;
  $("#go").onclick=()=>{
    let left=60, count=0, words=shuffle(pool), wi=0, used={idx:-1,len:0}, lastOkText="";
    app.innerHTML=`<div class="topbar"><button class="back" id="bk">■ To'xtatish</button><div style="flex:1"></div></div>
      <div class="panel"><div class="timer" id="tm">60</div>
      <div class="sent" id="wd" style="font-size:clamp(48px,13vw,84px)"></div>
      <div class="heard" id="heard"></div>
      <div class="counter" style="font-size:22px">✅ <span id="ct">0</span> ta so'z</div>
      <div class="row"><button class="btn b-ghost" id="sk">O'tkazish →</button></div></div>`;
    const cur=()=>words[wi%words.length];
    const showW=()=>{ $("#wd").innerHTML=color(cur()); $("#heard").textContent=""; };
    showW();
    const stop=listen((t,fin,idx)=>{
      if(left<=0) return;
      if(idx!==undefined){ if(idx<used.idx) return; if(idx===used.idx) t=t.slice(used.len); }
      else if(t===lastOkText) return;
      if(t.trim()) $("#heard").textContent=t;
      if(matches(t,cur())){ count++; $("#ct").textContent=count; ding(true);
        if(idx!==undefined) used={idx, len:(used.idx===idx?used.len:0)+t.length}; else lastOkText=t;
        wi++; showW(); }
    },(why)=>{ if(why==="denied"){ end(); toast("Mikrofonga ruxsat bering 🎙️",1600); } },true);
    $("#sk").onclick=()=>{ wi++; showW(); };
    const iv=setInterval(()=>{ left--; const tm=$("#tm"); if(tm) tm.textContent=left; if(left<=0) end(); },1000);
    let ended=false;
    function end(){ if(ended) return; ended=true; clearInterval(iv); stop();
      const rec=count>(S.best||0); if(rec) S.best=count; S.coins+=count*REWARD.fast; if(count&&S.wpm){ S.wpm.push({d:new Date().toISOString().slice(0,10),v:count}); S.wpm=S.wpm.slice(-30); } save(); renderCoins(); if(count) confetti();
      app.innerHTML=`<div class="panel done"><div style="font-size:72px">${rec?"🏆":"⚡"}</div>
        <div class="big-n">${count}</div><p class="sub">so'z / daqiqa ${rec?"— <b>yangi rekord!</b>":""}</p>
        <p class="sub">+${count*REWARD.fast} 🪙</p>
        <div class="row"><button class="btn b-rose" id="ag">↻ Yana</button><button class="btn b-ghost" id="mp">← Orqaga</button></div></div>`;
      $("#ag").onclick=()=>fast(poolOver,backFn); $("#mp").onclick=backFn; }
    $("#bk").onclick=()=>{ end(); };
    cleanup.push(()=>{ if(!ended){ ended=true; clearInterval(iv); stop(); } });
  };
}
