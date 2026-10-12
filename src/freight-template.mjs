import { freightContent } from './freight-content.mjs';
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function freightLink(lang, icon, className = 'freight-nav') {
  const t = freightContent[lang];
  return `<a class="${className}" href="#freight-quote" data-freight-request="sea" aria-label="${escape(t.seaRequest)}" title="${escape(t.seaRequest)}">${icon('ship')}<span>${escape(t.shortRequest)}</span></a>`;
}
export function freightSection(lang, icon) {
  const t = freightContent[lang];
  const input = (name, label, options = {}) => {
    const {type='text', placeholder='', extra='', required=true, wide=false} = options;
    return `<label for="freight-${name}"${wide?' class="form-wide"':''}>${escape(label)}${required?' <span>*</span>':''}<input id="freight-${name}" name="${name}" type="${type}" ${required?'required':''} ${placeholder?`placeholder="${escape(placeholder)}"`:''} ${extra}></label>`;
  };
  const select = (name, label, hint, values) => `<label for="freight-${name}">${escape(label)} <span>*</span><select id="freight-${name}" name="${name}" required><option value="">${escape(hint)}</option>${Object.entries(values).map(([key,value])=>`<option value="${key}">${escape(value)}</option>`).join('')}</select></label>`;
  const temperature = mode => `<div id="freight-${mode}-cooling" class="freight-cooling form-wide" hidden>${input(`${mode}Temperature`,t.temperature,{type:'number',placeholder:t.temperatureHint,extra:'step="any" dir="ltr" disabled',required:true})}<p>${escape(t.coolingNote)}</p></div>`;
  const positive = 'min="0.001" step="any" inputmode="decimal" dir="ltr"';
  return `<section class="section freight-section" id="freight-quote" aria-labelledby="freight-heading">
    <div class="wrap">
      <div class="section-head"><div><span class="eyebrow">${escape(t.sectionLabel)}</span><h2 id="freight-heading">${escape(t.title).replace(/\n/g,'<br>')}</h2></div><p>${escape(t.intro)}</p></div>
      <div class="freight-layout">
        <aside class="freight-aside"><div class="freight-aside-symbol">${icon('ship')}${icon('plane')}</div><h3>${escape(t.modeLabel)}</h3><p>${escape(t.requiredNote)}</p><div class="freight-units"><span>kg</span><span>cm</span><span>°C</span></div><p>${escape(t.privacy)}</p></aside>
        <form class="freight-form" id="freight-form" novalidate>
          <input type="hidden" id="freight-mode" name="mode" value="sea">
          <div class="freight-tabs" role="tablist" aria-label="${escape(t.modeLabel)}">
            <button type="button" role="tab" id="freight-sea-tab" aria-selected="true" aria-controls="freight-sea-panel" tabindex="0" data-freight-mode="sea">${icon('ship')}${escape(t.sea)}</button>
            <button type="button" role="tab" id="freight-air-tab" aria-selected="false" aria-controls="freight-air-panel" tabindex="-1" data-freight-mode="air">${icon('plane')}${escape(t.air)}</button>
          </div>
          <fieldset class="freight-panel" id="freight-sea-panel" role="tabpanel" aria-labelledby="freight-sea-tab">
            <legend>${escape(t.seaTitle)}</legend><div class="form-grid">
              ${input('departurePort',t.departurePort,{placeholder:t.portHint,extra:'maxlength="160"'})}
              ${input('arrivalPort',t.arrivalPort,{placeholder:t.portHint,extra:'maxlength="160"'})}
              ${select('container',t.containerSize,t.chooseContainer,t.containers)}
              ${input('quantity',t.quantity,{type:'number',extra:positive})}
              ${temperature('sea')}
            </div>
          </fieldset>
          <fieldset class="freight-panel" id="freight-air-panel" role="tabpanel" aria-labelledby="freight-air-tab" hidden disabled>
            <legend>${escape(t.airTitle)}</legend><div class="form-grid">
              ${input('departureAirport',t.departureAirport,{placeholder:t.airportHint,extra:'maxlength="160"'})}
              ${input('arrivalAirport',t.arrivalAirport,{placeholder:t.airportHint,extra:'maxlength="160"'})}
              ${select('condition',t.airCondition,t.chooseCondition,t.conditions)}
              ${input('count',t.count,{type:'number',extra:'min="1" step="1" inputmode="numeric" dir="ltr"'})}
              ${temperature('air')}
              <div class="form-wide freight-dimensions"><p>${escape(t.dimensions)}</p><div class="freight-dimension-grid">
                ${input('length',t.length,{type:'number',extra:positive})}
                ${input('width',t.width,{type:'number',extra:positive})}
                ${input('height',t.height,{type:'number',extra:positive})}
              </div><small>${escape(t.dimensionsNote)}</small></div>
            </div>
          </fieldset>
          <fieldset class="freight-panel"><legend>${escape(t.cargoDetails)}</legend><div class="form-grid">
            <label for="freight-products">${escape(t.products)} <span>*</span><textarea id="freight-products" name="products" required rows="2" maxlength="1000" placeholder="${escape(t.productsHint)}"></textarea></label>
            ${input('weight',t.weight,{type:'number',extra:positive})}
          </div></fieldset>
          <fieldset class="freight-panel"><legend>${escape(t.contactDetails)}</legend><div class="form-grid">
            ${input('name',t.name,{placeholder:t.nameHint,extra:'maxlength="100" autocomplete="organization"'})}
            ${input('phone',t.phone,{type:'tel',placeholder:t.phoneHint,extra:'maxlength="24" autocomplete="tel" dir="ltr"'})}
            ${input('email',t.email,{type:'email',placeholder:'name@company.com',required:false,extra:'maxlength="150" autocomplete="email" dir="ltr"',wide:true})}
          </div></fieldset>
          <div class="freight-submit"><button type="submit" class="button button-orange">${icon('whatsapp')}${escape(t.sendWhatsApp)}${icon('arrow')}</button><button type="submit" name="channel" value="email" class="email-submit">${icon('mail')}${escape(t.sendEmail)}</button></div>
          <p class="freight-status" role="status" aria-live="polite"></p><p class="privacy">${escape(t.privacy)}</p>
        </form>
      </div>
      <noscript><p>${lang==='ar'?'فعّل JavaScript لاستخدام نموذج الشحن، أو تواصل مباشرة مع مرسال.':'Enable JavaScript to use the freight form, or contact Mersal directly.'}</p></noscript>
    </div>
    <script type="application/json" id="freight-content">${JSON.stringify(t).replace(/</g,'\\u003c')}</script>
    <script type="module" src="/assets/freight.js"></script>
  </section>`;
}
