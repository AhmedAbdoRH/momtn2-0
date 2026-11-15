/**
 * sw.js
 * Service Worker for Momtn App
 * Caches application shell and static assets so the app opens offline.
 */

const CACHE_NAME = 'momtn-static-v3';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/EmptyCard.gif',
  '/musin-logo.png',
  '/App.png',
  '/lovable-uploads/2747e89b-5855-4294-9523-b5d3dd0527be.png',
];

// Install: Cache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching static assets');
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('[SW] Some assets failed to precache:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch: Stale-While-Revalidate for app code & assets, Network-Only for Supabase API
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Do not intercept Supabase API requests, let client code / IndexedDB handle offline data
  if (url.hostname.includes('supabase.co')) {
    return;
  }

  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Navigation requests (HTML document) - Stale While Revalidate
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse.ok) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // If offline, return cached index.html
          return caches.match('/index.html') || caches.match('/');
        })
    );
    return;
  }

  // Static assets (JS, CSS, images, fonts)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return from cache, and optionally update in background if online
        if (navigator.onLine) {
          fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.ok) {
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(event.request, networkResponse);
                });
              }
            })
            .catch(() => {});
        }
        return cachedResponse;
      }

      // Fetch from network and cache
      return fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.ok && networkResponse.type === 'basic') {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Return empty or fallback if unavailable
          return new Response('Offline', { status: 503, statusText: 'Offline' });
        });
    })
  );
});
