// Version-stamped explicit cache control string
const CACHE_NAME = 'uor-english-dept-v2026-06-23';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './offline.html',
    './Icon23.png',
    './manifest.json',
    'https://cdn.tailwindcss.com',
    'https://unpkg.com/lucide@latest'
];

// Capture and cache structural assets immediately on first install
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then((cache) => {
            console.log('Pre-Caching System Assets...');
            return cache.addAll(ASSETS_TO_CACHE);
        })
        .then(() => self.skipWaiting())
    );
});

// Clear out old caches when a version bump is discovered
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('Wiping Legacy Cache Scope Block:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch Interception Engine: Stale-While-Revalidate with full Navigation Fallback
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                // Fetch fresh copy in the background to update the cache
                fetch(event.request).then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
                    }
                }).catch(() => { /* Fail silently if offline */ });
                
                return cachedResponse;
            }
            
            // Asset is not cached, attempt to download over the network
            return fetch(event.request).catch(() => {
                // If network fails completely and user is navigating, drop to offline view page
                if (event.request.mode === 'navigate') {
                    return caches.match('./offline.html');
                }
            });
        })
    );
});
