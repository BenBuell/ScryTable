const CACHE_NAME = "scrytable-shell-v7";
// NOTE: "/index.html" is deliberately absent. Cloudflare Pages 307-redirects
// /index.html -> / and /offline.html -> /offline, and Cache.put() throws a
// TypeError on a redirected Response. Requesting "/" avoids the redirect.
const APP_SHELL = [
  "/",
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

// Cache each shell entry independently. cache.addAll() is atomic, so a single
// 404 or redirect aborts the whole install and leaves the app with no cache at
// all — which is exactly what happened while the icons were 404ing. Copying the
// body into a fresh Response also strips the "redirected" flag that Cache.put()
// rejects, so a redirecting path degrades instead of failing the install.
function cacheShellAsset(cache, path) {
  return fetch(path, { cache: "reload" })
    .then((response) => {
      if (!response.ok) throw new Error(path + " -> HTTP " + response.status);
      return response.blob().then((body) => cache.put(path, new Response(body, {
        status: 200,
        headers: { "Content-Type": response.headers.get("Content-Type") || "application/octet-stream" }
      })));
    })
    .catch((err) => {
      console.warn("[sw] shell asset skipped:", err && err.message);
    });
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => Promise.all(APP_SHELL.map((path) => cacheShellAsset(cache, path))))
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
          if (response.ok && !response.redirected && response.type === "basic" && isShellAsset) {
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