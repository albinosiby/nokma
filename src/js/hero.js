import { reduced } from './core.js';

const HERO_LIGHT = './media/hero-nokma.mp4?v=4';
const HERO_HQ = './media/hero-nokma-hq.mp4?v=4';

/**
 * Gate the loader on native playback readiness — not a full-file fetch.
 * On slow hosts (e.g. cold Render static), blob-downloading 3MB+ hangs forever.
 * Light clip streams via <video>; HQ upgrades in the background when ready.
 */
export function preloadHero(onProgress) {
  const video = document.getElementById('heroVideo');
  if (!video) {
    onProgress?.(1);
    return Promise.resolve();
  }

  video.pause();
  video.preload = 'auto';
  onProgress?.(0.1);

  // Ensure the light source is the one we stream first.
  ensureSource(video, HERO_LIGHT);

  return new Promise((resolve) => {
    let complete = false;
    // Never block the site on a slow CDN — show poster / partial buffer instead.
    const timeout = window.setTimeout(done, 4500);

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
      onProgress?.(0.1 + Math.min(0.85, ratio * 0.85 + (video.readyState / 4) * 0.2));
      // Enough future data to start without an obvious hitch.
      if (
        video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA ||
        ratio >= 0.2 ||
        (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && ratio > 0)
      ) {
        done();
      }
    }

    function done() {
      if (complete) return;
      complete = true;
      window.clearTimeout(timeout);
      video.removeEventListener('canplay', report);
      video.removeEventListener('canplaythrough', report);
      video.removeEventListener('loadeddata', report);
      video.removeEventListener('progress', report);
      video.removeEventListener('error', done);
      onProgress?.(1);
      resolve();
    }

    if (
      video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA ||
      bufferedRatio() >= 0.2
    ) {
      done();
      return;
    }

    video.addEventListener('canplay', report);
    video.addEventListener('canplaythrough', report);
    video.addEventListener('loadeddata', report);
    video.addEventListener('progress', report);
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
    // ignore
  }

  video.play().then(reveal).catch(() => {
    reveal();
  });

  scheduleHqUpgrade(video);
}

function shouldFetchHq() {
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (!conn) return true;
  if (conn.saveData) return false;
  if (conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g') return false;
  return true;
}

function scheduleHqUpgrade(video) {
  if (!shouldFetchHq()) return;

  const start = () => {
    upgradeToHq(video).catch(() => {
      // Light clip keeps playing if HQ never arrives.
    });
  };

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(start, { timeout: 5000 });
  } else {
    window.setTimeout(start, 2000);
  }
}

/**
 * Prefetch HQ with a hidden video element (native streaming), then swap
 * at a loop seam. Avoids full-blob fetch which stalls on slow hosts.
 */
function upgradeToHq(video) {
  return new Promise((resolve, reject) => {
    const probe = document.createElement('video');
    probe.muted = true;
    probe.playsInline = true;
    probe.preload = 'auto';
    probe.src = HERO_HQ;

    let settled = false;
    const failTimer = window.setTimeout(() => {
      cleanup();
      reject(new Error('hq timeout'));
    }, 45000);

    const onReady = () => {
      if (settled) return;
      if (probe.readyState < HTMLMediaElement.HAVE_FUTURE_DATA) return;
      settled = true;
      window.clearTimeout(failTimer);
      cleanup();
      swapAtLoopSeam(video, HERO_HQ).then(resolve).catch(reject);
    };

    const cleanup = () => {
      probe.removeEventListener('canplaythrough', onReady);
      probe.removeEventListener('canplay', onReady);
      probe.removeEventListener('error', onError);
      probe.removeAttribute('src');
      probe.load();
    };

    const onError = () => {
      window.clearTimeout(failTimer);
      cleanup();
      reject(new Error('hq error'));
    };

    probe.addEventListener('canplaythrough', onReady);
    probe.addEventListener('canplay', onReady);
    probe.addEventListener('error', onError, { once: true });
    probe.load();
  });
}

function swapAtLoopSeam(video, hqSrc) {
  return new Promise((resolve) => {
    let swapped = false;

    const performSwap = async () => {
      if (swapped) return;
      swapped = true;
      cleanup();

      const wasPlaying = !video.paused;
      ensureSource(video, hqSrc);
      video.load();

      await waitForCanPlay(video);

      try {
        video.currentTime = 0;
      } catch {
        // ignore
      }

      if (wasPlaying || document.visibilityState === 'visible') {
        try {
          await video.play();
        } catch {
          // ignore
        }
      }
      resolve();
    };

    const onTimeUpdate = () => {
      if (!video.duration || !Number.isFinite(video.duration)) return;
      if (video.currentTime >= video.duration - 0.18) performSwap();
    };

    const cleanup = () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('ended', performSwap);
    };

    if (video.duration && video.currentTime >= video.duration - 0.18) {
      performSwap();
      return;
    }

    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('ended', performSwap);
    window.setTimeout(() => performSwap(), Math.max(12000, (video.duration || 10) * 1000 + 2000));
  });
}

function ensureSource(video, src) {
  let source = video.querySelector('source');
  if (!source) {
    source = document.createElement('source');
    source.type = 'video/mp4';
    video.appendChild(source);
  }
  if (source.getAttribute('src') !== src) {
    source.setAttribute('src', src);
  }
  // Clear any prior blob src so the <source> wins.
  if (video.getAttribute('src')) video.removeAttribute('src');
}

function waitForCanPlay(video) {
  return new Promise((resolve) => {
    if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      resolve();
      return;
    }
    const done = () => {
      video.removeEventListener('canplay', done);
      video.removeEventListener('loadeddata', done);
      video.removeEventListener('error', done);
      resolve();
    };
    video.addEventListener('canplay', done, { once: true });
    video.addEventListener('loadeddata', done, { once: true });
    video.addEventListener('error', done, { once: true });
    window.setTimeout(done, 3000);
  });
}
