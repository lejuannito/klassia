(() => {
'use strict';const K=Klassia,esc=K.escape;
function download(){const b=K.exportBackup(),u=URL.createObjectURL(new Blob([JSON.stringify(b,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=u;a.download=`Klassia-${K.profile().id}-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);}
function openProfiles(){
 document.getElementById('profilesDialog')?.remove();const d=document.createElement('dialog');d.id='profilesDialog';d.className='profiles-dialog';
 d.innerHTML=`<form method="dialog"><button class="dialog-close" aria-label="Fermer">×</button></form><h2>Profil et espace de travail</h2><p>Klassia fonctionne sans compte en ligne. Choisissez le profil de l’enfant, puis l’espace à afficher. Ces choix restent sur cet appareil et ne sont pas protégés par mot de passe.</p><label>Enfant actif <select id="profileSelect">${K.profiles().map(p=>`<option value="${esc(p.id)}" ${p.id===K.profile().id?'selected':''}>${esc(p.name)}</option>`).join('')}</select></label><form id="newProfile"><label>Ajouter un enfant (prénom ou pseudonyme) <input id="profileName" maxlength="40" required autocomplete="off"></label><button>Ajouter le profil</button></form><p><button id="renameProfile">Renommer le profil actif</button></p><label>Espace affiché <select id="localRole"><option value="ELEVE">Enfant · apprendre et réviser</option><option value="PARENT">Parent · consulter la progression</option><option value="ENSEIGNANT">Enseignant · revue éditoriale et Bassa</option><option value="ADMIN">Administration locale</option></select></label><p>Changer d’espace ne crée pas de session sécurisée et ne modifie pas les données de l’enfant.</p><hr><h3>Sauvegarde de ${esc(K.profile().name)}</h3><p>Exporter régulièrement les progrès avant de changer d’appareil.</p><button id="exportProfile">Télécharger la sauvegarde</button><label>Restaurer dans ce profil <input id="importProfile" type="file" accept=".json,application/json"></label><button id="undoImport">Annuler la dernière restauration</button><p id="profileMessage" role="status"></p>`;
 document.body.appendChild(d);const message=s=>d.querySelector('#profileMessage').textContent=s;
 d.querySelector('#profileSelect').onchange=e=>{K.selectProfile(e.target.value);location.reload();};
 d.querySelector('#newProfile').onsubmit=e=>{e.preventDefault();try{K.createProfile(d.querySelector('#profileName').value);location.reload();}catch(e){message(e.message);}};
 d.querySelector('#renameProfile').onclick=()=>{const name=prompt('Nouveau prénom ou pseudonyme',K.profile().name);if(name!==null)try{K.renameProfile(name);location.reload();}catch(e){message(e.message);}};
 const role=d.querySelector('#localRole');role.value=K.read('klassia_user',{})?.role||'ELEVE';role.onchange=()=>changeSpace(role.value);
 d.querySelector('#exportProfile').onclick=()=>{download();message('Sauvegarde téléchargée.');};
 d.querySelector('#importProfile').onchange=async e=>{try{const f=e.target.files[0];if(!f)return;if(f.size>8000000)throw Error('Fichier trop volumineux (8 Mo maximum).');const p=JSON.parse(await f.text()),v=K.prepareImport(p);if(!confirm(`Importer ${v.count} ensembles de données (${v.grades.join(', ')}) dans « ${K.profile().name} » ? Les rubriques présentes seront remplacées ; les autres classes et profils seront conservés.`))return;K.restore(p);location.reload();}catch(e){message('Aucune restauration effectuée : '+e.message);}};
 d.querySelector('#undoImport').onclick=()=>{if(!confirm('Revenir à l’état local précédant la dernière restauration ? Les progrès et profils créés ou modifiés depuis seront également remplacés.'))return;try{K.undoRestore();location.reload();}catch(e){message(e.message);}};
 d.addEventListener('click',e=>{if(e.target===d)d.close();});d.addEventListener('close',()=>{d.remove();document.querySelector('[data-profiles]')?.focus();});d.showModal();
}
const gradePaths={CE2:'',MS:'ms/',GS:'gs/',SIL:'sil/',CE1:'ce1/'};
const gradeNames={CE2:'CE2',MS:'Moyenne section',GS:'Grande section bilingue',SIL:'SIL bilingue',CE1:'CE1 bilingue'};
function context(){const match=location.pathname.match(/\/(ms|gs|sil|ce1)(?:\/|\/index\.html)$/);const grade=match?match[1].toUpperCase():'CE2';return {grade,base:new URL(match?'../':'./',location.href)};}
function rememberClass(){const c=context();if(!['#coverage','#bassa'].includes(location.hash)){sessionStorage.setItem('klassia_return',location.href);sessionStorage.setItem('klassia_review_grade',c.grade);}return c;}
function returnToClass(){const c=context(),raw=sessionStorage.getItem('klassia_return');let url=new URL(raw||gradePaths[c.grade],c.base);if(url.origin!==location.origin||!url.pathname.startsWith(c.base.pathname))url=new URL('',c.base);location.href=url.href;}
function changeSpace(role, destination='#coverage'){
 K.write('klassia_user',{role,name:K.profile().name});
 document.getElementById('profilesDialog')?.close();
 if(role==='PARENT'){decorate();openOverview(true);return;}
 if(['ENSEIGNANT','ADMIN'].includes(role)){
  const c=rememberClass(), target=new URL(destination,c.base);
  if(target.href===location.href)location.reload();
  else location.href=target.href;
  return;
 }
 if(['#coverage','#bassa'].includes(location.hash))returnToClass();
 else location.reload();
}
function catalogue(title, description, cards) {
 return `<section class="klassia-catalogue-heading"><h1>${esc(title)}</h1><p>${esc(description)}</p></section>
 <div class="klassia-catalogue">${cards.map(card => `<a class="klassia-catalogue-card" href="${esc(card.href)}">
  ${card.code ? `<span class="klassia-catalogue-code">${esc(card.code)}</span>` : ''}
  <h2>${esc(card.title)}</h2>
  ${card.translation ? `<span lang="en">${esc(card.translation)}</span>` : ''}
  ${card.detail ? `<p>${esc(card.detail)}</p>` : ''}
  ${card.count ? `<span class="klassia-catalogue-count">${esc(card.count)}</span>` : ''}
 </a>`).join('')}</div>`;
}
K.catalogue = catalogue;
function classNavigation(grade){
 const nursery=grade==='MS'||grade==='GS', older=grade==='CE2'||nursery;
 const routes=[['unit',nursery?'#themes':'#units',nursery?'Par thème':'Par unité'],
  ['subject',older?'#subjects-all':'#subjects','Par matière'],
  ['domain',older?'#domains-all':'#domains','Par domaine']];
 const hash=location.hash;
 const mode=/^#(?:subjects?|subject-all|subjects-all|activity-subject)(?::|$)/.test(hash)?'subject':
  /^#(?:domains?|domain-all|domains-all)(?::|$)/.test(hash)?'domain':
  /^#(?:learn|units?|themes)(?::|$)/.test(hash)?'unit':'';
 return `<nav class="klassia-learning-mode" aria-label="Parcourir la classe">${routes.map(([key,href,label])=>`<a href="${href}" ${mode===key?'aria-current="page"':''}>${label}</a>`).join('')}</nav>`;
}

async function openOverview(refreshOnClose=false){
 document.getElementById('overviewDialog')?.remove();const d=document.createElement('dialog');d.id='overviewDialog';d.className='profiles-dialog';d.innerHTML='<form method="dialog"><button class="dialog-close" aria-label="Fermer">×</button></form><h2>Suivi de '+esc(K.profile().name)+'</h2><p>Chargement des progrès…</p>';document.body.append(d);d.showModal();
 d.addEventListener('close',()=>{d.remove();if(refreshOnClose)location.reload();else document.querySelector('[data-overview]')?.focus();});
 const {base}=context();try{const get=async p=>{const r=await fetch(new URL(p,base));if(!r.ok)throw Error('Suivi indisponible');return r.json();};const [ce2,ms,sil,ce1,gs]=await Promise.all([get('data/catalog.json'),get('ms/data/catalog-v13.json'),get('sil/data/curriculum.json'),get('ce1/data/catalog.json'),get('gs/data/catalog-v13.json')]);
 const summaries=[['CE2',ce2.summary.lesson_count,Object.values(K.read('klassia_progress',{})).filter(s=>s==='MAITRISEE').length],['MS',ms.summary.activities,ms.themes.reduce((n,t)=>n+Object.values(K.read('klassia_ms_progress_v2:'+t.id,{})).filter(s=>s==='A').length,0)]];
 summaries.push(['GS',gs.summary.activities,gs.themes.reduce((n,t)=>n+Object.values(K.read('klassia_gs_progress_v2:'+t.id,{})).filter(s=>s==='A').length,0)]);
 for(const [grade,catalog] of [['SIL',sil],['CE1',ce1]]){const us=await Promise.all(catalog.units.map(x=>get(grade.toLowerCase()+'/data/'+x.path)));const progress=K.read('klassia_'+grade.toLowerCase()+'_progress_v1',{}),ids=us.flatMap(x=>x.lessons.map(l=>l.id));summaries.push([grade,ids.length,ids.filter(id=>progress[id]==='A').length]);}
 d.innerHTML='<form method="dialog"><button class="dialog-close" aria-label="Fermer">×</button></form><h2>Suivi de '+esc(K.profile().name)+'</h2><p>Avancement déclaré sur cet appareil. Réaliser une activité ne vaut pas validation pédagogique.</p>'+summaries.map(([g,total,done])=>'<article class="adult-guide"><h3>'+gradeNames[g]+'</h3><p>'+done+' / '+total+' activités ou leçons réalisées</p><progress max="'+total+'" value="'+done+'"></progress><p><a href="'+new URL(gradePaths[g],base).href+'">Ouvrir cette classe</a></p></article>').join('');
 }catch(e){d.querySelector('p').textContent=e.message+' — réessayez avec la connexion ou le pack hors connexion.';}

}
function decorate(){
 const top=document.querySelector('.topbar,.top,.gs-top');if(!top)return;
 const c=rememberClass(),role=K.read('klassia_user',{})?.role||'ELEVE',roleName={ELEVE:'Enfant',PARENT:'Parent',ENSEIGNANT:'Enseignant',ADMIN:'Administration'}[role]||'Enfant';
 document.querySelectorAll('.klassia-global-nav,.klassia-learning-mode,.klassia-space-menu,.klassia-class-switch,.profile-trigger').forEach(e=>e.remove());
 const searchBack=new URL('search.html',c.base);searchBack.search=new URLSearchParams(location.search).get('recherche')||'';
 const nav=document.createElement('nav');nav.className='klassia-global-nav';nav.setAttribute('aria-label','Classes et espaces');nav.innerHTML=`<a data-klassia-back="← Parcours de la classe" href="${['MS','GS'].includes(c.grade)?'#themes':'#units'}">← Parcours de la classe</a><label>Classe <select data-grade>${Object.entries(gradeNames).map(([g,n])=>`<option value="${g}" ${g===c.grade?'selected':''}>${n}</option>`).join('')}</select></label><a data-search href="${new URL('search.html',c.base)}">Rechercher</a><a href="${new URL('outils.html',c.base)}">Outils</a>${new URLSearchParams(location.search).has('recherche')?`<a data-search-return href="${esc(searchBack.href)}">Retour aux résultats</a>`:''}<button data-space class="space-trigger">Espace : ${roleName} · changer</button><button data-profiles>Profil : ${esc(K.profile().name)}</button><button data-overview>Suivi des classes</button><a data-review href="${new URL('#coverage',c.base)}">Validation pédagogique</a>${role!=='ELEVE'?'<button data-child>Retour à la vue enfant</button>':''}${['#coverage','#bassa'].includes(location.hash)?'<button data-return>Retour à ma classe</button>':''}`;top.insertAdjacentElement('afterend',nav);
 if (['PARENT','ENSEIGNANT','ADMIN'].includes(role)) {
  const pilot=document.createElement('a');
  pilot.href=new URL('pilote.html',c.base);
  pilot.textContent='Carnet du pilote';
  const child=nav.querySelector('[data-child]');
  nav.insertBefore(pilot,child);
  const bassa=document.createElement('a');
  bassa.href=new URL('#bassa',c.base);
  bassa.textContent='Prises bassa';
  nav.insertBefore(bassa,child);
 }
 const main=document.querySelector('main');if(main)main.insertAdjacentHTML('afterbegin',classNavigation(c.grade));if(main&&!main.querySelector('.edition-notice,.gs-notice')){const n=document.createElement('p');n.className='edition-notice';n.textContent='Édition pilote accompagnée · contenus en cours de relecture pédagogique.';main.prepend(n);}
 K.navigation.update();
 document.getElementById('logout')?.remove();
}
// Delegation survives DOM replacement in every grade and on browser back/forward.
document.addEventListener('click',e=>{const t=e.target.closest('[data-space],[data-profiles],[data-overview],[data-child],[data-return],[data-review],[data-bassa-teacher]');if(!t)return;if(t.matches('[data-space],[data-profiles]'))openProfiles();else if(t.hasAttribute('data-overview'))openOverview();else if(t.hasAttribute('data-child'))changeSpace('ELEVE');else if(t.hasAttribute('data-return'))returnToClass();else if(t.hasAttribute('data-bassa-teacher'))changeSpace('ENSEIGNANT','#bassa');else rememberClass();});
document.addEventListener('change',e=>{if(e.target.matches('[data-grade]')){const c=context();location.href=new URL(gradePaths[e.target.value],c.base).href;}});
K.openOverview=openOverview;
// Optional device speech is explicitly labelled; it is not a validated audio pack.
function addSpeech(container,text,lang){K.speech.add(container,text,lang);}
window.addEventListener('error',e=>{if(/quota|storage/i.test(e.message)){alert('Enregistrement local impossible. Exportez vos progrès et vérifiez l’espace disponible.');}});
// Lesson visits and theme selection write progress in each tab. Only a change
// of the displayed profile or role requires restarting the current view.
function displayContext(raw) {
 const state = JSON.parse(raw);
 const profile = state?.profiles?.[state.active];
 return [state?.active, profile?.name, JSON.parse(profile?.data?.klassia_user || '{}')?.role || 'ELEVE'];
}
window.addEventListener('storage', event => {
 if (event.storageArea !== localStorage || event.key !== 'klassia_profiles_v15') return;
 try {
  const before = displayContext(event.oldValue);
  const after = displayContext(event.newValue);
  if (before.some((value, index) => value !== after[index])) location.reload();
 } catch { /* A malformed external write must not restart the application. */ }
});
K.openProfiles=openProfiles;K.downloadBackup=download;K.addSpeech=addSpeech;
document.addEventListener('klassia:render',decorate);
})();
