/* Alifbo — ishga tushirish */
/* ---------- ISHGA TUSHIRISH ---------- */
renderCoins(); home();
(async()=>{ if(!inClaude) return;
  try{ const d=await claude.use("dictation"); if(d){ dict=d; d.onPartial(({text})=>dictHandler&&dictHandler(text,false)); d.onFinal(({text})=>dictHandler&&dictHandler(text,true)); } }catch(e){}
})();
