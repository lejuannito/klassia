/* Journal d'activité local (ADR-014, M3h-3) : ce qui vient d'être travaillé dans le profil actif.
   Indépendant du moteur ; il reste sur l'appareil et ne compte pas comme un travail réalisé. */
(function (K) {
'use strict';
const KEY = 'klassia_activity_v9', E = K.escape;
const ICONS = {lesson: '📘', mastery: '✓', review: '↻', evaluation: '★', qcm: '🧩', project: '◆', backup: '⇩', restore: '↥'};
const all = () => { const list = K.read(KEY, []); return Array.isArray(list) ? list : []; };
// L'unité vient de l'adresse quand elle la nomme, sinon de l'unité CE2 en cours.
function unitNow() {
 const named = /^#(?:qcm|project|eval|unit):([^:]+)/.exec(decodeURIComponent(location.hash || ''));
 return named ? named[1] : new URLSearchParams(location.search).get('unit') || K.storage.getItem('klassia_unit') || null;
}
function log(type, label, unit = unitNow()) {
 const list = all(), last = list[0];
 if (last && last.type === type && last.label === label && Date.now() - new Date(last.at).getTime() < 1500) return;
 list.unshift({type, label, unit, at: new Date().toISOString()});
 try { K.storage.setItem(KEY, JSON.stringify(list.slice(0, 80))); } catch {}
}
function when(iso) {
 try { return new Intl.DateTimeFormat('fr-FR', {day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'}).format(new Date(iso)); } catch { return ''; }
}
function html(limit = 6) {
 const list = all().slice(0, limit);
 if (!list.length) return '<p class="muted">Aucune activité enregistrée pour le moment.</p>';
 return `<ul class="klassia-activity">${list.map(x => `<li><span aria-hidden="true">${ICONS[x.type] || '•'}</span><div><strong>${E(x.label)}</strong><small>${E(when(x.at))}${x.unit ? ` · ${E(x.unit)}` : ''}</small></div></li>`).join('')}</ul>`;
}
document.addEventListener('klassia:qcm-done', e => log('qcm', `Série QCM : ${e.detail.score}/${e.detail.total}`));
document.addEventListener('change', e => {
 if (e.target?.matches?.('[data-project]') && e.target.checked) log('project', `Étape ${Number(e.target.dataset.project) + 1} du projet réalisée`);
});
K.activity = {log, html};
})(window.Klassia);
