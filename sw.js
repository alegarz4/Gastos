const CACHE_NAME = "gastos-cache-v3";
const APP_PREFIX = "/Gastos";

const ASSETS = [
  `${APP_PREFIX}/`,
  `${APP_PREFIX}/index.html`,
  `${APP_PREFIX}/manifest.json`,
  `${APP_PREFIX}/icon-192-pro.png`,
  `${APP_PREFIX}/icon-512-pro.png`,
  `${APP_PREFIX}/apple-touch-icon-pro.png`,
  `${APP_PREFIX}/favicon-64-pro.png`
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }

          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });

          return networkResponse;
        })
        .catch(() => caches.match(`${APP_PREFIX}/index.html`));
    })
  );
});
