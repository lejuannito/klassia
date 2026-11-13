/* Encouragements sobres : une étoile par ressource réalisée, et les jours de suite où l'enfant a travaillé.
   Rien de nouveau n'est enregistré : tout se déduit de la progression et des journaux datés déjà présents. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Klassia = Object.assign(root.Klassia || {}, {encouragement: api});
})(typeof window === 'object' ? window : globalThis, function () {
  'use strict';
  const day = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  // Jours de suite : la série compte si l'enfant a travaillé aujourd'hui ou hier ; un jour manqué la remet à zéro sans message.
  function streak(dates, now = new Date()) {
    const days = new Set();
    for (const x of dates) { const d = new Date(x); if (!Number.isNaN(d.getTime())) days.add(day(d)); }
    const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate()), today = days.has(day(cursor));
    if (!today) cursor.setDate(cursor.getDate() - 1);
    let n = 0;
    while (days.has(day(cursor))) { n++; cursor.setDate(cursor.getDate() - 1); }
    return {days: n, today};
  }
  // Étoiles : ressources déclarées réalisées dans la classe (une clé de progression, ou une par thème en maternelle).
  function stars(info, read, groups = []) {
    const done = v => v === 'A' || v === 'MAITRISEE', count = key => Object.values(read(key, {}) || {}).filter(done).length;
    return info.format === 'nursery' ? groups.reduce((n, id) => n + count(info.progressKey + ':' + id), 0) : count(info.progressKey);
  }
  // Seuls les journaux de travail comptent (réponses, observations) ; ouvrir une page ne suffit pas.
  const logs = ['klassia_attempts', 'klassia_observations'];
  function summary(info, read, now = new Date(), groups = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8']) {
    const dates = logs.flatMap(k => (read(k, []) || []).map(x => x && (x.at || x.date || x.time)).filter(Boolean));
    return {stars: stars(info, read, groups), ...streak(dates, now)};
  }
  return {streak, stars, summary};
});
