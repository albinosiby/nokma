import { gsap, reduced, isTouch } from './core.js';
import { FLAVOURS } from './data.js';

/**
 * Flavour showcase: a 3D carousel of full-size tubs. The selected flavour
 * rotates slowly, drips, and repaints the whole section in its own colour.
 */
export function initFlavours() {
  const ring = document.getElementById('flavRing');
  const dots = document.getElementById('flavDots');
  const section = document.getElementById('flavours');
  if (!ring) return;

  const els = {
    name: document.getElementById('flavName'),
    sub: document.getElementById('flavSub'),
    note: document.getElementById('flavNote'),
    formats: document.getElementById('flavFormats'),
    melt: document.getElementById('meltPath'),
  };

  /* ── build slides + dots ──────────────────────────────── */
  FLAVOURS.forEach((f, i) => {
    const s = document.createElement('div');
    s.className = 'fslide';
    s.dataset.i = i;
    s.innerHTML = `<img src="./products/${f.img}.webp" alt="Nokma ${f.name} ice cream" loading="${i < 3 ? 'eager' : 'lazy'}" decoding="async" />`;
    ring.appendChild(s);

    const d = document.createElement('button');
    d.className = 'fdot';
    d.type = 'button';
    d.dataset.i = i;
    d.setAttribute('role', 'tab');
    d.setAttribute('aria-label', f.name);
    d.setAttribute('data-cursor', 'link');
    dots.appendChild(d);
  });

  const slides = [...ring.querySelectorAll('.fslide')];
  const dotEls = [...dots.querySelectorAll('.fdot')];
  const N = FLAVOURS.length;

  let active = 0;
  let spin = null;

  /* ── melting drip path ────────────────────────────────── */
  function meltPath(t) {
    // t 0..1 — how far the drips have run
    const W = 600;
    const base = 34;
    const drops = [
      { x: 96, d: 30 }, { x: 198, d: 56 }, { x: 300, d: 74 },
      { x: 402, d: 48 }, { x: 504, d: 26 },
    ];
    let d = `M0 ${base} `;
    drops.forEach((p, i) => {
      const prev = i === 0 ? 0 : drops[i - 1].x;
      const mid = (prev + p.x) / 2;
      // fingers of cream rise out of the pool towards the tub
      const peak = base - p.d * t;
      d += `Q ${mid} ${base + 7} ${p.x - 24} ${base} `;
      d += `C ${p.x - 14} ${peak} ${p.x + 14} ${peak} ${p.x + 24} ${base} `;
    });
    d += `Q ${(drops[drops.length - 1].x + W) / 2} ${base + 7} ${W} ${base} L ${W} 120 L 0 120 Z`;
    return d;
  }

  els.melt.setAttribute('d', meltPath(0.15));

  if (!reduced) {
    gsap.to({ t: 0.12 }, {
      t: 1,
      duration: 3.4,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      onUpdate() { els.melt.setAttribute('d', meltPath(this.targets()[0].t)); },
    });
  }

  /* ── layout the ring around the active slide ──────────── */
  function place(instant = false) {
    slides.forEach((s, i) => {
      // shortest signed distance around the ring
      let o = i - active;
      if (o > N / 2) o -= N;
      if (o < -N / 2) o += N;

      const abs = Math.abs(o);
      const visible = abs <= 2;
      const sign = Math.sign(o);

      const target = {
        xPercent: o * 78,
        z: -abs * 210,
        rotationY: -sign * Math.min(abs, 2) * 28,
        scale: abs === 0 ? 1 : abs === 1 ? 0.66 : 0.48,
        opacity: abs === 0 ? 1 : abs === 1 ? 0.34 : 0.1,
        zIndex: 10 - abs,
        duration: instant ? 0 : 0.95,
        ease: 'power3.out',
        overwrite: 'auto',
      };

      gsap.to(s, target);
      s.style.pointerEvents = visible ? 'auto' : 'none';
      s.classList.toggle('is-active', abs === 0);
      s.querySelector('img').style.filter =
        abs === 0
          ? 'drop-shadow(0 40px 44px rgba(0,0,0,0.32))'
          : 'drop-shadow(0 24px 30px rgba(0,0,0,0.22)) blur(1.5px)';
    });
  }

  /* ── swap the flavour ─────────────────────────────────── */
  function select(i, instant = false) {
    active = ((i % N) + N) % N;
    const f = FLAVOURS[active];

    place(instant);

    dotEls.forEach((d, k) => {
      d.classList.toggle('is-on', k === active);
      d.setAttribute('aria-selected', String(k === active));
    });

    // repaint the section
    const root = section;
    root.style.setProperty('--flav-bg', f.theme.bg);
    root.style.setProperty('--flav-deep', f.theme.deep);
    root.style.setProperty('--flav-ink', f.theme.ink);
    root.style.setProperty('--flav-accent', f.theme.accent);
    root.style.setProperty('--flav-glow', f.theme.glow);

    // copy swap
    const swap = () => {
      els.name.textContent = f.name;
      els.sub.textContent = f.sub;
      els.note.textContent = f.note;
      els.formats.innerHTML = f.formats.map((x) => `<li>${x}</li>`).join('');
    };

    if (reduced || instant) {
      swap();
    } else {
      gsap.timeline()
        .to([els.name, els.sub, els.note, els.formats], {
          y: -14, opacity: 0, duration: 0.28, ease: 'power2.in', stagger: 0.03,
        })
        .add(swap)
        .fromTo(
          [els.name, els.sub, els.note, els.formats],
          { y: 18, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.55, ease: 'power3.out', stagger: 0.05 }
        );
    }

    // slow idle rotation on the featured tub
    spin?.kill();
    if (!reduced) {
      const img = slides[active].querySelector('img');
      gsap.set(img, { rotationY: 0 });
      spin = gsap.to(img, {
        rotationY: 13,
        duration: 4.2,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });
      gsap.fromTo(
        slides[active],
        { y: 26 },
        { y: 0, duration: 0.9, ease: 'back.out(1.4)' }
      );
    }
  }

  /* ── controls ─────────────────────────────────────────── */
  document.getElementById('flavPrev').addEventListener('click', () => select(active - 1));
  document.getElementById('flavNext').addEventListener('click', () => select(active + 1));

  dots.addEventListener('click', (e) => {
    const d = e.target.closest('.fdot');
    if (d) select(Number(d.dataset.i));
  });

  ring.addEventListener('click', (e) => {
    const s = e.target.closest('.fslide');
    if (s && !s.classList.contains('is-active')) select(Number(s.dataset.i));
  });

  section.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); select(active - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); select(active + 1); }
  });

  /* ── drag / swipe ─────────────────────────────────────── */
  let down = false, startX = 0, moved = false;

  const onDown = (x) => { down = true; startX = x; moved = false; };
  const onMove = (x) => {
    if (!down || moved) return;
    const dx = x - startX;
    if (Math.abs(dx) > 48) {
      select(active + (dx < 0 ? 1 : -1));
      moved = true;
    }
  };
  const onUp = () => { down = false; };

  ring.addEventListener('pointerdown', (e) => onDown(e.clientX));
  window.addEventListener('pointermove', (e) => onMove(e.clientX), { passive: true });
  window.addEventListener('pointerup', onUp);

  ring.addEventListener('touchstart', (e) => onDown(e.touches[0].clientX), { passive: true });
  ring.addEventListener('touchmove', (e) => onMove(e.touches[0].clientX), { passive: true });
  ring.addEventListener('touchend', onUp);

  /* ── parallax tilt of the whole ring ──────────────────── */
  if (!isTouch && !reduced) {
    const ry = gsap.quickTo(ring, 'rotationY', { duration: 1, ease: 'power3' });
    const rx = gsap.quickTo(ring, 'rotationX', { duration: 1, ease: 'power3' });
    section.addEventListener('pointermove', (e) => {
      const r = section.getBoundingClientRect();
      ry(((e.clientX - r.left) / r.width - 0.5) * 9);
      rx(-((e.clientY - r.top) / r.height - 0.5) * 6);
    });
    section.addEventListener('pointerleave', () => { ry(0); rx(0); });
  }

  select(0, true);
}
