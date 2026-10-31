const CACHE_NAME = "radioverse-v1";
const OFFLINE_URL = "/offline";

const APP_SHELL = [
  "/",
  "/offline",
  "/manifest.json",
  "/icons/icon-192.svg",
  "/icons/icon-512.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // NEVER cache live audio streams or audio requests
  if (
    url.pathname.endsWith(".m3u8") ||
    url.pathname.endsWith(".ts") ||
    url.pathname.endsWith(".aac") ||
    url.pathname.endsWith(".mp3") ||
    url.pathname.includes("/proxy/") ||
    url.pathname.includes("/audio") ||
    url.pathname.includes("/live") ||
    event.request.headers.get("range")
  ) {
    return;
  }

  // Admin routes should never be cached
  if (url.pathname.startsWith("/admin") || url.pathname.startsWith("/api/v1/admin")) {
    return;
  }

  // Handle HTML navigation requests with network-first and offline fallback
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        const cachedOffline = await cache.match(OFFLINE_URL);
        return cachedOffline || new Response("Offline. Please reconnect to internet.", { status: 503 });
      })
    );
    return;
  }

  // Cache-first for static icons & manifest
  if (url.pathname.startsWith("/icons/") || url.pathname === "/manifest.json") {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return cached || fetch(event.request);
      })
    );
  }
});
