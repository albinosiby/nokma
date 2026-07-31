import { gsap, ScrollTrigger, isMobile, reduced, onResize } from './core.js';

const FRAME_COUNT = 233;
const DIR = isMobile ? 'mobile' : 'desktop';
const src = (i) => `./frames/${DIR}/f${String(i + 1).padStart(3, '0')}.webp`;

/**
 * Streams the hero frame sequence.
 *
 * Pass 1 loads every 4th frame so the scrub has full-range coverage almost
 * immediately (that pass drives the loading bar); pass 2 fills in the gaps in
 * the background. Any frame that has not arrived yet falls back to the nearest
 * one that has, so scrubbing never stalls or flickers.
 */
class FrameSequence {
  constructor() {
    this.images = new Array(FRAME_COUNT);
    this.ready = new Uint8Array(FRAME_COUNT);
    this.readyCount = 0;
  }

  load(index) {
    return new Promise((resolve) => {
      if (this.ready[index]) return resolve();
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => {
        this.images[index] = img;
        if (!this.ready[index]) { this.ready[index] = 1; this.readyCount++; }
        resolve();
      };
      img.onerror = () => resolve();
      img.src = src(index);
    });
  }

  /** Run a list of indices with a bounded number of parallel requests. */
  async pump(list, concurrency, onStep) {
    let cursor = 0;
    const worker = async () => {
      while (cursor < list.length) {
        const i = list[cursor++];
        await this.load(i);
        onStep?.();
      }
    };
    await Promise.all(Array.from({ length: concurrency }, worker));
  }

  /** Priority pass — coarse coverage across the whole timeline. */
  async loadPriority(onProgress) {
    const step = 4;
    const list = [];
    for (let i = 0; i < FRAME_COUNT; i += step) list.push(i);
    if (list[list.length - 1] !== FRAME_COUNT - 1) list.push(FRAME_COUNT - 1);

    let done = 0;
    await this.pump(list, 8, () => onProgress?.(++done / list.length));
    return list.length;
  }

  /** Background pass — everything else, at low pressure. */
  loadRest() {
    const list = [];
    for (let i = 0; i < FRAME_COUNT; i++) if (!this.ready[i]) list.push(i);
    return this.pump(list, 5);
  }

  /** Closest already-decoded frame to `i`. */
  nearest(i) {
    if (this.ready[i]) return this.images[i];
    for (let d = 1; d < FRAME_COUNT; d++) {
      if (i - d >= 0 && this.ready[i - d]) return this.images[i - d];
      if (i + d < FRAME_COUNT && this.ready[i + d]) return this.images[i + d];
    }
    return null;
  }
}

export const sequence = new FrameSequence();

export function preloadHero(onProgress) {
  return sequence.loadPriority(onProgress);
}

export function initHero() {
  const canvas = document.getElementById('heroCanvas');
  const ctx = canvas.getContext('2d', { alpha: false });
  const stage = document.getElementById('heroStage');
  const copy = document.getElementById('heroCopy');
  const cue = document.getElementById('heroCue');
  const hero = document.getElementById('hero');

  const state = { frame: 0 };
  let cw = 0, ch = 0;

  function size() {
    const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 2 : 2.25);
    const r = stage.getBoundingClientRect();
    cw = Math.round(r.width);
    ch = Math.round(r.height);
    canvas.width = Math.round(cw * dpr);
    canvas.height = Math.round(ch * dpr);
    canvas.style.width = `${cw}px`;
    canvas.style.height = `${ch}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingQuality = 'high';
    draw();
  }

  function draw() {
    const img = sequence.nearest(state.frame | 0);
    if (!img || !cw || !ch) return;

    // cover-fit the 16:9 frame into the stage box
    const sr = img.width / img.height;
    const dr = cw / ch;
    let w, h, x, y;
    if (dr > sr) { w = cw; h = cw / sr; x = 0; y = (ch - h) / 2; }
    else { h = ch; w = ch * sr; y = 0; x = (cw - w) / 2; }

    ctx.drawImage(img, x, y, w, h);
  }

  size();
  onResize(size);

  // keep painting while background frames stream in
  const settle = setInterval(draw, 220);
  setTimeout(() => clearInterval(settle), 45000);

  if (reduced) {
    state.frame = FRAME_COUNT - 1;
    draw();
    gsap.set(cue, { opacity: 0 });
    return;
  }

  /* ── scroll-scrubbed frame playback ───────────────────── */
  gsap.to(state, {
    frame: FRAME_COUNT - 1,
    ease: 'none',
    snap: { frame: 1 },
    scrollTrigger: {
      trigger: hero,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.55,
    },
    onUpdate: draw,
  });

  /* ── "parallel axis" parallax on the frame layer ──────── */
  gsap.fromTo(
    stage,
    { yPercent: -3, xPercent: 1.2, scale: 1.055, rotate: 0.4 },
    {
      yPercent: 3,
      xPercent: -1.2,
      scale: 1.0,
      rotate: -0.4,
      ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom bottom', scrub: 1 },
    }
  );

  /* ── headline entrance ────────────────────────────────── */
  const words = copy.querySelectorAll('.hero__title .w');
  const intro = gsap.timeline({ delay: 0.15 });
  intro
    .from(words, { yPercent: 118, duration: 1.25, stagger: 0.09, ease: 'expo.out' })
    .from('.hero__script', { y: 42, opacity: 0, duration: 1.1, ease: 'expo.out' }, '-=0.85')
    .from('.hero__sub', { y: 26, opacity: 0, duration: 0.9, ease: 'power3.out' }, '-=0.75')
    .from('.hero__copy .btn', { y: 26, opacity: 0, duration: 0.9, ease: 'power3.out' }, '-=0.7')
    .from(cue, { y: 20, opacity: 0, duration: 0.8, ease: 'power2.out' }, '-=0.55');

  /* ── copy travels out as the camera pushes in ─────────── */
  gsap.to(copy, {
    yPercent: -34,
    opacity: 0,
    filter: 'blur(9px)',
    ease: 'power1.in',
    scrollTrigger: { trigger: hero, start: 'top top', end: '38% top', scrub: 0.7 },
  });

  gsap.to(cue, {
    opacity: 0,
    y: 26,
    ease: 'none',
    scrollTrigger: { trigger: hero, start: 'top top', end: '14% top', scrub: 0.6 },
  });

  /* ── mouse changes the scene perspective ──────────────── */
  if (!window.matchMedia('(pointer: coarse)').matches) {
    const px = gsap.quickTo(stage, 'x', { duration: 1.1, ease: 'power3' });
    const py = gsap.quickTo(stage, 'y', { duration: 1.1, ease: 'power3' });
    const cx = gsap.quickTo(copy, 'x', { duration: 1.3, ease: 'power3' });
    const cy = gsap.quickTo(copy, 'y', { duration: 1.3, ease: 'power3' });

    window.addEventListener(
      'pointermove',
      (e) => {
        if (window.scrollY > window.innerHeight * 1.6) return;
        const nx = e.clientX / window.innerWidth - 0.5;
        const ny = e.clientY / window.innerHeight - 0.5;
        px(nx * -34);
        py(ny * -22);
        cx(nx * 16);
        cy(ny * 11);
      },
      { passive: true }
    );
  }

  ScrollTrigger.refresh();
}
