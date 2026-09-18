const CACHE_NAME = 'decole-portal-v4';
const assets = [
  './',
  './index.html',
  './manifest.json',
  './fundo.png',
  './logo1.png'
];

// Instala o Service Worker e força o uso imediato
// (se algum arquivo da lista não existir, os outros continuam sendo guardados)
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all(assets.map((url) => cache.add(url).catch(() => {})))
    )
  );
});

// Deleta caches antigos e assume o controle das abas abertas
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

// Estratégia Network First (busca a rede primeiro para sempre exibir o visual novo)
// Sem internet, usa a cópia guardada.
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  if (new URL(req.url).origin !== self.location.origin) return;

  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok) {
          const copia = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copia));
        }
        return res;
      })
      .catch(() =>
        caches.match(req).then((res) =>
          res || (req.mode === 'navigate' ? caches.match('./index.html') : undefined)
        )
      )
  );
});