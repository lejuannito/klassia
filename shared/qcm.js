/* Série de QCM (ADR-014, M3d) : un seul lecteur pour toutes les classes. Une question : {enonce, choix, bonne, corrige,
   methode?, lecon?}. Le lecteur affiche la série, corrige, propose la leçon à revoir et rend le score ; l'appelant garde
   l'en-tête de page et l'enregistrement du score. */
(function (K) {
 'use strict';
 const E = K.escape;
 const T = {
  fr: {submit:'Corriger la série', missing:'Réponds à chaque question avant de corriger la série.', right:'Juste ✓', wrong:'À revoir', method:'Méthode :', all:'Bravo !', some:'Lis les corrections, puis revois ces leçons.', review:'Leçons à revoir', key:'Corrigé adulte', shown:'Corrigé affiché pour l’adulte.', linked:'Leçon liée', unlinked:'Sans leçon précise'},
  en: {submit:'Check my answers', missing:'Answer every question first.', right:'Correct ✓', wrong:'Not yet', method:'Method:', all:'Well done!', some:'Read the feedback, then review these lessons.', review:'Lessons to review', key:'Answer key', shown:'Answer key shown for the adult.', linked:'Linked lesson', unlinked:'No specific lesson'}
 };
 // options : en, link(q) → {href, label} ou null, message(score, total) → phrase, onDone(score, total).
 function mount(container, questions, options = {}) {
  const t = T[options.en ? 'en' : 'fr'], link = q => options.link?.(q) || null, a = l => (l ? `<a href="${E(l.href)}">${E(l.label)}</a>` : '');
  container.innerHTML = `<form class="klassia-qcm" lang="${options.en ? 'en' : 'fr'}">${questions.map((q, i) => `<fieldset class="klassia-qcm-question"><legend>${i + 1}. ${E(q.enonce)}</legend>${K.shuffleOptions(q).map(o => `<label><input type="radio" name="q${i}" value="${o.id}"><span>${E(o.text)}</span></label>`).join('')}<p class="klassia-qcm-feedback" data-feedback="${i}" hidden></p></fieldset>`).join('')}<button type="submit">${t.submit}</button><div class="klassia-qcm-score" role="status"></div></form>`;
  const form = container.querySelector('.klassia-qcm'), out = form.querySelector('.klassia-qcm-score');
  const feedback = (i, ok, title, extra) => { const q = questions[i], box = form.querySelector(`[data-feedback="${i}"]`); box.hidden = false; box.dataset.ok = String(ok); box.innerHTML = `<b>${title}</b> ${E(q.corrige || '')}${q.methode ? ` <span class="klassia-qcm-method"><b>${t.method}</b> ${E(q.methode)}</span>` : ''}${extra}`; };
  form.onsubmit = ev => {
   ev.preventDefault();
   const picks = questions.map((q, i) => form.querySelector(`input[name="q${i}"]:checked`));
   if (picks.some(x => !x)) { out.textContent = t.missing; return; }
   let score = 0; const review = new Map();
   questions.forEach((q, i) => { const ok = Number(picks[i].value) === q.bonne, l = link(q); if (ok) score++; else if (l) review.set(l.href, l); feedback(i, ok, ok ? t.right : t.wrong, ok ? '' : ' ' + a(l)); });
   const total = questions.length;
   options.onDone?.(score, total);
   form.dispatchEvent(new CustomEvent('klassia:qcm-done', {bubbles: true, detail: {score, total}}));
   out.innerHTML = `<strong>${score}/${total}</strong> ${E(options.message ? options.message(score, total) : score === total ? t.all : t.some)}${review.size ? `<span class="klassia-qcm-review"><b>${t.review}</b>${[...review.values()].map(a).join('')}</span>` : ''}`;
  };
  return {
   // Corrigé pour l'adulte, sans enregistrer d'essai.
   preview() { questions.forEach((q, i) => { const l = link(q); feedback(i, false, t.key, ` <span class="muted">${q.lecon ? t.linked : t.unlinked}${l ? ' : ' + E(l.label) : ''}</span>`); }); out.textContent = t.shown; }
  };
 }
 K.qcm = {mount};
})(window.Klassia);
