import { gsap, ScrollTrigger, reduced, lenis } from './core.js';
import { UNIVERSE } from './data.js';

const FAMILIES = [
  {
    id: 'ice-cream',
    label: 'Nokma Ice Cream',
    note: '5 product formats',
    img: 'family-tubs/jackfruit.png',
    variants: [
      { id: 'family-tub', label: 'Family Tub', match: (p) => p.id.startsWith('family-tub') },
      { id: 'iml', label: 'IML', match: (p) => p.id.startsWith('iml-') },
      { id: 'cone', label: 'Cone', match: (p) => p.id.startsWith('cone-') },
      { id: 'cup', label: 'Cup', match: (p) => p.id.startsWith('cup-') },
      { id: 'mono-carton', label: 'Mono Carton', match: (p) => p.id.startsWith('carton-') },
    ],
  },
  {
    id: 'drinks',
    label: 'Nokma Beverages',
    note: 'Drinks and water',
    img: 'drink-passion',
    variants: [
      { id: 'fruit-drinks', label: 'Fruit Drinks', match: (p) => p.id.startsWith('drink-') },
      { id: 'water', label: 'Packaged Water', match: (p) => p.id === 'water-bottle' },
    ],
  },
  {
    id: 'chips',
    label: 'Nokma Chips',
    note: '2 crunchy styles',
    img: 'chips-crispy',
    variants: [
      { id: 'crispy', label: 'Crispy', match: (p) => p.id === 'chips-crispy' },
      { id: 'plain', label: 'Plain', match: (p) => p.id === 'chips-plain' },
    ],
  },
  {
    id: 'spices',
    label: 'Nokma Spices',
    note: '3 kitchen essentials',
    img: 'spice-turmeric',
    variants: [],
  },
];

const FROZEN = 'Store frozen at −18 °C or below · Shelf life 6 months from manufacture';
const AMBIENT = 'Store in a cool, dry place away from sunlight · Best before 12 months from manufacture';
const productImage = (image) => `./products/${image.includes('.') ? image : `${image}.webp`}`;

/** Product explorer with a highlighted product and supporting catalogue. */
export function initUniverse() {
  const field = document.getElementById('uniField');
  const familyBar = document.getElementById('uniFamilies');
  const variantBar = document.getElementById('uniVariants');
  const groupTitle = document.getElementById('uniGroupTitle');
  const count = document.getElementById('uniCount');
  if (!field) return;

  /* ── cards ────────────────────────────────────────────── */
  UNIVERSE.forEach((p) => {
    const c = document.createElement('article');
    c.className = 'ucard';
    c.dataset.id = p.id;
    c.dataset.cat = p.cat;
    c.tabIndex = 0;
    c.setAttribute('role', 'button');
    c.setAttribute('aria-pressed', 'false');
    c.setAttribute('aria-label', `View details for ${p.name} — ${p.sizes}`);
    c.innerHTML = `
      <div class="ucard__media">
        <img src="${productImage(p.img)}" alt="${p.name}" loading="lazy" decoding="async" />
      </div>
      <div class="ucard__body">
        <p class="ucard__kicker">${p.kicker}</p>
        <h3 class="ucard__name">${p.name}</h3>
        <p class="ucard__sizes">${p.sizes}</p>
        <span class="ucard__action" aria-hidden="true">View details <span>→</span></span>
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
  const featuredId = 'family-tub';
  const featuredProduct = UNIVERSE.find((product) => product.id === featuredId);
  let activeId = featuredId;

  function renderSpotlight() {
    if (!featuredProduct) return;

    spotlight.root.dataset.cat = featuredProduct.cat;
    spotlight.img.src = productImage(featuredProduct.img);
    spotlight.img.alt = featuredProduct.name;
    spotlight.kicker.textContent = featuredProduct.kicker;
    spotlight.name.textContent = featuredProduct.name;
    spotlight.sizes.textContent = featuredProduct.sizes;
    spotlight.blurb.textContent = featuredProduct.blurb;
  }

  function highlight(id) {
    const product = UNIVERSE.find((item) => item.id === id);
    if (!product) return;

    activeId = id;
    cards.forEach((card) => {
      const active = card.dataset.id === id;
      card.classList.toggle('is-active', active);
      card.setAttribute('aria-pressed', String(active));
    });

  }

  let activeFamily = FAMILIES[0];
  let activeVariant = activeFamily.variants[0];

  function renderFamilies() {
    familyBar.innerHTML = FAMILIES.map((family) => `
      <button class="ufamily${family.id === activeFamily.id ? ' is-on' : ''}" type="button" role="tab"
        aria-selected="${family.id === activeFamily.id}" data-family="${family.id}" data-cursor="link">
        <span class="ufamily__copy">
          <span class="ufamily__label">${family.label}</span>
          <small>${family.note}</small>
        </span>
        <span class="ufamily__media"><img src="${productImage(family.img)}" alt="" loading="lazy" decoding="async" /></span>
      </button>`).join('');
  }

  function renderVariants() {
    variantBar.hidden = activeFamily.variants.length === 0;
    variantBar.innerHTML = activeFamily.variants.map((variant) => `
      <button class="uvariant${variant.id === activeVariant.id ? ' is-on' : ''}" type="button" role="tab"
        aria-selected="${variant.id === activeVariant.id}" data-variant="${variant.id}" data-cursor="link">
        ${variant.label}
      </button>`).join('');
  }

  function showVariant() {
    const visible = cards.filter((card) => {
      const product = UNIVERSE.find((item) => item.id === card.dataset.id);
      const show = product?.cat === activeFamily.id && (!activeVariant || activeVariant.match(product));
      card.hidden = !show;
      return show;
    });

    groupTitle.textContent = activeFamily.label;
    count.textContent = activeVariant
      ? `${visible.length} variant${visible.length === 1 ? '' : 's'}`
      : `${visible.length} product${visible.length === 1 ? '' : 's'}`;

    if (!visible.some((card) => card.dataset.id === activeId) && visible[0]) {
      highlight(visible[0].dataset.id);
    } else {
      highlight(activeId);
    }

    ScrollTrigger.refresh();
  }

  familyBar.addEventListener('click', (e) => {
    const button = e.target.closest('.ufamily');
    if (!button) return;

    activeFamily = FAMILIES.find((family) => family.id === button.dataset.family) || activeFamily;
    activeVariant = activeFamily.variants[0] ?? null;
    renderFamilies();
    renderVariants();
    showVariant();
  });

  variantBar.addEventListener('click', (e) => {
    const button = e.target.closest('.uvariant');
    if (!button) return;

    activeVariant = activeFamily.variants.find((variant) => variant.id === button.dataset.variant) || activeVariant;
    renderVariants();
    showVariant();
  });

  renderFamilies();
  renderVariants();
  renderSpotlight();
  showVariant();

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
    els.img.src = productImage(p.img);
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

  spotlight.button.addEventListener('click', () => open(featuredId));

  cards.forEach((c) => {
    c.addEventListener('click', () => {
      highlight(c.dataset.id);
      open(c.dataset.id);
    });
    c.addEventListener('focus', () => highlight(c.dataset.id));
    c.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        highlight(c.dataset.id);
        open(c.dataset.id);
      }
    });
  });

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
