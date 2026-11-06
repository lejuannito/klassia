const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const scope = '/klassia/';
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const manifestFile = 'precache-manifest.js';
const original = JSON.parse(read(manifestFile).replace(/^self\.KLASSIA_RELEASE = /, '').trim().replace(/;$/, ''));
const marker = 'klassia-test-update';
const changes = new Map([
  ['ce1/index.html', read('ce1/index.html').replace('</head>', '<meta name="' + marker + '"></head>')]
]);
const files = original.files.map(file => {
  const body = changes.get(file.url.slice(2));
  return body === undefined ? file : { ...file, sha256: hash(body) };
});
const nextVersion = hash(JSON.stringify(files));
changes.set(manifestFile, 'self.KLASSIA_RELEASE = ' + JSON.stringify({ version: nextVersion, files }) + ';\n');

let published = false;
let interrupted = false;
const server = http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  if (!pathname.startsWith(scope)) return response.writeHead(404).end();
  let name = pathname.slice(scope.length);
  if (name === '' || name.endsWith('/')) name += 'index.html';
  const file = path.resolve(root, name);
  if (!file.startsWith(root + path.sep)) return response.writeHead(403).end();
  if (published && interrupted && name === 'data/content-u2.json') return response.writeHead(503).end();

  const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };
  try {
    const content = (published && changes.get(name)) || fs.readFileSync(file);
    response.setHeader('Content-Type', types[path.extname(name)] || 'application/octet-stream');
    response.setHeader('Cache-Control', 'no-store');
    response.end(content);
  } catch {
    response.writeHead(404).end();
  }
});

async function run() {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = 'http://127.0.0.1:' + server.address().port + scope;
  const route = base + 'ce1/#lesson:CE1-U7-L04';
  let browser;

  try {
    browser = await chromium.launch({
      ...(process.env.KLASSIA_CHROMIUM ? { executablePath: process.env.KLASSIA_CHROMIUM } : {}),
      headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage']
    });
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'allow' });
    const page = await context.newPage();
    page.setDefaultTimeout(20000);
    const status = page.locator('#pwaTools');
    const check = status.getByRole('button', { name: /^(Vérifier les mises à jour|Réessayer)$/ });
    const apply = status.getByRole('button', { name: 'Recharger avec la nouvelle édition', exact: true });
    const progress = page.locator('[data-progress="A"]');

    await page.goto(route);
    await status.getByText(/disponibles hors connexion/).waitFor();
    await progress.click();
    await page.locator('[data-progress="A"][aria-pressed="true"]').waitFor();
    await check.click();
    await status.getByText(/L’édition installée est à jour/).waitFor();

    interrupted = true;
    published = true;
    await check.click();
    await status.getByText(/La mise à jour a été interrompue.*disponibles hors connexion/).waitFor();
    await context.setOffline(true);
    await page.reload();
    await page.locator('[data-progress="A"][aria-pressed="true"]').waitFor();
    await status.getByText(/disponibles hors connexion/).waitFor();
    assert.equal(await page.locator('meta[name="' + marker + '"]').count(), 0);

    // Open the other tab while the connection is still cut so it uses the installed release.
    const other = await context.newPage();
    await other.goto(base + 'search.html?q=ecole');
    await other.locator('#searchResults li').first().waitFor();
    await other.evaluate(() => { window.openLessonState = 'draft'; });

    await context.setOffline(false);
    interrupted = false;
    await check.click();
    await apply.waitFor();
    assert.equal(await page.locator('meta[name="' + marker + '"]').count(), 0);
    await apply.click();
    await status.getByText(/Fermez les autres onglets ou fenêtres Klassia/).waitFor();
    assert.equal(await other.evaluate(() => window.openLessonState), 'draft');
    assert.equal(await page.locator('meta[name="' + marker + '"]').count(), 0);

    await other.close();
    await context.setOffline(true);
    await apply.click();
    await page.locator('meta[name="' + marker + '"]').waitFor({ state: 'attached' });
    await status.getByText(new RegExp('édition ' + nextVersion.slice(0, 8))).waitFor();
    await page.locator('[data-progress="A"][aria-pressed="true"]').waitFor();
    assert.equal(page.url(), route);

    await page.goto(base + 'search.html?q=ecole');
    await page.locator('#searchResults li').first().waitFor();
    console.log('PASS PWA update on a subdirectory: current check, failed install, offline fallback, retry, tab guard, activation offline and progress retention');
  } finally {
    await browser?.close();
    server.close();
  }
}

run().catch(error => { console.error(error); process.exitCode = 1; });
