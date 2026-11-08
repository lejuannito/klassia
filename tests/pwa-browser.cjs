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

// Serve a French clip as a technical fixture only, never as a published Bassa recording.
const lexiconPath = 'data/bassa-lexicon-variants.json';
const lexicon = JSON.parse(read(lexiconPath));
const classroom = lexicon.entries.find(entry => entry.id === 'BA002');
const recordingPath = 'assets/bassa-ba002-99.mp3';
const recordingBytes = fs.readFileSync(path.join(root, 'assets/sil-u4-l01-lou-a-mal.mp3'));
const recording = {
  form: classroom.forms[0], sense: 'salle de classe', src: recordingPath,
  reviewed_on: '2026-11-07', review_ref: 'TEST-REVUE', consent_ref: 'TEST-ACCORD',
  sha256: hash(recordingBytes)
};
classroom.recordings = [recording, {
  ...recording, form: classroom.forms[1], src: 'assets/bassa-ba002-98.mp3', consent_ref: ''
}];
changes.set(lexiconPath, JSON.stringify(lexicon));
changes.set(recordingPath, recordingBytes);

const files = original.files.filter(file => file.url !== './' + recordingPath).map(file => {
  const body = changes.get(file.url.slice(2));
  return body === undefined ? file : { ...file, sha256: hash(body) };
});
files.push({ url: './' + recordingPath, sha256: recording.sha256 });
const nextVersion = hash(JSON.stringify(files));
changes.set(manifestFile, 'self.KLASSIA_RELEASE = ' + JSON.stringify({ version: nextVersion, files }) + ';\n');

let published = false;
let interrupted = false;
const server = http.createServer((request, response) => {
  const url = new URL(request.url, 'http://localhost');
  const pathname = decodeURIComponent(url.pathname);
  const cloudflare = !pathname.startsWith(scope);
  let name = pathname.slice(cloudflare ? 1 : scope.length);
  if (cloudflare) {
    // Cloudflare Pages redirects index files to directories and other HTML to extensionless URLs.
    const canonical = name === 'index.html' || name.endsWith('/index.html')
      ? pathname.slice(0, -'index.html'.length)
      : name.endsWith('.html') ? pathname.slice(0, -'.html'.length) : '';
    if (canonical) return response.writeHead(308, { Location: canonical + url.search }).end();
    if (name === 'pilote' || name === 'search') name += '.html';
  }
  if (name === '' || name.endsWith('/')) name += 'index.html';
  const file = path.resolve(root, name);
  if (!file.startsWith(root + path.sep)) return response.writeHead(403).end();
  if (published && interrupted && name === 'data/content-u2.json') return response.writeHead(503).end();

  const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg' };
  try {
    const content = (published && changes.get(name)) || fs.readFileSync(file);
    response.setHeader('Content-Type', types[path.extname(name)] || 'application/octet-stream');
    response.setHeader('Cache-Control', 'no-store');
    response.end(content);
  } catch {
    response.writeHead(404).end();
  }
});

