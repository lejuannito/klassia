/* Modèle commun de ressource (ADR-014, étape M2 du moteur unique).
   Les trois formats de données (leçon SIL/CE1, leçon CE2, activité de maternelle) se lisent ici dans une même forme,
   rangée en quatre étapes : Je découvre, Je retiens, Je m'exerce, Je fais le point.
   Les adaptateurs ne transforment pas les données : ils les rangent. Les fichiers JSON ne changent pas. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Klassia = Object.assign(root.Klassia || {}, {lessonModel: api});
})(typeof window === 'object' ? window : globalThis, function () {
  'use strict';
  const STEPS = [
    {id: 'decouvrir', fr: 'Je découvre', en: 'Discover', icon: '👀'},
    {id: 'retenir', fr: 'Je retiens', en: 'Remember', icon: '💡'},
    {id: 'exercer', fr: 'Je m’exerce', en: 'Practise', icon: '✍️'},
    {id: 'point', fr: 'Je fais le point', en: 'How did I do?', icon: '✅'}
  ];
  const list = x => (Array.isArray(x) ? x : x ? [x] : []).filter(Boolean);
  const text = x => (typeof x === 'string' ? x.trim() : '');
  // Leçon SIL ou CE1 (shared/learning-app.js).
  function fromLesson(l) {
    return {
      kind: 'lesson', id: l.id, title: l.title, goals: list(l.objective), english: String(l.domain || '').startsWith('English'),
      discover: {before: text(l.prerequisites), support: l.support || null, example: text(l.model)},
      retain: {paragraphs: list(text(l.course)), takeaway: ''},
      practise: {together: text(l.guided), task: {prompt: text(l.exercise), answer: text(l.answer)}, items: list(l.practice)},
      review: {help: text(l.remediation), transfer: text(l.transfer), materials: text(l.materials), source: l.source || null, editorial: l.editorial || null}
    };
  }
  // Leçon CE2 (app.js) : « Je découvre », « Je comprends » et « Je retiens », « J'expérimente » et « Je m'exerce », suivi.
  function fromCE2(l) {
    return {
      kind: 'lesson', id: l.id, title: l.title, goals: list(l.objectives), english: /^EN-/.test(l.id),
      discover: {before: '', support: l.figure ? {figure: l.figure} : null, example: text(l.discover)},
      retain: {paragraphs: list(l.learn).map(text).filter(Boolean), takeaway: text(l.takeaway), manual: l.manual_sections || null},
      practise: {together: list(l.practical).map(text).join('\n'), task: null, items: list(l.exercises)},
      review: {help: text(l.teacher_guide?.remediation || ''), transfer: '', materials: '', source: l.source || null, editorial: l.editorial || null}
    };
  }
  // Activité de maternelle (ms/app-ui-v13.js) ; « en » choisit la langue de la consigne.
  function fromActivity(a, en = false) {
    const pick = k => text(en ? a[k + '_en'] : a[k + '_fr']) || text(a[k + '_fr']);
    const steps = list(en ? a.steps_en : a.steps_fr), questions = list(a.questions);
    return {
      kind: 'activity', id: a.id, title: pick('title'), goals: list(pick('goal')), english: Boolean(en),
      discover: {before: '', support: a.visual || a.figure ? {visual: a.visual || null, figure: a.figure || null} : null, example: pick('story') || pick('prompt')},
      retain: {paragraphs: list(pick('goal')), takeaway: ''},
      practise: {together: pick('activity') || pick('game'), task: {prompt: pick('prompt'), answer: ''}, items: [...steps, ...questions]},
      review: {help: text(a.teacher_guide?.adaptation || ''), transfer: text(a.teacher_guide?.follow_up || ''), materials: list(en ? a.materials_en : a.materials).join(', '),
        observe: list(en ? a.observe_en : a.observe), source: a.source_refs || null, editorial: a.editorial || null}
    };
  }
  // Une étape est remplie si elle a quelque chose à montrer ; « Je fais le point » l'est toujours (suivi de l'enfant).
  function filled(m) {
    const d = m.discover, r = m.retain, p = m.practise;
    return {
      decouvrir: Boolean(m.goals.length || d.before || d.support || d.example),
      retenir: Boolean(r.paragraphs.length || r.takeaway),
      exercer: Boolean(p.together || p.task?.prompt || p.items.length),
      point: true
    };
  }
  // Bilan d'une ressource d'après le journal (klassia_attempts) : clés égales au préfixe ou qui le prolongent (« …:entrainement:2 »).
  // Seule la dernière trace de chaque exercice compte ; réponses vérifiées et auto-évaluations sont comptées à part.
  function attemptsSummary(attempts, prefix) {
    const checked = new Map(), self = new Map();
    for (const a of attempts || []) {
      const key = a && typeof a.exercise === 'string' ? a.exercise : '';
      if (key !== prefix && !key.startsWith(prefix + ':')) continue;
      (a.kind === 'self_report' ? self : checked).set(key, Boolean(a.ok));
    }
    const count = m => [...m.values()].filter(Boolean).length;
    return {checked: checked.size, right: count(checked), self: self.size, selfOk: count(self)};
  }
  return {STEPS, fromLesson, fromCE2, fromActivity, filled, attemptsSummary};
});
