import { gsap, reduced } from './core.js';
import { ISLANDS, UNIVERSE } from './data.js';

/**
 * Product category islands. Clicking one flies the camera to it —
 * the world scales and pans so the chosen island fills the stage —
 * and reveals what lives on it.
 */
export function initIslands() {
  const world = document.getElementById('islWorld');
  const panel = document.getElementById('islPanel');
  if (!world) return;

  ISLANDS.forEach((isl) => {
    const el = document.createElement('button');
    el.className = 'island';
    el.type = 'button';
    el.dataset.id = isl.id;
    el.setAttribute('aria-label', `${isl.label} — ${isl.count}`);
    el.innerHTML = `
      <div class="island__rock">
        <img class="island__prod" src="./products/${isl.img}.webp" alt="" loading="lazy" decoding="async" />
      </div>
      <div class="island__ico" aria-hidden="true">${isl.icon}</div>
      <div class="island__label">${isl.label}</div>
      <div class="island__count">${isl.count}</div>`;
    world.appendChild(el);
  });

  const items = [...world.querySelectorAll('.island')];
  let focused = null;

  /* ── camera fly ───────────────────────────────────────── */
  function fly(id) {
    const target = items.find((i) => i.dataset.id === id);
    if (!target) return;

    // toggle off
    if (focused === id) return reset();
    focused = id;

    const wr = world.getBoundingClientRect();
    const tr = target.getBoundingClientRect();
    const dx = wr.left + wr.width / 2 - (tr.left + tr.width / 2);
    const dy = wr.top + wr.height / 2 - (tr.top + tr.height / 2);

    gsap.to(world, {
      x: dx * 0.9,
      y: dy * 0.55,
      scale: 1.42,
      duration: 1.15,
      ease: 'power3.inOut',
    });

    items.forEach((el) => {
      el.classList.toggle('is-dim', el !== target);
      el.classList.toggle('is-focus', el === target);
    });

    showPanel(id);
  }

  function reset() {
    focused = null;
    gsap.to(world, { x: 0, y: 0, scale: 1, duration: 1, ease: 'power3.inOut' });
    items.forEach((el) => el.classList.remove('is-dim', 'is-focus'));
    gsap.to(panel, {
      opacity: 0,
      y: 12,
      duration: 0.35,
      onComplete: () => { panel.innerHTML = ''; gsap.set(panel, { clearProps: 'all' }); },
    });
  }

  function showPanel(id) {
    const isl = ISLANDS.find((i) => i.id === id);
    const products = UNIVERSE.filter((p) => p.cat === id);

    panel.innerHTML = `
      <div class="ipanel">
        <p class="ipanel__line">${isl.line}</p>
        <div class="ipanel__items">
          ${products.map((p) => `<span>${p.name}</span>`).join('')}
        </div>
        <a class="btn btn--ghost" href="#universe" data-ripple data-cursor="link">
          <span>See all ${isl.label.toLowerCase()}</span>
        </a>
      </div>`;

    const box = panel.querySelector('.ipanel');
    if (reduced) { gsap.set(box, { opacity: 1 }); return; }

    gsap.fromTo(box, { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' });
    gsap.from(box.querySelectorAll('.ipanel__items span'), {
      opacity: 0,
      y: 14,
      scale: 0.9,
      duration: 0.5,
      stagger: 0.035,
      ease: 'back.out(2)',
      delay: 0.15,
    });
  }

  world.addEventListener('click', (e) => {
    const el = e.target.closest('.island');
    if (el) fly(el.dataset.id);
  });

  // clicking the empty space around the world flies back out
  document.getElementById('islands').addEventListener('click', (e) => {
    if (focused && !e.target.closest('.island') && !e.target.closest('.ipanel')) reset();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && focused) reset();
  });
}
