'use strict';
(() => {
  const text = JSON.parse(document.getElementById('client-content').textContent);
  const arabic = document.body.dataset.lang === 'ar';
  const menuButton = document.querySelector('.menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  menuButton.addEventListener('click', () => {
    const expanded = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!expanded));
    menuButton.setAttribute('aria-label', arabic ? (expanded ? 'فتح القائمة' : 'إغلاق القائمة') : (expanded ? 'Open menu' : 'Close menu'));
    mobileNav.hidden = expanded;
  });
  mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    mobileNav.hidden = true;
    menuButton.setAttribute('aria-expanded', 'false');
  }));
  const trackDialog = document.getElementById('tracking-dialog');
  const videoDialog = document.getElementById('video-dialog');
  const film = videoDialog.querySelector('video');
  document.querySelectorAll('[data-open-tracking]').forEach(button => button.addEventListener('click', () => trackDialog.showModal()));
  document.querySelectorAll('[data-open-film]').forEach(button => button.addEventListener('click', () => {
    videoDialog.showModal();
    film.play().catch(() => { /* Native playback controls remain available. */ });
  }));
  document.querySelectorAll('[data-close-dialog]').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));
  document.querySelectorAll('dialog').forEach(dialog => dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  }));
  videoDialog.addEventListener('close', () => film.pause());
  const containerInput = document.getElementById('container-number');
  const trackingStatus = document.querySelector('.tracking-status');
  containerInput.addEventListener('input', () => {
    containerInput.value = containerInput.value.toUpperCase().replace(/\s/g,'');
    trackingStatus.textContent = '';
    containerInput.setCustomValidity('');
  });
  document.getElementById('tracking-link').addEventListener('click', event => {
    const number = containerInput.value.trim();
    if (number && !/^[A-Z]{4}\d{7}$/.test(number)) {
      event.preventDefault();
      trackingStatus.textContent = text.trackInvalid;
      containerInput.setCustomValidity(text.trackInvalid);
      containerInput.reportValidity();
      return;
    }
    if (number && navigator.clipboard) {
      navigator.clipboard.writeText(number).then(() => { trackingStatus.textContent = text.trackReady; }).catch(() => {
        trackingStatus.textContent = arabic ? 'لم يسمح المتصفح بالنسخ. انسخ الرقم يدويًا ثم الصقه في البوابة.' : 'Clipboard access was unavailable. Copy the number manually and paste it in the directory.';
      });
    }
  });
  const form = document.getElementById('quote-form');
  const service = document.getElementById('service');
  const status = form.querySelector('.form-status');
  document.querySelectorAll('[data-service]').forEach(link => link.addEventListener('click', () => {
    service.value = link.dataset.service;
  }));
  form.querySelectorAll('input,textarea,select').forEach(field => field.addEventListener('input', () => {
    field.setCustomValidity('');
    status.textContent = '';
  }));
  form.addEventListener('submit', event => {
    event.preventDefault();
    for (const id of ['name','details']) {
      const field = document.getElementById(id);
      field.setCustomValidity(field.value.trim() ? '' : text.required);
    }
    const phone = document.getElementById('phone');
    const digits = phone.value.replace(/\D/g,'');
    phone.setCustomValidity(/^[+() .\-\d]+$/.test(phone.value) && digits.length >= 9 && digits.length <= 15 ? '' : (arabic ? 'أدخل رقم جوال صحيحًا من 9 إلى 15 رقمًا.' : 'Enter a valid phone number with 9–15 digits.'));
    if (!form.reportValidity()) {
      status.textContent = text.formInvalid;
      return;
    }
    const values = Object.fromEntries(new FormData(form).entries());
    const message = [text.quote+' — Mersal', text.name+': '+values.name.trim(), text.phone+': '+values.phone.trim(), ...(values.email ? [text.email+': '+values.email.trim()] : []), text.service+': '+text.names[Number(values.service)], text.details+': '+values.details.trim()].join('\n');
    if (event.submitter?.value === 'email') {
      window.location.href = 'mailto:info@mersal-cc.com?subject='+encodeURIComponent(text.quote+' — '+text.names[Number(values.service)])+'&body='+encodeURIComponent(message);
    } else {
      window.open('https://wa.me/966500447325?text='+encodeURIComponent(message),'_blank','noopener,noreferrer');
    }
    status.textContent = text.formReady;
  });
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  if (!reduceMotion && finePointer) {
    const wrap = document.querySelector('.scene-wrap');
    const scene = document.querySelector('.scene');
    wrap.addEventListener('pointermove', event => {
      const rect = wrap.getBoundingClientRect();
      const x = (event.clientX-rect.left)/rect.width-.5;
      const y = (event.clientY-rect.top)/rect.height-.5;
      scene.style.transform = `translate(-50%,-50%) perspective(1200px) rotateX(${-18-y*12}deg) rotateY(${-31+x*20}deg) rotateZ(1deg)`;
    });
    wrap.addEventListener('pointerleave', () => { scene.style.transform = ''; });
  }
})();
