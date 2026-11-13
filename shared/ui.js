(() => {
'use strict';const K=Klassia,esc=K.escape;
function download(){const b=K.exportBackup(),u=URL.createObjectURL(new Blob([JSON.stringify(b,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=u;a.download=`Klassia-${K.profile().id}-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);}
function openProfiles(){
 document.getElementById('profilesDialog')?.remove();const d=document.createElement('dialog');d.id='profilesDialog';d.className='profiles-dialog';
 d.innerHTML=`<form method="dialog"><button class="dialog-close" aria-label="Fermer">×</button></form><h2>Profil et espace de travail</h2><p>Klassia fonctionne sans compte en ligne. Choisissez le profil de l’enfant, puis l’espace à afficher. Ces choix restent sur cet appareil et ne sont pas protégés par mot de passe.</p><label>Enfant actif <select id="profileSelect">${K.profiles().map(p=>`<option value="${esc(p.id)}" ${p.id===K.profile().id?'selected':''}>${esc(p.name)}</option>`).join('')}</select></label><form id="newProfile"><label>Ajouter un enfant (prénom ou pseudonyme) <input id="profileName" maxlength="40" required autocomplete="off"></label><button>Ajouter le profil</button></form><p><button id="renameProfile">Renommer le profil actif</button></p><label>Espace affiché <select id="localRole"><optgroup label="Famille"><option value="ELEVE">Enfant · apprendre et réviser</option><option value="PARENT">Parent · consulter la progression</option></optgroup><optgroup label="Atelier pédagogique"><option value="ENSEIGNANT">Enseignant · revue éditoriale et Bassa</option><option value="ADMIN">Administration locale</option></optgroup></select></label><p>Changer d’espace ne crée pas de session sécurisée et ne modifie pas les données de l’enfant.</p><hr><h3>Sauvegarde de ${esc(K.profile().name)}</h3><p>Exporter régulièrement les progrès avant de changer d’appareil.</p><button id="exportProfile">Télécharger la sauvegarde</button><label>Restaurer dans ce profil <input id="importProfile" type="file" accept=".json,application/json"></label><button id="undoImport">Annuler la dernière restauration</button><p id="profileMessage" role="status"></p>`;
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
// Les classes viennent du registre unique (shared/classes.js) ; le sélecteur garde la classe racine en tête.
const classList=[...K.classes.filter(x=>!x.dir),...K.classes.filter(x=>x.dir)];
const gradePaths=Object.fromEntries(classList.map(x=>[x.grade,x.dir])),gradeNames=Object.fromEntries(classList.map(x=>[x.grade,x.label]));
function context(){const info=K.currentClass();return {grade:info.grade,base:new URL(K.inClassFolder()?'../':'./',location.href)};}
function rememberClass(){const c=context();if(!['#coverage','#bassa'].includes(location.hash)){sessionStorage.setItem('klassia_return',location.href);sessionStorage.setItem('klassia_review_grade',c.grade);}return c;}
function returnToClass(){const c=context(),raw=sessionStorage.getItem('klassia_return');let url=new URL(raw||gradePaths[c.grade],c.base);if(url.origin!==location.origin||!url.pathname.startsWith(c.base.pathname))url=new URL('',c.base);location.href=url.href;}
// Parental gate: a question an adult answers before leaving the child view.
// It only prevents accidental taps; it is not a password and protects nothing.
const GATE_KEY='klassia_parent_gate_until', GATE_MINUTES=10;
function gatePassed(){try{return Number(sessionStorage.getItem(GATE_KEY))>Date.now();}catch{return false;}}
function rememberGate(){try{sessionStorage.setItem(GATE_KEY,String(Date.now()+GATE_MINUTES*60000));}catch{}}
function resetGate(){try{sessionStorage.removeItem(GATE_KEY);}catch{}}
function parentGate(){
 if(gatePassed())return Promise.resolve(true);
 return new Promise(resolve=>{
  document.getElementById('parentGateDialog')?.remove();
  const d=document.createElement('dialog');d.id='parentGateDialog';d.className='profiles-dialog parent-gate';
  d.innerHTML=`<form method="dialog"><button class="dialog-close" aria-label="Fermer">×</button></form><h2>Espace des parents</h2><p>Pour continuer, un adulte répond à ce calcul. Ce n’est pas un mot de passe : la question évite seulement les ouvertures par erreur.</p><form data-gate-form><label><span data-gate-question></span> <input name="answer" inputmode="numeric" autocomplete="off" required></label><div class="parent-gate-actions"><button type="submit" class="btn primary">Continuer</button><button type="button" data-gate-cancel>Annuler</button></div><p data-gate-status role="status"></p></form>`;
  document.body.appendChild(d);
  let answer=0, ok=false;
  const input=d.querySelector('input'), status=d.querySelector('[data-gate-status]');
  const ask=()=>{const a=12+Math.floor(Math.random()*8), b=3+Math.floor(Math.random()*7);answer=a*b;d.querySelector('[data-gate-question]').textContent=`${a} × ${b} =`;input.value='';input.focus();};
  d.querySelector('[data-gate-form]').onsubmit=e=>{e.preventDefault();if(Number(input.value.trim())===answer){ok=true;rememberGate();d.close();}else{status.textContent='Ce n’est pas le bon résultat. Voici un autre calcul.';ask();}};
  d.querySelector('[data-gate-cancel]').onclick=()=>d.close();
  d.addEventListener('close',()=>{d.remove();resolve(ok);});
  d.showModal();ask();
 });
}
K.parentGate=parentGate;
async function changeSpace(role, destination='#coverage'){
 const current=K.read('klassia_user',{})?.role||'ELEVE';
 if(current==='ELEVE'&&role!=='ELEVE'&&!(await parentGate())){
  const select=document.getElementById('localRole');if(select)select.value=current;
  return;
 }
 if(role==='ELEVE')resetGate();
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
// Liste de leçons commune à toutes les classes (ADR-014, M3e) : numéro, titre, objectif, état déclaré.
// items : {href, title, eyebrow?, detail?, status:{label, kind: 'todo'|'doing'|'done'|'review'}}.
function lessonList(items) {
 return `<ol class="klassia-lessons">${items.map((x, i) => `<li><a class="klassia-lesson-item" href="${esc(x.href)}" data-status="${esc(x.status?.kind || 'todo')}">
  <span class="klassia-lesson-no" aria-hidden="true">${i + 1}</span>
  <span class="klassia-lesson-text">${x.eyebrow ? `<span class="klassia-lesson-eyebrow">${esc(x.eyebrow)}</span>` : ''}<b>${esc(x.title)}</b>${x.detail ? `<span class="klassia-lesson-detail">${esc(x.detail)}</span>` : ''}</span>
  ${x.status ? `<span class="klassia-lesson-status">${esc(x.status.label)}</span>` : ''}<span class="klassia-lesson-go" aria-hidden="true">›</span></a></li>`).join('')}</ol>`;
}
K.lessonList = lessonList;
// Barre d'onglets commune aux classes du primaire (ADR-014, M3f) : en bas de l'écran sur téléphone.
// tabs : [id, icône, libellé, adresse] ; mobileOnly : masquée sur grand écran quand la page a déjà une barre en haut.
function tabBar(tabs, active, mobileOnly = false) {
 return `<nav class="klassia-tabs${mobileOnly ? ' klassia-tabs-mobile' : ''}" aria-label="Navigation de la classe">${tabs.map(([id, icon, label, href]) => `<a href="${esc(href)}" data-tab="${esc(id)}"${active === id ? ' aria-current="page"' : ''}><span class="klassia-tabs-icon" aria-hidden="true">${icon}</span><span>${esc(label)}</span></a>`).join('')}</nav>`;
}
K.tabBar = tabBar;
// Page « Suivi » commune au primaire (ADR-014, M3g) : chiffres clés, puis une ligne par matière.
// stats : [{icon, value, label}] ; rows : [{icon?, title, done, total, notes: [texte…]}].
function progressSummary(title, description, stats, rows) {
 return `<section class="klassia-catalogue-heading"><h1>${esc(title)}</h1><p>${esc(description)}</p></section>
 <ul class="klassia-stats">${stats.map(x => `<li><span aria-hidden="true">${x.icon}</span><strong>${esc(x.value)}</strong><span>${esc(x.label)}</span></li>`).join('')}</ul>
 ${progressRows(rows)}`;
}
function progressRows(rows) {
 return `<ul class="klassia-progress-rows">${rows.map(r => { const pct = r.total ? Math.round(r.done * 100 / r.total) : 0; return `<li>${r.icon ? `<span class="klassia-progress-icon" aria-hidden="true">${r.icon}</span>` : ''}<div><div class="klassia-progress-head"><strong>${esc(r.title)}</strong><span>${pct} %</span></div><progress max="${r.total || 1}" value="${r.done}" aria-label="${esc(r.title)}"></progress><p>${[`${r.done}/${r.total}`, ...(r.notes || [])].map(esc).join(' · ')}</p></div></li>`; }).join('')}</ul>`;
}
K.progressSummary = progressSummary;
K.progressRows = progressRows;
function classNavigation(grade){
 const nursery=K.isNurseryClass(grade), older=nursery;
 const routes=[['unit',nursery?'#themes':'#units',nursery?'Par thème':'Par unité'],
  ['subject',older?'#subjects-all':'#subjects','Par matière'],
  ['domain',older?'#domains-all':'#domains','Par domaine']];
 // Semaine et Réviser sont des onglets de la barre du primaire ; cette rangée ne garde que les trois parcours.
 const hash=location.hash;
 const mode=/^#(?:subjects?|subject-all|subjects-all|activity-subject)(?::|$)/.test(hash)?'subject':
  /^#(?:domains?|domain-all|domains-all)(?::|$)/.test(hash)?'domain':
  /^#(?:learn|units?|themes)(?::|$)/.test(hash)?'unit':hash==='#semaine'?'week':/^#(?:reviser|qcm:)/.test(hash)?'revise':'';
 return `<nav class="klassia-learning-mode" aria-label="Parcourir la classe">${routes.map(([key,href,label])=>`<a href="${href}" ${mode===key?'aria-current="page"':''}>${label}</a>`).join('')}</nav>`;
}

const attemptGrade=a=>a.grade||(/^HOME:/.test(a.exercise||'')?'MAISON':/^SIL[-:]/.test(a.exercise||'')?'SIL':/^CE1[-:]/.test(a.exercise||'')?'CE1':'CE2');
// « Je révise » (lot 2g): an exercise answered « pas encore » comes back the next day, then a week later.
// Each engine registers Klassia.describeExercise(key) to say where the exercise is.
const dayOf=t=>{const d=new Date(t);return Math.floor((d.getTime()-d.getTimezoneOffset()*6e4)/864e5);};
function dueReviews(grade,now=Date.now()){
 const today=dayOf(now),byKey=new Map(),due=[];
 for(const a of K.read('klassia_attempts',[])){
  if(!a?.exercise||typeof a.ok!=='boolean'||!a.at||a.kind==='qcm'||attemptGrade(a)!==grade)continue;
  if(!byKey.has(a.exercise))byKey.set(a.exercise,[]);byKey.get(a.exercise).push({ok:a.ok,day:dayOf(a.at)});
 }
 for(const [key,list] of byKey){
  const i=list.map(x=>x.ok).lastIndexOf(false);if(i<0)continue;
  const failed=list[i].day,later=list.slice(i+1).filter(x=>x.ok);
  const nextDay=later.some(x=>x.day>=failed+1),nextWeek=later.some(x=>x.day>=failed+7);
  if(!nextDay&&today>=failed+1)due.push({key,failed,stage:1});
  else if(nextDay&&!nextWeek&&today>=failed+7)due.push({key,failed,stage:2});
 }
 return due.sort((a,b)=>a.failed-b.failed);
}
K.dueReviews=dueReviews;
function reviewCard(grade){
 if(typeof K.describeExercise!=='function')return null;
 const items=[];for(const d of dueReviews(grade)){let x=null;try{x=K.describeExercise(d.key);}catch{}if(x?.href)items.push({...d,...x});if(items.length===5)break;}
 if(!items.length)return null;
 const s=document.createElement('section');s.className='klassia-review';s.setAttribute('aria-labelledby','klassiaReviewTitle');
 s.innerHTML=`<h2 id="klassiaReviewTitle">Je révise</h2><p>${items.length===1?'Un exercice à refaire':'Des exercices à refaire'} pour bien retenir.</p><ul>${items.map(x=>`<li><a href="${esc(x.href)}" data-review-anchor="${esc(x.anchor||'')}"><b>${esc(x.title)}</b><span>${esc(x.detail||'')} · ${x.stage===1?'tu avais dit « pas encore »':'une semaine après'}</span></a></li>`).join('')}</ul>`;
 s.addEventListener('click',e=>{const a=e.target.closest('[data-review-anchor]');if(a?.dataset.reviewAnchor)try{sessionStorage.setItem('klassia_review_anchor',a.dataset.reviewAnchor);}catch{}});
 return s;
}
function showReviewTarget(){
 let anchor=null;try{anchor=sessionStorage.getItem('klassia_review_anchor');}catch{}
 if(!anchor||!/^#lesson:/.test(location.hash))return;
 let el=null;try{el=document.querySelector(anchor);}catch{}
 if(!el)return;
 try{sessionStorage.removeItem('klassia_review_anchor');}catch{}
 const box=el.closest('.exercise-card,.practice-item,section')||el;box.classList.add('klassia-review-target');K.lessonSteps?.reveal(box);
 setTimeout(()=>box.scrollIntoView({block:'center'}),0);
}

// Lot 9a: what was done these last 7 days on this device, and a short message the parent can send.
// Written answers, notes and scores per question are never included in the message.
function weekReport(){
 const since=Date.now()-7*864e5,recent=x=>x&&Date.parse(x.at)>=since,rows={};
 const row=g=>rows[g]||(rows[g]={tried:new Map(),qcm:0,ratings:new Map()});
 const gradeOf=attemptGrade;
 for(const a of K.read('klassia_attempts',[]).filter(recent)){const r=row(gradeOf(a));if(a.kind==='qcm')r.qcm++;else if(a.exercise||a.activity)r.tried.set(a.exercise||a.activity,a.ok===true);}
 for(const o of K.read('klassia_observations',[]).filter(recent))if(o.rating&&o.grade)row(o.grade).ratings.set(o.activity,o.rating);
 const n=(k,one,many)=>k+' '+(k>1?many:one),lines=[];
 const label=g=>gradeNames[g]||'Langue de la maison';
 for(const g of [...Object.keys(gradeNames),'MAISON'])if(rows[g]){const r=rows[g],parts=[];
  if(r.tried.size){const ok=[...r.tried.values()].filter(Boolean).length;parts.push(n(r.tried.size,'exercice essayé','exercices essayés')+(ok?', dont '+n(ok,'réussi','réussis'):''));}
  if(r.qcm)parts.push(n(r.qcm,'série de QCM','séries de QCM'));
  if(r.ratings.size){const c=k=>[...r.ratings.values()].filter(v=>v===k).length,detail=[[c('alone'),'seul'],[c('helped'),'avec aide'],[c('notyet'),'pas encore']].filter(([k])=>k).map(([k,w])=>k+' '+w).join(', ');parts.push(n(r.ratings.size,'activité','activités')+' ('+detail+')');}
  if(parts.length)lines.push([g,parts.join(' ; ')]);}
 const text=['Klassia — la semaine de '+K.profile().name,...lines.map(([g,l])=>'• '+label(g)+' : '+l),'Suivi déclaré sur l’appareil, sans note.'].join('\n');
 return {lines:lines.map(([g,l])=>[label(g),l]),text};
}
function weekReportHtml(){
 const {lines,text}=weekReport();
 return '<section class="klassia-week-report adult-guide"><h3>Les 7 derniers jours</h3>'+(lines.length?'<ul>'+lines.map(([g,l])=>'<li><strong>'+esc(g)+'</strong> : '+esc(l)+'</li>').join('')+'</ul><p class="klassia-share"><a href="https://wa.me/?text='+encodeURIComponent(text)+'" target="_blank" rel="noopener" data-share-whatsapp>Envoyer par WhatsApp</a> <button type="button" data-share-copy>Copier le message</button> <span role="status" data-share-status></span></p><p class="klassia-share-note">Le message donne seulement ces nombres et le prénom du profil : ni réponses écrites, ni notes.</p>':'<p>Aucune activité enregistrée ces 7 derniers jours sur cet appareil.</p>')+'</section>';
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-share-copy]');if(!b)return;const status=b.parentElement.querySelector('[data-share-status]'),{text}=weekReport();
 Promise.resolve(navigator.clipboard?.writeText(text)).then(()=>{if(!navigator.clipboard)throw Error();status.textContent='Message copié.';}).catch(()=>{status.textContent='Copie impossible ici : utilisez « Envoyer par WhatsApp ».';});});
async function openOverview(refreshOnClose=false){
 document.getElementById('overviewDialog')?.remove();const d=document.createElement('dialog');d.id='overviewDialog';d.className='profiles-dialog';d.innerHTML='<form method="dialog"><button class="dialog-close" aria-label="Fermer">×</button></form><h2>Suivi de '+esc(K.profile().name)+'</h2><p>Chargement des progrès…</p>';document.body.append(d);d.showModal();
 d.addEventListener('close',()=>{d.remove();if(refreshOnClose)location.reload();else document.querySelector('[data-overview]')?.focus();});
 const {base}=context();try{const get=async p=>{const r=await fetch(new URL(p,base));if(!r.ok){const e=Error('Suivi indisponible');e.notInstalled=r.headers.has('X-Klassia-Not-Installed');throw e;}return r.json();};const [ce2,ms,sil,ce1,gs]=await Promise.all(['CE2','MS','SIL','CE1','GS'].map(g=>get(K.classInfo(g).catalog)));
 const summaries=[['CE2',ce2.summary.lesson_count,Object.values(K.read('klassia_progress',{})).filter(s=>s==='MAITRISEE').length],['MS',ms.summary.activities,ms.themes.reduce((n,t)=>n+Object.values(K.read('klassia_ms_progress_v2:'+t.id,{})).filter(s=>s==='A').length,0)]];
 summaries.push(['GS',gs.summary.activities,gs.themes.reduce((n,t)=>n+Object.values(K.read('klassia_gs_progress_v2:'+t.id,{})).filter(s=>s==='A').length,0)]);
 for(const [grade,catalog] of [['SIL',sil],['CE1',ce1]]){let us;try{us=await Promise.all(catalog.units.map(x=>x.lessons?x:get(K.classInfo(grade).dir+'data/'+x.path)));}catch(e){if(!e.notInstalled)throw e;summaries.push([grade,0,0,true]);continue;}const progress=K.read('klassia_'+grade.toLowerCase()+'_progress_v1',{}),ids=us.flatMap(x=>x.lessons.map(l=>l.id));summaries.push([grade,ids.length,ids.filter(id=>progress[id]==='A').length]);}
 d.innerHTML='<form method="dialog"><button class="dialog-close" aria-label="Fermer">×</button></form><h2>Suivi de '+esc(K.profile().name)+'</h2><p>Avancement déclaré sur cet appareil. Réaliser une activité ne vaut pas validation pédagogique.</p>'+weekReportHtml()+summaries.map(([g,total,done,absent])=>'<article class="adult-guide"><h3>'+gradeNames[g]+'</h3>'+(absent?'<p>Classe non installée hors connexion sur cet appareil.</p>':'<p>'+done+' / '+total+' activités ou leçons réalisées</p><progress max="'+total+'" value="'+done+'"></progress>')+'<p><a href="'+new URL(gradePaths[g],base).href+'">Ouvrir cette classe</a></p></article>').join('');
 }catch(e){d.querySelector('p').textContent=e.message+' — réessayez avec la connexion ou le pack hors connexion.';}

}
function decorate(){
 const top=document.querySelector('.topbar,.top,.gs-top');if(!top)return;
 const c=rememberClass(),role=K.read('klassia_user',{})?.role||'ELEVE',roleName={ELEVE:'Enfant',PARENT:'Parent',ENSEIGNANT:'Enseignant',ADMIN:'Administration'}[role]||'Enfant';
 document.querySelectorAll('.klassia-global-nav,.klassia-learning-mode,.klassia-space-menu,.klassia-class-switch,.profile-trigger').forEach(e=>e.remove());
 document.querySelectorAll('.klassia-welcome,.klassia-continue,.klassia-review,.klassia-cheer').forEach(e=>e.remove());
 const searchBack=new URL('search.html',c.base);searchBack.search=new URLSearchParams(location.search).get('recherche')||'';
 const nav=document.createElement('nav');nav.className='klassia-global-nav';nav.setAttribute('aria-label','Classes et espaces');
 // Each control keeps its data attribute so the delegated handlers below work
 // wherever it is placed.
 const parts={
  back:`<a data-klassia-back="← Parcours de la classe" href="${K.classInfo(c.grade).overview}">← Parcours de la classe</a>`,
  grade:`<label><span class="klassia-grade-label">Classe</span> <select data-grade>${Object.entries(gradeNames).map(([g,n])=>`<option value="${g}" ${g===c.grade?'selected':''}>${n}</option>`).join('')}</select></label>`,
  search:`<a data-search href="${new URL('search.html',c.base)}">Rechercher</a>`,
  tools:`<a href="${new URL('outils.html',c.base)}">Outils</a>`,
  searchReturn:new URLSearchParams(location.search).has('recherche')?`<a data-search-return href="${esc(searchBack.href)}">Retour aux résultats</a>`:'',
  space:`<button data-space class="space-trigger">Espace : ${roleName} · changer</button>`,
  profiles:`<button data-profiles>Profil : ${esc(K.profile().name)}</button>`,
  overview:`<button data-overview>Suivi des classes</button>`,
  homeLanguage:`<a data-home-language-link href="${new URL('maison.html',c.base)}">Langue de la maison</a>`,
  recommend:`<a data-recommend href="https://wa.me/?text=${encodeURIComponent('Je te conseille Klassia, un manuel interactif pour les enfants de la maternelle au CE2, qui marche aussi sans connexion : '+new URL('./',c.base).href)}" target="_blank" rel="noopener">Recommander Klassia (WhatsApp)</a>`,
  review:`<a data-review href="${new URL('#coverage',c.base)}">Validation pédagogique</a>`,
  child:role!=='ELEVE'?'<button data-child>Retour à la vue enfant</button>':'',
  back2:['#coverage','#bassa'].includes(location.hash)?'<button data-return>Retour à ma classe</button>':''
 };
 if(role==='ELEVE'){
  // Child view: only what a child needs to move around. Adult tools stay one
  // tap away behind « Parents »; nothing is removed.
  nav.classList.add('klassia-family-nav');
  nav.innerHTML=parts.back+parts.grade+parts.tools+parts.searchReturn+parts.back2+
   `<details class="klassia-parents-menu"><summary>Parents</summary><div class="klassia-parents-panel" role="group" aria-label="Outils des parents"><p>Suivi, profils, sauvegarde et recherche.</p><p class="klassia-parents-edition">Édition pilote accompagnée : les contenus sont en cours de relecture pédagogique.</p>${parts.overview}${parts.homeLanguage}${parts.profiles}${parts.search}${parts.recommend}${parts.space}<p class="klassia-parents-workshop">Atelier pédagogique</p>${parts.review}</div></details>`;
 } else {
  nav.innerHTML=parts.back+parts.grade+parts.search+parts.tools+parts.searchReturn+parts.space+parts.profiles+parts.overview+parts.homeLanguage+parts.recommend+parts.review+parts.child+parts.back2;
 }
 top.insertAdjacentElement('afterend',nav);
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
 const main=document.querySelector('main');if(main)main.insertAdjacentHTML('afterbegin',classNavigation(c.grade));document.documentElement.dataset.klassiaView=['ELEVE','PARENT'].includes(role)?'family':'workshop';document.documentElement.dataset.klassiaRole=role;if(role==='ELEVE')main?.querySelectorAll('.edition-notice,.gs-notice').forEach(e=>e.remove());else if(main&&!main.querySelector('.edition-notice,.gs-notice')){const n=document.createElement('p');n.className='edition-notice';n.textContent='Édition pilote accompagnée · contenus en cours de relecture pédagogique.';main.prepend(n);}
 const showWelcome=main&&isLanding(c)&&['ELEVE','PARENT'].includes(role)&&!K.read(FAMILY_KEY,null);
 if(showWelcome)main.prepend(welcome(c));
 else if(main&&role==='ELEVE'&&isClassHome(c)&&typeof K.nextStep==='function'){let step=null;try{step=K.nextStep();}catch{}const card=step?continueCard(step,c.grade):null;if(card)main.prepend(card);
  const review=K.classInfo(c.grade).review?reviewCard(c.grade):null;if(review){if(card)card.after(review);else main.prepend(review);}
  const cheer=cheerCard(c.grade);if(cheer)(review||card||main.firstElementChild)?.after(cheer);}
 showReviewTarget();
 K.navigation.update();
 document.getElementById('logout')?.remove();
}
// Continue: each grade engine registers Klassia.nextStep(); the class home
// shows the next unfinished lesson or activity first, in one tap.
function isClassHome(c){const h=location.hash;return K.classInfo(c.grade).home.includes(h);}
// Encouragements sobres (shared/encouragement.js) : étoiles et jours de suite, sans reproche quand la série s'arrête.
function cheerCard(grade){if(!K.encouragement)return null;let e;try{e=K.encouragement.summary(K.classInfo(grade),K.read);}catch{return null;}const parts=[],nursery=K.isNurseryClass(grade);if(e.stars)parts.push(`<span data-cheer-stars><span aria-hidden="true">⭐</span> <b>${e.stars}</b> ${e.stars>1?'étoiles':'étoile'} · une par ${nursery?'activité réalisée':'leçon réalisée'}</span>`);if(e.days>=2)parts.push(`<span data-cheer-days><b>${e.days}</b> jours de suite</span>`);else if(e.today)parts.push('<span data-cheer-days>Tu as travaillé aujourd’hui</span>');if(!parts.length)return null;const s=document.createElement('p');s.className='klassia-cheer';s.setAttribute('role','status');s.innerHTML=parts.join('');return s;}
function continueCard(step,grade){const nursery=K.isNurseryClass(grade),label=nursery?'L’activité du jour':step.started?'Ta prochaine étape':'Pour commencer';const s=document.createElement('section');s.className='klassia-continue';s.setAttribute('aria-label',label);s.innerHTML=`<p class="klassia-continue-eyebrow">${label}</p><h2>${esc(step.title)}</h2>${step.meta?`<p>${esc(step.meta)}</p>`:''}<a class="klassia-continue-btn" href="${esc(step.href)}">${step.started?'Continuer':'Commencer'} ›</a>`;return s;}
// First launch: the family states the child's school and class once, then the
// entry page opens that class directly. Existing addresses are unchanged.
const FAMILY_KEY='klassia_family';
const familyClasses=K.classes.map(x=>[x.grade,x.label,x.twin]);
function isLanding(c){return c.grade==='CE2'&&!location.search&&['','#home'].includes(location.hash);}
function cameFromKlassia(base){try{const r=new URL(document.referrer);return r.origin===location.origin&&r.pathname.startsWith(base.pathname);}catch{return false;}}
function welcome(c){
 const s=document.createElement('section');s.className='klassia-welcome';s.setAttribute('aria-labelledby','klassiaWelcomeTitle');
 const name=K.profile().name;
 s.innerHTML=`<h2 id="klassiaWelcomeTitle">Bienvenue sur Klassia</h2><p>Trois réponses pour ouvrir directement la classe de votre enfant. Vous pourrez les changer plus tard.</p><form data-welcome><label>Prénom ou pseudonyme de l’enfant <input name="name" maxlength="40" autocomplete="off" value="${name==='Mon enfant'?'':esc(name)}" placeholder="Mon enfant"></label><fieldset><legend>École de l’enfant</legend><label><input type="radio" name="school" value="fr" checked> Francophone</label><label><input type="radio" name="school" value="en"> Anglophone</label><label><input type="radio" name="school" value="both"> Bilingue (les deux)</label></fieldset><p data-welcome-note role="status"></p><fieldset><legend>Classe</legend>${familyClasses.map(([g,fr,en])=>`<label><input type="radio" name="grade" value="${g}" required> ${fr} · ${en}</label>`).join('')}<p class="klassia-welcome-hint">Le CP et la Class 2 ne sont pas encore disponibles.</p></fieldset><div class="klassia-welcome-actions"><button type="submit" class="btn primary">Commencer</button><button type="button" data-welcome-later>Plus tard</button></div></form>`;
 const form=s.querySelector('form'), note=s.querySelector('[data-welcome-note]');
 form.addEventListener('change',e=>{if(e.target.name==='school')note.textContent=e.target.value==='fr'?'':'Les classes anglophones sont en préparation. En attendant, Klassia ouvre la classe francophone équivalente, où l’anglais est une matière.';});
 form.onsubmit=e=>{
  e.preventDefault();
  const grade=form.elements.grade.value, school=form.elements.school.value, child=form.elements.name.value.trim();
  if(!grade)return;
  if(child&&child!==K.profile().name){try{K.renameProfile(child);}catch(error){note.textContent=error.message;return;}}
  K.write(FAMILY_KEY,{school,grade,at:new Date().toISOString()});
  if(grade==='CE2')location.reload();else location.href=new URL(gradePaths[grade],c.base).href;
 };
 s.querySelector('[data-welcome-later]').onclick=()=>{K.write(FAMILY_KEY,{dismissed:true,at:new Date().toISOString()});s.remove();};
 return s;
}
// Opening Klassia from its icon, a bookmark or a typed address lands on the
// remembered class. Moving to CE2 from inside Klassia is left untouched.
(()=>{const c=context(),family=K.read(FAMILY_KEY,null);if(isLanding(c)&&family?.grade&&family.grade!=='CE2'&&gradePaths[family.grade]!==undefined&&!cameFromKlassia(c.base))location.replace(new URL(gradePaths[family.grade],c.base).href);})();
// Opening « Parents » from the child view goes through the parental gate.
document.addEventListener('click',e=>{
 const summary=e.target.closest('.klassia-parents-menu > summary');
 if(!summary)return;
 const menu=summary.parentElement;
 if(menu.open||gatePassed())return;
 e.preventDefault();
 parentGate().then(ok=>{if(ok&&menu.isConnected){menu.open=true;menu.querySelector('.klassia-parents-panel button,.klassia-parents-panel a')?.focus();}else summary.focus();});
});
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
