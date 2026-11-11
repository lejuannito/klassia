(() => {
'use strict';
const K = Klassia, E = K.escape;
const labels = {
 fr: {write:'Ma réponse',submit:'Valider ma tentative',oral:'J’ai répondu à l’oral ou sur papier',guide:'Écris ta réponse ou confirme ton essai à l’oral ou sur papier.',inkGuide:'Écris ta réponse ou confirme ton essai à l’oral, sur papier ou au doigt.',inkAttempt:'J’ai répondu à l’oral, sur papier ou au doigt',nursery:'Réponds en parlant, en montrant ou en manipulant. L’adulte confirme l’essai.',confirm:'Confirmer l’essai / Confirm attempt',ready:'Tu peux maintenant ouvrir la correction.',empty:'Écris une réponse avant de valider.',show:'Voir la correction',hide:'Masquer la correction',adult:'Voir le corrigé adulte',
  correct:'Bonne réponse ! Tu peux ouvrir la correction pour relire l’explication.',wrong:'Pas encore. Relis la question et essaie encore, ou ouvre la correction.',number:'Ton nombre est juste. Vérifie l’unité ou ta phrase en ouvrant la correction.',unknown:'Klassia ne sait pas vérifier cette réponse toute seule. Compare-la avec la correction.'},
 en: {write:'My answer',submit:'Submit my attempt',oral:'I answered aloud or on paper',guide:'Write your answer or confirm that you tried aloud or on paper.',inkGuide:'Type your answer or confirm that you tried aloud, on paper or by drawing.',inkAttempt:'I tried aloud, on paper or by drawing',ready:'You can now open the feedback.',empty:'Write an answer before submitting.',show:'Show feedback',hide:'Hide feedback',adult:'Show adult answer guide',
  correct:'Correct! You can open the feedback to read the explanation.',wrong:'Not yet. Read the question again and try again, or open the feedback.',number:'Your number is right. Check the unit or your sentence in the feedback.',unknown:'Klassia cannot check this answer on its own. Compare it with the feedback.'}
};

// check: {accept, reject, prompt} for short answers; record: key sent with the klassia:answer-checked event.
function html(id, answerHtml, {en=false,nursery=false,ink=false,inputId=id+'_response',rows=2,maxLength=1000,check=null,record=''}={}) {
 const lang = en ? 'en' : 'fr', t = labels[lang], adult = K.isAdultSpace();
 const reveal = adult ? t.adult : t.show;
 const instruction = ink ? t.inkGuide : t.guide;
 const attempt = ink ? t.inkAttempt : t.oral;
 const entry = nursery ? '' : `<label for="${E(inputId)}">${t.write}</label><textarea id="${E(inputId)}" rows="${rows}" maxlength="${maxLength}" autocomplete="off"></textarea>`;
 const checked = check && !nursery && !adult ? ` data-check="${E(JSON.stringify(check))}" data-record="${E(record)}"` : '';
 return `<div class="answer-reveal" data-correction="${lang}" lang="${lang}"${checked}>
  ${adult?'':`<form data-attempt-form>
   <p class="attempt-guide">${nursery?t.nursery:instruction}</p>${entry}
   <div class="attempt-actions">
    ${nursery?'':`<button type="submit">${t.submit}</button>`}
    <button type="button" data-attempt-oral>${nursery?t.confirm:attempt}</button>
   </div>
   <p class="attempt-status" role="status"></p>
  </form>`}
  <button type="button" class="correction-toggle" aria-expanded="false" aria-controls="${E(id)}" ${adult?'':'disabled'}>${reveal}</button>
  <div id="${E(id)}" class="correction-body feedback" hidden></div>
  <template>${answerHtml}</template>
 </div>`;
}

function accept(panel, verdict = '') {
 panel.querySelector('.correction-toggle').disabled = false;
 const status = panel.querySelector('.attempt-status');
 status.textContent = labels[panel.dataset.correction][verdict || 'ready'];
 if (verdict) status.dataset.verdict = verdict; else delete status.dataset.verdict;
}

// Short answers: the comparison never blocks the correction; it only tells the child what Klassia recognised.
function check(panel, text) {
 let rule;
 try { rule = JSON.parse(panel.dataset.check); } catch { return ''; }
 const verdict = K.matchAnswer(text, rule);
 panel.dispatchEvent(new CustomEvent('klassia:answer-checked', {bubbles:true, detail:{record:panel.dataset.record, verdict}}));
 return verdict;
}

document.addEventListener('submit', event => {
 const form = event.target;
 if (!form.matches('[data-attempt-form]')) return;
 event.preventDefault();
 const panel = form.closest('[data-correction]');
 const field = form.querySelector('textarea');
 if (!field?.value.trim()) {
  form.querySelector('.attempt-status').textContent = labels[panel.dataset.correction].empty;
  field?.focus();
  return;
 }
 accept(panel, panel.dataset.check ? check(panel, field.value) : '');
});

document.addEventListener('click', event => {
 const button = event.target.closest('button[data-attempt-oral],button.correction-toggle');
 if (!button || button.disabled) return;
 const panel = button.closest('[data-correction]');
 if (button.hasAttribute('data-attempt-oral')) return accept(panel);
 const content = panel.querySelector('.correction-body');
 const template = panel.querySelector('template');
 if (template) {
  content.append(template.content.cloneNode(true));
  template.remove();
 }
 const opening = content.hidden;
 content.hidden = !opening;
 button.setAttribute('aria-expanded', String(opening));
 const t = labels[panel.dataset.correction];
 button.textContent = opening ? t.hide : K.isAdultSpace() ? t.adult : t.show;
});

K.correction = {html};
})();
