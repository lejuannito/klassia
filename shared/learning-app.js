(async()=>{
'use strict';
const K=Klassia,E=K.escape,c=window.KlassiaLearningConfig,root=document.getElementById('app');
const get=async url=>{const r=await fetch(url);if(!r.ok)throw Error('Ressource indisponible : '+url);return r.json();};
let catalog,units,lessons,progress;
// Shared « Continuer » card (shared/ui.js): last open lesson if unfinished, else the first unfinished one.
const recentKey='klassia_'+c.grade.toLowerCase()+'_recent_v1';
K.nextStep=()=>{if(!lessons)return null;const p=K.read(c.progressKey,{}),r=K.read(recentKey,null);const x=(r&&lessons.find(y=>y.l.id===r.lessonId&&p[y.l.id]!=='A'))||lessons.find(y=>p[y.l.id]==='EC')||lessons.find(y=>p[y.l.id]!=='A')||lessons[0];return x?{href:'#lesson:'+encodeURIComponent(x.l.id),title:x.l.title,meta:x.u.title_fr+' · '+x.l.domain,started:Boolean(r)||Object.keys(p).length>0}:null;};
const status=s=>s==='A'?'Réalisé':s==='EC'?'En cours':'À découvrir';
// « Cette semaine à l'école » (shared/week.js) and « Dans ton manuel » when the French textbook's table of contents is recorded.
const manualUrl={SIL:'../data/manuels/champions-francais-sil.json'}[c.grade];
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
 const review=[...bilans.map(l=>({...item(l),detail:l.domain+' · '+status(progress[l.id])})),...(u.project?[{title:'Projet de l’unité',href:'#unit:'+encodeURIComponent(u.id),detail:u.project}]:[]),...u.lessons.filter(l=>progress[l.id]!=='A'&&l.week!==4).map(l=>({...item(l),detail:l.domain+' · '+status(progress[l.id])}))];
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
 screen.querySelectorAll('[data-sil-close]').forEach(b=>b.onclick=()=>{show(false);if(b.hasAttribute('data-sil-done')){const target=root.querySelector('.answer-reveal');target?.scrollIntoView({block:'center'});target?.querySelector('[data-attempt-oral]')?.focus();}});
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
 const p=K.read(c.progressKey,{});if((p[lid]||'D')==='D'){p[lid]='EC';K.write(c.progressKey,p);progress=p;document.querySelectorAll('[data-progress]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.progress==='EC')));const m=document.getElementById('progressMessage');if(m)m.textContent='Progression enregistrée : '+status('EC');}
});
// Short answers (Lot 2e): accepted and rejected forms written in the content; the check never blocks the correction.
const shortCheck=(x,prompt)=>x.accept?{accept:x.accept,reject:x.reject||[],prompt}:null;
document.addEventListener('klassia:answer-checked',ev=>{const {record,verdict}=ev.detail||{};if(!record||!['correct','wrong'].includes(verdict))return;
 K.append('klassia_attempts',{kind:'short_answer',exercise:record,ok:verdict==='correct'});
 const lid=ev.target.closest('[data-lesson]')?.dataset.lesson,p=K.read(c.progressKey,{});if(lid&&(p[lid]||'D')==='D'){p[lid]='EC';K.write(c.progressKey,p);progress=p;document.querySelectorAll('[data-progress]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.progress==='EC')));}
});
// QCM reliés (lot 7) : une série de questions par unité et par matière ; après une erreur, « Revoir la leçon » ouvre la leçon vérifiée.
let bank=null;const qcmKey='klassia_'+c.grade.toLowerCase()+'_qcm_v1';
const qcmBank=async()=>bank||(bank=await get(c.qcm));
async function showReview(){const b=await qcmBank();if(location.hash!=='#reviser')return;const scores=K.read(qcmKey,{});
 const blocks=units.map((u,i)=>{const ss=b.series.filter(s=>s.unit===u.id);return ss.length?`<section class="gs-card klassia-qcm-unit"><h2>Unité ${i+1} · ${E(u.title_fr)}</h2><div class="gs-actions">${ss.map(s=>{const r=scores[s.id];return `<a href="#qcm:${E(s.id)}">${E(s.subject)}${r?` · ${r.score}/${r.total}`:''}</a>`;}).join('')}</div></section>`:'';}).join('');
 frame(hero('Réviser avec les QCM','Cinq questions par matière et par unité. Après une erreur, « Revoir la leçon » ouvre la leçon à relire.')+blocks);}
async function showSeries(id){const b=await qcmBank(),s=b.series.find(x=>x.id===id);if(!s)return notFound();if(location.hash!=='#qcm:'+id)return;
 const en=s.subject==='English',adult=K.isAdultSpace(),u=units.find(x=>x.id===s.unit),title=s.subject+' · '+(en?'Unit ':'Unité ')+(units.indexOf(u)+1);
 const lessonOf=q=>lessons.find(x=>x.l.id===q.lecon)?.l,link=l=>l?`<a href="#lesson:${encodeURIComponent(l.id)}">${en?'Review the lesson':'Revoir la leçon'} « ${E(l.title)} »</a>`:'';
 const back=`<a href="#reviser">← ${en?'All quizzes':'Toutes les séries'}</a>`;
 if(adult){frame(back+hero(title,'Corrigé adulte : bonne réponse et leçon vérifiée par chaque question.')+`<ol class="klassia-qcm-key">${s.questions.map(q=>`<li><b>${E(q.enonce)}</b><p>${E(q.choix[q.bonne])} — ${E(q.corrige)}</p><p class="muted">Leçon liée : ${E(lessonOf(q)?.title||q.lecon)}</p></li>`).join('')}</ol>`);return;}
 frame(back+hero(title,en?'Choose one answer for each question, then check.':'Choisis une réponse par question, puis corrige la série.')+`<form class="klassia-qcm" lang="${en?'en':'fr'}">${s.questions.map((q,i)=>`<fieldset class="klassia-qcm-question"><legend>${i+1}. ${E(q.enonce)}</legend>${K.shuffleOptions(q).map(o=>`<label><input type="radio" name="q${i}" value="${o.id}"><span>${E(o.text)}</span></label>`).join('')}<p class="klassia-qcm-feedback" data-feedback="${i}" hidden></p></fieldset>`).join('')}<button type="submit">${en?'Check my answers':'Corriger la série'}</button><div class="klassia-qcm-score" role="status"></div></form>`);
 const form=root.querySelector('.klassia-qcm');
 form.onsubmit=ev=>{ev.preventDefault();const out=form.querySelector('.klassia-qcm-score'),picks=s.questions.map((q,i)=>form.querySelector(`input[name="q${i}"]:checked`));
  if(picks.some(x=>!x)){out.textContent=en?'Answer every question first.':'Réponds à chaque question avant de corriger.';return;}
  let score=0;const review=new Map();
  s.questions.forEach((q,i)=>{const ok=Number(picks[i].value)===q.bonne,l=lessonOf(q),box=form.querySelector(`[data-feedback="${i}"]`);if(ok)score++;else if(l)review.set(l.id,link(l));
   box.hidden=false;box.dataset.ok=String(ok);box.innerHTML=`<b>${ok?(en?'Correct ✓':'Juste ✓'):(en?'Not yet':'À revoir')}</b> ${E(q.corrige)}${ok?'':' '+link(l)}`;});
  const total=s.questions.length;K.append('klassia_attempts',{kind:'qcm',grade:c.grade,unit:s.unit,series:s.id,score,total});
  const scores=K.read(qcmKey,{});scores[s.id]={score,total,at:new Date().toISOString()};K.write(qcmKey,scores);
  out.innerHTML=`<strong>${score}/${total}</strong> ${score===total?(en?'Well done!':'Bravo !'):(en?'Read the feedback, then review these lessons.':'Lis les corrections, puis revois ces leçons.')}${review.size?`<span class="klassia-qcm-review"><b>${en?'Lessons to review':'Leçons à revoir'}</b>${[...review.values()].join('')}</span>`:''}`;};
}
const source=s=>s?`<a href="${E(s.url||'#')}" target="_blank" rel="noopener">${E(s.title)} · ${E(s.pages||'')}</a>`:'';
function frame(body){root.innerHTML=`<header class="gs-top"><a href="${E(c.back)}">K Klassia</a><strong>${E(c.grade)}</strong></header><main class="gs-wrap"><p class="gs-notice">Édition pilote accompagnée · relecture pédagogique en cours</p>${body}</main>`;K.rendered();}
function hero(title,description){return `<section class="gs-hero"><h1>${E(title)}</h1><p>${E(description)}</p></section>`;}
function pick(l,u){return `<a class="gs-card gs-picker" href="#lesson:${encodeURIComponent(l.id)}"><p class="eyebrow">${E(l.domain)} · ${E(u.id)}${l.week?' · '+(l.week===4?'semaine 4, bilan':'semaine '+l.week):''}</p><h2>${E(l.title)}</h2><p>${E(l.objective)}</p><span>${status(progress[l.id])} · Ouvrir la leçon →</span></a>`;}
function listUnits() {
 const cards = units.map(unit => ({
  href: '#unit:' + unit.id, title: unit.title_fr, translation: unit.title_en, code: unit.id,
  detail: unit.subcentres?.join(' · '), count: unit.lessons.length + ' leçons'
 }));
 frame(K.catalogue('Parcourir les unités', 'Choisis une unité, puis une leçon.', cards));
}
function showUnit(id){const u=units.find(x=>x.id===id);if(!u)return notFound();frame(`<a href="#units">← Toutes les unités</a>`+hero(u.title_fr,u.title_en+' · '+u.project)+`<section class="gs-grid">${u.lessons.map(l=>pick(l,u)).join('')}</section>`);}
function listSubjects() {
 const names = [...new Set(lessons.map(item => item.l.domain))];
 const cards = names.map(title => ({ title, href: '#subject:' + encodeURIComponent(title),
  count: lessons.filter(item => item.l.domain === title).length + ' leçons' }));
 frame(K.catalogue('Parcourir les matières', 'Les leçons de chaque matière sont réunies sur les huit unités.', cards));
}
function showSubject(s){const items=lessons.filter(x=>x.l.domain===s);if(!items.length)return notFound();frame(`<a href="#subjects">← Toutes les matières</a>`+hero(s,'Choisissez une leçon.')+`<section class="gs-grid">${items.map(x=>pick(x.l,x.u)).join('')}</section>`);}
function listDomains(){frame(hero('Parcourir les domaines','Une matière peut contribuer à plusieurs domaines du programme.')+`<section class="gs-grid">${catalog.domains.map((d,i)=>`<a class="gs-card gs-picker" href="#domain:${i}"><h2>${E(d.title)}</h2><p>${E(d.subjects.join(' · '))}</p></a>`).join('')}</section>`);}
function showDomain(i){const d=catalog.domains[Number(i)];if(!d)return notFound();frame(`<a href="#domains">← Tous les domaines</a>`+hero(d.title,'Leçons rattachées à ce domaine.')+`<section class="gs-grid">${lessons.filter(x=>d.subjects.includes(x.l.domain)).map(x=>pick(x.l,x.u)).join('')}</section>`);}
function showLesson(id){const found=lessons.find(x=>x.l.id===id);if(!found)return notFound();K.write(recentKey,{lessonId:id,at:Date.now()});const {l,u}=found,i=u.lessons.indexOf(l),en=l.domain.startsWith('English');
 const adult=K.isAdultSpace(), lang=en?'en-GB':'fr-FR', guided=c.grade==='SIL';
 const lab=en?['Learning goal','Understand','Worked example','Practise together','Your turn','Try again with help','Use it again','Materials']:['Objectif','Comprendre','Exemple expliqué','Ensemble','À toi de jouer','Si c’est difficile','Réinvestir','Matériel'];
 const practice = l.practice || [];
 const extra = practice.map((p, j) => {
  const transcript = p.listen && adult
   ? `<details class="adult-guide"><summary>${en?'Read the message (adult)':'Lire le message (adulte)'}</summary><p>${E(p.listen)}</p></details>`
   : '';
  const listening = p.listen ? `${K.speech.clip(p.audio,lang)}<div class="gs-actions" data-listening-practice="${j}"></div>${transcript}` : '';
  const answer = `<p>${E(p.answer)}</p>${p.explanation?`<p>${E(p.explanation)}</p>`:''}${selfCheck(c.grade+':'+id+':entrainement:'+j,id,en)}`;
  return `<section class="practice-item"><h3>${en?'Practice':'Entraînement'} ${j+2}</h3><p>${E(p.prompt)}</p>${listening}${p.ink?K.ink.pad(c.grade+':'+id+':entrainement:'+j,p.ink):''}${K.correction.html(id+'_practice_'+j,answer,{en,ink:Boolean(p.ink),save:c.grade+':'+id+':entrainement:'+j,record:c.grade+':'+id+':entrainement:'+j,check:shortCheck(p,p.prompt)})}</section>`;
 }).join('');
 const proposals=(l.domain.includes('national')?[]:(l.proposedWords||[])).map(w=>`<article><b>${E(w.concept)}</b> : ${w.forms.map(E).join(' / ')}<p>Sources : ${(w.sources||[]).map(E).join('; ')}</p><p>${E(Array.isArray(w.notes)?w.notes.join(' '):w.notes||'')}</p></article>`).join('');
 frame(`<nav class="lesson-breadcrumb" aria-label="Fil d’Ariane"><a href="#units">Unités</a> › <a href="#unit:${u.id}">${E(u.title_fr)}</a> › <a href="#subject:${encodeURIComponent(l.domain)}">${E(l.domain)}</a></nav><article class="gs-card lesson-card" data-lesson="${E(id)}" lang="${en?'en':'fr'}"><h1>${E(l.title)}</h1><p><b>${lab[0]} :</b> ${E(l.objective)}</p>${guided?parentCard(l,en):''}${manualUrl&&l.domain.startsWith('Français')?'<p class="klassia-manual-ref" data-manual-ref hidden></p>':''}${l.prerequisites?`<p><b>${en?'Before starting':'Avant de commencer'} :</b> ${E(l.prerequisites)}</p>`:''}<section><h2>${lab[1]}</h2><p class="preserve-lines">${E(l.course)}</p></section>${K.lessonSupport(l.support,K.speech.clip(l.support?.audio,lang))}<section><h2>${lab[2]}</h2><p class="preserve-lines">${E(l.model)}</p></section><section><h2>${lab[3]}</h2><p>${E(l.guided)}</p></section><section><h2>${lab[4]}</h2><p>${E(l.exercise)}</p>${K.ink.pad(c.grade+':'+id,l.ink)}${K.correction.html(id+'_exercise',`<p class="preserve-lines">${E(l.answer)}</p>${selfCheck(c.grade+':'+id,id,en)}`,{en,ink:true,inputId:'lessonResponse',rows:3,maxLength:1500,save:c.grade+':'+id,record:c.grade+':'+id,check:shortCheck(l,l.exercise)})}<p class="muted">${en?'Compare your answer with an adult. Handwritten work stays in this profile.':'Compare ta démarche avec un adulte. Tes tracés restent dans ce profil.'}</p></section>${extra}${adult?`<details class="adult-guide"><summary>${lab[5]}</summary><p>${E(l.remediation)}</p><h3>${lab[6]}</h3><p>${E(l.transfer)}</p><p><b>${lab[7]} :</b> ${E(l.materials)}</p></details>`:''}${proposals?`<details class="bassa-proposals"><summary>Propositions bassa documentées, non validées</summary>${proposals}<p>Toutes les variantes présentées restent consultables. <a href="${E(c.back)}#bassa">Ouvrir l’atelier de réponses et d’arbitrage</a></p></details>`:''}<details class="lesson-sources"><summary>${en?'Sources and editorial status':'Sources et statut éditorial'}</summary><p>${source(l.source)}</p><p>À relire · ${E(l.editorial?.notes||'')}</p></details><div class="gs-actions">${['D','EC','A'].map(st=>`<button data-progress="${st}" aria-pressed="${(progress[id]||'D')===st}">${status(st)}</button>`).join('')}<button id="printLesson">Imprimer / Print</button>${K.isAdultSpace()?'<button id="printLessonAdult">Corrigé adulte / PDF</button>':''}</div><p id="progressMessage" role="status"></p>${guided?childScreen(l,en):''}</article><nav class="activity-browser" aria-label="Leçons de cette unité">${i>0?`<a href="#lesson:${u.lessons[i-1].id}">← Précédente</a>`:'<span></span>'}<span>${i+1} / ${u.lessons.length}</span>${i<u.lessons.length-1?`<a href="#lesson:${u.lessons[i+1].id}">Suivante →</a>`:'<span></span>'}</nav>`);
 root.querySelectorAll('[data-progress]').forEach(b=>b.onclick=()=>{progress=K.read(c.progressKey,{});progress[id]=b.dataset.progress;K.write(c.progressKey,progress);root.querySelectorAll('[data-progress]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));document.getElementById('progressMessage').textContent='Progression enregistrée : '+status(b.dataset.progress);});
 const lessonCard = root.querySelector('.lesson-card');
 reading(lessonCard,l);
 if(l.domain.includes('national'))K.Bassa?.mount(lessonCard,c.grade,l.id);
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
 }
}
function notFound(){frame(hero('Ressource introuvable','Ce lien ne correspond pas à une leçon de cette classe.')+'<a href="#units">Revenir aux unités</a>');}
function route(){document.querySelectorAll('body > .sil-child').forEach(e=>e.remove());document.documentElement.classList.remove('nursery-child-open');try{progress=K.read(c.progressKey,{});const h=decodeURIComponent(location.hash||'#units');if(h==='#units'||h==='#home')return listUnits();if(h==='#subjects')return listSubjects();if(h==='#domains')return listDomains();if(h.startsWith('#unit:'))return showUnit(h.slice(6));if(h.startsWith('#subject:'))return showSubject(h.slice(9));if(h.startsWith('#domain:'))return showDomain(h.slice(8));if(h.startsWith('#lesson:'))return showLesson(h.slice(8));if(h==='#semaine')return showWeek().catch(()=>notFound());if(c.qcm&&h==='#reviser')return showReview().catch(()=>notFound());if(c.qcm&&h.startsWith('#qcm:'))return showSeries(h.slice(5)).catch(()=>notFound());notFound();}catch(e){notFound();}}
try{catalog=await get(c.catalog);units=await Promise.all(catalog.units.map(u=>u.lessons?u:get(new URL(u.path,new URL(c.catalog,location.href)))));lessons=units.flatMap(u=>u.lessons.map(l=>({l,u})));window.addEventListener('hashchange',route);route();}catch(e){frame(hero('Chargement interrompu',e.message)+'<button onclick="location.reload()">Réessayer</button>');}
})();
