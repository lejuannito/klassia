const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const crypto = require('node:crypto');

const scope = 'https://example.test/klassia/';
const previous = 'klassia-v14-old';
const candidate = 'klassia-v15-test-new';
const files = ['app.js', 'data/content-u1.json', 'ms/index.html'].map(url => ({
  url,
  sha256: crypto.createHash('sha256').update(url).digest('hex')
}));
const source = fs.readFileSync(require.resolve('../service-worker.js'), 'utf8');

function worker(fetchFile = async name => new Response(name), manifest = files, address = '') {
  const maps = new Map([[previous, new Map([['saved', 'old']])]]);
  const events = {};
  const context = {
    self: {
      registration: { scope },
      location: { href: scope + 'service-worker.js' + address },
      addEventListener: (type, handler) => { events[type] = handler; }
    },
    importScripts: () => { context.self.KLASSIA_RELEASE = { version: 'test-new', files: manifest }; },
    crypto: crypto.webcrypto,
    URL,
    Response,
    AbortController,
    setTimeout,
    clearTimeout,
    caches: {
      has: async name => maps.has(name),
      open: async name => {
        if (!maps.has(name)) maps.set(name, new Map());
        const cache = maps.get(name);
        return {
          put: async (url, value) => cache.set(String(url), value),
          match: async url => cache.get(String(url))?.clone(),
          delete: async url => cache.delete(String(url))
        };
      },
      delete: async name => maps.delete(name),
      keys: async () => [...maps.keys()]
    },
    fetch: (url, options) => fetchFile(String(url).slice(scope.length), options)
  };
  vm.runInNewContext(source, context);

  return {
    maps,
    install() {
      let completion;
      events.install({ waitUntil: promise => { completion = promise; } });
      return completion;
    },
    message(type, extra = {}) {
      return new Promise(resolve => events.message({ data: { type, ...extra }, ports: [{ postMessage: resolve }], waitUntil: () => {} }));
    },
    request(name) {
      let response;
      events.fetch({
        request: { method: 'GET', url: scope + name },
        respondWith: promise => { response = promise; }
      });
      return response;
    }
  };
}

test('a failed download removes the candidate cache and preserves the previous release', async () => {
  const w = worker(async name => {
    if (name === 'data/content-u1.json') throw new Error('offline');
    return new Response(name);
  });
  await assert.rejects(w.install(), /offline/);
  assert.ok(w.maps.has(previous));
  assert.ok(!w.maps.has(candidate));
});

test('an inconsistent file stops installation', async () => {
  const w = worker(async name => new Response(name === 'app.js' ? 'wrong edition' : name));
  await assert.rejects(w.install(), /incohérente/);
  assert.ok(w.maps.has(previous));
  assert.ok(!w.maps.has(candidate));
});

test('a stale manifest cannot erase a cache already used by another worker', async () => {
  let downloads = 0;
  const w = worker(async name => { downloads++; return new Response(name === 'app.js' ? 'new script' : name); });
  const installed = new Map(files.map(file => [scope + file.url, new Response(file.url)]));
  const original = [...installed];
  w.maps.set(candidate, installed);
  await w.install();
  assert.equal(downloads, 0, 'the verified copies already installed are kept');
  assert.deepEqual([...w.maps.get(candidate)], original);
});

test('an update downloads only the files whose bytes changed', async () => {
  const asked = [];
  const w = worker(async name => { asked.push(name); return new Response(name); });
  // The previous edition holds app.js unchanged, an older content file and no copy of ms/index.html.
  w.maps.get(previous).set(scope + 'app.js', new Response('app.js'));
  w.maps.get(previous).set(scope + 'data/content-u1.json', new Response('older content'));
  await w.install();
  assert.deepEqual(asked.sort(), ['data/content-u1.json', 'ms/index.html']);
  assert.equal(await w.maps.get(candidate).get(scope + 'app.js').text(), 'app.js');
  assert.equal(w.maps.get(candidate).size, files.length);
  assert.ok(w.maps.has(previous), 'the installed edition stays usable until activation');
});

