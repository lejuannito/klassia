/* Installation waits until every critical file has passed its integrity check. */
importScripts('./precache-manifest.js');

const release = self.KLASSIA_RELEASE;
const scope = self.registration.scope;
const CACHE_NAME = 'klassia-v15-' + release.version;
const files = release.files.map(file => ({ ...file, url: new URL(file.url, scope).href }));
const filesByUrl = new Map(files.map(file => [file.url, file]));

async function verifiedResponse(file, controller = new AbortController()) {
  const timer = setTimeout(() => controller.abort(new Error('Délai de téléchargement dépassé pour ' + file.url)), 30000);
  try {
    const response = await fetch(file.url, { cache: 'reload', signal: controller.signal });
    if (!response.ok) throw new Error('Téléchargement incomplet : ' + file.url);

    const bytes = await response.clone().arrayBuffer();
    const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', bytes));
    const hash = Array.from(digest, byte => byte.toString(16).padStart(2, '0')).join('');
    if (hash !== file.sha256) throw new Error('Version incohérente : ' + file.url);
    return response;
  } finally {
    clearTimeout(timer);
  }
}

async function installRelease() {
  // A stale manifest can name the cache of the edition already in use.
  const existed = await caches.has(CACHE_NAME);
  const cache = await caches.open(CACHE_NAME);
  const controller = new AbortController();
  let index = 0;

  async function download() {
    try {
      while (!controller.signal.aborted && index < files.length) {
        const file = files[index++];
        const response = await verifiedResponse(file, controller);
        if (!existed || !await cache.match(file.url)) await cache.put(file.url, response);
      }
    } catch (error) {
      controller.abort(error);
      throw error;
    }
  }

  // Wait for all cache writes before cleaning up a failed installation.
  const downloads = await Promise.allSettled(Array.from({ length: 4 }, download));
  const failure = downloads.find(result => result.status === 'rejected');
  if (failure) {
    if (!existed) await caches.delete(CACHE_NAME);
    throw controller.signal.reason || failure.reason;
  }
}

async function activateOnRequest(event) {
  const requester = event.source;
  if (requester?.type !== 'window' || !requester.url.startsWith(scope)) return;

  const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  if (windows.some(client => client.id !== requester.id && client.url.startsWith(scope))) {
    event.ports[0]?.postMessage({ reason: 'other-tabs' });
    return;
  }
  await self.skipWaiting();
}

self.addEventListener('install', event => event.waitUntil(installRelease()));

self.addEventListener('message', event => {
  if (event.data?.type === 'ACTIVATE_RELEASE') {
    event.waitUntil(activateOnRequest(event));
  }
  if (event.data?.type === 'OFFLINE_STATUS' && event.ports[0]) {
    event.waitUntil((async () => {
      const cache = await caches.open(CACHE_NAME);
      const matches = await Promise.all(files.map(file => cache.match(file.url)));
      const count = matches.filter(Boolean).length;
      event.ports[0].postMessage({
        ready: count === files.length,
        count,
        total: files.length,
        version: release.version
      });
    })());
  }
});

self.addEventListener('activate', event => event.waitUntil((async () => {
  const keys = (await caches.keys()).filter(key => key.startsWith('klassia-') && key !== CACHE_NAME);
  await Promise.all(keys.slice(0, -1).map(key => caches.delete(key)));
  await self.clients.claim();
})()));

function unavailable() {
  return new Response('Cette ressource manque dans l’édition installée. Reconnectez-vous et vérifiez les mises à jour.', {
    status: 503,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  });
}

async function serve(request, url) {
  url.search = '';
  url.hash = '';
  if (url.pathname.endsWith('/')) url.pathname += 'index.html';

  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(url);
  if (cached) return cached;

  try {
    const file = filesByUrl.get(url.href);
    if (!file) return await fetch(request);

    // Repair a missing file only if the server still has the installed bytes.
    const response = await verifiedResponse(file);
    try { await cache.put(url, response.clone()); } catch { /* The verified response is still usable online. */ }
    return response;
  } catch {
    return unavailable();
  }
}

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method === 'GET' && url.href.startsWith(scope)) {
    event.respondWith(serve(request, url));
  }
});
