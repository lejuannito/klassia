function activityCard(a,i){
 const p=loadProg(),st=p[a.id]||'D';
 let main='';
 if(a.prompt_fr||a.prompt_en)main+=`<div class="bilingual">${a.prompt_fr?`<div class="lang"><b>🇫🇷 Français</b>${esc(a.prompt_fr)}</div>`:''}${a.prompt_en?`<div class="lang" lang="en"><b>🇬🇧 English</b>${esc(a.prompt_en)}</div>`:''}</div>`;
 if(a.story_fr||a.story_en)main+=`<div class="bilingual">${a.story_fr?`<div class="lang"><b>📖 Histoire</b>${esc(a.story_fr)}</div>`:''}${a.story_en?`<div class="lang" lang="en"><b>📖 Story</b>${esc(a.story_en)}</div>`:''}</div>`;
 if(a.figure)main+=`<img class="lesson-figure" src="${esc(a.figure.src)}" alt="${esc(a.figure.alt)}">`;
 if(a.interactive)main+=`<div class="lang"><label for="msNumber"><b>${esc(a.interactive.prompt_fr)}</b> <span lang="en">${esc(a.interactive.prompt_en)}</span></label><input id="msNumber" inputmode="numeric"><button class="classBtn" id="msCheckNumber">Vérifier / Check</button><p id="msNumberResult" role="status"></p></div>`;
 if(a.source_refs)main+=`<details class="adult-guide"><summary>Repères du curriculum</summary><p>${esc(a.source_refs.join(' · '))}</p><p>Activité originale Klassia; correspondance proposée à relire.</p></details>`;
 main+=renderVisual(a.visual)+renderDiagram(a.diagram)+renderTable(a.table)+(a.type==='bassa'?'':renderBassaVariants(a.bassa_variants));
 if(a.steps_fr||a.steps_en)main+=`<div class="bilingual">${renderList('Étapes',a.steps_fr)}${renderList('Steps',a.steps_en)}</div>`;
 if(a.game_fr||a.game_en)main+=`<div class="bilingual">${a.game_fr?`<div class="lang"><b>🎲 Jeu</b>${esc(a.game_fr)}</div>`:''}${a.game_en?`<div class="lang"><b>🎲 Game</b>${esc(a.game_en)}</div>`:''}</div>`;
 if(a.activity_fr||a.activity_en)main+=`<div class="bilingual">${a.activity_fr?`<div class="lang"><b>👐 Activité</b>${esc(a.activity_fr)}</div>`:''}${a.activity_en?`<div class="lang"><b>👐 Activity</b>${esc(a.activity_en)}</div>`:''}</div>`;
 if(a.materials)main+=`<div class="lang"><b>Matériel</b>${a.materials.map(esc).join(' · ')}</div>`;
 if(a.course)main+=renderList('Parcours',a.course);
 if(a.questions?.length)main+=`<div class="observe"><b>Questions / Questions</b>${a.questions.map(q=>`<div style="margin:7px 0">${esc(q.fr)}<br><i>${esc(q.en)}</i>${q.answer?`<details class="answer-reveal"><summary>Repère de réponse / Answer guide</summary><p>${esc(q.answer)}</p></details>`:''}</div>`).join('')}</div>`;
 if(a.source_note)main+=`<div class="notice">${esc(a.source_note)}</div>`;
 if(a.observe?.length)main+=`<div class="observe"><b>👀 J’observe</b>${a.observe.map(x=>`<div>• ${esc(x)}</div>`).join('')}</div>`;
 if(a.teacher_guide)main+=`<details class="adult-guide"><summary>Préparer et adapter l’activité</summary><p>${esc(a.teacher_guide.preparation)}</p><p>${esc(a.teacher_guide.adaptation)}</p><p>${esc(a.teacher_guide.follow_up)}</p></details>`;
 main+=`<div class="statusRow"><button data-id="${a.id}" data-st="D" class="${st==='D'?'active':''}">Découvre</button><button data-id="${a.id}" data-st="EC" class="${st==='EC'?'active':''}">En cours</button><button data-id="${a.id}" data-st="A" class="${st==='A'?'active':''}">Acquis</button></div>`;
 return `<article class="activityCard"><div class="activityHead"><div class="num">${i+1}</div><div><h3>${esc(a.title_fr)}</h3><p>${esc(a.title_en)}</p></div></div><div class="activityBody"><div class="bilingual"><div class="lang"><b>Objectif</b>${esc(a.goal_fr||'')}</div><div class="lang" lang="en"><b>Goal</b>${esc(a.goal_en||'')}</div></div>${main}</div></article>`;
}
function domainPage(id,index=0){
 const d=theme.domains.find(x=>x.id===id);if(!d)return home();
 index=Math.max(0,Math.min(d.activities.length-1,index));const a=d.activities[index];
 let body=`<button class="back" onclick="location.hash='#home'">← Retour au thème</button><section class="hero"><h1>${d.icon} ${esc(d.name_fr)}</h1><p lang="en">${esc(d.name_en)}</p></section><nav class="activity-browser" aria-label="Activités"><button id="prevActivity" ${index===0?'disabled':''}>← Précédente</button><span>${index+1} / ${d.activities.length}</span><button id="nextActivity" ${index===d.activities.length-1?'disabled':''}>Suivante →</button></nav>`;
 body+=activityCard(a,index);body+=`<details class="adult-guide"><summary>Observation de l’adulte</summary><form id="observeActivity" class="observation-form"><label>Langue <select id="observeLang"><option>Français</option><option>English</option><option>Bassa</option></select></label><label>Aide nécessaire <select id="observeHelp"><option>Seul</option><option>Avec une consigne répétée</option><option>Avec démonstration</option><option>Pas encore réalisé</option></select></label><label>Ce que j’ai observé (sans donnée sensible)<textarea id="observeNote" maxlength="500"></textarea></label><button class="classBtn">Enregistrer l’observation</button><p id="observeResult" role="status"></p></form></details>`;
 shell(body);document.getElementById('prevActivity').onclick=()=>location.hash='#domain:'+id+':'+(index-1);document.getElementById('nextActivity').onclick=()=>location.hash='#domain:'+id+':'+(index+1);
 document.querySelector('.activityCard').dataset.activityId=a.id;
 if(a.interactive)document.getElementById('msCheckNumber').onclick=()=>{const raw=document.getElementById('msNumber').value.trim(),box=document.getElementById('msNumberResult');if(!/^\d+$/.test(raw)){box.textContent='Écris un nombre / Write a number.';return;}const ok=Number(raw)===a.interactive.answer;box.textContent=(ok?'Bravo ! ':'Comptons ensemble. ')+a.interactive.explanation_fr+' '+a.interactive.explanation_en;Klassia.append('klassia_attempts',{grade:NURSERY.grade,kind:'number',activity:a.id,theme:theme.id,ok});};
 document.querySelectorAll('.statusRow button').forEach(b=>b.onclick=()=>{const p=loadProg();p[b.dataset.id]=b.dataset.st;saveProg(p);Klassia.append('klassia_observations',{grade:NURSERY.grade,theme:theme.id,activity:a.id,status:b.dataset.st});document.querySelectorAll('.statusRow button').forEach(x=>x.classList.toggle('active',x===b));});
 document.getElementById('observeActivity').onsubmit=e=>{e.preventDefault();Klassia.append('klassia_observations',{grade:NURSERY.grade,theme:theme.id,activity:a.id,language:document.getElementById('observeLang').value,help:document.getElementById('observeHelp').value,note:document.getElementById('observeNote').value});document.getElementById('observeResult').textContent='Observation datée enregistrée pour '+Klassia.profile().name;};
 const card=document.querySelector('.activityBody');if(a.type==='bassa')Klassia.Bassa?.mount(card,NURSERY.grade,a.id);
 if(a.type!=='bassa'){Klassia.addSpeech(card,[a.title_en,a.prompt_en,a.story_en,...(a.steps_en||[]),a.game_en].filter(Boolean).join('. '),'en-GB');Klassia.addSpeech(card,[a.title_fr,a.prompt_fr,a.story_fr,...(a.steps_fr||[]),a.game_fr].filter(Boolean).join('. '),'fr-FR');}
}
function themesPage(){
 let body=`<button class="back" onclick="location.hash='#home'">← Retour</button><div class="sectionTitle"><h2>Parcours ${esc(NURSERY.label)}</h2><p>Huit thèmes intégrateurs, tous disponibles dans cette édition.</p></div><div class="themes">`;
 catalog.themes.forEach(t=>body+=`<button class="themeCard themeOpen" data-theme="${t.id}"><div class="themeNum">${t.number}</div><div><strong>${esc(t.title_fr)}</strong><div>${esc(t.title_en)}</div></div><div class="spacer"></div><span class="badge">Disponible</span></button>`);
 body+=`</div>`;shell(body);
 document.querySelectorAll('[data-theme]').forEach(b=>b.onclick=async()=>{await loadTheme(b.dataset.theme);history.replaceState(null,'',`?theme=${b.dataset.theme}#home`);home()});
}
function assessmentPage(){
 let body=`<button class="back" onclick="location.hash='#home'">← Retour</button><section class="hero"><div class="eyebrow">SUIVI PAR OBSERVATION</div><h1>${esc(theme.assessment.title_fr)}</h1><p>${esc(theme.assessment.title_en)}</p></section><div class="notice">Évaluer ici signifie observer pour mieux accompagner. On ne cherche ni classement ni note.</div>`;
 body+=`<div class="sectionTitle"><h2>Échelle</h2></div>${theme.assessment.scale.map(s=>`<div class="themeCard"><div class="themeNum">${s.code}</div><div><strong>${esc(s.label_fr)} · ${esc(s.label_en)}</strong><div>${esc(s.description)}</div></div></div>`).join('')}`;
 body+=`<div class="sectionTitle"><h2>Indicateurs</h2></div><section class="assessment">${theme.assessment.indicators.map(x=>`<div class="indicator"><span>○</span><div>${esc(x)}</div></div>`).join('')}</section>`;
 const observations=Klassia.read('klassia_observations',[]).filter(x=>x.grade===NURSERY.grade&&x.theme===theme.id);body+=`<section class="project"><h2>Observations enregistrées</h2>${observations.slice(-20).reverse().map(x=>`<p><b>${esc(x.activity)}</b> · ${esc(new Date(x.at).toLocaleDateString('fr-FR'))} · ${esc(x.language||'')} ${esc(x.help||x.status||'')}<br>${esc(x.note||'')}</p>`).join('')||'<p>Aucune observation enregistrée pour ce thème.</p>'}</section>`;shell(body);
}
window.addEventListener('hashchange',route);
boot().catch(e=>app.innerHTML=`<div class="loading">Impossible de charger ${esc(NURSERY.label)} : ${esc(e.message)}</div>`);

