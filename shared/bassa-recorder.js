/* Local recording workshop for the first four Bassa entries. */
(function (K) {
 'use strict';
 const pilot = new Set(['BA002', 'BA004', 'BA005', 'BA006']);
 const duration = 12_000;
 const canEdit = () => ['ENSEIGNANT', 'ADMIN'].includes(K.read('klassia_user', {})?.role);
 const stopTracks = stream => stream?.getTracks().forEach(track => track.stop());

 function openTakes() {
  return new Promise((resolve, reject) => {
   const request = indexedDB.open('klassia-bassa-audio', 1);
   request.onupgradeneeded = () => request.result.createObjectStore('takes');
   request.onsuccess = () => resolve(request.result);
   request.onerror = () => reject(request.error);
  });
 }

 function transact(db, mode, operation) {
  return new Promise((resolve, reject) => {
   const tx = db.transaction('takes', mode);
   const request = operation(tx.objectStore('takes'));
   tx.oncomplete = () => resolve(request.result);
   tx.onabort = () => reject(tx.error);
  });
 }

 function extension(blob) {
  const format = blob.type.split(';')[0];
  return { 'audio/mp4': 'm4a', 'video/mp4': 'mp4', 'audio/webm': 'webm',
   'video/webm': 'webm', 'audio/ogg': 'ogg' }[format] || 'audio';
 }

 function mount(panel, lexicon) {
  if (!panel || !canEdit()) return;
  const entries = lexicon.filter(entry => pilot.has(entry.id));
  const profile = K.profile().id;
  const listeners = new AbortController();
  const listenerOptions = { signal: listeners.signal };
  const unsupported = !window.isSecureContext ? 'Ouvrez Klassia en HTTPS pour utiliser le micro.'
   : !navigator.mediaDevices?.getUserMedia || !window.MediaRecorder ? 'Le micro est indisponible dans ce navigateur.' : '';
  let db, saved, draft, capture, displayed, playbackUrl;
  let busy = true;

  panel.innerHTML = `<h2>Enregistrer une prononciation</h2>
   <p>Obtenez l’accord du locuteur pour la prise. Choisissez la forme à prononcer. Chaque essai dure au plus 12 secondes.</p>
   <div class="bassa-recorder-fields">
    <label>Entrée <select data-entry>${entries.map(entry => `<option value="${entry.id}">${entry.id} · ${K.escape(entry.concept.split(' / ')[0])}</option>`).join('')}</select></label>
    <label>Forme bassa <select data-form></select></label>
   </div>
   <div class="bassa-recorder-actions">
    <button class="btn primary" data-record type="button">Enregistrer au micro</button>
    <button class="btn primary" data-stop type="button" hidden>Arrêter la prise</button>
    <button class="btn soft" data-cancel type="button" hidden>Annuler</button>
   </div>
   <p role="status" data-status></p>
   <div data-player hidden>
    <audio controls preload="metadata" aria-label="Réécouter la prise"></audio>
    <div class="bassa-recorder-actions">
     <button class="btn primary" data-keep type="button">Conserver la prise</button>
     <button class="btn soft" data-discard type="button">Écarter l’essai</button>
     <a class="btn soft" data-download>Télécharger la source</a>
     <button class="btn soft" data-delete type="button">Supprimer la prise</button>
    </div>
   </div>
   <p>Les prises restent dans le profil local, sur cet appareil. Pour la diffusion, faites vérifier la prononciation et les tons par le référent et recueillez l’accord du locuteur.</p>`;

  const find = selector => panel.querySelector(selector);
  const entry = find('[data-entry]'), form = find('[data-form]'), status = find('[data-status]');
  const record = find('[data-record]'), stop = find('[data-stop]'), cancel = find('[data-cancel]');
  const player = find('[data-player]'), audio = find('audio'), download = find('[data-download]');
  const keep = find('[data-keep]'), discard = find('[data-discard]'), remove = find('[data-delete]');
  const key = () => [profile, entry.value, form.value];
  const active = () => !listeners.signal.aborted && panel.isConnected && location.hash === '#bassa'
   && K.profile().id === profile && canEdit();

  function showAudio(take) {
   if (take === displayed) return;
   if (playbackUrl) {
    audio.pause();
    audio.removeAttribute('src');
    download.removeAttribute('href');
    URL.revokeObjectURL(playbackUrl);
   }
   displayed = take;
   playbackUrl = take && URL.createObjectURL(take.audio);
   if (playbackUrl) {
    audio.src = download.href = playbackUrl;
    const ordinal = String(form.selectedIndex + 1).padStart(2, '0');
    download.download = `${entry.value}-${ordinal}.${extension(take.audio)}`;
   }
  }

  function render(message) {
   if (!active()) return;
   const locked = busy || Boolean(capture) || !db;
   const take = draft || saved;
   entry.disabled = form.disabled = locked || Boolean(draft);
   record.hidden = Boolean(capture);
   record.disabled = locked || Boolean(unsupported) || !form.value;
   record.textContent = take ? 'Faire un autre essai' : 'Enregistrer au micro';
   stop.hidden = capture?.recorder?.state !== 'recording';
   cancel.hidden = !capture;
   player.hidden = !take || Boolean(capture);
   keep.hidden = discard.hidden = !draft;
   keep.disabled = discard.disabled = remove.disabled = locked;
   keep.textContent = saved ? 'Remplacer la prise' : 'Conserver la prise';
   remove.hidden = Boolean(draft) || !saved;
   showAudio(take);
   status.textContent = message ?? (saved ? 'Prise conservée sur cet appareil.' : unsupported || 'Choisissez une forme et lancez la prise.');
  }

  async function readTake() {
   busy = true;
   saved = undefined;
   render('Recherche de la prise locale…');
   try {
    saved = await transact(db, 'readonly', store => store.get(key()));
    busy = false;
    render();
   } catch {
    render('Impossible de lire les prises locales. Rouvrez l’atelier pour réessayer.');
   }
  }

  function selectEntry() {
   const forms = entries.find(item => item.id === entry.value)?.forms || [];
   form.replaceChildren(...forms.map(value => new Option(value, value)));
   return readTake();
  }

  function release(session) {
   clearTimeout(session.timer);
   stopTracks(session.stream);
   if (capture === session) capture = undefined;
  }

  function cancelCapture(message) {
   if (!capture) return;
   const session = capture;
   capture = undefined;
   try { if (session.recorder?.state === 'recording') session.recorder.stop(); } catch { /* Release the mic even if recording ended. */ }
   release(session);
   render(message);
  }

  function finishCapture() {
   if (capture?.recorder?.state !== 'recording') return;
   try {
    capture.finished = true;
    capture.recorder.stop();
    render('Préparation de la réécoute…');
   } catch {
    cancelCapture('Enregistrement interrompu. Vous pouvez recommencer.');
   }
  }

  async function startCapture() {
   if (!active() || record.disabled) return;
   const session = {};
   capture = session;
   audio.pause();
   render('Autorisez l’accès au micro pour commencer.');
   try {
    session.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    if (capture !== session) {
     stopTracks(session.stream);
     return;
    }
    if (!active() || document.hidden) {
     release(session);
     render('Prise interrompue. Vous pouvez recommencer.');
     return;
    }
    const recorder = session.recorder = new MediaRecorder(session.stream);
    const chunks = [];
    recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
    recorder.onerror = () => {
     if (capture === session) cancelCapture('Enregistrement interrompu. Vous pouvez recommencer.');
    };
    recorder.onstop = () => {
     if (capture !== session) return;
     release(session);
     if (!active()) return;
     const blob = new Blob(chunks, { type: chunks[0]?.type || recorder.mimeType });
     if (!session.finished || !blob.size) {
      render('Prise interrompue ou vide. Vous pouvez recommencer.');
      return;
     }
     draft = { audio: blob, id: crypto.getRandomValues(new Uint32Array(2)).join('-') };
     render('Réécoutez l’essai, puis choisissez de le conserver ou de le refaire.');
    };
    recorder.start();
    session.timer = setTimeout(finishCapture, duration);
    render('Enregistrement en cours. Prononcez la forme, puis arrêtez la prise.');
   } catch (error) {
    if (capture !== session) return;
    release(session);
    render(error.name === 'NotAllowedError'
     ? 'Accès au micro refusé. Autorisez-le dans les réglages du site, puis réessayez.'
     : 'Impossible d’utiliser le micro. Vérifiez sa disponibilité, puis réessayez.');
   }
  }

  async function writeTake(take) {
   busy = true;
   render('Mise à jour de la prise locale…');
   try {
    const takeKey = key(), expected = saved?.id;
    const previous = await transact(db, 'readwrite', store => {
     const request = store.get(takeKey);
     request.onsuccess = () => {
      if (request.result?.id !== expected) return;
      if (take) store.put(take, takeKey);
      else store.delete(takeKey);
     };
     return request;
    });
    busy = false;
    if (previous?.id !== expected) {
     saved = previous;
     render('La prise conservée a changé dans une autre fenêtre. Vérifiez avant de réessayer.');
     return;
    }
    saved = take;
    draft = undefined;
    render(take ? 'Prise conservée sur cet appareil.' : 'Prise supprimée de cet appareil.');
   } catch {
    busy = false;
    render('Impossible de modifier la prise conservée. Vous pouvez réessayer.');
   }
  }

  function close() {
   listeners.abort();
   cancelCapture();
   showAudio(undefined);
   db?.close();
   panel.hidden = true;
  }

  function checkScope() { if (!active()) close(); }
  window.addEventListener('hashchange', checkScope, listenerOptions);
  document.addEventListener('klassia:render', checkScope, listenerOptions);
  document.addEventListener('change', event => { if (event.target.id === 'localRole') checkScope(); }, listenerOptions);
  window.addEventListener('pagehide', event => {
   if (event.persisted) cancelCapture('Prise interrompue. Vous pouvez recommencer.');
   else close();
  }, listenerOptions);
  document.addEventListener('visibilitychange', () => {
   if (!document.hidden) return;
   audio.pause();
   if (capture?.recorder) cancelCapture('Prise interrompue. Vous pouvez recommencer.');
  }, listenerOptions);

  entry.onchange = selectEntry;
  form.onchange = readTake;
  record.onclick = startCapture;
  stop.onclick = finishCapture;
  cancel.onclick = () => cancelCapture('Prise annulée.');
  keep.onclick = () => writeTake(draft);
  discard.onclick = () => { draft = undefined; render('Essai écarté.'); };
  remove.onclick = () => { if (confirm('Supprimer la prise conservée pour « ' + form.value + ' » ?')) writeTake(); };

  render('Chargement de l’atelier…');
  openTakes().then(connection => {
   if (!active()) { connection.close(); return; }
   db = connection;
   return selectEntry();
  }).catch(() => render('Le stockage des prises est indisponible dans ce navigateur.'));
 }

 K.BassaRecorder = { mount };
})(Klassia);
