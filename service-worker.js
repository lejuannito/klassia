/* Installation waits until every critical file has passed its integrity check. */
importScripts('./precache-manifest.js');

const release = self.KLASSIA_RELEASE;
const scope = self.registration.scope;
const CACHE_NAME = 'klassia-v15-' + release.version;
const files = release.files.map(file => ({ ...file, url: new URL(file.url, scope).href }));
const filesByUrl = new Map(files.map(file => [file.url, file]));

// Téléchargement par classe (lot 9c). Le premier choix arrive dans l'adresse d'inscription (« service-worker.js?classes=SIL ») ;
// les choix suivants arrivent par message et le service worker les garde lui-même (la page ne touche pas au cache : ses accès
// concurrents perturbaient le service des pages). Sans choix, tout est installé, comme avant. La base commune l'est toujours.
const SETTINGS_CACHE = 'klassia:settings';
const SETTINGS_URL = new URL('__klassia/offline-classes.json', scope).href;
const valid = value => value === 'all' || (Array.isArray(value) && value.length > 0 && value.every(x => typeof x === 'string' && /^[A-Z0-9]{2,8}$/.test(x)));
const fromAddress = (() => {
  const raw = self.location?.href ? new URL(self.location.href).searchParams.get('classes') : null;
  const value = raw === 'all' ? 'all' : raw ? raw.split(',').filter(Boolean) : null;
  return valid(value) ? value : null;
})();
let chosen;
async function readSelection() {
  try {
    const saved = await (await caches.open(SETTINGS_CACHE)).match(SETTINGS_URL);
    const value = saved ? (await saved.json()).classes : null;
    chosen = valid(value) ? value : fromAddress || 'all';
  } catch { chosen = fromAddress || 'all'; }
  return chosen;
}
async function saveSelection(value) {
  const cache = await caches.open(SETTINGS_CACHE);
  await cache.put(SETTINGS_URL, new Response(JSON.stringify({ classes: value }), { headers: { 'Content-Type': 'application/json' } }));
  chosen = value;
}
const wanted = (file, selection = chosen ?? 'all') => !file.pack || selection === 'all' || selection.includes(file.pack);

async function sameBytes(response, file) {
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', await response.clone().arrayBuffer()));
  return Array.from(digest, byte => byte.toString(16).padStart(2, '0')).join('') === file.sha256;
}

async function verifiedResponse(file, controller = new AbortController()) {
  const timer = setTimeout(() => controller.abort(new Error('Délai de téléchargement dépassé pour ' + file.url)), 30000);
  try {
    const response = await fetch(file.url, { cache: 'reload', signal: controller.signal });
    if (!response.ok) throw new Error('Téléchargement incomplet : ' + file.url);
    if (!await sameBytes(response, file)) throw new Error('Version incohérente : ' + file.url);
    return response;
  } finally {
    clearTimeout(timer);
  }
}

// An update only downloads what changed: a file already installed by an earlier
// edition is reused when its bytes match the new release exactly.
async function installedCopy(file, editions) {
  for (const edition of editions) {
    const response = await edition.match(file.url);
    try {
      if (response && await sameBytes(response, file)) return response;
    } catch { /* An unreadable copy is downloaded again. */ }
  }
  return null;
}

