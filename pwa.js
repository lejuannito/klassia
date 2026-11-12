(() => {
  'use strict';

  const root = document.getElementById('pwaTools');
  if (!root) return;

  const base = new URL('.', document.currentScript.src);
  const workerUrl = new URL('service-worker.js', base).href;
  const workers = navigator.serviceWorker;
  const bar = document.createElement('div');
  bar.className = 'offline-state offline-tools';
  const description = document.createElement('span');
  const button = document.createElement('button');
  const installButton = document.createElement('button');
  installButton.textContent = 'Installer Klassia';
  installButton.hidden = true;
  bar.append(description, button, installButton);
  root.append(bar);

  // Téléchargement par classe (lot 9c). Le choix vaut pour l'appareil (clé brute, hors profils et hors sauvegarde). Le service
  // worker le reçoit dans son adresse d'inscription, puis par message ; la page ne touche jamais au cache elle-même.
  const OFFLINE_KEY = 'klassia_offline_classes_v1';
  const ORDER = ['CE2', 'MS', 'GS', 'SIL', 'CE1'];
  const NAMES = { CE2: 'CE2', MS: 'Moyenne section', GS: 'Grande section', SIL: 'SIL', CE1: 'CE1', ATELIER: 'Revue éditoriale (atelier pédagogique)' };
  const LONG = { CE2: 'CE2', MS: 'Moyenne section', GS: 'Grande section', SIL: 'SIL', CE1: 'CE1' };
  const panel = document.createElement('details');
  panel.className = 'offline-classes';
  panel.hidden = true;
  root.append(panel);
  let selection = null;
  let lastStatus = null;

  function savedSelection() {
    try {
      const value = JSON.parse(localStorage.getItem(OFFLINE_KEY));
      return value === 'all' || (Array.isArray(value) && value.every(x => typeof x === 'string')) ? value : null;
    } catch { return null; }
  }
  function saveSelection(value) {
    selection = value;
    const text = JSON.stringify(value);
    try { if (localStorage.getItem(OFFLINE_KEY) !== text) localStorage.setItem(OFFLINE_KEY, text); } catch { /* The worker keeps its own copy. */ }
  }
  function pageGrade() {
    // La classe sans dossier (CE2) partage la page d'entrée : elle ne compte que sur un lien direct vers son contenu.
    try {
      const c = window.Klassia?.currentClass?.();
      if (!c) return null;
      if (c.dir || window.Klassia.inClassFolder?.()) return c.grade;
      const deep = /[?&]unit=/.test(location.search) || /^#(lesson|subject|eval|qcm|unit|project)\b/.test(location.hash);
      return deep && /\/(index\.html)?$/.test(location.pathname) ? c.grade : null;
    } catch { return null; }
  }
  function familyGrade() {
    try { const g = window.Klassia?.read?.('klassia_family', null)?.grade; return ORDER.includes(g) ? g : null; } catch { return null; }
  }
  // Premier choix : un appareil déjà installé garde tout ; sinon la classe de l'enfant (accueil) ou de la page.
  function resolveSelection(installed) {
    const saved = savedSelection();
    if (saved) return saved;
    const grade = familyGrade() || pageGrade();
    const value = installed ? 'all' : grade ? [grade] : null;
    if (value) saveSelection(value);
    return value;
  }
  const isAll = value => value === 'all' || ORDER.every(g => value?.includes(g));
  const chosenGrades = value => ORDER.filter(g => value === 'all' || value?.includes(g));
  const listText = grades => grades.length > 1 ? grades.slice(0, -1).join(', ') + ' et ' + grades[grades.length - 1] : grades[0] || '';
  const mo = bytes => (bytes / 1e6).toLocaleString('fr-FR', { maximumFractionDigits: 1, minimumFractionDigits: 1 }) + ' Mo';
  const preparing = () => isAll(selection) ? 'Préparation des cinq classes hors connexion…'
    : 'Préparation de ' + (listText(chosenGrades(selection)) || 'Klassia') + ' hors connexion…';

  function drawPanel(status) {
    const packs = status?.packs;
    if (!packs) { panel.hidden = true; return; }
    const keys = [...ORDER, 'ATELIER'].filter(k => packs[k]);
    const on = k => selection === 'all' || selection?.includes(k);
    panel.hidden = false;
    panel.innerHTML = `<summary>Classes hors connexion</summary><p>Choisissez les classes à garder sur cet appareil. La base commune (${mo(packs.common?.bytes || 0)}) est toujours installée.</p><fieldset><legend>Classes</legend>${keys.map(k => `<label><input type="checkbox" value="${k}" ${on(k) ? 'checked' : ''}> ${NAMES[k]} <span>${mo(packs[k].bytes)}</span></label>`).join('')}</fieldset><button type="button" data-offline-save>Enregistrer ce choix</button><p data-offline-message role="status"></p>`;
    panel.querySelector('[data-offline-save]').onclick = () => {
      const picked = [...panel.querySelectorAll('input:checked')].map(x => x.value);
      if (!picked.some(k => ORDER.includes(k))) { panel.querySelector('[data-offline-message]').textContent = 'Gardez au moins une classe.'; return; }
      applyClasses(picked.length === keys.length ? 'all' : picked);
    };
  }

  async function applyClasses(value) {
    saveSelection(value);
    const worker = workers.controller || registration?.active;
    if (!worker) { checkForUpdate(); return; }
    show('Mise à jour des classes hors connexion…');
    const reply = await askWorker(worker, 'SET_CLASSES', 120000, { classes: value });
    if (!reply || reply.error) checkResult = 'failed';
    refresh();
  }

  function show(message, label, action, disabled = false) {
    description.textContent = message;
    button.textContent = label || '';
    button.hidden = !action;
    button.disabled = disabled;
    button.onclick = action || null;
  }

  if (!workers) {
    show('Le mode hors connexion nécessite un navigateur compatible.');
    return;
  }

  let registration;
  let watchedWorker;
  let checking = false;
  let checkResult = '';
  let activationTarget;
  let activationNotice = '';
  let controller = workers.controller;
  let reloadNeeded = false;
  let renderNumber = 0;

  function askWorker(worker, type, deadline = 5000, extra = {}) {
    if (!worker) return Promise.resolve(null);

    return new Promise(resolve => {
      const channel = new MessageChannel();
      const timer = setTimeout(() => finish(null), deadline);
      function finish(data) {
        clearTimeout(timer);
        channel.port1.close();
        resolve(data);
      }

      channel.port1.onmessage = event => finish(event.data);
      try {
        worker.postMessage({ type, ...extra }, [channel.port2]);
      } catch {
        finish(null);
      }
    });
  }

  async function refresh() {
    const render = ++renderNumber;
    if (reloadNeeded) {
      show('Une nouvelle édition est active. Rechargez cette page pour l’utiliser.',
        'Recharger la page', () => location.reload());
      return;
    }
    if (activationTarget) {
      show('Chargement de la nouvelle édition…');
      return;
    }
    if (registration?.waiting && registration.active) {
      show(activationNotice || 'Nouvelle édition téléchargée et vérifiée.',
        'Recharger avec la nouvelle édition', activateUpdate);
      return;
    }
    if (registration?.installing?.state === 'installing' ||
        registration?.waiting || registration?.active?.state === 'activating') {
      show(registration.active
        ? 'Téléchargement et vérification de la nouvelle édition… L’édition installée reste utilisable.'
        : preparing());
      return;
    }
    if (checking) {
      show(registration?.active
        ? 'Vérification des mises à jour…'
        : preparing());
      return;
    }

    const status = await askWorker(workers.controller || registration?.active, 'OFFLINE_STATUS');
    if (render !== renderNumber) return;

    if (status?.selection) selection = status.selection;
    lastStatus = status;
    drawPanel(status);
    const ready = status?.ready;
    const code = ready ? status.version.slice(0, 8) : '';
    const grades = chosenGrades(selection || 'all');
    const edition = ready
      ? listText(grades) + (grades.length > 1 ? ' disponibles' : ' disponible') + ' hors connexion · édition ' + code + '.'
      : isAll(selection || 'all') ? 'Le téléchargement des cinq classes est incomplet.' : 'Le téléchargement de ' + listText(grades) + ' est incomplet.';
    const here = pageGrade() || (location.pathname.endsWith('/') && familyGrade() === 'CE2' ? 'CE2' : null);
    const missing = ready && here && !grades.includes(here) && status.packs?.[here]
      ? ' ' + LONG[here] + ' n’est pas installée hors connexion sur cet appareil.' : '';
    const result = checkResult === 'failed'
      ? 'La mise à jour a été interrompue. '
      : checkResult === 'current' && ready ? 'L’édition installée est à jour. ' : '';
    const online = navigator.onLine;
    if (missing && online) {
      show(result + edition + missing, 'Ajouter ' + LONG[here] + ' (' + mo(status.packs[here].bytes) + ')',
        () => applyClasses([...chosenGrades(selection), here]));
      return;
    }
    const retry = !ready && registration?.active && !registration.waiting && !registration.installing;
    show(result + edition + (online ? '' : ' Reconnectez-vous pour vérifier les mises à jour.'),
      checkResult === 'failed' || !ready ? 'Réessayer' : 'Vérifier les mises à jour',
      retry ? () => applyClasses(selection || 'all') : checkForUpdate, !online);
    if (code && workers.controller) root.dispatchEvent(new CustomEvent('klassia:edition-ready', { detail: code }));
  }

  function watchInstallation() {
    const worker = registration.installing;
    if (!worker || worker === watchedWorker) return;
    watchedWorker = worker;
    checkResult = '';
    activationNotice = '';

    function onStateChange() {
      const state = worker.state;
      if (state === 'activated' || state === 'redundant') {
        worker.removeEventListener('statechange', onStateChange);
      }
      if (worker !== watchedWorker) return;
      if (state === 'redundant') checkResult = 'failed';
      refresh();
    }
    worker.addEventListener('statechange', onStateChange);
    onStateChange();
  }

  function useRegistration(nextRegistration) {
    if (registration !== nextRegistration) {
      registration?.removeEventListener('updatefound', watchInstallation);
      registration = nextRegistration;
      registration.addEventListener('updatefound', watchInstallation);
    }
    watchInstallation();
  }

  function register() {
    // « Tout » est le comportement par défaut du service worker : l'adresse ne porte un paramètre que pour un choix restreint.
    const query = Array.isArray(selection) ? '?classes=' + encodeURIComponent(selection.join(',')) : '';
    return workers.register(workerUrl + query, {
      scope: base.pathname,
      updateViaCache: 'none'
    });
  }

  function isCurrentRegistration() {
    const latest = registration?.installing || registration?.waiting || registration?.active;
    return latest?.scriptURL.split('?')[0] === workerUrl && registration.updateViaCache === 'none';
  }

  async function checkForUpdate() {
    if (checking || !navigator.onLine) return;
    checking = true;
    checkResult = '';
    refresh();

    let timer;
    try {
      const checkingExisting = isCurrentRegistration();
      const update = checkingExisting ? registration.update() : register();
      const limit = new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error('Délai de vérification dépassé')), 20000);
      });
      useRegistration(await Promise.race([update, limit]) || registration);
      if (checkingExisting && !registration.installing && !registration.waiting && !checkResult) {
        checkResult = 'current';
      }
    } catch {
      checkResult = 'failed';
    } finally {
      clearTimeout(timer);
      checking = false;
      refresh();
    }
  }

  async function activateUpdate() {
    const waiting = registration.waiting;
    if (!waiting || activationTarget) return;
    activationTarget = waiting;
    refresh();

    const reply = await askWorker(waiting, 'ACTIVATE_RELEASE', 10000);
    if (activationTarget !== waiting) return;
    activationTarget = null;
    activationNotice = reply?.reason === 'other-tabs'
      ? 'Fermez les autres onglets ou fenêtres Klassia, puis réessayez.'
      : 'Le rechargement a été interrompu. Réessayez.';
    refresh();
  }

  workers.addEventListener('controllerchange', () => {
    const next = workers.controller;
    if (next && next === activationTarget) {
      activationTarget = null;
      location.reload();
      return;
    }

    if (controller && next && controller !== next) reloadNeeded = true;
    controller = next;
    refresh();
  });

  window.addEventListener('offline', refresh);
  window.addEventListener('online', refresh);
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    installButton.hidden = false;
    installButton.onclick = async () => {
      installButton.hidden = true;
      try { await event.prompt(); } catch { /* The browser owns the prompt. */ }
    };
  });
  window.addEventListener('appinstalled', () => { installButton.hidden = true; });

  async function start() {
    try {
      const existing = await workers.getRegistration(base.href);
      selection = resolveSelection(existing?.scope === base.href);
      // Première visite sans classe connue (page d'entrée) : l'installation attend le choix de la famille.
      if (!selection && !(existing?.scope === base.href)) {
        show('Pour utiliser Klassia sans connexion, choisissez la classe de votre enfant à l’accueil, ou installez tout.',
          'Installer les cinq classes', () => { saveSelection('all'); checkForUpdate(); });
        return;
      }
      if (!selection) selection = 'all';
      show(preparing());
      if (existing?.scope === base.href) useRegistration(existing);
      if (navigator.onLine && !isCurrentRegistration()) {
        await checkForUpdate();
        return;
      }
    } catch {
      checkResult = 'failed';
    }
    refresh();
  }

  if (document.readyState === 'complete') start();
  else window.addEventListener('load', start, { once: true });
})();
