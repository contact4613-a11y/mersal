import fs from 'node:fs';
import assert from 'node:assert/strict';
import {content, assets} from '../src/content.mjs';
let checks=0;
for(const lang of ['ar','en']){
 const file=lang==='ar'?'site/index.html':'site/en/index.html';
 const html=fs.readFileSync(file,'utf8');
 assert(html.includes(`lang="${lang}" dir="${lang==='ar'?'rtl':'ltr'}"`));checks++;
 assert.equal((html.match(/<h1[ >]/g)||[]).length,1);checks++;
 for(const word of [...content[lang].serviceNames,content[lang].other,...content[lang].coverage.flat(),'0500447325','info@mersal-cc.com']){assert(html.includes(word),`${file}: missing ${word}`);checks++;}
 for(const key of ['description','og:title','og:description','og:image','twitter:card']){assert(html.includes(`="${key}"`));checks++;}
 for(const attr of ['rel="canonical"','hreflang="ar"','hreflang="en"','type="application/ld+json"']){assert(html.includes(attr));checks++;}
 const data=JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);assert.equal(data.telephone,'+966500447325');checks++;
 assert(html.includes('https://www.track-trace.com/container'));checks++;
 assert(html.includes('id="quote-form"'));checks++;
 const ids=new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]));
 for(const m of html.matchAll(/href="#([^"]+)"/g)){assert(ids.has(m[1]),`Missing anchor ${m[1]}`);checks++;}
 for(const m of html.matchAll(/(?:src|href)="(\/assets\/[^"?#]+)"/g)){assert(fs.existsSync('site'+m[1]),`Missing local asset ${m[1]}`);checks++;}
 const c=JSON.parse(html.match(/<script type="application\/json" id="client-content">(.*?)<\/script>/s)[1]);assert.equal(c.names.length,6);checks++;
}
const routes=JSON.parse(fs.readFileSync('site/manus-routes.json','utf8'));assert.deepEqual(routes.routes.map(r=>r.path),['/','/en/','/car-tax.html','/en/car-tax.html']);checks++;
assert(fs.readFileSync('site/sitemap.xml','utf8').includes('/en/'));checks++;
assert(fs.readFileSync('site/robots.txt','utf8').includes('Allow: /'));checks++;
assert(assets.reels.length===3);checks++;
console.log(`${checks} checks passed: bilingual initial HTML, all services & gateways, metadata, contact, anchor links, local media & routes.`);
