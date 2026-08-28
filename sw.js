// ============================================================
//  WINGSATI PWA — SERVICE WORKER v1.0
//  Caching strategy: Cache First + Network Fallback
// ============================================================

const CACHE_NAME = 'wingsati-v1.7';
const ASSETS = [
    './',
    './index.html',
    './cabang.html',
    './style.css',
    './script.js',
    './firebase.js',
    './firebase-sync.js',
    './manifest.json',
    './wingsati logo vertikal.png',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'
];

// Install: cache semua aset
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Caching assets...');
                return cache.addAll(ASSETS);
            })
            .catch((err) => console.error('[SW] Cache failed:', err))
    );
    self.skipWaiting();
});

// Activate: hapus cache lama
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            )
        )
    );
    self.clients.claim();
});

// Fetch: Cache First, fallback ke network
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    // Update cache di background (stale-while-revalidate)
                    fetch(event.request)
                        .then((networkResponse) => {
                            if (networkResponse && networkResponse.status === 200) {
                                caches.open(CACHE_NAME)
                                    .then((cache) => cache.put(event.request, networkResponse));
                            }
                        })
                        .catch(() => {});
                    return cachedResponse;
                }

                // Tidak ada di cache → coba network
                return fetch(event.request)
                    .then((networkResponse) => {
                        if (networkResponse && networkResponse.status === 200) {
                            const responseClone = networkResponse.clone();
                            caches.open(CACHE_NAME)
                                .then((cache) => cache.put(event.request, responseClone));
                        }
                        return networkResponse;
                    })
                    .catch(() => {
        // Offline fallback untuk navigasi HTML
        if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
        }
                    });
            })
    );
});

// Message: force update
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
