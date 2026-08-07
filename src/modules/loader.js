import { gsap } from './core.js';

/**
 * Branded loading screen: a textured scoop drops into a Nokma cup,
 * lands with a splash, and settles while the hero frames are prepared.
 */
export function runLoader() {
  const el = document.getElementById('loader');
  const fill = document.getElementById('loaderFill');
  const pct = document.getElementById('loaderPct');
  const ball = el.querySelector('.scoop-ball');
  const cup = el.querySelector('.scoop-cup');
  const drip = el.querySelector('.scoop-drip');
  const splash = el.querySelector('.scoop-splash');
  const sprinkles = el.querySelector('.scoop-sprinkles');
  const shadow = el.querySelector('.scoop-shadow');
  const cupMark = el.querySelector('.scoop-cup-mark');
  const logo = el.querySelector('.loader__logo');
  const tag = el.querySelector('.loader__tag');

  let shown = 0;

  gsap.set([logo, tag], { opacity: 0, y: 16 });
  gsap.set(cup, { y: 32, scale: 0.76, opacity: 0 });
  gsap.set(cupMark, { opacity: 0 });
  gsap.set(ball, { y: -180, rotation: -18, scale: 0.68, opacity: 0 });
  gsap.set(splash, { opacity: 0, scale: 0.45 });
  gsap.set(sprinkles, { opacity: 0, scale: 0.5 });
  gsap.set(shadow, { opacity: 0, scaleX: 0.35, transformOrigin: '70px 158px' });

  const intro = gsap.timeline();
  intro
    .to(shadow, { opacity: 0.38, scaleX: 1, duration: 0.3, ease: 'power2.out' })
    .to(cup, { y: 0, opacity: 1, scale: 1, duration: 0.38, ease: 'back.out(1.8)' }, '<0.03')
    .to(cupMark, { opacity: 1, duration: 0.22, ease: 'power2.out' }, '-=0.14')
    .to(ball, { opacity: 1, y: 0, rotation: 0, scale: 1, duration: 0.5, ease: 'power3.in' }, '-=0.16')
    .to(ball, { y: 5, scaleX: 1.16, scaleY: 0.82, duration: 0.1, ease: 'power2.out' })
    .to(cup, { scaleX: 1.06, scaleY: 0.94, duration: 0.1, ease: 'power2.out' }, '<')
    .to(splash, { opacity: 1, scale: 1, duration: 0.13, ease: 'power2.out' }, '<')
    .to(sprinkles, { opacity: 1, scale: 1, duration: 0.15, ease: 'back.out(2.5)' }, '<')
    .to(ball, { y: -12, scaleX: 1, scaleY: 1, duration: 0.2, ease: 'power2.out' })
    .to(cup, { scaleX: 1, scaleY: 1, duration: 0.2, ease: 'power2.out' }, '<')
    .to(ball, { y: 0, duration: 0.26, ease: 'bounce.out' })
    .to(splash, { opacity: 0, scale: 1.25, duration: 0.26, ease: 'power2.out' }, '<')
    .to([logo, tag], { opacity: 1, y: 0, duration: 0.38, stagger: 0.05, ease: 'power3.out' }, 0.42);

  // a drip that keeps falling while we wait
  gsap.fromTo(
    drip,
    { attr: { d: 'M91 75 v0' }, opacity: 0.85 },
    {
      attr: { d: 'M91 75 v18' },
      opacity: 0,
      duration: 0.9,
      ease: 'power1.in',
      repeat: -1,
      repeatDelay: 0.85,
      delay: 2.2,
    }
  );

  gsap.to(ball, { y: -3, rotation: 1.5, duration: 1.2, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 2.35 });

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
        .to(ball, { y: -220, scale: 0.4, opacity: 0, duration: 0.4, ease: 'power3.in' }, '-=0.06')
        .to(cup, { y: 120, opacity: 0, duration: 0.36, ease: 'power3.in' }, '<')
        .to([logo, tag], { opacity: 0, y: -20, duration: 0.28, ease: 'power2.in' }, '<0.06')
        .to(el, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.55, ease: 'expo.inOut' }, '-=0.18');
    });
  }

  return { setProgress, finish };
}
