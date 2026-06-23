const CACHE_NAME = 'uor-english-dept-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './Icon23.png',
    './manifest.json',
    'https://cdn.tailwindcss.com',
    'https://unpkg.com/lucide@latest'
];

// Installation Cycle: Capture and bundle application frameworks offline
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then((cache) => {
            console.log('Pre-Caching Critical Visual Shell Assets...');
            return cache.addAll(ASSETS_TO_CACHE);
        })
        .then(() => self.skipWaiting())
    );
});

// Activation Cycle: Erase historical cache profiles
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('Clearing Outdated Caches:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch Interception Matrix: Advanced Stale-While-Revalidate Engine
self.addEventListener('fetch', (event) => {
    // Only intercept local assets or critical scripts
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                // Background update synchronization
                fetch(event.request).then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
                    }
                }).catch(() => { /* Maintain offline silence on network dropouts */ });
                
                return cachedResponse;
            }
            return fetch(event.request);
        })
    );
});
