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

function worker(fetchFile = async name => new Response(name)) {
  const maps = new Map([[previous, new Map([['saved', 'old']])]]);
  const events = {};
  const context = {
    self: {
      registration: { scope },
      addEventListener: (type, handler) => { events[type] = handler; }
    },
    importScripts: () => { context.self.KLASSIA_RELEASE = { version: 'test-new', files }; },
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
          match: async url => cache.get(String(url))
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
