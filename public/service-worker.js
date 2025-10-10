/*
  Progressive Web App Service Worker
  - Caches app shell and static assets
  - Provides offline fallback for navigations
  - Uses stale-while-revalidate for same-origin static resources
*/

const CACHE_PREFIX = 'giia-app-cache';
const CACHE_VERSION = 'v1';
const RUNTIME_CACHE = `${CACHE_PREFIX}-${CACHE_VERSION}`;

const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.png',
  '/logo192.png',
  '/logo512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(RUNTIME_CACHE);
      try {
        await cache.addAll(APP_SHELL);
      } catch (e) {
        // Some assets may fail in dev or non-root deployments; ignore to not block install
      }
      self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Remove old caches
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith(CACHE_PREFIX) && key !== RUNTIME_CACHE)
          .map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

function isNavigationRequest(request) {
  return request.mode === 'navigate' || (request.method === 'GET' && request.headers.get('accept')?.includes('text/html'));
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET
  if (request.method !== 'GET') return;

  // Handle navigation requests (SPA routing)
  if (isNavigationRequest(request)) {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request);
          // Optionally cache the latest index.html
          const cache = await caches.open(RUNTIME_CACHE);
          cache.put('/index.html', response.clone());
          return response;
        } catch (err) {
          const cache = await caches.open(RUNTIME_CACHE);
          const cached = await cache.match('/index.html');
          if (cached) return cached;
          // As a last resort, fall back to a basic Response
          return new Response('<h1>Offline</h1><p>The app is offline.</p>', {
            headers: { 'Content-Type': 'text/html; charset=UTF-8' },
            status: 200,
          });
        }
      })()
    );
    return;
  }

  // Same-origin static assets: stale-while-revalidate
  if (url.origin === self.location.origin) {
    // Don’t try to cache the service worker itself
    if (url.pathname === '/service-worker.js') return;

    event.respondWith(
      caches.open(RUNTIME_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        const networkFetch = fetch(request)
          .then((response) => {
            if (response && response.status === 200 && response.type === 'basic') {
              cache.put(request, response.clone());
            }
            return response;
          })
          .catch(() => null);
        return cached || networkFetch || fetch(request);
      })
    );
    return;
  }

  // Cross-origin known CDNs (Google Fonts, etc.) - cache-first with fallback to network
  const cdnHosts = [
    'fonts.googleapis.com',
    'fonts.gstatic.com',
    'unpkg.com',
    'cdn.jsdelivr.net',
    'api.nepcha.com',
  ];
  if (cdnHosts.includes(url.hostname)) {
    event.respondWith(
      caches.open(RUNTIME_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        if (response && (response.status === 200 || response.type === 'opaque')) {
          cache.put(request, response.clone());
        }
        return response;
      })
    );
  }
});
