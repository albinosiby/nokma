import { gsap, reduced } from './core.js';
import { INGREDIENTS } from './data.js';

/** Production pipeline from raw material selection through distribution. */
export function initIngredients() {
  const pipe = document.getElementById('ingrPipe');
  if (!pipe) return;

  INGREDIENTS.forEach((s, i) => {
    const el = document.createElement('div');
    el.className = 'istep';
    el.innerHTML = `
      <div class="istep__pod">
        ${s.img ? `<img src="./products/${s.img}.webp" alt="${s.label}" loading="lazy" decoding="async" />` : `<span class="istep__number">${String(i + 1).padStart(2, '0')}</span>`}
      </div>
      <h4>${s.label}</h4>
      <p>${s.note}</p>
      <span class="istep__flow"><span class="istep__drop"></span></span>`;
    pipe.appendChild(el);
  });

  const steps = [...pipe.querySelectorAll('.istep')];

  if (reduced) {
    gsap.set(steps, { opacity: 1, y: 0 });
    return;
  }

  gsap.set(steps, { y: 34 });
  gsap.to(steps, {
    opacity: 1,
    y: 0,
    duration: 0.85,
    stagger: 0.13,
    ease: 'power3.out',
    scrollTrigger: { trigger: pipe, start: 'top 82%', once: true },
  });

  // a drop that travels down each connector, in sequence
  steps.forEach((s, i) => {
    const drop = s.querySelector('.istep__drop');
    if (i === steps.length - 1) return;
    gsap.fromTo(
      drop,
      { xPercent: 0, opacity: 0 },
      {
        keyframes: [
          { opacity: 1, duration: 0.12 },
          { xPercent: 1400, duration: 1.5, ease: 'none' },
          { opacity: 0, duration: 0.18 },
        ],
        repeat: -1,
        repeatDelay: (steps.length - 1) * 0.55,
        delay: i * 0.55,
        scrollTrigger: { trigger: pipe, start: 'top 85%' },
      }
    );
  });

  // the churn blade actually turns
  const blades = pipe.querySelector('.churn-blades');
  if (blades) {
    gsap.to(blades, {
      rotate: 360,
      transformOrigin: '50% 50%',
      duration: 5.5,
      ease: 'none',
      repeat: -1,
      svgOrigin: '32 32',
    });
  }
}
