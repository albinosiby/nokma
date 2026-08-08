import { gsap } from './core.js';

/** Branded loading screen with a restrained animated Nokma seal. */
export function runLoader() {
  const el = document.getElementById('loader');
  const fill = document.getElementById('loaderFill');
  const pct = document.getElementById('loaderPct');
  const seal = el.querySelector('.loader__seal');
  const outerRing = el.querySelector('.loader__ring--outer');
  const innerRing = el.querySelector('.loader__ring--inner');
  const monogram = el.querySelector('.loader__monogram');
  const logo = el.querySelector('.loader__logo');
  const tag = el.querySelector('.loader__tag');

  let shown = 0;

  gsap.set([seal, logo, tag], { opacity: 0, y: 14 });
  gsap.set([outerRing, innerRing], { scale: 0.82, rotation: -24 });
  gsap.set(monogram, { scale: 0.78 });

  const intro = gsap.timeline();
  intro
    .to(seal, { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' })
    .to([outerRing, innerRing], { scale: 1, rotation: 0, duration: 0.7, stagger: 0.07, ease: 'expo.out' }, '<0.05')
    .to(monogram, { scale: 1, duration: 0.48, ease: 'back.out(1.6)' }, '<0.1')
    .to([logo, tag], { opacity: 1, y: 0, duration: 0.42, stagger: 0.06, ease: 'power3.out' }, '-=0.22');

  gsap.to(outerRing, { rotation: 360, duration: 4.8, ease: 'none', repeat: -1 });
  gsap.to(innerRing, { rotation: -360, duration: 7.5, ease: 'none', repeat: -1 });

  /** Progress in 0..1 — only ever moves forward. */
  function setProgress(p) {
    const target = Math.max(shown, Math.min(1, p));
    shown = target;
    gsap.to(fill, { width: `${target * 100}%`, duration: 0.5, ease: 'power2.out' });
    gsap.to(
      { v: parseFloat(pct.textContent) || 0 },
      {
        v: Math.round(target * 100),
        duration: 0.5,
        ease: 'power2.out',
        onUpdate() { pct.textContent = Math.round(this.targets()[0].v); },
      }
    );
  }

  /** Resolve the loader and hand control to the page. */
  function finish() {
    return new Promise((resolve) => {
      setProgress(1);
      const impactRemaining = Math.max(0, 0.95 - intro.time());
      const out = gsap.timeline({
        delay: impactRemaining + 0.12,
        onComplete: () => {
          el.style.display = 'none';
          document.body.classList.remove('is-loading');
          resolve();
        },
      });
      out
        .to('.loader__bar, .loader__pct', { opacity: 0, duration: 0.18 })
        .to(seal, { opacity: 0, scale: 0.9, duration: 0.32, ease: 'power2.in' }, '-=0.06')
        .to([logo, tag], { opacity: 0, y: -16, duration: 0.28, ease: 'power2.in' }, '<0.04')
        .to(el, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.55, ease: 'expo.inOut' }, '-=0.18');
    });
  }

  return { setProgress, finish };
}
