const MEDIA_CACHE = 'nokma-media-v1';

/** Store a complete media response for a later visit without failing the page. */
export async function cacheMediaAsset(source) {
  if (!source || !('caches' in window)) return;

  try {
    const request = new Request(new URL(source, window.location.href).href);
    const cache = await caches.open(MEDIA_CACHE);
    if (await cache.match(request)) return;

    const response = await fetch(request, { cache: 'force-cache' });
    if (response.ok) await cache.put(request, response.clone());
  } catch {
    // Cache storage is optional; normal browser caching still applies.
  }
}

/** Return a local object URL only when the complete media file is already cached. */
export async function cachedMediaUrl(source) {
  if (!source || !('caches' in window)) return null;

  try {
    const request = new Request(new URL(source, window.location.href).href);
    const response = await (await caches.open(MEDIA_CACHE)).match(request);
    if (!response) return null;

    return URL.createObjectURL(await response.blob());
  } catch {
    return null;
  }
}
