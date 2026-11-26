/* Alifbo — Telegram Mini App integratsiyasi
   Sahifa Telegram ichida ochilganda ishlaydi, oddiy brauzerda hech narsa qilmaydi. */
const TG = (window.Telegram && Telegram.WebApp && Telegram.WebApp.initData) ? Telegram.WebApp : null;

if (TG) {
  document.documentElement.classList.add("in-tg");
  try { TG.ready(); TG.expand(); } catch (e) {}
  try { TG.setHeaderColor("#EAF6FF"); TG.setBackgroundColor("#EAF6FF"); } catch (e) {}
  // O'yin paytida pastga surish ilovani yopib yubormasin
  try { if (TG.isVersionAtLeast("7.7")) TG.disableVerticalSwipes(); } catch (e) {}

  /* --- Tebranish (haptic): to'g'ri/noto'g'ri javobda --- */
  const _ding = ding;
  ding = function (ok = true) {
    _ding(ok);
    try { TG.HapticFeedback.notificationOccurred(ok ? "success" : "error"); } catch (e) {}
  };

  /* --- Telegram "Orqaga" tugmasi: sahifadagi ← tugmasini bosadi --- */
  const BB = TG.BackButton;
  const syncBack = () => {
    try { document.querySelector("#bk") ? BB.show() : BB.hide(); } catch (e) {}
    // Bosh sahifada bolaning ismi bilan salomlashamiz
    const g = document.querySelector(".greet"), u = TG.initDataUnsafe && TG.initDataUnsafe.user;
    if (g && u && u.first_name && !g.dataset.tg) { g.dataset.tg = 1; g.textContent = `Salom, ${u.first_name}! 👋`; }
  };
  try { BB.onClick(() => { const b = document.querySelector("#bk"); b ? b.click() : home(); }); } catch (e) {}
  new MutationObserver(syncBack).observe(app, { childList: true });

  /* --- Natijalarni Telegram bulutida saqlash (telefon almashsa ham yo'qolmaydi) --- */
  const CS = TG.CloudStorage, CKEY = "alifbo_v1";
  const score = s => { const st = s.stats || {};
    return Object.values(s.stars || {}).reduce((a, b) => a + (b || 0), 0) * 1000
      + (st.words || 0) + (st.sents || 0) + (st.games || 0) + (st.lessons || 0) + (s.owned || []).length; };
  let cloudOk = false, pushT = null;
  const push = () => { if (!cloudOk) return; clearTimeout(pushT);
    pushT = setTimeout(() => { try { CS.setItem(CKEY, JSON.stringify(S), () => {}); } catch (e) {} }, 800); };
  const _save = save;
  save = function () { _save(); push(); };

  if (CS && TG.isVersionAtLeast("6.9")) {
    try {
      CS.getItem(CKEY, (err, val) => {
        cloudOk = !err;
        if (err) return;
        let remote = null; try { remote = val ? JSON.parse(val) : null; } catch (e) {}
        if (remote && score(remote) > score(S)) {
          S = Object.assign(S, remote); _save(); renderCoins();
          if (!document.querySelector("#bk")) (S.mode === "ravon" ? ravon : home)();
        } else push();
      });
    } catch (e) {}
  }
  syncBack();
}
