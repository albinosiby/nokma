import { gsap, ScrollTrigger, reduced } from './core.js';
import { TIMELINE } from './data.js';

const asset = (name, kind) => (kind === 'photo' ? `./img/${name}.webp` : `./products/${name}.webp`);

/** Horizontal-scrolling journey, pinned while it plays. */
export function initTimeline() {
  const track = document.getElementById('tlTrack');
  const section = document.getElementById('timeline');
  const bar = document.getElementById('tlBar');
  if (!track) return;

  TIMELINE.forEach((t) => {
    const c = document.createElement('article');
    c.className = 'tcard';
    c.innerHTML = `
      <div class="tcard__media">
        <img class="${t.kind}" src="${asset(t.img, t.kind)}" alt="${t.title}" loading="eager" decoding="async" />
      </div>
      <div class="tcard__body">
        <p class="tcard__yr">${t.year}</p>
        <h3>${t.title}</h3>
        <p>${t.text}</p>
      </div>`;
    track.appendChild(c);
  });

  const cards = [...track.querySelectorAll('.tcard')];

  if (reduced) {
    track.style.overflowX = 'auto';
    return;
  }

  const distance = () => Math.max(0, track.scrollWidth - window.innerWidth + 40);

  gsap.to(track, {
    x: () => -distance(),
    ease: 'none',
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      invalidateOnRefresh: true,
      onUpdate: (self) => { bar.style.transform = `scaleX(${self.progress})`; },
    },
  });

  gsap.set(cards, { opacity: 1, y: 0, rotateY: 0 });

  Promise.allSettled(
    cards.map((card) => card.querySelector('img')?.decode?.() ?? Promise.resolve())
  ).then(() => ScrollTrigger.refresh());

  ScrollTrigger.refresh();
}
