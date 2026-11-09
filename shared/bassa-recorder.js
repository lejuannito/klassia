/* Local recording and review for documented Bassa forms. */
(function (K) {
 'use strict';
 const pilot = {
  BA002: 'Montrez une salle de classe. Demandez au locuteur quelle forme il emploie pour désigner cette salle. Relevez le contexte si deux formes sont proposées.',
  BA004: 'Montrez une personne qui enseigne. Demandez au référent de distinguer les formes prononcées des anciennes graphies.',
  BA005: 'Montrez d’abord un livre, puis un livre de lecture. Notez le sens exact de la forme que le locuteur prononce.',
  BA006: 'Montrez un crayon, puis un autre crayon de forme différente. Vérifiez que le locuteur désigne bien le même objet.'
 };
 const duration = 12_000;
 const decisions = { confirme: 'Prononciation et tons confirmés', reprendre: 'À reprendre' };
 const canEdit = () => ['ENSEIGNANT', 'ADMIN'].includes(K.read('klassia_user', {})?.role);
 const stopTracks = stream => stream?.getTracks().forEach(track => track.stop());
 const newId = () => crypto.getRandomValues(new Uint32Array(2)).join('-');

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

 async function approvedTakes(entries) {
  const profile = K.profile().id;
  const allowed = new Map(entries.map(entry => [entry.id, entry.forms]));
  const db = await openTakes();
  const takes = [];
  try {
   await transact(db, 'readonly', store => {
    const range = IDBKeyRange.bound([profile], [profile, []]);
    const request = store.openCursor(range);
    request.onsuccess = () => {
     const cursor = request.result;
     if (!cursor) return;
     const [, id, form] = cursor.key;
     const take = cursor.value;
     if (allowed.get(id)?.includes(form) && take.review?.decision === 'confirme' &&
         take.review.localListening === true && take.audio instanceof Blob && take.audio.size) {
      takes.push({ id, form, audio: take.audio });
     }
     cursor.continue();
    };
    return request;
   });
   return K.profile().id === profile ? takes : [];
  } finally {
   db.close();
  }
 }

 function extension(blob) {
  const format = blob.type.split(';')[0];
  return { 'audio/mp4': 'm4a', 'video/mp4': 'mp4', 'audio/webm': 'webm',
   'video/webm': 'webm', 'audio/ogg': 'ogg' }[format] || 'audio';
 }

 function mount(panel, lexicon) {
  if (!panel || !canEdit()) return;
  const entries = lexicon.filter(entry => entry.forms.length);
  const publishedCount = entries.filter(entry => entry.recordings?.length).length;
  const title = entry => `${entry.id} · ${entry.concept.split(' / ')[0]}`;
  const byId = new Map(entries.map(entry => [entry.id, entry]));
  const profile = K.profile().id;
  const listeners = new AbortController();
  const listenerOptions = { signal: listeners.signal };
  const unsupported = !window.isSecureContext ? 'Ouvrez Klassia en HTTPS pour utiliser le micro.'
   : !navigator.mediaDevices?.getUserMedia || !window.MediaRecorder ? 'Le micro est indisponible dans ce navigateur.' : '';
  let db, saved, draft, capture, displayed, playbackUrl;
  let busy = true;

  panel.innerHTML = `<h2>Enregistrer une prononciation</h2>
   <p>Obtenez l’accord du locuteur pour la prise. Choisissez la forme à prononcer. Chaque essai dure au plus 12 secondes.</p>
   <p>Dans cette édition, ${publishedCount} entrées sur ${entries.length} disposent d’au moins une prise publiée.</p>
   <p><b>Les quatre prises du pilote</b></p>
   <div class="bassa-recorder-actions">
    ${Object.keys(pilot).map(id => `<button class="btn soft" type="button" data-quick="${id}">${K.escape(title(byId.get(id)))}</button>`).join('')}
   </div>
   <form class="bassa-recorder-actions" data-entry-filter>
    <label>Filtrer les ${entries.length} entrées <input name="query" type="search" placeholder="Code, mot ou forme bassa"></label>
    <button class="btn soft" type="submit">Filtrer les entrées</button>
   </form>
   <div class="bassa-recorder-fields">
    <label>Entrée <select data-entry></select></label>
    <label>Forme bassa <select data-form></select></label>
   </div>
   <div class="adult-guide">
    <h3>Situation à proposer au locuteur</h3>
    <p data-situation></p>
    <p>Demandez d’abord le mot dans cette situation. Faites ensuite écouter la prise isolée au référent pour vérifier la forme et les tons.</p>
    <a data-pilot-note>Proposer une autre situation ou signaler une difficulté</a>
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
   <form class="adult-guide" data-take-review hidden>
    <h3>Vérifier la prononciation</h3>
    <p>Faites réécouter la prise conservée au référent. Consignez son avis sur la prononciation et les tons de cette forme.</p>
    <fieldset class="bassa-recorder-fields">
     <legend>Avis du référent</legend>
     <label>Nom ou code du référent <input name="referent" maxlength="100" required></label>
     <label>Décision <select name="decision" required><option value="">Choisir</option>
      ${Object.entries(decisions).map(([value, label]) => `<option value="${value}">${label}</option>`).join('')}</select></label>
     <label>Observation facultative <textarea name="note" rows="2" maxlength="240"></textarea></label>
     <label><span><input type="checkbox" name="localListening"> Le locuteur autorise l’écoute par l’élève sur cet appareil</span></label>
     <button class="btn primary" type="submit">Enregistrer l’avis</button>
    </fieldset>
    <p data-review-status></p>
   </form>
   <details class="adult-guide" data-publication hidden>
    <summary>Préparer la diffusion sur tous les appareils</summary>
    <p>Obtenez l’accord du locuteur pour la diffusion sur le site. Indiquez les codes des justificatifs conservés en privé. Le dossier contient la voix et doit être transmis en privé.</p>
    <form>
     <fieldset class="bassa-recorder-fields">
      <legend>Justificatifs de la prise</legend>
      <label>Sens prononcé <input name="sense" maxlength="160" required></label>
      <label>Référence de l’avis favorable <input name="reviewRef" maxlength="64" required></label>
      <label>Référence de l’accord de diffusion <input name="consentRef" maxlength="64" required></label>
      <label>Crédit public autorisé (facultatif) <input name="credit" maxlength="100"></label>
      <label><input type="checkbox" name="remoteConsent"> Le locuteur autorise la diffusion de cette prise à tous les élèves.</label>
      <button class="btn primary" type="submit">Publier pour tous les élèves</button>
      <button class="btn soft" type="button" data-export-package>Exporter le dossier pour intégration manuelle</button>
     </fieldset>
    </form>
    <p data-publication-status role="status"></p>
   </details>
   <p>Les prises restent locales jusqu’à publication. Publier pour tous exige une session référent authentifiée sur klassia.app et un accord de diffusion vérifié.</p>`;

  const find = selector => panel.querySelector(selector);
  const filter = find('[data-entry-filter]');
  const quick = [...panel.querySelectorAll('[data-quick]')];
  const entry = find('[data-entry]'), form = find('[data-form]'), status = find('[data-status]');
  const record = find('[data-record]'), stop = find('[data-stop]'), cancel = find('[data-cancel]');
  const player = find('[data-player]'), audio = find('audio'), download = find('[data-download]');
  const keep = find('[data-keep]'), discard = find('[data-discard]'), remove = find('[data-delete]');
  const review = find('[data-take-review]'), reviewFields = review.querySelector('fieldset');
  const publication = find('[data-publication]'), packageForm = publication.querySelector('form');
  const publicationStatus = find('[data-publication-status]');
  const exportPackage = find('[data-export-package]');
  const apiBase = location.hostname === 'klassia.app' || location.hostname.endsWith('.klassia.pages.dev') ? '/api/bassa' : '';
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
   for (const control of [...filter.elements, ...quick]) control.disabled = entry.disabled;
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
   review.hidden = !saved || Boolean(draft) || Boolean(capture);
   reviewFields.disabled = locked;
   if (review.hidden) delete review.dataset.take;
   else if (review.dataset.take !== saved.id) {
    review.dataset.take = saved.id;
    const opinion = saved.review;
    review.elements.referent.value = opinion?.referent || '';
    review.elements.decision.value = opinion?.decision || '';
    review.elements.note.value = opinion?.note || '';
    review.elements.localListening.checked = opinion?.localListening === true;
    find('[data-review-status]').textContent = opinion
     ? `${decisions[opinion.decision]} · ${new Date(opinion.date).toLocaleDateString('fr-FR')}${opinion.localListening ? ' · écoute élève activée' : ''}`
     : 'Avis à consigner après écoute.';
   }
   publication.hidden = review.hidden || saved?.review?.decision !== 'confirme';
   packageForm.querySelector('fieldset').disabled = locked;
   if (!publication.hidden && publication.dataset.take !== saved.id) {
    publication.dataset.take = saved.id;
    packageForm.reset();
    packageForm.elements.sense.value = byId.get(entry.value).concept.split(' / ')[0];
    publicationStatus.textContent = '';
    publication.open = false;
   }
   status.textContent = message ?? (saved ? 'Prise conservée sur cet appareil.' : (!entry.value ? 'Aucune entrée trouvée. Modifiez la recherche.' : unsupported || 'Choisissez une forme et lancez la prise.'));
  }

  async function readTake() {
   busy = true;
   saved = undefined;
   render('Recherche de la prise locale…');
   try {
    saved = entry.value ? await transact(db, 'readonly', store => store.get(key())) : undefined;
    busy = false;
    render();
   } catch {
    busy = false;
    render('Impossible de lire les prises locales. Rouvrez l’atelier pour réessayer.');
   }
  }

  function selectEntry() {
   const forms = byId.get(entry.value)?.forms || [];
   form.replaceChildren(...forms.map(value => new Option(value, value)));
   find('[data-situation]').textContent = pilot[entry.value] || (entry.value
    ? 'Montrez ou décrivez « ' + byId.get(entry.value).concept.split(' / ')[0] + ' ». Précisez avec le référent le sens de la forme prononcée.'
    : 'Choisissez une entrée du lexique.');
   const note = find('[data-pilot-note]');
   note.hidden = !Object.hasOwn(pilot, entry.value);
   note.href = './pilote.html?classe=CE2&lecon=BA-U3-L1&exercice=' + encodeURIComponent(entry.value) + '#observations';
   return readTake();
  }

  function filterEntries(selected = entry.value) {
   const fold = value => value.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase('fr').trim();
   const query = fold(filter.elements.query.value);
   const found = entries.filter(item => fold(`${item.id} ${item.concept} ${item.forms.join(' ')}`).includes(query));
   entry.replaceChildren(...found.map(item => new Option(title(item), item.id)));
   if (found.some(item => item.id === selected)) entry.value = selected;
   return selectEntry();
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
     draft = { audio: blob, id: newId() };
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

  async function writeTake(take, message) {
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
    render(message ?? (take ? 'Prise conservée sur cet appareil.' : 'Prise supprimée de cet appareil.'));
    panel.dispatchEvent(new Event('klassia:bassa-audio'));
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

  filter.onsubmit = event => { event.preventDefault(); filterEntries(); };
  for (const button of quick) button.onclick = () => {
   filter.elements.query.value = '';
   filterEntries(button.dataset.quick);
  };
  entry.onchange = selectEntry;
  form.onchange = readTake;
  record.onclick = startCapture;
  stop.onclick = finishCapture;
  cancel.onclick = () => cancelCapture('Prise annulée.');
  keep.onclick = () => writeTake(draft);
  discard.onclick = () => { draft = undefined; render('Essai écarté.'); };
  remove.onclick = () => { if (confirm('Supprimer la prise conservée pour « ' + form.value + ' » ?')) writeTake(); };
  review.onsubmit = event => {
   event.preventDefault();
   if (!active() || !saved || review.hidden || busy) return;
   const referent = review.elements.referent.value.trim();
   const decision = review.elements.decision.value;
   if (!referent || !Object.hasOwn(decisions, decision)) {
    render('Indiquez le référent et sa décision après écoute.');
    return;
   }
   const note = review.elements.note.value.trim();
   const localListening = decision === 'confirme' && review.elements.localListening.checked;
   writeTake({ ...saved, id: newId(), review: { referent, decision, note, localListening, date: new Date().toISOString() } },
    'Avis du référent conservé avec cette prise sur cet appareil.');
  };

  async function validatedPublication() {
   if (!active() || publication.hidden || busy || saved?.review?.decision !== 'confirme') return null;
   const f=packageForm.elements;
   const sense=f.sense.value.trim(), review_ref=f.reviewRef.value.trim(), consent_ref=f.consentRef.value.trim(), credit=f.credit.value.trim();
   const validRef=value=>/^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/.test(value);
   if (!sense || !validRef(review_ref) || !validRef(consent_ref) || !f.remoteConsent.checked) {
    publicationStatus.textContent='Confirmez l’accord de diffusion et indiquez les deux références de justificatifs conservés en privé.';
    return null;
   }
   const take=saved, latest=await transact(db,'readonly',store=>store.get(key()));
   if (!active() || latest?.id!==take.id) {
    publicationStatus.textContent='Cette prise a changé. Vérifiez le nouvel avis avant diffusion.';
    return null;
   }
   return {take,id:entry.value,form:form.value,sense,review_ref,consent_ref,credit};
  }

  packageForm.onsubmit=async event=>{
   event.preventDefault();
   if (!apiBase) {
    publicationStatus.textContent='La publication directe est disponible depuis le domaine klassia.app.';
    return;
   }
   const info=await validatedPublication();
   if (!info)return;
   busy=true;render();
   publicationStatus.textContent='Envoi de la prise validée…';
   try {
    const data=new FormData();
    data.append('audio',info.take.audio,info.id+'.audio');
    for(const field of ['id','form','sense','review_ref','consent_ref','credit'])
     data.append(field==='id'?'entry_id':field,info[field]);
    data.append('confirmed','true');
    const response=await fetch(apiBase+'/author',{method:'POST',body:data,credentials:'same-origin'});
    const result=await response.json().catch(()=>({}));
    if(!response.ok)throw Error(result.error||'Publication refusée. Vérifiez votre authentification.');
    publicationStatus.textContent='Prise publiée pour tous les élèves. Identifiant : '+result.id;
    document.dispatchEvent(new Event('klassia:bassa-published'));
   } catch(error) {
    publicationStatus.textContent='Publication impossible : '+error.message+' La prise locale est conservée.';
   } finally {busy=false;render();}
  };

  exportPackage.onclick=async()=>{
   const info=await validatedPublication();
   if(!info)return;
   busy=true;render();
   try {
    const base64=await new Promise((resolve,reject)=>{
     const reader=new FileReader();
     reader.onload=()=>resolve(reader.result.split(',')[1]);
     reader.onerror=()=>reject(reader.error);
     reader.readAsDataURL(info.take.audio);
    });
    if(!active())return;
    const dossier={format:'klassia-bassa-publication',version:1,id:info.id,form:info.form,
     sense:info.sense,reviewed_on:info.take.review.date.slice(0,10),
     review_ref:info.review_ref,consent_ref:info.consent_ref,
     ...(info.credit?{credit:info.credit}:{}),source:{type:info.take.audio.type,base64}};
    const url=URL.createObjectURL(new Blob([JSON.stringify(dossier)],{type:'application/json'}));
    const link=document.createElement('a');
    link.href=url;link.download='Klassia-'+info.id+'-diffusion.json';link.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
    publicationStatus.textContent='Dossier exporté pour intégration manuelle.';
   } catch {publicationStatus.textContent='Export impossible.';}
   finally {busy=false;render();}
  };

  render('Chargement de l’atelier…');
  openTakes().then(connection => {
   if (!active()) { connection.close(); return; }
   db = connection;
   return filterEntries('BA002');
  }).catch(() => render('Le stockage des prises est indisponible dans ce navigateur.'));
 }

 K.BassaRecorder = { mount, canEdit, approvedTakes };
})(Klassia);
