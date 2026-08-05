import { gsap, ScrollTrigger, reduced, onResize } from './core.js';
import { IMPACT, IMPACT_PILLARS } from './data.js';

/** Animated counters wired together by drawn lines. */
export function initImpact() {
  const grid = document.getElementById('impactGrid');
  const web = document.getElementById('impactWeb');
  const lines = document.getElementById('impactLines');
  const pillars = document.getElementById('pillarList');
  if (!grid) return;

  IMPACT.forEach((m) => {
    const el = document.createElement('article');
    el.className = 'icount';
    el.innerHTML = `
      <p class="icount__v">
        <span data-count="${m.value}" data-raw="${m.raw ? 1 : 0}">0</span>
        ${m.suffix ? `<span class="icount__up">${m.suffix}</span>` : ''}
      </p>
      <h3 class="icount__l">${m.label}</h3>
      <p class="icount__n">${m.label2 ? `${m.label2}<br />` : ''}${m.note}</p>`;
    grid.appendChild(el);
  });

  IMPACT_PILLARS.forEach((p) => {
    const li = document.createElement('li');
    li.textContent = p;
    pillars.appendChild(li);
  });

  const cards = [...grid.querySelectorAll('.icount')];
  const chips = [...pillars.querySelectorAll('li')];

  /* ── connecting web between the cards ─────────────────── */
  function drawWeb() {
    const host = web.getBoundingClientRect();
    lines.innerHTML = '';
    const pts = cards.map((c) => {
      const r = c.getBoundingClientRect();
      return { x: r.left - host.left + r.width / 2, y: r.top - host.top + r.height / 2 };
    });

    for (let i = 0; i < pts.length - 1; i++) {
      const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      l.setAttribute('x1', pts[i].x); l.setAttribute('y1', pts[i].y);
      l.setAttribute('x2', pts[i + 1].x); l.setAttribute('y2', pts[i + 1].y);
      lines.appendChild(l);
    }
    pts.forEach((p) => {
      const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      c.setAttribute('cx', p.x); c.setAttribute('cy', p.y); c.setAttribute('r', 3.2);
      lines.appendChild(c);
    });
  }

  requestAnimationFrame(drawWeb);
  onResize(drawWeb);

  if (reduced) {
    cards.forEach((c) => {
      const s = c.querySelector('[data-count]');
      s.textContent = s.dataset.raw === '1' ? s.dataset.count : Number(s.dataset.count).toLocaleString('en-IN');
    });
    gsap.set(chips, { opacity: 1 });
    return;
  }

  gsap.set(cards, { opacity: 0, y: 40 });
  gsap.set(chips, { y: 18 });

  ScrollTrigger.create({
    trigger: grid,
    start: 'top 80%',
    once: true,
    onEnter() {
      gsap.to(cards, { opacity: 1, y: 0, duration: 0.9, stagger: 0.11, ease: 'power3.out' });

      cards.forEach((c, i) => {
        const span = c.querySelector('[data-count]');
        const end = Number(span.dataset.count);
        const raw = span.dataset.raw === '1';
        gsap.to(
          { v: raw ? end - 40 : 0 },
          {
            v: end,
            duration: 2.1,
            delay: 0.25 + i * 0.11,
            ease: 'power2.out',
            onUpdate() {
              const v = Math.round(this.targets()[0].v);
              span.textContent = raw ? String(v) : v.toLocaleString('en-IN');
            },
          }
        );
      });

      // draw each connector by running its own dash offset to zero
      lines.querySelectorAll('line').forEach((l, i) => {
        const len = Math.hypot(
          l.x2.baseVal.value - l.x1.baseVal.value,
          l.y2.baseVal.value - l.y1.baseVal.value
        );
        gsap.fromTo(
          l,
          { attr: { 'stroke-dasharray': len, 'stroke-dashoffset': len }, opacity: 0 },
          {
            attr: { 'stroke-dashoffset': 0 },
            opacity: 1,
            duration: 1.1,
            delay: 0.3 + i * 0.14,
            ease: 'power2.out',
            onComplete() {
              // settle into the dashed "web" look once drawn
              gsap.to(l, { attr: { 'stroke-dasharray': '4 7' }, duration: 0.5, ease: 'power1.out' });
            },
          }
        );
      });
      gsap.fromTo(
        lines.querySelectorAll('circle'),
        { scale: 0, transformOrigin: '50% 50%' },
        { scale: 1, duration: 0.6, stagger: 0.12, ease: 'back.out(2.5)', delay: 0.35 }
      );
    },
  });

  gsap.to(chips, {
    opacity: 1,
    y: 0,
    duration: 0.7,
    stagger: 0.07,
    ease: 'power3.out',
    scrollTrigger: { trigger: pillars, start: 'top 88%', once: true },
  });
}
