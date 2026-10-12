import { isRefrigerated, validateFreight, buildFreightMessage } from './freight-core.js';

const form = document.getElementById('freight-form');
if (form) {
  const text = JSON.parse(document.getElementById('freight-content').textContent);
  const modeField = document.getElementById('freight-mode');
  const status = form.querySelector('.freight-status');
  const tabs = [...document.querySelectorAll('[data-freight-mode]')];
  const field = name => document.getElementById('freight-'+name);
  const controls = [...form.querySelectorAll('input,textarea,select')];

  function updateCooling(mode) {
    const values = { container: field('container').value, condition: field('condition').value };
    const cooling = isRefrigerated(mode, values);
    const active = modeField.value === mode;
    const input = field(mode+'Temperature');
    document.getElementById('freight-'+mode+'-cooling').hidden = !cooling;
    input.disabled = !cooling || !active;
    input.required = cooling && active;
    if (!cooling || !active) input.setCustomValidity('');
  }

  function selectMode(mode) {
    if (!['sea','air'].includes(mode)) return;
    modeField.value = mode;
    for (const tab of tabs) {
      const active = tab.dataset.freightMode === mode;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      const panel = document.getElementById(tab.getAttribute('aria-controls'));
      panel.hidden = !active;
      panel.disabled = !active;
    }
    controls.forEach(input => input.setCustomValidity(''));
    updateCooling('sea');
    updateCooling('air');
    status.textContent = '';
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectMode(tab.dataset.freightMode));
    tab.addEventListener('keydown', event => {
      let next;
      const rtl = document.documentElement.dir === 'rtl';
      if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else if (event.key === 'ArrowRight') next = (index + (rtl ? -1 : 1) + tabs.length) % tabs.length;
      else if (event.key === 'ArrowLeft') next = (index + (rtl ? 1 : -1) + tabs.length) % tabs.length;
      else return;
      event.preventDefault();
      selectMode(tabs[next].dataset.freightMode);
      tabs[next].focus();
    });
  });
  document.querySelectorAll('[data-freight-request]').forEach(link => {
    link.addEventListener('click', () => selectMode(link.dataset.freightRequest));
  });
  field('container').addEventListener('change', () => updateCooling('sea'));
  field('condition').addEventListener('change', () => updateCooling('air'));
  controls.forEach(input => input.addEventListener('input', () => {
    input.setCustomValidity('');
    status.textContent = '';
  }));

  form.addEventListener('submit', event => {
    event.preventDefault();
    controls.forEach(input => input.setCustomValidity(''));
    const values = Object.fromEntries(new FormData(form).entries());
    const errors = validateFreight(values, text);
    Object.entries(errors).forEach(([name,error]) => field(name)?.setCustomValidity(error));
    const nativeValid = form.reportValidity();
    if (Object.keys(errors).length || !nativeValid) {
      status.textContent = text.invalid;
      return;
    }
    const { title, message } = buildFreightMessage(values,text);
    if (event.submitter?.value === 'email') {
      window.location.href = 'mailto:info@mersal-cc.com?subject='+encodeURIComponent(title)+'&body='+encodeURIComponent(message);
    } else {
      window.open('https://wa.me/966500447325?text='+encodeURIComponent(message),'_blank','noopener,noreferrer');
    }
    status.textContent = text.ready;
  });
  selectMode('sea');
}
