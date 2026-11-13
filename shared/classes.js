/* Registre unique des classes (ADR-014, étape M1 du moteur unique).
   Tout ce qu'un moteur ou un module partagé doit savoir d'une classe se lit ici : dossier, catalogue, clés de
   progression, routes d'accueil, fonctions offertes. Ajouter une classe = ajouter une entrée, sans toucher aux moteurs. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Klassia = Object.assign(root.Klassia || {}, api);
})(typeof window === 'object' ? window : globalThis, function () {
  'use strict';
  // engine : moteur de rendu, le même pour toutes les classes (« lessons », shared/learning-app.js ; voir docs/MOTEUR_UNIQUE.md).
  // format : forme des données quand elle diffère de celle du moteur (CE2 : unités par matière, lues par un adaptateur ;
  // maternelle : thèmes et activités, rendus par shared/nursery.js avec leur habillage propre).
  // dir : dossier servi ; catalog : chemin depuis la racine ; group : nom de la liste du catalogue (unités ou thèmes).
  const classes = [
    {grade: 'MS', label: 'Moyenne section', twin: 'Nursery One', engine: 'lessons', format: 'nursery', dir: 'ms/', catalog: 'ms/data/catalog-v13.json', group: 'themes',
      progressKey: 'klassia_ms_progress_v2', home: ['', '#home'], overview: '#themes', week: false, revise: false, review: false},
    {grade: 'GS', label: 'Grande section', twin: 'Nursery Two', engine: 'lessons', format: 'nursery', dir: 'gs/', catalog: 'gs/data/catalog-v13.json', group: 'themes',
      progressKey: 'klassia_gs_progress_v2', home: ['', '#home'], overview: '#themes', week: false, revise: false, review: false},
    {grade: 'SIL', label: 'SIL', twin: 'Class 1', engine: 'lessons', dir: 'sil/', catalog: 'sil/data/curriculum.json', group: 'units',
      progressKey: 'klassia_sil_progress_v1', home: ['', '#home'], overview: '#units', week: true, revise: false, review: true, guided: true},
    {grade: 'CE1', label: 'CE1', twin: 'Class 3', engine: 'lessons', dir: 'ce1/', catalog: 'ce1/data/catalog.json', group: 'units',
      progressKey: 'klassia_ce1_progress_v1', qcm: 'ce1/data/qcm.json', home: ['', '#home'], overview: '#units', week: true, revise: true, review: true},
    // status : noms sous lesquels la progression du CE2 est enregistrée depuis l'origine.
    {grade: 'CE2', label: 'CE2', twin: 'Class 4', engine: 'lessons', format: 'ce2', dir: '', catalog: 'data/catalog.json', group: 'units',
      progressKey: 'klassia_progress', status: {A: 'MAITRISEE', EC: 'EN_COURS', R: 'A_REVOIR'}, home: ['', '#home'], overview: '#units', week: true, revise: true, review: true},
    // Piste anglophone (ADR-013, ADR-017) : language « en » traduit l'interface (shared/i18n.js) ; domains: false, le programme ne
    // groupe pas les matières en domaines et le parcours « Par domaine » n'est pas proposé ; subsystem situe la classe pour l'accueil.
    {grade: 'CLASS1', label: 'Class 1', twin: 'SIL', engine: 'lessons', dir: 'class1/', catalog: 'class1/data/catalog.json', group: 'units',
      language: 'en', subsystem: 'anglophone', progressKey: 'klassia_class1_progress_v1', home: ['', '#home'], overview: '#units', week: true, revise: false, review: true, domains: false},
    {grade: 'CLASS3', label: 'Class 3', twin: 'CE1', engine: 'lessons', dir: 'class3/', catalog: 'class3/data/catalog.json', group: 'units',
      language: 'en', subsystem: 'anglophone', progressKey: 'klassia_class3_progress_v1', home: ['', '#home'], overview: '#units', week: true, revise: false, review: true, domains: false},
    {grade: 'CLASS4', label: 'Class 4', twin: 'CE2', engine: 'lessons', dir: 'class4/', catalog: 'class4/data/catalog.json', group: 'units',
      language: 'en', subsystem: 'anglophone', progressKey: 'klassia_class4_progress_v1', home: ['', '#home'], overview: '#units', week: true, revise: false, review: true, domains: false}
  ];
  // Classes servies à leur adresse pour la relecture mais pas encore proposées aux familles (accueil, sélecteur, hors connexion,
  // recherche). Vide depuis ADR-018 : un contenu en relecture est proposé, avec une mention visible.
  const upcoming = [];
  const all = [...classes, ...upcoming];
  const byGrade = Object.fromEntries(all.map(c => [c.grade, c]));
  const classInfo = grade => byGrade[grade] || null;
  const nursery = grade => byGrade[grade]?.format === 'nursery';
  // Classe de la page ouverte, d'après son dossier ; la racine est la classe sans dossier (CE2).
  function currentClass(pathname) {
    const path = pathname ?? (typeof location === 'object' ? location.pathname : '/');
    const inDir = dir => new RegExp('/' + dir.slice(0, -1) + '(?:/|/index\\.html)$').test(path);
    const hit = all.find(c => c.dir && inDir(c.dir));
    return hit || classes.find(c => c.dir === '');
  }
  // Chemin d'une ressource de la classe vu depuis sa propre page (« ./data/… »).
  const local = (c, path) => './' + path.slice(c.dir.length);
  // La page ouverte est-elle dans un dossier de classe ? Sert à trouver la racine de l'application.
  function inClassFolder(pathname) {
    const path = pathname ?? (typeof location === 'object' ? location.pathname : '/');
    return all.some(c => c.dir && new RegExp('/' + c.dir.slice(0, -1) + '(?:/|/index\\.html)$').test(path));
  }
  return {classes, upcoming, classInfo, currentClass, inClassFolder, isNurseryClass: nursery, classLocalPath: local};
});
