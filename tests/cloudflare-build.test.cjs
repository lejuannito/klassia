const test = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');

test('Cloudflare build publishes all five classes and excludes development files', { timeout: 120_000 }, () => {
  const build = spawnSync(process.execPath, ['scripts/build-cloudflare.mjs'], {
    cwd: root, encoding: 'utf8', timeout: 110_000
  });
  assert.equal(build.status, 0, build.stderr || build.stdout || String(build.error));

  for (const file of [
    'index.html', 'search.html', 'pilote.html', 'outils.html', 'shared/reference.js', 'shared/pilot.js', 'service-worker.js', 'precache-manifest.js',
    'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-maskable-512.png',
    'data/content-u1.json', 'ms/data/themes/T8.json', 'gs/data/themes/T8.json',
    'sil/data/sil-u8.json', 'ce1/data/unit8.json',
    'ms/index.html', 'gs/index.html', 'sil/index.html', 'ce1/index.html'
  ]) {
    assert.ok(fs.statSync(path.join(dist, file), { throwIfNoEntry: false })?.isFile(),
      'Missing public file: ' + file);
  }

  for (const hidden of [
    'AGENTS.md', 'package.json', 'README.md', '.gitignore', '.github',
    'scripts', 'tests', 'docs', 'node_modules', 'dist'
  ]) {
    assert.ok(!fs.existsSync(path.join(dist, hidden)),
      'Development artifact was published: ' + hidden);
  }

  const manifest = JSON.parse(
    fs.readFileSync(path.join(dist, 'manifest.webmanifest'), 'utf8'));
  assert.equal(manifest.start_url, './#home');
  assert.equal(manifest.scope, './');
});
