(() => {
'use strict';
const E=Klassia.escape;
function support(s,audio='',asset=src=>src) {
 if (!s) return '';
 const figure = s.figure
  ? '<img class="lesson-figure" src="' + E(asset(s.figure.src)) + '" alt="' + E(s.figure.alt) + '">'
  : '';
 return `<section class="lesson-support"><h2>${E(s.title||'Support de travail')}</h2>${s.text?`<p class="preserve-lines">${E(s.text)}</p>`:''}${audio}${figure}${s.items?`<ul>${s.items.map(v=>`<li>${E(v)}</li>`).join('')}</ul>`:''}${s.table?`<div class="manual-table-wrap"><table><caption>${E(s.table.caption||'Données de l’exercice')}</caption><thead><tr>${s.table.headers.map(h=>`<th scope="col">${E(h)}</th>`).join('')}</tr></thead><tbody>${s.table.rows.map(row=>`<tr>${row.map(v=>`<td>${E(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`:''}</section>`;
}
Klassia.lessonSupport=support;
})();
