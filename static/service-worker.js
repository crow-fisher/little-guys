const CACHE_NAME = "little-guys-cache-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/static/canvas.js",
  "/static/main.js",
  "/static/styles.css",
  "/static/manifest.json"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
