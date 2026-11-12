/* Lot 8a: the language of the home. A parent records everyday words in the family's language;
   the child listens and finds the matching picture. Audio stays on this device (IndexedDB),
   per profile; nothing is sent anywhere and nothing is included in the JSON backup. */
(function (K) {
 'use strict';
 const E = K.escape;
 // Lot 8c : les mots viennent des notions communes (data/lcn-concepts.json, via shared/lcn.js). Les 29 mots du quotidien
 // gardent leurs identifiants ; les autres sont les mots des leçons de langue nationale.
 let THEMES = [], WORDS = [];
 const daily = () => WORDS.filter(w => w.daily), lessonWords = () => WORDS.filter(w => !w.daily);
 const LANG_KEY = 'klassia_home_language_v1', TEXT_KEY = 'klassia_home_words_v1', MAX_MS = 6000;
 const supported = () => Boolean(navigator.mediaDevices?.getUserMedia && window.MediaRecorder && window.indexedDB);
 const profileId = () => K.profile().id;
 const keyOf = id => profileId() + ':' + id;
 let db, urls = {}, takes = new Set(), session = null;

 function open() {
  return db ? Promise.resolve(db) : new Promise((resolve, reject) => {
   const request = indexedDB.open('klassia-home-language', 1);
   request.onupgradeneeded = () => request.result.createObjectStore('takes');
   request.onsuccess = () => resolve(db = request.result);
   request.onerror = () => reject(request.error);
  });
 }
 function tx(mode, run) {
  return open().then(d => new Promise((resolve, reject) => {
   const t = d.transaction('takes', mode), r = run(t.objectStore('takes'));
   t.oncomplete = () => resolve(r?.result); t.onerror = () => reject(t.error);
  }));
 }
 async function load() {
  Object.values(urls).forEach(URL.revokeObjectURL); urls = {}; takes = new Set();
  if (!window.indexedDB) return;
  const prefix = profileId() + ':';
  const keys = await tx('readonly', s => s.getAllKeys());
  for (const key of keys || []) if (String(key).startsWith(prefix)) {
   const id = String(key).slice(prefix.length), blob = await tx('readonly', s => s.get(key));
   if (blob) { takes.add(id); urls[id] = URL.createObjectURL(blob); }
  }
 }
 const langName = () => K.read(LANG_KEY, {}).name || '';
 const written = () => K.read(TEXT_KEY, {});
 const status = text => { const el = document.querySelector('[data-home-status]'); if (el) el.textContent = text; };

 function wordCard(w) {
  const has = takes.has(w.id), text = written()[w.id] || '';
  return `<li class="home-word" data-word="${w.id}"><span class="home-word-icon" aria-hidden="true">${w.icon}</span>
   <span class="home-word-name"><strong>${E(w.fr)}</strong> <span lang="en">${E(w.en)}</span></span>
   <span class="home-word-actions">${has ? `<audio controls preload="none" src="${urls[w.id]}" aria-label="Écouter « ${E(w.fr)} »"></audio>` : ''}
    <button type="button" data-record="${w.id}">${has ? '🎙️ Refaire' : '🎙️ Enregistrer'}</button>${has ? `<button type="button" data-delete="${w.id}">Effacer</button>` : ''}</span>
   <label class="home-word-written">Écrit dans la langue (facultatif) <input data-written="${w.id}" value="${E(text)}" maxlength="60" autocomplete="off"></label></li>`;
 }
 function render() {
  const main = document.querySelector('[data-home-language]'); if (!main) return;
  const name = langName(), count = daily().filter(w => takes.has(w.id)).length, extra = lessonWords().filter(w => takes.has(w.id)).length;
  const groups = list => THEMES.map(t => [t, list.filter(w => w.theme === t.id)]).filter(([, words]) => words.length)
   .map(([t, words]) => `<h3>${E(t.fr)} <span lang="en">· ${E(t.en)}</span></h3><ul class="home-words">${words.map(wordCard).join('')}</ul>`).join('');
  main.innerHTML = `<section class="gs-card"><h2>La langue de la famille</h2>
   <form data-home-name class="home-name"><label>Nom de la langue parlée à la maison <input name="name" value="${E(name)}" placeholder="par exemple : bassa, ewondo, duala, fulfulde…" maxlength="40" required></label> <button type="submit">Enregistrer le nom</button></form>
   <p>${name ? `Langue choisie : <strong>${E(name)}</strong>. ` : ''}${count} mot${count > 1 ? 's' : ''} enregistré${count > 1 ? 's' : ''} sur ${daily().length} mots du quotidien${extra ? `, et ${extra} sur ${lessonWords().length} mots des leçons` : ''}.</p>
   <p class="home-privacy">Les enregistrements restent sur cet appareil, dans le profil de l’enfant. Ils ne sont ni envoyés, ni inclus dans la sauvegarde.</p>
   ${supported() ? '' : '<p class="home-warning">L’enregistrement n’est pas possible dans ce navigateur : essayez Chrome à jour.</p>'}
   <p role="status" data-home-status></p></section>
   <section class="gs-card" id="ecouter"><h2>Écouter et trouver</h2><div data-home-game>${game()}</div></section>
   <section class="gs-card" id="enregistrer"><h2>Pour l’adulte : enregistrer les mots</h2><p>Dites le mot une fois, clairement, comme vous le dites à la maison. L’enregistrement s’arrête seul après ${MAX_MS / 1000} secondes.</p>
   ${groups(daily())}
   <details class="home-lesson-words"><summary>Mots des leçons de l’école (${lessonWords().length})</summary><p>Ces mots reviennent dans les leçons de langue nationale de la classe. Enregistrés ici, ils apparaissent dans la leçon, sous les formes bassa proposées.</p>${groups(lessonWords())}</details></section>`;
 }

 let round = null;
 function game() {
  const recorded = WORDS.filter(w => takes.has(w.id));
  if (recorded.length < 3) return `<p>Il faut au moins trois mots enregistrés pour jouer. ${recorded.length ? `Encore ${3 - recorded.length}.` : 'Commencez par l’enregistrement ci-dessous.'}</p>`;
  const answer = recorded[Math.floor(Math.random() * recorded.length)];
  const others = WORDS.filter(w => w.id !== answer.id).sort(() => Math.random() - .5).slice(0, 2);
  const choices = [answer, ...others].sort(() => Math.random() - .5);
  round = { answer: answer.id };
  return `<p>Écoute le mot dans la langue de la maison, puis touche la bonne image.</p>
   <p><button type="button" data-play-round>▶ Écouter le mot</button></p>
   <div class="home-choices">${choices.map(w => `<button type="button" class="home-choice" data-choice="${w.id}"><span aria-hidden="true">${w.icon}</span>${E(w.fr)}</button>`).join('')}</div>
   <p role="status" data-home-result></p>`;
 }
 function playRound() { const url = round && urls[round.answer]; if (url) new Audio(url).play().catch(() => {}); }

 async function record(id) {
  if (session) return stop();
  if (!supported()) return status('Le micro est indisponible dans ce navigateur.');
  try {
   const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
   const recorder = new MediaRecorder(stream), chunks = [];
   session = { id, stream, recorder, timer: setTimeout(stop, MAX_MS) };
   recorder.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
   recorder.onstop = async () => {
    stream.getTracks().forEach(t => t.stop()); clearTimeout(session?.timer); session = null;
    const blob = new Blob(chunks, { type: chunks[0]?.type || recorder.mimeType });
    if (!blob.size) { status('Aucun son enregistré. Réessayez plus près du micro.'); return render(); }
    await tx('readwrite', s => s.put(blob, keyOf(id)));
    await load(); render(); status(`« ${WORDS.find(w => w.id === id).fr} » est enregistré.`);
   };
   recorder.start();
   const button = document.querySelector(`[data-record="${id}"]`); if (button) button.textContent = '⏹ Arrêter';
   status('Enregistrement en cours… parlez maintenant.');
  } catch (error) {
   session = null;
   status(error.name === 'NotAllowedError' ? 'Accès au micro refusé : autorisez le micro pour ce site dans le navigateur.' : 'Le micro n’a pas pu démarrer.');
  }
 }
 function stop() { if (session?.recorder.state === 'recording') session.recorder.stop(); }

 document.addEventListener('click', async e => {
  const t = e.target.closest('[data-record],[data-delete],[data-play-round],[data-choice],[data-next-round]'); if (!t) return;
  if (t.dataset.record) record(t.dataset.record);
  else if (t.dataset.delete) { await tx('readwrite', s => s.delete(keyOf(t.dataset.delete))); await load(); render(); status('Enregistrement effacé.'); }
  else if (t.hasAttribute('data-play-round')) playRound();
  else if (t.hasAttribute('data-next-round')) { document.querySelector('[data-home-game]').innerHTML = game(); }
  else if (t.dataset.choice && round) {
   const ok = t.dataset.choice === round.answer, result = document.querySelector('[data-home-result]');
   K.append('klassia_attempts', { kind: 'home_language', exercise: 'HOME:' + round.answer, ok });
   t.setAttribute('aria-pressed', 'true'); t.classList.toggle('is-right', ok); t.classList.toggle('is-wrong', !ok);
   result.innerHTML = ok ? 'Bravo ! <button type="button" data-next-round>Mot suivant</button>' : 'Écoute encore et essaie une autre image.';
   if (!ok) playRound();
  }
 });
 document.addEventListener('submit', e => {
  if (!e.target.matches('[data-home-name]')) return; e.preventDefault();
  K.write(LANG_KEY, { name: e.target.name.value.trim().slice(0, 40) }); render(); status('Nom de la langue enregistré.');
 });
 document.addEventListener('change', e => {
  const input = e.target.closest('[data-written]'); if (!input) return;
  const all = written(), v = input.value.trim().slice(0, 60);
  if (v) all[input.dataset.written] = v; else delete all[input.dataset.written];
  K.write(TEXT_KEY, all); status('Mot écrit enregistré.');
 });
 K.homeLanguage = { get words() { return WORDS; }, reload: () => load().then(render) };
 K.Lcn.load().then(data => { THEMES = data.themes; WORDS = data.concepts; })
  .then(load).catch(() => {}).then(() => WORDS.length ? render() : document.querySelector('[data-home-language]')?.insertAdjacentHTML('afterbegin', '<p class="home-warning">La liste des mots n’a pas pu être chargée. Rechargez la page avec la connexion.</p>'));
})(window.Klassia);
