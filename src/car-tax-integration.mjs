const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

export const carTaxImage = '/manus-storage/async-images/UAR7xf6f0wjQFzLPstc7vj/image-1.webp';
const previewSource = 'https://8328-ikqqm7d4kvoopb3f5rjg2-cedabd43.sg2.manus.computer';
const source = new URL(process.env.CAR_TAX_APP_URL || previewSource);
if (source.protocol !== 'https:' || source.username || source.password) {
  throw new Error('CAR_TAX_APP_URL must be an HTTPS URL without credentials.');
}
export const carTaxAppUrl = source.href;
export const carTaxContent = {
  ar: {
    title: 'احسبها قبل تستوردها', label: 'رسوم استيراد السيارات',
    description: 'اختر بيانات سيارتك واطلب التسعيرة عبر واتساب، بعد التسجيل وتأكيد البريد الإلكتروني.',
    short: 'رسوم السيارات', action: 'افتح خدمة رسوم السيارات', back: 'العودة إلى مرسال',
    pageTitle: 'مرسال | رسوم استيراد السيارات — احسبها قبل تستوردها',
    pageDescription: 'صفحة مرسال لطلب تسعيرة رسوم استيراد السيارات. اختر بيانات السيارة وسجّل وأكّد البريد لاستلام التسعيرة عبر واتساب.',
    registration: 'التسجيل وتأكيد البريد مطلوبان لطلب التسعيرة.',
    noResult: 'نتيجة احتساب الرسوم لا تُعرض هنا؛ تُرسل عبر واتساب بعد استكمال المتطلبات.',
    notice: 'تنبيه التشغيل',
    activation: 'إرسال كود تأكيد البريد والتسعيرة الفعلية يحتاج إلى إكمال إعدادات خدمات البريد وWhatsApp Business في تطبيق الحاسبة.',
    direct: 'افتح الحاسبة في صفحة مستقلة',
    helper: 'إذا لم تظهر الحاسبة أو منع المتصفح تسجيل الدخول داخل الإطار، افتحها مباشرة من الزر أعلاه.',
    loading: 'جاري تحميل خدمة رسوم السيارات…', loaded: 'تم تحميل إطار الخدمة. يمكنك فتحه مباشرة إذا لم يظهر المحتوى.',
    frameTitle: 'تطبيق رسوم استيراد السيارات والتسجيل — مرسال',
    privacy: 'سياسة الخصوصية', dashboard: 'لوحة العملاء — للإدارة فقط',
    dependency: 'الخدمة المدمجة تعمل حاليًا من رابط معاينة مستقل؛ يلزم نشر تطبيق الحاسبة لتوفير ارتباط إنتاجي دائم.',
    language: '',
    alt: 'صورة تعبيرية ثلاثية الأبعاد لسيارة وحاوية وآلة حاسبة بهوية مرسال',
    steps: ['اختر بيانات السيارة', 'سجّل وأكّد بريدك', 'اطلب التسعيرة على واتساب'],
    note: 'تسعيرة تقديرية؛ التقييم النهائي للجهة الجمركية. لا تُعد فاتورة رسمية.'
  },
  en: {
    title: 'Calculate before you import', label: 'CAR IMPORT FEES',
    description: 'Select your vehicle and request a quotation on WhatsApp after registration and email verification.',
    short: 'Car import fees', action: 'Open the car import service', back: 'Back to Mersal',
    pageTitle: 'Mersal | Car Import Fees — Calculate Before You Import',
    pageDescription: 'Request a car import fee quotation through Mersal. Select your vehicle, register and verify your email to receive the quotation on WhatsApp.',
    registration: 'Registration and email verification are required to request a quotation.',
    noResult: 'Calculated fee results are not displayed here. They are sent on WhatsApp after the required steps.',
    notice: 'SERVICE STATUS',
    activation: 'Sending email verification codes and actual quotations still requires configuring the email and WhatsApp Business services in the calculator application.',
    direct: 'Open the calculator in a separate page',
    helper: 'If the calculator does not appear or your browser blocks sign-in inside the frame, use the direct link above.',
    loading: 'Loading the car import service…', loaded: 'The service frame has loaded. Open it directly if its content is not visible.',
    frameTitle: 'Mersal car import fees and registration application',
    privacy: 'Privacy policy', dashboard: 'Customer dashboard — administrators only',
    dependency: 'The embedded service currently runs from a separate preview URL. Publishing the calculator app is required for a permanent production connection.',
    language: 'The linked calculator application is currently in Arabic. This page and its navigation are available in English.',
    alt: '3D illustration of a car, shipping container and calculator in Mersal branding',
    steps: ['Select your vehicle', 'Register and verify email', 'Request a quote on WhatsApp'],
    note: 'An indicative quotation, not an official invoice. Final assessment is made by the customs authority.'
  }
};

