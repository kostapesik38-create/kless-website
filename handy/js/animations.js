// Animationen mit GSAP + ScrollTrigger (lokal eingebunden, GSAP-Standardlizenz: kostenlos)
// Jeder Block spielt seine Animation JEDES MAL, wenn er ins Bild kommt (beim Runter- und Hochscrollen).
(function () {
  if (!window.gsap || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  gsap.registerPlugin(ScrollTrigger);
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  // Wiederholen: beim Reinkommen abspielen, beim Verlassen zurücksetzen
  const again = { toggleActions: 'restart reset restart reset' };
  const prepDraw = els => els.forEach(el => { const l = el.getTotalLength(); el.style.strokeDasharray = l; el.style.strokeDashoffset = l; });

  // 1. Logo zeichnet sich (Bagger, Container, Haus, Baum)
  const lines = $$('.site-header .logo-svg #art *, .site-header .logo-svg path[stroke="#9BE22D"], .site-header .logo-svg path[stroke="#5a7d1e"]').filter(el => el.getTotalLength);
  prepDraw(lines);
  const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
  intro.to(lines, { strokeDashoffset: 0, duration: 1.4, stagger: 0.03, ease: 'power2.inOut' })
       .from('.site-header .logo-svg circle, .site-header .logo-svg path[fill="#9BE22D"]', { opacity: 0, duration: .5 }, '-=0.6')
       .from('.nav > *', { y: -16, opacity: 0, stagger: .07, duration: .5 }, 0.2);

  // 2. Startseite: Foto + grüne Linie wischen von oben nach unten, Parallax beim Scrollen
  if ($('.hero-media')) {
    intro.from('.hero-media', { clipPath: 'polygon(18% 0%,100% 0%,100% 0%,18% 0%)', duration: 1.3, ease: 'power3.inOut' }, 0);
    gsap.fromTo('.hero-photo', { backgroundPosition: '62% 35%' }, { backgroundPosition: '62% 75%', ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  }
  // Unterseiten: Linie wischt, großes Icon zeichnet sich
  if ($('.page-hero-deco')) {
    intro.from('.deco-stripe', { clipPath: 'polygon(46% 0%,47.6% 0%,47.6% 0%,46% 0%)', duration: 1.1, ease: 'power3.inOut' }, 0.1);
    const deco = $$('.page-hero-deco svg *').filter(el => el.getTotalLength);
    prepDraw(deco);
    intro.to(deco, { strokeDashoffset: 0, duration: 1.6, stagger: .1, ease: 'power2.inOut' }, 0.4);
  }

  // 3. Überschrift fährt zeilenweise hoch, dann Text und Knöpfe
  intro.from('h1 .line > span', { yPercent: 110, duration: .9, stagger: .12 }, 0.35)
       .from('.crumbs, .page-hero .kicker', { opacity: 0, y: 10, duration: .5 }, 0.4)
       .from('.hero .lead, .page-hero .lead', { opacity: 0, y: 20, duration: .7 }, '-=0.5')
       .from('.hero-actions .btn', { opacity: 0, y: 20, stagger: .1, duration: .6 }, '-=0.45');

  // 4. Zahl "100 km" zählt hoch (jedes Mal)
  $$('.count').forEach(el => {
    const o = { v: 0 };
    gsap.fromTo(o, { v: 0 }, { v: +el.dataset.to, duration: 1.6, ease: 'power2.out',
      onUpdate: () => el.textContent = Math.round(o.v),
      scrollTrigger: { trigger: el.closest('section') || el, start: 'top 95%', ...again } });
  });
  if ($('.facts')) gsap.from('.facts .wrap > div', { opacity: 0, y: 24, stagger: .12, duration: .7,
    scrollTrigger: { trigger: '.facts', start: 'top 95%', ...again } });

  // 5. Abschnitte: Kicker + Überschrift, dann Karten nacheinander
  $$('.section').forEach(sec => {
    const head = sec.querySelectorAll('.kicker, h2');
    if (head.length) gsap.from(head, { opacity: 0, y: 30, stagger: .1, duration: .7, ease: 'power3.out',
      scrollTrigger: { trigger: sec, start: 'top 80%', end: 'bottom 10%', ...again } });
    const items = sec.querySelectorAll('.card, .svc-block, .steps li, .faq details, .kontakt-list a, .form, .anfrage-text > p:not(.kicker):not(.script), .kontakt > div > p');
    if (items.length) gsap.from(items, { opacity: 0, y: 40, stagger: .1, duration: .7, ease: 'power3.out',
      scrollTrigger: { trigger: sec, start: 'top 75%', end: 'bottom 10%', ...again } });
  });
  if ($('.steps')) gsap.from('.steps b', { scale: 0, transformOrigin: 'left bottom', stagger: .15, duration: .6, ease: 'back.out(2.5)', delay: .3,
    scrollTrigger: { trigger: '.steps', start: 'top 85%', end: 'bottom 5%', ...again } });

  // 6. Slogan "schreibt sich" von links nach rechts
  $$('.script').forEach(el => gsap.fromTo(el, { clipPath: 'inset(-10% 100% -10% 0)' }, {
    clipPath: 'inset(-10% 0% -10% 0)', duration: 2, ease: 'power1.inOut',
    scrollTrigger: { trigger: el, start: 'top 90%', end: 'bottom 5%', ...again } }));

  // 7. Grüner Streifen unten: Knopf springt rein
  if ($('.cta')) gsap.from('.cta .btn', { scale: .85, opacity: 0, duration: .6, ease: 'back.out(2)', delay: .4,
    scrollTrigger: { trigger: '.cta', start: 'top 90%', ...again } });
})();
