/* =========================================================
   TagSci Grade 11 Study WebApp - Offline Service Worker (PWA)
   ========================================================= */

const CACHE_NAME = 'tagsci-g11-v1.8.1';

const CORE_SHELL_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './tagsci%20logo.png',
  './tagsci logo.png',
  './updates.json',
  './credits.md',
  './vendor/jsxgraph/jsxgraphcore.js',
  './vendor/jsxgraph/jsxgraph.css'
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

/* =========================================================
   BACKGROUND SYSTEMS & NOTIFICATION HANDLERS
   ========================================================= */

// 1. Periodic Background Sync (runs in background when app is closed / on Wi-Fi)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'tagsci-periodic-curriculum-sync' || event.tag === 'tagsci-deadline-reminders') {
    event.waitUntil(handlePeriodicBackgroundSync());
  }
});

// 2. Background Sync (One-shot queue when connection recovers)
self.addEventListener('sync', (event) => {
  if (event.tag === 'tagsci-background-sync') {
    event.waitUntil(handlePeriodicBackgroundSync());
  }
});

/**
 * Background Task: Fetches fresh updates.json and alerts student of immediate deadlines
 */
async function handlePeriodicBackgroundSync() {
  try {
    const res = await fetch(`./updates.json?_t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) return;
    const data = await res.json();
    if (!data) return;

    // Cache latest updates.json
    const cache = await caches.open(CACHE_NAME);
    await cache.put('./updates.json', new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' }
    }));

    // Check upcoming deadlines today or tomorrow
    const events = data.calendarEvents || [];
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    for (const evt of events) {
      if (!evt.date) continue;
      const evtDate = new Date(evt.date);
      const diffTime = evtDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays >= 0 && diffDays <= 1) {
        const prefix = diffDays === 0 ? '🚨 TODAY' : '⏰ TOMORROW';
        await self.registration.showNotification(`${prefix}: ${evt.title || 'Academic Deadline'}`, {
          body: `${evt.subject ? `[${evt.subject}] ` : ''}${evt.desc || 'Scheduled exam or submission deadline.'}`,
          icon: './tagsci%20logo.png',
          badge: './tagsci%20logo.png',
          tag: `deadline-${evt.date}-${evt.title}`,
          data: { url: './#calendar' },
          vibrate: [200, 100, 200]
        });
        break; // Only show top priority alert per periodic wake
      }
    }
  } catch (err) {
    console.warn('[SW Background] Periodic sync error:', err);
  }
}

// 3. Push Event (Web Push integration)
self.addEventListener('push', (event) => {
  let payload = { title: 'TagSci G11 Student Hub', body: 'New study materials available!', data: { url: './#materials' } };
  if (event.data) {
    try {
      payload = event.data.json();
    } catch (e) {
      payload.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title || 'TagSci G11 Student Hub', {
      body: payload.body,
      icon: './tagsci%20logo.png',
      badge: './tagsci%20logo.png',
      tag: payload.tag || 'tagsci-push-notification',
      data: payload.data || { url: './#materials' },
      vibrate: [200, 100, 200]
    })
  );
});

// 4. Notification Click: Navigate to target view or focus active window
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || './';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          client.focus();
          client.postMessage({ type: 'NAVIGATE_SECTION', url: targetUrl });
          return;
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// 5. Client Message Listener
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data && event.data.type === 'CHECK_DEADLINES_NOW') {
    event.waitUntil(handlePeriodicBackgroundSync());
  }
});
