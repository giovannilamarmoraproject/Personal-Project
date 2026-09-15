const CACHE_NAME = "casa-app-v1.6.9";
const MEDIA_CACHE = "casa-media-v1"; // Does not get deleted on version bumps
const urlsToCache = [
  "./index.html",
  "./icon.jpg?v=1",
  "./manifest.json",
  "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0",
  "https://cdn.jsdelivr.net/npm/sweetalert2@11",
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all(
        urlsToCache.map((url) => {
          return fetch(new Request(url, { cache: "no-store" })).then(
            (response) => {
              if (!response.ok) {
                throw new Error("Failed to cache: " + url);
              }
              return cache.put(url, response);
            },
          );
        }),
      );
    }),
  );
});

self.addEventListener("fetch", (event) => {
  // Ignora le richieste alle API di GitHub e tutte le chiamate non GET (es. POST, PATCH, PUT, DELETE)
  if (
    event.request.url.includes("api.github.com") ||
    event.request.method !== "GET"
  ) {
    event.respondWith(fetch(event.request));
    return;
  }

  const isMedia =
    event.request.url.includes("drive.google.com/thumbnail") ||
    event.request.url.includes("googleusercontent.com");

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }

      return fetch(event.request).then(function (networkResponse) {
        if (!networkResponse || !event.request.url.startsWith("http")) {
          return networkResponse;
        }

        const isBasic =
          networkResponse.type === "basic" && networkResponse.status === 200;
        const isCors =
          networkResponse.type === "cors" && networkResponse.status === 200;
        const isOpaque = networkResponse.type === "opaque";

        if (isBasic || isCors || (isMedia && isOpaque)) {
          var responseToCache = networkResponse.clone();
          const targetCache = isMedia ? MEDIA_CACHE : CACHE_NAME;
          caches.open(targetCache).then(function (cache) {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      });
    }),
  );
});

self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME, MEDIA_CACHE];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );
  self.clients.claim();
});
