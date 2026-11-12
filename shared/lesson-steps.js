/* Affichage d'une ressource en quatre étapes (ADR-014, M2 et M3), commun à tous les moteurs.
   Le conteneur porte data-steps (« one » : une étape à la fois ; « all » : toute la leçon) ; le choix est gardé dans le profil. */
(function (K) {
 'use strict';
 const KEY = 'klassia_lesson_view_v1';
 const mode = () => (K.read(KEY, 'one') === 'all' ? 'all' : 'one');
 // steps : [{id, html}] dans l'ordre de K.lessonModel.STEPS ; renvoie la barre d'étapes et les sections.
 function html(steps, en) {
  const info = id => K.lessonModel.STEPS.find(x => x.id === id), name = x => (en ? x.en : x.fr), list = steps.map(s => ({...info(s.id), html: s.html})), all = mode() === 'all';
  const nav = `<nav class="lesson-steps" aria-label="${en ? 'Lesson steps' : 'Étapes de la leçon'}"><ol>${list.map((x, k) => `<li><button type="button" data-step-go="${x.id}" aria-current="${k === 0 ? 'step' : 'false'}"><span aria-hidden="true">${x.icon}</span> ${k + 1}. ${name(x)}</button></li>`).join('')}</ol><button type="button" class="lesson-steps-all" data-steps-all aria-pressed="${all}">${en ? 'Whole lesson' : 'Toute la leçon'}</button></nav>`;
  const body = list.map((x, k) => `<section class="lesson-step" data-step="${x.id}" ${k === 0 ? 'data-current' : ''} aria-labelledby="step-${x.id}"><h2 class="lesson-step-title" id="step-${x.id}" tabindex="-1"><span aria-hidden="true">${x.icon}</span> ${name(x)}</h2>${x.html}${k < list.length - 1 ? `<button type="button" class="lesson-step-next" data-step-go="${list[k + 1].id}">${en ? 'Next step' : 'Étape suivante'} : ${name(list[k + 1])} ›</button>` : ''}</section>`).join('');
  return {nav, body, mode: mode()};
 }
 function show(card, stepId, focus) {
  if (!card) return;
  card.querySelectorAll('.lesson-step[data-step]').forEach(x => x.toggleAttribute('data-current', x.dataset.step === stepId));
  card.querySelectorAll('.lesson-steps [data-step-go]').forEach(b => b.setAttribute('aria-current', b.dataset.stepGo === stepId ? 'step' : 'false'));
  if (focus && card.dataset.steps === 'one') { card.querySelector(`#step-${stepId}`)?.focus({preventScroll: true}); card.querySelector('.lesson-steps')?.scrollIntoView({block: 'start'}); }
 }
 // Ouvre l'étape qui contient un élément (retour de l'écran enfant, lien vers un exercice).
 function reveal(el) { const step = el?.closest?.('.lesson-step[data-step]'); if (step && !step.hasAttribute('data-current')) show(step.closest('[data-steps]'), step.dataset.step, false); }
 function wire(card) {
  if (!card) return;
  card.addEventListener('click', ev => {
   const go = ev.target.closest('[data-step-go]');
   if (go) { show(card, go.dataset.stepGo, true); return; }
   const all = ev.target.closest('[data-steps-all]');
   if (all) { const on = card.dataset.steps !== 'all'; card.dataset.steps = on ? 'all' : 'one'; all.setAttribute('aria-pressed', String(on)); K.write(KEY, on ? 'all' : 'one'); }
  });
 }
 K.lessonSteps = {KEY, mode, html, show, reveal, wire};
})(window.Klassia);
