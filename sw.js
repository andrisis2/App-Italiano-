const CACHE = 'italiano-b2-v13';
// path relativi: l'app è pubblicata su un sottopercorso di GitHub Pages (/App-Italiano-/),
// path assoluti come '/index.html' puntano alla root del dominio e falliscono la precache.
// (le immagini di avvio iOS in splash-ios/ non servono offline: iOS le legge solo all'installazione;
// le illustrazioni grandi img/luoghi/<id>.webp entrano in cache la prima volta che si vedono)
const ASSETS = [
  './', './index.html', './knowledge.json', './manifest.json',
  './icon.png', './apple-touch-icon.png', './splash.jpg', './splash-desktop.jpg', './andrea.jpg',
  './img/sfondo.webp', './img/cielo/alba.webp', './img/cielo/giorno.webp', './img/cielo/tramonto.webp', './img/cielo/notte.webp',
  './img/luoghi/amalfi-s.webp', './img/luoghi/arancino-s.webp', './img/luoghi/arena-s.webp', './img/luoghi/basilicasm-s.webp',
  './img/luoghi/bistecca-s.webp', './img/luoghi/campo-s.webp', './img/luoghi/cannolo-s.webp', './img/luoghi/carbonara-s.webp',
  './img/luoghi/castelmonte-s.webp', './img/luoghi/cinqueterre-s.webp', './img/luoghi/colosseo-s.webp', './img/luoghi/cornetto-s.webp',
  './img/luoghi/costasmeralda-s.webp', './img/luoghi/dolomiti-s.webp', './img/luoghi/duomofi-s.webp', './img/luoghi/duomomi-s.webp',
  './img/luoghi/espresso-s.webp', './img/luoghi/etna-s.webp', './img/luoghi/fiasco-s.webp', './img/luoghi/focaccia-s.webp',
  './img/luoghi/gelato-s.webp', './img/luoghi/gondola-s.webp', './img/luoghi/grotta-s.webp', './img/luoghi/lago-s.webp',
  './img/luoghi/limone-s.webp', './img/luoghi/moka-s.webp', './img/luoghi/mole-s.webp', './img/luoghi/mozzarella-s.webp',
  './img/luoghi/olio-s.webp', './img/luoghi/panettone-s.webp', './img/luoghi/pantheon-s.webp', './img/luoghi/paradiso-s.webp',
  './img/luoghi/parmigiano-s.webp', './img/luoghi/pesto-s.webp', './img/luoghi/pisa-s.webp', './img/luoghi/pizza-s.webp',
  './img/luoghi/pompei-s.webp', './img/luoghi/pontevecchio-s.webp', './img/luoghi/prosciutto-s.webp', './img/luoghi/reggia-s.webp',
  './img/luoghi/rialto-s.webp', './img/luoghi/risotto-s.webp', './img/luoghi/sanmarco-s.webp', './img/luoghi/sanpietro-s.webp',
  './img/luoghi/sassi-s.webp', './img/luoghi/spaghetti-s.webp', './img/luoghi/stromboli-s.webp', './img/luoghi/tagliatelle-s.webp',
  './img/luoghi/tempio-s.webp', './img/luoghi/tiramisu-s.webp', './img/luoghi/tortellini-s.webp', './img/luoghi/trevi-s.webp',
  './img/luoghi/trullo-s.webp', './img/luoghi/valdorcia-s.webp', './img/luoghi/vesuvio-s.webp'
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
