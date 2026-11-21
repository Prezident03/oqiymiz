/* Alifbo — umumiy: holat, yordamchi funksiyalar */
// Sahifa serverdan (Cloudflare) ochilsa — AI ovoz avtomatik ulanadi
const ON_SERVER = /^https?:$/.test(location.protocol) && !(window.claude && window.claude.use);
const VOWELS = new Set(["a","o","i","u","o'","e"]);
const REWARD = { word:3, sent:4, quiz:1, game:1, fast:1, lesson:5 };
const SHOP = [["🐶",10],["🐱",10],["🐸",15],["🐼",20],["🦁",25],["🦊",25],["🐯",30],["🦄",40],["⚽",15],["🎨",15],["🚀",35],["🚂",30],["🏆",50],["👑",60],["🐉",80],["🌈",45],["🦋",20],["🐬",30]];

/* ---------- HOLAT ---------- */
let S = { coins:0, owned:[], stars:{}, stats:{words:0,sents:0,games:0,lessons:0}, best:0, unlockAll:false };
try{ const j=localStorage.getItem("alifbo_v1"); if(j) S=Object.assign(S,JSON.parse(j)); }catch(e){}
function save(){ try{ localStorage.setItem("alifbo_v1",JSON.stringify(S)); }catch(e){} }

/* ---------- YORDAMCHILAR ---------- */
const $=s=>document.querySelector(s), app=$("#app");
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a};
const sample=(a,n)=>shuffle(a).slice(0,n);
const plain=t=>t.replace(/-/g,"");
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function units(w){ const o=[]; const s=w; for(let i=0;i<s.length;){ const two=s.slice(i,i+2), lo=two.toLowerCase();
  if(lo==="o'"||lo==="g'"||lo==="sh"||lo==="ch"||lo==="ng"){o.push(two);i+=2;continue}
  o.push(s[i]);i++; } return o; }
function color(t){ return units(t).map(u=>{ const l=u.toLowerCase();
  if(VOWELS.has(l)) return `<span class="V">${u}</span>`;
  if(/^[a-z]|^[gs]h|^ch|^ng/i.test(u) && /[a-z]/i.test(u)) return `<span class="C">${u}</span>`;
  return `<span class="D">${u}</span>`; }).join(""); }
function renderCoins(){ $("#coinN").textContent=S.coins; }
let actx=null;
function ding(ok=true){ try{ actx=actx||new (window.AudioContext||window.webkitAudioContext)();
  (ok?[660,880,1320]:[300,220]).forEach((f,i)=>{const o=actx.createOscillator(),g=actx.createGain();o.type="triangle";o.frequency.value=f;o.connect(g);g.connect(actx.destination);
  const t=actx.currentTime+i*.11;g.gain.setValueAtTime(.16,t);g.gain.exponentialRampToValueAtTime(.001,t+.25);o.start(t);o.stop(t+.26);}); }catch(e){} }
const PRAISE=["Barakalla!","Zo'r!","Ofarin!","Qoyil!","Juda yaxshi!","Super!","Malades!"];
function toast(h,ms=1200){ const t=$("#toast"); t.innerHTML=h; t.classList.add("show"); clearTimeout(t._t); t._t=setTimeout(()=>t.classList.remove("show"),ms); }
function reward(n,el,quiet){
  S.coins+=n; save(); ding(true);
  if(!quiet) toast(`${PRAISE[Math.random()*PRAISE.length|0]}<div class="plus">+${n} 🪙</div>`);
  const r=(el||app).getBoundingClientRect(), c=$("#coins").getBoundingClientRect();
  for(let i=0;i<Math.min(n,5);i++){ const f=document.createElement("div"); f.className="fly"; f.textContent="🪙";
    f.style.left=(r.left+r.width/2)+"px"; f.style.top=(r.top+r.height/2)+"px"; document.body.appendChild(f);
    setTimeout(()=>{f.style.left=(c.left+10)+"px";f.style.top=(c.top+4)+"px";f.style.opacity=".3"},40+i*90);
    setTimeout(()=>{f.remove();renderCoins();const k=$("#coins");k.classList.remove("bump");void k.offsetWidth;k.classList.add("bump")},900+i*90); }
}
function confetti(){ const E=["🎉","⭐","🎈","✨","🪙","🌟"]; for(let i=0;i<34;i++){ const d=document.createElement("div"); d.className="conf";
  d.textContent=E[i%E.length]; d.style.left=Math.random()*100+"vw"; d.style.animationDuration=(1.8+Math.random()*1.8)+"s"; d.style.animationDelay=(Math.random()*.6)+"s";
  document.body.appendChild(d); setTimeout(()=>d.remove(),4500); } }
