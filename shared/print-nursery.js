const esc14 = Klassia.escape;
const {renderVisual,renderDiagram,renderTable,worksheetsForTheme}=Klassia.nurserySupport;

function activityPrintHtml(a,d,adult,asset){
 let h=`<article class="activityPrint"><h2>${esc14(a.title_fr)} · <span lang="en">${esc14(a.title_en)}</span></h2><p>${esc14(d.name_fr)} · ${esc14(d.name_en)}</p>`;
 for(const [field,label] of [['goal','Objectif / Goal'],['prompt','Consigne / Prompt'],['story','Histoire / Story'],['game','Jeu / Game'],['activity','Activité / Activity']]){if(a[field+'_fr'])h+=`<p><b>${label}</b> ${esc14(a[field+'_fr'])}</p>`;if(a[field+'_en'])h+=`<p lang="en">${esc14(a[field+'_en'])}</p>`;}
 if(a.figure)h+=`<img style="max-width:100%" src="${esc14(asset(a.figure.src))}" alt="${esc14(a.figure.alt)}">`;
 if(a.interactive)h+=`<p>${esc14(a.interactive.prompt_fr)} <span lang="en">${esc14(a.interactive.prompt_en)}</span></p>${adult?`<p>Repère adulte : ${esc14(a.interactive.explanation_fr)} ${esc14(a.interactive.explanation_en)}</p>`:'<div class="answer-lines"></div>'}`;
 if(adult&&a.teacher_guide)h+=`<p><b>Guide adulte :</b> ${esc14(a.teacher_guide.preparation)} ${esc14(a.teacher_guide.adaptation)} ${esc14(a.teacher_guide.follow_up)}</p>`;
 h+=renderVisual(a.visual)+renderDiagram(a.diagram)+renderTable(a.table);
 for(const lang of ['fr','en'])if(a['steps_'+lang]?.length)h+=`<h3>${lang==='fr'?'Étapes':'Steps'}</h3><ol lang="${lang}">${a['steps_'+lang].map(x=>`<li>${esc14(x)}</li>`).join('')}</ol>`;
 if(a.materials?.length)h+=`<p><b>Matériel :</b> ${a.materials.map(esc14).join(' · ')}</p>`;
 if(a.course?.length)h+=`<h3>Parcours</h3><ol>${a.course.map(x=>`<li>${esc14(x)}</li>`).join('')}</ol>`;
 if(a.questions?.length)h+=`<h3>Questions</h3>${a.questions.map(q=>`<p>${esc14(q.fr)}<br><span lang="en">${esc14(q.en)}</span>${adult&&q.answer?`<br><b>Repère de réponse :</b> ${esc14(q.answer)}`:''}</p>`).join('')}`;
 if(adult&&a.bassa_variants?.length)h+=`<div class="bassa"><b>Bassa — propositions documentaires non validées, toutes acceptées pour le sens demandé</b>${a.bassa_variants.map(x=>`<p><b>${esc14(x.concept)}</b> : ${(x.forms||[]).map(esc14).join(' · ')}<br>Sources : ${(x.sources||[]).map(esc14).join(' · ')}<br>${esc14(x.note||'')}</p>`).join('')}</div>`;
 if(a.source_note)h+=`<p>${esc14(a.source_note)}</p>`;
 if(adult&&a.observe?.length)h+=`<h3>Observation</h3><ul>${a.observe.map(x=>`<li>${esc14(x)}</li>`).join('')}</ul>`;
 return h+'</article>';
}

export async function printNursery({grade,kind,unit,id,adult,get,asset}){
 const directory=grade.toLowerCase()+'/';
 const themePath=t=>directory+'data/themes/'+t+'.json';
 const theme=await get(themePath(unit));
 const themeName=t=>`${esc14(t.title_fr)} · <span lang="en">${esc14(t.title_en)}</span>`;
 const back='./'+directory+'?theme='+theme.id;
 const activities=d=>d.activities.map(a=>activityPrintHtml(a,d,adult,asset)).join('');
 const renderSheet=w=>`<section class="print-chapter worksheet"><h2>${esc14(w.title)}</h2><p>${esc14(w.instruction_fr)}</p><p lang="en">${esc14(w.instruction_en)}</p>${w.html}<div class="answer-lines"></div></section>`;
 const worksheetSet=async()=>{
  const {themes}=await get(directory+'practice-v14.json');
  return worksheetsForTheme(themes[theme.id],grade,theme.id);
 };
 if(kind==='graphisme'){
  const sheets=(await worksheetSet()).filter(w=>!id||w.id===id);
  if(!sheets.length)throw Error('Fiche de graphisme introuvable.');
  return {title:sheets.length===1?sheets[0].title:'Cahier de graphisme',back:back+'#worksheets',adultVariant:false,body:sheets.map(renderSheet).join('')};
 }
 if(kind==='theme'){
  const sheets=await worksheetSet();
  return {title:theme.title_fr,back:back+'#home',body:`<p>${themeName(theme)}</p><p>${esc14(theme.project?.description_fr)}</p>`+
   theme.domains.map(d=>`<section class="print-chapter"><h2>${esc14(d.name_fr)}</h2>${activities(d)}</section>`).join('')+sheets.map(renderSheet).join('')};
 }
 if(kind==='domaine-complet'){
  const {themes}=await get(directory+'data/catalog-v13.json');
  const all=await Promise.all(themes.map(t=>get(themePath(t.id))));
  const matches=all.map(t=>({theme:t,domain:t.domains.find(d=>d.id===id)})).filter(x=>x.domain);
  if(!matches.length)throw Error('Domaine introuvable.');
  return {title:matches[0].domain.name_fr+' · Huit thèmes',back:back+'#domain-all:'+id,body:matches.map(({theme,domain})=>
   `<section class="print-chapter"><h2>${themeName(theme)}</h2>${activities(domain)}</section>`).join('')};
 }
 if(kind==='domaine'){
  const domain=theme.domains.find(d=>d.id===id);
  if(!domain)throw Error('Domaine introuvable.');
  return {title:domain.name_fr,back:back+'#domain:'+domain.id,body:`<p>${themeName(theme)}</p>`+activities(domain)};
 }
 const domain=kind==='activite'&&theme.domains.find(d=>d.activities.some(a=>a.id===id));
 if(!domain)throw Error('Activité introuvable.');
 const index=domain.activities.findIndex(a=>a.id===id),activity=domain.activities[index];
 return {title:activity.title_fr,back:back+'#domain:'+domain.id+':'+index,body:`<p>${themeName(theme)}</p>`+activityPrintHtml(activity,domain,adult,asset)};
}
