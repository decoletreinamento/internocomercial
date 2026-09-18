const CACHE_NAME = 'decole-portal-v2'; // Mudar para v2 força o download do novo layout
const assetsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting(); // Força a atualização imediata
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(assetsToCache))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});