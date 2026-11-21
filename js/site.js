
(function () {
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function clamp(x, a, b) { return Math.min(b, Math.max(a, x)); }
  function smooth(a, b, x) { var t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }

  /* ---------- Text: Woerter aus Maske, Slogan schreibt sich, alles wiederholt sich bei jedem Auftauchen ---------- */
  document.querySelectorAll('[data-words]').forEach(function (h) {
    var words = h.textContent.trim().split(/\s+/);
    h.setAttribute('aria-label', words.join(' '));
    h.innerHTML = words.map(function (w, i) { return '<span class="w" aria-hidden="true"><span style="--i:' + i + '">' + w + '</span></span> '; }).join('');
  });
  document.querySelectorAll('.script').forEach(function (el) { el.innerHTML = '<span class="sw">' + el.innerHTML + '</span>'; });
  var rv = document.querySelectorAll('.rv');
  try {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { e.target.classList.toggle('in', e.isIntersecting); }); }, { threshold: 0.1 });
    rv.forEach(function (el) { io.observe(el); });
    setTimeout(function () { document.querySelectorAll('#start .rv').forEach(function (el) { el.classList.add('in'); }); }, 150);
  } catch (e) { rv.forEach(function (el) { el.classList.add('in'); }); }

  /* ---------- Buehne: Ueberblendung, Zoom, Parallax ---------- */
  var scenes = [].slice.call(document.querySelectorAll('.scene')), hasStage = scenes.length > 0;
  var imgs = scenes.map(function (s) { return s.querySelector('img'); });
  var secs = [].slice.call(document.querySelectorAll('[data-scene]'));
  var bar = document.getElementById('bar'), lights = [].slice.call(document.querySelectorAll('.light'));
  var cutSvg = document.getElementById('cut'), cband = cutSvg && cutSvg.querySelector('.cband'), cglow = cutSvg && cutSvg.querySelector('.cglow'), cthin = cutSvg && cutSvg.querySelector('.cthin');
  var ys = window.scrollY, vh = window.innerHeight, tops = [], hs = [], docH = 1;
  function measure() {
    vh = window.innerHeight; docH = document.documentElement.scrollHeight;
    tops = secs.map(function (s) { var r = s.getBoundingClientRect(); return r.top + window.scrollY; });
    hs = secs.map(function (s) { return s.offsetHeight; });
  }
  window.addEventListener('resize', measure); window.addEventListener('load', measure); measure();
  var mx = 0, my = 0, tmx = 0, tmy = 0;
  window.addEventListener('pointermove', function (e) { tmx = e.clientX / window.innerWidth * 2 - 1; tmy = e.clientY / window.innerHeight * 2 - 1; }, { passive: true });
  var t0 = performance.now();
  function stage(now) {
    var target = window.scrollY, k = reduce ? 1 : 0.1;
    ys += (target - ys) * k;
    mx += (tmx - mx) * 0.05; my += (tmy - my) * 0.05;
    var intro = reduce ? 1 : smooth(0, 2.6, (now - t0) / 1000);
    if (!hasStage) { bar.style.width = (clamp(ys / Math.max(1, docH - vh), 0, 1) * 100) + '%'; requestAnimationFrame(stage); return; }
    var W = window.innerWidth, H = vh, off = H * 0.24, bw = Math.max(20, W * 0.045), us = [], active = -1;
    for (var i = 0; i < secs.length; i++) {
      var si = +secs[i].getAttribute('data-scene');
      var top = tops[i] - ys, h = hs[i];
      var t = clamp((vh - top) / (vh + h), 0, 1);
      var u = si === 0 ? 1 : smooth(0.12, 0.42, t);
      us[si] = u;
      if (u > 0 && u < 1 && active < 0) active = si;
      var z = 1.05 + t * 0.13 + (1 - intro) * 0.08 + (1 - u) * 0.1;
      var ty = (0.5 - t) * 3.2;
      imgs[si].style.transform = 'translate3d(' + (mx * -10) + 'px,' + ((my * -8) + ty * vh / 100) + 'px,0) scale(' + z.toFixed(4) + ')';
    }
    for (var k2 = 0; k2 < scenes.length; k2++) {
      var u2 = us[k2], el = scenes[k2], covered = us[k2 + 1] >= 1;
      if (covered || u2 <= 0) { el.style.visibility = 'hidden'; continue; }
      el.style.visibility = 'visible';
      if (u2 >= 1) { el.style.clipPath = 'none'; continue; }
      var x = -off + u2 * (W + 2 * off);
      el.style.clipPath = 'polygon(0 0,' + (x + off).toFixed(1) + 'px 0,' + (x - off).toFixed(1) + 'px ' + H + 'px,0 ' + H + 'px)';
    }
    if (active >= 0) {
      var ua = us[active], xa = -off + ua * (W + 2 * off), fade = Math.min(1, ua * 10, (1 - ua) * 10);
      var tx = xa + off, bx = xa - off, hb = bw / 2;
      cband.setAttribute('points', (tx - hb) + ',0 ' + (tx + hb) + ',0 ' + (bx + hb) + ',' + H + ' ' + (bx - hb) + ',' + H);
      cglow.setAttribute('points', (tx + hb) + ',0 ' + (tx + hb * 5) + ',0 ' + (bx + hb * 5) + ',' + H + ' ' + (bx + hb) + ',' + H);
      cthin.setAttribute('x1', tx + hb * 2.1); cthin.setAttribute('y1', 0); cthin.setAttribute('x2', bx + hb * 2.1); cthin.setAttribute('y2', H);
      cband.style.opacity = (0.92 * fade).toFixed(3); cglow.style.opacity = fade.toFixed(3); cthin.style.opacity = (0.85 * fade).toFixed(3);
    } else { cband.style.opacity = 0; cglow.style.opacity = 0; cthin.style.opacity = 0; }
    var onl = false;
    for (var q = 0; q < lights.length; q++) { var lr = lights[q].getBoundingClientRect(); if (lr.top < 50 && lr.bottom > 50) onl = true; }
    document.body.classList.toggle('onlight', onl && !document.body.classList.contains('menu-open'));
    bar.style.width = (clamp(ys / Math.max(1, docH - vh), 0, 1) * 100) + '%';
    requestAnimationFrame(stage);
  }
  requestAnimationFrame(stage);


  /* ---------- Logo zeichnet sich (wie auf der 2D-Seite) ---------- */
  var lg = document.querySelector('.logo-svg');
  function drawLogo() {
    if (reduce || !lg || !lg.animate) return;
    var parts = [].slice.call(lg.querySelectorAll('path,rect,circle')), n = 0;
    parts.forEach(function (el) {
      var stroked = !!el.closest('[fill="none"]');
      var anim;
      if (stroked && el.getTotalLength) {
        el.setAttribute('pathLength', '1');
        anim = el.animate([{ strokeDasharray: '1 1', strokeDashoffset: 1 }, { strokeDasharray: '1 1', strokeDashoffset: 0 }], { duration: 1300, delay: n * 45, easing: 'cubic-bezier(.6,0,.2,1)', fill: 'backwards' });
        n++;
      } else {
        anim = el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 600, delay: 900 + n * 20, easing: 'ease-out', fill: 'backwards' });
      }
    });
  }
  drawLogo();
  var wasDown = false;
  window.addEventListener('scroll', function () { var y = window.scrollY; if (y > 400) wasDown = true; if (y < 20 && wasDown) { wasDown = false; drawLogo(); } }, { passive: true });

  /* ---------- Anfrage-Formular -> WhatsApp ---------- */
  var wf = document.getElementById('wa-form');
  if (wf) wf.addEventListener('submit', function (e) {
    e.preventDefault();
    var d = new FormData(wf), l = d.getAll('leistung'), nm = String(d.get('name') || '').trim(), er = document.getElementById('form-error');
    if (!l.length || !nm) { er.hidden = false; return; }
    er.hidden = true;
    var z = ['Hallo Herr Kless, ich interessiere mich für: ' + l.join(', ') + '.'];
    if (d.get('ort')) z.push('Ort: ' + d.get('ort'));
    if (d.get('termin')) z.push('Wunschtermin: ' + d.get('termin'));
    if (d.get('text')) z.push('Beschreibung: ' + d.get('text'));
    z.push('Name: ' + nm);
    var a = document.createElement('a'); a.href = 'https://wa.me/491603313379?text=' + encodeURIComponent(z.join('\n')); a.target = '_blank'; a.rel = 'noopener';
    document.body.appendChild(a); a.click(); a.remove();
  });

  /* ---------- Zahlen zaehlen bei jedem Auftauchen ---------- */
  var counts = [].slice.call(document.querySelectorAll('.count'));
  function runCount(el) {
    var from = +(el.getAttribute('data-from') || 0), to = +el.getAttribute('data-to'), dur = 1700, st = performance.now();
    cancelAnimationFrame(el._raf);
    function stp(now) {
      var p = clamp((now - st) / dur, 0, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(from + (to - from) * e);
      if (p < 1) el._raf = requestAnimationFrame(stp);
    }
    if (reduce) { el.textContent = to; return; }
    el._raf = requestAnimationFrame(stp);
  }
  try {
    var cio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var c = e.target;
        if (e.isIntersecting) runCount(c); else { cancelAnimationFrame(c._raf); c.textContent = c.getAttribute('data-from') || 0; }
      });
    }, { threshold: 0.4 });
    counts.forEach(function (c) { c.textContent = c.getAttribute('data-from') || 0; cio.observe(c); });
  } catch (e) { counts.forEach(function (c) { c.textContent = c.getAttribute('data-to'); }); }

  /* ---------- Menue auf dem Handy ---------- */
  var burger = document.querySelector('.burger'), drawer = document.querySelector('.drawer');
  function setMenu(open) {
    document.body.classList.toggle('menu-open', open);
    if (burger) { burger.setAttribute('aria-expanded', open ? 'true' : 'false'); burger.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen'); }
  }
  if (burger && drawer) {
    burger.addEventListener('click', function () { setMenu(!document.body.classList.contains('menu-open')); });
    drawer.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
    window.addEventListener('resize', function () { if (window.innerWidth > 980) setMenu(false); });
  }
})();