async function installRelease() {
  // A stale manifest can name the cache of the edition already in use.
  const existed = await caches.has(CACHE_NAME);
  const cache = await caches.open(CACHE_NAME);
  const editions = await Promise.all((await caches.keys())
    .filter(key => key.startsWith('klassia-') && key !== CACHE_NAME).reverse()
    .map(key => caches.open(key)));
  const selection = await readSelection();
  const list = files.filter(file => wanted(file, selection));
  const controller = new AbortController();
  let index = 0;

  async function download() {
    try {
      while (!controller.signal.aborted && index < list.length) {
        const file = list[index++];
        if (existed && await installedCopy(file, [cache])) continue;
        const response = await installedCopy(file, editions) || await verifiedResponse(file, controller);
        await cache.put(file.url, response);
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
    event.waitUntil(status().then(reply => event.ports[0].postMessage(reply)));
  }
  if (event.data?.type === 'SET_CLASSES' && event.ports[0]) {
    const value = event.data.classes;
    event.waitUntil((valid(value) ? saveSelection(value) : Promise.resolve()).then(applySelection).then(status, error => status().then(reply => ({ ...reply, error: String(error?.message || error) })))
      .then(reply => event.ports[0].postMessage(reply)));
  }
});

// Adresses présentes dans l'édition installée, en une seule lecture du cache. Interroger le cache fichier par fichier
// (plus de trois cents lectures à chaque page ouverte) faisait attendre les pages derrière ces lectures.
async function cachedUrls(cache) {
  return new Set((await cache.keys()).map(request => request.url));
}

// État par paquet : la page affiche les classes disponibles et la taille de celles qu'on peut ajouter.
async function status() {
  const selection = await readSelection();
  const cache = await caches.open(CACHE_NAME);
  const urls = await cachedUrls(cache);
  const present = files.map(file => urls.has(file.url));
  const packs = {};
  files.forEach((file, i) => {
    const key = file.pack || 'common';
    const pack = packs[key] ??= { files: 0, cached: 0, bytes: 0 };
    pack.files++; pack.bytes += file.size || 0; if (present[i]) pack.cached++;
  });
  const needed = files.filter(file => wanted(file, selection));
  const count = needed.filter(file => present[files.indexOf(file)]).length;
  return { ready: count === needed.length, count, total: needed.length, version: release.version, selection, packs };
}

// Après un nouveau choix : télécharge (et vérifie) ce qui manque, retire les fichiers des classes enlevées.
async function applySelection() {
  const selection = await readSelection();
  const cache = await caches.open(CACHE_NAME);
  const editions = await Promise.all((await caches.keys())
    .filter(key => key.startsWith('klassia-') && key !== CACHE_NAME).map(key => caches.open(key)));
  const urls = await cachedUrls(cache);
  for (const file of files) {
    if (!wanted(file, selection)) { if (file.pack && urls.has(file.url)) await cache.delete(file.url); continue; }
    if (urls.has(file.url)) continue;
    await cache.put(file.url, await installedCopy(file, editions) || await verifiedResponse(file));
  }
}

self.addEventListener('activate', event => event.waitUntil((async () => {
  const keys = (await caches.keys()).filter(key => key.startsWith('klassia-') && key !== CACHE_NAME);
  await Promise.all(keys.slice(0, -1).map(key => caches.delete(key)));
  await self.clients.claim();
})()));

function unavailable(file) {
  const text = file?.pack && !wanted(file)
    ? 'Cette classe n’est pas installée hors connexion sur cet appareil. Reconnectez-vous, ou ajoutez-la dans « Classes hors connexion ».'
    : 'Cette ressource manque dans l’édition installée. Reconnectez-vous et vérifiez les mises à jour.';
  return new Response(text, {
    status: 503,
    headers: { 'Content-Type': 'text/plain; charset=utf-8', ...(file?.pack && !wanted(file) ? { 'X-Klassia-Not-Installed': file.pack } : {}) }
  });
}

async function releaseResponse(request, response, url) {
  // Cloudflare's HTML redirects are followed during installation. Navigations
  // cannot reuse a redirected Response, even after its content was verified.
  if (request.mode === 'navigate' && response.redirected) {
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    });
  }

  if (!url.pathname.endsWith('.mp3') || request.headers.has('If-Range')) return response;
  const range = /^bytes=(\d*)-(\d*)$/.exec(request.headers.get('Range') || '');
  if (!range || (!range[1] && !range[2])) return response;

  const bytes = await response.arrayBuffer();
  const size = bytes.byteLength;
  const start = range[1] ? Number(range[1]) : Math.max(0, size - Number(range[2]));
  const end = range[1] && range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
  if (start > end) {
    return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${size}` } });
  }

  return new Response(bytes.slice(start, end + 1), {
    status: 206,
    headers: {
      'Content-Type': 'audio/mpeg',
      'Content-Range': `bytes ${start}-${end}/${size}`,
      'Content-Length': String(end - start + 1),
      'Accept-Ranges': 'bytes'
    }
  });
}

async function serve(request, url) {
  url.search = '';
  url.hash = '';
  if (url.pathname.endsWith('/')) url.pathname += 'index.html';
  else if (request.mode === 'navigate' && !filesByUrl.has(url.href) && filesByUrl.has(url.href + '.html')) {
    url.pathname += '.html';
  }

  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(url);
  if (cached) return releaseResponse(request, cached, url);

  const file = filesByUrl.get(url.href);
  if (chosen === undefined) await readSelection();
  try {
    if (!file) return await fetch(request);

    // Repair a missing file only if the server still has the installed bytes. A file of a class that is not
    // installed on this device is served online without being kept.
    const response = await verifiedResponse(file);
    if (wanted(file)) { try { await cache.put(url, response.clone()); } catch { /* The verified response is still usable online. */ } }
    return await releaseResponse(request, response, url);
  } catch {
    return unavailable(file);
  }
}

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method === 'GET' && url.href.startsWith(scope)) {
    event.respondWith(serve(request, url));
  }
});
