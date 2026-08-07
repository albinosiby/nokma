import { reduced } from './core.js';

/**
 * Wait until enough of the hero clip is buffered to play smoothly.
 * Metadata alone is not enough on first visit — that causes stutter until cache fills.
 */
export function preloadHero(onProgress) {
  const video = document.getElementById('heroVideo');
  if (!video) {
    onProgress?.(1);
    return Promise.resolve();
  }

  // Prevent HTML autoplay racing ahead of the buffer gate.
  video.pause();
  video.preload = 'auto';
  onProgress?.(0.08);

  return new Promise((resolve) => {
    let complete = false;
    // Slow mobile networks need longer than a metadata-only gate.
    const timeout = window.setTimeout(done, 12000);

    function bufferedRatio() {
      if (!video.duration || !Number.isFinite(video.duration) || video.duration <= 0) return 0;
      if (!video.buffered.length) return 0;
      try {
        return Math.min(1, video.buffered.end(video.buffered.length - 1) / video.duration);
      } catch {
        return 0;
      }
    }

    function report() {
      const ratio = bufferedRatio();
      onProgress?.(0.08 + ratio * 0.9);
      // ~55% of a ~10s loop is enough headroom for smooth first play on most links.
      if (ratio >= 0.55 || video.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) {
        done();
      }
    }

    function done() {
      if (complete) return;
      complete = true;
      window.clearTimeout(timeout);
      video.removeEventListener('canplaythrough', onReady);
      video.removeEventListener('progress', report);
      video.removeEventListener('loadeddata', report);
      video.removeEventListener('error', done);
      onProgress?.(1);
      resolve();
    }

    function onReady() {
      report();
      if (video.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) done();
    }

    if (video.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA || bufferedRatio() >= 0.55) {
      done();
      return;
    }

    video.addEventListener('canplaythrough', onReady);
    video.addEventListener('progress', report);
    video.addEventListener('loadeddata', report);
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

  try {
    video.currentTime = 0;
  } catch {
    // Some browsers reject seeks before ready; ignore.
  }

  video.play().then(reveal).catch(() => {
    // Muted inline video normally autoplays; poster / stage fallback remains visible.
    reveal();
  });
}
