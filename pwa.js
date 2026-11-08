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

  function askWorker(worker, type, deadline = 5000) {
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
        worker.postMessage({ type }, [channel.port2]);
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
        : 'Préparation des cinq classes hors connexion…');
      return;
    }
    if (checking) {
      show(registration?.active
        ? 'Vérification des mises à jour…'
        : 'Préparation des cinq classes hors connexion…');
      return;
    }

    const status = await askWorker(workers.controller || registration?.active, 'OFFLINE_STATUS');
    if (render !== renderNumber) return;

    const ready = status?.ready;
    const code = ready ? status.version.slice(0, 8) : '';
    const edition = ready
      ? 'CE2, MS, GS, SIL et CE1 disponibles hors connexion · édition ' + code + '.'
      : 'Le téléchargement des cinq classes est incomplet.';
    const result = checkResult === 'failed'
      ? 'La mise à jour a été interrompue. '
      : checkResult === 'current' && ready ? 'L’édition installée est à jour. ' : '';
    const online = navigator.onLine;
    show(result + edition + (online ? '' : ' Reconnectez-vous pour vérifier les mises à jour.'),
      checkResult === 'failed' || !ready ? 'Réessayer' : 'Vérifier les mises à jour',
      checkForUpdate, !online);
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
    return workers.register(workerUrl, {
      scope: base.pathname,
      updateViaCache: 'none'
    });
  }

  function isCurrentRegistration() {
    const latest = registration?.installing || registration?.waiting || registration?.active;
    return latest?.scriptURL === workerUrl && registration.updateViaCache === 'none';
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
    show('Préparation des cinq classes hors connexion…');
    try {
      const existing = await workers.getRegistration(base.href);
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
