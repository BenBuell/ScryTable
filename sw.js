const CACHE_NAME = "scrytable-shell-v9";
const APP_SHELL = [
  "/",
  "/index.html",
  "/pwa.js",
  "/manifest.webmanifest",
  "/offline.html",
  "/favicon.ico",
  "/favicon-32.png",
  "/apple-touch-icon.png",
  "/apple-touch-icon-precomposed.png",
  "/apple-touch-icon-v5.png",
  "/icon-192-v5.png",
  "/icon-512-v5.png",
  "/icon-512-maskable-v5.png",
  "/scrytable-logo-v5.png"
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
  // Lite is deliberately online-only even when hosted beside the PWA.
  if (url.pathname.endsWith("/scrytable-lite.html")) return;

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
            event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put(cacheKey, copy)).catch(console.warn));
          }
          return response;
        })
        .catch(() => {
          if (cached) return cached;
          if (isNavigation) return caches.match("/offline.html");
          return Response.error();
        });

      // Cached shell assets render immediately while a successful network
      // response refreshes the cache. Network/API requests are never handled
      // here because cross-origin requests are returned above.
      return isNavigation ? networkFetch : (cached || networkFetch);
    })
  );
});