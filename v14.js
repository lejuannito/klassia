(() => {
'use strict';
const PRACTICE_URL='./data/ce2-practice-v14.json';
let practiceV14=null, allUnitsV14=null;
const esc14=Klassia.escape;
fetch(PRACTICE_URL).then(r=>{if(!r.ok)throw Error('Cahier pratique indisponible');return r.json();}).then(x=>{practiceV14=x;decorateV14();}).catch(console.warn);
async function allUnits(){
 if(allUnitsV14)return allUnitsV14;
 allUnitsV14=await Promise.all(catalog.units.map(async meta=>{const r=await fetch(meta.content);if(!r.ok)throw Error('Unité indisponible : '+meta.id);return {meta,content:await r.json()};}));
 return allUnitsV14;
}
function currentSubjectId(){
  const h=decodeURIComponent(location.hash||'');
  if(h.startsWith('#subject:'))return h.slice(9);
  if(h.startsWith('#lesson:')){
    const id=h.slice(8);
    for(const s of content?.subjects||[])if(s.lessons?.some(l=>l.id===id))return s.id;
  }
  return null;
}
function currentLessonObj(){
  const h=decodeURIComponent(location.hash||'');
  if(!h.startsWith('#lesson:'))return null;
  const id=h.slice(8);
  for(const s of content?.subjects||[]){const l=s.lessons?.find(x=>x.id===id);if(l)return {s,l};}
  return null;
}
function openPrint(fiche,id,adult=false){
 Klassia.printing.open('CE2',fiche,currentUnit.id,id,adult);
}
function injectPractice(){
  if(!practiceV14||!currentUnit)return;
  const id=currentSubjectId();if(!['FR','MA'].includes(id))return;
  const hero=document.querySelector('.subject-hero');if(!hero||document.querySelector('.practice-v14'))return;
  const u=practiceV14.units[currentUnit.id];if(!u)return;
  const adult=Klassia.isAdultSpace();
  let html='';
  if(id==='FR'){
    const d=u.dictation;
    html=`<section class="practice-v14"><div class="practice-title"><div><div class="eyebrow">CAHIER PRATIQUE</div><h2>✍️ Dictée préparée</h2><p>Mots, phrases d’entraînement puis dictée bilan à faire avec un adulte.</p></div></div><div class="practice-card"><h3>${esc14(d.title)}</h3><p><b>Mots :</b> ${d.words.map(esc14).join(' · ')}</p><details><summary>Voir les phrases d’entraînement</summary>${d.sentences.map(x=>`<p>• ${esc14(x)}</p>`).join('')}</details><div class="practice-actions"><button class="btn soft" id="dictStudentV14">🖨 Fiche élève / PDF</button>${adult?'<button class="btn soft" id="dictAdultV14">🖨 Guide adulte / PDF</button>':''}</div></div></section>`;
  }else{
    html=`<section class="practice-v14"><div class="practice-title"><div><div class="eyebrow">CAHIER PRATIQUE</div><h2>🧮 Problèmes posés</h2><p>Lire, chercher les données utiles, choisir l’opération, la poser et écrire une phrase-réponse.</p></div></div>${u.problems.map((p,i)=>`<div class="practice-card"><h3>${i+1}. ${esc14(p.title)}</h3><p>${esc14(p.statement)}</p>${adult?`<span class="pill">${esc14(p.skill)}</span>`:''}</div>`).join('')}<div class="practice-actions"><button class="btn soft" id="problemsStudentV14">🖨 Fiche élève / PDF</button>${adult?'<button class="btn soft" id="problemsAnswerV14">🖨 Corrigé / PDF</button>':''}</div></section>`;
  }
  hero.insertAdjacentHTML('afterend',html);
  const [pupilId,adultId,fiche]=id==='FR'?['dictStudentV14','dictAdultV14','dictee']:['problemsStudentV14','problemsAnswerV14','problemes'];
  document.getElementById(pupilId).onclick=()=>openPrint(fiche);
  if(adult)document.getElementById(adultId).onclick=()=>openPrint(fiche,null,true);
}

async function subjectsAllPage(){
 const units = await allUnits();
 if (location.hash !== '#subjects-all') return;
 const cards = (units[0]?.content.subjects || []).map(subject => {
  const count = units.reduce((n, unit) => n + (unit.content.subjects.find(item => item.id === subject.id)?.lessons.length || 0), 0);
  return { title: subject.name, count: count + ' leçons', href: '#subject-all:' + encodeURIComponent(subject.id) };
 });
 shell(Klassia.catalogue('Parcourir les matières', 'Choisis une matière pour voir les unités qui la proposent.', cards), 'learn');
}
async function subjectAllPage(id){
 const units = await allUnits();
 if (location.hash !== '#subject-all:' + encodeURIComponent(id)) return;
 const cards = [];
 let title = id;
 for (const {meta, content} of units) {
  const subject = content.subjects.find(item => item.id === id);
  if (!subject) continue;
  title = subject.name;
  cards.push({ title: meta.title, code: meta.id, href: '?unit=' + meta.id + '#subject:' + encodeURIComponent(id),
   count: subject.lessons.length + (subject.lessons.length === 1 ? ' leçon' : ' leçons'),
   detail: subject.lessons.slice(0, 4).map(lesson => lesson.title).join(' · ') });
 }
 const actions = '<div class="print-actions-v14"><a href="#subjects-all">← Toutes les matières</a> <button class="btn soft" id="printSubAllV14">🖨 Imprimer / PDF</button></div>';
 shell(actions + Klassia.catalogue(title, 'Choisis une unité pour ouvrir ses leçons.', cards), 'learn');
 document.getElementById('printSubAllV14').onclick = () => openPrint('matiere-complete', id);
}
const domainGroups=[
 ['Connaissances fondamentales',['FR','EN','MA','SC','TI']],
 ['Vie communautaire et intégration nationale',['SH','BA']],
 ['Vie courante',['DP','AR','EP']],
 ['Identité culturelle',['BA','AR']],
 ['Culture numérique',['TI','MA','SC','FR','EN','AR']]
];
async function domainsPage(index){
 const all=await allUnits(),g=domainGroups[index];
 let body='<h1>'+esc14(g?g[0]:'Parcourir les domaines')+'</h1><p>Regroupement de navigation transversal : une matière peut contribuer à plusieurs domaines. Ce classement ne certifie pas la couverture du curriculum.</p>';
 if(!g)body+='<div class="gs-grid">'+domainGroups.map((d,i)=>`<a class="gs-card" href="#domain-all:${i}"><h2>${esc14(d[0])}</h2><p>${d[1].map(id=>esc14(subjectMeta(id).name)).join(' · ')}</p></a>`).join('')+'</div>';
 else {body+='<a href="#domains-all">← Domaines</a>';for(const u of all){body+=`<h2>${esc14(u.meta.title)}</h2><div class="gs-grid">`;for(const sub of u.content.subjects.filter(x=>g[1].includes(x.id)))for(const l of sub.lessons)body+=`<a class="gs-card" href="?unit=${u.meta.id}#lesson:${encodeURIComponent(l.id)}"><b>${esc14(l.title)}</b><p>${esc14(sub.name)}</p></a>`;body+='</div>';}}
 shell(body,'learn');
}
function injectPrintActions(){
  if(location.hash==='#learn'&&document.querySelector('.klassia-catalogue-heading')&&!document.getElementById('printUnitV14')){
    const ph=document.querySelector('.klassia-catalogue-heading');
    ph.insertAdjacentHTML('beforebegin',`<div class="print-actions-v14"><button class="btn soft" id="printUnitV14">🖨 Thème / PDF</button></div>`);
    document.getElementById('printUnitV14').onclick=()=>openPrint('theme');
  }
  if(location.hash.startsWith('#subject:')){
    const hero=document.querySelector('.subject-hero');
    if(hero&&!hero.querySelector('.print-actions-v14')){
      hero.insertAdjacentHTML('beforeend',`<div class="print-actions-v14"><button class="btn soft" id="printSubV14">🖨 Matière / PDF</button><button class="btn soft" id="allThemesSubV14">8 thèmes</button></div>`);
      document.getElementById('printSubV14').onclick=()=>openPrint('matiere',currentSubjectId());
      document.getElementById('allThemesSubV14').onclick=()=>location.hash='#subject-all:'+encodeURIComponent(currentSubjectId());
    }
  }
  if(location.hash.startsWith('#lesson:')){
    const h=document.querySelector('.lesson-header');
    if(h&&!h.querySelector('.print-actions-v14')){
      h.insertAdjacentHTML('beforeend',`<div class="print-actions-v14"><button class="btn soft" id="printLessonV14">🖨 Imprimer / PDF</button>${Klassia.isAdultSpace()?'<button class="btn soft" id="printLessonAdultV14">Corrigé adulte / PDF</button>':''}</div>`);
      const id=currentLessonObj()?.l.id;
      document.getElementById('printLessonV14').onclick=()=>openPrint('lecon',id);
      if(Klassia.isAdultSpace())document.getElementById('printLessonAdultV14').onclick=()=>openPrint('lecon',id,true);
    }
  }
}
async function coveragePage(){
 const r=await fetch('./data/coverage.json');if(!r.ok)throw Error('Inventaire indisponible');const data=await r.json();if(location.hash!=='#coverage')return;
 const key='klassia_editorial_reviews_v1',read=()=>{try{return JSON.parse(localStorage.getItem(key)||'{}')}catch{return {}}},save=x=>localStorage.setItem(key,JSON.stringify(x));
 shell(`<h1>Revue éditoriale</h1><p>${esc14(data.notice)}</p><section class="review-notice"><h2>Revoir et enregistrer une décision</h2><p>Choisissez « À relire », « Validé » ou « À corriger », indiquez le référent, ce qui a été examiné et les réserves. La décision est enregistrée sur cet appareil. Exportez le relevé pour le transmettre à la personne qui maintient les contenus. Une validation locale ne publie pas le contenu sur le site.</p><label>Nom du référent <input id="reviewerName" maxlength="100" placeholder="Nom et qualité du relecteur"></label><p><button class="btn primary" id="exportReviews">Exporter le relevé des décisions</button> <a class="btn soft" href="#bassa">Ouvrir l’atelier Bassa</a></p><p id="reviewMessage" role="status"></p></section><label>Classe <select id="coverageGrade"><option>CE2</option><option>MS</option><option>GS</option><option>SIL</option><option>CE1</option></select></label><label>Rechercher <input id="coverageSearch" type="search"></label><div id="coverageResults"></div>`,'coverage');
 const state=read();try{const g=sessionStorage.getItem('klassia_review_grade');if(['CE2','MS','GS','SIL','CE1'].includes(g))document.getElementById('coverageGrade').value=g;}catch{}
 document.getElementById('reviewerName').value=state.reviewer||'';
 document.getElementById('exportReviews').onclick=()=>{state.reviewer=document.getElementById('reviewerName').value.trim();save(state);const payload={format:'klassia-editorial-review',version:1,exported_at:new Date().toISOString(),reviews:state.items||{}};const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));a.download=`Klassia-revue-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);document.getElementById('reviewMessage').textContent=`${Object.keys(state.items||{}).length} décisions exportées.`;};
 function resourceLink(x){if(x.grade==='CE2')return `./?unit=${x.unit}#lesson:${x.id}`;if(['MS','GS'].includes(x.grade))return `./${x.grade.toLowerCase()}/?theme=${x.unit}#domain:${x.subject}:${Math.max(0,Number(x.id.match(/(\d+)$/)?.[1]||1)-1)}`;return `./${x.grade.toLowerCase()}/#lesson:${x.id}`;}
 function draw(){const grade=document.getElementById('coverageGrade').value,q=document.getElementById('coverageSearch').value.toLocaleLowerCase('fr');const rows=data.items.filter(x=>x.grade===grade&&(x.title+' '+x.id+' '+x.unit).toLocaleLowerCase('fr').includes(q));document.getElementById('coverageResults').innerHTML=`<p>${rows.length} ressources ; ${rows.filter(x=>x.generic_discovery).length} découvertes encore génériques.</p>`+rows.map(x=>{const v=state.items?.[x.id]||{};return `<details class="adult-guide"><summary>${esc14(x.id)} · ${esc14(x.title)}${v.status?` · ${esc14(v.status)}`:''}</summary><p><a class="btn soft" href="${esc14(resourceLink(x))}" target="_blank" rel="noopener">Consulter le contenu et ses exercices ↗</a></p><p>${esc14(x.source)}</p><ul>${x.objectives.map(o=>`<li>${esc14(o)}</li>`).join('')}</ul><label>Décision <select data-review="${esc14(x.id)}" class="review-status"><option value="in_review" ${!v.status||v.status==='in_review'?'selected':''}>À relire</option><option value="validated" ${v.status==='validated'?'selected':''}>Validé</option><option value="revise" ${v.status==='revise'?'selected':''}>À corriger</option></select></label><label>Périmètre examiné <input class="review-scope" data-id="${esc14(x.id)}" value="${esc14(v.scope||'')}" placeholder="Objectifs, exemples, exercices…"></label><label>Réserves / commentaires <textarea class="review-notes" data-id="${esc14(x.id)}">${esc14(v.notes||'')}</textarea></label><button class="btn soft save-review" data-id="${esc14(x.id)}">Enregistrer cette décision</button><p>${v.date?`Dernière décision locale : ${esc14(v.date)} par ${esc14(v.reviewer||'')}`:'Aucune décision enregistrée sur cet appareil.'}</p></details>`}).join('');document.querySelectorAll('.save-review').forEach(b=>b.onclick=()=>{const id=b.dataset.id,reviewer=document.getElementById('reviewerName').value.trim(),status=document.querySelector(`[data-review="${CSS.escape(id)}"]`).value,scope=document.querySelector(`.review-scope[data-id="${CSS.escape(id)}"]`).value.trim(),notes=document.querySelector(`.review-notes[data-id="${CSS.escape(id)}"]`).value.trim();if(!reviewer||!scope){document.getElementById('reviewMessage').textContent='Indiquez le nom du référent et le périmètre examiné.';return;}state.reviewer=reviewer;state.items={...(state.items||{}),[id]:{status,reviewer,scope,notes,date:new Date().toISOString()}};save(state);document.getElementById('reviewMessage').textContent='Décision enregistrée sur cet appareil.';draw();});}
 document.getElementById('coverageGrade').onchange=draw;document.getElementById('coverageSearch').oninput=draw;draw();
}
async function bassaPage(){
 const r=await fetch('./data/bassa-lexicon-variants.json');if(!r.ok)throw Error('Lexique Bassa indisponible');const data=await r.json();if(location.hash!=='#bassa')return;
 const rows=data.entries,reviews=()=>{try{return JSON.parse(localStorage.getItem('klassia_bassa_review_v1')||'{}')}catch{return {}}},saveReviews=x=>localStorage.setItem('klassia_bassa_review_v1',JSON.stringify(x));
 const canRecord=Klassia.BassaRecorder?.canEdit();
 const recorderPanel=canRecord
  ? '<section id="bassaRecorder" class="review-notice bassa-recorder" aria-label="Prises Bassa"></section>'
  : '<section class="review-notice"><h2>Prises du pilote</h2><p>Pour enregistrer BA002, BA004, BA005 ou BA006 et consigner l’avis du référent, ouvrez l’espace Enseignant.</p><button class="btn primary" data-bassa-teacher type="button">Passer en espace Enseignant</button></section>';
 shell(`<h1>Atelier Bassa</h1>${recorderPanel}<h2>Formes proposées et sources</h2><p class="review-notice"><b>Exercice provisoire :</b> toutes les formes documentées ci-dessous sont acceptées comme réponses. Elles ne sont pas pour autant validées linguistiquement ni pédagogiquement. Les variantes et leurs sources restent visibles.</p><details class="adult-guide" id="bassaWriting" hidden><summary>Écrire le bassa : lettres et tons (repères à relire)</summary></details><label>Rechercher un mot <input id="bassaSearch" type="search" placeholder="Ex. maison, maison / building"></label><div id="bassaResults"></div><p><a href="#coverage">Ouvrir la revue éditoriale et ses consignes</a></p>`,'bassa');
 const workshop=document.getElementById('bassaRecorder');
 if(workshop){Klassia.BassaRecorder.mount(workshop,rows);workshop.addEventListener('klassia:bassa-audio',draw);}
 const norm=s=>String(s||'').normalize('NFC').trim().replace(/\s+/g,' ').toLocaleLowerCase();
 function draw(){const query=document.getElementById('bassaSearch').value.toLocaleLowerCase('fr'),decisions=reviews();const found=rows.filter(x=>(x.id+' '+x.concept+' '+x.forms.join(' ')+' '+x.sources.join(' ')).toLocaleLowerCase('fr').includes(query));document.getElementById('bassaResults').innerHTML=`<p>${found.length} traductions proposées à partir du lexique documentaire. Par défaut toutes les formes sont acceptées à l’entraînement avec la mention « proposition non validée ».</p>`+found.map((x,i)=>{const decisionsFor=decisions[x.concept]||{};return `<article class="adult-guide"><h2>${esc14(x.concept)}</h2><div data-bassa-audio="${esc14(x.id)}"></div><p>Exercice : écris une forme bassa correspondant au concept. Toutes les formes documentées restent acceptées pendant l’arbitrage.</p><p><input class="bassa-answer" aria-label="Réponse à l’exercice : ${esc14(x.concept)}" data-index="${i}"> <button class="btn soft bassa-check" data-index="${i}">Vérifier</button></p><p class="bassa-feedback" id="bassa-feedback-${i}" role="status">Aucune note : exercice d’entraînement, pas une évaluation certificative.</p><details><summary>Propositions, sources et arbitrage enseignant</summary><p><b>Sources documentaires :</b> ${x.sources.map(esc14).join(' · ')}</p>${x.notes.length?`<ul>${x.notes.map(n=>`<li>${esc14(n)}</li>`).join('')}</ul>`:''}<ul>${x.forms.map((f,j)=>{const d=decisionsFor[f]||{};return `<li><b>${esc14(f)}</b> · ${esc14(d.decision==='exclude'?'Signalée à revoir — toujours acceptée à l’entraînement':d.decision==='retain'?'Retenue provisoirement par arbitrage enseignant':'Proposition documentaire non validée')} <label>Décision <select class="bassa-decision" data-concept="${esc14(x.concept)}" data-form="${esc14(f)}"><option value="pending" ${!d.decision||d.decision==='pending'?'selected':''}>Garder en proposition</option><option value="retain" ${d.decision==='retain'?'selected':''}>Retenir</option><option value="exclude" ${d.decision==='exclude'?'selected':''}>Signaler à revoir</option></select></label> <input class="bassa-note" data-concept="${esc14(x.concept)}" data-form="${esc14(f)}" value="${esc14(d.notes||'')}" placeholder="Motif (facultatif)"></li>`}).join('')}</ul><button class="btn soft bassa-save" data-concept="${esc14(x.concept)}">Enregistrer l’arbitrage</button></details></article>`}).join('');Klassia.Bassa.mountAudio(document.getElementById('bassaResults'),found);document.querySelectorAll('.bassa-save').forEach(b=>b.onclick=()=>{const concept=b.dataset.concept,all=reviews(),items={};document.querySelectorAll(`.bassa-decision[data-concept="${CSS.escape(concept)}"]`).forEach(s=>{const form=s.dataset.form,n=document.querySelector(`.bassa-note[data-concept="${CSS.escape(concept)}"][data-form="${CSS.escape(form)}"]`).value.trim();items[form]={decision:s.value,notes:n,reviewer:Klassia.profile().name,date:new Date().toISOString()}});all[concept]=items;saveReviews(all);draw()});document.querySelectorAll('.bassa-answer').forEach(inp=>inp.onfocus=()=>{const row=inp.closest('p');if(row.nextElementSibling?.classList.contains('bassa-keys'))return;document.querySelector('#bassaResults .bassa-keys')?.remove();row.after(Klassia.Bassa.keys(inp));});document.querySelectorAll('.bassa-check').forEach(b=>b.onclick=()=>{const i=Number(b.dataset.index),x=found[i],input=document.querySelector(`.bassa-answer[data-index="${i}"]`),msg=document.getElementById(`bassa-feedback-${i}`),d=reviews()[x.concept]||{},ok=x.forms.some(f=>norm(f)===norm(input.value)),near=ok?null:Klassia.Bassa.tonelessMatch(x,input.value);msg.textContent=ok?'Réponse acceptée pour l’entraînement. Cette forme reste une proposition, pas une validation linguistique.':near?'Réponse acceptée sans les marques de ton. Forme proposée : '+near+'. Cette forme reste une proposition, pas une validation linguistique.':'Forme non reconnue dans les propositions documentaires. Consulte les propositions et leurs sources dans le détail.';});}
 document.getElementById('bassaSearch').oninput=draw;draw();
 // Lot 8b : repères d'écriture sourcés (alphabet général, référence de 2024), affichés sans valider aucune forme du lexique.
 try{const w=await (await fetch('./data/bassa-ecriture.json')).json(),box=document.getElementById('bassaWriting');if(box&&location.hash==='#bassa'){
  box.insertAdjacentHTML('beforeend',`<p class="review-notice">${esc14(w.notice)}</p><h3>Lettres particulières</h3><ul>${w.letters.map(x=>`<li><b lang="bas">${esc14(x.letter)}</b> (${esc14(x.name)}) — ${esc14(x.note)}</li>`).join('')}</ul><h3>Tons</h3><div class="tableWrap"><table><thead><tr><th scope="col">Ton</th><th scope="col">Signe</th><th scope="col">Exemple</th><th scope="col">Sens</th></tr></thead><tbody>${w.tones.map(x=>`<tr><td>${esc14(x.name)}</td><td>${esc14(x.sign)}</td><td lang="bas"><b>${esc14(x.example)}</b></td><td>${esc14(x.gloss)}</td></tr>`).join('')}</tbody></table></div><h3>Exemples de la référence</h3><p>${w.examples.map(x=>`<span lang="bas"><b>${esc14(x.form)}</b></span> « ${esc14(x.gloss)} »`).join(' · ')}</p><h3>Questions pour le relecteur</h3><ul>${w.open_questions.map(x=>`<li>${esc14(x)}</li>`).join('')}</ul><p><b>Sources :</b> ${w.sources.map(x=>`<a href="${esc14(x.url)}" rel="noopener">${esc14(x.title)}</a>`).join(' · ')}</p><p>Une réponse tapée sans les marques de ton est acceptée, avec un rappel de la forme proposée. Les touches sous le champ de réponse insèrent les lettres et les tons.</p>`);box.hidden=false;}}catch{}
}
function routeSpecial(h){
 let task;
 if(h==='#coverage')task=coveragePage();
 else if(h==='#bassa')task=bassaPage();
 else if(h==='#domains-all')task=domainsPage();
 else if(h.startsWith('#domain-all:'))task=domainsPage(Number(h.split(':')[1]));
 else if(h==='#subjects-all')task=subjectsAllPage();
 else if(h.startsWith('#subject-all:'))task=subjectAllPage(decodeURIComponent(h.slice(13)));
 else return false;
 task.catch(err=>shell('<h1>Chargement interrompu</h1><p>'+esc14(err.message)+'</p><button onclick="location.reload()">Réessayer</button>','learn'));
 return true;
}
Klassia.registerRoutes('CE2',routeSpecial);
function decorateV14(){injectPrintActions();injectPractice();}
document.addEventListener('klassia:render',decorateV14);
})();