test('a failed download aborts other requests before the candidate cache is removed', async () => {
  let aborted = false;
  const w = worker(async (name, { signal }) => {
    if (name === 'app.js') {
      return new Promise((_, reject) => signal.addEventListener('abort', () => {
        aborted = true;
        reject(signal.reason);
      }, { once: true }));
    }
    throw new Error('connection lost');
  });
  await assert.rejects(w.install(), /connection lost/);
  assert.equal(aborted, true);
  assert.ok(!w.maps.has(candidate));
});

test('a successful installation stores every critical asset', async () => {
  const w = worker();
  await w.install();
  assert.equal(w.maps.get(candidate).size, files.length);
});

test('a missing critical file is repaired only with bytes from the installed release', async () => {
  let served = 'next release data';
  const w = worker(async () => new Response(served));
  const file = 'data/content-u1.json';

  assert.equal((await w.request(file + '?cache=1')).status, 503);
  assert.equal(w.maps.get(candidate).has(scope + file), false);

  served = file;
  const response = await w.request(file + '?cache=2');
  assert.equal(await response.text(), file);
  assert.equal(await w.maps.get(candidate).get(scope + file).text(), file);
});

// Lot 9c : téléchargement par classe.
const packed = [['app.js'], ['sil/data/sil-u1.json', 'SIL'], ['ce1/data/unit1.json', 'CE1'], ['assets/sil-son.mp3', 'SIL']]
  .map(([url, pack]) => ({ url, sha256: crypto.createHash('sha256').update(url).digest('hex'), size: url.length, ...(pack ? { pack } : {}) }));
const choose = (w, classes) => {
  w.maps.set('klassia:settings', new Map([[scope + '__klassia/offline-classes.json', new Response(JSON.stringify({ classes }))]]));
};

test('without a saved choice every class is installed, as before', async () => {
  const w = worker(undefined, packed);
  await w.install();
  assert.equal(w.maps.get(candidate).size, packed.length);
});

test('a device that chose one class installs the common files and that class only', async () => {
  const asked = [];
  const w = worker(async name => { asked.push(name); return new Response(name); }, packed);
  choose(w, ['SIL']);
  await w.install();
  assert.deepEqual(asked.sort(), ['app.js', 'assets/sil-son.mp3', 'sil/data/sil-u1.json']);
  const status = JSON.parse(JSON.stringify(await w.message('OFFLINE_STATUS'))); // reply built in the worker's realm
  assert.equal(status.ready, true);
  assert.deepEqual(status.selection, ['SIL']);
  assert.deepEqual(status.packs.CE1, { files: 1, cached: 0, bytes: 'ce1/data/unit1.json'.length });
  const offline = await w.request('ce1/data/unit1.json');
  assert.ok(offline.status === 200, 'online, a class that is not installed is still served');
  assert.equal(w.maps.get(candidate).has(scope + 'ce1/data/unit1.json'), false, '… without being kept');
});

test('a new choice adds the missing class and removes the class taken off', async () => {
  let online = true;
  const w = worker(async name => { if (!online) throw new Error('offline'); return new Response(name); }, packed);
  choose(w, ['SIL']);
  await w.install();
  const status = await w.message('SET_CLASSES', { classes: ['CE1'] });
  assert.equal(status.ready, true);
  const kept = [...w.maps.get(candidate).keys()].map(url => url.slice(scope.length)).sort();
  assert.deepEqual(kept, ['app.js', 'ce1/data/unit1.json']);
  online = false;
  const missing = await w.request('sil/data/sil-u1.json');
  assert.equal(missing.status, 503);
  assert.equal(missing.headers.get('X-Klassia-Not-Installed'), 'SIL');
  assert.match(await missing.text(), /pas installée hors connexion/);
});

test('the first choice comes from the registration address; a saved choice takes over', async () => {
  const asked = [];
  const w = worker(async name => { asked.push(name); return new Response(name); }, packed, '?classes=CE1');
  await w.install();
  assert.deepEqual(asked.sort(), ['app.js', 'ce1/data/unit1.json']);
  const status = JSON.parse(JSON.stringify(await w.message('SET_CLASSES', { classes: ['SIL', 'CE1'] })));
  assert.deepEqual(status.selection, ['SIL', 'CE1']);
  assert.equal(w.maps.get(candidate).size, packed.length);
  const ignored = JSON.parse(JSON.stringify(await w.message('SET_CLASSES', { classes: ['<script>'] })));
  assert.deepEqual(ignored.selection, ['SIL', 'CE1'], 'an invalid choice is ignored');
});
