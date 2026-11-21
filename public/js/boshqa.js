/* Alifbo — do'kon, ota-onalar, sozlamalar */
/* ---------- DO'KON ---------- */
function shop(){
  clean();
  app.innerHTML=`<div class="topbar"><button class="back" id="bk">← Xarita</button></div>
    <div class="panel"><div class="stitle" style="font-size:28px">🎁 Sovg'alar do'koni</div>
    <p class="sub">Mening kolleksiyam:</p>
    <div class="album">${S.owned.length?S.owned.join(" "):`<span class="note">Hali bo'sh — dars o'tib tanga yig'!</span>`}</div>
    <div class="shop">${SHOP.map(([e,c])=>{ const own=S.owned.includes(e);
      return `<div class="item ${own?"own":""}"><div class="e">${e}</div>${own?`<div style="font-weight:900;color:var(--mint-d);margin-top:8px">Meniki ✓</div>`:`<button class="btn ${S.coins>=c?"b-mint":"b-ghost"}" data-e="${e}" data-c="${c}">🪙 ${c}</button>`}</div>`; }).join("")}</div></div>`;
  $("#bk").onclick=home;
  app.querySelectorAll("[data-e]").forEach(b=>b.onclick=()=>{ const c=+b.dataset.c;
    if(S.coins<c){ ding(false); toast(`Yana ${c-S.coins} ta tanga kerak 💪`,1300); return; }
    S.coins-=c; S.owned.push(b.dataset.e); save(); renderCoins(); ding(true); confetti(); toast(`<div style="font-size:64px">${b.dataset.e}</div>Endi seniki!`,1400); shop(); });
}

/* ---------- OTA-ONALAR ---------- */
function parents(){
  clean();
  const done=Object.values(S.stars).filter(x=>x>0).length;
  app.innerHTML=`<div class="topbar"><button class="back" id="bk">← Xarita</button></div>
    <div class="panel"><div class="stitle" style="font-size:28px">👪 Ota-onalar uchun</div>
    <p class="note">Platforma 1-sinf "Alifbe" darsligi tartibida tuzilgan: har bir darsda faqat shu paytgacha o'rganilgan harflardan foydalaniladi.</p>
    <div><span class="stat">📚 ${done} / ${LESSONS.length} harf</span><span class="stat">🗣️ ${S.stats.words} so'z o'qildi</span>
      <span class="stat">📝 ${S.stats.sents} gap o'qildi</span><span class="stat">🎮 ${S.stats.games} o'yin</span><span class="stat">⚡ Rekord: ${S.best||0} so'z/daqiqa</span></div>
    <table class="prog" style="margin-top:12px">${LESSONS.map((L,k)=>`<tr><td><b class="${kind(L)==="v"?"V":"C"}" style="font:800 22px 'Baloo 2'">${pair(L)}</b></td>
      <td>${k+1}-dars</td><td>${S.stars[k]?"⭐".repeat(S.stars[k]):unlocked(k)?"ochiq":"🔒"}</td></tr>`).join("")}</table>
    <div class="row">
      <button class="btn ${S.unlockAll?"b-mint":"b-ghost"}" id="ua">${S.unlockAll?"🔓 Hamma darslar ochiq":"🔒 Hamma darslarni ochish"}</button>
      <button class="btn b-ghost" id="rs">♻️ Natijalarni tozalash</button>
    </div>
    <p class="note" id="rsn"></p></div>`;
  $("#bk").onclick=home;
  $("#ua").onclick=()=>{ S.unlockAll=!S.unlockAll; save(); parents(); };
  let sure=false; $("#rs").onclick=()=>{ if(!sure){ sure=true; $("#rsn").textContent="Ishonchingiz komilmi? Yana bir marta bosing — barcha yulduz va tangalar o'chadi."; return; }
    S={coins:0,owned:[],stars:{},stats:{words:0,sents:0,games:0,lessons:0},best:0,unlockAll:false}; save(); renderCoins(); S.mode==="ravon"?ravon():home(); };
}

/* ---------- SOZLAMALAR (faqat serversiz ochilganda) ---------- */
function settings(){
  clean(); const P=CFG.provider;
  app.innerHTML=`<div class="topbar"><button class="back" id="bk">← Xarita</button></div>
    <div class="panel"><div class="stitle">⚙️ AI ovoz sozlamalari</div>
    <label class="field"><b>Xizmat</b><select id="pv"><option value="aisha" ${P==="aisha"?"selected":""}>VoiceLab (Cloudflare server orqali)</option><option value="azure" ${P==="azure"?"selected":""}>Microsoft Azure</option></select></label>
    <div id="fa" class="${P==="aisha"?"":"hidden"}"><label class="field"><b>Server manzili</b><input id="ak" placeholder="https://alifbo.....workers.dev" value="${CFG.aProxy}"></label></div>
    <div id="fz" class="${P==="azure"?"":"hidden"}"><label class="field"><b>Azure kaliti</b><input id="k" type="password" value="${CFG.key}"></label><label class="field"><b>Hudud</b><input id="r" value="${CFG.region}"></label></div>
    <div class="row"><button class="btn b-mint" id="sv">💾 Saqlash va sinash</button></div><div class="heard" id="st"></div></div>`;
  $("#bk").onclick=home;
  $("#pv").onchange=e=>{ $("#fa").classList.toggle("hidden",e.target.value!=="aisha"); $("#fz").classList.toggle("hidden",e.target.value!=="azure"); };
  $("#sv").onclick=async()=>{ CFG.provider=$("#pv").value; CFG.aProxy=$("#ak").value.trim(); CFG.key=$("#k").value.trim(); CFG.region=$("#r").value.trim().toLowerCase(); saveCfg(); aiCache.clear();
    if(!aiReady()){ $("#st").textContent="Maydonlarni to'ldiring"; return; } $("#st").textContent="Tekshirilmoqda...";
    try{ const u=await aiAudio("Salom! Keling, birga o'qiymiz."); $("#st").textContent="✅ Ishlayapti!"; curAudio=new Audio(u); curAudio.play().catch(()=>{}); }catch(e){ $("#st").textContent="❌ "+errText(String(e.message||e)); } };
}
$("#gear").onclick=settings;
if(ON_SERVER) $("#gear").classList.add("hidden");
