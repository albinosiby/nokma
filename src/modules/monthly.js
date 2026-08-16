import { gsap, ScrollTrigger, reduced, isTouch } from './core.js';
import { UNIVERSE } from '../data/catalogue.js';

// One featured product per month — currently the Jackfruit Family Tub.
const MONTHLY_ID = 'family-tub';

const MAX_TURN = 20;
const MAX_PITCH = 10;

// Root-absolute so the path holds up on nested routes too.
const productImage = (image) => `/products/${image.includes('.') ? image : `${image}.webp`}`;

const specsFor = (product) => [
  ['Flavour', product.flavours],
  ['Pack sizes', product.sizes],
  ['Serve', 'Straight from the freezer'],
  ['Storage', 'Keep frozen at −18 °C or below'],
  ['Shelf life', '6 months from manufacture'],
  ['Nutrition', 'Printed on the pack'],
];

/** Product of the month, presented on a 3D stage that leans with the pointer. */
export function initMonthly() {
  const viewport = document.getElementById('monthlyViewport');
  if (!viewport) return;

  const product = UNIVERSE.find((item) => item.id === MONTHLY_ID);
  if (!product) return;

  const stage = document.getElementById('monthlyTilt');

  document.getElementById('monthlyName').textContent = product.name;
  document.getElementById('monthlyBlurb').textContent = product.blurb;
  document.getElementById('monthlySizes').textContent = `${product.flavours} · ${product.sizes}`;
  document.getElementById('monthlySpecs').innerHTML = specsFor(product)
    .map(([term, value]) => `<div><dt>${term}</dt><dd>${value}</dd></div>`).join('');

  const source = productImage(product.img);
  stage.innerHTML = `
    <img class="monthly__word" src="/brand/logo-nokma-header-green.png" alt="" aria-hidden="true" />
    <div class="mtub" id="monthlyTub">
      <img class="mtub__img" src="${source}" alt="${product.name}" fetchpriority="high" decoding="async" />
      <span class="mtub__mirror" style="background-image:url('${source}')" aria-hidden="true"></span>
      <span class="mtub__shadow" aria-hidden="true"></span>
    </div>`;

  const tub = document.getElementById('monthlyTub');
  if (reduced) return;

  /* ── the pack turns with the pointer, then settles back ── */
  if (!isTouch) {
    const turn = gsap.quickTo(stage, 'rotationY', { duration: 0.5, ease: 'power3.out' });
    const pitch = gsap.quickTo(stage, 'rotationX', { duration: 0.5, ease: 'power3.out' });

    viewport.addEventListener('pointermove', (event) => {
      const box = viewport.getBoundingClientRect();
      turn(((event.clientX - box.left) / box.width - 0.5) * MAX_TURN);
      pitch(((event.clientY - box.top) / box.height - 0.5) * -MAX_PITCH);
    });

    viewport.addEventListener('pointerleave', () => {
      gsap.to(stage, { rotationX: 0, rotationY: 0, duration: 1.1, ease: 'elastic.out(1, 0.55)', overwrite: true });
    });
  }

  /* ── ambient motion ───────────────────────────────────── */
  // The pack floats while its ground shadow stays put, which reads as height.
  gsap.to(tub.querySelector('.mtub__img'), {
    y: -14,
    duration: 3.6,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: -1,
  });

  gsap.from(tub, {
    opacity: 0,
    y: 60,
    scale: 0.9,
    duration: 1.1,
    ease: 'power3.out',
    scrollTrigger: { trigger: viewport, start: 'top 88%', once: true },
  });

  ScrollTrigger.refresh();
}
