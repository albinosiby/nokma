import { gsap } from './core.js';

/**
 * Premium loading screen: the scoop lands in the cup, a drip falls,
 * the logo resolves and the bar fills as the hero frames stream in.
 */
export function runLoader() {
  const el = document.getElementById('loader');
  const fill = document.getElementById('loaderFill');
  const pct = document.getElementById('loaderPct');
  const ball = el.querySelector('.scoop-ball');
  const cup = el.querySelector('.scoop-cup');
  const drip = el.querySelector('.scoop-drip');
  const logo = el.querySelector('.loader__logo');
  const tag = el.querySelector('.loader__tag');

  let shown = 0;

  gsap.set([logo, tag], { opacity: 0, y: 16 });
  gsap.set(cup, { transformOrigin: '60px 140px', scaleY: 0.4, opacity: 0 });
  gsap.set(ball, { y: -150, scale: 0.5, opacity: 0 });

  const intro = gsap.timeline();
  intro
    .to(cup, { opacity: 1, scaleY: 1, duration: 0.7, ease: 'back.out(2)' })
    .to(ball, { opacity: 1, y: 0, scale: 1, duration: 0.85, ease: 'bounce.out' }, '-=0.3')
    .to(ball, { scaleX: 1.14, scaleY: 0.86, duration: 0.16, ease: 'power2.out' }, '-=0.12')
    .to(ball, { scaleX: 1, scaleY: 1, duration: 0.45, ease: 'elastic.out(1, 0.42)' })
    .to([logo, tag], { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out' }, '-=0.4');

  // a drip that keeps falling while we wait
  gsap.fromTo(
    drip,
    { attr: { d: 'M60 78 v0' }, opacity: 0.9 },
    {
      attr: { d: 'M60 78 v26' },
      opacity: 0,
      duration: 1.15,
      ease: 'power1.in',
      repeat: -1,
      repeatDelay: 0.5,
    }
  );

  gsap.to(ball, { y: -4, duration: 1.4, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1.6 });

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
      const out = gsap.timeline({
        delay: 0.35,
        onComplete: () => {
          el.style.display = 'none';
          document.body.classList.remove('is-loading');
          resolve();
        },
      });
      out
        .to('.loader__bar, .loader__pct', { opacity: 0, duration: 0.3 })
        .to(ball, { y: -220, scale: 0.4, opacity: 0, duration: 0.75, ease: 'power3.in' }, '-=0.1')
        .to(cup, { y: 120, opacity: 0, duration: 0.6, ease: 'power3.in' }, '<')
        .to([logo, tag], { opacity: 0, y: -20, duration: 0.5, ease: 'power2.in' }, '<0.1')
        .to(el, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.9, ease: 'expo.inOut' }, '-=0.25');
    });
  }

  return { setProgress, finish };
}
