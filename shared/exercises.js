(() => {
'use strict';
// Checked formats in lessons: put in order, match, fill the gaps, single-choice question and number (M3c: shared with CE2). Each check dispatches
// klassia:exercise-checked {key, ok}; the lesson engine records it like the other attempts.
const K = Klassia, E = K.escape;
const T = {
 fr: {check:'Vérifier', choose:'— choisir —', all:'Bravo, tout est juste !', some:n => `${n} réponse${n > 1 ? 's' : ''} à corriger. Essaie encore.`,
  empty:'Complète d’abord toutes les cases.', checkMcq:'Vérifier ma réponse', checkNumber:'Vérifier le nombre', pick:'Choisis d’abord une réponse.', number:'Écris un nombre avant de vérifier.', good:'Bravo ! ', retry:'Essaie encore. ', right:'Bonne réponse.', expected:'Pas encore. Réponse attendue : ', reread:' Relis « Je retiens », puis réessaie.', answerLabel:'Ta réponse', order:'Touche les étiquettes dans le bon ordre. Touche une étiquette placée pour la reprendre.', show:'Voir la correction', gap:'Case'},
 en: {check:'Check', choose:'— choose —', all:'Well done, everything is right!', some:n => `${n} answer${n > 1 ? 's' : ''} to fix. Try again.`,
  empty:'Fill in every box first.', checkMcq:'Check my answer', checkNumber:'Check the number', pick:'Choose an answer first.', number:'Write a number before checking.', good:'Well done! ', retry:'Try again. ', right:'Right answer.', expected:'Not yet. Expected answer: ', reread:' Read « Remember » again, then try once more.', answerLabel:'Your answer', order:'Tap the cards in the right order. Tap a placed card to take it back.', show:'Show the answer', gap:'Gap'}
};
const TYPES = ['order', 'match', 'gaps', 'mcq', 'number'];
const SIMPLE = ['mcq', 'number']; // one answer, feedback in the status line
// A shuffled order that is never the answer itself.
function shuffled(n) {
 const a = Array.from({length:n}, (_, i) => i);
 for (let i = n - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
 if (n > 1 && a.every((x, i) => x === i)) [a[0], a[1]] = [a[1], a[0]];
 return a;
}
// Gaps keep accents and letters (spelling is the point); case, spaces and apostrophes are tolerated.
const norm = s => String(s ?? '').normalize('NFC').trim().replace(/[’‘`´]/g, "'").replace(/\s+/g, ' ').toLowerCase();
const parts = text => String(text).split(/(\[\[[^\]]+\]\])/).filter(Boolean).map(x => x.startsWith('[[') ? {gap:x.slice(2, -2).split('|')} : {text:x});

function html(p, key, en) {
 const t = T[en ? 'en' : 'fr'];
 let body = '';
 if (p.type === 'order') {
  body = `<p class="klassia-ex-hint">${t.order}</p><div class="klassia-order-answer" data-order-answer></div><div class="klassia-order-pool" data-order-pool>${shuffled(p.items.length).map(i => `<button type="button" data-item="${i}">${E(p.items[i])}</button>`).join('')}</div>`;
 } else if (p.type === 'match') {
  const order = shuffled(p.pairs.length);
  body = `<div class="klassia-match">${p.pairs.map(([left], i) => `<label><span>${E(left)}</span><select data-slot="${i}"><option value="">${t.choose}</option>${order.map(k => `<option value="${k}">${E(p.pairs[k][1])}</option>`).join('')}</select></label>`).join('')}</div>`;
 } else if (p.type === 'gaps') {
  let g = 0;
  body = `<p class="klassia-gaps">${parts(p.text).map(x => x.gap ? `<input data-gap="${g++}" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="${t.gap} ${g}" size="${Math.max(3, ...x.gap.map(a => a.length + 1))}">` : E(x.text)).join('')}</p>`;
 } else if (p.type === 'mcq') {
  const name = 'mcq_' + String(key).replace(/\W/g, '_');
  body = `<div class="klassia-mcq" role="radiogroup">${p.choices.map((c, j) => `<label class="choice"><input type="radio" name="${name}" value="${j}"><span>${E(c)}</span></label>`).join('')}</div>`;
 } else if (p.type === 'number') {
  body = `<label class="klassia-number"><span>${t.answerLabel}</span> <input data-number inputmode="decimal" autocomplete="off" size="8"></label>`;
 }
 const adult = K.isAdultSpace(), simple = SIMPLE.includes(p.type);
 const solution = p.type === 'gaps' ? parts(p.text).filter(x => x.gap).map(x => x.gap) : p.type === 'mcq' ? {choice:Number(p.correct_choice ?? p.correct)} : p.type === 'number' ? {number:Number(p.answer), why:p.explanation || ''} : null;
 return `<div class="klassia-ex" data-ex="${E(p.type)}" data-key="${E(key)}" data-solution="${E(JSON.stringify(solution))}" lang="${en ? 'en' : 'fr'}">${body}`
  + `<div class="klassia-ex-actions"><button type="button" data-ex-check>${p.type === 'mcq' ? t.checkMcq : p.type === 'number' ? t.checkNumber : t.check}</button></div><p class="klassia-ex-status" role="status"></p>`
  + (simple && !adult ? '' : `<details class="klassia-ex-answer"${adult ? ' open' : ' hidden'}><summary>${t.show}</summary><p class="preserve-lines">${E(p.answer)}</p>${p.explanation ? `<p>${E(p.explanation)}</p>` : ''}</details>`) + '</div>';
}

function check(box) {
 const type = box.dataset.ex;
 let fields = [], wrong = 0;
 if (type === 'order') {
  const placed = [...box.querySelectorAll('[data-order-answer] [data-item]')];
  if (box.querySelector('[data-order-pool] [data-item]')) return null;
  placed.forEach((b, i) => { const ok = Number(b.dataset.item) === i; b.dataset.ok = String(ok); if (!ok) wrong++; });
  return wrong;
 }
 if (type === 'match') fields = [...box.querySelectorAll('select[data-slot]')];
 if (type === 'gaps') fields = [...box.querySelectorAll('input[data-gap]')];
 if (fields.some(f => !f.value.trim())) return null;
 let solution = [];
 try { solution = JSON.parse(box.dataset.solution) || []; } catch {}
 for (const f of fields) {
  const ok = type === 'match' ? f.value === f.dataset.slot : solution[Number(f.dataset.gap)].some(a => norm(a) === norm(f.value));
  (type === 'match' ? f.closest('label') : f).dataset.ok = String(ok);
  if (!ok) wrong++;
 }
 return wrong;
}

document.addEventListener('click', event => {
 const item = event.target.closest('.klassia-ex [data-item]');
 if (item) {
  const box = item.closest('.klassia-ex'), inPool = item.parentElement.matches('[data-order-pool]');
  delete item.dataset.ok;
  box.querySelector(inPool ? '[data-order-answer]' : '[data-order-pool]').append(item);
  return;
 }
 const button = event.target.closest('.klassia-ex [data-ex-check]');
 if (!button) return;
 const box = button.closest('.klassia-ex'), t = T[box.lang === 'en' ? 'en' : 'fr'], status = box.querySelector('.klassia-ex-status');
 if (SIMPLE.includes(box.dataset.ex)) {
  let sol = {};
  try { sol = JSON.parse(box.dataset.solution) || {}; } catch {}
  let ok, text;
  if (box.dataset.ex === 'mcq') {
   const picked = box.querySelector('input[type=radio]:checked');
   if (!picked) { status.textContent = t.pick; delete status.dataset.verdict; return; }
   ok = Number(picked.value) === sol.choice;
   text = ok ? t.good + t.right : t.expected + (box.querySelector(`input[value="${sol.choice}"]`)?.nextElementSibling?.textContent || '') + '.' + t.reread;
  } else {
   const raw = box.querySelector('[data-number]').value.trim().replace(/\s/g, '').replace(',', '.');
   if (raw === '' || !/^[-+]?\d+(\.\d+)?$/.test(raw)) { status.textContent = t.number; delete status.dataset.verdict; return; }
   ok = Number(raw) === sol.number;
   text = (ok ? t.good : t.retry) + (sol.why || '');
  }
  status.textContent = text;
  status.dataset.verdict = ok ? 'correct' : 'wrong';
  box.dispatchEvent(new CustomEvent('klassia:exercise-checked', {bubbles:true, detail:{key:box.dataset.key, ok, kind:box.dataset.ex}}));
  return;
 }
 const wrong = check(box);
 if (wrong === null) { status.textContent = t.empty; delete status.dataset.verdict; return; }
 status.textContent = wrong ? t.some(wrong) : t.all;
 status.dataset.verdict = wrong ? 'wrong' : 'correct';
 box.querySelector('.klassia-ex-answer').hidden = false;
 box.dispatchEvent(new CustomEvent('klassia:exercise-checked', {bubbles:true, detail:{key:box.dataset.key, ok:!wrong, kind:box.dataset.ex}}));
});

// Clearing a mark as soon as the child changes an answer.
document.addEventListener('input', event => {
 const f = event.target.closest('.klassia-ex select, .klassia-ex input');
 if (!f) return;
 delete f.dataset.ok;
 if (f.closest('label')) delete f.closest('label').dataset.ok;
});

K.exercises = {html, types:TYPES, parts};
})();
