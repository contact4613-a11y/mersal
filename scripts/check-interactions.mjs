import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
let total=0;
for(const lang of ['ar','en']){
 const html=fs.readFileSync(lang==='ar'?'site/index.html':'site/en/index.html','utf8');
 const client=html.match(/<script type="application\/json" id="client-content">(.*?)<\/script>/s)[1];
 const node=(value='')=>({value,hidden:true,dataset:{},attrs:{},events:{},textContent:'',style:{},addEventListener(type,fn){this.events[type]=fn;},getAttribute(k){return this.attrs[k];},setAttribute(k,v){this.attrs[k]=v;},setCustomValidity(v){this.error=v;},reportValidity(){return !this.error;},getBoundingClientRect(){return {left:0,top:0,right:500,bottom:500};},showModal(){this.open=true;},close(){this.open=false;this.events.close?.();}});
 const menu=node(),mobile=node(),track=node(),videoDialog=node(),film=node(),container=node(),trackStatus=node(),trackLink=node(),form=node(),status=node();
 const fields=Object.fromEntries(['name','phone','email','service','details'].map(k=>[k,node()]));
 film.play=()=>Promise.resolve();film.pause=()=>{film.paused=true;};videoDialog.querySelector=()=>film;
 mobile.querySelectorAll=()=>[];form.querySelector=()=>status;form.querySelectorAll=()=>Object.values(fields);
 form.reportValidity=()=>Object.entries(fields).every(([k,f])=>!f.error&&(k==='email'||!!f.value));
 const openTrack=node(),openFilm=node();
 const dataService=Array.from({length:6},(_,i)=>({...node(),dataset:{service:String(i)}}));
 const ids={'client-content':{textContent:client},'mobile-nav':mobile,'tracking-dialog':track,'video-dialog':videoDialog,'container-number':container,'tracking-link':trackLink,'quote-form':form,...fields};
 const document={body:{dataset:{lang}},getElementById:id=>ids[id],querySelector:s=>({'.menu-toggle':menu,'.tracking-status':trackStatus}[s]),querySelectorAll:s=>({'[data-open-tracking]':[openTrack],'[data-open-film]':[openFilm],'[data-close-dialog]':[],'dialog':[track,videoDialog],'[data-service]':dataService}[s]||[])};
 let opened=[],copied=[];
 const window={location:{href:''},open:(...args)=>opened.push(args),matchMedia:()=>({matches:false})};
 class TestFormData{entries(){return Object.entries(fields).map(([k,f])=>[k,f.value]);}}
 const navigator={clipboard:{writeText:async x=>{copied.push(x);}}};
 vm.runInNewContext(fs.readFileSync('src/app.js','utf8'),{document,window,navigator,FormData:TestFormData});
 menu.events.click();assert.equal(mobile.hidden,false);assert.equal(menu.attrs['aria-expanded'],'true');total+=2;
 menu.events.click();assert.equal(mobile.hidden,true);total++;
 openTrack.events.click();assert(track.open);total++;
 openFilm.events.click();assert(videoDialog.open);videoDialog.close();assert(film.paused);total+=2;
 dataService[5].events.click();assert.equal(fields.service.value,'5');total++;
 container.value='bad';let blocked=false;trackLink.events.click({preventDefault(){blocked=true;}});assert(blocked);assert.equal(trackStatus.textContent,JSON.parse(client).trackInvalid);total+=2;
 container.value='MSCU1234567';container.error='';blocked=false;trackLink.events.click({preventDefault(){blocked=true;}});await Promise.resolve();assert.equal(blocked,false);assert.deepEqual(copied,['MSCU1234567']);total+=2;
 container.value='';blocked=false;trackLink.events.click({preventDefault(){blocked=true;}});assert.equal(blocked,false);total++;
 Object.entries({name:'شركة اختبار',phone:'0500447325',email:'test@example.com',service:'2',details:'حاوية اختبار من جدة إلى الرياض'}).forEach(([k,v])=>{fields[k].value=v;fields[k].error='';});
 form.events.submit({preventDefault(){},submitter:{value:''}});assert.equal(opened.length,1);const url=new URL(opened[0][0]);assert.equal(url.host,'wa.me');assert.equal(url.pathname,'/966500447325');assert(url.searchParams.get('text').includes(JSON.parse(client).names[2]));assert(url.searchParams.get('text').includes('test@example.com'));total+=5;
 form.events.submit({preventDefault(){},submitter:{value:'email'}});assert(window.location.href.startsWith('mailto:info@mersal-cc.com?subject='));assert(decodeURIComponent(window.location.href).includes('شركة اختبار'));total+=2;
 fields.name.value='   ';form.events.submit({preventDefault(){},submitter:{value:''}});assert.equal(opened.length,1);assert.equal(status.textContent,JSON.parse(client).formInvalid);total+=2;
 fields.name.value='شركة';fields.phone.value='invalid';form.events.submit({preventDefault(){},submitter:{value:''}});assert.equal(opened.length,1);total++;
 console.log(lang,': interaction tests passed without external navigation or submissions.');
}
console.log(total+' interaction assertions passed.');
