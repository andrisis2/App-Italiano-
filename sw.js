const CACHE = 'italiano-b2-v11';
// path relativi: l'app è pubblicata su un sottopercorso di GitHub Pages (/App-Italiano-/),
// path assoluti come '/index.html' puntano alla root del dominio e falliscono la precache.
const ASSETS = [
  './', './index.html', './knowledge.json', './manifest.json',
  './icon.png', './splash.png', './splash-desktop.png',
  './lm-sanpietro.jpg', './lm-sanmarco.jpg', './lm-duomomi.jpg'
];
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
          // si scrive sotto la chiave senza query string, altrimenti ogni load
          // (knowledge.json?_=timestamp diverso ogni volta) crea una nuova voce
          // in cache invece di sovrascrivere sempre la stessa.
          const key = new URL(req.url); key.search = '';
          caches.open(CACHE).then(c => c.put(key.toString(), copy)).catch(() => {});
        }
        return res;
      })
      // ignoreSearch sempre true: knowledge.json viene richiesto con un query-buster
      // che cambia a ogni load ("?_="+Date.now()), quindi offline non troverebbe mai
      // l'URL esatto in cache se si confrontasse anche la query string.
      .catch(() => caches.match(req, { ignoreSearch: true }))
  );
});
