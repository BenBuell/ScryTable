const CACHE_NAME = "scrytable-shell-v1";
const APP_SHELL = [
  "/",
  "/index.html",
  "/pwa.js",
  "/manifest.webmanifest",
  "/offline.html",
  "/icons/apple-touch-icon.png",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-512-maskable.png"
];
const SHELL_PATHS = new Set(APP_SHELL);

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key.startsWith("scrytable-") && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const isNavigation = request.mode === "navigate";
  const isShellAsset = SHELL_PATHS.has(url.pathname);
  if (!isNavigation && !isShellAsset) return;

  event.respondWith(
    caches.match(request, { ignoreSearch: true }).then((cached) => {
      const networkFetch = fetch(request)
        .then((response) => {
          if (response.ok && response.type === "basic" && isShellAsset) {
            const copy = response.clone();
            const cacheKey = url.pathname === "/" ? "/" : request;
            caches.open(CACHE_NAME).then((cache) => cache.put(cacheKey, copy));
          }
          return response;
        })
        .catch(() => {
          if (isNavigation) return caches.match("/offline.html");
          return cached;
        });

      // Cached shell assets render immediately while a successful network
      // response refreshes the cache. Network/API requests are never handled
      // here because cross-origin requests are returned above.
      return cached || networkFetch;
    })
  );
});