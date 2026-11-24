/* Guarda la app en el celular para que abra sin internet.
   Con internet, siempre busca primero la versión nueva; sin internet, usa la guardada. */
const CACHE = 'encargado-4.8';
const ARCHIVOS = ['./', './index.html', './manifest.webmanifest', './icono-192.png', './icono-512.png', './icono-mascara-512.png', './icono-apple-180.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  e.respondWith(
    fetch(r).then(resp => {
      if (resp.ok) { const copia = resp.clone(); caches.open(CACHE).then(c => c.put(r, copia)); }
      return resp;
    }).catch(() => caches.match(r, { ignoreSearch: true }).then(g => g || caches.match('./index.html')))
  );
});
