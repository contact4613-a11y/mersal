import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { freightContent } from '../src/freight-content.mjs';
import { containerChoices, isRefrigerated, validateFreight, buildFreightMessage } from '../src/freight-core.js';
let total=0;
const check = (v,m) => { assert(v,m); total++; };
const eq = (a,b) => { assert.deepEqual(a,b); total++; };
const base = {
  mode:'sea',name:'شركة اختبار',phone:'0500447325',email:'test@example.com',products:'منتجات غذائية',
  departurePort:'جدة',arrivalPort:'دبي',container:'40-dry',quantity:'10',weight:'12000',seaTemperature:'-18',
  departureAirport:'RUH',arrivalAirport:'DXB',condition:'dry',airTemperature:'4',count:'3',length:'80',width:'50',height:'40'
};
const seaFields=['departurePort','arrivalPort','container','quantity','seaTemperature'];
const airFields=['departureAirport','arrivalAirport','condition','count','length','width','height','airTemperature'];
for (const lang of ['ar','en']) {
  const t=freightContent[lang];
  const html=fs.readFileSync(lang==='ar'?'site/index.html':'site/en/index.html','utf8');
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  eq(ids.length,new Set(ids).size);
  for(const key of ['freight-form','freight-quote','freight-sea-panel','freight-air-panel',...Object.keys(base).map(n=>'freight-'+n)]) check(ids.includes(key),'Missing '+key);
  check(html.includes('data-freight-request="sea"'));check(html.includes('src="/assets/freight.js"'));
  const client=JSON.parse(html.match(/<script type="application\/json" id="freight-content">(.*?)<\/script>/s)[1]);
  eq(client,t);eq(Object.keys(t.containers),containerChoices);
  check(/id="freight-air-panel"[^>]*hidden disabled/.test(html));
  for (const mode of ['sea','air']) check(new RegExp('id="freight-'+mode+'Temperature"[^>]*disabled').test(html));
  for (const name of ['length','width','height','count','weight','quantity']) check(html.includes('name="'+name+'" type="number"'));
  for(const choice of containerChoices) {
    const values={...base,container:choice,seaTemperature:'0'};
    eq(validateFreight(values,t),{});
    const cooled=choice.endsWith('-reefer');eq(isRefrigerated('sea',values),cooled);
    const out=buildFreightMessage(values,t).message;
    check(out.includes(t.containers[choice]));check(out.includes(t.departurePort+': جدة'));
    check(!out.includes(t.departureAirport));check(!out.includes(t.length));
    eq(out.includes(t.temperature),cooled);
    if(cooled) check(out.includes(t.temperature+': 0'));
  }
  for (const temperature of ['-18','0','4.5']) eq(validateFreight({...base,container:'20-reefer',seaTemperature:temperature},t),{});
  for (const temperature of ['','bad','Infinity']) check(validateFreight({...base,container:'40hc-reefer',seaTemperature:temperature},t).seaTemperature);
  for (const name of ['quantity','weight']) for(const value of ['0','-1','','Infinity','text']) check(validateFreight({...base,[name]:value},t)[name]);
  check(validateFreight({...base,container:'invalid'},t).container);
  check(validateFreight({...base,departurePort:'   '},t).departurePort);
  check(validateFreight({...base,phone:'invalid'},t).phone);
  eq(validateFreight({...base,phone:'٠٥٠٠٤٤٧٣٢٥'},t),{});
  for(const condition of ['dry','reefer']) {
    const values={...base,mode:'air',condition,airTemperature:'0'};
    eq(validateFreight(values,t),{});
    const out=buildFreightMessage(values,t).message;
    check(out.includes(t.departureAirport+': RUH'));check(out.includes(t.arrivalAirport+': DXB'));
    check(out.includes(t.conditions[condition]));check(out.includes(t.count+': 3'));
    for(const n of ['length','width','height']) check(out.includes(t[n]+': '+base[n]));
    check(!out.includes(t.departurePort));check(!out.includes(t.containerSize));check(!out.includes(t.quantity+':'));
    eq(out.includes(t.temperature),condition==='reefer');
  }
  for(const n of ['length','width','height']) for(const v of ['0','-2','']) check(validateFreight({...base,mode:'air',[n]:v},t)[n]);
  for(const count of ['0','-1','1.5','']) check(validateFreight({...base,mode:'air',count},t).count);
  check(validateFreight({...base,mode:'air',condition:'reefer',airTemperature:''},t).airTemperature);
  eq(validateFreight({...base,mode:'air',condition:'reefer',airTemperature:'-20'},t),{});

  // اختبارات وحدة للواجهة دون تصفح أو إرسال خارجي.
  const node = () => ({value:'',hidden:false,disabled:false,required:false,attrs:{},dataset:{},events:{},textContent:'',error:'',
    addEventListener(k,fn){this.events[k]=fn;},getAttribute(k){return this.attrs[k];},setAttribute(k,v){this.attrs[k]=v;},setCustomValidity(v){this.error=v;},focus(){this.focused=true;}});
  const fields=Object.fromEntries(Object.entries(base).map(([n,v])=>[n,Object.assign(node(),{value:v})]));
  const form=node(),status=node(),seaPanel=node(),airPanel=node(),seaCooling=node(),airCooling=node();
  const tabs=['sea','air'].map(mode=>Object.assign(node(),{dataset:{freightMode:mode},attrs:{'aria-controls':'freight-'+mode+'-panel'}}));
  const link=Object.assign(node(),{dataset:{freightRequest:'sea'}});
  const elements={'freight-form':form,'freight-content':{textContent:JSON.stringify(t)},'freight-sea-panel':seaPanel,'freight-air-panel':airPanel,'freight-sea-cooling':seaCooling,'freight-air-cooling':airCooling,...Object.fromEntries(Object.entries(fields).map(([n,f])=>['freight-'+n,f]))};
  const enabled = n => !fields[n].disabled && !(seaFields.includes(n)&&seaPanel.disabled) && !(airFields.includes(n)&&airPanel.disabled);
  form.querySelector=()=>status;form.querySelectorAll=()=>Object.values(fields);
  form.reportValidity=()=>Object.entries(fields).every(([n,f])=>!enabled(n)||!f.error);
  const document={documentElement:{dir:lang==='ar'?'rtl':'ltr'},getElementById:id=>elements[id],querySelectorAll:s=>s==='[data-freight-mode]'?tabs:s==='[data-freight-request]'?[link]:[]};
  const opened=[];const window={location:{href:''},open:(...args)=>opened.push(args)};
  class UnitFormData {entries(){return Object.entries(fields).filter(([n])=>enabled(n)).map(([n,f])=>[n,f.value]);}}
  const script=fs.readFileSync('src/freight.js','utf8').replace(/^import[^\n]+\n/,'');
  vm.runInNewContext(script,{document,window,FormData:UnitFormData,isRefrigerated,validateFreight,buildFreightMessage});
  eq(fields.mode.value,'sea');eq(seaPanel.disabled,false);eq(airPanel.disabled,true);eq(airPanel.hidden,true);
  eq(seaCooling.hidden,true);eq(fields.seaTemperature.disabled,true);eq(fields.seaTemperature.required,false);
  fields.container.value='40hc-reefer';fields.container.events.change();
  eq(seaCooling.hidden,false);eq(fields.seaTemperature.disabled,false);eq(fields.seaTemperature.required,true);
  fields.seaTemperature.value='0';
  const submit = value => form.events.submit({preventDefault(){},submitter:{value}});
  submit('');eq(opened.length,1);
  const url=new URL(opened[0][0]);eq(url.host,'wa.me');eq(url.pathname,'/966500447325');check(url.searchParams.get('text').includes(t.temperature+': 0'));
  eq(status.textContent,t.ready);
  fields.container.value='20-dry';fields.container.events.change();
  eq(seaCooling.hidden,true);eq(fields.seaTemperature.disabled,true);eq(fields.seaTemperature.required,false);
  submit('email');check(window.location.href.startsWith('mailto:info@mersal-cc.com?subject='));check(!decodeURIComponent(window.location.href).includes(t.temperature));
  tabs[1].events.click();eq(fields.mode.value,'air');eq(seaPanel.disabled,true);eq(seaPanel.hidden,true);eq(airPanel.disabled,false);eq(tabs[1].attrs['aria-selected'],'true');
  fields.condition.value='reefer';fields.condition.events.change();eq(airCooling.hidden,false);eq(fields.airTemperature.required,true);eq(fields.airTemperature.disabled,false);
  fields.airTemperature.value='-18';submit('');eq(opened.length,2);
  const airMessage=new URL(opened[1][0]).searchParams.get('text');check(airMessage.includes(t.temperature+': -18'));check(!airMessage.includes(t.departurePort));check(!airMessage.includes(t.containerSize));
  fields.condition.value='dry';fields.condition.events.change();eq(airCooling.hidden,true);eq(fields.airTemperature.required,false);eq(fields.airTemperature.disabled,true);
  fields.count.value='1.5';submit('');eq(opened.length,2);eq(status.textContent,t.invalid);
  fields.count.value='2';fields.name.value=' ';submit('');eq(opened.length,2);
  fields.name.value=base.name;fields.phone.value='bad';submit('');eq(opened.length,2);
  fields.phone.value=base.phone;fields.weight.value='0';submit('');eq(opened.length,2);
  fields.weight.value=base.weight;link.events.click();eq(fields.mode.value,'sea');eq(status.textContent,'');
  tabs[0].events.keydown({key:'End',preventDefault(){}});eq(fields.mode.value,'air');check(tabs[1].focused);
  tabs[1].events.keydown({key:'Home',preventDefault(){}});eq(fields.mode.value,'sea');check(tabs[0].focused);
  console.log(lang+': freight structure, choices, temperatures, messages and UI state passed.');
}
console.log(total+' freight assertions passed; no external requests were sent.');
