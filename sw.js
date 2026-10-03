const CACHE = 'italiano-b2-v15';
// path relativi: l'app è pubblicata su un sottopercorso di GitHub Pages (/App-Italiano-/),
// path assoluti come '/index.html' puntano alla root del dominio e falliscono la precache.
// (le immagini di avvio iOS in splash-ios/ non servono offline: iOS le legge solo all'installazione;
// le illustrazioni grandi img/luoghi/<id>.webp entrano in cache la prima volta che si vedono)
const ASSETS = [
  './', './index.html', './knowledge.json', './manifest.json',
  './icon.png', './apple-touch-icon.png', './splash.jpg', './splash-desktop.jpg', './andrea.jpg',
  './img/sfondo.webp', './img/cielo/alba.webp', './img/cielo/giorno.webp', './img/cielo/tramonto.webp', './img/cielo/notte.webp',
  './img/luoghi/alpesiusi-s.webp', './img/luoghi/amalfi-s.webp', './img/luoghi/amatriciana-s.webp', './img/luoghi/arancino-s.webp',
  './img/luoghi/arena-s.webp', './img/luoghi/arrosticini-s.webp', './img/luoghi/assisi-s.webp', './img/luoghi/baba-s.webp',
  './img/luoghi/baccala-s.webp', './img/luoghi/balsamico-s.webp', './img/luoghi/barumini-s.webp', './img/luoghi/basilicasm-s.webp',
  './img/luoghi/bergamo-s.webp', './img/luoghi/bicerin-s.webp', './img/luoghi/bistecca-s.webp', './img/luoghi/braies-s.webp',
  './img/luoghi/burano-s.webp', './img/luoghi/burrata-s.webp', './img/luoghi/cacioepepe-s.webp', './img/luoghi/campo-s.webp',
  './img/luoghi/canederli-s.webp', './img/luoghi/cannolo-s.webp', './img/luoghi/cantucci-s.webp', './img/luoghi/capri-s.webp',
  './img/luoghi/carasau-s.webp', './img/luoghi/carbonara-s.webp', './img/luoghi/cassata-s.webp', './img/luoghi/castelluccio-s.webp',
  './img/luoghi/castelmonte-s.webp', './img/luoghi/castelsantangelo-s.webp', './img/luoghi/cenacolo-s.webp', './img/luoghi/cervino-s.webp',
  './img/luoghi/cinqueterre-s.webp', './img/luoghi/civita-s.webp', './img/luoghi/colosseo-s.webp', './img/luoghi/conero-s.webp',
  './img/luoghi/cornetto-s.webp', './img/luoghi/costasmeralda-s.webp', './img/luoghi/cotoletta-s.webp', './img/luoghi/cretesenesi-s.webp',
  './img/luoghi/dolomiti-s.webp', './img/luoghi/duetorri-s.webp', './img/luoghi/duomofi-s.webp', './img/luoghi/duomomi-s.webp',
  './img/luoghi/duomosiena-s.webp', './img/luoghi/elba-s.webp', './img/luoghi/espresso-s.webp', './img/luoghi/etna-s.webp',
  './img/luoghi/farinata-s.webp', './img/luoghi/fiasco-s.webp', './img/luoghi/focaccia-s.webp', './img/luoghi/foro-s.webp',
  './img/luoghi/galleria-s.webp', './img/luoghi/garda-s.webp', './img/luoghi/gelato-s.webp', './img/luoghi/giulietta-s.webp',
  './img/luoghi/goloritze-s.webp', './img/luoghi/gondola-s.webp', './img/luoghi/gorgonzola-s.webp', './img/luoghi/granita-s.webp',
  './img/luoghi/gransasso-s.webp', './img/luoghi/grotta-s.webp', './img/luoghi/lago-s.webp', './img/luoghi/lagodorta-s.webp',
  './img/luoghi/lampedusa-s.webp', './img/luoghi/langhe-s.webp', './img/luoghi/lanterna-s.webp', './img/luoghi/lasagne-s.webp',
  './img/luoghi/lecce-s.webp', './img/luoghi/limone-s.webp', './img/luoghi/lucca-s.webp', './img/luoghi/maggiore-s.webp',
  './img/luoghi/maritozzo-s.webp', './img/luoghi/miramare-s.webp', './img/luoghi/moka-s.webp', './img/luoghi/mole-s.webp',
  './img/luoghi/monreale-s.webp', './img/luoghi/montebianco-s.webp', './img/luoghi/mortadella-s.webp', './img/luoghi/mozzarella-s.webp',
  './img/luoghi/nduja-s.webp', './img/luoghi/norma-s.webp', './img/luoghi/noto-s.webp', './img/luoghi/olio-s.webp',
  './img/luoghi/orecchiette-s.webp', './img/luoghi/orvieto-s.webp', './img/luoghi/ostia-s.webp', './img/luoghi/paestum-s.webp',
  './img/luoghi/palazzoducale-s.webp', './img/luoghi/palazzovecchio-s.webp', './img/luoghi/pandoro-s.webp', './img/luoghi/panettone-s.webp',
  './img/luoghi/pantheon-s.webp', './img/luoghi/paradiso-s.webp', './img/luoghi/parmigiano-s.webp', './img/luoghi/pastiera-s.webp',
  './img/luoghi/pesto-s.webp', './img/luoghi/piadina-s.webp', './img/luoghi/piazza-s.webp', './img/luoghi/piazzaspagna-s.webp',
  './img/luoghi/pisa-s.webp', './img/luoghi/pizza-s.webp', './img/luoghi/plebiscito-s.webp', './img/luoghi/polenta-s.webp',
  './img/luoghi/polignano-s.webp', './img/luoghi/pompei-s.webp', './img/luoghi/pontevecchio-s.webp', './img/luoghi/porchetta-s.webp',
  './img/luoghi/portofino-s.webp', './img/luoghi/procida-s.webp', './img/luoghi/prosciutto-s.webp', './img/luoghi/prosecco-s.webp',
  './img/luoghi/ravenna-s.webp', './img/luoghi/reggia-s.webp', './img/luoghi/rialto-s.webp', './img/luoghi/ribollita-s.webp',
  './img/luoghi/risotto-s.webp', './img/luoghi/sacra-s.webp', './img/luoghi/sangimignano-s.webp', './img/luoghi/sanmarco-s.webp',
  './img/luoghi/sanpietro-s.webp', './img/luoghi/sassi-s.webp', './img/luoghi/saturnia-s.webp', './img/luoghi/scaladeiturchi-s.webp',
  './img/luoghi/scrovegni-s.webp', './img/luoghi/seadas-s.webp', './img/luoghi/sfogliatella-s.webp', './img/luoghi/sistina-s.webp',
  './img/luoghi/spaghetti-s.webp', './img/luoghi/spritz-s.webp', './img/luoghi/stromboli-s.webp', './img/luoghi/suppli-s.webp',
  './img/luoghi/tagliatelle-s.webp', './img/luoghi/taormina-s.webp', './img/luoghi/tartufo-s.webp', './img/luoghi/tempio-s.webp',
  './img/luoghi/tiramisu-s.webp', './img/luoghi/tivoli-s.webp', './img/luoghi/tortellini-s.webp', './img/luoghi/trevi-s.webp',
  './img/luoghi/tropea-s.webp', './img/luoghi/trullo-s.webp', './img/luoghi/urbino-s.webp', './img/luoghi/valdorcia-s.webp',
  './img/luoghi/venaria-s.webp', './img/luoghi/vesuvio-s.webp', './img/luoghi/vitellotonnato-s.webp'
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
