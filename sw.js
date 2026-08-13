/* Rasa-e-Lazzat app shell. Bump CACHE when the deploy changes. */
const CACHE = "lazzat-shell-v1";
const PRECACHE = [
  "/",
  "/index.html",
  "/admin.html",
  "/site.webmanifest",
  "/css/styles.css",
  "/css/admin.css",
  "/js/pwa.js",
  "/js/logo.js",
  "/js/app.js",
  "/js/admin.js",
  "/js/gifts.js",
  "/js/inventory-data.js",
  "/js/kitchen-store.js",
  "/assets/favicon.svg",
  "/assets/icon-192.png",
  "/assets/icon-512.png",
  "/assets/logo-seal.svg",
  "/assets/logo-wordmark.svg",
  "/assets/logo-lockup.svg",
];

function isVideo(url) {
  return /\.(mp4|webm|mov)(\?|$)/i.test(url);
}

function isStatic(url) {
  return /\.(css|js|mjs|png|jpe?g|gif|svg|webp|ico|woff2?|ttf|webmanifest|json|txt|xml|mp3)(\?|$)/i.test(url);
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (isVideo(url.pathname)) return;

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          if (!res || res.status !== 200 || res.type === "error") return res;
          if (req.mode === "navigate" || isStatic(url.pathname)) {
            const copy = res.clone();
            caches.open(CACHE).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => {
          if (req.mode === "navigate") {
            return caches.match("/index.html");
          }
          return cached;
        });
    })
  );
});