export function carTaxLink(lang, icon, className = 'car-tax-nav') {
  const t = carTaxContent[lang];
  const route = lang === 'ar' ? '/car-tax.html' : '/en/car-tax.html';
  return `<a class="${className}" href="${route}" data-open-car-tax aria-haspopup="dialog" aria-controls="car-tax-dialog" aria-label="${escape(t.action)}" title="${escape(t.action)}">${icon('calculator')}<span>${escape(t.short)}</span></a>`;
}

export function carTaxFrameCard(lang, icon) {
  const t = carTaxContent[lang];
  const route = lang === 'ar' ? '/car-tax.html' : '/en/car-tax.html';
  const cta = lang === 'ar' ? 'افتح الحاسبة' : 'Open calculator';
  const caption = lang === 'ar' ? 'سيارتك · رسومك · قرارك' : 'Your car. Your fees. Your decision.';
  return `<a class="car-tax-frame-card" id="car-calculator-card" data-car-tax-motion href="${route}" data-open-car-tax aria-haspopup="dialog" aria-controls="car-tax-dialog" aria-label="${escape(t.action)}">
    <div class="car-tax-card-picture"><img src="${carTaxImage}" data-fallback="/assets/car-tax-image.webp" width="1600" height="900" alt="${escape(t.alt)}" loading="lazy"><span class="car-tax-card-symbol">${icon('calculator')}</span><span class="car-tax-card-chip">MERSAL / AUTO IMPORT</span></div>
    <div class="car-tax-card-copy"><span class="car-tax-card-label">${escape(t.label)}</span><h3>${escape(t.title)}</h3><p>${escape(caption)}</p><span class="car-tax-card-cta">${icon('calculator')}${escape(cta)}${icon('arrow')}</span></div>
  </a>`;
}

export function carTaxDialog(lang, icon) {
  const t = carTaxContent[lang];
  const close = lang === 'ar' ? 'إغلاق الحاسبة' : 'Close calculator';
  return `<dialog class="car-tax-dialog" id="car-tax-dialog" aria-labelledby="car-tax-dialog-title">
    <header class="car-tax-dialog-header"><img src="${carTaxImage}" data-fallback="/assets/car-tax-image.webp" width="160" height="90" alt="${escape(t.alt)}" loading="lazy"><div><span>${escape(t.label)}</span><h2 id="car-tax-dialog-title">${escape(t.title)}</h2></div><button class="car-tax-dialog-close" type="button" data-close-car-tax aria-label="${close}" autofocus>${icon('close')}</button></header>
    <div class="car-tax-dialog-toolbar"><p>${escape(t.registration)}</p><a href="${escape(carTaxAppUrl)}" target="_blank" rel="noopener noreferrer">${escape(t.direct)}${icon('arrow')}</a></div>
${t.language?`<p class="car-tax-dialog-language" lang="en">${escape(t.language)}</p>`:''}
    <p id="car-tax-popup-status" class="car-tax-load-status" role="status" aria-live="polite" data-loaded-text="${escape(t.loaded)}">${escape(t.loading)}</p>
    <iframe id="car-tax-popup-app" class="car-tax-popup-app" data-src="${escape(carTaxAppUrl)}" title="${escape(t.frameTitle)}" referrerpolicy="no-referrer" allow="clipboard-write"></iframe>
    <details class="car-tax-dialog-notice"><summary>${escape(t.notice)}</summary><p>${escape(t.noResult)}</p><p>${escape(t.activation)}</p><p>${escape(t.dependency)}</p><p>${escape(t.helper)}</p></details>
  </dialog>`;
}

