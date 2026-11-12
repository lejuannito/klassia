/* Registre unique des classes (ADR-014, étape M1 du moteur unique).
   Tout ce qu'un moteur ou un module partagé doit savoir d'une classe se lit ici : dossier, catalogue, clés de
   progression, routes d'accueil, fonctions offertes. Ajouter une classe = ajouter une entrée, sans toucher aux moteurs. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Klassia = Object.assign(root.Klassia || {}, api);
})(typeof window === 'object' ? window : globalThis, function () {
  'use strict';
  // engine : rendu actuel de la classe ; les trois valeurs convergent vers « lessons » (voir docs/MOTEUR_UNIQUE.md).
  // dir : dossier servi ; catalog : chemin depuis la racine ; group : nom de la liste du catalogue (unités ou thèmes).
  const classes = [
    {grade: 'MS', label: 'Moyenne section', twin: 'Nursery One', engine: 'activities', dir: 'ms/', catalog: 'ms/data/catalog-v13.json', group: 'themes',
      progressKey: 'klassia_ms_progress_v2', home: ['', '#home'], overview: '#themes', week: false, revise: false, review: false},
    {grade: 'GS', label: 'Grande section', twin: 'Nursery Two', engine: 'activities', dir: 'gs/', catalog: 'gs/data/catalog-v13.json', group: 'themes',
      progressKey: 'klassia_gs_progress_v2', home: ['', '#home'], overview: '#themes', week: false, revise: false, review: false},
    {grade: 'SIL', label: 'SIL', twin: 'Class 1', engine: 'lessons', dir: 'sil/', catalog: 'sil/data/curriculum.json', group: 'units',
      progressKey: 'klassia_sil_progress_v1', home: ['', '#home', '#units'], overview: '#units', week: true, revise: false, review: true, guided: true},
    {grade: 'CE1', label: 'CE1', twin: 'Class 3', engine: 'lessons', dir: 'ce1/', catalog: 'ce1/data/catalog.json', group: 'units',
      progressKey: 'klassia_ce1_progress_v1', qcm: 'ce1/data/qcm.json', home: ['', '#home', '#units'], overview: '#units', week: true, revise: true, review: true},
    {grade: 'CE2', label: 'CE2', twin: 'Class 4', engine: 'ce2', dir: '', catalog: 'data/catalog.json', group: 'units',
      progressKey: 'klassia_progress', home: ['', '#home', '#learn', '#units'], overview: '#units', week: true, revise: false, review: true}
  ];
  const byGrade = Object.fromEntries(classes.map(c => [c.grade, c]));
  const classInfo = grade => byGrade[grade] || null;
  const nursery = grade => byGrade[grade]?.engine === 'activities';
  // Classe de la page ouverte, d'après son dossier ; la racine est la classe sans dossier (CE2).
  function currentClass(pathname) {
    const path = pathname ?? (typeof location === 'object' ? location.pathname : '/');
    const hit = classes.find(c => c.dir && new RegExp('/' + c.dir.slice(0, -1) + '(?:/|/index\\.html)$').test(path));
    return hit || classes.find(c => c.dir === '');
  }
  // Chemin d'une ressource de la classe vu depuis sa propre page (« ./data/… »).
  const local = (c, path) => './' + path.slice(c.dir.length);
  return {classes, classInfo, currentClass, isNurseryClass: nursery, classLocalPath: local};
});
