import { gsap, ScrollTrigger, reduced, lenis } from './core.js';
import { UNIVERSE } from './data.js';

const FILTERS = [
  { id: 'all', label: 'Everything' },
  { id: 'ice-cream', label: 'Ice Cream' },
  { id: 'drinks', label: 'Drinks & Water' },
  { id: 'chips', label: 'Banana Chips' },
  { id: 'spices', label: 'Spices' },
  { id: 'bulk', label: 'Bulk & Dehydrated' },
];

const FROZEN = 'Store frozen at −18 °C or below · Shelf life 6 months from manufacture';
const AMBIENT = 'Store in a cool, dry place away from sunlight · Best before 12 months from manufacture';

/** Product explorer with a highlighted product and supporting catalogue. */
export function initUniverse() {
  const field = document.getElementById('uniField');
  const filterBar = document.getElementById('uniFilters');
  const count = document.getElementById('uniCount');
  if (!field) return;

  /* ── filters ──────────────────────────────────────────── */
  FILTERS.forEach((f, i) => {
    const b = document.createElement('button');
    b.className = `ufilter${i === 0 ? ' is-on' : ''}`;
    b.type = 'button';
    b.dataset.cat = f.id;
    b.textContent = f.label;
    b.setAttribute('data-cursor', 'link');
    filterBar.appendChild(b);
  });

  /* ── cards ────────────────────────────────────────────── */
  UNIVERSE.forEach((p) => {
    const c = document.createElement('article');
    c.className = 'ucard';
    c.dataset.id = p.id;
    c.dataset.cat = p.cat;
    c.tabIndex = 0;
    c.setAttribute('role', 'button');
    c.setAttribute('aria-pressed', 'false');
    c.setAttribute('aria-label', `Highlight ${p.name} — ${p.sizes}`);
    c.innerHTML = `
      <div class="ucard__media">
        <img src="./products/${p.img}.webp" alt="${p.name}" loading="lazy" decoding="async" />
      </div>
      <div class="ucard__body">
        <p class="ucard__kicker">${p.kicker}</p>
        <h3 class="ucard__name">${p.name}</h3>
        <p class="ucard__sizes">${p.sizes}</p>
      </div>`;
    field.appendChild(c);
  });

  const cards = [...field.querySelectorAll('.ucard')];

  const spotlight = {
    root: document.getElementById('uniSpotlight'),
    img: document.getElementById('spotlightImg'),
    kicker: document.getElementById('spotlightKicker'),
    name: document.getElementById('spotlightName'),
    sizes: document.getElementById('spotlightSizes'),
    blurb: document.getElementById('spotlightBlurb'),
    button: document.getElementById('spotlightButton'),
  };
  const dock = {
    root: document.getElementById('selectionDock'),
    img: document.getElementById('selectionDockImg'),
    name: document.getElementById('selectionDockName'),
    sizes: document.getElementById('selectionDockSizes'),
    button: document.getElementById('selectionDockButton'),
  };
  let activeId = UNIVERSE[0].id;
  let dockRequested = false;
  let universeVisible = false;

  const syncDockVisibility = () => {
    const visible = dockRequested && universeVisible;
    dock.root?.classList.toggle('is-visible', visible);
    dock.root?.setAttribute('aria-hidden', String(!visible));
  };

  function highlight(id, { showDock = false } = {}) {
    const product = UNIVERSE.find((item) => item.id === id);
    if (!product) return;

    activeId = id;
    if (showDock) dockRequested = true;
    spotlight.root.dataset.cat = product.cat;
    spotlight.img.src = `./products/${product.img}.webp`;
    spotlight.img.alt = product.name;
    spotlight.kicker.textContent = product.kicker;
    spotlight.name.textContent = product.name;
    spotlight.sizes.textContent = product.sizes;
    spotlight.blurb.textContent = product.blurb;
    dock.img.src = `./products/${product.img}.webp`;
    dock.img.alt = '';
    dock.name.textContent = product.name;
    dock.sizes.textContent = product.sizes;

    cards.forEach((card) => {
      const active = card.dataset.id === id;
      card.classList.toggle('is-active', active);
      card.setAttribute('aria-pressed', String(active));
    });

    syncDockVisibility();
  }

  highlight(activeId);
  count.textContent = `${UNIVERSE.length} products`;

  /* ── filtering ────────────────────────────────────────── */
  filterBar.addEventListener('click', (e) => {
    const btn = e.target.closest('.ufilter');
    if (!btn) return;

    filterBar.querySelectorAll('.ufilter').forEach((b) => b.classList.toggle('is-on', b === btn));
    const cat = btn.dataset.cat;

    cards.forEach((c) => {
      const show = cat === 'all' || c.dataset.cat === cat;
      c.hidden = !show;
    });
    const visible = cards.filter((card) => !card.hidden);
    count.textContent = `${visible.length} product${visible.length === 1 ? '' : 's'}`;
    if (!visible.some((card) => card.dataset.id === activeId) && visible[0]) {
      highlight(visible[0].dataset.id, { showDock: dockRequested });
    }
    ScrollTrigger.refresh();
  });

  /* ── detail modal ─────────────────────────────────────── */
  const pdp = document.getElementById('pdp');
  const card = document.getElementById('pdpCard');
  const els = {
    img: document.getElementById('pdpImg'),
    kicker: document.getElementById('pdpKicker'),
    name: document.getElementById('pdpName'),
    sizes: document.getElementById('pdpSizes'),
    blurb: document.getElementById('pdpBlurb'),
    flavours: document.getElementById('pdpFlavours'),
    storage: document.getElementById('pdpStorage'),
  };

  let lastFocus = null;

  function open(id) {
    const p = UNIVERSE.find((x) => x.id === id);
    if (!p) return;

    lastFocus = document.activeElement;
    els.img.src = `./products/${p.img}.webp`;
    els.img.alt = p.name;
    els.kicker.textContent = p.kicker;
    els.name.textContent = p.name;
    els.sizes.textContent = p.sizes;
    els.blurb.textContent = p.blurb;
    els.flavours.textContent = p.flavours;
    els.storage.textContent = p.cat === 'ice-cream' ? FROZEN : AMBIENT;

    pdp.classList.add('is-open');
    pdp.setAttribute('aria-hidden', 'false');
    lenis?.stop();
    document.body.style.overflow = 'hidden';

    if (!reduced) {
      gsap.fromTo(
        els.img,
        { scale: 0.94, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.45, ease: 'power2.out', delay: 0.08 }
      );
      gsap.fromTo(
        card.querySelectorAll('.pdp__kicker, .pdp__name, .pdp__sizes, .pdp__blurb, .pdp__row, .pdp .btn'),
        { y: 22, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.055, ease: 'power3.out', delay: 0.18 }
      );
    }

    setTimeout(() => pdp.querySelector('.pdp__x')?.focus(), 120);
  }

  function close() {
    pdp.classList.remove('is-open');
    pdp.setAttribute('aria-hidden', 'true');
    lenis?.start();
    document.body.style.overflow = '';
    lastFocus?.focus?.();
  }

  spotlight.button.addEventListener('click', () => open(activeId));
  dock.button?.addEventListener('click', () => open(activeId));

  cards.forEach((c) => {
    c.addEventListener('click', () => highlight(c.dataset.id, { showDock: true }));
    c.addEventListener('focus', () => highlight(c.dataset.id, { showDock: true }));
    c.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        highlight(c.dataset.id, { showDock: true });
      }
    });
  });

  const universe = document.getElementById('universe');
  if (universe) {
    const observer = new IntersectionObserver(([entry]) => {
      universeVisible = entry.isIntersecting;
      syncDockVisibility();
    }, { threshold: 0.05 });
    observer.observe(universe);
  }

  pdp.addEventListener('click', (e) => { if (e.target.closest('[data-pdp-close]')) close(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && pdp.classList.contains('is-open')) close();
  });

  // keep focus inside the dialog while it is open
  pdp.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const focusables = pdp.querySelectorAll('button, a[href], input, select, textarea');
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

}
