import { gsap, reduced } from './core.js';
import { INGREDIENTS } from './data.js';

const GLYPH = {
  milk: `<svg viewBox="0 0 64 64" fill="none">
    <path d="M24 6h16v7l7 10v33a4 4 0 0 1-4 4H21a4 4 0 0 1-4-4V23l7-10z" fill="#F7F3E8" stroke="#2E7D4F" stroke-width="2.4" stroke-linejoin="round"/>
    <path d="M17 34h30v16a4 4 0 0 1-4 4H21a4 4 0 0 1-4-4z" fill="#DCE9DE"/>
    <path d="M24 6h16v7H24z" fill="#2E7D4F" opacity=".18"/>
    <circle cx="32" cy="43" r="6" fill="#fff" opacity=".85"/>
  </svg>`,
  butter: `<svg viewBox="0 0 64 64" fill="none">
    <path d="M8 30l14-12h34l-14 12z" fill="#F4D98B" stroke="#B78F2B" stroke-width="2.2" stroke-linejoin="round"/>
    <path d="M8 30h34v18H8z" fill="#F7E4A8" stroke="#B78F2B" stroke-width="2.2" stroke-linejoin="round"/>
    <path d="M42 30l14-12v18L42 48z" fill="#E8C86A" stroke="#B78F2B" stroke-width="2.2" stroke-linejoin="round"/>
  </svg>`,
  churn: `<svg viewBox="0 0 64 64" fill="none">
    <circle cx="32" cy="32" r="21" fill="#F7F3E8" stroke="#2E7D4F" stroke-width="2.4"/>
    <g class="churn-blades">
      <path d="M32 15v34M15 32h34" stroke="#E8621B" stroke-width="3.4" stroke-linecap="round"/>
      <path d="M20 20l24 24M44 20L20 44" stroke="#E8621B" stroke-width="2.2" stroke-linecap="round" opacity=".55"/>
    </g>
    <circle cx="32" cy="32" r="4.5" fill="#2E7D4F"/>
  </svg>`,
};

/** Production pipeline: fruit → milk → butter → herbs → churn → ice cream. */
export function initIngredients() {
  const pipe = document.getElementById('ingrPipe');
  if (!pipe) return;

  INGREDIENTS.forEach((s) => {
    const el = document.createElement('div');
    el.className = 'istep';
    el.innerHTML = `
      <div class="istep__pod">
        ${s.img ? `<img src="./products/${s.img}.webp" alt="${s.label}" loading="lazy" decoding="async" />` : GLYPH[s.glyph] || ''}
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
