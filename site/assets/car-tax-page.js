'use strict';
(() => {
  document.querySelectorAll('img[data-fallback]').forEach(image => {
    const useFallback = () => {
      const fallback = image.dataset.fallback;
      if (!fallback) return;
      delete image.dataset.fallback;
      image.src = fallback;
    };
    image.addEventListener('error', useFallback);
    if (image.complete && !image.naturalWidth) useFallback();
  });
  const standaloneFrame = document.getElementById('car-tax-app');
  const standaloneStatus = document.getElementById('car-tax-load-status');
  if (standaloneFrame && standaloneStatus) {
    standaloneFrame.addEventListener('load', () => {
      standaloneStatus.textContent = standaloneStatus.dataset.loadedText;
    });
  }

  const dialog = document.getElementById('car-tax-dialog');
  if (!dialog) return;
  const frame = document.getElementById('car-tax-popup-app');
  const status = document.getElementById('car-tax-popup-status');
  const closeButton = dialog.querySelector('[data-close-car-tax]');
  let opener = null;
  let previousOverflow = '';
  let opening = false;
  frame.addEventListener('load', () => {
    if (frame.getAttribute('src')) status.textContent = status.dataset.loadedText;
  });
  document.querySelectorAll('[data-open-car-tax]').forEach(link => {
    link.addEventListener('click', event => {
      // Keep the real destination as a no-JS/unsupported-browser fallback.
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey ||
          typeof dialog.showModal !== 'function') return;
      event.preventDefault();
      if (dialog.open || opening) return;
      opener = link;
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const animated = link.hasAttribute('data-car-tax-motion') && !reduceMotion;
      const open = () => {
        opening = false;
        link.classList.remove('is-calculator-pressed');
        previousOverflow = document.documentElement.style.overflow;
        dialog.classList.toggle('is-calculator-entering', !reduceMotion);
        dialog.showModal();
        document.documentElement.style.overflow = 'hidden';
        closeButton.focus();
        if (!frame.getAttribute('src')) frame.setAttribute('src', frame.dataset.src);
      };
      if (animated) {
        opening = true;
        link.classList.add('is-calculator-pressed');
        setTimeout(open, 180);
      } else open();
    });
  });
  closeButton.addEventListener('click', () => dialog.close());
  dialog.addEventListener('cancel', event => {
    event.preventDefault();
    dialog.close();
  });
  dialog.addEventListener('close', () => {
    dialog.classList.remove('is-calculator-entering');
    document.documentElement.style.overflow = previousOverflow;
    const mobileNav = document.getElementById('mobile-nav');
    const fallback = document.querySelector('.header-actions [data-open-car-tax]');
    const target = mobileNav?.hidden && mobileNav.contains(opener) ? fallback : opener;
    target?.focus({ preventScroll: true });
  });
})();
