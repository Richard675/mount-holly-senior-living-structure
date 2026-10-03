/* Mount Holly Senior Living — site behaviour
   01 Navigation & header   04 Gallery filters & lightbox
   02 Social links          05 Inquiry form
   03 Reveal on scroll                                      */
document.documentElement.classList.add('js');
document.body.classList.add('js');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* 01. Accessible mobile navigation & sticky header */
const header = document.querySelector('.header');
const menu = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#site-nav');
const desktopNav = window.matchMedia('(min-width: 1024px)');

if (menu && navigation) {
  menu.hidden = false;
  const label = menu.querySelector('.menu-label');
  const setOpen = (open) => {
    if (open) navigation.style.setProperty('--nav-top', `${Math.max(0, header.getBoundingClientRect().bottom)}px`);
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    label.textContent = open ? 'Close' : 'Menu';
    navigation.classList.toggle('is-open', open);
    document.body.classList.toggle('nav-locked', open);
  };
  const isOpen = () => menu.getAttribute('aria-expanded') === 'true';
  menu.addEventListener('click', () => setOpen(!isOpen()));
  navigation.addEventListener('click', (event) => { if (event.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen()) { setOpen(false); menu.focus(); }
  });
  // Keep keyboard focus inside the open mobile menu
  navigation.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab' || !isOpen()) return;
    const items = [menu, ...navigation.querySelectorAll('a')];
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === navigation.querySelector('a')) { event.preventDefault(); first.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  desktopNav.addEventListener('change', (event) => { if (event.matches) setOpen(false); });
}

if (header) {
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();

/* 02. Social destinations — replace null with your official HTTPS URLs */
const socialLinks = { Facebook: null, Instagram: null, LinkedIn: null, Yelp: null, YouTube: null };
const socialStatus = document.querySelector('.social-status');
document.querySelectorAll('[data-social]').forEach((button) => {
  const name = button.dataset.social;
  const url = socialLinks[name];
  if (url) {
    const link = document.createElement('a');
    link.href = url;
    link.innerHTML = button.innerHTML;
    link.setAttribute('aria-label', `${name} (opens in a new tab)`);
    link.title = name;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    button.replaceWith(link);
  } else {
    button.addEventListener('click', () => {
      if (socialStatus) socialStatus.textContent = `Our ${name} page is coming soon.`;
    });
  }
});

/* 03. Gentle reveal as sections enter the viewport */
const revealItems = document.querySelectorAll('[data-reveal]');
if ('IntersectionObserver' in window && !reduceMotion) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

/* Highlight the service collection in view */
const jumpLinks = [...document.querySelectorAll('.jump-nav a')];
if (jumpLinks.length) {
  const sections = jumpLinks.map((link) => document.getElementById(link.hash.slice(1)));
  let ticking = false;
  const update = () => {
    ticking = false;
    const line = window.innerHeight * 0.4;
    let active = -1;
    sections.forEach((section, i) => { if (section && section.getBoundingClientRect().top <= line) active = i; });
    jumpLinks.forEach((link, i) => { if (i === active) link.setAttribute('aria-current', 'true'); else link.removeAttribute('aria-current'); });
  };
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  update();
}

/* 04. Gallery filters & lightbox */
const grid = document.querySelector('#gallery-grid');
if (grid) {
  const figures = [...grid.querySelectorAll('figure')];
  const filterGroup = document.querySelector('.filters');
  const galleryStatus = document.querySelector('#gallery-status');
  filterGroup.hidden = false;
  filterGroup.addEventListener('click', (event) => {
    const button = event.target.closest('[data-filter]');
    if (!button) return;
    const filter = button.dataset.filter;
    filterGroup.querySelectorAll('[data-filter]').forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
    let shown = 0;
    figures.forEach((figure) => {
      const match = filter === 'all' || figure.dataset.category === filter;
      figure.hidden = !match;
      if (match) shown += 1;
    });
    galleryStatus.textContent = `Showing ${shown} ${shown === 1 ? 'photo' : 'photos'}.`;
  });

  const dialog = document.querySelector('#lightbox');
  const stageImage = dialog.querySelector('.lightbox-stage img');
  const caption = dialog.querySelector('.lightbox-caption');
  const count = dialog.querySelector('.lightbox-count');
  let visible = [];
  let index = 0;
  let opener = null;

  const show = (i) => {
    index = (i + visible.length) % visible.length;
    const figure = visible[index];
    const source = figure.querySelector('img');
    stageImage.src = source.currentSrc || source.src;
    stageImage.alt = source.alt;
    caption.textContent = figure.querySelector('figcaption').textContent;
    count.textContent = `Photo ${index + 1} of ${visible.length}`;
  };
  const open = (figure) => {
    visible = figures.filter((f) => !f.hidden);
    opener = figure.querySelector('.tile');
    show(visible.indexOf(figure));
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
    document.body.classList.add('nav-locked');
  };
  const close = () => {
    if (dialog.open && typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
  };
  dialog.addEventListener('close', () => {
    document.body.classList.remove('nav-locked');
    opener?.focus();
  });

  grid.addEventListener('click', (event) => {
    const tile = event.target.closest('.tile');
    if (tile) open(tile.closest('figure'));
  });
  dialog.addEventListener('click', (event) => {
    const action = event.target.closest('[data-lb]')?.dataset.lb;
    if (action === 'close') close();
    else if (action === 'prev') show(index - 1);
    else if (action === 'next') show(index + 1);
    else if (event.target === dialog || event.target.classList.contains('lightbox-stage')) close();
  });
  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') show(index - 1);
    if (event.key === 'ArrowRight') show(index + 1);
  });
  let touchX = null;
  dialog.addEventListener('touchstart', (event) => { touchX = event.touches[0].clientX; }, { passive: true });
  dialog.addEventListener('touchend', (event) => {
    if (touchX === null) return;
    const delta = event.changedTouches[0].clientX - touchX;
    if (Math.abs(delta) > 50) show(index + (delta < 0 ? 1 : -1));
    touchX = null;
  });
}

