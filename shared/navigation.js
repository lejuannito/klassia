(() => {
 'use strict';
 const base = new URL('../', document.currentScript.src);
 const entryPages = ['', 'index.html', 'search', 'search.html', 'pilote', 'pilote.html', 'imprimer', 'imprimer.html', 'outils', 'outils.html'];
 const marker = 'klassiaPrevious';
 const hasPrevious = () => history.state?.[marker] === true;
 function internal(referrer) {
  if (!referrer) return false;
  const url = new URL(referrer);
  if (url.origin !== base.origin || !url.pathname.startsWith(base.pathname)) return false;
  const path = url.pathname.slice(base.pathname.length);
  return entryPages.includes(path) || /^(?:ms|gs|sil|ce1)(?:\/(?:index\.html)?)?$/.test(path);
 }
 function mark(previous) {
  history.replaceState({ ...history.state, [marker]: previous }, '');
 }
 function update() {
  const previous = hasPrevious();
  for (const link of document.querySelectorAll('[data-klassia-back]')) {
   link.textContent = previous ? '← Page précédente' : link.dataset.klassiaBack;
   link.hidden = !previous && (!link.dataset.klassiaBack || link.href === location.href);
  }
 }
 function moved() {
  if (typeof history.state?.[marker] !== 'boolean') mark(true);
  update();
 }
 if (typeof history.state?.[marker] !== 'boolean') mark(history.length > 1 && internal(document.referrer));
 window.addEventListener('popstate', moved);
 window.addEventListener('hashchange', moved);
 window.addEventListener('pageshow', update);
 document.addEventListener('DOMContentLoaded', update);
 if (window.Klassia) Klassia.navigation = { update };
 document.addEventListener('click', event => {
  const link = event.target.closest('a[data-klassia-back]');
  if (!link || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey ||
      event.shiftKey || event.altKey || !hasPrevious()) return;
  event.preventDefault();
  history.back();
 });
})();
