const CACHE = 'italiano-b2-v9';
const ASSETS = ['/', '/index.html', '/knowledge.json', '/manifest.json', '/splash-desktop.png'];
self.addEventListener('install', e => {
  // cache:'no-cache' rivalida col server, altrimenti il pre-cache può ripescare file vecchi dalla cache HTTP
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS.map(u => new Request(u, { cache: 'no-cache' }))).catch(() => {})));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
// Network-first: prova sempre la rete (rivalidando la cache HTTP); la cache è solo fallback offline.
// Così gli aggiornamenti arrivano senza dover bumpare la versione a ogni deploy.
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || !req.url.startsWith(self.location.origin)) return;
  // una Request con mode 'navigate' non può essere combinata con RequestInit: si rifà dall'URL
  const fromNetwork = req.mode === 'navigate'
    ? fetch(req.url, { cache: 'no-cache' })
    : fetch(req, { cache: 'no-cache' });
  e.respondWith(
    fromNetwork
      .then(res => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() => caches.match(req, { ignoreSearch: req.mode === 'navigate' }))
  );
});