export function renderCarTaxPage(lang, { origin, logo, icon }) {
  const t = carTaxContent[lang];
  const ar = lang === 'ar';
  const home = ar ? '/' : '/en/';
  const route = ar ? '/car-tax.html' : '/en/car-tax.html';
  const other = ar ? '/en/car-tax.html' : '/car-tax.html';
  const privacy = new URL('/privacy', source).href;
  const dashboard = new URL('/admin/dashboard', source).href;
  const absoluteImage = new URL(carTaxImage, origin).href;
  const schema = {'@context':'https://schema.org','@type':'WebPage',name:t.title,description:t.pageDescription,url:origin+route,inLanguage:lang,isPartOf:{'@type':'WebSite',name:'Mersal',url:origin}};
  return `<!doctype html><html lang="${lang}" dir="${ar?'rtl':'ltr'}"><head>
    <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#063A66"><title>${escape(t.pageTitle)}</title><meta name="description" content="${escape(t.pageDescription)}"><meta name="keywords" content="${ar?'مرسال,رسوم السيارات,استيراد السيارات,التخليص الجمركي':'Mersal,car import fees,vehicle import,customs clearance'}">
    <link rel="canonical" href="${origin+route}"><link rel="alternate" hreflang="ar" href="${origin}/car-tax.html"><link rel="alternate" hreflang="en" href="${origin}/en/car-tax.html"><link rel="alternate" hreflang="x-default" href="${origin}/car-tax.html">
    <meta property="og:type" content="website"><meta property="og:site_name" content="Mersal"><meta property="og:title" content="${escape(t.title)}"><meta property="og:description" content="${escape(t.pageDescription)}"><meta property="og:url" content="${origin+route}"><meta property="og:image" content="${absoluteImage}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escape(t.title)}"><meta name="twitter:description" content="${escape(t.pageDescription)}"><meta name="twitter:image" content="${absoluteImage}">
    <link rel="icon" href="${logo}" type="image/jpeg"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet"><link rel="stylesheet" href="/assets/styles.css"><script type="application/ld+json">${JSON.stringify(schema).replace(/</g,'\\u003c')}</script><script defer src="/assets/car-tax-page.js"></script>
  </head><body data-lang="${lang}" class="car-tax-page">
    <a class="skip-link" href="#car-tax-main">${ar?'انتقل إلى المحتوى':'Skip to content'}</a>
    <header class="header"><div class="wrap car-tax-page-nav"><a class="brand" href="${home}"><img src="${logo}" width="450" height="399" alt="Mersal"></a><nav aria-label="${ar?'روابط الصفحة':'Page navigation'}"><a class="car-tax-back" href="${home}">${icon('arrow')}${escape(t.back)}</a><a class="language" href="${other}" lang="${ar?'en':'ar'}" hreflang="${ar?'en':'ar'}">${icon('globe')}${ar?'EN':'العربية'}</a></nav></div></header>
    <main id="car-tax-main"><section class="section car-tax-page-hero"><div class="wrap"><span class="eyebrow">${escape(t.label)}</span><h1>${escape(t.title)}</h1><p>${escape(t.description)}</p><p class="car-tax-no-result">${icon('document')}${escape(t.noResult)}</p>${t.language?`<p class="car-tax-language-note" lang="en">${escape(t.language)}</p>`:''}</div></section>
    <section class="car-tax-embed-section"><div class="wrap"><aside class="car-tax-service-notice"><strong>${escape(t.notice)}</strong><p>${escape(t.activation)}</p></aside>
      <div class="car-tax-embed-toolbar"><span>${icon('calculator')}${escape(t.registration)}</span><a class="button button-dark" href="${escape(carTaxAppUrl)}" target="_blank" rel="noopener noreferrer">${escape(t.direct)}${icon('arrow')}</a></div>
      <p class="car-tax-embed-helper">${escape(t.helper)}</p><p id="car-tax-load-status" class="car-tax-load-status" role="status" aria-live="polite" data-loaded-text="${escape(t.loaded)}">${escape(t.loading)}</p>
      <iframe id="car-tax-app" class="car-tax-app" src="${escape(carTaxAppUrl)}" title="${escape(t.frameTitle)}" loading="eager" referrerpolicy="no-referrer" allow="clipboard-write"></iframe>
      <noscript><p>${escape(t.helper)} <a href="${escape(carTaxAppUrl)}">${escape(t.direct)}</a></p></noscript><p class="car-tax-dependency">${escape(t.dependency)}</p><p class="car-tax-final-note">${escape(t.note)}</p>
    </div></section></main>
    <footer class="footer"><div class="wrap car-tax-page-footer"><a href="${home}">${escape(t.back)}</a><a href="${privacy}" target="_blank" rel="noopener noreferrer">${escape(t.privacy)}</a><a href="${dashboard}" target="_blank" rel="noopener noreferrer">${escape(t.dashboard)}</a><a href="tel:+966500447325" dir="ltr">0500447325</a><a href="mailto:info@mersal-cc.com" dir="ltr">info@mersal-cc.com</a></div></footer>
  </body></html>`;
}
