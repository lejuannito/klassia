(() => {
  const tools = document.getElementById('pwaTools');
  if (!tools) return;

  let deferredPrompt = null;
  const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

  function show(message, actionLabel, action) {
    tools.innerHTML = '';
    const bar = document.createElement('div');
    bar.className = 'pwa-banner';
    const text = document.createElement('span');
    text.textContent = message;
    bar.appendChild(text);
    if (actionLabel && action) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'pwa-action';
      button.textContent = actionLabel;
      button.addEventListener('click', action);
      bar.appendChild(button);
    }
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'pwa-close';
    close.setAttribute('aria-label', 'Fermer');
    close.textContent = '×';
    close.addEventListener('click', () => { tools.innerHTML = ''; });
    bar.appendChild(close);
    tools.appendChild(bar);
  }

  function showInstallHelp() {
    if (isStandalone()) return;
    if (isIOS) {
      show('Pour installer Klassia : dans Safari, touchez Partager puis « Sur l’écran d’accueil ».');
    } else if (!deferredPrompt) {
      show('Klassia peut être installée depuis le menu du navigateur : « Installer l’application » ou « Ajouter à l’écran d’accueil ».');
    }
  }

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;
    if (!isStandalone()) {
      show('Installez Klassia sur ce téléphone pour l’utiliser comme une application.', 'Installer', async () => {
        if (!deferredPrompt) return showInstallHelp();
        deferredPrompt.prompt();
        try { await deferredPrompt.userChoice; } catch (_) {}
        deferredPrompt = null;
        tools.innerHTML = '';
      });
    }
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    show('Klassia est installée. Les contenus CE2 restent disponibles hors connexion après synchronisation.');
    setTimeout(() => { tools.innerHTML = ''; }, 4500);
  });

  function updateNetworkBanner() {
    if (!navigator.onLine) show('Mode hors connexion : les contenus déjà synchronisés restent disponibles.');
    else if (!isStandalone() && isIOS) setTimeout(showInstallHelp, 1200);
  }
  window.addEventListener('offline', updateNetworkBanner);
  window.addEventListener('online', () => { tools.innerHTML = ''; });

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const reg = await navigator.serviceWorker.register('./service-worker.js', { scope: './' });
        reg.update().catch(() => {});
      } catch (error) {
        console.warn('Service Worker Klassia non disponible', error);
      }
      updateNetworkBanner();
    });
  } else {
    show('Ce navigateur ne permet pas le mode hors connexion. Utilisez une version récente de Chrome, Edge ou Safari.');
  }
})();
