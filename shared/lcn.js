/* Langues et cultures nationales, modèle multilingue (lot 8c, ADR-012).
   Une leçon de langue nationale vise des notions (la main, l'école, compter jusqu'à cinq…), pas une langue. Les notions
   communes sont dans data/lcn-concepts.json ; chacune renvoie aux formes bassa documentées (identifiants BA…) et aux mots
   que la famille enregistre dans « Langue de la maison » (maison.html), quelle que soit sa langue. Une leçon montre donc
   les formes bassa proposées, puis les mots de la famille pour les mêmes notions. Rien ne quitte l'appareil. */
(function (root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Klassia = Object.assign(root.Klassia || {}, {Lcn: api});
})(typeof window === 'object' ? window : globalThis, function (root) {
  'use strict';
  const LANG_KEY = 'klassia_home_language_v1', TEXT_KEY = 'klassia_home_words_v1';
  // Racine de l'application, d'après l'adresse de ce script (shared/lcn.js).
  const home = () => new URL('../', root.document?.querySelector('script[src*="shared/lcn.js"]')?.src || root.location?.href || 'http://localhost/');
  let loading = null;
  function load(get) {
    const fetchJson = get || (path => fetch(new URL(path, home())).then(r => { if (!r.ok) throw Error('Notions indisponibles'); return r.json(); }));
    if (!loading) loading = Promise.all([fetchJson('data/lcn-concepts.json'), fetchJson('data/bassa-lessons.json')])
      .then(([concepts, lessons]) => ({...concepts, lessons: lessons.lessons}))
      .catch(error => { loading = null; throw error; });
    return loading;
  }
  // Notions d'une leçon, dans l'ordre de ses mots bassa ; une notion n'apparaît qu'une fois.
  function conceptsFor(data, grade, lessonId) {
    const row = data.lessons[grade + ':' + lessonId];
    if (!row) return [];
    const byBassa = new Map();
    for (const c of data.concepts) for (const id of c.bassa || []) byBassa.set(id, c);
    return [...new Set(row.concept_ids.map(id => byBassa.get(id)).filter(Boolean))];
  }
  // Enregistrements de la famille (même base que maison.html : « klassia-home-language », magasin « takes »,
  // clé « profil:notion »). La base est créée avec le même schéma si elle n'existe pas encore.
  function familyTakes(profileId, ids) {
    if (!root.indexedDB) return Promise.resolve({});
    return new Promise(resolve => {
      const request = root.indexedDB.open('klassia-home-language', 1);
      request.onupgradeneeded = () => request.result.createObjectStore('takes');
      request.onerror = () => resolve({});
      request.onsuccess = () => {
        const db = request.result, out = {};
        try {
          const t = db.transaction('takes', 'readonly'), store = t.objectStore('takes');
          for (const id of ids) { const r = store.get(profileId + ':' + id); r.onsuccess = () => { if (r.result) out[id] = r.result; }; }
          t.oncomplete = () => { db.close(); resolve(out); };
          t.onerror = () => { db.close(); resolve({}); };
        } catch { db.close(); resolve({}); }
      };
    });
  }
  // Panneau « Dans la langue de la maison », placé après l'élément donné (le volet bassa de la leçon).
  async function mount(after, grade, lessonId) {
    const K = root.Klassia, E = K.escape;
    if (!after?.parentElement || after.parentElement.querySelector(':scope > .lcn-home')) return;
    let data;
    try { data = await load(); } catch { return; }
    const concepts = conceptsFor(data, grade, lessonId);
    if (!concepts.length || !after.isConnected) return;
    const name = K.read(LANG_KEY, {})?.name || '', written = K.read(TEXT_KEY, {}) || {};
    const takes = await familyTakes(K.profile().id, concepts.map(c => c.id));
    if (!after.isConnected || after.parentElement.querySelector(':scope > .lcn-home')) return;
    const recorded = concepts.filter(c => takes[c.id]).length;
    const section = root.document.createElement('section');
    section.className = 'lcn-home';
    section.setAttribute('aria-label', 'Dans la langue de la maison');
    const link = new URL('maison.html#enregistrer', home()).href;
    section.innerHTML = `<h2>Dans la langue de la maison${name ? ' : ' + E(name) : ''}</h2>`
      + (recorded
        ? `<p>Les mots de cette leçon enregistrés par ta famille. Écoute-les, puis redis-les.</p>`
        : `<p>Votre famille parle ${name ? E(name) : 'une autre langue'} ? Enregistrez ces mots dans « Langue de la maison » : ils apparaîtront ici, dans cette leçon.</p>`)
      + `<ul class="lcn-words">${concepts.map(c => `<li data-concept="${E(c.id)}"><span aria-hidden="true">${c.icon}</span> <b>${E(c.fr)}</b>${written[c.id] ? ` <span class="lcn-written">${E(written[c.id])}</span>` : ''}${takes[c.id] ? ` <audio controls preload="none" aria-label="Écouter « ${E(c.fr)} » dans la langue de la maison"></audio>` : ' <span class="lcn-missing">pas encore enregistré</span>'}</li>`).join('')}</ul>`
      + `<p>${recorded} ${recorded > 1 ? 'mots enregistrés' : 'mot enregistré'} sur ${concepts.length}. <a href="${E(link)}">Enregistrer les mots de la maison</a></p>`;
    for (const audio of section.querySelectorAll('audio')) audio.src = URL.createObjectURL(takes[audio.closest('[data-concept]').dataset.concept]);
    after.after(section);
  }
  return {load, conceptsFor, familyTakes, mount};
});
