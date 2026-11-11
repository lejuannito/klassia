/* « Cette semaine à l'école » : the parent states the school's unit and week;
   Klassia shows the week's sub-centre, the pages of the French textbook when its
   table of contents has been recorded, and the lessons it proposes for that week.
   The split of lessons over the three weeks is Klassia's proposal, not the
   programme's: the curriculum fixes the sub-centres, not the order of lessons. */
(() => {
'use strict';
const K = Klassia, E = K.escape;
const key = grade => 'klassia_' + grade.toLowerCase() + '_week_v1';
const manuals = {};

// Weeks 1 to 3 hold new learning; week 4 is for review and integration (Niveau 1 and 2 curricula).
function weekOf(index, count) { return Math.min(3, Math.floor(index * 3 / Math.max(count, 1)) + 1); }

function read(grade) {
 const v = K.read(key(grade), null);
 return v && /^\S+$/.test(String(v.unit)) && [1, 2, 3, 4].includes(v.week) ? v : null;
}
function write(grade, unit, week) { try { K.write(key(grade), {unit, week, at: Date.now()}); } catch {} }

async function manual(url) {
 if (!url) return null;
 if (!manuals[url]) manuals[url] = fetch(url).then(r => r.ok ? r.json() : null).catch(() => null);
 return manuals[url];
}

const pages = p => p === null || p === undefined || p === '' ? '' : String(p).includes('-') ? 'p. ' + String(p).replace('-', ' à ') : 'p. ' + p;
function span(items) {
 const all = items.flatMap(i => String(i[2] ?? '').split('-')).map(Number).filter(Number.isFinite);
 if (!all.length) return '';
 const lo = Math.min(...all), hi = Math.max(...all);
 return lo === hi ? 'page ' + lo : 'pages ' + lo + ' à ' + hi;
}
function unitSpan(book, unit) {
 const u = book?.units.find(x => x.unit === unit);
 return u ? span(u.weeks.flatMap(w => w.items)) : '';
}

function manualBlock(book, unit, week) {
 const w = book?.units.find(x => x.unit === unit)?.weeks.find(x => x.week === week);
 if (!w) return '';
 const adult = K.isAdultSpace();
 return `<section class="klassia-week-manual" aria-labelledby="weekManualTitle">
  <h2 id="weekManualTitle">Dans ton manuel de français</h2>
  <p class="klassia-week-book"><strong>${E(book.title)}</strong> · ${E(span(w.items))}</p>
  <ul>${w.items.map(([rubric, title, page]) => `<li><span class="klassia-week-rubric">${E(rubric)}</span>${title ? `<span>${E(title)}</span>` : ''}${page ? `<b>${E(pages(page))}</b>` : ''}</li>`).join('')}</ul>
  <p class="klassia-week-source">${adult ? `Sommaire relevé dans le <a href="${E(book.source.url)}" target="_blank" rel="noopener">guide pédagogique de l’éditeur</a> (${E(book.edition)}). Titres parfois abrégés ; aucun texte du manuel n’est reproduit.` : 'Pages relevées dans le guide de l’éditeur. Si ton manuel est différent, demande à ton maître ou à ta maîtresse.'}</p>
 </section>`;
}

/* opts: grade, units [{id, number, label, subcentres}], unit, week,
   subjects [{name, lessons [{title, href, status}]}] (already filtered on the week),
   review [{title, href, detail}] for week 4, book (manual JSON or null), note (adult note). */
function render(opts) {
 const u = opts.units.find(x => x.id === opts.unit) || opts.units[0];
 const theme = opts.week === 4 ? 'Bilan, révisions et projet de l’unité' : (u.subcentres || [])[opts.week - 1] || '';
 const lessons = opts.week === 4
  ? `<section class="klassia-week-lessons"><h2>Dans Klassia : bilan de l’unité</h2>${opts.review.length ? `<ul>${opts.review.map(r => `<li><a href="${E(r.href)}">${E(r.title)}</a>${r.detail ? `<small>${E(r.detail)}</small>` : ''}</li>`).join('')}</ul>` : '<p>Toutes les leçons de l’unité sont réalisées. Bravo !</p>'}</section>`
  : `<section class="klassia-week-lessons"><h2>Dans Klassia cette semaine</h2>${opts.subjects.filter(s => s.lessons.length).map(s => `<h3>${E(s.name)}</h3><ul>${s.lessons.map(l => `<li><a href="${E(l.href)}">${E(l.title)}</a>${l.status ? `<small>${E(l.status)}</small>` : ''}</li>`).join('')}</ul>`).join('')}
   <p class="klassia-week-source">Klassia répartit les leçons de chaque matière sur les trois semaines de l’unité, dans leur ordre. C’est une proposition : l’ordre suivi par l’école peut être différent.</p></section>`;
 return `<section class="klassia-week" data-week-grade="${E(opts.grade)}">
  <h1>Cette semaine à l’école</h1>
  <p>Choisis l’unité et la semaine où en est la classe. Klassia te montre le thème, les pages du manuel et les leçons qui vont avec.</p>
  <form class="klassia-week-form" data-week-form>
   <label>Unité <select data-week-unit>${opts.units.map(x => `<option value="${E(x.id)}" ${x.id === u.id ? 'selected' : ''}>${E(x.label)}</option>`).join('')}</select></label>
   <label>Semaine <select data-week-week>${[1, 2, 3, 4].map(n => `<option value="${n}" ${n === opts.week ? 'selected' : ''}>Semaine ${n}${n === 4 ? ' (bilan)' : ''}</option>`).join('')}</select></label>
  </form>
  <p class="klassia-week-theme"><span>Thème de la semaine</span><strong>${E(theme)}</strong></p>
  ${manualBlock(opts.book, u.number, opts.week)}
  ${lessons}
 </section>`;
}

// One delegated listener: engines register how to re-render after a change.
let onSelect = null;
document.addEventListener('change', event => {
 const form = event.target.closest('[data-week-form]');
 if (!form || !onSelect) return;
 const grade = form.closest('[data-week-grade]').dataset.weekGrade;
 const unit = form.querySelector('[data-week-unit]').value, week = Number(form.querySelector('[data-week-week]').value);
 write(grade, unit, week);
 onSelect(unit, week);
});

K.week = {weekOf, read, write, manual, render, unitSpan, pages, bind: fn => { onSelect = fn; }};
})();
