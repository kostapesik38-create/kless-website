// Menü auf dem Handy
const menuBtn = document.querySelector('.menu-btn');
const nav = document.querySelector('.nav');
if (menuBtn) {
  menuBtn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuBtn.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', open);
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open'); menuBtn.classList.remove('open');
  }));
}

// Anfrage-Formular → WhatsApp
const form = document.getElementById('wa-form');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const d = new FormData(form);
    const leistungen = d.getAll('leistung');
    const name = (d.get('name') || '').trim();
    const err = document.getElementById('form-error');
    if (!leistungen.length || !name) { err.hidden = false; return; }
    err.hidden = true;
    const zeilen = [
      'Hallo Herr Kless, ich interessiere mich für: ' + leistungen.join(', ') + '.',
      d.get('ort') ? 'Ort: ' + d.get('ort') : '',
      d.get('termin') ? 'Wunschtermin: ' + d.get('termin') : '',
      d.get('text') ? 'Beschreibung: ' + d.get('text') : '',
      'Name: ' + name
    ].filter(Boolean);
    window.open('https://wa.me/491603313379?text=' + encodeURIComponent(zeilen.join('\n')), '_blank', 'noopener');
  });
}