async function testBassaMicrophone(context, page, base) {
  await context.addInitScript(() => {
    const original = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = async constraints => {
      if (window.denyTestMicrophone) throw new DOMException('Test permission refusal', 'NotAllowedError');
      const stream = await original(constraints);
      window.testMicrophoneTracks = stream.getAudioTracks();
      return stream;
    };
  });
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto(base + '#bassa');
  await page.locator('#bassaSearch').waitFor();
  const panel = page.locator('#bassaRecorder');
  assert.equal(await panel.count(), 0, 'The learner workshop has no microphone controls');
  await page.locator('[data-space]').click();
  await page.locator('#localRole').selectOption('ENSEIGNANT');
  await page.getByRole('link', { name: 'Ouvrir l’atelier Bassa' }).click();

  const entry = panel.locator('[data-entry]'), form = panel.locator('[data-form]');
  const status = panel.locator('[data-status]'), audio = panel.locator('audio');
  const record = panel.locator('[data-record]'), stop = panel.locator('[data-stop]');
  await status.filter({ hasText: 'Choisissez une forme et lancez la prise.' }).waitFor();
  assert.deepEqual(await entry.locator('option').evaluateAll(options => options.map(option => option.value)),
    ['BA002', 'BA004', 'BA005', 'BA006']);
  await entry.selectOption('BA004');
  assert.equal(await form.inputValue(), 'málêt');
  assert.match(await panel.locator('[data-situation]').innerText(), /personne qui enseigne/);
  assert.match(await panel.locator('[data-pilot-note]').getAttribute('href'), /exercice=BA004#observations$/);
  await page.evaluate(() => { window.denyTestMicrophone = true; });
  await record.click();
  await status.filter({ hasText: /Accès au micro refusé/ }).waitFor();
  await page.evaluate(() => { window.denyTestMicrophone = false; });

  await record.click();
  await status.filter({ hasText: /Enregistrement en cours/ }).waitFor();
  await page.waitForTimeout(350); // Give the fake microphone samples to encode.
  await stop.click();
  await audio.waitFor();
  assert.equal(await page.evaluate(() => window.testMicrophoneTracks.every(track => track.readyState === 'ended')), true);
  await audio.evaluate(element => element.play());
  await page.waitForFunction(() => document.querySelector('#bassaRecorder audio').currentTime > 0.05);
  assert.equal(await panel.evaluate(element => element.scrollWidth > element.clientWidth), false);
  await panel.getByRole('button', { name: 'Conserver la prise', exact: true }).click();
  await status.filter({ hasText: 'Prise conservée sur cet appareil.' }).waitFor();

  await form.selectOption('malet');
  await status.filter({ hasText: 'Choisissez une forme et lancez la prise.' }).waitFor();
  assert.equal(await audio.isVisible(), false);
  await page.reload();
  await entry.selectOption('BA004');
  await audio.waitFor();
  const [download] = await Promise.all([
    page.waitForEvent('download'), panel.getByRole('link', { name: 'Télécharger la source' }).click()
  ]);
  assert.match(download.suggestedFilename(), /^BA004-01\.(webm|m4a|mp4|ogg)$/);
  assert.equal(await download.failure(), null);

  await record.click();
  await status.filter({ hasText: /Enregistrement en cours/ }).waitFor();
  await page.evaluate(() => { location.hash = '#home'; });
  await panel.waitFor({ state: 'detached' });
  assert.equal(await page.evaluate(() => window.testMicrophoneTracks.every(track => track.readyState === 'ended')), true);
  await page.goto(base + '#bassa');
  await entry.selectOption('BA004');
  await audio.waitFor();
  page.once('dialog', dialog => dialog.accept());
  await panel.getByRole('button', { name: 'Supprimer la prise' }).click();
  await status.filter({ hasText: 'Prise supprimée de cet appareil.' }).waitFor();
  assert.equal(await audio.isVisible(), false);
  console.log('PASS Bassa workshop offline mic capture, refusal, playback, per-form storage, download and mic release');
}

async function testPilotNotebook(page, base) {
  await page.getByRole('link', { name: 'Carnet du pilote', exact: true }).click();
  await page.getByRole('heading', { name: 'Carnet du pilote', exact: true }).waitFor();
  await page.getByText('Aucun relevé saisi.', { exact: true }).waitFor();
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  assert.equal(await page.locator('#activites .pilot-cards article').count(), 5);

  for (const [href, locator, text, figure] of [
    ['ms/?theme=T5#domain:ST:3', '.activityCard', /Range trois bandes/, 'ms-tiges-longueurs.svg'],
    ['gs/?theme=T6#domain:ST:1', '.activityCard', /Bandes identiques/, null],
    ['sil/#lesson:SIL-U1-L11', '.lesson-card', /Deux tapis mesurés avec la même bande/, null],
    ['ce1/#lesson:CE1-U1-L11', '.lesson-card', /9 − 2 = 7 cm/, 'ce1-bandes-regle.svg'],
    ['?unit=U1#lesson:MA-U1-L5', '.lesson-page', /Il faut couper une bande de 2 m 40 cm/, null]
  ]) {
    await page.goto(base + href);
    const lesson = page.locator(locator).filter({ hasText: text });
    await lesson.waitFor();
    if (figure) await page.waitForFunction(name =>
      [...document.images].some(img => img.src.endsWith(name) && img.naturalWidth > 0), figure);
  }
  const exercise = page.locator('.exercise-card').filter({ hasText: 'Il faut couper une bande de 2 m 40 cm' });
  await exercise.getByRole('button', { name: 'Voir la correction' }).click();
  assert.match(await exercise.locator('.feedback').innerText(), /60 cm/);

  await page.goto(base + 'pilote.html');
  await page.getByRole('link', { name: 'Noter l’essai CE1' }).click();
  const observation = page.locator('#pilotObservation');
  const field = (form, name) => form.locator('[name="' + name + '"]');
  assert.equal(await field(observation, 'lesson').inputValue(), 'CE1-U1-L11');
  await field(observation, 'session').fill('FAM-01');
  await field(observation, 'edition').fill('TEST-01');
  await field(observation, 'help').selectOption('guidage');
  await field(observation, 'note').fill('A lu seulement la graduation d’arrivée.');
  await field(observation, 'suggestion').fill('Essayer avec un départ à 4 cm.');
  await observation.getByRole('button', { name: 'Conserver l’observation' }).click();
  await page.getByText(/1 observation\(s\)/).waitFor();
  await field(observation, 'session').fill('ENS-02');
  await field(observation, 'actor').selectOption('enseignant');
  await observation.getByRole('button', { name: 'Conserver l’observation' }).click();
  await page.locator('#pilotGroups').getByText('À reprendre', { exact: true }).waitFor();
  assert.deepEqual(await page.locator('#pilotGroups td').allTextContents(),
    ['CE1 · CE1-U1-L11 · 1', 'test-01', '2', '2', 'À reprendre']);

  const phone = page.locator('#pilotDevice');
  await field(phone, 'session').fill('TEL-01');
  await field(phone, 'edition').fill('TEST-01');
  await field(phone, 'device').fill('Appareil simulé');
  await field(phone, 'micro').selectOption('reussi');
  await field(phone, 'extraits').selectOption('a-reprendre');
  await phone.getByRole('button', { name: 'Conserver l’essai téléphone' }).click();
  await page.getByText(/1 essai\(s\) téléphone · 1 relevé\(s\) technique/).waitFor();
  const [download] = await Promise.all([
    page.waitForEvent('download'), page.getByRole('button', { name: 'Exporter les relevés' }).click()
  ]);
  const bytes = fs.readFileSync(await download.path());
  const payload = JSON.parse(bytes);
  assert.equal(payload.format, 'klassia-pilot');
  assert.equal(payload.records.length, 3);
  assert.equal(payload.records.find(record => record.kind === 'appareil').results.voix, 'non-essaye');
  assert.ok(payload.records.some(record => record.suggestion === 'Essayer avec un départ à 4 cm.'));
  await page.locator('#pilotImport').setInputFiles({ name: 'releves.json', mimeType: 'application/json', buffer: bytes });
  await page.getByText(/0 relevé\(s\) ajouté\(s\)/).waitFor();
  await page.reload();
  await page.getByText(/2 observation\(s\) · 1 essai\(s\) téléphone/).waitFor();
  console.log('PASS offline length activities in five grades, pilot observation, device checklist, export and deduplicated import');
}

async function testReadingWorkshops(page, base) {
  const notebook = base + 'pilote.html#ecrits';
  await page.goto(notebook);
  const cards = page.locator('#ecrits .pilot-cards article');
  await cards.first().waitFor();
  assert.equal(await cards.count(), 5);
  for (const [link, activity, cue, correction, index] of [
    ['Ouvrir les cartes de la classe', '.activityCard', /Montre le livre ouvert/, /Le crayon, au milieu/, 0],
    ['Ouvrir les étiquettes du jardin', '.activityCard', /Étiquettes en français/, /Graine contient un e/, 1],
    ['Ouvrir le petit message', '.lesson-card', /Le sac est sur le banc/, /sur le banc.*indiquent le lieu/s, 0],
    ['Ouvrir la fiche et le message', '.lesson-card', /Fiche fictive de l’atelier lecture/, /Rami.*vendredi.*salle 2/is, 0]
  ]) {
    await page.goto(notebook);
    await page.getByRole('link', { name: link, exact: true }).click();
    const content = page.locator(activity).filter({ hasText: cue });
    await content.waitFor();
    if (link === 'Ouvrir les cartes de la classe') {
      await page.waitForFunction(() => [...document.images].some(img =>
        img.src.endsWith('ms-cartes-objets-classe.svg') && img.naturalWidth > 0));
    }
    const answer = content.locator('.answer-reveal').nth(index);
    await answer.locator('summary').click();
    assert.match(await answer.innerText(), correction);
  }
  await page.goto(notebook);
  await page.getByRole('link', { name: 'Ouvrir le jeu du cercle', exact: true }).click();
  const exercise = page.locator('.exercise-card').filter({ hasText: 'Écris la règle du jeu du cercle' });
  await exercise.getByRole('button', { name: 'Voir la correction' }).click();
  assert.match(await exercise.locator('.feedback').innerText(), /Après les six essais/);
  await page.goto(notebook);
  await page.getByRole('link', { name: 'Noter l’essai lecture CE2', exact: true }).click();
  assert.equal(await page.locator('#pilotObservation [name="lesson"]').inputValue(), 'FR-U7-L2');
  assert.equal(await page.locator('#pilotObservation [name="exercise"]').inputValue(), 'FR-U7-L2-E4');
  console.log('PASS offline reading and writing workshops, five routes, corrections and prefilled pilot feedback');
}

async function testCloudflareNavigation(browser, origin) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  try {
    const page = await context.newPage();
    const index = await context.request.get(origin + '/index.html', { maxRedirects: 0 });
    assert.equal(index.status(), 308);
    assert.equal(index.headers().location, '/');

    const first = await page.goto(origin);
    assert.ok(first.ok() && !first.fromServiceWorker());
    await page.waitForFunction(() => navigator.serviceWorker.controller?.state === 'activated');
    for (let attempt = 0; attempt < 5; attempt++) {
      const response = await page.reload();
      assert.ok(response.ok() && response.fromServiceWorker());
    }

    const lesson = origin + '/ce1/#lesson:CE1-U7-L04';
    await page.goto(lesson);
    await page.locator('[data-progress="A"]').click();
    await context.setOffline(true);
    for (const route of ['/', '/ms/', '/gs/', '/sil/', '/ce1/']) {
      const response = await page.goto(origin + route);
      assert.ok(response.ok() && response.fromServiceWorker(), route);
      await page.locator('#pwaTools').getByText(/disponibles hors connexion/).waitFor();
    }
    await page.goto(lesson);
    await page.locator('[data-progress="A"][aria-pressed="true"]').waitFor();

    await page.goto(origin + '/search?q=ecole');
    await page.locator('#searchResults li').first().waitFor();
    await page.goto(origin + '/pilote#observations');
    await page.locator('#pilotObservation').waitFor();
    console.log('PASS Cloudflare redirects: first load, worker activation, five reloads, offline navigation and progress');
  } finally {
    await context.close();
  }
}

