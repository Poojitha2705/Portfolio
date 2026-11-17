/* =========================================================
   Poojitha Singamreddy — Portfolio interactions (vanilla JS)
   1 Theme · 2 Mobile nav · 3 Active link · 4 Reveal · 5 Misc · 6 Form
   ========================================================= */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const root = document.documentElement;
  root.classList.add('js');

  /* ---------- 1. THEME ----------
     Default = alternating light/dark sections.
     "flip" = every section swaps to its opposite, so a visitor can
     see the whole site in the other mood. Saved in localStorage;
     first visit follows the system preference. */
  const KEY = 'ps-theme';
  const saved = (() => { try { return localStorage.getItem(KEY); } catch { return null; } })();
  const systemDark = matchMedia('(prefers-color-scheme: dark)').matches;
  // System dark → start flipped (dark hero); otherwise intended default.
  applyTheme(saved || (systemDark ? 'flip' : 'default'));

  function applyTheme(mode) {
    if (mode === 'flip') root.setAttribute('data-theme', 'flip'); else root.removeAttribute('data-theme');
    $('#themeBtn').setAttribute('aria-pressed', mode === 'flip');
  }
  $('#themeBtn').addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'flip' ? 'default' : 'flip';
    applyTheme(next);
    try { localStorage.setItem(KEY, next); } catch { /* storage unavailable */ }
  });

  /* ---------- 2. MOBILE NAV ---------- */
  const burger = $('#burger'), links = $('#links');
  const setMenu = open => { links.classList.toggle('open', open); burger.setAttribute('aria-expanded', open); };
  burger.addEventListener('click', () => setMenu(!links.classList.contains('open')));
  $$('a', links).forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  /* ---------- 3. ACTIVE NAV HIGHLIGHT ---------- */
  const navLinks = $$('.links a[href^="#"]');
  const map = { education: 'about', certifications: 'about' }; // sub-sections highlight "About"
  const spy = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const id = map[en.target.id] || en.target.id;
      navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach(s => spy.observe(s));

  /* ---------- 4. SCROLL REVEAL ---------- */
  const io = new IntersectionObserver((entries, o) => entries.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add('in'); o.unobserve(en.target); }
  }), { threshold: .12 });
  $$('.reveal').forEach((el, i) => { el.style.transitionDelay = (i % 4) * 80 + 'ms'; io.observe(el); });

  /* ---------- 5. MISC ---------- */
  const toTop = $('#toTop');
  addEventListener('scroll', () => toTop.classList.toggle('show', scrollY > 600), { passive: true });
  toTop.addEventListener('click', () => scrollTo({ top: 0 }));
  $('#yr').textContent = new Date().getFullYear();
  // Placeholder links do nothing until a real URL is added in index.html
  $$('[data-todo]').forEach(a => a.addEventListener('click', e => e.preventDefault()));
  // Fallback if the profile photo is missing: show initials instead of a broken image
  const photo = $('.portrait img');
  photo.addEventListener('error', () => {
    photo.removeAttribute('src');
    photo.alt = 'PS';
  });

  /* ---------- 6. CONTACT FORM (validation only) ---------- */
  const form = $('#form'), note = $('#formNote');
  const rules = {
    name: v => v.trim().length >= 2 || 'Please enter your name.',
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || 'Please enter a valid email address.',
    message: v => v.trim().length >= 10 || 'Message should be at least 10 characters.'
  };
  const check = field => {
    const res = rules[field.name](field.value);
    const bad = res !== true;
    field.classList.toggle('invalid', bad);
    field.setAttribute('aria-invalid', bad);
    field.parentElement.querySelector('.err').textContent = bad ? res : '';
    return !bad;
  };
  $$('input, textarea', form).forEach(f => f.addEventListener('blur', () => check(f)));
  form.addEventListener('submit', e => {
    e.preventDefault();
    const ok = $$('input, textarea', form).map(check).every(Boolean);
    if (!ok) { note.textContent = 'Please fix the highlighted fields.'; return; }
    // No backend is connected, so no fake "sent" message. Open the visitor's
    // email app with the message pre-filled instead — honest and functional.
    // To use a real service later, replace this block with a fetch() call.
    const d = new FormData(form);
    const body = encodeURIComponent(`${d.get('message')}\n\n— ${d.get('name')} (${d.get('email')})`);
    note.textContent = 'Opening your email app to send this message…';
    location.href = `mailto:poojithasingammay27@gmail.com?subject=${encodeURIComponent('Portfolio enquiry from ' + d.get('name'))}&body=${body}`;
  });
})();
