export const containerChoices = ['40-dry','40-reefer','20-dry','20-reefer','40hc-dry','40hc-reefer'];
export const normalizeDigits = value => String(value ?? '').replace(/[٠-٩۰-۹]/g, c => String(c.charCodeAt(0) - (c <= '٩' ? 1632 : 1776)));
const clean = value => String(value ?? '').trim();
const number = value => Number(normalizeDigits(clean(value)));
export function isRefrigerated(mode, values) {
  return mode === 'sea' ? containerChoices.includes(values.container) && values.container.endsWith('-reefer') : mode === 'air' && values.condition === 'reefer';
}
export function validateFreight(values, t) {
  const errors = {};
  const mode = values.mode;
  if (!['sea','air'].includes(mode)) errors.mode = t.invalidChoice;
  const required = ['name','products',...(mode==='sea'?['departurePort','arrivalPort']:['departureAirport','arrivalAirport'])];
  for (const name of required) if (!clean(values[name])) errors[name] = t.required;
  const phone = normalizeDigits(clean(values.phone));
  const digits = phone.replace(/\D/g,'');
  if (!/^[+() .\-\d]+$/.test(phone) || digits.length<9 || digits.length>15) errors.phone = t.invalidPhone;
  for (const name of ['weight',...(mode==='sea'?['quantity']:['length','width','height'])]) {
    if (!clean(values[name]) || !Number.isFinite(number(values[name])) || number(values[name])<=0) errors[name] = t.positive;
  }
  if (mode==='sea' && !containerChoices.includes(values.container)) errors.container = t.invalidChoice;
  if (mode==='air') {
    if (!['dry','reefer'].includes(values.condition)) errors.condition = t.invalidChoice;
    if (!clean(values.count) || !Number.isInteger(number(values.count)) || number(values.count)<=0) errors.count = t.integer;
  }
  if (isRefrigerated(mode,values)) {
    const field=mode==='sea'?'seaTemperature':'airTemperature';
    if (!clean(values[field]) || !Number.isFinite(number(values[field]))) errors[field] = t.invalidTemperature;
  }
  return errors;
}
export function buildFreightMessage(values, t) {
  const mode=values.mode;
  const title=mode==='sea'?t.seaRequest:t.airRequest;
  const lines=[title+' — Mersal',t.name+': '+clean(values.name),t.phone+': '+normalizeDigits(clean(values.phone))];
  if (clean(values.email)) lines.push(t.email+': '+clean(values.email));
  lines.push(t.modeLabel+': '+(mode==='sea'?t.sea:t.air));
  if (mode==='sea') {
    lines.push(t.departurePort+': '+clean(values.departurePort),t.arrivalPort+': '+clean(values.arrivalPort),t.containerSize+': '+t.containers[values.container]);
  } else {
    lines.push(t.departureAirport+': '+clean(values.departureAirport),t.arrivalAirport+': '+clean(values.arrivalAirport),t.airCondition+': '+t.conditions[values.condition]);
  }
  if (isRefrigerated(mode,values)) lines.push(t.temperature+': '+normalizeDigits(clean(values[mode==='sea'?'seaTemperature':'airTemperature'])));
  lines.push(t.products+': '+clean(values.products));
  if (mode==='sea') lines.push(t.quantity+': '+normalizeDigits(clean(values.quantity)));
  lines.push(t.weight+': '+normalizeDigits(clean(values.weight)));
  if (mode==='air') lines.push(t.count+': '+normalizeDigits(clean(values.count)),t.length+': '+normalizeDigits(clean(values.length)),t.width+': '+normalizeDigits(clean(values.width)),t.height+': '+normalizeDigits(clean(values.height)));
  return {title,message:lines.join('\n')};
}
