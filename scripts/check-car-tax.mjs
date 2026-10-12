import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { content } from '../src/content.mjs';
import { carTaxAppUrl, carTaxContent, carTaxImage } from '../src/car-tax-integration.mjs';
let count = 0;
const check = (condition,message) => {assert(condition,message);count++;};
const code = fs.readFileSync('src/car-tax-page.js','utf8');
const element = () => ({handlers:{},attrs:{},dataset:{},focused:0,
  addEventListener(type,fn){this.handlers[type]=fn;},
  getAttribute(key){return this.attrs[key]??null;},
  setAttribute(key,value){this.attrs[key]=value;},
  focus(){this.focused++;},
  hasAttribute(key){return Object.hasOwn(this.attrs,key);},
  classList:{values:new Set(),add(key){this.values.add(key);},remove(key){this.values.delete(key);},toggle(key,enabled){if(enabled)this.add(key);else this.remove(key);},contains(key){return this.values.has(key);}}
});
for (const lang of ['ar','en']) {
  const home = fs.readFileSync(lang==='ar'?'site/index.html':'site/en/index.html','utf8');
  const route = lang==='ar'?'/car-tax.html':'/en/car-tax.html';
  const page = fs.readFileSync('site'+route,'utf8');
  const t = carTaxContent[lang];
  const main = home.match(/<main id="main">([\s\S]*?)<\/main>/)[1];
  check(home.includes('class="car-tax-nav"'));
  check(home.includes('class="car-tax-mobile"'));
  check(!home.includes('id="car-import"'));
  check(main.includes(t.title));
  const card=main.match(/<a class="car-tax-frame-card"[\s\S]*?<\/a>/)[0];
  check(card.includes('id="car-calculator-card"'));
  check(card.includes('data-open-car-tax'));
  check(card.includes('data-car-tax-motion'));
  const hero=main.match(/<section class="hero"[\s\S]*?<\/section>/)[0];
  const services=main.match(/<section class="section services"[\s\S]*?<\/section>/)[0];
  check(!hero.includes('car-calculator-card'));
  check(services.includes(card));
  check(services.includes('class="services-frame-intro"'));
  check(hero.includes('<h1>'+content[lang].heroTitle.replace('\n','<br><em>')+'</em></h1>'));
  check(!hero.includes(lang==='ar'?'أعمالك بلا حدود.':'Business without borders.'));
  check(card.includes('src="'+carTaxImage+'"'));
  check(card.includes(t.alt));
  check(!card.includes('<iframe'));
  check(!main.includes('car-tax-popup-app'));
  check(home.includes('href="'+route+'" data-open-car-tax'));
  check((home.match(/data-open-car-tax/g)||[]).length===3);
  check(home.includes('aria-haspopup="dialog" aria-controls="car-tax-dialog"'));
  const popup = home.match(/<dialog class="car-tax-dialog"[\s\S]*?<\/dialog>/)[0];
  check(!popup.includes('<dialog class="car-tax-dialog" open'));
  check(popup.includes('aria-labelledby="car-tax-dialog-title"'));
  check(popup.includes(t.title));
  check(popup.includes('src="'+carTaxImage+'"'));
  const iframe = popup.match(/<iframe[^>]+>/)[0];
  check(iframe.includes('data-src="'+carTaxAppUrl+'"'));
  check(!/\ssrc=/.test(iframe));
  check(popup.includes('data-close-car-tax'));
  check(popup.includes('autofocus'));
  for(const text of [t.registration,t.noResult,t.activation,t.dependency,t.direct])check(popup.includes(text));
  if(lang==='en')check(popup.includes(t.language));
  check(home.includes('<script defer src="/assets/car-tax-page.js"></script>'));

  // Existing standalone routes remain functional as no-JS and historical-link fallbacks.
  check(page.includes('lang="'+lang+'" dir="'+(lang==='ar'?'rtl':'ltr')+'"'));
  check((page.match(/<h1>/g)||[]).length===1);
  check(page.includes('<h1>'+t.title+'</h1>'));
  check(page.includes('id="car-tax-app"'));
  check(page.includes('src="'+carTaxAppUrl+'"'));
  for(const text of [t.registration,t.noResult,t.activation,t.dependency])check(page.includes(text));
  check(page.includes('referrerpolicy="no-referrer"'));
  check(page.includes('href="'+carTaxAppUrl+'" target="_blank" rel="noopener noreferrer"'));
  for (const tag of ['description','og:title','og:description','og:url','og:image','twitter:card'])check(page.includes('="'+tag+'"'));
  for (const attr of ['rel="canonical"','hreflang="ar"','hreflang="en"','type="application/ld+json"'])check(page.includes(attr));
  check(!page.includes('type="email"'));
  check(!page.includes('localStorage'));
  check(!page.includes('MASAR_ADMIN_EMAIL'));
  for(const html of [home,page]){
    const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
    check(ids.length===new Set(ids).size);
    for(const match of html.matchAll(/(?:src|href)="(\/assets\/[^"?#]+)"/g))check(fs.existsSync('site'+match[1]));
    for(const match of html.matchAll(/href="#([^"]+)"/g))check(ids.includes(match[1]));
  }

  const standaloneFrame=element();
  const standaloneStatus={textContent:t.loading,dataset:{loadedText:t.loaded}};
  vm.runInNewContext(code,{document:{querySelectorAll:()=>[],getElementById:id=>({'car-tax-app':standaloneFrame,'car-tax-load-status':standaloneStatus}[id]??null)}});
  standaloneFrame.handlers.load();check(standaloneStatus.textContent===t.loaded);

  const frame=element();frame.dataset.src=carTaxAppUrl;
  const status={textContent:t.loading,dataset:{loadedText:t.loaded}};
  const close=element(), link=element(), mobileLink=element(), cardLink=element();
  const dialog=element();dialog.open=false;cardLink.attrs['data-car-tax-motion']='';
  let reduced=false;const timers=[];
  const window={matchMedia:()=>({matches:reduced})};const setTimeout=fn=>timers.push(fn);
  dialog.showModal=()=>{dialog.open=true;};
  dialog.close=()=>{dialog.open=false;dialog.handlers.close();};
  dialog.querySelector=()=>close;
  const mobileNav={hidden:true,contains:el=>el===mobileLink};
  const style={overflow:'auto'};
  const document={documentElement:{style},
    getElementById:id=>({'car-tax-dialog':dialog,'car-tax-popup-app':frame,'car-tax-popup-status':status,'mobile-nav':mobileNav}[id]??null),
    querySelectorAll:selector=>selector==='img[data-fallback]'?[]:[link,mobileLink,cardLink],querySelector:()=>link};
  vm.runInNewContext(code,{document,window,setTimeout});
  check(!frame.getAttribute('src'));check(!dialog.open);
  frame.handlers.load();check(status.textContent===t.loading);
  let prevented=0;
  const click={preventDefault(){prevented++;}};
  link.handlers.click(click);check(dialog.open);check(prevented===1);
  check(style.overflow==='hidden');check(frame.getAttribute('src')===carTaxAppUrl);check(close.focused===1);
  frame.handlers.load();check(status.textContent===t.loaded);
  close.handlers.click();check(!dialog.open);check(style.overflow==='auto');check(link.focused===1);
  let loads=0;frame.setAttribute=()=>{loads++;};
  mobileLink.handlers.click(click);check(dialog.open);check(loads===0);
  let canceled=false;
  dialog.handlers.cancel({preventDefault(){canceled=true;}});
  check(canceled);check(!dialog.open);check(style.overflow==='auto');check(link.focused===2);
  link.handlers.click({...click,ctrlKey:true});check(!dialog.open);check(prevented===2);
  cardLink.handlers.click(click);check(!dialog.open);check(cardLink.classList.contains('is-calculator-pressed'));check(timers.length===1);
  cardLink.handlers.click(click);check(timers.length===1);
  timers.shift()();check(dialog.open);check(!cardLink.classList.contains('is-calculator-pressed'));check(dialog.classList.contains('is-calculator-entering'));
  close.handlers.click();check(!dialog.classList.contains('is-calculator-entering'));check(cardLink.focused===1);check(loads===0);
  reduced=true;cardLink.handlers.click(click);check(dialog.open);check(timers.length===0);check(!dialog.classList.contains('is-calculator-entering'));close.handlers.click();check(cardLink.focused===2);
  dialog.showModal=undefined;link.handlers.click(click);check(!dialog.open);check(prevented===5);
}
const brokenImage=element();brokenImage.complete=true;brokenImage.naturalWidth=0;brokenImage.dataset.fallback='/assets/car-tax-image.webp';
vm.runInNewContext(code,{document:{querySelectorAll:()=>[brokenImage],getElementById:()=>null}});
check(brokenImage.src==='/assets/car-tax-image.webp');check(!brokenImage.dataset.fallback);brokenImage.handlers.error();check(brokenImage.src==='/assets/car-tax-image.webp');
const css=fs.readFileSync('src/styles.css','utf8');
check(css.includes('width:340px'));check(css.includes('@keyframes calculator-float'));check(css.includes('@keyframes calculator-press'));check(css.includes('@media(prefers-reduced-motion:reduce)'));check(!css.includes('.car-tax-hero-card'));
check(content.ar.heroTitle==='الاستيراد قرارك\nومرسال مستشارك');
const routes=JSON.parse(fs.readFileSync('site/manus-routes.json','utf8')).routes.map(x=>x.path);
assert.deepEqual(routes,['/','/en/','/car-tax.html','/en/car-tax.html']);count++;
for(const route of routes)check(fs.readFileSync('site/sitemap.xml','utf8').includes(route+'</loc>'));
console.log(count+' car-tax popup assertions passed: compact card in second content frame with click motion and reduced-motion handling, no home calculator iframe, bilingual triggers, deferred load, close/Escape, focus restoration and standalone fallback. No external submissions.');
