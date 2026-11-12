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
function routeSpecial(h){
 let task;
 if(Klassia.workshop.route(h))return true;
 if(h==='#domains-all')task=domainsPage();
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
