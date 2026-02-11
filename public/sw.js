//
// Service Worker for PWA (install as application)
//
const CACHE_NAME = 'shibutz-plus-v1';
const urlsToCache = [
    '/',
    '/manifest.json',
    '/logo192.png',
    '/logo512.png'
];

// Install event - cache core assets
self.addEventListener('install', (event) => {
    self.skipWaiting(); // Force the waiting service worker to become the active service worker
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(urlsToCache);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request)
            .catch(() => {
                return caches.match(event.request);
            })
    );
});

//
// Web Push Notification event
//
self.addEventListener('push', function (event) {
    if (event.data) {
        let payload = {};
        try {
            payload = event.data.json();
        } catch (e) {
            // Fallback for plain text payloads (like DevTools test messages)
            payload = { body: event.data.text() };
        }

        const title = payload.title || 'שיבוץ פלוס';
        const options = {
            body: payload.body || 'התקבל עדכון חדש במערכת השעות',
            icon: '/logo192.png',
            badge: '/logo32.png',
            data: {
                url: payload.url || '/' // URL to open on click (sent from publishDailyScheduleAction.ts)
            }
        };

        event.waitUntil(self.registration.showNotification(title, options));
    }
});

// Notification click event
self.addEventListener('notificationclick', function (event) {
    event.notification.close();

    if (event.notification.data && event.notification.data.url) {
        event.waitUntil(
            clients.openWindow(event.notification.data.url)
        );
    } else {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});
