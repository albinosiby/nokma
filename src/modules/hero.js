import { isMobile, reduced } from './core.js';
import { cacheMediaAsset } from './media-cache.js';

const STANDARD_HERO_SOURCE = './media/hero-nokma.mp4?v=13';

/**
 * Warm the shared hero video for mobile visits.
 */
export function warmFullHeroForLaunch() {
  if (!isMobile) return;
  void cacheMediaAsset(STANDARD_HERO_SOURCE);
}

/** Start loading hero media without blocking the page on network or decoding. */
export async function preloadHero(onProgress) {
  const video = document.getElementById('heroVideo');
  if (video && !reduced) {
    video.pause();
    video.preload = 'metadata';
    video.load();
  }
  onProgress?.(1);
}

/** Cache the shared hero video after mobile playback has fully buffered. */
export function cacheFullHeroWhenReady() {
  if (!isMobile) return;

  const video = document.getElementById('heroVideo');
  if (!video) return;

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
    void cacheMediaAsset(STANDARD_HERO_SOURCE);
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
