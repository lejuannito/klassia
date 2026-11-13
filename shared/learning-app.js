(async()=>{
'use strict';
const K=Klassia,E=K.escape,info=K.currentClass(),legacy=info.format==='ce2',home=K.inClassFolder()?'../':'./',c={grade:info.grade,catalog:K.classLocalPath(info,info.catalog),progressKey:info.progressKey,qcm:legacy?'legacy':info.qcm&&K.classLocalPath(info,info.qcm),back:home},root=document.getElementById('app');
const get=async url=>{const r=await fetch(url);if(!r.ok)throw Error('Ressource indisponible : '+url);return r.json();};
// Maternelle : même moteur, habillage par thèmes et fiche parent (ADR-016) fourni par shared/nursery.js.
if(info.format==='nursery')return K.nursery.start({info,root,get});
let catalog,units,lessons,progress;
// États de progression : le moteur parle « D, EC, R, A » ; une classe peut les enregistrer sous d'autres noms (CE2 : MAITRISEE…),
// pour que la progression déjà enregistrée reste lue et écrite telle quelle.
const codes=info.status||null,decode=Object.fromEntries(Object.entries(codes||{}).map(([k,v])=>[v,k]));
const loadProgress=()=>{const raw=K.read(c.progressKey,{})||{};if(!codes)return raw;const out={};for(const [id,v] of Object.entries(raw))out[id]=decode[v]||v;return out;};
const saveProgress=p=>{if(!codes)return K.write(c.progressKey,p);const raw=K.read(c.progressKey,{})||{};for(const [id,v] of Object.entries(p))if(v==='D')delete raw[id];else raw[id]=codes[v]||v;K.write(c.progressKey,raw);};
const choices=codes?['R','A']:['D','EC','A'];
// Clé d'un entraînement dans le journal : le CE2 garde « leçon:n ».
const practiceKey=(id,j)=>legacy?id+':'+j:c.grade+':'+id+':entrainement:'+j;
// Shared « Continuer » card (shared/ui.js): last open lesson if unfinished, else the first unfinished one.
const recentKey='klassia_'+c.grade.toLowerCase()+'_recent_v1';
K.nextStep=()=>{if(!lessons)return null;const p=loadProgress(),r=K.read(recentKey,null);const x=(r&&lessons.find(y=>y.l.id===r.lessonId&&p[y.l.id]!=='A'))||lessons.find(y=>p[y.l.id]==='EC')||lessons.find(y=>p[y.l.id]!=='A')||lessons[0];return x?{href:'#lesson:'+encodeURIComponent(x.l.id),title:x.l.title,meta:x.u.title_fr+' · '+x.l.domain,started:Boolean(r)||Object.keys(p).length>0}:null;};
const status=s=>codes?(s==='A'?'Je me sens prêt':s==='R'?'À revoir':s==='EC'?'En cours':'À faire'):(s==='A'?'Réalisé':s==='EC'?'En cours':'À découvrir');
// « Cette semaine à l'école » (shared/week.js) and « Dans ton manuel » when the French textbook's table of contents is recorded.
const manualUrl={SIL:home+'data/manuels/champions-francais-sil.json',CE2:home+'data/manuels/champions-francais-ce2.json'}[c.grade];
async function showWeek(){
 const saved=K.week.read(c.grade);let current=null;
 try{const s=K.nextStep();const id=s&&decodeURIComponent(s.href.slice(8));current=lessons.find(x=>x.l.id===id)?.u.id;}catch{}
 const sel=saved&&units.some(u=>u.id===saved.unit)?saved:{unit:current||units[0].id,week:1};
 const u=units.find(x=>x.id===sel.unit),book=await K.week.manual(manualUrl);
 if(location.hash!=='#semaine')return;
 const groups=new Map();for(const l of u.lessons){const d=l.domain.split(' · ')[0];if(!groups.has(d))groups.set(d,[]);groups.get(d).push(l);}
 const item=l=>({title:l.title,href:'#lesson:'+encodeURIComponent(l.id),status:progress[l.id]?status(progress[l.id]):''});
 // A lesson may name its week (SIL reading, one sound a week); the others are spread over weeks 1 to 3 in their order.
 const inWeek=(ls,w)=>{const free=ls.filter(l=>!l.week);return ls.filter(l=>l.week?l.week===w:K.week.weekOf(free.indexOf(l),free.length)===w);};
 const subjects=[...groups].map(([name,ls])=>({name,lessons:inWeek(ls,sel.week).map(item)}));
 const bilans=u.lessons.filter(l=>l.week===4);
 const review=[...bilans.map(l=>({...item(l),detail:l.domain+' · '+status(progress[l.id])})),...(u.subjects||[]).filter(s=>s.assessment).map(s=>({title:'Évaluation · '+s.name,href:'#eval:'+u.id+':'+encodeURIComponent(s.id)})),...(u.integration_project?[{title:'Projet d’intégration',href:'#project:'+u.id,detail:u.integration_project.title}]:[]),...(u.project?[{title:'Projet de l’unité',href:'#unit:'+encodeURIComponent(u.id),detail:u.project}]:[]),...u.lessons.filter(l=>progress[l.id]!=='A'&&l.week!==4).map(l=>({...item(l),detail:l.domain+' · '+status(progress[l.id])}))];
 frame(K.week.render({grade:c.grade,unit:u.id,week:sel.week,book,subjects,review,units:units.map((x,i)=>({id:x.id,number:i+1,label:(i+1)+' · '+x.title_fr,subcentres:x.subcentres}))}));
}
K.week.bind(()=>showWeek().catch(()=>notFound()));
// Guided session in SIL (lot 4b): a three-line parent card and a child screen, as in the nursery.
function parentCard(l,en){const t=en?['Parent card','Materials','What I say','If it is hard','▶ Show the child']:['Fiche parent','Matériel','Ce que je dis','Si c’est difficile','▶ Montrer à l’enfant'];
 return `<dl class="nursery-card sil-card" aria-label="${t[0]}">${l.materials?`<div><dt>🧺 ${t[1]}</dt><dd>${E(l.materials)}</dd></div>`:''}<div><dt>💬 ${t[2]}</dt><dd>${E(l.exercise)}</dd></div>${l.remediation?`<div><dt>🤝 ${t[3]}</dt><dd>${E(l.remediation)}</dd></div>`:''}</dl><button type="button" class="nursery-show" data-sil-child>${t[4]}</button>`;}
// The screen is filled when opened and emptied when closed, so the lesson keeps a single copy of each audio and speech control.
function childScreen(l,en){return `<section class="sil-child" data-sil-screen hidden lang="${en?'en':'fr'}" aria-label="${en?'Child screen':'Écran de l’enfant'}"><button type="button" class="sil-child-close" data-sil-close>${en?'✕ Back to the adult':'✕ Retour à l’adulte'}</button><div class="sil-child-body"></div><button type="button" class="sil-child-done" data-sil-close data-sil-done>${en?'✋ I’ve finished!':'✋ J’ai fini !'}</button></section>`;}
function wireChildScreen(l,lang){document.querySelectorAll('body > .sil-child').forEach(e=>e.remove());document.documentElement.classList.remove('nursery-child-open');const screen=root.querySelector('[data-sil-screen]'),open=root.querySelector('[data-sil-child]');if(!screen||!open)return;document.body.append(screen);
 const body=screen.querySelector('.sil-child-body');
 const show=on=>{if(on){body.innerHTML=`<h2>${E(l.title)}</h2><div class="sil-child-speaker"></div>${K.lessonSupport(l.support,K.speech.clip(l.support?.audio,lang))}`;K.addSpeech(body.querySelector('.sil-child-speaker'),l.exercise,lang);reading(body,l);}else{K.speech.stop?.();body.innerHTML='';}screen.hidden=!on;document.documentElement.classList.toggle('nursery-child-open',on);if(on)screen.scrollTop=0;};
 open.onclick=()=>show(true);
 screen.querySelectorAll('[data-sil-close]').forEach(b=>b.onclick=()=>{show(false);if(b.hasAttribute('data-sil-done')){const target=root.querySelector('.answer-reveal');revealStep(target);target?.scrollIntoView({block:'center'});target?.querySelector('[data-attempt-oral]')?.focus();}});
}
// Reading lessons (lot 5): the table of syllables comes before the words and the sentence.
function reading(scope,l){if(/-R\d$/.test(l.id))scope.querySelector('.lesson-support')?.classList.add('reading-support');}
function fillManualRef(unitNumber,week){const el=document.querySelector('[data-manual-ref]');if(!el)return;K.week.manual(manualUrl).then(book=>{const items=week?book?.units.find(x=>x.unit===unitNumber)?.weeks.find(x=>x.week===week)?.items||[]:[],it=items.find(i=>i[0]==='Lecture')||items.find(i=>i[0]==='Bilan');const p=it?`semaine ${week} : ${it[1]?'« '+it[1]+' »':it[0].toLowerCase()}, ${K.week.pages(it[2])}`:K.week.unitSpan(book,unitNumber);if(!p||!el.isConnected)return;el.innerHTML=`<span>Dans ton manuel</span> ${E(book.title)}, unité ${unitNumber}, ${E(p)}. <a href="#semaine">Voir les pages de la semaine</a>`;el.hidden=false;});}
// « As-tu réussi seul ? » after a correction, as in CE2: recorded in the attempts log; a lesson still « À découvrir » becomes « En cours ».
const lastSelf=sid=>[...K.read('klassia_attempts',[])].reverse().find(a=>(a.kind==='self_report'||a.kind==='short_answer')&&a.exercise===sid);
function selfCheck(sid,lid,en){const last=lastSelf(sid),was=last?(last.ok?(en?'managed alone ✓':'réussi seul ✓'):(en?'to practise again':'à retravailler')):'';
 if(K.isAdultSpace())return last?`<p class="exercise-history">${last.kind==='short_answer'?(en?'Last automatic check':'Dernière vérification automatique'):(en?'Child’s self-check':'Auto-évaluation de l’enfant')} : ${was}</p>`:'';
 return `<div class="self-check" data-self-check="${E(sid)}" data-lesson="${E(lid)}" data-lang="${en?'en':'fr'}"><span>${en?'Did you manage on your own?':'As-tu réussi seul ?'}</span><button type="button" data-self="0" aria-pressed="false">${en?'Not yet':'Pas encore'}</button><button type="button" data-self="1" aria-pressed="false">${en?'Yes':'Oui'} ✓</button><span class="self-result" data-self-result role="status"></span></div><p class="remediation" data-self-help hidden>${en?'Read the « Worked example » again, do « Practise together » with an adult, then try again.':'Relis « Exemple expliqué », refais « Ensemble » avec un adulte, puis essaie encore.'}</p>${last?`<p class="exercise-history">${en?'Last time':'La dernière fois'} : ${was}</p>`:''}`;}
document.addEventListener('click',ev=>{const b=ev.target.closest('[data-self]'),box=b?.closest('[data-self-check]');if(!box)return;
 const ok=b.dataset.self==='1',en=box.dataset.lang==='en',lid=box.dataset.lesson;
 K.append('klassia_attempts',{kind:'self_report',exercise:box.dataset.selfCheck,ok});
 box.querySelectorAll('[data-self]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
 box.querySelector('[data-self-result]').textContent=ok?(en?'Well done! When everything is done, choose « Réalisé » below.':'Bien joué ! Quand tout est réussi, choisis « Réalisé » en bas de la leçon.'):(en?'Keep going: try again with help.':'Continue : réessaie avec de l’aide.');
 box.parentElement.querySelector('[data-self-help]').hidden=ok;
 const p=loadProgress();if((p[lid]||'D')==='D'){p[lid]='EC';saveProgress(p);progress=p;document.querySelectorAll('[data-progress]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.progress==='EC')));const m=document.getElementById('progressMessage');if(m)m.textContent='Progression enregistrée : '+status('EC');}
});
// « Je révise » (shared/ui.js): where to redo an exercise or a practice item answered « pas encore ».
K.describeExercise=key=>{const m=legacy?/^([^:]+):(\d+)$/.exec(key):new RegExp('^'+c.grade+':([^:]+)(?::entrainement:(\\d+))?$').exec(key),x=m&&lessons?.find(y=>y.l.id===m[1]);if(!x)return null;const en=x.l.domain.startsWith('English');
 return {href:'#lesson:'+encodeURIComponent(x.l.id),anchor:`[data-${legacy?'record':'save'}="${key}"],[data-key="${key}"]`,title:x.l.title,detail:m[2]===undefined?(en?'Your turn':'À toi de jouer'):legacy?'Exercice '+(Number(m[2])+1):(en?'Practice ':'Entraînement ')+(Number(m[2])+2)};};
// Short answers (Lot 2e): accepted and rejected forms written in the content; the check never blocks the correction.
const shortCheck=(x,prompt)=>x.accept?{accept:x.accept,reject:x.reject||[],prompt}:null;
// A checked answer moves a lesson still « À découvrir » to « En cours ».
function started(target){const lid=target.closest('[data-lesson]')?.dataset.lesson,p=loadProgress();if(lid&&(p[lid]||'D')==='D'){p[lid]='EC';saveProgress(p);progress=p;document.querySelectorAll('[data-progress]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.progress==='EC')));}}
document.addEventListener('klassia:answer-checked',ev=>{const {record,verdict}=ev.detail||{};if(!record||!['correct','wrong'].includes(verdict))return;
 K.append('klassia_attempts',{kind:'short_answer',exercise:record,ok:verdict==='correct'});started(ev.target);
});
// Checked formats (shared/exercises.js): put in order, match, fill the gaps.
document.addEventListener('klassia:exercise-checked',ev=>{const {key,ok}=ev.detail||{};if(!key)return;K.append('klassia_attempts',{kind:'exercise',exercise:key,ok:Boolean(ok)});started(ev.target);});
// QCM reliés (lot 7) : une série de questions par unité et par matière ; après une erreur, « Revoir la leçon » ouvre la leçon vérifiée.
let bank=null;const qcmKey='klassia_'+c.grade.toLowerCase()+'_qcm_v1';
// Banque du CE2 : une série par épreuve de chaque unité (data/qcm-uN.json), identifiée « unité:rang » ; les scores restent
// rangés par unité sous leurs clés d'origine.
const qcmBank=async()=>bank||(bank=legacy?{series:(await Promise.all(catalog.units.map(async u=>(await get(home+u.qcm)).epreuves.map((e,i)=>({id:u.id+':'+i,unit:u.id,subject:e.matiere,label:e.serie_label||'',legacyKey:e.id||e.cle||`${e.subject_id||'Q'}-${i}`,type:e.serie_type,questions:e.questions,hidden:e.subject_id==='BA'}))))).flat().filter(s=>!s.hidden)}:await get(c.qcm));
const scoreOf=s=>legacy?K.read('klassia_qcm_scores:'+s.unit,{})[s.legacyKey]:K.read(qcmKey,{})[s.id];
function saveScore(s,score,total){if(legacy){const k='klassia_qcm_scores:'+s.unit,all=K.read(k,{});all[s.legacyKey]={score,total,pct:Math.round(score*100/total),date:new Date().toISOString(),type:s.type};K.write(k,all);K.append('klassia_attempts',{kind:'qcm',unit:s.unit,series:s.legacyKey,score,total});return;}
 K.append('klassia_attempts',{kind:'qcm',grade:c.grade,unit:s.unit,series:s.id,score,total});const scores=K.read(qcmKey,{});scores[s.id]={score,total,at:new Date().toISOString()};K.write(qcmKey,scores);}
async function showReview(){const b=await qcmBank();if(!/^#(reviser|revise)\b/.test(location.hash))return;
 const blocks=units.map((u,i)=>{const ss=b.series.filter(s=>s.unit===u.id);return ss.length?`<section class="gs-card klassia-qcm-unit"><h2>Unité ${i+1} · ${E(u.title_fr)}</h2><div class="gs-actions">${ss.map(s=>{const r=scoreOf(s);return `<a href="#qcm:${E(s.id)}">${E(s.subject)}${s.label?' · '+E(s.label):''}${r?` · ${r.score}/${r.total}`:''}</a>`;}).join('')}</div></section>`:'';}).join('');
 frame(hero('Réviser avec les QCM','Une série de questions par matière et par unité. Après une erreur, « Revoir la leçon » ouvre la leçon à relire.')+blocks);}
async function showSeries(id){const b=await qcmBank(),s=b.series.find(x=>x.id===id);if(!s)return notFound();if(!location.hash.startsWith('#qcm:'))return;
 const en=s.subject==='English',adult=K.isAdultSpace(),u=units.find(x=>x.id===s.unit),title=s.subject+' · '+(en?'Unit ':'Unité ')+(units.indexOf(u)+1)+(s.label?' · '+s.label:'');
 const lessonOf=q=>lessons.find(x=>x.l.id===q.lecon)?.l;
 const back=`<a href="#reviser">← ${en?'All quizzes':'Toutes les séries'}</a>`;
 if(adult){frame(back+hero(title,'Corrigé adulte : bonne réponse et leçon vérifiée par chaque question.')+`<ol class="klassia-qcm-key">${s.questions.map(q=>`<li><b>${E(q.enonce)}</b><p>${E(q.choix[q.bonne])} — ${E(q.corrige)}</p><p class="muted">Leçon liée : ${E(lessonOf(q)?.title||q.lecon)}</p></li>`).join('')}</ol>`);return;}
 frame(back+hero(title,en?'Choose one answer for each question, then check.':'Choisis une réponse par question, puis corrige la série.')+'<div data-qcm></div>');
 // Lecteur de série commun à toutes les classes (shared/qcm.js).
 K.qcm.mount(root.querySelector('[data-qcm]'),s.questions,{en,link:q=>{const l=lessonOf(q);return l?{href:'#lesson:'+encodeURIComponent(l.id),label:`${en?'Review the lesson':'Revoir la leçon'} « ${l.title} »`}:null;},
  onDone:(score,total)=>saveScore(s,score,total)});
}
const source=s=>s?`<a href="${E(s.url||'#')}" target="_blank" rel="noopener">${E(s.title)} · ${E(s.pages||'')}</a>`:'';
// Barre d'onglets commune (K.tabBar) et accueil de la classe (ADR-014, M3f).
// Enseignant et administration du CE2 : la revue éditoriale et l'atelier Bassa prennent la place de Semaine et Réviser, qui restent sur l'accueil.
const workshop=()=>legacy&&['ENSEIGNANT','ADMIN'].includes(K.read('klassia_user',{})?.role);
const tabs=()=>[['home','⌂','Accueil','#home'],['learn','▤','Apprendre','#units'],...(workshop()?[['coverage','☑','Revue','#coverage'],['bassa','♪','Bassa','#bassa']]:[['week','▦','Semaine','#semaine'],...(c.qcm?[['revise','✓','Réviser','#reviser']]:[])]),['progress','◎','Suivi','#suivi']];
function activeTab(){const h=location.hash||'#home';return h==='#home'?'home':h==='#coverage'?'coverage':h==='#bassa'?'bassa':h==='#suivi'||h==='#admin'?'progress':h==='#semaine'?'week':/^#(reviser?|reviseSubject:|qcm:)/.test(h)?'revise':'learn';}
function showHome(){const done=lessons.filter(x=>progress[x.l.id]==='A').length,doing=lessons.filter(x=>progress[x.l.id]==='EC').length;
 const cards=[{href:'#units',title:'Apprendre',detail:'Toutes les leçons, par unité, par matière ou par domaine.',count:lessons.length+' leçons'},{href:'#semaine',title:'Cette semaine à l’école',detail:'Les leçons de la semaine en cours.'},...(c.qcm?[{href:'#reviser',title:'Réviser',detail:'Des séries de questions par matière, avec la leçon à revoir.'}]:[])];
 frame(K.catalogue('Bonjour '+K.profile().name,`${info.label} · ${done} ${done>1?'leçons réalisées':'leçon réalisée'} sur ${lessons.length}${doing?` · ${doing} en cours`:''}`,cards));}
// Page Suivi commune (K.progressSummary) : l'année entière, une ligne par matière.
function showProgress(){const names=[...new Set(lessons.map(x=>x.l.domain))],count=st=>lessons.filter(x=>progress[x.l.id]===st).length,scores=c.qcm?Object.values(K.read(qcmKey,{})):[];
 const stats=[{icon:'✓',value:count('A'),label:'leçons réalisées'},{icon:'▶',value:count('EC'),label:'en cours'},{icon:'▦',value:units.filter(u=>u.lessons.some(l=>progress[l.id])).length+'/'+units.length,label:'unités commencées'},...(c.qcm?[{icon:'★',value:scores.length,label:scores.length>1?'séries de QCM faites':'série de QCM faite'}]:[])];
 frame(K.progressSummary('Suivi de progression',`${info.label} · ce que l’enfant déclare avoir réalisé. Une déclaration ne prouve pas une compétence acquise.`,stats,names.map(n=>{const ls=lessons.filter(x=>x.l.domain===n),doing=ls.filter(x=>progress[x.l.id]==='EC').length;return {title:n,done:ls.filter(x=>progress[x.l.id]==='A').length,total:ls.length,notes:['réalisées',...(doing?[doing+' en cours']:[])]};}))+(K.isAdultSpace()?adultProgress():''));}
// Espace adulte (M3h-3) : le détail par unité, l'activité récente et les pages de l'atelier, sous le suivi de l'enfant.
const role=()=>K.read('klassia_user',{})?.role||'ELEVE';
function adultProgress(){const rows=units.map(u=>{const st=x=>u.lessons.filter(l=>progress[l.id]===x).length,scores=Object.values(evalsOf(u)).map(x=>Number(x.score)).filter(Number.isFinite),again=st('R'),doing=st('EC');
  return {title:u.title_fr,done:st('A'),total:u.lessons.length,notes:[legacy?'déclarées comprises':'réalisées',...(again?[again+' à revoir']:[]),...(doing?[doing+' en cours']:[]),...(scores.length?['moyenne des évaluations '+(scores.reduce((a,b)=>a+b,0)/scores.length).toFixed(1)+'/20']:[])]};});
 const links=[...(legacy&&role()!=='PARENT'?[['#coverage','Revue éditoriale'],['#bassa','Atelier bassa']]:[]),...(role()==='ADMIN'?[['#admin','Contenu de la classe']]:[])];
 return `<h2>Par unité</h2>${K.progressRows(rows)}<section class="gs-card"><h2>Activité récente</h2>${K.activity.html(8)}<p class="muted">Les données appartiennent au profil actif sur cet appareil. Exportez une sauvegarde avant de changer d’appareil.</p></section>${links.length?`<section class="gs-card"><h2>Atelier pédagogique</h2><div class="gs-actions">${links.map(x=>`<a href="${x[0]}">${x[1]}</a>`).join('')}</div></section>`:''}`;}
// Vue de contrôle du contenu de la classe (profil Administration) : ce que chaque unité contient, sans jugement de qualité.
function showAdmin(){if(role()!=='ADMIN')return showHome();const n=(u,f)=>u.lessons.reduce((a,l)=>a+f(l),0),ex=l=>(l.practice||[]).length+(l.exercise?1:0),sum=f=>units.reduce((a,u)=>a+f(u),0);
 frame(hero('Contenu de la classe',info.label+' · vue de contrôle du corpus. Édition pilote accompagnée : la relecture pédagogique est en cours.')+`<ul class="klassia-stats"><li><strong>${units.length}</strong><span>unités</span></li><li><strong>${lessons.length}</strong><span>leçons</span></li><li><strong>${sum(u=>n(u,ex))}</strong><span>exercices</span></li><li><strong>${sum(u=>(u.subjects||[]).filter(s=>s.assessment).length)}</strong><span>évaluations</span></li></ul>`
  +`<div class="klassia-table"><table><thead><tr><th>Unité</th><th>Leçons</th><th>Exercices</th><th>Évaluations</th><th>Projet</th></tr></thead><tbody>${units.map(u=>`<tr><td><a href="#unit:${E(u.id)}">${E(u.title_fr)}</a></td><td>${u.lessons.length}</td><td>${n(u,ex)}</td><td>${(u.subjects||[]).filter(s=>s.assessment).length}</td><td>${u.integration_project?'oui':'—'}</td></tr>`).join('')}</tbody></table></div>`+(legacy?'<p><a href="#coverage">Consulter la couverture et les statuts éditoriaux</a></p>':''));}
K.paint=html=>frame(html);
function frame(body){root.innerHTML=`<header class="gs-top"><a href="${E(c.back)}">K Klassia</a><strong>${E(c.grade)}</strong></header><main class="gs-wrap"><p class="gs-notice">Édition pilote accompagnée · relecture pédagogique en cours</p>${body}</main>${K.tabBar(tabs(),activeTab())}`;K.rendered();}
function hero(title,description){return `<section class="gs-hero"><h1>${E(title)}</h1><p>${E(description)}</p></section>`;}
// Liste de leçons commune (K.lessonList, shared/ui.js).
const kind=st=>st==='A'?'done':st==='EC'?'doing':st==='R'?'review':'todo';
const item=(l,u)=>({href:'#lesson:'+encodeURIComponent(l.id),title:l.title,eyebrow:l.domain+' · '+u.id+(l.week?' · '+(l.week===4?'semaine 4, bilan':'semaine '+l.week):''),detail:l.objective,status:{label:status(progress[l.id]),kind:kind(progress[l.id])}});
function listUnits() {
 const cards = units.map(unit => ({
  href: '#unit:' + unit.id, title: unit.title_fr, translation: unit.title_en, code: unit.id,
  detail: unit.subcentres?.join(' · '), count: unit.lessons.length + ' leçons'
 }));
 frame(K.catalogue('Parcourir les unités', 'Choisis une unité, puis une leçon.', cards));
}
function showUnit(id){const u=units.find(x=>x.id===id);if(!u)return notFound();frame(`<a href="#units">← Toutes les unités</a>`+hero(u.title_fr,[u.title_en,u.project].filter(Boolean).join(' · ')||info.label)+(u.subjects?u.subjects.map(sj=>`<h2 class="klassia-unit-subject">${E(sj.name)}</h2>`+K.lessonList(u.lessons.filter(l=>l.subject===sj.id).map(l=>({...item(l,u),eyebrow:''})))).join(''):K.lessonList(u.lessons.map(l=>item(l,u))))+unitExtras(u));root.querySelectorAll('[data-print-unit]').forEach(b=>b.onclick=()=>K.printing.open(c.grade,b.dataset.printUnit,u.id,b.dataset.subject));if(legacy)fillPracticeBook(u);}
// Pages du manuel et figure d'une leçon (CE2), dans « Je retiens » ; guide de l'adulte.
function manualHtml(l){if(!l.figure&&!l.manual_sections?.length)return '';const fig=l.figure?`<img class="lesson-figure" src="${E(legacy?home+l.figure.src.replace(/^\.\//,''):l.figure.src)}" alt="${E(l.figure.alt)}">`:'';
 return fig+`<section class="manual-chapter">${(l.manual_sections||[]).map((sec,i)=>`<details class="manual-section" ${i===0?'open':''}><summary>${E(sec.title)}</summary><div class="manual-section-body">${sec.body?`<p class="preserve-lines">${E(sec.body)}</p>`:''}${sec.items?`<ul>${sec.items.map(x=>`<li>${E(x)}</li>`).join('')}</ul>`:''}${sec.table?`<div class="manual-table-wrap"><table><thead><tr>${sec.table.headers.map(x=>`<th>${E(x)}</th>`).join('')}</tr></thead><tbody>${sec.table.rows.map(row=>`<tr>${row.map(x=>`<td>${E(x)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`:''}</div></details>`).join('')}</section>`;}
const guideHtml=g=>g?`<h3>Guide de l’adulte</h3><p>${E(g.preparation||'')}</p><ul>${(g.observation||[]).map(x=>`<li>${E(x)}</li>`).join('')}</ul><p>${E(g.adaptation||'')}</p><p>${E(g.follow_up||'')}</p>`:'';
// Cahier pratique du CE2 (dictée préparée, problèmes posés), une fois par unité.
let practiceBook=null;const practiceData=()=>practiceBook||(practiceBook=get(home+'data/ce2-practice-v14.json').catch(()=>({units:{}})));
async function fillPracticeBook(u){const box=root.querySelector('[data-practice-book]');if(!box)return;const data=(await practiceData()).units[u.id];if(!data||!box.isConnected)return;const adult=K.isAdultSpace(),d=data.dictation;
 box.innerHTML=`<h2>Cahier pratique</h2>${d?`<h3>✍️ Dictée préparée · ${E(d.title)}</h3><p><b>Mots :</b> ${d.words.map(E).join(' · ')}</p><details><summary>Voir les phrases d’entraînement</summary>${d.sentences.map(x=>`<p>• ${E(x)}</p>`).join('')}</details><div class="gs-actions"><button type="button" data-fiche="dictee">Fiche élève / PDF</button>${adult?'<button type="button" data-fiche="dictee" data-adult>Guide adulte / PDF</button>':''}</div>`:''}${data.problems?.length?`<h3>🧮 Problèmes posés</h3><ol>${data.problems.map(x=>`<li><b>${E(x.title)}</b> — ${E(x.statement)}</li>`).join('')}</ol><div class="gs-actions"><button type="button" data-fiche="problemes">Fiche élève / PDF</button>${adult?'<button type="button" data-fiche="problemes" data-adult>Corrigé / PDF</button>':''}</div>`:''}`;
 box.hidden=false;box.querySelectorAll('[data-fiche]').forEach(b=>b.onclick=()=>K.printing.open(c.grade,b.dataset.fiche,u.id,undefined,b.hasAttribute('data-adult')));}
// Bilans de matière et projet d'intégration, quand l'unité en a (CE2) : mêmes clés d'enregistrement que l'ancien moteur.
const evalKey=u=>'klassia_evals:'+u.id,evalsOf=u=>{const v=K.read(evalKey(u),null);return v!==null?v:(u.id==='U1'?K.read('klassia_evals',{}):{});};
function unitExtras(u){const withEval=(u.subjects||[]).filter(s=>s.assessment),ev=evalsOf(u);
 return (withEval.length?`<section class="gs-card"><h2>Évaluations de l’unité</h2><div class="gs-actions">${withEval.map(s=>`<a href="#eval:${E(u.id)}:${encodeURIComponent(s.id)}">${E(s.name)}${ev[s.id]?` · ${E(ev[s.id].score)}/20`:''}</a>`).join('')}</div></section>`:'')
  +(legacy?`<section class="gs-card" data-practice-book hidden></section><section class="gs-card"><h2>Imprimer</h2><div class="gs-actions"><button type="button" data-print-unit="theme">Le thème entier / PDF</button>${(u.subjects||[]).map(s=>`<button type="button" data-print-unit="matiere" data-subject="${E(s.id)}">${E(s.name)}</button>`).join('')}</div></section>`:'')+(u.integration_project?`<section class="gs-card"><h2>Projet d’intégration</h2><p>${E(u.integration_project.title)}</p><div class="gs-actions"><a href="#project:${E(u.id)}">Ouvrir le projet</a></div></section>`:'');}
const evalFeedback=score=>score>=15?`<strong>Très bien — ${score}/20.</strong> Tu peux poursuivre tout en révisant ponctuellement les erreurs.`:score>=10?`<strong>${score}/20.</strong> Les bases sont présentes ; reprends les leçons liées aux erreurs avant de poursuivre.`:`<strong>${score}/20.</strong> Klassia recommande une remédiation ciblée et une nouvelle tentative.`;
function showEval(unitId,subjectId){const u=units.find(x=>x.id===unitId),sj=u?.subjects?.find(x=>x.id===subjectId),a=sj?.assessment;if(!a)return notFound();const e=evalsOf(u)[subjectId],en=subjectId==='EN';
 frame(`<a href="#unit:${E(u.id)}">← ${E(u.title_fr)}</a>`+hero(a.title,`${sj.name} · évaluation accompagnée · total ${a.total||20} points`)
  +`<ol class="klassia-eval">${a.items.map((it,i)=>`<li class="gs-card"><p class="eyebrow">${it.points} pt${it.points>1?'s':''}</p><p><b>${E(it.prompt)}</b></p>${K.correction.html(`corr_${subjectId}_${i}`,`<p class="preserve-lines">${E(it.answer)}</p>`,{en,save:'CE2:'+u.id+':'+subjectId+':bilan:'+i})}</li>`).join('')}</ol>`
  +`<section class="gs-card klassia-eval-score"><h2>Enregistrer mon score</h2><p>La correction est accompagnée : le score est saisi après comparaison avec les réponses proposées.</p><p><label>Score sur 20 <input id="evalScore" type="number" min="0" max="20" step="0.5" value="${e?.score??''}"></label> <button type="button" id="evalSave">Enregistrer</button></p><p id="evalMsg" role="status">${e?evalFeedback(Number(e.score)):''}</p></section>`
  +(sj.remediation?.length?`<section class="gs-card"><h2>Si certaines notions restent fragiles</h2><ul>${sj.remediation.map(x=>`<li>${E(x)}</li>`).join('')}</ul></section>`:''));
 root.querySelector('#evalSave').onclick=()=>{const input=root.querySelector('#evalScore'),v=input.value.trim()===''?NaN:Number(input.value),msg=root.querySelector('#evalMsg');if(!Number.isFinite(v)||v<0||v>20){msg.textContent='Entre un score compris entre 0 et 20.';return;}const all=evalsOf(u);all[subjectId]={score:v,date:new Date().toISOString()};K.write(evalKey(u),all);msg.innerHTML=evalFeedback(v);K.activity.log('evaluation',`Évaluation enregistrée : ${v}/20`,u.id);};}
function showProject(unitId){const u=units.find(x=>x.id===unitId),p=u?.integration_project;if(!p)return notFound();const key='klassia_project:'+u.id,state=K.read(key,{}),pct=()=>Math.round(p.tasks.filter((_,i)=>K.read(key,{})[i]).length*100/p.tasks.length);
 frame(`<a href="#unit:${E(u.id)}">← ${E(u.title_fr)}</a>`+hero(p.title,'Projet d’intégration : plusieurs matières autour d’une situation concrète.')
  +`<section class="gs-card"><h2>Mission</h2><p>${E(p.context)}</p></section><section class="gs-card"><h2>Travail à réaliser</h2><ul class="klassia-project-tasks">${p.tasks.map((x,i)=>`<li><label><input type="checkbox" data-project="${i}" ${state[i]?'checked':''}> ${E(x)}</label></li>`).join('')}</ul><p>Projet réalisé : <strong id="projectPct">${pct()} %</strong></p><progress id="projectBar" max="100" value="${pct()}"></progress></section>`
  +`<section class="gs-card"><h2>Barème</h2><ul>${p.rubric.map(x=>`<li>${E(x[0])} — <b>${x[1]} pt${x[1]>1?'s':''}</b></li>`).join('')}</ul><p><b>Total : ${p.total}/20</b></p></section>`);
 root.querySelectorAll('[data-project]').forEach(box=>box.onchange=()=>{const d=K.read(key,{});d[box.dataset.project]=box.checked;K.write(key,d);root.querySelector('#projectPct').textContent=pct()+' %';root.querySelector('#projectBar').value=pct();});}
function listSubjects() {
 const names = [...new Set(lessons.map(item => item.l.domain))];
 const cards = names.map(title => ({ title, href: '#subject:' + encodeURIComponent(title),
  count: lessons.filter(item => item.l.domain === title).length + ' leçons' }));
 frame(K.catalogue('Parcourir les matières', 'Les leçons de chaque matière sont réunies sur les huit unités.', cards));
}
const subjectNames={};
// Outils de référence proposés dans trois leçons de mathématiques du CE2.
const toolLink={'MA-U8-L4':['montants','Montants en lettres'],'MA-U2-L1':['nombres','Nombres'],'MA-U4-L3':['tables','Tables de multiplication']};
function showSubject(s){s=subjectNames[s]||s;const items=lessons.filter(x=>x.l.domain===s);if(!items.length)return notFound();frame(`<a href="#subjects">← Toutes les matières</a>`+hero(s,'Choisissez une leçon.')+K.lessonList(items.map(x=>item(x.l,x.u))));}
function listDomains(){frame(hero('Parcourir les domaines','Une matière peut contribuer à plusieurs domaines du programme.')+`<section class="gs-grid">${catalog.domains.map((d,i)=>`<a class="gs-card gs-picker" href="#domain:${i}"><h2>${E(d.title)}</h2><p>${E(d.subjects.join(' · '))}</p></a>`).join('')}</section>`);}
function showDomain(i){const d=catalog.domains[Number(i)];if(!d)return notFound();frame(`<a href="#domains">← Tous les domaines</a>`+hero(d.title,'Leçons rattachées à ce domaine.')+K.lessonList(lessons.filter(x=>d.subjects.includes(x.l.domain)).map(x=>item(x.l,x.u))));}
// Leçons en quatre étapes (ADR-014, M2) : une étape à la fois, ou toute la leçon si l'appareil l'a choisi (« Toute la leçon »).
const revealStep=el=>K.lessonSteps.reveal(el);
function showLesson(id){const found=lessons.find(x=>x.l.id===id);if(!found)return notFound();K.write(recentKey,{lessonId:id,at:Date.now()});const {l,u}=found,i=u.lessons.indexOf(l),en=l.domain.startsWith('English');
 const adult=K.isAdultSpace(), lang=en?'en-GB':'fr-FR', guided=Boolean(info.guided);
 const lab=en?['Learning goal','Understand','Worked example','Practise together','Your turn','Try again with help','Use it again','Materials']:['Objectif','Comprendre','Exemple expliqué','Ensemble','À toi de jouer','Si c’est difficile','Réinvestir','Matériel'];
 const practice = l.practice || [];
 const extra = practice.map((p, j) => {
  const transcript = p.listen && adult
   ? `<details class="adult-guide"><summary>${en?'Read the message (adult)':'Lire le message (adulte)'}</summary><p>${E(p.listen)}</p></details>`
   : '';
  const listening = p.listen ? `${K.speech.clip(p.audio,lang)}<div class="gs-actions" data-listening-practice="${j}"></div>${transcript}` : p.audio ? K.speech.clip(p.audio,lang) : '';
  const answer = `<p>${E(p.answer)}</p>${p.explanation?`<p>${E(p.explanation)}</p>`:''}${selfCheck(practiceKey(id,j),id,en)}`;
  // CE2 : la réponse écrite et le tracé restent rangés sous l'identifiant de l'exercice, comme depuis l'origine.
  const key=practiceKey(id,j),kept=legacy&&p.id?'CE2:'+p.id:key;
  if(K.exercises?.types.includes(p.type))return `<section class="practice-item"><h3>${en?'Practice':legacy?'Exercice':'Entraînement'} ${legacy?j+1:j+2}</h3><p>${E(p.prompt)}</p>${listening}${K.exercises.html(p,key,en)}</section>`;
  return `<section class="practice-item"><h3>${en?'Practice':legacy?'Exercice':'Entraînement'} ${legacy?j+1:j+2}</h3><p>${E(p.prompt)}</p>${listening}${p.ink?K.ink.pad(kept,p.ink):''}${K.correction.html(id+'_practice_'+j,answer,{en,ink:Boolean(p.ink),save:kept,record:key,check:shortCheck(p,p.prompt)})}</section>`;
 }).join('');
 const proposals=(l.domain.includes('national')?[]:(l.proposedWords||[])).map(w=>`<article><b>${E(w.concept)}</b> : ${w.forms.map(E).join(' / ')}<p>Sources : ${(w.sources||[]).map(E).join('; ')}</p><p>${E(Array.isArray(w.notes)?w.notes.join(' '):w.notes||'')}</p></article>`).join('');
 const M=K.lessonModel,model=M.fromLesson(l),has=M.filled(model),steps=M.STEPS.filter(x=>has[x.id]),next=i<u.lessons.length-1?u.lessons[i+1]:null;

 const content={
  decouvrir:`${guided?parentCard(l,en):''}${manualUrl&&l.domain.startsWith('Français')?'<p class="klassia-manual-ref" data-manual-ref hidden></p>':''}${l.prerequisites?`<p><b>${en?'Before starting':'Avant de commencer'} :</b> ${E(l.prerequisites)}</p>`:''}${K.lessonSupport(l.support,K.speech.clip(l.support?.audio,lang))}<section><h3>${lab[2]}</h3><p class="preserve-lines">${E(l.model)}</p></section>`,
  retenir:`<section><h3>${lab[1]}</h3><p class="preserve-lines">${E(l.course)}</p></section>${manualHtml(l)}${l.takeaway?`<section class="lesson-takeaway"><h3>${en?'Remember':'Je retiens'}</h3><p class="preserve-lines">${E(l.takeaway)}</p></section>`:''}`,
  exercer:`${toolLink[id]?`<p><a href="${home}outils.html#${toolLink[id][0]}">Outil · ${toolLink[id][1]}</a></p>`:''}${l.guided?`<section><h3>${lab[3]}</h3><p class="preserve-lines">${E(l.guided)}</p></section>`:''}${!l.exercise?'':`<section><h3>${lab[4]}</h3><p>${E(l.exercise)}</p>${K.ink.pad(c.grade+':'+id,l.ink)}${K.correction.html(id+'_exercise',`<p class="preserve-lines">${E(l.answer)}</p>${selfCheck(c.grade+':'+id,id,en)}`,{en,ink:true,inputId:'lessonResponse',rows:3,maxLength:1500,save:c.grade+':'+id,record:c.grade+':'+id,check:shortCheck(l,l.exercise)})}<p class="muted">${en?'Compare your answer with an adult. Handwritten work stays in this profile.':'Compare ta démarche avec un adulte. Tes tracés restent dans ce profil.'}</p></section>`}${extra}<div data-bassa-slot></div>`,
  point:`${K.lessonSteps.tallyHtml(legacy?id:c.grade+':'+id,en)}<p><b>${en?'Where are you with this lesson?':'Où en es-tu dans cette leçon ?'}</b></p><div class="gs-actions">${choices.map(st=>`<button data-progress="${st}" aria-pressed="${(progress[id]||'D')===st}">${status(st)}</button>`).join('')}<button id="printLesson">Imprimer / Print</button>${K.isAdultSpace()?'<button id="printLessonAdult">Corrigé adulte / PDF</button>':''}</div><p id="progressMessage" role="status"></p><p class="lesson-qcm-link" data-lesson-qcm hidden></p>${next?`<p><a class="lesson-next" href="#lesson:${encodeURIComponent(next.id)}">${en?'Next lesson':'Leçon suivante'} : ${E(next.title)} ›</a></p>`:''}${adult?`<details class="adult-guide"><summary>${lab[5]}</summary><p>${E(l.remediation)}</p><h3>${lab[6]}</h3><p>${E(l.transfer)}</p>${l.materials?`<p><b>${lab[7]} :</b> ${E(l.materials)}</p>`:''}${guideHtml(l.teacher_guide)}</details>`:''}${proposals?`<details class="bassa-proposals"><summary>Propositions bassa documentées, non validées</summary>${proposals}<p>Toutes les variantes présentées restent consultables. <a href="${E(c.back)}#bassa">Ouvrir l’atelier de réponses et d’arbitrage</a></p></details>`:''}<details class="lesson-sources"><summary>${en?'Sources and editorial status':'Sources et statut éditorial'}</summary><p>${source(l.source)}</p><p>À relire · ${E(l.editorial?.notes||'')}</p></details>`};
 const view=K.lessonSteps.html(steps.map(x=>({id:x.id,html:content[x.id]})),en),stepNav=view.nav,stepHtml=view.body,all=view.mode==='all';
 frame(`<nav class="lesson-breadcrumb" aria-label="Fil d’Ariane"><a href="#units">Unités</a> › <a href="#unit:${u.id}">${E(u.title_fr)}</a> › <a href="#subject:${encodeURIComponent(l.domain)}">${E(l.domain)}</a></nav><article class="gs-card lesson-card" data-lesson="${E(id)}" data-steps="${all?'all':'one'}" lang="${en?'en':'fr'}"><h1>${E(l.title)}</h1><p><b>${lab[0]} :</b> ${E(l.objective)}</p>${stepNav}${stepHtml}${guided?childScreen(l,en):''}</article><nav class="activity-browser" aria-label="Leçons de cette unité">${i>0?`<a href="#lesson:${u.lessons[i-1].id}">← Précédente</a>`:'<span></span>'}<span>${i+1} / ${u.lessons.length}</span>${i<u.lessons.length-1?`<a href="#lesson:${u.lessons[i+1].id}">Suivante →</a>`:'<span></span>'}</nav>`);
 K.lessonSteps.wire(root.querySelector('.lesson-card'));
 if(c.qcm&&!legacy)qcmBank().then(b=>{const s=b.series.find(x=>x.questions.some(q=>q.lecon===id)),el=root.querySelector('[data-lesson-qcm]');if(!s||!el||!el.isConnected)return;const n=s.questions.filter(q=>q.lecon===id).length;el.innerHTML=`<a href="#qcm:${encodeURIComponent(s.id)}">${en?'Check yourself':'Je vérifie avec le QCM'} « ${E(s.subject)} » · ${n} ${n>1?'questions liées':'question liée'} ›</a>`;el.hidden=false;}).catch(()=>{});
 root.querySelectorAll('[data-progress]').forEach(b=>b.onclick=()=>{progress=loadProgress();progress[id]=b.dataset.progress;saveProgress(progress);root.querySelectorAll('[data-progress]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));document.getElementById('progressMessage').textContent='Progression enregistrée : '+status(b.dataset.progress);if(b.dataset.progress!=='D'&&b.dataset.progress!=='EC')K.activity.log(b.dataset.progress==='R'?'review':'mastery',(b.dataset.progress==='R'?'Leçon à revoir':legacy?'Compréhension déclarée':'Leçon réalisée')+' : '+l.title,u.id);});
 K.activity.log('lesson','Leçon consultée : '+l.title,u.id);
 const lessonCard = root.querySelector('.lesson-card');
 reading(lessonCard,l);
 if(l.domain.includes('national'))K.Bassa?.mount(lessonCard.querySelector('[data-bassa-slot]')||lessonCard,c.grade,l.id);
 document.getElementById('printLesson').onclick=()=>K.printing.open(c.grade,'lecon',u.id,id);
 if(manualUrl)fillManualRef(units.indexOf(u)+1,/-R\d$/.test(l.id)?l.week:0);
 if(guided)wireChildScreen(l,lang);
 if(K.isAdultSpace())document.getElementById('printLessonAdult').onclick=()=>K.printing.open(c.grade,'lecon',u.id,id,true);
 if (!l.domain.includes('national')) {
  const title = en ? l.title.replace(/^Séquence pilote conservée : /, '') : l.title;
  const spokenText = [title,l.objective,l.course,l.support?.text,l.model,l.guided,l.exercise].filter(Boolean).join('. ');
  K.addSpeech(lessonCard, spokenText, lang);
  for (const player of lessonCard.querySelectorAll('[data-listening-practice]')) {
   K.addSpeech(player, practice[Number(player.dataset.listeningPractice)].listen, lang);
  }
  // Texte du manuel à écouter (CE2) : la lecture porte sur le seul passage, dans sa langue.
  (l.manual_sections || []).forEach((sec, k) => { if (sec.audio_lang && sec.body) K.addSpeech(lessonCard.querySelectorAll('.manual-section-body')[k], sec.body, sec.audio_lang); });
 }
}
function notFound(){frame(hero('Ressource introuvable','Ce lien ne correspond pas à une leçon de cette classe.')+'<a href="#units">Revenir aux unités</a>');}
function route(){document.querySelectorAll('body > .sil-child').forEach(e=>e.remove());document.documentElement.classList.remove('nursery-child-open');try{progress=loadProgress();const raw=decodeURIComponent(location.hash||'#home'),unitParam=new URLSearchParams(location.search).get('unit')||units[0].id,h={'#learn':'#units','#subjects-all':'#subjects','#domains-all':catalog.domains?'#domains':'#subjects','#progress':'#suivi','#revise':'#reviser','#project':'#project:'+unitParam}[raw]||(/^#reviseSubject:/.test(raw)?'#reviser':/^#qcm:\d+$/.test(raw)?'#qcm:'+unitParam+':'+raw.slice(5):/^#eval:[^:]+$/.test(raw)?'#eval:'+unitParam+':'+raw.slice(6):/^#domain-all:\d+$/.test(raw)?'#domain:'+raw.slice(12):/^#subject-all:/.test(raw)?'#subject:'+raw.slice(13):raw);if(legacy&&K.workshop?.route(h))return;if(h==='#home')return showHome();if(h==='#units')return listUnits();if(role()==='PARENT'&&/^#(qcm|project):/.test(h)){history.replaceState(history.state,'','#suivi');return showProgress();}if(h==='#suivi')return showProgress();if(h==='#admin')return showAdmin();if(h.startsWith('#eval:')){const [uid,sid]=h.slice(6).split(':');return showEval(uid,sid);}if(h.startsWith('#project:'))return showProject(h.slice(9));if(h==='#subjects')return listSubjects();if(h==='#domains'&&catalog.domains)return listDomains();if(h.startsWith('#unit:'))return showUnit(h.slice(6));if(h.startsWith('#subject:'))return showSubject(h.slice(9));if(h.startsWith('#domain:'))return showDomain(h.slice(8));if(h.startsWith('#lesson:'))return showLesson(h.slice(8));if(h==='#semaine')return showWeek().catch(()=>notFound());if(c.qcm&&h==='#reviser')return showReview().catch(()=>notFound());if(c.qcm&&h.startsWith('#qcm:'))return showSeries(h.slice(5)).catch(()=>notFound());notFound();}catch(e){notFound();}}
try{catalog=await get(c.catalog);units=await Promise.all(catalog.units.map(async u=>legacy?K.lessonModel.ce2Unit(u,await get(home+u.content)):u.lessons?u:get(new URL(u.path,new URL(c.catalog,location.href)))));// CE2 : une matière garde un seul nom d'une unité à l'autre (celui de la première unité) ; l'ancienne adresse #subject:FR reste valide.
 if(legacy)for(const u of units){for(const s of u.subjects||[])subjectNames[s.id]??=s.name;for(const l of u.lessons)if(subjectNames[l.subject])l.domain=subjectNames[l.subject];}
 // CE2 : les cinq domaines du programme, comme regroupement de navigation (une matière peut en servir plusieurs).
 if(legacy)catalog.domains=[['Connaissances fondamentales',['FR','EN','MA','SC','TI']],['Vie communautaire et intégration nationale',['SH','BA']],['Vie courante',['DP','AR','EP']],['Identité culturelle',['BA','AR']],['Culture numérique',['TI','MA','SC','FR','EN','AR']]].map(([title,ids])=>({title,subjects:ids.map(id=>subjectNames[id]).filter(Boolean)}));
 lessons=units.flatMap(u=>u.lessons.map(l=>({l,u})));window.addEventListener('hashchange',route);route();}catch(e){frame(hero('Chargement interrompu',e.message)+'<button onclick="location.reload()">Réessayer</button>');}
})();
