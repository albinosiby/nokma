import { gsap } from './core.js';

/** Branded loading screen with the Nokma character. */
export function runLoader() {
  const el = document.getElementById('loader');
  const fill = document.getElementById('loaderFill');
  const pct = document.getElementById('loaderPct');
  const mascot = el.querySelector('.loader__mascot');
  const logo = el.querySelector('.loader__logo');
  const tag = el.querySelector('.loader__tag');

  let shown = 0;

  gsap.set([mascot, logo, tag], { opacity: 0, y: 14 });
  gsap.set(mascot, { scale: 0.88, rotation: -4, transformOrigin: '50% 100%' });

  const intro = gsap.timeline();
  intro
    .to(mascot, { opacity: 1, y: 0, scale: 1, rotation: 0, duration: 0.62, ease: 'power3.out' })
    .to([logo, tag], { opacity: 1, y: 0, duration: 0.42, stagger: 0.06, ease: 'power3.out' }, '-=0.18');

  gsap.to(mascot, { y: -7, rotation: 1.8, scale: 1.025, duration: 1.55, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 0.7 });

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
      gsap.killTweensOf(mascot);
      gsap.set(mascot, { y: 0, rotation: 0, scale: 1 });
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
        .to(mascot, { y: -24, scaleY: 1.06, scaleX: 0.96, duration: 0.16, ease: 'power2.out' }, '-=0.04')
        .to(mascot, { y: 0, scaleX: 1, scaleY: 1, duration: 0.34, ease: 'bounce.out' })
        .to(logo, { x: 12, duration: 0.14, ease: 'power2.out' }, '-=0.1')
        .to(logo, { x: -9, duration: 0.18, ease: 'power2.inOut' })
        .to(logo, { x: 0, duration: 0.15, ease: 'power2.out' })
        .to(mascot, { opacity: 0, y: -240, scale: 0.9, duration: 0.42, ease: 'power3.in' }, '-=0.06')
        .to([logo, tag], { opacity: 0, y: -16, duration: 0.28, ease: 'power2.in' }, '<0.05')
        .to(el, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.55, ease: 'expo.inOut' }, '-=0.16');
    });
  }

  return { setProgress, finish };
}
