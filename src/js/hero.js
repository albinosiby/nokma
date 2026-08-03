import { reduced } from './core.js';

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
  if (!video) return;

  if (reduced) {
    video.pause();
    return;
  }

  video.play().catch(() => {
    // Muted inline video normally autoplays; the loaded first frame remains a useful fallback.
  });
}
