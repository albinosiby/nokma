import { reduced } from './core.js';

/** Wait until the light hero clip can start, then dismiss the loader. */
export function preloadHero(onProgress) {
  const video = document.getElementById('heroVideo');
  if (!video) {
    onProgress?.(1);
    return Promise.resolve();
  }

  video.pause();
  video.preload = 'auto';
  onProgress?.(0.12);

  return new Promise((resolve) => {
    let complete = false;
    const timeout = window.setTimeout(done, 4000);

    function done() {
      if (complete) return;
      complete = true;
      window.clearTimeout(timeout);
      video.removeEventListener('canplay', done);
      video.removeEventListener('loadeddata', done);
      video.removeEventListener('error', done);
      onProgress?.(1);
      resolve();
    }

    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      done();
      return;
    }

    video.addEventListener('canplay', done, { once: true });
    video.addEventListener('loadeddata', done, { once: true });
    video.addEventListener('error', done, { once: true });
    video.load();
  });
}

export function initHero() {
  const video = document.getElementById('heroVideo');
  if (!video) return;

  if (reduced) {
    video.pause();
    return;
  }

  const reveal = () => video.classList.add('is-ready');
  video.addEventListener('playing', reveal, { once: true });

  video.play().then(reveal).catch(() => {
    reveal();
  });
}