/* 05. Inquiry form — submit directly to the server; only show success after delivery is accepted */
const form = document.querySelector('#inquiry-form');
if (form) {
  form.noValidate = true; // JavaScript provides friendlier inline messages
  const button = form.querySelector('[type="submit"]');
  const buttonLabel = button.querySelector('.button-label');
  const buttonIcon = button.querySelector('svg');
  const defaultLabel = buttonLabel.textContent;
  const errorBox = form.querySelector('#form-error');
  const status = form.querySelector('#form-status');
  const success = document.querySelector('#form-success');
  const date = form.querySelector('[type="date"]');
  const message = form.querySelector('#message');
  const counter = form.querySelector('#message-count');

  const today = new Date();
  date.min = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // Pre-select the topic when arriving from a link such as contact.html?interest=care
  const wanted = new URLSearchParams(window.location.search).get('interest');
  const preset = wanted && form.querySelector(`[name="interest"][data-key="${CSS.escape(wanted)}"]`);
  if (preset) preset.checked = true;

  const updateCount = () => { counter.textContent = `${message.value.length} / ${message.maxLength}`; };
  message.addEventListener('input', updateCount);
  updateCount();

  const messages = {
    name: (el) => (el.validity.valueMissing ? 'Please tell us your name.' : ''),
    email: (el) => {
      if (el.validity.valueMissing) return 'Please add your email so we can reply.';
      if (el.validity.typeMismatch || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim())) return 'That email doesn’t look quite right. Please check it, for example name@example.com.';
      return '';
    },
    'visit-date': (el) => (el.value && (el.validity.rangeUnderflow || el.value < el.min) ? 'Please choose today or a future date.' : el.validity.badInput ? 'Please enter a full date.' : '')
  };
  const validateField = (el) => {
    const rule = messages[el.id];
    if (!rule) return true;
    const problem = rule(el);
    const field = el.closest('.field');
    field.classList.toggle('has-error', Boolean(problem));
    field.querySelector('.field-error span').textContent = problem;
    el.setAttribute('aria-invalid', String(Boolean(problem)));
    return !problem;
  };
  const watched = Object.keys(messages).map((id) => form.querySelector(`#${id}`));
  watched.forEach((el) => {
    el.addEventListener('blur', () => { if (el.value || el.closest('.has-error')) validateField(el); });
    el.addEventListener('input', () => { if (el.closest('.has-error')) validateField(el); });
  });

  const setBusy = (busy) => {
    button.disabled = busy;
    button.setAttribute('aria-busy', String(busy));
    buttonLabel.textContent = busy ? 'Sending your inquiry…' : defaultLabel;
    if (busy) { const spin = document.createElement('span'); spin.className = 'spinner'; spin.setAttribute('aria-hidden', 'true'); buttonIcon.replaceWith(spin); }
    else { button.querySelector('.spinner')?.replaceWith(buttonIcon); }
  };
  const showError = (text) => {
    errorBox.querySelector('.alert-message').textContent = text;
    errorBox.hidden = false;
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    errorBox.hidden = true;
    const invalid = watched.filter((el) => !validateField(el));
    if (invalid.length) {
      invalid[0].focus();
      status.textContent = `Please check ${invalid.length === 1 ? 'one field' : `${invalid.length} fields`} before sending.`;
      return;
    }
    setBusy(true);
    status.textContent = 'Sending your inquiry.';
    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      });
      let result;
      try { result = await response.json(); } catch { throw new Error('Our inquiry service isn’t available right now.'); }
      if (!response.ok || !result.ok) throw new Error(result.message || 'Something went wrong on our side.');
      const firstName = form.querySelector('#name').value.trim().split(/\s+/)[0];
      success.querySelector('.success-name').textContent = firstName ? `, ${firstName}` : '';
      if (result.message) success.querySelector('.success-message').textContent = result.message;
      form.reset();
      updateCount();
      form.hidden = true;
      success.hidden = false;
      success.focus();
      success.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
    } catch (error) {
      const text = error instanceof TypeError ? 'Please check your internet connection.' : error.message;
      showError(text);
      status.textContent = '';
      errorBox.focus?.();
    } finally {
      setBusy(false);
    }
  });
}
