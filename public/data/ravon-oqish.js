// RAVON O'QISH — darajalar bo'yicha so'zlar (bo'g'inlab), zanjirlar, piramidalar, hikoyalar
const LEVELS2 = [
 {name:"1. Ochiq bo'g'inlar", hint:"o-na, bo-la",
  w:[["o-na","👩"],["o-ta","👨"],["bo-la","👦"],["bo-bo","👴"],["a-ka","🧑"],["u-ka","👶"],["o-pa","👧"],["a-ri","🐝"],["lo-la","🌷"],["ki-no","🎬"],["so-va","🦉"],["to-za","✨"],["mo-mo","👵"],["i-ni",""],["a-na",""],["bu-vi","👵"],["bu-va","👴"]]},
 {name:"2. Bir bo'g'inli so'zlar", hint:"non, gul, qush",
  w:[["non","🍞"],["nok","🍐"],["gul","🌸"],["qor","❄️"],["kun","☀️"],["uy","🏠"],["oy","🌙"],["tuz","🧂"],["suv","💧"],["sut","🥛"],["qo'l","✋"],["ko'z","👁️"],["it","🐶"],["ot","🐴"],["osh","🍲"],["qush","🐦"],["tog'","⛰️"],["bog'","🌳"],["fil","🐘"],["yer","🌍"],["choy","🍵"],["sher","🦁"]]},
 {name:"3. Ikki bo'g'inli so'zlar", hint:"ol-ma, ki-tob",
  w:[["ol-ma","🍎"],["a-nor","🍅"],["u-zum","🍇"],["qa-lam","✏️"],["ki-tob","📖"],["ba-liq","🐟"],["bu-lut","☁️"],["qu-yon","🐰"],["sab-zi","🥕"],["xo'-roz","🐓"],["mu-shuk","🐱"],["e-shik","🚪"],["si-gir","🐄"],["to-vuq","🐔"],["ar-cha","🎄"],["ol-cha","🍒"],["o'-rik","🍑"],["pi-yoz","🧅"],["li-mon","🍋"],["qo'-zi","🐑"],["ech-ki","🐐"],["an-jir",""]]},
 {name:"4. Uch bo'g'inli so'zlar", hint:"ka-pa-lak",
  w:[["mak-tab","🏫"],["daf-tar","📓"],["kap-tar","🕊️"],["ka-pa-lak","🦋"],["chu-mo-li","🐜"],["qur-ba-qa","🐸"],["ma-shi-na","🚗"],["tar-vuz","🍉"],["bod-ring","🥒"],["sa-mo-lyot","✈️"],["bo-la-lar","👫"],["gul-lar","💐"],["o'-yin-choq","🧸"],["muz-qay-moq","🍦"],["sho'r-va","🥣"],["ya-shil","🟢"],["qi-zil","🔴"],["sa-riq","🟡"],["pi-yo-la","🍵"],["dar-vo-za",""]]},
 {name:"5. Qo'shimchali so'zlar", hint:"ki-tob-lar, mak-tab-ga",
  w:[["o'-qi-tuv-chi","👩‍🏫"],["o'-quv-chi","🧒"],["kom-pyu-ter","💻"],["te-le-fon","📱"],["ve-lo-si-ped","🚲"],["ki-tob-lar","📚"],["ka-pa-lak-lar","🦋"],["o'-yin-choq-lar","🧸"],["do'st-la-rim","🤝"],["mak-tab-ga","🏫"],["kun-da-lik","📔"],["qa-lam-don","✏️"],["yul-duz-lar","✨"],["ba-hor-da","🌸"],["ma-shi-na-lar","🚗"],["bog'-cha-da","🏡"]]},
 {name:"6. Uzun so'zlar", hint:"o'-qi-tuv-chi-lar",
  w:[["o'-qi-tuv-chi-lar","👩‍🏫"],["kom-pyu-ter-da","💻"],["ve-lo-si-ped-da","🚲"],["mak-tab-dosh-lar","👫"],["O'z-be-kis-ton","🇺🇿"],["do'st-lash-dik","🤝"],["o'r-gan-dim","🎓"],["ku-tub-xo-na","📚"],["chi-roy-li","🌺"],["ki-tob-xon-lar","📖"],["ras-som-lar","🎨"],["qu-vo-nib","😊"],["o'-yin-gox-da","🛝"],["sa-yo-hat-chi","🧳"]]},
];
// Har qadamda faqat BITTA harf o'zgaradi
const CHAINS = [
 ["non","nok","tok","tol","tor","bor","bir"],
 ["qum","qul","qo'l","ko'l","kul","gul","gil"],
 ["ot","oy","uy","uch","och","osh","ish"],
 ["tun","tut","tuz","yuz","yoz","soz","sog'"],
 ["bosh","tosh","tush","qush","qosh","qor","bor"],
 ["kel","kul","kun","tun","tut","tuz","yuz"],
 ["sut","tut","tun","kun","kul","qul","qum"],
];
// O'qish piramidasi — gap qatorma-qator o'sadi
const PYRAMIDS = [
 ["Bola.","Bola o'qidi.","Bola kitob o'qidi.","Kichik bola kitob o'qidi.","Kichik bola qiziq kitob o'qidi."],
 ["Qush.","Qush uchdi.","Qush tez uchdi.","Kichik qush tez uchdi.","Kichik qush osmonga tez uchdi."],
 ["Gul.","Gul ochildi.","Bog'da gul ochildi.","Bog'da qizil gul ochildi.","Bahorda bog'da qizil gul ochildi."],
 ["Mushuk.","Mushuk uxladi.","Oq mushuk uxladi.","Oq mushuk gilamda uxladi.","Oq mushuk yumshoq gilamda uxladi."],
 ["Men.","Men yuguraman.","Men tez yuguraman.","Men hovlida tez yuguraman.","Men do'stim bilan hovlida tez yuguraman."],
 ["Quyosh.","Quyosh chiqdi.","Erta tongda quyosh chiqdi.","Erta tongda issiq quyosh chiqdi.","Erta tongda tog' ortidan issiq quyosh chiqdi."],
];
// Hikoyalar (bu platforma uchun yozilgan)
const STORIES = [
 {lv:1, t:"Ona va bola", e:"👩‍👦", x:"Bu ona. Bu bola. Ona bola bilan. Bola ona bilan. Ular uyda."},
 {lv:1, t:"Mushuk", e:"🐱", x:"Bizda mushuk bor. Mushuk oq. U sut ichdi. Mushuk to'ydi. Endi u uxlaydi."},
 {lv:2, t:"Bog'da", e:"🍎", x:"Bobom bog'da ishladi. Men ham bordim. Biz olma terdik. Olmalar qizil va shirin edi. Buvim olmadan murabbo qildi."},
 {lv:2, t:"Kuchukcha", e:"🐶", x:"Akamning kuchukchasi bor. Uning ismi Bo'ri. Bo'ri juda quvnoq. U to'p bilan o'ynaydi. Kechqurun akam unga suv beradi."},
 {lv:3, t:"Qorbobo", e:"⛄", x:"Qish keldi. Kecha ko'p qor yog'di. Hovli oppoq bo'ldi. Akam ikkalamiz qorbobo yasadik. Uning burni sabzidan, ko'zlari ko'mirdan bo'ldi. Qorbobo bizga qarab kulib turdi."},
 {lv:3, t:"Bozorda", e:"🧺", x:"Dam olish kuni onam bilan bozorga bordik. Bozorda meva ko'p edi. Onam uzum, anor va nok oldi. Men savatni ko'tarib yurdim. Uyga qaytganimizda hammamiz birga meva yedik."},
 {lv:4, t:"Mening kitobim", e:"📖", x:"Men kitob o'qishni yaxshi ko'raman. Har kuni kechqurun bitta ertak o'qiyman. Ertaklarda dono chol, mard bola va ayyor tulki bor. Kitob meni yangi dunyoga olib boradi. Endi men tez va to'g'ri o'qiyman."},
 {lv:5, t:"Do'stlar", e:"🤝", x:"Sardor va Jasur sinfdosh do'stlar. Ular har kuni maktabga birga boradi. Bir kuni Jasur qalamini uyda unutib qoldi. Sardor unga o'z qalamini berdi. Darsdan keyin ular futbol o'ynadi. Haqiqiy do'st qiyin paytda yordam beradi."},
 {lv:6, t:"Kichik bog'bon", e:"🌱", x:"Bahorda Malika hovlida kichik bog' qilmoqchi bo'ldi. U bobosidan urug' so'radi. Bobosi unga pomidor, bodring va gul urug'larini berdi. Malika har kuni ertalab nihollarga suv quydi. Yozda bog'da qizil pomidorlar pishdi. Malika o'zi yetishtirgan sabzavotlardan oilasi uchun salat tayyorladi."},
];
