/*
 * Speaking Timer & Stopwatch â€” Offline-capable Service Worker
 * Network-first for navigation requests (ensures immediate updates when online)
 * and Cache-first / runtime cache for static assets with offline fallback.
 */
const CACHE_NAME = 'speaking-timer-v22';

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

  // 1. Navigation / HTML requests: Network-First (online gets latest HTML, offline falls back to cache)
  if (req.mode === 'navigate' || req.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(req)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return networkResponse;
        })
        .catch(() => caches.match(req).then((cached) => cached || caches.match('./')))
    );
    return;
  }

  // 2. Static assets & dependencies: Cache-First with runtime fallback
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;

      return fetch(req).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
        }
        return networkResponse;
      }).catch(() => caches.match('./').catch(() => new Response('Offline', { status: 503 })));
    })
  );
});
