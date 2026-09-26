/* =========================================================
   TagSci Grade 11 Study WebApp - Offline Service Worker (PWA)
   ========================================================= */

const CACHE_NAME = 'tagsci-g11-v1.4.4';

const CORE_SHELL_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './tagsci%20logo.png',
  './tagsci logo.png',
  './updates.json',
  './credits.md'
];

const EXTERNAL_STATIC_ASSETS = [
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600;0,6..72,700;1,6..72,400&display=swap'
];

// Install: pre-cache shell assets with resilient allSettled fallback & activate immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // 1. Pre-cache critical core shell assets
      const corePromises = CORE_SHELL_ASSETS.map((asset) => 
        fetch(new Request(asset, { cache: 'reload' }))
          .then((res) => {
            if (res.ok || res.status === 200 || res.type === 'opaque') {
              return cache.put(asset, res);
            }
          })
          .catch((err) => {
            console.warn('[SW] Core asset cache skip:', asset, err);
          })
      );

      // 2. Pre-cache external CDNs (best-effort)
      const externalPromises = EXTERNAL_STATIC_ASSETS.map((asset) =>
        fetch(asset, { mode: 'no-cors' })
          .then((res) => cache.put(asset, res))
          .catch((err) => {
            console.warn('[SW] External asset cache skip:', asset, err);
          })
      );

      return Promise.allSettled([...corePromises, ...externalPromises]);
    })
  );
});

// Activate: clean old cache versions and claim all open client tabs
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Strategy:
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // 1. Navigation requests (HTML pages) -> Network First with robust offline fallback
  if (event.request.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname === '/' || url.href.startsWith(self.registration.scope)) {
    if (event.request.mode === 'navigate' || url.pathname.endsWith('index.html') || url.pathname.endsWith('hompage_test.html')) {
      event.respondWith(
        fetch(event.request)
          .then((networkRes) => {
            if (networkRes && networkRes.status === 200) {
              const clone = networkRes.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
            }
            return networkRes;
          })
          .catch(async () => {
            const cached = await caches.match(event.request, { ignoreSearch: true });
            if (cached) return cached;
            const indexCached = await caches.match('./index.html') || await caches.match('./') || await caches.match('index.html');
            if (indexCached) return indexCached;
            return new Response('Offline: Please reconnect to internet to load new sections.', {
              status: 503,
              statusText: 'Offline',
              headers: { 'Content-Type': 'text/plain; charset=utf-8' }
            });
          })
      );
      return;
    }
  }

  // 2. Data / OTA updates JSON / Markdown -> Network First, Fallback to Cache
  if (url.pathname.endsWith('updates.json') || url.pathname.endsWith('credits.md') || url.pathname.endsWith('.json')) {
    event.respondWith(
      fetch(event.request)
        .then((networkRes) => {
          if (networkRes && (networkRes.status === 200 || networkRes.type === 'opaque')) {
            const clone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkRes;
        })
        .catch(async () => {
          const cached = await caches.match(event.request, { ignoreSearch: true });
          if (cached) return cached;
          return new Response(JSON.stringify({ offline: true, error: 'Offline cached data unavailable' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        })
    );
    return;
  }

  // 3. Static assets (Images, Fonts, Tailwind CDN, CSS, JS) -> Stale-While-Revalidate / Cache First
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((cachedRes) => {
      const fetchPromise = fetch(event.request)
        .then((networkRes) => {
          if (networkRes && (networkRes.status === 200 || networkRes.type === 'opaque')) {
            const clone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkRes;
        })
        .catch(() => cachedRes);

      return cachedRes || fetchPromise;
    })
  );
});
