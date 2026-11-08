(() => {
'use strict';
let practice14=null;
const esc14=s=>String(s??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));
fetch('./practice-v14.json').then(r=>r.ok?r.json():null).then(x=>{practice14=x;if(typeof themePack!=='undefined'&&themePack)route();}).catch(()=>{});

const worksheetsForCurrent=()=>Klassia.nurserySupport.worksheetsForTheme(practice14?.themes?.[theme.id],NURSERY.grade,theme.id);
function openPrint(fiche,id,adult=false){
 Klassia.printing.open(NURSERY.grade,fiche,theme.id,id,adult);
}
function worksheetsPage(){
 const ws=worksheetsForCurrent();let body=`<button class="back" onclick="location.hash='#home'">← Retour au thème</button><section class="hero"><div class="eyebrow">CAHIER TACTILE ET IMPRIMABLE</div><h1>✍️ Coloriage, lettres, chiffres et graphisme</h1><p>${esc14(theme.title_fr)} · ${esc14(theme.title_en)}</p></section><div class="worksheetGrid">`;
 ws.forEach(w=>body+=`<article class="worksheetCard"><h2>${w.title}</h2><p>${esc14(w.instruction_fr)}</p><p><i>${esc14(w.instruction_en)}</i></p>${Klassia.ink.worksheet(NURSERY.grade+':'+theme.id+':cahier:'+w.id,w.html,['letters','numbers'].includes(w.id))}<button class="classBtn" data-print-ws="${w.id}">🖨 Imprimer / PDF</button></article>`);
 body+=`</div><button class="classBtn" id="printAllWs">🖨 Imprimer tout le cahier du thème</button>`;shell(body);
 document.querySelectorAll('[data-print-ws]').forEach(b=>{const w=ws.find(x=>x.id===b.dataset.printWs);b.onclick=()=>openPrint('graphisme',w.id)});
 document.getElementById('printAllWs').onclick=()=>openPrint('graphisme');
}
function domainsAllPage(){
 const sample=themePack.themes[catalog.themes[0].id].domains;let body=`<button class="back" onclick="location.hash='#home'">← Retour</button><section class="hero"><div class="eyebrow">${esc14(NURSERY.label.toUpperCase())} · PAR DOMAINE</div><h1>Choisir d’abord un domaine</h1><p>Parcours ensuite les huit thèmes pour ce même domaine.</p></section><div class="grid">`;
 sample.forEach(d=>body+=`<button class="domain" data-domain-all="${d.id}"><div class="icon">${d.icon}</div><strong>${esc14(d.name_fr)}</strong><small>${esc14(d.name_en)} · ${d.weight}</small><small>8 thèmes</small></button>`);
 body+='</div>';shell(body);document.querySelectorAll('[data-domain-all]').forEach(b=>b.onclick=()=>location.hash='#domain-all:'+b.dataset.domainAll);
}
function domainAllPage(id){
 const sample=themePack.themes[catalog.themes[0].id].domains.find(d=>d.id===id);if(!sample)return home();
 let body=`<button class="back" onclick="location.hash='#domains-all'">← Domaines</button><section class="hero"><div class="eyebrow">8 THÈMES</div><h1>${sample.icon} ${esc14(sample.name_fr)}</h1><p>${esc14(sample.name_en)}</p><button class="classBtn" id="printDomainAll">🖨 Domaine complet / PDF</button></section><div class="themes">`;
 for(const t of catalog.themes){const th=themePack.themes[t.id],d=th.domains.find(x=>x.id===id);body+=`<article class="themeCard themeDomainCard"><div class="themeNum">${t.number}</div><div><strong>${esc14(th.title_fr)}</strong><div>${esc14(th.title_en)} · ${d.activities.length} activités</div><small>${d.activities.slice(0,3).map(a=>esc14(a.title_fr)).join(' · ')}</small></div><div class="spacer"></div><button class="classBtn" data-open-domain-theme="${t.id}">Ouvrir</button></article>`;}
 body+='</div>';shell(body);document.getElementById('printDomainAll').onclick=()=>openPrint('domaine-complet',id);
 document.querySelectorAll('[data-open-domain-theme]').forEach(b=>b.onclick=()=>location.assign('?theme='+b.dataset.openDomainTheme+'#domain:'+id));
}
function injectHomeEnhancements(){
 if(location.hash&&location.hash!=='#home')return;
 const hero=document.querySelector('.hero');if(!hero||document.querySelector('.workbookPromo'))return;
    hero.insertAdjacentHTML('afterend',`<div class="print-actions"><button class="classBtn" id="printTheme14">🖨 Thème / PDF</button></div><section class="workbookPromo"><div><b>✍️ Cahier tactile et imprimable</b><p>Coloriage, lettres, chiffres et graphisme. Trace au doigt ou imprime la fiche.</p></div><button class="classBtn" onclick="location.hash='#worksheets'">Ouvrir le cahier</button></section>`);
 document.getElementById('printTheme14').onclick=()=>openPrint('theme');
}
function injectDomainPrints(){
 const h=location.hash||'';if(!h.startsWith('#domain:'))return;
 const id=h.split(':')[1],d=theme?.domains?.find(x=>x.id===id);if(!d)return;
 const hero=document.querySelector('.hero'); if(hero&&!hero.querySelector('.printDomain14')){
  hero.insertAdjacentHTML('beforeend',`<div class="print-actions"><button class="classBtn printDomain14">🖨 Domaine / PDF</button>${Klassia.isAdultSpace()?'<button class="classBtn printDomainAdult">Guide adulte du domaine / PDF</button>':''}</div>`);
  hero.querySelector('.printDomain14').onclick=()=>openPrint('domaine',d.id);
  if(Klassia.isAdultSpace())hero.querySelector('.printDomainAdult').onclick=()=>openPrint('domaine',d.id,true);
 }
 for(const card of document.querySelectorAll('.activityCard[data-activity-id]')){
  if(card.querySelector('.printActivity14'))continue;
  card.querySelector('.activityHead').insertAdjacentHTML('beforeend',`<div class="print-actions"><button class="classBtn printActivity14">🖨 Activité / PDF</button>${Klassia.isAdultSpace()?'<button class="classBtn printActivityAdult">Guide adulte de l’activité / PDF</button>':''}</div>`);
  card.querySelector('.printActivity14').onclick=()=>openPrint('activite',card.dataset.activityId);
  if(Klassia.isAdultSpace())card.querySelector('.printActivityAdult').onclick=()=>openPrint('activite',card.dataset.activityId,true);
 }
}
function activitySubject(a,d){
 if(['math','pattern','patterns','sorting','classification','shape','shapes','measurement','position','distance','laterality'].includes(a.type))return 'Mathématiques';
 if(a.type==='digital')return 'TIC';
 if(['prewriting'].includes(a.type))return 'Graphisme';
 if(a.type==='bassa')return 'Bassa · langue et culture';
 if(d.id==='LC')return 'Langage et communication';
 if(d.id==='ST')return 'Découverte scientifique';
 if(['AC','AR'].includes(d.id))return 'Arts et création';
 if(['MO','MG'].includes(d.id))return 'Motricité';
 return 'Vie pratique et sociale';
}
function activitiesPage(selected){
 const rows=catalog.themes.flatMap(t=>themePack.themes[t.id].domains.flatMap(d=>d.activities.map((a,i)=>({a,d,t,i,subject:activitySubject(a,d)}))));
 const names=[...new Set(rows.map(x=>x.subject))];let body=`<section class="hero"><h1>${esc14(selected||'Parcourir les matières et activités')}</h1><p>Regroupement pratique des activités sur les huit thèmes; les domaines du curriculum restent accessibles séparément.</p></section><div class="grid">`;
 if(!selected)body+=names.map(n=>`<a class="domain" href="#activity-subject:${encodeURIComponent(n)}"><strong>${esc14(n)}</strong><small>${rows.filter(x=>x.subject===n).length} activités</small></a>`).join('');
 else body+=rows.filter(x=>x.subject===selected).map(x=>`<a class="domain" href="?theme=${x.t.id}#domain:${x.d.id}:${x.i}"><strong>${esc14(x.a.title_fr)}</strong><small lang="en">${esc14(x.a.title_en)}</small><small>${esc14(x.t.title_fr)}</small></a>`).join('');
 shell(body+'</div>');
}
function routeSpecial(h){
 if(!practice14)return false;
 if(h==='#subjects-all'){activitiesPage();return true;}
 if(h.startsWith('#activity-subject:')){activitiesPage(decodeURIComponent(h.slice(18)));return true;}
 if(h==='#domains-all'){domainsAllPage();return true;}
 if(h.startsWith('#domain-all:')){domainAllPage(h.split(':')[1]);return true;}
 if(h==='#worksheets'){worksheetsPage();return true;}
 return false;
}
Klassia.registerRoutes(NURSERY.grade,routeSpecial);
function decorate14(){if(!practice14||!catalog||!themePack)return;injectHomeEnhancements();injectDomainPrints();}
document.addEventListener('klassia:render',decorate14);
})();
