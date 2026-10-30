const CACHE_NAME = 'klassia-ce2-v11-20261031';
const APP_SHELL = [
  "./app.js",
  "./data/catalog.json",
  "./data/content-u1.json",
  "./data/content-u2.json",
  "./data/content-u3.json",
  "./data/content-u4.json",
  "./data/content-u5.json",
  "./data/content-u6.json",
  "./data/content-u7.json",
  "./data/content-u8.json",
  "./data/content.json",
  "./data/qcm-u1.json",
  "./data/qcm-u2.json",
  "./data/qcm-u3.json",
  "./data/qcm-u4.json",
  "./data/qcm-u5.json",
  "./data/qcm-u6.json",
  "./data/qcm-u7.json",
  "./data/qcm-u8.json",
  "./data/qcm.json",
  "./data/manual/part-01.txt",
  "./data/manual/part-02.txt",
  "./data/manual/part-03.txt",
  "./data/manual/part-04.txt",
  "./data/manual/part-05.txt",
  "./data/manual/part-06.txt",
  "./data/manual/part-07.txt",
  "./icons/apple-touch-icon.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./index.html",
  "./manifest.webmanifest",
  "./pwa.js",
  "./screenshots/mobile-home.png",
  "./screenshots/mobile-parent.png",
  "./style.css",
  "./v9.css",
  "./v9.js",
  "./manual-v11.css",
  "./manual-v11.js"
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await Promise.allSettled(APP_SHELL.map(async url => {
      const response = await fetch(url, { cache: 'reload' });
      if (response.ok) await cache.put(url, response.clone());
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith('klassia-ce2-') && k !== CACHE_NAME).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const network = await fetch(event.request);
        const cache = await caches.open(CACHE_NAME);
        if (network.ok) cache.put('./index.html', network.clone());
        return network;
      } catch (_) {
        return (await caches.match('./index.html')) || (await caches.match('./'));
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(event.request);
    const networkPromise = fetch(event.request).then(async response => {
      if (response && response.ok) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(event.request, response.clone());
      }
      return response;
    }).catch(() => null);
    if (cached) {
      networkPromise.catch(() => null);
      return cached;
    }
    return (await networkPromise) || new Response('Ressource indisponible hors connexion', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  })());
});
