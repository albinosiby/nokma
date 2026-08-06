import { gsap, ScrollTrigger, isTouch, reduced } from './core.js';
import SplitText from 'gsap/SplitText';

gsap.registerPlugin(SplitText);

/* ─── ripple on every button ────────────────────────────── */
export function initRipples() {
  document.addEventListener('pointerdown', (e) => {
    const host = e.target.closest('[data-ripple]');
    if (!host) return;
    const r = host.getBoundingClientRect();
    const size = Math.max(r.width, r.height) * 1.1;
    const span = document.createElement('span');
    span.className = 'ripple';
    span.style.width = span.style.height = `${size}px`;
    span.style.left = `${e.clientX - r.left - size / 2}px`;
    span.style.top = `${e.clientY - r.top - size / 2}px`;
    host.appendChild(span);
    setTimeout(() => span.remove(), 750);
  });
}

/* ─── 3D tilt for cards and images ──────────────────────── */
export function initTilt(selector, strength = 12) {
  if (isTouch || reduced) return;

  document.querySelectorAll(selector).forEach((el) => {
    const rx = gsap.quickTo(el, 'rotationX', { duration: 0.7, ease: 'power3' });
    const ry = gsap.quickTo(el, 'rotationY', { duration: 0.7, ease: 'power3' });
    const tz = gsap.quickTo(el, 'z', { duration: 0.7, ease: 'power3' });

    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5;
      const ny = (e.clientY - r.top) / r.height - 0.5;
      rx(-ny * strength);
      ry(nx * strength);
      tz(38);
      el.style.setProperty('--mx', `${(nx + 0.5) * 100}%`);
      el.style.setProperty('--my', `${(ny + 0.5) * 100}%`);
    });

    el.addEventListener('pointerleave', () => { rx(0); ry(0); tz(0); });
  });
}

/* ─── magnetic pull on small controls ───────────────────── */
export function initMagnetic(selector, strength = 0.32) {
  if (isTouch || reduced) return;

  document.querySelectorAll(selector).forEach((el) => {
    const mx = gsap.quickTo(el, 'x', { duration: 0.55, ease: 'power3' });
    const my = gsap.quickTo(el, 'y', { duration: 0.55, ease: 'power3' });

    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      mx((e.clientX - (r.left + r.width / 2)) * strength);
      my((e.clientY - (r.top + r.height / 2)) * strength);
    });
    el.addEventListener('pointerleave', () => { mx(0); my(0); });
  });
}

/* ─── scroll reveals ────────────────────────────────────── */
export function initReveals() {
  // simple fade-up
  gsap.utils.toArray('[data-reveal]').forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 86%', once: true },
    });
  });

  // word-by-word headline reveal with a blur lift
  gsap.utils.toArray('[data-reveal-words]').forEach((el) => {
    const split = new SplitText(el, { type: 'lines,words', linesClass: 'rv-line', wordsClass: 'rv-word' });
    gsap.from(split.words, {
      yPercent: 100,
      opacity: 0,
      filter: 'blur(6px)',
      duration: 1.15,
      stagger: 0.035,
      ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 84%', once: true },
      onComplete() {
        gsap.set(split.words, { clearProps: 'filter' });
      },
    });
  });

  // generic image mask reveal
  gsap.utils.toArray('[data-mask]').forEach((el) => {
    gsap.fromTo(
      el,
      { clipPath: 'inset(0% 0% 100% 0%)', scale: 1.12 },
      {
        clipPath: 'inset(0% 0% 0% 0%)',
        scale: 1,
        duration: 1.4,
        ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      }
    );
  });
}

/* ─── generic entrance for injected grids ───────────────── */
export function revealGrid(items, opts = {}) {
  const list = typeof items === 'string' ? gsap.utils.toArray(items) : items;
  if (!list.length) return;
  gsap.to(list, {
    opacity: 1,
    y: 0,
    scale: 1,
    duration: 0.95,
    stagger: opts.stagger ?? 0.07,
    ease: 'power3.out',
    scrollTrigger: { trigger: opts.trigger || list[0], start: opts.start || 'top 84%', once: true },
  });
}

export { ScrollTrigger };
