import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

// Cloudflare Pages is served at the origin root; keep all URLs and PWA hashes unchanged.
const root = path.resolve(import.meta.dirname, '..');
const dist = path.join(root, 'dist');
const rootFiles = [
  'index.html', 'search.html', 'pilote.html', 'imprimer.html', 'outils.html', 'maison.html', 
  'pwa.js', 'service-worker.js',
  'precache-manifest.js', 'manifest.webmanifest'
];
const publicDirectories = [
  'assets', 'icons', 'screenshots', 'data', 'shared', 'ms', 'gs', 'sil', 'ce1', 'nursery1', 'class1', 'class3', 'class4'
];
const extensions = new Set([
  '.html', '.css', '.js', '.json', '.webmanifest', '.svg',
  '.png', '.jpg', '.jpeg', '.webp', '.avif', '.gif', '.ico',
  '.mp3', '.ogg', '.wav', '.mp4', '.webm', '.woff', '.woff2', '.pdf'
]);

// Rebuild the integrity manifest before taking a snapshot of the served files.
execFileSync(process.execPath, [path.join(root, 'scripts/build.mjs')], { stdio: 'inherit' });
fs.rmSync(dist, { recursive: true, force: true });
const published = new Set();

function copy(relativePath) {
  const source = path.join(root, relativePath);
  const stat = fs.lstatSync(source);
  assert.ok(stat.isFile() && !stat.isSymbolicLink(), 'Not a regular public file: ' + relativePath);
  const destination = path.join(dist, relativePath);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
  published.add(relativePath.replaceAll(path.sep, '/'));
}

function copyPublicDirectory(relativePath) {
  for (const entry of fs.readdirSync(path.join(root, relativePath), { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const child = path.join(relativePath, entry.name);
    assert.ok(!entry.isSymbolicLink(), 'Symlinks are not allowed in public assets: ' + child);
    if (entry.isDirectory()) copyPublicDirectory(child);
    else if (entry.isFile() && extensions.has(path.extname(entry.name).toLowerCase())) copy(child);
  }
}

for (const file of rootFiles) copy(file);
for (const directory of publicDirectories) copyPublicDirectory(directory);

// The service worker refuses incomplete releases; fail the build before deployment instead.
const source = fs.readFileSync(path.join(dist, 'precache-manifest.js'), 'utf8');
const match = /^self\.KLASSIA_RELEASE = ([\s\S]+);\s*$/.exec(source);
assert.ok(match, 'Invalid offline manifest');
const release = JSON.parse(match[1]);
assert.ok(release.version && Array.isArray(release.files) && release.files.length > 0,
  'Empty offline release');
for (const file of release.files) {
  assert.match(file.url, /^\.\/[A-Za-z0-9_./-]+$/, 'Unsafe offline URL');
  const relative = file.url.slice(2);
  assert.ok(!relative.split('/').includes('..'), 'Path escapes deployment: ' + relative);
  assert.ok(published.has(relative), 'Missing offline asset in dist: ' + relative);
  const hash = crypto.createHash('sha256')
    .update(fs.readFileSync(path.join(dist, relative))).digest('hex');
  assert.equal(hash, file.sha256, 'Invalid offline asset hash: ' + relative);
}

for (const mandatory of ['index.html', 'search.html', 'pilote.html', 'imprimer.html', 'outils.html', 'maison.html', 'service-worker.js',
  'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png',
  'ms/index.html', 'gs/index.html', 'sil/index.html', 'ce1/index.html']) {
  assert.ok(published.has(mandatory), 'Missing application entry point: ' + mandatory);
}
console.log(`Cloudflare Pages: ${published.size} public files in dist; ${release.files.length} verified offline assets.`);
