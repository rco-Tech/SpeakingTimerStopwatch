/*
 * Speaking Timer & Stopwatch — Offline-capable Service Worker
 * Cache-first with runtime fill. Works for BOTH the source deployment
 * (index.html + css/js) and the single-file build (dist/voice-timer.html).
 * After the page has been opened online at least once, all fetched
 * assets (including CDN tailwind/lucide/fonts) are cached for offline use.
 */
const CACHE_NAME = 'speaking-timer-v3';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return; // Only cache GET responses

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;

      // Not cached — try network, and cache successful basic responses at runtime.
      return fetch(req).then((network) => {
        if (network && network.status === 200 && network.type === 'basic') {
          const clone = network.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
        }
        return network;
      }).catch(() => {
        // Offline fallback: serve the root document if we have it cached.
        return caches.match('./').catch(() => new Response('Offline', { status: 503 }));
      });
    })
  );
});
