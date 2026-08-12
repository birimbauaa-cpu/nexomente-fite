const CACHE = 'nexomente-v3';

const APP_SHELL = [
  './',
  './index.html',
  './css/styles.css',
  './js/app.js',
  './assets/logo-mark.svg',
  './manifest.webmanifest'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(APP_SHELL))
  );

  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(key => key !== CACHE)
            .map(key => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return;

  /*
   * NETWORK FIRST
   *
   * Primeiro tenta pegar a versão mais nova.
   * Só usa o cache se estiver offline.
   */
  event.respondWith(
    fetch(request)
      .then(response => {
        if (
          response &&
          response.status === 200
        ) {
          const copy = response.clone();

          caches.open(CACHE)
            .then(cache => {
              cache.put(request, copy);
            });
        }

        return response;
      })
      .catch(() => {
        return caches.match(request)
          .then(cached => {
            if (cached) return cached;

            if (request.mode === 'navigate') {
              return caches.match('./index.html');
            }

            return Response.error();
          });
      })
  );
});
