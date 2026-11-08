(() => {
 'use strict';
 const page = new URL('../imprimer.html', document.currentScript.src);
 function open(grade, kind, unit, id, adult = false) {
  const url = new URL(page);
  url.search = new URLSearchParams({classe: grade, fiche: kind, unite: unit});
  if (id) url.searchParams.set('id', id);
  if (adult && Klassia.isAdultSpace()) url.searchParams.set('mode', 'adulte');
  location.assign(url);
 }
 Klassia.printing = {open};
})();