async function run() {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = 'http://127.0.0.1:' + server.address().port;
  const base = origin + scope;
  const route = base + 'ce1/#lesson:CE1-U7-L04';
  let browser;

  try {
    browser = await chromium.launch({
      ...(process.env.KLASSIA_CHROMIUM ? { executablePath: process.env.KLASSIA_CHROMIUM } : {}),
      headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream']
    });
    await testCloudflareNavigation(browser, origin);
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

    const recordingRoutes = [
      'ms/?theme=T1#domain:LC:6', 'gs/?theme=T1#domain:LC:5',
      'sil/#lesson:SIL-U3-L10', 'ce1/#lesson:CE1-U3-L11', '?unit=U3#lesson:BA-U3-L1'
    ];
    const classroomCard = page.locator('.bassa-lexical-cards article').filter({
      has: page.getByRole('heading', { name: classroom.concept, exact: true })
    });
    const bassaAudio = classroomCard.locator('audio');
    for (const lessonRoute of recordingRoutes) {
      await page.goto(base + lessonRoute);
      await bassaAudio.waitFor();
      assert.equal(await bassaAudio.count(), 1, 'Unapproved recording must stay hidden in ' + lessonRoute);
      assert.equal(await bassaAudio.getAttribute('src'), base + recordingPath);
      assert.equal(await bassaAudio.getAttribute('aria-label'), 'Prononciation vérifiée · ' + recording.form + ' (salle de classe)');
    }
    const playingBassa = await bassaAudio.elementHandle();
    await playingBassa.evaluate(audio => audio.play());
    await page.waitForFunction(audio => audio.currentTime > 0.1, playingBassa);
    await page.evaluate(() => { location.hash = '#subject:BA'; });
    await bassaAudio.waitFor({ state: 'detached' });
    assert.equal(await playingBassa.evaluate(audio => audio.paused), true);
    console.log('PASS Bassa recording gate in all five classes, offline media playback and stop on CE2 navigation');

    for (const [lessonRoute, file, hasTranscript] of [
      ['sil/#lesson:SIL-U4-L01', 'sil-u4-l01-lou-a-mal.mp3'],
      ['sil/#lesson:SIL-U4-L11', 'sil-u4-l11-modeles-quadrillage.mp3'],
      ['sil/#lesson:SIL-U5-L02', 'sil-u5-l02-school-by-bus.mp3', true],
      ['ce1/#lesson:CE1-U1-L01', 'ce1-u1-l01-marque-page.mp3', true],
      ['ce1/#lesson:CE1-U5-L03', 'ce1-u5-l03-from-library.mp3', true],
      ['ce1/#lesson:CE1-U8-L03', 'ce1-u8-l03-music-club.mp3', true]
    ]) {
      await page.goto(base + lessonRoute);
      const audio = page.locator('.lesson-audio audio');
      const bytes = fs.readFileSync(path.join(root, 'assets', file));
      const partial = await audio.evaluate(async element => {
        const response = await fetch(element.src, { headers: { Range: 'bytes=0-1' } });
        return {
          status: response.status,
          range: response.headers.get('Content-Range'),
          bytes: Array.from(new Uint8Array(await response.arrayBuffer()))
        };
      });
      assert.deepEqual(partial, { status: 206, range: `bytes 0-1/${bytes.length}`, bytes: Array.from(bytes.subarray(0, 2)) });

      await audio.evaluate(element => element.play());
      await page.waitForFunction(() => document.querySelector('.lesson-audio audio')?.currentTime > 0.1);
      if (hasTranscript) {
        assert.equal(await page.locator('.practice-item .adult-guide').evaluate(details => details.open), false);
      }
      const playing = await audio.elementHandle();
      await page.evaluate(() => { location.hash = '#units'; });
      await audio.waitFor({ state: 'detached' });
      assert.equal(await playing.evaluate(element => element.paused), true);
      await playing.dispose();
    }
    console.log('PASS six offline French and English clips, byte ranges, hidden transcripts and stop on navigation');

    await page.setViewportSize({ width: 320, height: 844 });
    await page.goto(base + '?unit=U1#subject:BA');
    const themeButton = page.getByRole('button', { name: '8 thèmes', exact: true });
    await themeButton.waitFor();
    const bassaLayout = await page.locator('.subject-hero').evaluate(hero => ({
      titleBottom: hero.querySelector('.grow').getBoundingClientRect().bottom,
      actionsTop: hero.querySelector('.print-actions-v14').getBoundingClientRect().top,
      horizontalOverflow: document.documentElement.scrollWidth > innerWidth
    }));
    assert.ok(bassaLayout.actionsTop >= bassaLayout.titleBottom, 'Bassa actions must be below the title block');
    assert.equal(bassaLayout.horizontalOverflow, false);
    await themeButton.click();
    await page.locator('.unit-subject-v14').first().waitFor();
    assert.equal(await page.locator('.unit-subject-v14').count(), 8);

    await page.goto(base + 'ce1/#lesson:CE1-U3-L06');
    await page.waitForFunction(() => document.querySelector('.lesson-figure')?.naturalWidth > 0);
    await page.locator('#lessonResponse').click();
    await page.keyboard.type('sac 27 +');
    assert.equal(await page.locator('#lessonResponse').inputValue(), 'sac 27 +');
    await page.locator('.practice-item .answer-reveal summary').click();
    await page.getByText(/Le clic sur le bouton ouvre la correction/).waitFor();

    for (const [lessonRoute, imageFile] of [
      ['sil/#lesson:SIL-U4-L11', 'sil-u4-modeles-quadrillage.svg'],
      ['ce1/#lesson:CE1-U6-L12', 'u6-plan-noeuds.svg'],
      ['?unit=U6#lesson:MA-U6-L5', 'u6-plan-noeuds.svg']
    ]) {
      await page.goto(base + lessonRoute);
      await page.waitForFunction(file => [...document.images].some(img => img.src.endsWith(file) && img.naturalWidth > 0), imageFile);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    }
    await page.setViewportSize({ width: 390, height: 844 });
    console.log('PASS mobile CE2 Bassa layout and theme navigation, CE1 mouse/keyboard lesson and offline grids');

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

    const bassaLessons = [
      ['U4', 'médecin / travailleur clinique'],
      ['U5', 'voiture / car'],
      ['U6', 'main / hand'],
      ['U7', 'trois / three'],
      ['U8', 'cahier / notebook']
    ];
    for (const [unit, sense] of bassaLessons) {
      await page.goto(base + '?unit=' + unit + '#lesson:BA-' + unit + '-L1');
      await page.locator('.manual-section[open] table').waitFor();
      await page.locator('.bassa-concept').selectOption({ label: sense });
      const variants = page.locator('.bassa-choices button');
      const count = await variants.count();
      assert.ok(count > 0, 'No proposed form for ' + sense);
      for (let i = 0; i < count; i++) {
        await variants.nth(i).click();
        await page.locator('.bassa-submit').click();
        assert.match(await page.locator('.bassa-result').innerText(), /Réponse acceptée/);
      }
    }
    const bassaExercise = page.locator('.exercise-card').nth(1);
    await bassaExercise.getByRole('button', { name: 'Voir la correction' }).click();
    assert.match(await bassaExercise.locator('.feedback').innerText(), /cahier.*s’il te plaît/);
    console.log('PASS offline CE2 Bassa lessons, proposed forms and open correction');

    await page.goto(base + 'ce1/#lesson:CE1-U1-L01');
    await page.getByRole('heading', { name: 'L’album sous la table' }).waitFor();
    const reading = page.locator('.lesson-support');
    const story = await reading.innerText();
    assert.match(story, /Épisode 1.*Épisode 2.*Épisode 3/s);
    await page.waitForFunction(() => document.querySelector('.lesson-support img')?.naturalWidth > 0);
    const cards = reading.getByRole('img', { name: /Trois cartes illustrées/ });
    const cardBounds = await cards.boundingBox();
    assert.ok(cardBounds && cardBounds.x >= 0 && cardBounds.x + cardBounds.width <= 390);
    assert.equal(await reading.getByRole('listitem').count(), 3);
    assert.equal(await page.locator('.answer-reveal[open]').count(), 0);
    const chronology = page.locator('.practice-item').first();
    await chronology.locator('summary').click();
    assert.match(await chronology.locator('.answer-reveal').innerText(), /B, C, A/);

    await page.goto(base + 'ce1/#lesson:CE1-U6-L01');
    await page.getByRole('heading', { name: 'La gourde d’Amadou' }).waitFor();
    assert.match(await page.locator('.lesson-support').innerText(), /Le début.*Fin A.*Fin B/s);
    await page.getByText(/Écris ta propre fin en deux ou trois phrases/).waitFor();
    const response = page.locator('#lessonResponse');
    const ending = 'Nelly aperçoit la gourde sur le banc. Amadou la prend avant de rejoindre la classe.';
    await response.fill(ending);
    assert.equal(await page.locator('.answer-reveal[open]').count(), 0);
    const rubric = page.locator('.answer-reveal').first();
    await rubric.locator('summary').click();
    assert.match(await rubric.innerText(), /Pour relire ta fin.*personnage du début.*problème de la gourde.*résultat.*ponctuation/s);
    assert.equal(await response.inputValue(), ending);
    console.log('PASS offline CE1 illustrated reading and open ending with a correction rubric');

    const observationLessons = [
      {
        unit: 'U6',
        title: /Composer une affiche par collage/,
        caption: 'Grille d’observation du collage',
        criteria: ['Images', 'Mise en page', 'Légendes', 'Mon choix'],
        feedback: /Je me brosse les dents.*Je me repose/
      },
      {
        unit: 'U4',
        title: /Coopérer dans un jeu de passes/,
        caption: 'Grille d’observation des passes',
        criteria: ['Contrôle', 'Passe', 'Se replacer', 'En équipe'],
        feedback: /espace libre où ton partenaire te voit/
      }
    ];
    await page.setViewportSize({ width: 320, height: 844 });
    for (const { unit, title, caption, criteria, feedback } of observationLessons) {
      await page.goto(base + 'ce1/#unit:CE1-' + unit);
      await page.getByRole('link', { name: title }).click();
      await page.waitForFunction(() => document.querySelector('.lesson-figure')?.naturalWidth > 0);
      const observation = page.getByRole('table', { name: caption });
      for (const criterion of criteria) {
        await observation.getByRole('cell', { name: criterion, exact: true }).waitFor();
      }
      assert.ok(await observation.evaluate(table => table.offsetWidth <= table.parentElement.clientWidth + 1), caption);
      const example = page.locator('.answer-reveal');
      await example.locator('summary').click();
      assert.match(await example.innerText(), feedback);
    }
    await page.setViewportSize({ width: 390, height: 844 });
    console.log('PASS offline CE1 collage and football models, observation rubrics and feedback');

    await page.goto(base + 'sil/#unit:SIL-U1');
    await page.getByRole('link', { name: /Les couleurs primaires de la maison/ }).click();
    await page.waitForFunction(() => document.querySelector('.lesson-figure')?.naturalWidth > 0);
    const colors = page.locator('.answer-reveal');
    await colors.locator('summary').click();
    assert.match(await colors.innerText(), /A \(bleu\), C \(rouge\) et E \(jaune\)/);

    await page.goto(base + 'gs/?theme=T8#domain:ST');
    await page.getByRole('button', { name: 'Suivante →' }).click();
    await page.getByRole('heading', { name: /écrire les nombres de 1 à 10/ }).waitFor();
    await page.waitForFunction(() => document.querySelector('.lesson-figure')?.naturalWidth > 0);
    const missingNumbers = page.locator('.answer-reveal').last();
    await missingNumbers.locator('summary').click();
    assert.match(await missingNumbers.innerText(), /3 et 5.*7 et 10/);

    await page.setViewportSize({ width: 320, height: 844 });
    await page.goto(base + 'gs/?theme=T1#domain:LC:0');
    await page.getByRole('heading', { name: 'Le cahier retrouvé' }).waitFor();
    await page.waitForFunction(() => document.querySelector('.lesson-figure')?.naturalWidth > 0);
    const storyOrder = page.locator('.answer-reveal').nth(1);
    await storyOrder.locator('summary').click();
    assert.match(await storyOrder.innerText(), /B, C puis A/);
    const alternateEnding = page.locator('.answer-reveal').nth(2);
    await alternateEnding.locator('summary').click();
    assert.match(await alternateEnding.innerText(), /Une fin convient si elle suit les événements/);

    for (const [theme, answer] of [['T1', /La carte C/], ['T8', /N dans LINA et L dans LILA/]]) {
      await page.goto(base + 'gs/?theme=' + theme + '#domain:LC:4');
      await page.locator('[data-activity-id="GS-' + theme + '-LC5"]').waitFor();
      await page.waitForFunction(() => document.querySelector('.lesson-figure')?.naturalWidth > 0);
      assert.ok(await page.locator('.lesson-figure').evaluate(img => img.getBoundingClientRect().right <= innerWidth));
      const nameGuide = page.locator('.answer-reveal').last();
      await nameGuide.locator('summary').click();
      assert.match(await nameGuide.innerText(), answer);
    }

    await page.goto(base + 'sil/#unit:SIL-U4');
    await page.getByRole('link', { name: /Je lis ou, m et l/ }).click();
    await page.locator('.lesson-support').getByText('Lou a mal.', { exact: true }).waitFor();
    const sentenceGuide = page.locator('.answer-reveal').first();
    await sentenceGuide.locator('summary').click();
    assert.match(await sentenceGuide.innerText(), /le mot mal permet de le savoir/);
    const readingPractice = page.locator('.practice-item');
    await readingPractice.getByText(/Lis « Il a lu\. »/).waitFor();
    await readingPractice.locator('summary').click();
    assert.match(await readingPractice.locator('.answer-reveal').innerText(), /La personne a lu/);
    await page.setViewportSize({ width: 390, height: 844 });
    console.log('PASS offline GS story order and name cards, and SIL sentence comprehension');

    await page.goto(base + 'ms/#themes');
    const plants = page.locator('.themeOpen[data-theme="T5"]');
    const animals = page.locator('.themeOpen[data-theme="T6"]');
    await plants.getByText('Code Klassia T5 · thème 6 du programme francophone').waitFor();
    await animals.getByText('Code Klassia T6 · thème 5 du programme francophone').waitFor();
    await plants.click();
    await page.locator('.hero').getByText('Code Klassia T5 · thème 6 du programme francophone').waitFor();
    await page.locator('#themeSelect').selectOption('T6');
    await page.locator('.hero').getByText('Code Klassia T6 · thème 5 du programme francophone').waitFor();
    console.log('PASS offline SIL primary colours, GS seat numbering and MS curriculum theme mapping');

    await page.setViewportSize({ width: 320, height: 844 });
    await page.goto(base + 'ms/?theme=T1#domain:ST:0');
    await page.waitForFunction(() => document.querySelector('.lesson-figure')?.naturalWidth > 0);
    await page.locator('#msNumber').fill('1');
    await page.locator('#msCheckNumber').click();
    assert.match(await page.locator('#msNumberResult').innerText(), /Bravo.*1 crayon/);
    const counting = [
      ['T2', 0, /La carte 2/],
      ['T3', 0, /Trois personnages/],
      ['T4', 0, /Quatre gobelets/],
      ['T6', 1, /Cinq animaux dans le groupe/]
    ];
    for (const [theme, position, answer] of counting) {
      await page.goto(base + 'ms/?theme=' + theme + '#domain:ST:' + position);
      const guide = page.locator('.answer-reveal');
      await guide.locator('summary').click();
      assert.match(await guide.innerText(), answer);
    }
    await page.goto(base + 'ms/?theme=T8#domain:ST:1');
    const countingGuide = page.getByText('Préparer et adapter l’activité', { exact: true });
    await countingGuide.click();
    await page.getByText(/plus grand nombre retrouvé seul dans deux dispositions/).waitFor();

    await page.goto(base + 'gs/?theme=T1#domain:MO:0');
    await page.waitForFunction(() => document.querySelector('.lesson-figure')?.naturalWidth > 0);
    await page.getByText(/Suit la ligne droite puis le virage/).waitFor();
    await page.getByText(/S’arrête au signal et attend le départ/).waitFor();
    await page.goto(base + 'gs/?theme=T8#domain:MO:2');
    await page.getByText(/Ralentit en gardant un espace avec le partenaire/).waitFor();
    console.log('PASS offline MS counting progression and GS movement criteria');

    for (const [theme, sentence] of [['T1', 'Can Sam sit?'], ['T8', 'Stop the bus.']]) {
      await page.goto(base + 'gs/?theme=' + theme + '#domain:LC:2');
      await page.getByRole('cell', { name: sentence, exact: true }).waitFor();
      await page.getByText(/premier essai et la relecture après modèle/).waitFor();
    }

    await page.goto(base + 'ce1/#lesson:CE1-U8-L03');
    const secondMessage = page.locator('.practice-item');
    await secondMessage.getByRole('button', { name: /Listen in English/ }).waitFor();
    const transcript = secondMessage.locator('details.adult-guide');
    assert.equal(await transcript.getAttribute('open'), null);
    await transcript.locator('summary').click();
    assert.match(await transcript.innerText(), /Music club.*Thursday/);
    await secondMessage.getByText('Show feedback', { exact: true }).click();
    assert.match(await secondMessage.locator('.answer-reveal').innerText(), /music club.*Thursday.*I will bring my song book/);

    await page.goto(base + '?unit=U8#lesson:FR-U8-L3');
    const opinion = page.locator('.exercise-card').filter({ hasText: /quel geste d’Éric a le plus aidé/ });
    await opinion.getByRole('button', { name: 'Voir la correction' }).click();
    assert.match(await opinion.locator('.feedback').innerText(), /Ton détail vient du récit.*justifie ton choix/s);

    await page.goto(base + '?unit=U8#lesson:EN-U8-L3');
    const telephone = page.locator('.exercise-card').filter({ hasText: /write the whole call/ });
    await telephone.getByRole('button', { name: 'Voir la correction' }).click();
    assert.match(await telephone.locator('.feedback').innerText(), /Can you bring a pencil.*Yes, I’ll bring one.*Goodbye/s);
    console.log('PASS offline GS reading, CE1 listening and CE2 opinion and telephone writing');
    await testBassaMicrophone(context, page, base);
    await testPilotNotebook(page, base);
    await testReadingWorkshops(page, base);
  } finally {
    await browser?.close();
    server.close();
  }
}

run().catch(error => { console.error(error); process.exitCode = 1; });
