import { isMobile, reduced } from './core.js';
import { cacheMediaAsset } from './media-cache.js';

const FULL_HERO_SOURCE = './media/hero-nokma-full.mp4?v=1';
const STANDARD_HERO_SOURCE = './media/hero-nokma.mp4?v=10';
const STARTUP_BUFFER_THRESHOLD = 0.5;

/** Buffer enough of the hero clip for playback before opening the page. */
export async function preloadHero(onProgress) {
  const video = document.getElementById('heroVideo');
  if (!video || reduced) {
    onProgress?.(1);
    return Promise.resolve();
  }

  video.pause();

  // Phones open against the poster immediately; playback continues loading after
  // the interface is available instead of holding the visitor on the loader.
  if (isMobile) {
    video.preload = 'metadata';
    video.load();
    onProgress?.(1);
    return Promise.resolve();
  }

  video.preload = 'auto';

  onProgress?.(0);

  return new Promise((resolve) => {
    let complete = false;

    async function done() {
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
      if (progress >= STARTUP_BUFFER_THRESHOLD) done();
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

/** Cache the next-highest-quality source only after the startup video is completely buffered. */
export function cacheFullHeroWhenReady() {
  const video = document.getElementById('heroVideo');
  if (!video) return;

  const backgroundSource = isMobile ? STANDARD_HERO_SOURCE : FULL_HERO_SOURCE;

  let started = false;
  const begin = () => {
    if (started) return;
    const duration = video.duration;
    const ranges = video.buffered;
    const end = ranges.length ? ranges.end(ranges.length - 1) : 0;
    if (!Number.isFinite(duration) || !duration || end / duration < 0.999) return;

    started = true;
    video.removeEventListener('progress', begin);
    video.removeEventListener('canplaythrough', begin);
    void cacheMediaAsset(backgroundSource);
  };

  video.addEventListener('progress', begin);
  video.addEventListener('canplaythrough', begin);
  begin();
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
