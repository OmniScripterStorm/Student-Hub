/* =========================================================
   TagSci Grade 11 Study WebApp - Offline Service Worker (PWA)
   ========================================================= */

const CACHE_NAME = 'tagsci-g11-v1.4.3';
const STATIC_ASSETS = [
  './',
  './index.html',
  './credits.md',
  './manifest.json',
  './tagsci logo.png',
  './updates.json',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600;0,6..72,700;1,6..72,400&display=swap'
];

// Install: pre-cache shell assets & skip waiting immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('PWA Pre-cache notice:', err);
      });
    })
  );
});

// Activate: clean old cache versions and claim all clients
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

  // For updates.json, credits.md, API endpoints, or HTML navigation: Network First, Fallback to Cache
  if (url.pathname.endsWith('updates.json') || url.pathname.endsWith('credits.md') || event.request.mode === 'navigate' || url.pathname.endsWith('index.html')) {
    event.respondWith(
      fetch(event.request)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const clone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkRes;
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match('./index.html') || caches.match('./')))
    );
    return;
  }

  // For static assets (images, fonts, scripts): Cache First, fallback to Network
  event.respondWith(
    caches.match(event.request).then((cachedRes) => {
      if (cachedRes) return cachedRes;
      return fetch(event.request).then((networkRes) => {
        if (networkRes && networkRes.status === 200) {
          const clone = networkRes.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return networkRes;
      });
    })
  );
});
