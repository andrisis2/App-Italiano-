const CACHE = 'italiano-b2-v5';
const ASSETS = ['/', '/index.html', '/frasi.html', '/flashcard.html', '/fonetica.html', '/grammatica.html', '/style.css', '/app.js', '/knowledge.json', '/manifest.json'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS).catch(() => {})));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.matchAll({ type: 'window', includeUncontrolled: true }))
      .then(clients => { clients.forEach(c => c.navigate(c.url)); })
  );
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
