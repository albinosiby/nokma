import { gsap, ScrollTrigger, reduced, onResize } from './core.js';
import { STORY } from './data.js';

const asset = (name, kind) => (kind === 'photo' ? `./img/${name}.webp` : `./products/${name}.webp`);

/**
 * The brand story: mountain → farmer → fruit → processing → QC →
 * packaging → customer, pinned and pulled sideways as you scroll,
 * with an animated line threading every node together.
 */
export function initStory() {
  const rail = document.getElementById('storyRail');
  const track = document.getElementById('storyTrack');
  const svg = document.getElementById('storyLine');
  const path = document.getElementById('storyPath');
  const current = document.getElementById('storyCurrent');
  const currentName = document.getElementById('storyCurrentName');
  const progress = document.getElementById('storyProgress');
  if (!rail) return;

  /* ── build the chain ──────────────────────────────────── */
  STORY.forEach((s, i) => {
    if (i > 0) {
      const arrow = document.createElement('div');
      arrow.className = 'sarrow';
      rail.appendChild(arrow);
    }

    const node = document.createElement('article');
    node.className = 'snode';
    node.innerHTML = `
      <div class="snode__disc ${s.kind === 'photo' ? 'is-photo' : ''}">
        <img src="${asset(s.img, s.kind)}" alt="${s.title}" loading="eager" decoding="async" />
      </div>
      <span class="snode__num">${String(i + 1).padStart(2, '0')}</span>
      <h3>${s.title}</h3>
      <p>${s.text}</p>`;
    rail.appendChild(node);
  });

  const nodes = [...rail.querySelectorAll('.snode')];
  const arrows = [...rail.querySelectorAll('.sarrow')];

  const syncJourney = (value = 0) => {
    const index = Math.min(STORY.length - 1, Math.round(value * (STORY.length - 1)));
    if (current) current.textContent = String(index + 1).padStart(2, '0');
    if (currentName) currentName.textContent = STORY[index].title;
    if (progress) progress.style.transform = `scaleX(${Math.max((index + 1) / STORY.length, value)})`;
    nodes.forEach((node, i) => node.classList.toggle('is-current', i === index));
  };

  syncJourney();

  /* ── thread the connecting line through every disc ────── */
  function drawPath() {
    const railBox = rail.getBoundingClientRect();
    const w = rail.scrollWidth;
    const h = rail.clientHeight;
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    svg.style.width = `${w}px`;

    // thread the line through the real centre of each disc, not the rail's
    const pts = nodes.map((n) => {
      const disc = n.querySelector('.snode__disc').getBoundingClientRect();
      return {
        x: disc.left - railBox.left + disc.width / 2,
        y: disc.top - railBox.top + disc.height / 2,
      };
    });
    if (pts.length < 2) return;

    // gentle alternating wave between the discs
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1];
      const b = pts[i];
      const lift = i % 2 ? -78 : 78;
      const c1x = a.x + (b.x - a.x) * 0.36;
      const c2x = a.x + (b.x - a.x) * 0.64;
      d += ` C ${c1x} ${a.y + lift}, ${c2x} ${b.y + lift}, ${b.x} ${b.y}`;
    }
    path.setAttribute('d', d);

    const len = path.getTotalLength();
    path.style.strokeDasharray = len;
    path.style.strokeDashoffset = reduced ? 0 : len;
    return len;
  }

  let len = drawPath();
  onResize(() => { len = drawPath(); ScrollTrigger.refresh(); });

  if (reduced) {
    gsap.set(nodes, { opacity: 1 });
    if (progress) progress.style.transform = 'scaleX(1)';
    return;
  }

  /* ── pinned horizontal travel ─────────────────────────── */
  const distance = () => Math.max(0, rail.scrollWidth - window.innerWidth + 40);

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: track,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      invalidateOnRefresh: true,
      onUpdate: (self) => syncJourney(self.progress),
    },
  });

  tl.to(rail, { x: () => -distance(), ease: 'none' }, 0);
  tl.to(path, { strokeDashoffset: 0, ease: 'none' }, 0);

  gsap.set(nodes, { opacity: 1, y: 0 });
  gsap.set(arrows, { scaleX: 1, transformOrigin: 'left center' });
}
