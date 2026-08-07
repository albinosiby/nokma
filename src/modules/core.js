import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

export const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
export const isMobile = window.matchMedia('(max-width: 760px)').matches;

export let lenis = null;

export function initSmoothScroll() {
  if (reduced) {
    // Native scrolling only — still let ScrollTrigger drive the scenes.
    document.documentElement.style.scrollBehavior = 'auto';
    return null;
  }

  lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    syncTouch: false,
    touchMultiplier: 1.6,
  });

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  if (import.meta.env?.DEV) window.__lenis = lenis;

  return lenis;
}

export function scrollTo(target, opts = {}) {
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { offset: 0, duration: 1.5, ...opts });
  else el.scrollIntoView({ behavior: 'smooth' });
}

export function stopScroll() { lenis?.stop(); }
export function startScroll() { lenis?.start(); }

/** Fire a callback once an element first enters the viewport. */
export function onEnter(el, cb, start = 'top 82%') {
  ScrollTrigger.create({ trigger: el, start, once: true, onEnter: cb });
}

/** Debounced resize helper. */
export function onResize(cb, wait = 180) {
  let t;
  const run = () => { clearTimeout(t); t = setTimeout(cb, wait); };
  window.addEventListener('resize', run, { passive: true });
  return run;
}

export { gsap, ScrollTrigger };
