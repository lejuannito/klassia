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

  const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml' };
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

    await page.goto(base + '?unit=U5#lesson:SC-U5-L3');
    await page.getByRole('heading', { name: 'Aires protégées du Cameroun' }).waitFor();
    await page.waitForFunction(() => document.querySelector('.lesson-figure')?.naturalWidth > 0);
    await page.getByRole('cell', { name: 'Waza', exact: true }).waitFor();

    await page.goto(base + '?unit=U6#lesson:SC-U6-L4');
    await page.waitForFunction(() => document.querySelector('.lesson-figure')?.naturalWidth > 0);
    await page.getByLabel(/Quelle température/).fill('24');
    await page.getByRole('button', { name: 'Vérifier le nombre' }).click();
    assert.match(await page.locator('.exercise-card [role="status"]').innerText(), /Bravo.*24 °C/);

    await page.goto(base + '?unit=U8#lesson:TI-U8-L2');
    await page.getByText('Assembler les trois blocs de haut en bas', { exact: true }).click();
    await page.getByRole('cell', { name: 'quand [drapeau vert] est cliqué', exact: true }).waitFor();
    await page.getByRole('button', { name: 'Voir la correction' }).first().click();
    assert.match(await page.locator('#ans_TIU8L2_0').innerText(), /d’abord « Merci ! », puis « Bonjour ! »/);
    console.log('PASS offline CE2 U5 map, U6 measurement and U8 Scratch lesson');

    await page.goto(base + '?unit=U4#lesson:SH-U4-L8');
    await page.getByRole('heading', { name: 'Peuplement du Cameroun et mouvements migratoires' }).waitFor();
    await page.waitForFunction(() => document.querySelector('.lesson-figure')?.naturalWidth > 0);
    await page.getByRole('cell', { name: 'Il y a plusieurs milliers d’années', exact: true }).waitFor();

    await page.evaluate(() => { location.hash = '#eval:SH'; });
    await page.getByRole('button', { name: 'Voir les éléments de correction' }).nth(2).click();
    assert.match(await page.locator('#corr_SH_2').innerText(), /16 bulletins déposés, 14 voix valables/);

    await page.goto(base + '?unit=U8#reviseSubject:SH');
    await page.locator('.series-card.essential').getByRole('button', { name: 'Commencer' }).click();
    const planetQuestion = page.locator('.qcmQuestion').filter({ hasText: 'Quelle planète vient juste après la Terre' });
    await planetQuestion.getByLabel('Mars', { exact: true }).check();
    await page.getByRole('button', { name: 'Corriger la série' }).click();
    assert.match(await planetQuestion.locator('.feedback').innerText(), /Correct.*Terre est au rang 3/s);
    console.log('PASS offline CE2 social studies map, assessment and quiz correction');

    await page.goto(base + '?unit=U7#lesson:DP-U7-L1');
    await page.waitForFunction(() => document.querySelector('.lesson-figure')?.naturalWidth > 0);
    await page.getByRole('cell', { name: '4 cm de long', exact: true }).waitFor();
    const quilleExercise = page.locator('.exercise-card').first();
    await quilleExercise.getByRole('button', { name: 'Voir la correction' }).click();
    assert.match(await quilleExercise.locator('.feedback').innerText(), /14 cm − 4 cm = 10 cm/);

    await page.goto(base + '?unit=U7#reviseSubject:DP');
    await page.locator('.series-card.essential').getByRole('button', { name: 'Commencer' }).click();
    const harvestQuestion = page.locator('.qcmQuestion').filter({ hasText: 'Quelle est la recette' });
    await harvestQuestion.getByLabel('400 F CFA', { exact: true }).check();
    await page.getByRole('button', { name: 'Corriger la série' }).click();
    assert.match(await harvestQuestion.locator('.feedback').innerText(), /Correct.*quatre bottes vendues/s);
    console.log('PASS offline CE2 personal development template, open correction and quiz');

    await page.goto(base + '?unit=U6#lesson:AR-U6-L2');
    await page.waitForFunction(() => document.querySelector('.lesson-figure')?.naturalWidth > 0);
    await page.getByRole('cell', { name: 'Soupir', exact: true }).waitFor();
    const silenceExercise = page.locator('.exercise-card').first();
    await silenceExercise.getByRole('button', { name: 'Voir la correction' }).click();
    assert.match(await silenceExercise.locator('.feedback').innerText(), /soupir est au temps 3/);

    await page.goto(base + '?unit=U6#reviseSubject:AR');
    await page.locator('.series-card.essential').getByRole('button', { name: 'Commencer' }).click();
    const silenceQuestion = page.locator('.qcmQuestion').filter({ hasText: 'Quel signe occupe le troisième temps' });
    await silenceQuestion.getByLabel('Le soupir', { exact: true }).check();
    await page.getByRole('button', { name: 'Corriger la série' }).click();
    assert.match(await silenceQuestion.locator('.feedback').innerText(), /Correct.*temps 3/s);
    console.log('PASS offline CE2 arts score, open correction and quiz');

    await page.goto(base + '?unit=U7#lesson:EP-U7-L2');
    await page.waitForFunction(() => document.querySelector('.lesson-figure')?.naturalWidth > 0);
    await page.getByRole('cell', { name: 'Renvoyer de l’autre côté.', exact: true }).waitFor();
    const volleyExercise = page.locator('.exercise-card').nth(1);
    await volleyExercise.getByRole('button', { name: 'Voir la correction' }).click();
    assert.match(await volleyExercise.locator('.feedback').innerText(), /B prépare vers C, puis C renvoie/);

    await page.goto(base + '?unit=U7#reviseSubject:EP');
    await page.locator('.series-card.essential').getByRole('button', { name: 'Commencer' }).click();
    const volleyQuestion = page.locator('.qcmQuestion').filter({ hasText: 'Combien de touches au plus' });
    await volleyQuestion.getByLabel('Trois', { exact: true }).check();
    await page.getByRole('button', { name: 'Corriger la série' }).click();
    assert.match(await volleyQuestion.locator('.feedback').innerText(), /Correct.*troisième touche/s);
    console.log('PASS offline CE2 physical education diagram, open correction and quiz');
  } finally {
    await browser?.close();
    server.close();
  }
}

run().catch(error => { console.error(error); process.exitCode = 1; });
