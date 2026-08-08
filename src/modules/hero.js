import { reduced } from './core.js';

/** Load the full hero clip and report its real buffered progress to the loader. */
export function preloadHero(onProgress) {
  const video = document.getElementById('heroVideo');
  if (!video || reduced) {
    onProgress?.(1);
    return Promise.resolve();
  }

  video.pause();
  video.preload = 'auto';
  onProgress?.(0);

  return new Promise((resolve) => {
    let complete = false;

    function done() {
      if (complete) return;
      complete = true;
      video.removeEventListener('progress', updateProgress);
      video.removeEventListener('loadedmetadata', updateProgress);
      video.removeEventListener('canplaythrough', updateProgress);
      video.removeEventListener('suspend', updateProgress);
      video.removeEventListener('error', done);
      onProgress?.(1);
      resolve();
    }

    function updateProgress() {
      const duration = video.duration;
      const ranges = video.buffered;
      const end = ranges.length ? ranges.end(ranges.length - 1) : 0;
      const progress = Number.isFinite(duration) && duration > 0
        ? Math.min(end / duration, 1)
        : 0;

      onProgress?.(progress);
      if (progress >= 0.999) done();
    }

    video.addEventListener('progress', updateProgress);
    video.addEventListener('loadedmetadata', updateProgress);
    video.addEventListener('canplaythrough', updateProgress);
    video.addEventListener('suspend', updateProgress);
    video.addEventListener('error', done, { once: true });
    video.load();
    updateProgress();
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
