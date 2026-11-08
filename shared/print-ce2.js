const esc14 = Klassia.escape;
const nl14 = s => esc14(s).replace(/\n/g,'<br>');

function lessonHtml(l,index,adult,asset){
  let h=`<section class="p-lesson"><h3>${esc14(index!=null?`${index+1}. `:'')}${esc14(l.title)}</h3>`;
  if(l.objectives?.length)h+=`<p class="obj"><b>Objectif :</b> ${esc14(l.objectives.join(' · '))}</p>`;
  if(l.figure)h+=`<img style="max-width:100%" src="${esc14(asset(l.figure.src))}" alt="${esc14(l.figure.alt)}">`;
  if(l.discover)h+=`<div class="box"><b>Je découvre</b><p>${nl14(l.discover)}</p></div>`;
  if(l.learn?.length)h+=`<div class="box"><b>Je comprends</b>${l.learn.map(x=>`<p>${nl14(x)}</p>`).join('')}</div>`;
  if(l.manual_sections?.length)h+=l.manual_sections.map(sec=>{
    let x=`<div class="manual"><b>${esc14(sec.title||'Approfondir')}</b>`;
    if(sec.body)x+=`<p>${nl14(sec.body)}</p>`;
    if(sec.items?.length)x+=`<ul>${sec.items.map(i=>`<li>${nl14(i)}</li>`).join('')}</ul>`;
    if(sec.table?.headers)x+=`<table><thead><tr>${sec.table.headers.map(v=>`<th>${esc14(v)}</th>`).join('')}</tr></thead><tbody>${(sec.table.rows||[]).map(r=>`<tr>${r.map(v=>`<td>${nl14(v)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
    return x+'</div>';
  }).join('');
  if(adult&&l.teacher_guide)h+=`<section class="box"><h4>Guide adulte</h4><p>${esc14(l.teacher_guide.preparation)}</p><p>${esc14(l.teacher_guide.adaptation)}</p><ul>${(l.teacher_guide.observation||[]).map(x=>`<li>${esc14(x)}</li>`).join('')}</ul></section>`;
  if(l.takeaway)h+=`<div class="take"><b>Je retiens</b><p>${nl14(l.takeaway)}</p></div>`;
  if(l.practical?.length)h+=`<div class="box"><b>J’expérimente</b><ul>${l.practical.map(x=>`<li>${nl14(x)}</li>`).join('')}</ul></div>`;
  if(l.exercises?.length)h+=`<section class="box"><h4>Je m’exerce</h4>${l.exercises.map((e,i)=>`<div class="print-question"><p><b>${i+1}.</b> ${nl14(e.prompt)}</p>${e.choices?.length?`<ul>${e.choices.map(choice=>`<li>${esc14(choice)}</li>`).join('')}</ul>`:''}${adult?`<p class="print-answer"><b>Correction</b> ${nl14(e.type==='mcq'?e.choices?.[e.correct_choice]:e.answer)}${e.explanation?`<br>${nl14(e.explanation)}`:''}</p>`:'<div class="answer-lines"></div>'}</div>`).join('')}</section>`;
  return h+'</section>';
}
function dictationHtml(d,student=false){
  if(student)return `<div class="dict"><h2>${esc14(d.title)}</h2><h3>Mots à préparer</h3><p>${d.words.map(esc14).join(' · ')}</p><h3>Entraînement</h3>${d.sentences.map((x,i)=>`<p>${i+1}. ${esc14(x)}</p>`).join('')}<h3>Dictée</h3><p>Écoute le texte dicté par l’adulte et écris soigneusement.</p><div class="answer-lines" style="height:100mm"></div></div>`;
  return `<div class="dict"><h2>${esc14(d.title)} — guide adulte</h2><h3>Mots à préparer</h3><p>${d.words.map(esc14).join(' · ')}</p><h3>Phrases d’entraînement</h3>${d.sentences.map(x=>`<p>• ${esc14(x)}</p>`).join('')}<h3>Texte de dictée bilan</h3><p>${esc14(d.passage)}</p><h3>Points de vigilance</h3><ul>${d.focus.map(x=>`<li>${esc14(x)}</li>`).join('')}</ul></div>`;
}
function problemsHtml(p,title,answers){
 return `<div class="prob"><h2>Problèmes posés — ${esc14(title)}</h2>${p.map((x,i)=>`<section><h3>${i+1}. ${esc14(x.title)}</h3><p>${esc14(x.statement)}</p>${answers?`<div class="answer"><b>Démarche :</b> ${esc14(x.skill)}<br><b>Opération :</b> ${esc14(x.operation)}<br><b>Phrase-réponse :</b> ${esc14(x.answer)}</div>`:`<p><b>Je cherche :</b></p><div class="answer-lines"></div><p><b>Opération posée :</b></p><div class="answer-lines" style="height:35mm"></div><p><b>Phrase-réponse :</b></p><div class="answer-lines" style="height:20mm"></div>`}</section>`).join('<hr>')}</div>`;
}

export async function printCE2({kind,unit,id,adult,get,asset}){
  const {units} = await get('data/catalog.json');
  const selected = units.find(u=>u.id===unit);
  if(!selected)throw Error('Unité introuvable.');
  const unitHref = './?unit='+selected.id;
  const caption = u => `Unité ${u.number} · ${u.title}`;
  if(kind==='dictee'||kind==='problemes'){
    const {units:practice} = await get('data/ce2-practice-v14.json');
    const {dictation,problems,title} = practice[selected.id];
    return kind==='dictee'
      ? {title:dictation.title,body:dictationHtml(dictation,!adult),back:unitHref+'#subject:FR'}
      : {title:'Problèmes posés',body:problemsHtml(problems,title,adult),back:unitHref+'#subject:MA'};
  }
  const renderSubject = s => s.lessons.map((l,i)=>lessonHtml(l,i,adult,asset)).join('');
  if(kind==='matiere-complete'){
    const contents=await Promise.all(units.map(u=>get(u.content)));
    const matches=contents.map((c,i)=>({subject:c.subjects.find(s=>s.id===id),unit:units[i]})).filter(x=>x.subject);
    if(!matches.length)throw Error('Matière introuvable.');
    return {title:matches[0].subject.name+' · Huit unités',back:unitHref+'#subject-all:'+id,
      body:matches.map(({subject,unit})=>`<section class="print-chapter"><h2>${esc14(caption(unit))}</h2>${renderSubject(subject)}</section>`).join('')};
  }
  const {subjects} = await get(selected.content);
  if(kind==='theme')return {title:caption(selected),back:unitHref+'#learn',
    body:subjects.map(s=>`<section class="print-chapter"><h2>${esc14(s.name)}</h2>${renderSubject(s)}</section>`).join('')};
  if(kind==='matiere'){
    const subject=subjects.find(s=>s.id===id);
    if(!subject)throw Error('Matière introuvable.');
    return {title:`${subject.name} · ${caption(selected)}`,body:renderSubject(subject),back:unitHref+'#subject:'+subject.id};
  }
  const lesson=kind==='lecon'&&subjects.flatMap(s=>s.lessons).find(l=>l.id===id);
  if(!lesson)throw Error('Leçon introuvable.');
  return {title:lesson.title,body:lessonHtml(lesson,null,adult,asset),back:unitHref+'#lesson:'+encodeURIComponent(lesson.id)};
}
