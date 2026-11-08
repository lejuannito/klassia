(() => {
'use strict';
const K = Klassia, E = K.escape;
const labels = {
 fr: {write:'Ma réponse',submit:'Valider ma tentative',oral:'J’ai répondu à l’oral ou sur papier',guide:'Écris ta réponse ou confirme ton essai à l’oral ou sur papier.',nursery:'Réponds en parlant, en montrant ou en manipulant. L’adulte confirme l’essai.',confirm:'Confirmer l’essai / Confirm attempt',ready:'Tu peux maintenant ouvrir la correction.',empty:'Écris une réponse avant de valider.',show:'Voir la correction',hide:'Masquer la correction',adult:'Voir le corrigé adulte'},
 en: {write:'My answer',submit:'Submit my attempt',oral:'I answered aloud or on paper',guide:'Write your answer or confirm that you tried aloud or on paper.',ready:'You can now open the feedback.',empty:'Write an answer before submitting.',show:'Show feedback',hide:'Hide feedback',adult:'Show adult answer guide'}
};

function html(id, answerHtml, {en=false,nursery=false,inputId=id+'_response',rows=2,maxLength=1000}={}) {
 const lang = en ? 'en' : 'fr', t = labels[lang], adult = K.isAdultSpace();
 const reveal = adult ? t.adult : t.show;
 const entry = nursery ? '' : `<label for="${E(inputId)}">${t.write}</label><textarea id="${E(inputId)}" rows="${rows}" maxlength="${maxLength}" autocomplete="off"></textarea>`;
 return `<div class="answer-reveal" data-correction="${lang}" lang="${lang}">
  ${adult?'':`<form data-attempt-form>
   <p class="attempt-guide">${nursery?t.nursery:t.guide}</p>${entry}
   <div class="attempt-actions">
    ${nursery?'':`<button type="submit">${t.submit}</button>`}
    <button type="button" data-attempt-oral>${nursery?t.confirm:t.oral}</button>
   </div>
   <p class="attempt-status" role="status"></p>
  </form>`}
  <button type="button" class="correction-toggle" aria-expanded="false" aria-controls="${E(id)}" ${adult?'':'disabled'}>${reveal}</button>
  <div id="${E(id)}" class="correction-body feedback" hidden></div>
  <template>${answerHtml}</template>
 </div>`;
}

function accept(panel) {
 panel.querySelector('.correction-toggle').disabled = false;
 panel.querySelector('.attempt-status').textContent = labels[panel.dataset.correction].ready;
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
 accept(panel);
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
