import { FLAVOURS, UNIVERSE } from '../data/catalogue.js';

const productImage = (image) => `./products/${image.includes('.') ? image : `${image}.webp`}`;

function idle(callback) {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(callback, { timeout: 2000 });
    return;
  }

  window.setTimeout(callback, 600);
}

/** Warm non-critical visual assets after the page is interactive. */
export function warmAssets() {
  const imageUrls = new Set([
    ...UNIVERSE.map((product) => productImage(product.img)),
    ...FLAVOURS.map((flavour) => productImage(flavour.img)),
    ...Array.from({ length: 6 }, (_, index) => `./products/mascot/pose-0${index + 1}.png`),
    './brand/logo-nokma.webp',
    './brand/logo-meghfarm-official.png',
    './brand/logo-meghfarm-full.webp',
    ...[...document.images].map((image) => image.currentSrc || image.src),
  ]);

  const queue = [...imageUrls];
  const active = new Set();
  const maxConcurrent = 2;

  function loadNext() {
    while (active.size < maxConcurrent && queue.length) {
      const image = new Image();
      const source = queue.shift();
      active.add(image);
      image.decoding = 'async';
      image.fetchPriority = 'low';
      image.onload = image.onerror = () => {
        active.delete(image);
        loadNext();
      };
      image.src = source;
    }
  }

  idle(loadNext);
}
