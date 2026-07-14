const CACHE_NAME = 'mischmasch-v41';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './words/index.json',
  './words/accessoires.tsv',
  './words/klamotten.tsv',
  './words/farben.tsv',
  './words/frisur.tsv',
  './words/stil.tsv',
  './words/figur.tsv',
  './words/hobbies.tsv',
  './words/schultasche.tsv',
  './words/klassenzimmer.tsv',
  './words/maeppchen.tsv',
  './words/meinungen.tsv',
  './words/verben.tsv',
  './words/tageszeiten.tsv',
  './words/wochentage.tsv',
  './words/jahreszeiten.tsv',
  './words/monate.tsv',
  './words/in-der-klasse.tsv',
  './words/essen-trinken.tsv',
  './words/freizeit-pflichten.tsv',
  './modules/time.js',
  './modules/tagesablauf.js',
  './modules/akkusativ.js',
  './modules/modalverben.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  // Do not skipWaiting here: a freshly-installed update waits until the page
  // tells it to activate (see the SKIP_WAITING message), so updates apply at
  // a controlled moment (banner tap or when the app is refocused).
});

// The page posts this when it's ready to switch to the new version.
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request)
        .then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
