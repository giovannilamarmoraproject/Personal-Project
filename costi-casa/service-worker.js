const CACHE_NAME = "casa-app-v1.8.4"; // Incrementa ad ogni rilascio di codice
const MEDIA_CACHE = "casa-media-v1"; // Does not get deleted on version bumps

const urlsToCache = [
  "./index.html",
  "./style.css",
  "./app.js",
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
  // Ignora le richieste alle API di GitHub e tutte le chiamate non GET
  if (
    event.request.url.includes("api.github.com") ||
    event.request.method !== "GET"
  ) {
    event.respondWith(fetch(event.request));
    return;
  }

  const url = new URL(event.request.url);

  // Asset principali dell'app: index, script, fogli di stile e manifest
  const isCoreAsset =
    event.request.mode === "navigate" ||
    url.pathname.endsWith("/app.js") ||
    url.pathname.endsWith("/style.css") ||
    url.pathname.endsWith("/manifest.json");

  // 1. STRATEGIA NETWORK-FIRST per i file di logica e interfaccia
  // Se connesso scarica la versione aggiornata, se offline usa la cache
  if (isCoreAsset) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Fallback specifico se la navigazione fallisce offline
            if (event.request.mode === "navigate") {
              return caches.match("./index.html");
            }
          });
        }),
    );
    return;
  }

  const isMedia =
    event.request.url.includes("drive.google.com/thumbnail") ||
    event.request.url.includes("googleusercontent.com");

  // 2. STRATEGIA CACHE-FIRST per immagini, Google Fonts e CDN esterni (SweetAlert2)
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }

      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || !event.request.url.startsWith("http")) {
          return networkResponse;
        }

        const isBasic =
          networkResponse.type === "basic" && networkResponse.status === 200;
        const isCors =
          networkResponse.type === "cors" && networkResponse.status === 200;
        const isOpaque = networkResponse.type === "opaque";

        if (isBasic || isCors || (isMedia && isOpaque)) {
          const responseToCache = networkResponse.clone();
          const targetCache = isMedia ? MEDIA_CACHE : CACHE_NAME;
          caches.open(targetCache).then((cache) => {
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
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );
  self.clients.claim();
});

// Risponde al postMessage SKIP_WAITING inviato dalla pagina
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
