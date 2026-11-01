(() => {
'use strict';
let practice14=null;
const esc14=s=>String(s??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));
fetch('./practice-v14.json').then(r=>r.ok?r.json():null).then(x=>{practice14=x;if(typeof themePack!=='undefined'&&themePack)route();}).catch(()=>{});

function drawingSvg(kind){
 const common='viewBox="0 0 300 210" class="worksheet-svg" aria-hidden="true"';
 const s=(x)=>`<svg ${common}>${x}</svg>`;
 const a='fill="none" stroke="#202633" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"';
 if(kind==='schoolbag')return s(`<path ${a} d="M80 70 Q150 25 220 70 L235 175 Q150 195 65 175 Z"/><path ${a} d="M115 68 Q115 30 150 30 Q185 30 185 68"/><path ${a} d="M100 120 H200 V165 H100 Z"/><path ${a} d="M82 90 L55 120 M218 90 L245 120"/>`);
 if(kind==='face')return s(`<circle ${a} cx="150" cy="105" r="72"/><circle ${a} cx="125" cy="88" r="5"/><circle ${a} cx="175" cy="88" r="5"/><path ${a} d="M150 92 L145 120 L155 120"/><path ${a} d="M120 140 Q150 160 180 140"/><path ${a} d="M95 60 Q150 15 205 60"/>`);
 if(kind==='house')return s(`<path ${a} d="M55 105 L150 35 L245 105"/><rect ${a} x="75" y="105" width="150" height="80"/><rect ${a} x="135" y="130" width="35" height="55"/><rect ${a} x="92" y="125" width="28" height="28"/><rect ${a} x="185" y="125" width="25" height="28"/>`);
 if(kind==='cake')return s(`<ellipse ${a} cx="150" cy="155" rx="85" ry="26"/><path ${a} d="M65 115 Q150 85 235 115 V155"/><path ${a} d="M65 115 V155"/><path ${a} d="M100 100 V62 M150 92 V50 M200 100 V62"/><path ${a} d="M95 62 Q100 48 105 62 M145 50 Q150 36 155 50 M195 62 Q200 48 205 62"/>`);
 if(kind==='flower')return s(`<circle ${a} cx="150" cy="80" r="20"/><circle ${a} cx="150" cy="45" r="22"/><circle ${a} cx="185" cy="70" r="22"/><circle ${a} cx="175" cy="105" r="22"/><circle ${a} cx="125" cy="105" r="22"/><circle ${a} cx="115" cy="70" r="22"/><path ${a} d="M150 125 V190"/><path ${a} d="M150 150 Q120 130 105 150 Q125 170 150 165"/><path ${a} d="M150 165 Q185 140 200 160 Q180 180 150 178"/>`);
 if(kind==='cat')return s(`<path ${a} d="M95 75 L105 35 L135 65 Q150 55 165 65 L195 35 L205 75 Q225 95 215 130 Q205 165 150 170 Q95 165 85 130 Q75 95 95 75 Z"/><circle ${a} cx="125" cy="105" r="5"/><circle ${a} cx="175" cy="105" r="5"/><path ${a} d="M145 122 L155 122 L150 130 Z M150 130 Q135 142 125 135 M150 130 Q165 142 175 135"/><path ${a} d="M90 125 H55 M92 140 H58 M210 125 H245 M208 140 H242"/>`);
 if(kind==='tools')return s(`<path ${a} d="M85 50 L120 85 L95 110 L60 75 Z"/><path ${a} d="M108 97 L205 194"/><path ${a} d="M180 50 Q215 70 200 100 L175 90 Q183 72 165 64 Z"/><path ${a} d="M182 92 L95 180 Q80 195 65 180 Q52 165 68 150 L165 72"/>`);
 return s(`<rect ${a} x="55" y="80" width="190" height="95" rx="18"/><circle ${a} cx="100" cy="180" r="22"/><circle ${a} cx="205" cy="180" r="22"/><rect ${a} x="80" y="100" width="40" height="32"/><rect ${a} x="130" y="100" width="40" height="32"/><rect ${a} x="180" y="100" width="40" height="32"/><path ${a} d="M55 80 L90 45 H205 L245 80"/>`);
}
function traceLettersSvg(letters){
 const step=550/Math.max(1,letters.length),size=Math.min(175,step*.8);
 return `<svg viewBox="0 0 600 280" class="trace-svg"><g stroke="#ccd2dd" stroke-width="2">${[55,120,185,250].map(y=>`<line x1="25" y1="${y}" x2="575" y2="${y}"/>`).join('')}</g>${letters.map((l,i)=>`<text x="${30+i*step}" y="190" font-size="${size}" font-family="Arial" font-weight="700" fill="none" stroke="#9aa5b7" stroke-width="3" stroke-dasharray="7 6">${esc14(l)}</text>`).join('')}</svg>`;
}
function traceNumbersSvg(numbers){
 const display=numbers.slice(-6),step=550/Math.max(1,display.length),size=Math.min(125,step*.75);
 return `<svg viewBox="0 0 600 260" class="trace-svg"><g stroke="#ccd2dd" stroke-width="2"><line x1="20" y1="210" x2="580" y2="210"/><line x1="20" y1="90" x2="580" y2="90"/></g>${display.map((n,i)=>`<text x="${30+i*step}" y="195" font-size="${size}" font-family="Arial" font-weight="700" fill="none" stroke="#9aa5b7" stroke-width="3" stroke-dasharray="6 5">${n}</text>`).join('')}</svg>`;
}
function graphismSvg(themeId){
 const paths={
  T1:['M30 45 V210','M90 45 V210','M150 45 V210','M210 45 V210','M270 45 V210','M330 45 V210','M390 45 V210','M450 45 V210','M510 45 V210'],
  T2:['M40 130 C80 40 120 220 160 130 S240 40 280 130 S360 220 400 130 S480 40 540 130'],
  T3:['M30 180 L90 80 L150 180 L210 80 L270 180 L330 80 L390 180 L450 80 L540 180'],
  T4:['M40 150 C70 70 110 70 140 150 C170 230 210 230 240 150 C270 70 310 70 340 150 C370 230 410 230 440 150 C470 70 510 70 550 150'],
  T5:['M40 190 C80 160 80 120 40 90 C80 60 120 60 150 95 C180 130 180 170 150 200','M220 200 C190 165 190 125 220 90 C250 55 290 55 320 90 C350 125 350 165 320 200','M390 200 C360 160 365 110 400 80 C440 45 490 65 515 105 C535 140 525 180 490 205'],
  T6:['M30 130 Q80 60 130 130 T230 130 T330 130 T430 130 T550 130'],
  T7:['M40 50 L180 210 M180 50 L40 210 M240 50 L380 210 M380 50 L240 210 M440 50 L560 210 M560 50 L440 210'],
  T8:['M30 180 C100 40 170 40 240 180 S380 320 450 180 S540 40 570 120']
 };
 return `<svg viewBox="0 0 600 250" class="trace-svg"><path d="${paths[themeId][0]}" fill="none" stroke="#9aa5b7" stroke-width="5" stroke-dasharray="10 8" stroke-linecap="round"/>${paths[themeId].slice(1).map(p=>`<path d="${p}" fill="none" stroke="#9aa5b7" stroke-width="5" stroke-dasharray="10 8" stroke-linecap="round"/>`).join('')}</svg>`;
}
function worksheetsForCurrent(){
 const p=practice14?.themes?.[theme.id];if(!p)return [];
 return [
  {id:'color',title:'🎨 Je colorie',instruction_fr:`Colorie le dessin du thème « ${p.title_fr} ». Essaie de rester à l’intérieur des contours.`,instruction_en:`Colour the ${p.title_en.toLowerCase()} picture. Try to stay inside the lines.`,html:drawingSvg(p.drawing)},
  {id:'letters',title:'✍️ Je forme les lettres',instruction_fr:`Repasse les lettres ${p.letters.join(' et ')} avec le doigt, puis avec un crayon.`,instruction_en:`Trace the letters ${p.letters.join(' and ')} with your finger, then with a pencil.`,html:traceLettersSvg(p.letters)},
  {id:'numbers',title:'🔢 Je forme les chiffres',instruction_fr:`Repasse les chiffres proposés. Dis ensuite combien d’objets chaque chiffre peut représenter.`,instruction_en:`Trace the numbers. Then say how many objects each number can represent.`,html:traceNumbersSvg(p.numbers)},
  {id:'graph',title:'➰ Je fais du graphisme',instruction_fr:`Repasse les ${p.trace}. Commence lentement et garde le même sens.`,instruction_en:`Trace the patterns slowly and keep the same direction.`,html:graphismSvg(theme.id)}
 ];
}
function printWindow(title,body){
 const w=window.open('','_blank');if(!w){alert('Autorisez les fenêtres surgissantes pour imprimer.');return;}
 w.document.write(`<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc14(title)}</title><style>
 @page{size:A4;margin:12mm}*{box-sizing:border-box}body{font-family:Arial,sans-serif;color:#192133;font-size:11.5pt;line-height:1.4;margin:0}.bar{background:#fff4c8;padding:8px;margin-bottom:10px}.bar button{padding:8px 12px}
 h1{font-size:22pt}h2{font-size:17pt;margin-top:16px}h3{font-size:13pt}.sheet{break-after:page;border:1px solid #d7ddea;border-radius:10px;padding:10mm;min-height:255mm}.activityPrint{break-inside:avoid-page;border-bottom:1px solid #ddd;padding:0 0 9mm;margin:0 0 9mm}
 table{width:100%;border-collapse:collapse}th,td{border:1px solid #aaa;padding:6px;text-align:left}.visual{display:flex;gap:8px;flex-wrap:wrap}.visual span{border:1px solid #bbb;border-radius:8px;padding:6px}.worksheet-svg,.trace-svg{width:100%;max-height:210mm}.bassa{background:#fff7df;border:1px solid #efce73;padding:8px;margin:8px 0}.lines{height:35mm;background:repeating-linear-gradient(to bottom,transparent 0,transparent 8mm,#d8dce5 8.2mm,#d8dce5 8.5mm)}
 @media print{.bar{display:none}}
 </style></head><body><div class="bar">Choisissez « Imprimer », puis « Enregistrer au format PDF » pour obtenir un PDF. <button onclick="window.print()">Imprimer / PDF</button></div>${body}</body></html>`);
 w.document.close();w.focus();
}
function activityPrintHtml(a,d){
 let h=`<article class="activityPrint"><h2>${esc14(a.title_fr)} · <span lang="en">${esc14(a.title_en)}</span></h2><p>${esc14(d.name_fr)} · ${esc14(d.name_en)}</p>`;
 for(const [field,label] of [['goal','Objectif / Goal'],['prompt','Consigne / Prompt'],['story','Histoire / Story'],['game','Jeu / Game'],['activity','Activité / Activity']]){if(a[field+'_fr'])h+=`<p><b>${label}</b> ${esc14(a[field+'_fr'])}</p>`;if(a[field+'_en'])h+=`<p lang="en">${esc14(a[field+'_en'])}</p>`;}
 if(a.figure)h+=`<img style="max-width:100%" src="${new URL(a.figure.src,location.href).href}" alt="${esc14(a.figure.alt)}">`;
 if(a.interactive)h+=`<p>${esc14(a.interactive.prompt_fr)} <span lang="en">${esc14(a.interactive.prompt_en)}</span></p><p>Repère adulte : ${esc14(a.interactive.explanation_fr)}</p>`;
 if(a.teacher_guide)h+=`<p><b>Guide adulte :</b> ${esc14(a.teacher_guide.preparation)} ${esc14(a.teacher_guide.adaptation)}</p>`;
 h+=renderVisual(a.visual)+renderDiagram(a.diagram)+renderTable(a.table);
 for(const lang of ['fr','en'])if(a['steps_'+lang]?.length)h+=`<h3>${lang==='fr'?'Étapes':'Steps'}</h3><ol lang="${lang}">${a['steps_'+lang].map(x=>`<li>${esc14(x)}</li>`).join('')}</ol>`;
 if(a.materials?.length)h+=`<p><b>Matériel :</b> ${a.materials.map(esc14).join(' · ')}</p>`;
 if(a.course?.length)h+=`<h3>Parcours</h3><ol>${a.course.map(x=>`<li>${esc14(x)}</li>`).join('')}</ol>`;
 if(a.questions?.length)h+=`<h3>Questions et repères adulte</h3>${a.questions.map(q=>`<p>${esc14(q.fr)}<br><span lang="en">${esc14(q.en)}</span><br><b>Réponse :</b> ${esc14(q.answer)}</p>`).join('')}`;
 if(a.bassa_variants?.length)h+=`<div class="bassa"><b>Bassa — propositions documentaires non validées, toutes acceptées pour le sens demandé</b>${a.bassa_variants.map(x=>`<p><b>${esc14(x.concept)}</b> : ${(x.forms||[]).map(esc14).join(' · ')}<br>Sources : ${(x.sources||[]).map(esc14).join(' · ')}<br>${esc14(x.note||'')}</p>`).join('')}</div>`;
 if(a.source_note)h+=`<p>${esc14(a.source_note)}</p>`;
 return h+`<h3>Observation</h3><ul>${(a.observe||[]).map(x=>`<li>${esc14(x)}</li>`).join('')}</ul><p>Édition pilote — validation pédagogique à confirmer.</p></article>`;
}
function printActivity(a,d){printWindow(`${a.title_fr} — ${esc14(NURSERY.label)}`,`<p>${esc14(NURSERY.label)}</p><h1>${esc14(theme.title_fr)} · ${esc14(theme.title_en)}</h1>`+activityPrintHtml(a,d));}
function printDomain(d){printWindow(`${d.name_fr} — ${theme.title_fr}`,`<h1>${esc14(theme.title_fr)} · ${esc14(theme.title_en)}</h1>${d.activities.map(a=>activityPrintHtml(a,d)).join('')}`);}
function printTheme(){
 let body=`<h1>${esc14(theme.title_fr)} · ${esc14(theme.title_en)}</h1><p>${esc14(theme.project?.description_fr||'')}</p>`;
 theme.domains.forEach(d=>{body+=`<h2>${d.icon} ${esc14(d.name_fr)}</h2>${d.activities.map(a=>activityPrintHtml(a,d)).join('')}`;});
 body+=`<div class="sheet"><h1>Cahier de graphisme</h1>${worksheetsForCurrent().map(w=>`<h2>${w.title}</h2><p>${esc14(w.instruction_fr)}</p>${w.html}`).join('')}</div>`;
 printWindow(`${NURSERY.grade} — ${theme.title_fr}`,body);
}
function printWorksheet(w){printWindow(`${w.title} — ${theme.title_fr}`,`<section class="sheet"><h1>${esc14(theme.title_fr)} · ${esc14(theme.title_en)}</h1><h2>${w.title}</h2><p>${esc14(w.instruction_fr)}</p><p><i>${esc14(w.instruction_en)}</i></p>${w.html}<div class="lines"></div></section>`);}
async function printDomainAll(id){
 const first=themePack.themes[catalog.themes[0].id].domains.find(d=>d.id===id);if(!first)return;
 let body=`<h1>${esc14(first.name_fr)} · ${esc14(first.name_en)}</h1><p>${esc14(NURSERY.label)} — parcours par domaine à travers les huit thèmes.</p>`;
 for(const t of catalog.themes){const th=themePack.themes[t.id],d=th.domains.find(x=>x.id===id);if(d)body+=`<section class="sheet"><h2>${themeIcon(t.id)} ${esc14(th.title_fr)} · ${esc14(th.title_en)}</h2>${d.activities.map(a=>activityPrintHtml(a,d)).join('')}</section>`;}
 printWindow(`${first.name_fr} — 8 thèmes`,body);
}
function worksheetsPage(){
 const ws=worksheetsForCurrent();let body=`<button class="back" onclick="location.hash='#home'">← Retour au thème</button><section class="hero"><div class="eyebrow">CAHIER IMPRIMABLE</div><h1>✍️ Coloriage, lettres, chiffres et graphisme</h1><p>${esc14(theme.title_fr)} · ${esc14(theme.title_en)}</p></section><div class="worksheetGrid">`;
 ws.forEach(w=>body+=`<article class="worksheetCard"><h2>${w.title}</h2><p>${esc14(w.instruction_fr)}</p><p><i>${esc14(w.instruction_en)}</i></p>${w.html}<button class="classBtn" data-print-ws="${w.id}">🖨 Imprimer / PDF</button></article>`);
 body+=`</div><button class="classBtn" id="printAllWs">🖨 Imprimer tout le cahier du thème</button>`;shell(body);
 document.querySelectorAll('[data-print-ws]').forEach(b=>{const w=ws.find(x=>x.id===b.dataset.printWs);b.onclick=()=>printWorksheet(w)});
 document.getElementById('printAllWs').onclick=()=>printWindow(`Cahier graphique — ${theme.title_fr}`,ws.map(w=>`<section class="sheet"><h1>${esc14(theme.title_fr)}</h1><h2>${w.title}</h2><p>${esc14(w.instruction_fr)}</p>${w.html}<div class="lines"></div></section>`).join(''));
}
function domainsAllPage(){
 const sample=themePack.themes[catalog.themes[0].id].domains;let body=`<button class="back" onclick="location.hash='#home'">← Retour</button><div class="browseTabs"><button onclick="location.hash='#themes'">Par thème</button><button class="active">Par domaine</button></div><section class="hero"><div class="eyebrow">${esc14(NURSERY.label.toUpperCase())} · PAR DOMAINE</div><h1>Choisir d’abord un domaine</h1><p>Parcours ensuite les huit thèmes pour ce même domaine.</p></section><div class="grid">`;
 sample.forEach(d=>body+=`<button class="domain" data-domain-all="${d.id}"><div class="icon">${d.icon}</div><strong>${esc14(d.name_fr)}</strong><small>${esc14(d.name_en)} · ${d.weight}</small><small>8 thèmes</small></button>`);
 body+='</div>';shell(body);document.querySelectorAll('[data-domain-all]').forEach(b=>b.onclick=()=>location.hash='#domain-all:'+b.dataset.domainAll);
}
function domainAllPage(id){
 const sample=themePack.themes[catalog.themes[0].id].domains.find(d=>d.id===id);if(!sample)return home();
 let body=`<button class="back" onclick="location.hash='#domains-all'">← Domaines</button><section class="hero"><div class="eyebrow">8 THÈMES</div><h1>${sample.icon} ${esc14(sample.name_fr)}</h1><p>${esc14(sample.name_en)}</p><button class="classBtn" id="printDomainAll">🖨 Domaine complet / PDF</button></section><div class="themes">`;
 for(const t of catalog.themes){const th=themePack.themes[t.id],d=th.domains.find(x=>x.id===id);body+=`<article class="themeCard themeDomainCard"><div class="themeNum">${t.number}</div><div><strong>${esc14(th.title_fr)}</strong><div>${esc14(th.title_en)} · ${d.activities.length} activités</div><small>${d.activities.slice(0,3).map(a=>esc14(a.title_fr)).join(' · ')}</small></div><div class="spacer"></div><button class="classBtn" data-open-domain-theme="${t.id}">Ouvrir</button></article>`;}
 body+='</div>';shell(body);document.getElementById('printDomainAll').onclick=()=>printDomainAll(id);
 document.querySelectorAll('[data-open-domain-theme]').forEach(b=>b.onclick=async()=>{await loadTheme(b.dataset.openDomainTheme);history.replaceState(null,'',`?theme=${b.dataset.openDomainTheme}#domain:${id}`);domainPage(id)});
}
function injectHomeEnhancements(){
 if(location.hash&&location.hash!=='#home')return;
 const hero=document.querySelector('.hero');if(!hero||document.querySelector('.browseTabs'))return;
    hero.insertAdjacentHTML('afterend',`<div class="browseTabs klassia-learning-mode"><button class="active">Par thème</button><button onclick="location.hash='#domains-all'">Par domaine</button><button id="printTheme14">🖨 Thème / PDF</button></div><section class="workbookPromo"><div><b>✍️ Cahier sans écran</b><p>Coloriage, formation des lettres et chiffres, graphisme à imprimer.</p></div><button class="classBtn" onclick="location.hash='#worksheets'">Ouvrir le cahier</button></section>`);
 document.getElementById('printTheme14').onclick=printTheme;
}
function injectDomainPrints(){
 const h=location.hash||'';if(!h.startsWith('#domain:'))return;
 const id=h.split(':')[1],d=theme?.domains?.find(x=>x.id===id);if(!d)return;
 const hero=document.querySelector('.hero');if(hero&&!hero.querySelector('.printDomain14'))hero.insertAdjacentHTML('beforeend',`<button class="classBtn printDomain14">🖨 Domaine / PDF</button>`),hero.querySelector('.printDomain14').onclick=()=>printDomain(d);
 const cards=[...document.querySelectorAll('.activityCard')];const offset=Number(h.split(':')[2]||0);
 cards.forEach((card,i)=>{if(card.querySelector('.printActivity14')||!d.activities[i+offset])return;const btn=document.createElement('button');btn.className='classBtn printActivity14';btn.textContent='🖨 Activité / PDF';btn.onclick=()=>printActivity(d.activities[i+offset],d);card.querySelector('.activityHead')?.appendChild(btn);});
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
function decorate14(){if(!practice14||!catalog||!themePack)return;injectHomeEnhancements();injectDomainPrints();const tabs=document.querySelector('.browseTabs');if(tabs&&!tabs.querySelector('[data-subjects]'))tabs.insertAdjacentHTML('beforeend',`<a data-subjects href="#subjects-all">Par matière / activité</a>`);if(!tabs&&/^#(?:subjects-all|activity-subject:|domain-all:|themes)/.test(location.hash))document.querySelector('.hero,.sectionTitle')?.insertAdjacentHTML('beforebegin',`<nav class="browseTabs klassia-learning-mode"><a href="#themes">Par thème / unité</a><a href="#subjects-all">Par matière / activité</a><a href="#domains-all">Par domaine</a></nav>`);}
document.addEventListener('klassia:render',decorate14);
})();
