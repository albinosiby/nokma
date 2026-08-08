import { gsap, ScrollTrigger, reduced, lenis } from './core.js';
import { UNIVERSE } from '../data/catalogue.js';

const FAMILIES = [
  {
    id: 'ice-cream',
    label: 'Nokma Ice Cream',
    note: '5 product formats',
    img: 'categories/ice-cream.png',
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
    img: 'categories/beverages.png',
    variants: [
      { id: 'fruit-drinks', label: 'Fruit Drinks', match: (p) => p.id.startsWith('drink-') },
      { id: 'water', label: 'Packaged Water', match: (p) => p.id === 'water-bottle' },
    ],
  },
  {
    id: 'chips',
    label: 'Nokma Chips',
    note: '2 crunchy styles',
    img: 'chips/chips-crispy',
    variants: [
      { id: 'crispy', label: 'Crispy', match: (p) => p.id === 'chips-crispy' },
      { id: 'plain', label: 'Plain', match: (p) => p.id === 'chips-plain' },
    ],
  },
  {
    id: 'spices',
    label: 'Nokma Spices',
    note: '3 kitchen essentials',
    img: 'categories/spices.png',
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
  const panel = document.getElementById('uniPanel');
  const panelClose = document.getElementById('uniClose');
  if (!field) return;

  /* ── cards ────────────────────────────────────────────── */
  let cards = [];

  function renderCards(products) {
    field.innerHTML = products.map((p, index) => `
      <article class="ucard" data-id="${p.id}" data-cat="${p.cat}" tabindex="0"
        role="button" aria-pressed="false" aria-label="View details for ${p.name} — ${p.sizes}">
      <div class="ucard__media">
        <img src="${productImage(p.img)}" alt="${p.name}"
          loading="${index < 4 ? 'eager' : 'lazy'}"
          fetchpriority="${index < 2 ? 'high' : 'auto'}"
          decoding="async" />
      </div>
      <div class="ucard__body">
        <h3 class="ucard__name">${p.name}</h3>
        <p class="ucard__sizes">${p.sizes}</p>
        <span class="ucard__action" aria-hidden="true">View details <span>→</span></span>
      </div>
      </article>`).join('');

    cards = [...field.querySelectorAll('.ucard')];
  }

  const spotlight = {
    root: document.getElementById('uniSpotlight'),
    img: document.getElementById('spotlightImg'),
    productName: document.getElementById('spotlightProductName'),
    name: document.getElementById('spotlightName'),
    sizes: document.getElementById('spotlightSizes'),
    details: document.getElementById('spotlightDetails'),
    blurb: document.getElementById('spotlightBlurb'),
    flavours: document.getElementById('spotlightFlavours'),
    index: document.getElementById('spotlightIndex'),
    frameLabel: document.getElementById('spotlightFrameLabel'),
    previous: document.getElementById('spotlightPrev'),
    next: document.getElementById('spotlightNext'),
  };
  const monthlyPickIds = ['family-tub'];
  const monthlyPicks = monthlyPickIds.map((id) => UNIVERSE.find((product) => product.id === id)).filter(Boolean);
  let monthlyIndex = 0;
  let monthlyFrameIndex = 0;
  let featuredProduct = monthlyPicks[monthlyIndex] || UNIVERSE[0];
  let activeId = featuredProduct?.id;

  const monthlyCards = [...spotlight.root.querySelectorAll('.monthly-card')];

  function setMonthlyFrame(index) {
    if (!monthlyCards.length) return;
    monthlyFrameIndex = index % monthlyCards.length;
    monthlyCards.forEach((card, cardIndex) => {
      const active = cardIndex === monthlyFrameIndex;
      card.classList.toggle('is-active', active);
      card.setAttribute('aria-hidden', String(!active));
    });
    spotlight.frameLabel.textContent = `${String(monthlyFrameIndex + 1).padStart(2, '0')} / ${String(monthlyCards.length).padStart(2, '0')}`;
  }

  function renderSpotlight(animate = false) {
    if (!featuredProduct) return;

    const update = () => {
      spotlight.root.dataset.cat = featuredProduct.cat;
      spotlight.img.decoding = 'async';
      spotlight.img.fetchPriority = 'high';
      spotlight.img.src = productImage(featuredProduct.img);
      spotlight.img.alt = featuredProduct.name;
      spotlight.productName.textContent = featuredProduct.name;
      spotlight.name.textContent = featuredProduct.name;
      spotlight.sizes.textContent = featuredProduct.sizes;
      spotlight.details.textContent = featuredProduct.blurb;
      spotlight.blurb.textContent = featuredProduct.blurb;
      spotlight.flavours.textContent = featuredProduct.flavours;
      spotlight.index.textContent = `${String(monthlyIndex + 1).padStart(2, '0')} / ${String(monthlyPicks.length).padStart(2, '0')}`;
    };

    const frames = spotlight.root.querySelectorAll('.monthly-card__inner');
    if (!animate || reduced) { update(); return; }

    gsap.to(frames, {
      opacity: 0,
      y: -18,
      scale: 0.985,
      duration: 0.24,
      stagger: 0.055,
      ease: 'power2.in',
      onComplete: () => {
        update();
        gsap.fromTo(frames, { opacity: 0, y: 22, scale: 0.985 }, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.58,
          stagger: 0.08,
          ease: 'power3.out',
        });
      },
    });
  }

  function rotateMonthlyPick() {
    if (monthlyPicks.length < 2) return;
    monthlyIndex = (monthlyIndex + 1) % monthlyPicks.length;
    featuredProduct = monthlyPicks[monthlyIndex];
    renderSpotlight(false);
  }

  function changeMonthlyFrame(direction) {
    const nextFrame = monthlyFrameIndex + direction;
    if (nextFrame >= monthlyCards.length) {
      rotateMonthlyPick();
      setMonthlyFrame(0);
      return;
    }
    if (nextFrame < 0) {
      if (monthlyPicks.length > 1) {
        monthlyIndex = (monthlyIndex - 1 + monthlyPicks.length) % monthlyPicks.length;
        featuredProduct = monthlyPicks[monthlyIndex];
        renderSpotlight(false);
      }
      setMonthlyFrame(monthlyCards.length - 1);
      return;
    }
    setMonthlyFrame(nextFrame);
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

  // No category is selected at first — visitors see only the category cards.
  let activeFamily = null;
  let activeVariant = null;

  function renderFamilies() {
    familyBar.innerHTML = FAMILIES.map((family) => `
      <button class="ufamily${activeFamily && family.id === activeFamily.id ? ' is-on' : ''}" type="button" role="tab"
        aria-selected="${Boolean(activeFamily && family.id === activeFamily.id)}" data-family="${family.id}" data-cursor="link">
        <span class="ufamily__media"><img src="${productImage(family.img)}" alt="" loading="lazy" decoding="async" /></span>
        <span class="ufamily__copy">
          <span class="ufamily__label">${family.label}</span>
          <small>${family.note}</small>
        </span>
        <span class="ufamily__cta" aria-hidden="true">View products <span>→</span></span>
      </button>`).join('');
  }

  function renderVariants() {
    variantBar.hidden = !activeFamily || activeFamily.variants.length === 0;
    if (!activeFamily) { variantBar.innerHTML = ''; return; }
    variantBar.innerHTML = activeFamily.variants.map((variant) => `
      <button class="uvariant${variant.id === activeVariant.id ? ' is-on' : ''}" type="button" role="tab"
        aria-selected="${variant.id === activeVariant.id}" data-variant="${variant.id}" data-cursor="link">
        ${variant.label}
      </button>`).join('');
  }

  function showVariant() {
    if (!activeFamily) return;
    const visible = UNIVERSE.filter((product) => (
      product.cat === activeFamily.id && (!activeVariant || activeVariant.match(product))
    ));
    renderCards(visible);

    groupTitle.textContent = activeFamily.label;
    count.textContent = activeVariant
      ? `${visible.length} variant${visible.length === 1 ? '' : 's'}`
      : `${visible.length} product${visible.length === 1 ? '' : 's'}`;

    if (!visible.some((product) => product.id === activeId) && visible[0]) {
      highlight(visible[0].id);
    } else {
      highlight(activeId);
    }

    ScrollTrigger.refresh();
  }

  function openPanel() {
    panel.hidden = false;
    document.getElementById('uniSpace')?.classList.add('is-browsing');
    if (!reduced) {
      gsap.fromTo(panel, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' });
    }
  }

  function closePanel() {
    activeFamily = null;
    activeVariant = null;
    panel.hidden = true;
    document.getElementById('uniSpace')?.classList.remove('is-browsing');
    renderFamilies();
    ScrollTrigger.refresh();
  }

  function selectFamily(familyId, { allowToggle = false, scroll = true } = {}) {
    const picked = FAMILIES.find((family) => family.id === familyId);
    if (!picked) return;

    // tapping the open category again collapses the list
    if (allowToggle && activeFamily && picked.id === activeFamily.id) { closePanel(); return; }

    const wasClosed = panel.hidden;
    activeFamily = picked;
    activeVariant = activeFamily.variants[0] ?? null;
    renderFamilies();
    renderVariants();
    showVariant();
    if (wasClosed) openPanel();
    if (!scroll) return;

    // On mobile, keep the compact category strip in view; otherwise scroll to products.
    const mobile = window.matchMedia('(max-width: 700px)').matches;
    const target = mobile ? familyBar : panel;
    const offset = mobile ? -78 : -90;
    if (lenis) lenis.scrollTo(target, { offset, duration: 0.85 });
    else target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });

    // Keep the selected category chip visible in the horizontal strip.
    if (mobile) {
      const selected = familyBar.querySelector(`.ufamily[data-family="${picked.id}"]`);
      requestAnimationFrame(() => {
        selected?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', inline: 'center', block: 'nearest' });
      });
    }
  }

  familyBar.addEventListener('click', (e) => {
    const button = e.target.closest('.ufamily');
    if (!button) return;
    selectFamily(button.dataset.family, { allowToggle: true });
  });

  window.addEventListener('nokma:open-family', (event) => {
    selectFamily(event.detail?.family);
  });

  panelClose.addEventListener('click', closePanel);

  variantBar.addEventListener('click', (e) => {
    const button = e.target.closest('.uvariant');
    if (!button) return;

    activeVariant = activeFamily.variants.find((variant) => variant.id === button.dataset.variant) || activeVariant;
    renderVariants();
    showVariant();
  });

  renderFamilies();
  renderSpotlight();
  setMonthlyFrame(0);

  let monthlyTimer = null;
  const startMonthlyTimer = () => {
    if (reduced || monthlyCards.length < 2) return;
    window.clearInterval(monthlyTimer);
    monthlyTimer = window.setInterval(() => changeMonthlyFrame(1), 4200);
  };
  const stopMonthlyTimer = () => window.clearInterval(monthlyTimer);

  if (!reduced && monthlyCards.length > 1) {
    startMonthlyTimer();
    spotlight.root.addEventListener('pointerenter', stopMonthlyTimer);
    spotlight.root.addEventListener('pointerleave', () => {
      startMonthlyTimer();
    });
  }

  spotlight.previous.addEventListener('click', () => {
    changeMonthlyFrame(-1);
    startMonthlyTimer();
  });
  spotlight.next.addEventListener('click', () => {
    changeMonthlyFrame(1);
    startMonthlyTimer();
  });

  /* ── detail modal ─────────────────────────────────────── */
  const pdp = document.getElementById('pdp');
  const card = document.getElementById('pdpCard');
  const els = {
    img: document.getElementById('pdpImg'),
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
    els.img.fetchPriority = 'high';
    els.img.src = productImage(p.img);
    els.img.alt = p.name;
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
        card.querySelectorAll('.pdp__name, .pdp__sizes, .pdp__blurb, .pdp__row, .pdp .btn'),
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

  field.addEventListener('click', (e) => {
    const productCard = e.target.closest('.ucard');
    if (!productCard) return;

    highlight(productCard.dataset.id);
    open(productCard.dataset.id);
  });

  field.addEventListener('focusin', (e) => {
    const productCard = e.target.closest('.ucard');
    if (productCard) highlight(productCard.dataset.id);
  });

  field.addEventListener('keydown', (e) => {
    const productCard = e.target.closest('.ucard');
    if (!productCard || (e.key !== 'Enter' && e.key !== ' ')) return;

    e.preventDefault();
    highlight(productCard.dataset.id);
    open(productCard.dataset.id);
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
