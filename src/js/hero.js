import { gsap, reduced } from './core.js';

/** Wait until the browser recognizes the video before dismissing the loader. */
export function preloadHero(onProgress) {
  const video = document.getElementById('heroVideo');
  if (!video) {
    onProgress?.(1);
    return Promise.resolve();
  }

  onProgress?.(0.12);

  return new Promise((resolve) => {
    let complete = false;
    const timeout = window.setTimeout(done, 2500);

    function done() {
      if (complete) return;
      complete = true;
      window.clearTimeout(timeout);
      video.removeEventListener('loadedmetadata', done);
      video.removeEventListener('error', done);
      onProgress?.(1);
      resolve();
    }

    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
      done();
      return;
    }

    video.addEventListener('loadedmetadata', done, { once: true });
    video.addEventListener('error', done, { once: true });
    video.load();
  });
}

export function initHero() {
  const video = document.getElementById('heroVideo');
  const copy = document.getElementById('heroCopy');
  const cue = document.getElementById('heroCue');
  if (!video || !copy || !cue) return;

  if (reduced) {
    video.pause();
    gsap.set(copy, { opacity: 1 });
    gsap.set(cue, { opacity: 0 });
    return;
  }

  video.play().catch(() => {
    // Muted inline video normally autoplays; the loaded first frame remains a useful fallback.
  });

  const words = copy.querySelectorAll('.hero__title .w');
  gsap
    .timeline({ delay: 0.12 })
    .from(words, { yPercent: 110, duration: 1.05, stagger: 0.08, ease: 'expo.out' })
    .from('.hero__script', { y: 28, opacity: 0, duration: 0.8, ease: 'power3.out' }, '-=0.65')
    .from('.hero__sub', { y: 20, opacity: 0, duration: 0.7, ease: 'power3.out' }, '-=0.55')
    .from('.hero__copy .btn', { y: 18, opacity: 0, duration: 0.65, ease: 'power3.out' }, '-=0.5')
    .from(cue, { y: 12, opacity: 0, duration: 0.6, ease: 'power2.out' }, '-=0.35');
}
