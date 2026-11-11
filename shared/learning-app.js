(async()=>{
'use strict';
const K=Klassia,E=K.escape,c=window.KlassiaLearningConfig,root=document.getElementById('app');
const get=async url=>{const r=await fetch(url);if(!r.ok)throw Error('Ressource indisponible : '+url);return r.json();};
let catalog,units,lessons,progress;
// Shared « Continuer » card (shared/ui.js): last open lesson if unfinished, else the first unfinished one.
const recentKey='klassia_'+c.grade.toLowerCase()+'_recent_v1';
K.nextStep=()=>{if(!lessons)return null;const p=K.read(c.progressKey,{}),r=K.read(recentKey,null);const x=(r&&lessons.find(y=>y.l.id===r.lessonId&&p[y.l.id]!=='A'))||lessons.find(y=>p[y.l.id]==='EC')||lessons.find(y=>p[y.l.id]!=='A')||lessons[0];return x?{href:'#lesson:'+encodeURIComponent(x.l.id),title:x.l.title,meta:x.u.title_fr+' · '+x.l.domain,started:Boolean(r)||Object.keys(p).length>0}:null;};
const status=s=>s==='A'?'Réalisé':s==='EC'?'En cours':'À découvrir';
// « As-tu réussi seul ? » after a correction, as in CE2: recorded in the attempts log; a lesson still « À découvrir » becomes « En cours ».
const lastSelf=sid=>[...K.read('klassia_attempts',[])].reverse().find(a=>a.kind==='self_report'&&a.exercise===sid);
function selfCheck(sid,lid,en){const last=lastSelf(sid),was=last?(last.ok?(en?'managed alone ✓':'réussi seul ✓'):(en?'to practise again':'à retravailler')):'';
 if(K.isAdultSpace())return last?`<p class="exercise-history">${en?'Child’s self-check':'Auto-évaluation de l’enfant'} : ${was}</p>`:'';
 return `<div class="self-check" data-self-check="${E(sid)}" data-lesson="${E(lid)}" data-lang="${en?'en':'fr'}"><span>${en?'Did you manage on your own?':'As-tu réussi seul ?'}</span><button type="button" data-self="0" aria-pressed="false">${en?'Not yet':'Pas encore'}</button><button type="button" data-self="1" aria-pressed="false">${en?'Yes':'Oui'} ✓</button><span class="self-result" data-self-result role="status"></span></div><p class="remediation" data-self-help hidden>${en?'Read the « Worked example » again, do « Practise together » with an adult, then try again.':'Relis « Exemple expliqué », refais « Ensemble » avec un adulte, puis essaie encore.'}</p>${last?`<p class="exercise-history">${en?'Last time':'La dernière fois'} : ${was}</p>`:''}`;}
document.addEventListener('click',ev=>{const b=ev.target.closest('[data-self]'),box=b?.closest('[data-self-check]');if(!box)return;
 const ok=b.dataset.self==='1',en=box.dataset.lang==='en',lid=box.dataset.lesson;
 K.append('klassia_attempts',{kind:'self_report',exercise:box.dataset.selfCheck,ok});
 box.querySelectorAll('[data-self]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
 box.querySelector('[data-self-result]').textContent=ok?(en?'Well done! When everything is done, choose « Réalisé » below.':'Bien joué ! Quand tout est réussi, choisis « Réalisé » en bas de la leçon.'):(en?'Keep going: try again with help.':'Continue : réessaie avec de l’aide.');
 box.parentElement.querySelector('[data-self-help]').hidden=ok;
 const p=K.read(c.progressKey,{});if((p[lid]||'D')==='D'){p[lid]='EC';K.write(c.progressKey,p);progress=p;document.querySelectorAll('[data-progress]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.progress==='EC')));const m=document.getElementById('progressMessage');if(m)m.textContent='Progression enregistrée : '+status('EC');}
});
const source=s=>s?`<a href="${E(s.url||'#')}" target="_blank" rel="noopener">${E(s.title)} · ${E(s.pages||'')}</a>`:'';
function frame(body){root.innerHTML=`<header class="gs-top"><a href="${E(c.back)}">K Klassia</a><strong>${E(c.grade)}</strong></header><main class="gs-wrap"><p class="gs-notice">Édition pilote accompagnée · relecture pédagogique en cours</p>${body}</main>`;K.rendered();}
function hero(title,description){return `<section class="gs-hero"><h1>${E(title)}</h1><p>${E(description)}</p></section>`;}
function pick(l,u){return `<a class="gs-card gs-picker" href="#lesson:${encodeURIComponent(l.id)}"><p class="eyebrow">${E(l.domain)} · ${E(u.id)}</p><h2>${E(l.title)}</h2><p>${E(l.objective)}</p><span>${status(progress[l.id])} · Ouvrir la leçon →</span></a>`;}
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
 const adult=K.isAdultSpace(), lang=en?'en-GB':'fr-FR';
 const lab=en?['Learning goal','Understand','Worked example','Practise together','Your turn','Try again with help','Use it again','Materials']:['Objectif','Comprendre','Exemple expliqué','Ensemble','À toi de jouer','Si c’est difficile','Réinvestir','Matériel'];
 const practice = l.practice || [];
 const extra = practice.map((p, j) => {
  const transcript = p.listen && adult
   ? `<details class="adult-guide"><summary>${en?'Read the message (adult)':'Lire le message (adulte)'}</summary><p>${E(p.listen)}</p></details>`
   : '';
  const listening = p.listen ? `${K.speech.clip(p.audio,lang)}<div class="gs-actions" data-listening-practice="${j}"></div>${transcript}` : '';
  const answer = `<p>${E(p.answer)}</p>${p.explanation?`<p>${E(p.explanation)}</p>`:''}${selfCheck(c.grade+':'+id+':entrainement:'+j,id,en)}`;
  return `<section class="practice-item"><h3>${en?'Practice':'Entraînement'} ${j+2}</h3><p>${E(p.prompt)}</p>${listening}${p.ink?K.ink.pad(c.grade+':'+id+':entrainement:'+j,p.ink):''}${K.correction.html(id+'_practice_'+j,answer,{en,ink:Boolean(p.ink),save:c.grade+':'+id+':entrainement:'+j})}</section>`;
 }).join('');
 const proposals=(l.domain.includes('national')?[]:(l.proposedWords||[])).map(w=>`<article><b>${E(w.concept)}</b> : ${w.forms.map(E).join(' / ')}<p>Sources : ${(w.sources||[]).map(E).join('; ')}</p><p>${E(Array.isArray(w.notes)?w.notes.join(' '):w.notes||'')}</p></article>`).join('');
 frame(`<nav class="lesson-breadcrumb" aria-label="Fil d’Ariane"><a href="#units">Unités</a> › <a href="#unit:${u.id}">${E(u.title_fr)}</a> › <a href="#subject:${encodeURIComponent(l.domain)}">${E(l.domain)}</a></nav><article class="gs-card lesson-card" data-lesson="${E(id)}" lang="${en?'en':'fr'}"><h1>${E(l.title)}</h1><p><b>${lab[0]} :</b> ${E(l.objective)}</p>${l.prerequisites?`<p><b>${en?'Before starting':'Avant de commencer'} :</b> ${E(l.prerequisites)}</p>`:''}<section><h2>${lab[1]}</h2><p class="preserve-lines">${E(l.course)}</p></section>${K.lessonSupport(l.support,K.speech.clip(l.support?.audio,lang))}<section><h2>${lab[2]}</h2><p class="preserve-lines">${E(l.model)}</p></section><section><h2>${lab[3]}</h2><p>${E(l.guided)}</p></section><section><h2>${lab[4]}</h2><p>${E(l.exercise)}</p>${K.ink.pad(c.grade+':'+id,l.ink)}${K.correction.html(id+'_exercise',`<p class="preserve-lines">${E(l.answer)}</p>${selfCheck(c.grade+':'+id,id,en)}`,{en,ink:true,inputId:'lessonResponse',rows:3,maxLength:1500,save:c.grade+':'+id})}<p class="muted">${en?'Compare your answer with an adult. Handwritten work stays in this profile.':'Compare ta démarche avec un adulte. Tes tracés restent dans ce profil.'}</p></section>${extra}${adult?`<details class="adult-guide"><summary>${lab[5]}</summary><p>${E(l.remediation)}</p><h3>${lab[6]}</h3><p>${E(l.transfer)}</p><p><b>${lab[7]} :</b> ${E(l.materials)}</p></details>`:''}${proposals?`<details class="bassa-proposals"><summary>Propositions bassa documentées, non validées</summary>${proposals}<p>Toutes les variantes présentées restent consultables. <a href="${E(c.back)}#bassa">Ouvrir l’atelier de réponses et d’arbitrage</a></p></details>`:''}<details class="lesson-sources"><summary>${en?'Sources and editorial status':'Sources et statut éditorial'}</summary><p>${source(l.source)}</p><p>À relire · ${E(l.editorial?.notes||'')}</p></details><div class="gs-actions">${['D','EC','A'].map(st=>`<button data-progress="${st}" aria-pressed="${(progress[id]||'D')===st}">${status(st)}</button>`).join('')}<button id="printLesson">Imprimer / Print</button>${K.isAdultSpace()?'<button id="printLessonAdult">Corrigé adulte / PDF</button>':''}</div><p id="progressMessage" role="status"></p></article><nav class="activity-browser" aria-label="Leçons de cette unité">${i>0?`<a href="#lesson:${u.lessons[i-1].id}">← Précédente</a>`:'<span></span>'}<span>${i+1} / ${u.lessons.length}</span>${i<u.lessons.length-1?`<a href="#lesson:${u.lessons[i+1].id}">Suivante →</a>`:'<span></span>'}</nav>`);
 root.querySelectorAll('[data-progress]').forEach(b=>b.onclick=()=>{progress=K.read(c.progressKey,{});progress[id]=b.dataset.progress;K.write(c.progressKey,progress);root.querySelectorAll('[data-progress]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));document.getElementById('progressMessage').textContent='Progression enregistrée : '+status(b.dataset.progress);});
 const lessonCard = root.querySelector('.lesson-card');
 if(l.domain.includes('national'))K.Bassa?.mount(lessonCard,c.grade,l.id);
 document.getElementById('printLesson').onclick=()=>K.printing.open(c.grade,'lecon',u.id,id);
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
function route(){try{progress=K.read(c.progressKey,{});const h=decodeURIComponent(location.hash||'#units');if(h==='#units'||h==='#home')return listUnits();if(h==='#subjects')return listSubjects();if(h==='#domains')return listDomains();if(h.startsWith('#unit:'))return showUnit(h.slice(6));if(h.startsWith('#subject:'))return showSubject(h.slice(9));if(h.startsWith('#domain:'))return showDomain(h.slice(8));if(h.startsWith('#lesson:'))return showLesson(h.slice(8));notFound();}catch(e){notFound();}}
try{catalog=await get(c.catalog);units=await Promise.all(catalog.units.map(u=>u.lessons?u:get(new URL(u.path,new URL(c.catalog,location.href)))));lessons=units.flatMap(u=>u.lessons.map(l=>({l,u})));window.addEventListener('hashchange',route);route();}catch(e){frame(hero('Chargement interrompu',e.message)+'<button onclick="location.reload()">Réessayer</button>');}
})();
