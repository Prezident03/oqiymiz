const fs=require('fs');// Tekshiradi: har bir darsda faqat shu paytgacha o'rganilgan harflar ishlatilganmi
const path=require('path');
eval(fs.readFileSync(path.join(__dirname,'../public/data/alifbe-darslar.js'),'utf8')+';global.LESSONS=LESSONS');
eval(fs.readFileSync(path.join(__dirname,'../public/data/ravon-oqish.js'),'utf8')+';global.CHAINS=CHAINS');
function units(w){w=w.toLowerCase().replace(/[^a-z'\s-]/g,'').replace(/[-\s]/g,'');const o=[];for(let i=0;i<w.length;){const two=w.slice(i,i+2);
 if(["o'","g'"].includes(two)){o.push(two);i+=2;continue}
 if(["sh","ch","ng"].includes(two)){o.push(two);i+=2;continue}
 o.push(w[i]);i++;}return o;}
const learned=new Set();let bad=0;
for(const L of LESSONS){const k=L.l.toLowerCase();learned.add(k);
 const items=[...L.syl,...L.w.map(x=>x[0]),...L.s];
 for(const it of items){ for(const u of units(it)){
   let ok=learned.has(u);
   if(!ok && ["sh","ch","ng"].includes(u)) ok=[...u].every(c=>learned.has(c)) && false;
   if(!ok){ // digraph not learned -> letters individually? book doesn't allow; e.g. 'ng' in de-ngiz before Ng lesson is not allowed
     console.log(`❌ ${L.l}: "${it}" — "${u}" hali o'rganilmagan`);bad++;}
 }}
 // non-ascii check
 for(const it of [...items,...L.hear.map(h=>h[0])]) if(/[^\x00-\x7F]/.test(it.replace(/[ʻʼ]/g,''))) {console.log('non-ascii',L.l,it);bad++;}
 if(!L.w.some(x=>units(x[0]).includes(k)) && L.l!=="'") console.log('⚠️ no word with letter',L.l);
}
// So'z zanjirlari: har qadamda faqat bitta harf o'zgarishi kerak
for(const c of CHAINS) for(let i=1;i<c.length;i++){ const a=units(c[i-1]),b=units(c[i]);
  const d=a.length===b.length?a.filter((x,k)=>x!==b[k]).length:9; if(d!==1){ console.log(`❌ zanjir: ${c[i-1]} → ${c[i]}`); bad++; } }
console.log(bad?`❌ Jami xato: ${bad}`:`✅ Hammasi to'g'ri — ${LESSONS.length} ta dars, ${CHAINS.length} ta zanjir`);
process.exit(bad?1:0);
