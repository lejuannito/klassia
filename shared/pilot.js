/* Standalone local pilot notebook. Its records are separate from child profiles. */
(function (factory) {
 const api = factory();
 if (typeof module === 'object' && module.exports) module.exports = api;
 else api.mount(document);
})(() => {
 'use strict';
 const grades = ['MS', 'GS', 'SIL', 'CE1', 'CE2'];
 const checks = {
  installation: 'Ouverture et édition disponible hors connexion',
  bassa: 'Écran Bassa en portrait et en paysage',
  micro: 'Capture, réécoute et reprise d’une prise Bassa',
  extraits: 'Lecture des extraits intégrés en mode avion',
  voix: 'Voix FR/EN de l’appareil',
  progression: 'Profil et progression après réouverture ou mise à jour'
 };
 const outcomes = { 'non-essaye': 'Non essayé', reussi: 'Réussi', 'a-reprendre': 'À reprendre' };
 const helpLabels = { autonome: 'Autonome', repetition: 'Consigne répétée', guidage: 'Exemple ou guidage', bloque: 'Bloqué' };
 const retryLabels = { 'non-essaye': 'Non essayé', autonome: 'Autonome', 'avec-aide': 'Réussi avec aide', bloque: 'Bloqué' };
 const maxRecords = 500;
 const sessionPattern = /^[a-z0-9_-]{2,24}$/i;
 const editionPattern = /^[a-z0-9_.-]{2,48}$/i;
 const lessonPattern = /^[a-z0-9-]{2,40}$/i;
 const exercisePattern = /^[a-z0-9-]{1,40}$/i;

 function token(value, pattern, label) {
  if (typeof value !== 'string' || !pattern.test(value.trim())) throw Error(label + ' invalide.');
  return value.trim();
 }
 function choose(value, allowed, label) {
  if (!allowed.includes(value)) throw Error(label + ' invalide.');
  return value;
 }
 function text(value, length, label, required = false) {
  if (typeof value !== 'string' || value.length > length || (required && !value.trim())) throw Error(label + ' invalide.');
  return value.trim();
 }
 function normalizeRecord(input) {
  if (!input || typeof input !== 'object') throw Error('Relevé illisible.');
  const id = token(input.id, /^[a-f0-9]{32}$/, 'Identifiant du relevé');
  const kind = choose(input.kind, ['observation', 'appareil'], 'Type de relevé');
  const session = token(input.session, sessionPattern, 'Code de séance').toUpperCase();
  const edition = token(input.edition, editionPattern, 'Code d’édition').toLowerCase();
  const day = token(input.day, /^\d{4}-\d{2}-\d{2}$/, 'Date');
  const note = text(input.note, 300, 'Observation');
  const common = { id, kind, session, edition, day, note };
  if (kind === 'observation') return {
   ...common,
   actor: choose(input.actor, ['famille', 'enseignant'], 'Observateur'),
   grade: choose(input.grade, grades, 'Classe'),
   lesson: token(input.lesson, lessonPattern, 'Identifiant de leçon').toUpperCase(),
   exercise: token(input.exercise, exercisePattern, 'Identifiant d’exercice').toUpperCase(),
   help: choose(input.help, Object.keys(helpLabels), 'Aide au premier essai'),
   cause: choose(input.cause, ['aucune', 'consigne', 'prerequis', 'exercice', 'technique', 'autre'], 'Difficulté'),
   retry: choose(input.retry, Object.keys(retryLabels), 'Résultat au second essai'),
   suggestion: text(input.suggestion, 300, 'Proposition')
  };
  const results = Object.fromEntries(Object.keys(checks).map(key =>
   [key, choose(input.results?.[key], Object.keys(outcomes), checks[key])]));
  if (Object.values(results).every(value => value === 'non-essaye')) throw Error('Renseignez au moins un contrôle essayé.');
  return {
   ...common, results,
   platform: choose(input.platform, ['Android', 'iPhone'], 'Plateforme'),
   device: text(input.device, 100, 'Modèle et versions', true),
   opening: choose(input.opening, ['onglet', 'icone'], 'Mode d’ouverture'),
   network: choose(input.network, ['mixte', 'en-ligne', 'avion'], 'Mode réseau'),
   address: text(input.address, 180, 'Adresse', true)
  };
 }
 function readExport(payload) {
  if (payload?.format !== 'klassia-pilot' || payload.version !== 1 ||
      !Array.isArray(payload.records) || payload.records.length > maxRecords) throw Error('Fichier de relevés Klassia invalide.');
  return payload.records.map(normalizeRecord);
 }
 function additions(current, incoming) {
  const known = new Map(current.map(record => [record.id, record]));
  const next = [];
  for (const record of incoming) {
   if (known.has(record.id)) {
    if (JSON.stringify(known.get(record.id)) !== JSON.stringify(record)) throw Error('Deux relevés différents utilisent le même identifiant.');
   } else {
    known.set(record.id, record);
    next.push(record);
   }
  }
  if (known.size > maxRecords) throw Error('Le carnet contient déjà le maximum de 500 relevés. Exportez-les avant de libérer de la place.');
  return next;
 }
 function summarize(records) {
  const groups = new Map();
  for (const record of records) {
   if (record.kind !== 'observation' || record.cause === 'technique') continue;
   const { grade, lesson, exercise, edition, session, help } = record;
   const key = JSON.stringify([grade, lesson, exercise, edition]);
   if (!groups.has(key)) groups.set(key, { grade, lesson, exercise, edition, sessions: new Set(), help: new Set() });
   const group = groups.get(key);
   group.sessions.add(session);
   if (help === 'guidage' || help === 'bloque') group.help.add(session);
  }
  return [...groups.values()].map(group => ({
   ...group, sessions: group.sessions.size, help: group.help.size
  })).sort((a, b) => b.help - a.help || a.lesson.localeCompare(b.lesson) || a.exercise.localeCompare(b.exercise));
 }

 function openNotebook() {
  return new Promise((resolve, reject) => {
   const request = indexedDB.open('klassia-pilot', 1);
   request.onupgradeneeded = () => request.result.createObjectStore('records', { keyPath: 'id' });
   request.onsuccess = () => resolve(request.result);
   request.onerror = () => reject(request.error);
  });
 }
 function transact(db, mode, work) {
  return new Promise((resolve, reject) => {
   const tx = db.transaction('records', mode);
   let result, error;
   tx.oncomplete = () => resolve(result);
   tx.onabort = () => reject(error || tx.error);
   work(tx.objectStore('records'), value => { result = value; }, cause => { error = cause; tx.abort(); });
  });
 }
 const readAll = db => transact(db, 'readonly', (store, done) => {
  const request = store.getAll();
  request.onsuccess = () => done(request.result);
 });
 const storeRecords = (db, records) => transact(db, 'readwrite', (store, done, fail) => {
  const request = store.getAll();
  request.onsuccess = () => {
   try {
    const next = additions(request.result, records);
    next.forEach(record => store.add(record));
    done(next.length);
   } catch (error) { fail(error); }
  };
 });

 function mount(doc) {
  const byId = id => doc.getElementById(id);
  const observation = byId('pilotObservation'), device = byId('pilotDevice');
  const groups = byId('pilotGroups'), summary = byId('pilotSummary'), reports = byId('pilotRecords');
  const exportButton = byId('pilotExport'), importInput = byId('pilotImport'), status = byId('pilotStatus');
  const element = (name, content) => {
   const node = doc.createElement(name);
   node.textContent = content;
   return node;
  };
  for (const [key, description] of Object.entries(checks)) {
   const label = element('label', description);
   const select = doc.createElement('select');
   select.name = key;
   select.append(...Object.entries(outcomes).map(([id, name]) => new Option(name, id)));
   label.append(select);
   byId('pilotChecks').append(label);
  }
  const params = new URLSearchParams(location.search);
  for (const [name, value, valid] of [
   ['grade', params.get('classe'), value => grades.includes(value)],
   ['lesson', params.get('lecon'), value => lessonPattern.test(value)],
   ['exercise', params.get('exercice'), value => exercisePattern.test(value)]
  ]) if (value && valid(value)) observation.elements[name].value = value;

  const opened = openNotebook();
  let busy = false;
  async function perform(action) {
   if (busy) return;
   busy = true;
   try {
    const db = await opened;
    status.textContent = await action(db) || '';
    draw(await readAll(db));
   } catch (error) {
    status.textContent = error?.message || 'Le carnet local est indisponible.';
   } finally { busy = false; }
  }
  function draw(records) {
   const totals = summarize(records);
   groups.replaceChildren(...totals.map(group => {
    const row = doc.createElement('tr');
    row.append(...[
     [group.grade, group.lesson, group.exercise].join(' · '), group.edition,
     group.sessions, group.help, group.help >= 2 ? 'À reprendre' : 'À suivre'
    ].map(value => element('td', value)));
    return row;
   }));
   groups.closest('.pilot-table').hidden = totals.length === 0;
   const phones = records.filter(record => record.kind === 'appareil').length;
   const technical = records.filter(record => record.cause === 'technique' ||
    (record.kind === 'appareil' && Object.values(record.results).includes('a-reprendre'))).length;
   summary.textContent = records.length
    ? `${records.length - phones} observation(s) · ${phones} essai(s) téléphone · ${technical} relevé(s) technique(s) à reprendre.`
    : 'Aucun relevé saisi.';
   reports.replaceChildren(...records.slice().sort((a, b) => b.day.localeCompare(a.day)).map(record => {
    const item = doc.createElement('li');
    const heading = [record.session, record.edition, record.day].join(' · ');
    const details = record.kind === 'observation'
     ? [record.actor, record.grade, record.lesson, record.exercise, helpLabels[record.help],
      'Difficulté ' + record.cause, 'Second essai ' + retryLabels[record.retry], record.note, record.suggestion].filter(Boolean)
     : [record.platform, record.device, record.opening, record.network, record.address,
      ...Object.entries(record.results).map(([key, value]) => checks[key] + ' — ' + outcomes[value]), record.note].filter(Boolean);
    const remove = element('button', 'Supprimer ce relevé');
    remove.type = 'button';
    remove.dataset.record = record.id;
    item.append(element('strong', heading), element('p', details.join(' · ')), remove);
    return item;
   }));
   exportButton.disabled = records.length === 0;
  }
  function saveForm(form, kind) {
   form.addEventListener('submit', event => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(form));
    perform(async db => {
     const id = Array.from(crypto.getRandomValues(new Uint8Array(16)), value => value.toString(16).padStart(2, '0')).join('');
     const now = new Date();
     const day = [now.getFullYear(), now.getMonth() + 1, now.getDate()].map(value => String(value).padStart(2, '0')).join('-');
     const record = normalizeRecord({ ...values, id, kind, day, address: new URL('.', location.href).href,
      results: Object.fromEntries(Object.keys(checks).map(key => [key, values[key]])) });
     await storeRecords(db, [record]);
     form.elements.note.value = '';
     if (form.elements.suggestion) form.elements.suggestion.value = '';
     return 'Relevé conservé sur cet appareil.';
    });
   });
  }
  saveForm(observation, 'observation');
  saveForm(device, 'appareil');
  reports.addEventListener('click', event => {
   const id = event.target.dataset.record;
   if (id && confirm('Supprimer ce relevé du carnet local ?')) perform(async db => {
    await transact(db, 'readwrite', store => store.delete(id));
    return 'Relevé supprimé.';
   });
  });
  exportButton.onclick = () => perform(async db => {
   const records = await readAll(db);
   const url = URL.createObjectURL(new Blob([JSON.stringify({ format: 'klassia-pilot', version: 1, records }, null, 2)], { type: 'application/json' }));
   const link = doc.createElement('a');
   link.href = url;
   link.download = 'klassia-releves-pilote.json';
   link.click();
   setTimeout(() => URL.revokeObjectURL(url), 30_000);
   return 'Export préparé.';
  });
  importInput.onchange = () => {
   const file = importInput.files[0];
   importInput.value = '';
   if (!file) return;
   perform(async db => {
    if (file.size > 2_000_000) throw Error('Fichier trop volumineux pour le carnet.');
    let payload;
    try { payload = JSON.parse(await file.text()); } catch { throw Error('Fichier JSON illisible.'); }
    const count = await storeRecords(db, readExport(payload));
    return `${count} relevé(s) ajouté(s). Les relevés déjà présents sont comptés une seule fois.`;
   });
  };
  perform(() => '');
 }

 return { normalizeRecord, readExport, additions, summarize, mount };
});
