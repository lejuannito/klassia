(() => {
'use strict';
const PRACTICE_URL='./data/ce2-practice-v14.json';
let practiceV14=null, allUnitsV14=null;
const esc14=Klassia.escape;
const nl14=s=>esc14(s).replace(/\n/g,'<br>');
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
function lessonHtml14(s,l,index){
  let h=`<section class="p-lesson"><h3>${esc14(index!=null?`${index+1}. `:'')}${esc14(l.title)}</h3>`;
  if(l.objectives?.length)h+=`<p class="obj"><b>Objectif :</b> ${esc14(l.objectives.join(' · '))}</p>`;
  if(l.figure)h+=`<img style="max-width:100%" src="${new URL(l.figure.src,location.href).href}" alt="${esc14(l.figure.alt)}">`;
  if(l.discover)h+=`<div class="box"><b>Je découvre</b><p>${nl14(l.discover)}</p></div>`;
  if(l.learn?.length)h+=`<div class="box"><b>Je comprends</b>${l.learn.map(x=>`<p>${nl14(x)}</p>`).join('')}</div>`;
  if(l.manual_sections?.length)h+=l.manual_sections.map(sec=>{
    let x=`<div class="manual"><b>${esc14(sec.title||'Approfondir')}</b>`;
    if(sec.body)x+=`<p>${nl14(sec.body)}</p>`;
    if(sec.items?.length)x+=`<ul>${sec.items.map(i=>`<li>${nl14(i)}</li>`).join('')}</ul>`;
    if(sec.table?.headers)x+=`<table><thead><tr>${sec.table.headers.map(v=>`<th>${esc14(v)}</th>`).join('')}</tr></thead><tbody>${(sec.table.rows||[]).map(r=>`<tr>${r.map(v=>`<td>${nl14(v)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
    return x+'</div>';
  }).join('');
  if(l.teacher_guide)h+=`<details><summary>Guide adulte</summary><p>${esc14(l.teacher_guide.preparation)}</p><ul>${l.teacher_guide.observation.map(x=>`<li>${esc14(x)}</li>`).join('')}</ul></details>`;
  if(l.takeaway)h+=`<div class="take"><b>Je retiens</b><p>${nl14(l.takeaway)}</p></div>`;
  if(l.practical?.length)h+=`<div class="box"><b>J’expérimente</b><ul>${l.practical.map(x=>`<li>${nl14(x)}</li>`).join('')}</ul></div>`;
  if(l.exercises?.length)h+=`<div class="ex"><b>Je m’exerce</b>${l.exercises.map((e,i)=>`<div class="q"><b>${i+1}.</b> ${nl14(e.prompt||'')}<div class="lines"></div><details><summary>Correction</summary><p>${nl14(e.answer||'')}</p>${e.explanation?`<p>${nl14(e.explanation)}</p>`:''}</details></div>`).join('')}</div>`;
  return h+'</section>';
}
function printDoc(title,body,existingWindow=null){
  const w=existingWindow||window.open('','_blank');
  if(!w){alert('Autorisez les fenêtres surgissantes pour ouvrir la fiche imprimable.');return;}
  w.document.open();
  w.document.write(`<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc14(title)}</title><style>
    @page{size:A4;margin:14mm}*{box-sizing:border-box}body{font-family:Arial,Helvetica,sans-serif;color:#172033;margin:0;font-size:11.5pt;line-height:1.42}
    header.printHead{border-bottom:3px solid #3157d5;margin-bottom:12mm;padding-bottom:5mm}h1{font-size:22pt;margin:0 0 4px}h2{font-size:17pt;margin:18px 0 9px}h3{font-size:14pt;margin:13px 0 6px}
    .meta{color:#5b6475}.p-lesson{break-inside:avoid-page;margin-bottom:12mm;border-bottom:1px solid #ddd;padding-bottom:8mm}.box,.manual,.take,.ex,.dict,.prob{border:1px solid #d7ddeb;border-radius:8px;padding:9px 11px;margin:8px 0}.take{background:#f1f7ff}.manual{background:#fbfcff}.obj{font-style:italic}
    table{width:100%;border-collapse:collapse;margin:8px 0}th,td{border:1px solid #bbb;padding:6px;text-align:left;vertical-align:top}th{background:#f1f3f8}
    ul{margin-top:4px}.q{margin:9px 0}.lines{height:22mm;background:repeating-linear-gradient(to bottom,transparent 0,transparent 7mm,#d8dce5 7.2mm,#d8dce5 7.5mm)}
    .toolbar{position:sticky;top:0;background:#fff7d6;border:1px solid #e8d36f;padding:8px;margin-bottom:10px}.toolbar button{font:inherit;padding:8px 12px}
    .pagebreak{break-before:page}.worksheet{break-after:page}.answer{color:#333;background:#f5f5f5;padding:7px}.hide-on-print{}
    @media print{.toolbar{display:none}.hide-on-print{display:none}details{display:block}details>summary{display:none}details>*{display:block!important}}
  </style></head><body><div class="toolbar">Choisissez <b>Imprimer</b>, puis « Enregistrer au format PDF » si vous voulez un fichier PDF. <button onclick="window.print()">Imprimer / PDF</button></div><header class="printHead"><h1>${esc14(title)}</h1><div class="meta">Klassia · CE2 · Support imprimable</div></header>${body}</body></html>`);
  w.document.close();w.focus();
}
function printLesson(){
  const x=currentLessonObj();if(!x)return;
  printDoc(`${x.s.name} — ${x.l.title}`,lessonHtml14(x.s,x.l,0));
}
function printCurrentSubject(){
  const id=currentSubjectId();const s=content?.subjects?.find(x=>x.id===id);if(!s)return;
  printDoc(`${s.name} — ${unitCaption()}`,`<h2>${esc14(unitCaption())}</h2>`+s.lessons.map((l,i)=>lessonHtml14(s,l,i)).join(''));
}
function printCurrentUnit(){
  let b=`<h2>${esc14(unitCaption())}</h2>`;
  for(const s of content.subjects)b+=`<div class="pagebreak"><h2>${esc14(s.name)}</h2>${s.lessons.map((l,i)=>lessonHtml14(s,l,i)).join('')}</div>`;
  printDoc(`CE2 — ${unitCaption()}`,b);
}
async function printSubjectAll(id){
  const w=window.open('','_blank');if(!w){alert('Autorisez les fenêtres surgissantes.');return;}
  w.document.write('<p style="font-family:Arial;padding:20px">Préparation du document…</p>');
  const units=await allUnits();
  let name=id,b='';
  for(const u of units){
    const s=u.content.subjects.find(x=>x.id===id);if(!s)continue;name=s.name;
    b+=`<section class="pagebreak"><h2>Unité ${u.meta.number} · ${esc14(u.meta.title)}</h2>${s.lessons.map((l,i)=>lessonHtml14(s,l,i)).join('')}</section>`;
  }
  printDoc(`${name} — CE2 complet`,b,w);
}
function dictationHtml(d,student=false){
  if(student)return `<div class="dict"><h2>${esc14(d.title)}</h2><h3>Mots à préparer</h3><p>${d.words.map(esc14).join(' · ')}</p><h3>Entraînement</h3>${d.sentences.map((x,i)=>`<p>${i+1}. ${esc14(x)}</p>`).join('')}<h3>Dictée</h3><p>Écoute le texte dicté par l’adulte et écris soigneusement.</p><div class="lines" style="height:100mm"></div></div>`;
  return `<div class="dict"><h2>${esc14(d.title)} — guide adulte</h2><h3>Mots à préparer</h3><p>${d.words.map(esc14).join(' · ')}</p><h3>Phrases d’entraînement</h3>${d.sentences.map(x=>`<p>• ${esc14(x)}</p>`).join('')}<h3>Texte de dictée bilan</h3><p>${esc14(d.passage)}</p><h3>Points de vigilance</h3><ul>${d.focus.map(x=>`<li>${esc14(x)}</li>`).join('')}</ul></div>`;
}
function problemsHtml(p,answers=false){
 return `<div class="prob"><h2>Problèmes posés — ${esc14(practiceV14.units[currentUnit.id].title)}</h2>${p.map((x,i)=>`<section><h3>${i+1}. ${esc14(x.title)}</h3><p>${esc14(x.statement)}</p>${answers?`<div class="answer"><b>Démarche :</b> ${esc14(x.skill)}<br><b>Opération :</b> ${esc14(x.operation)}<br><b>Phrase-réponse :</b> ${esc14(x.answer)}</div>`:`<p><b>Je cherche :</b></p><div class="lines"></div><p><b>Opération posée :</b></p><div class="lines" style="height:35mm"></div><p><b>Phrase-réponse :</b></p><div class="lines" style="height:20mm"></div>`}</section>`).join('<hr>')}</div>`;
}
function injectPractice(){
  if(!practiceV14||!currentUnit)return;
  const id=currentSubjectId();if(!['FR','MA'].includes(id))return;
  const hero=document.querySelector('.subject-hero');if(!hero||document.querySelector('.practice-v14'))return;
  const u=practiceV14.units[currentUnit.id];if(!u)return;
  let html='';
  if(id==='FR'){
    const d=u.dictation;
    html=`<section class="practice-v14"><div class="practice-title"><div><div class="eyebrow">CAHIER PRATIQUE</div><h2>✍️ Dictée préparée</h2><p>Mots, phrases d’entraînement puis dictée bilan à faire avec un adulte.</p></div></div><div class="practice-card"><h3>${esc14(d.title)}</h3><p><b>Mots :</b> ${d.words.map(esc14).join(' · ')}</p><details><summary>Voir les phrases d’entraînement</summary>${d.sentences.map(x=>`<p>• ${esc14(x)}</p>`).join('')}</details><div class="practice-actions"><button class="btn soft" id="dictStudentV14">🖨 Fiche élève / PDF</button><button class="btn soft" id="dictAdultV14">🖨 Guide adulte / PDF</button></div></div></section>`;
  }else{
    html=`<section class="practice-v14"><div class="practice-title"><div><div class="eyebrow">CAHIER PRATIQUE</div><h2>🧮 Problèmes posés</h2><p>Lire, chercher les données utiles, choisir l’opération, la poser et écrire une phrase-réponse.</p></div></div>${u.problems.map((p,i)=>`<div class="practice-card"><h3>${i+1}. ${esc14(p.title)}</h3><p>${esc14(p.statement)}</p><span class="pill">${esc14(p.skill)}</span></div>`).join('')}<div class="practice-actions"><button class="btn soft" id="problemsStudentV14">🖨 Fiche élève / PDF</button><button class="btn soft" id="problemsAnswerV14">🖨 Corrigé / PDF</button></div></section>`;
  }
  hero.insertAdjacentHTML('afterend',html);
  if(id==='FR'){
    document.getElementById('dictStudentV14').onclick=()=>printDoc(`${dTitle()} — fiche élève`,dictationHtml(u.dictation,true));
    document.getElementById('dictAdultV14').onclick=()=>printDoc(`${dTitle()} — guide adulte`,dictationHtml(u.dictation,false));
  }else{
    document.getElementById('problemsStudentV14').onclick=()=>printDoc(`Mathématiques — problèmes — ${unitCaption()}`,problemsHtml(u.problems,false));
    document.getElementById('problemsAnswerV14').onclick=()=>printDoc(`Mathématiques — corrigé — ${unitCaption()}`,problemsHtml(u.problems,true));
  }
}
function dTitle(){return `Français — ${unitCaption()}`;}

async function subjectsAllPage(){
  const units=await allUnits();
  if(location.hash!=='#subjects-all')return;
  const first=units[0]?.content?.subjects||[];
  let body=`<div class="browse-tabs-v14"><button onclick="location.hash='#learn'">Par thème / unité</button><button class="active">Par matière</button></div><div class="page-head"><div><div class="eyebrow">CE2 · PAR MATIÈRE</div><h1>Choisir d’abord une matière</h1><p>Parcours ensuite les huit thèmes de cette matière.</p></div><span class="pill">8 unités</span></div><div class="subject-grid wide">`;
  for(const s0 of first){
    const total=units.reduce((n,u)=>n+(u.content.subjects.find(s=>s.id===s0.id)?.lessons.length||0),0);
    const m=subjectMeta(s0.id);
    body+=`<button class="subject-card subject-card-rich" data-suball="${s0.id}"><div class="subject-card-top"><span class="subject-icon large">${m.icon}</span><span class="subject-pct">8 thèmes</span></div><strong>${esc14(s0.name)}</strong><span>${total} leçons dans l’ensemble du CE2</span></button>`;
  }
  body+='</div>'; shell(body,'learn');
  document.querySelectorAll('[data-suball]').forEach(b=>b.onclick=()=>{location.hash='#subject-all:'+b.dataset.suball});
}
async function subjectAllPage(id){
  const units=await allUnits(); if(location.hash!=='#subject-all:'+id)return; let subjectName=id;
  let body=`<div class="crumb"><a onclick="location.hash='#subjects-all'">Matières</a><span>›</span>CE2 complet</div>`;
  const cards=[];
  for(const u of units){
    const s=u.content.subjects.find(x=>x.id===id);if(!s)continue;subjectName=s.name;
    cards.push(`<article class="unit-subject-v14"><div><span class="unit-number">U${u.meta.number}</span><h3>${esc14(u.meta.title)}</h3><p>${s.lessons.length} leçon${s.lessons.length>1?'s':''}</p><ul>${s.lessons.slice(0,4).map(l=>`<li>${esc14(l.title)}</li>`).join('')}${s.lessons.length>4?`<li>…</li>`:''}</ul></div><button class="btn primary" data-open-unit="${u.meta.id}">Ouvrir</button></article>`);
  }
  body+=`<section class="subject-hero"><div class="subject-icon xlarge">${subjectMeta(id).icon}</div><div class="grow"><div class="eyebrow">CE2 · 8 UNITÉS</div><h1>${esc14(subjectName)}</h1><p>Commence par la matière, puis choisis le thème à étudier.</p></div><button class="btn soft" id="printSubAllV14">🖨 Imprimer / PDF</button></section><div class="unit-subject-grid-v14">${cards.join('')}</div>`;
  shell(body,'learn');
  document.querySelectorAll('[data-open-unit]').forEach(b=>b.onclick=async()=>{await loadUnit(b.dataset.openUnit);location.hash='#subject:'+encodeURIComponent(id);subject(id);});
  document.getElementById('printSubAllV14').onclick=()=>printSubjectAll(id);
}
function injectBrowseTabs(){
  if(location.hash==='#learn'&&document.querySelector('.page-head')&&!document.querySelector('.browse-tabs-v14')){
    const ph=document.querySelector('.page-head');
    ph.insertAdjacentHTML('beforebegin',`<div class="browse-tabs-v14"><button class="active">Par thème / unité</button><button onclick="location.hash='#subjects-all'">Par matière</button><button id="printUnitV14">🖨 Thème / PDF</button></div>`);
    document.getElementById('printUnitV14').onclick=printCurrentUnit;
  }
  if(location.hash.startsWith('#subject:')){
    const hero=document.querySelector('.subject-hero');
    if(hero&&!hero.querySelector('.print-actions-v14')){
      hero.insertAdjacentHTML('beforeend',`<div class="print-actions-v14"><button class="btn soft" id="printSubV14">🖨 Matière / PDF</button><button class="btn soft" id="allThemesSubV14">8 thèmes</button></div>`);
      document.getElementById('printSubV14').onclick=printCurrentSubject;
      document.getElementById('allThemesSubV14').onclick=()=>location.hash='#subject-all:'+encodeURIComponent(currentSubjectId());
    }
  }
  if(location.hash.startsWith('#lesson:')){
    const h=document.querySelector('.lesson-header');
    if(h&&!h.querySelector('.print-actions-v14')){
      h.insertAdjacentHTML('beforeend',`<div class="print-actions-v14"><button class="btn soft" id="printLessonV14">🖨 Imprimer / PDF</button></div>`);
      document.getElementById('printLessonV14').onclick=printLesson;
    }
  }
}
async function coveragePage(){
 const r=await fetch('./data/coverage.json');if(!r.ok)throw Error('Inventaire indisponible');const data=await r.json();if(location.hash!=='#coverage')return;
 shell(`<h1>Couverture et relecture</h1><p>${esc14(data.notice)}</p><label>Classe <select id="coverageGrade"><option>CE2</option><option>MS</option></select></label><label>Rechercher <input id="coverageSearch" type="search"></label><div id="coverageResults"></div>`,'admin');
 function draw(){const grade=document.getElementById('coverageGrade').value,q=document.getElementById('coverageSearch').value.toLocaleLowerCase('fr');const rows=data.items.filter(x=>x.grade===grade&&(x.title+' '+x.id+' '+x.unit).toLocaleLowerCase('fr').includes(q));document.getElementById('coverageResults').innerHTML=`<p>${rows.length} ressources ; ${rows.filter(x=>x.generic_discovery).length} découvertes encore génériques. Correspondances officielles à confirmer.</p>`+rows.map(x=>`<details class="adult-guide"><summary>${esc14(x.id)} · ${esc14(x.title)}</summary><p>Statut : ${esc14(x.status)} · validation en attente</p><p>${esc14(x.source)}</p><ul>${x.objectives.map(o=>`<li>${esc14(o)}</li>`).join('')}</ul></details>`).join('');}
 document.getElementById('coverageGrade').onchange=draw;document.getElementById('coverageSearch').oninput=draw;draw();
}
function routeSpecial(h){
 let task;
 if(h==='#coverage')task=coveragePage();
 else if(h==='#subjects-all')task=subjectsAllPage();
 else if(h.startsWith('#subject-all:'))task=subjectAllPage(decodeURIComponent(h.slice(13)));
 else return false;
 task.catch(err=>shell('<h1>Chargement interrompu</h1><p>'+esc14(err.message)+'</p><button onclick="location.reload()">Réessayer</button>','learn'));
 return true;
}
Klassia.registerRoutes('CE2',routeSpecial);
function decorateV14(){injectBrowseTabs();injectPractice();}
document.addEventListener('klassia:render',decorateV14);
})();
