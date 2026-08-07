import { reduced } from './core.js';

const HERO_LIGHT = './media/hero-nokma.mp4?v=4';
const HERO_HQ = './media/hero-nokma-hq.mp4?v=4';

/**
 * Gate the loader on the light clip (~3MB), then upgrade to HQ in the
 * background once the page is interactive. Swap at a loop seam so the
 * quality bump is invisible.
 */
export function preloadHero(onProgress) {
  const video = document.getElementById('heroVideo');
  if (!video) {
    onProgress?.(1);
    return Promise.resolve();
  }

  video.pause();
  onProgress?.(0.06);

  return fetchAsObjectUrl(HERO_LIGHT, onProgress)
    .then(async (objectUrl) => {
      attachSrc(video, objectUrl);
      await waitForCanPlay(video);
      onProgress?.(1);
    })
    .catch(() => bufferNatively(video, HERO_LIGHT, onProgress));
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
    reveal();
  });

  scheduleHqUpgrade(video);
}

/** Skip HQ on data-saver / very slow links. */
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
      // Light clip keeps playing if HQ fails — no user-facing error.
    });
  };

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(start, { timeout: 4000 });
  } else {
    window.setTimeout(start, 1500);
  }
}

async function upgradeToHq(video) {
  const objectUrl = await fetchAsObjectUrl(HERO_HQ);
  await swapAtLoopSeam(video, objectUrl);
}

/**
 * Wait until the loop is about to restart, then hot-swap the source and
 * resume so the quality change lands between cycles.
 */
function swapAtLoopSeam(video, objectUrl) {
  return new Promise((resolve) => {
    let swapped = false;

    const performSwap = async () => {
      if (swapped) return;
      swapped = true;
      cleanup();

      const wasPlaying = !video.paused;
      attachSrc(video, objectUrl);
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
          // Autoplay may still be fine after swap; ignore blocks.
        }
      }
      resolve();
    };

    const onTimeUpdate = () => {
      if (!video.duration || !Number.isFinite(video.duration)) return;
      // Last 180ms of the loop — next frame after load will restart cleanly.
      if (video.currentTime >= video.duration - 0.18) {
        performSwap();
      }
    };

    const onEnded = () => performSwap();

    const cleanup = () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('ended', onEnded);
    };

    // If already near the end, or loop somehow stalled, swap soon.
    if (video.duration && video.currentTime >= video.duration - 0.18) {
      performSwap();
      return;
    }

    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('ended', onEnded);

    // Safety: if timeupdate never fires near the seam, swap after one full cycle.
    window.setTimeout(() => performSwap(), Math.max(12000, (video.duration || 10) * 1000 + 2000));
  });
}

function attachSrc(video, objectUrl) {
  const source = video.querySelector('source');
  if (source) source.remove();
  if (video.src && video.src.startsWith('blob:')) {
    try {
      URL.revokeObjectURL(video.src);
    } catch {
      // ignore
    }
  }
  video.preload = 'auto';
  video.src = objectUrl;
  video.load();
}

async function fetchAsObjectUrl(src, onProgress) {
  const response = await fetch(src, { cache: 'force-cache' });
  if (!response.ok) throw new Error(`hero fetch ${response.status}`);

  const total = Number(response.headers.get('content-length')) || 0;
  let loaded = 0;
  let blob;

  if (response.body && typeof response.body.getReader === 'function') {
    const reader = response.body.getReader();
    const chunks = [];
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      loaded += value.byteLength;
      if (onProgress) {
        if (total > 0) onProgress(0.06 + Math.min(0.88, (loaded / total) * 0.88));
        else onProgress(Math.min(0.9, 0.06 + loaded / (3.5 * 1024 * 1024) * 0.88));
      }
    }
    blob = new Blob(chunks, { type: 'video/mp4' });
  } else {
    blob = await response.blob();
    onProgress?.(0.9);
  }

  return URL.createObjectURL(blob);
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
  });
}

function bufferNatively(video, src, onProgress) {
  attachSrc(video, src);
  onProgress?.(0.1);

  return new Promise((resolve) => {
    let complete = false;
    const timeout = window.setTimeout(done, 15000);

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
      onProgress?.(0.1 + ratio * 0.88);
      if (ratio >= 0.95) done();
    }

    function done() {
      if (complete) return;
      complete = true;
      window.clearTimeout(timeout);
      video.removeEventListener('canplaythrough', done);
      video.removeEventListener('progress', report);
      video.removeEventListener('error', done);
      onProgress?.(1);
      resolve();
    }

    if (bufferedRatio() >= 0.95 || video.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) {
      done();
      return;
    }

    video.addEventListener('canplaythrough', done);
    video.addEventListener('progress', report);
    video.addEventListener('error', done, { once: true });
  });
}
