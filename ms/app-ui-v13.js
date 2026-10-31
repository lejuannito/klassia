function activityCard(a,i){
 const p=loadProg(),st=p[a.id]||'D';
 let main='';
 if(a.prompt_fr||a.prompt_en)main+=`<div class="bilingual">${a.prompt_fr?`<div class="lang"><b>🇫🇷 Français</b>${esc(a.prompt_fr)}</div>`:''}${a.prompt_en?`<div class="lang"><b>🇬🇧 English</b>${esc(a.prompt_en)}</div>`:''}</div>`;
 if(a.story_fr||a.story_en)main+=`<div class="bilingual">${a.story_fr?`<div class="lang"><b>📖 Histoire</b>${esc(a.story_fr)}</div>`:''}${a.story_en?`<div class="lang"><b>📖 Story</b>${esc(a.story_en)}</div>`:''}</div>`;
 main+=renderVisual(a.visual)+renderDiagram(a.diagram)+renderTable(a.table)+renderBassaVariants(a.bassa_variants);
 if(a.steps_fr||a.steps_en)main+=`<div class="bilingual">${renderList('Étapes',a.steps_fr)}${renderList('Steps',a.steps_en)}</div>`;
 if(a.game_fr||a.game_en)main+=`<div class="bilingual">${a.game_fr?`<div class="lang"><b>🎲 Jeu</b>${esc(a.game_fr)}</div>`:''}${a.game_en?`<div class="lang"><b>🎲 Game</b>${esc(a.game_en)}</div>`:''}</div>`;
 if(a.activity_fr||a.activity_en)main+=`<div class="bilingual">${a.activity_fr?`<div class="lang"><b>👐 Activité</b>${esc(a.activity_fr)}</div>`:''}${a.activity_en?`<div class="lang"><b>👐 Activity</b>${esc(a.activity_en)}</div>`:''}</div>`;
 if(a.materials)main+=`<div class="lang"><b>Matériel</b>${a.materials.map(esc).join(' · ')}</div>`;
 if(a.course)main+=renderList('Parcours',a.course);
 if(a.questions?.length)main+=`<div class="observe"><b>Questions / Questions</b>${a.questions.map(q=>`<div style="margin:7px 0">${esc(q.fr)}<br><i>${esc(q.en)}</i></div>`).join('')}</div>`;
 if(a.source_note)main+=`<div class="notice">${esc(a.source_note)}</div>`;
 if(a.observe?.length)main+=`<div class="observe"><b>👀 J’observe</b>${a.observe.map(x=>`<div>• ${esc(x)}</div>`).join('')}</div>`;
 main+=`<div class="statusRow"><button data-id="${a.id}" data-st="D" class="${st==='D'?'active':''}">Découvre</button><button data-id="${a.id}" data-st="EC" class="${st==='EC'?'active':''}">En cours</button><button data-id="${a.id}" data-st="A" class="${st==='A'?'active':''}">Acquis</button></div>`;
 return `<article class="activityCard"><div class="activityHead"><div class="num">${i+1}</div><div><h3>${esc(a.title_fr)}</h3><p>${esc(a.title_en)}</p></div></div><div class="activityBody"><div class="bilingual"><div class="lang"><b>Objectif</b>${esc(a.goal_fr||'')}</div><div class="lang"><b>Goal</b>${esc(a.goal_en||'')}</div></div>${main}</div></article>`;
}
function domainPage(id){
 const d=theme.domains.find(x=>x.id===id); if(!d)return home();
 let body=`<button class="back" onclick="location.hash='#home'">← Retour au thème</button><section class="hero"><div class="eyebrow">${d.weight}</div><h1>${d.icon} ${esc(d.name_fr)}</h1><p>${esc(d.name_en)}</p></section>`;
 d.activities.forEach((a,i)=>body+=activityCard(a,i));
 shell(body);
 document.querySelectorAll('.statusRow button').forEach(b=>b.onclick=()=>{const p=loadProg();p[b.dataset.id]=b.dataset.st;saveProg(p);domainPage(id)});
}
function themesPage(){
 let body=`<button class="back" onclick="location.hash='#home'">← Retour</button><div class="sectionTitle"><h2>Parcours Moyenne Section bilingue</h2><p>Huit thèmes intégrateurs, tous disponibles dans cette édition.</p></div><div class="themes">`;
 catalog.themes.forEach(t=>body+=`<button class="themeCard themeOpen" data-theme="${t.id}"><div class="themeNum">${t.number}</div><div><strong>${esc(t.title_fr)}</strong><div>${esc(t.title_en)}</div></div><div class="spacer"></div><span class="badge">Disponible</span></button>`);
 body+=`</div>`;shell(body);
 document.querySelectorAll('[data-theme]').forEach(b=>b.onclick=async()=>{await loadTheme(b.dataset.theme);history.replaceState(null,'',`?theme=${b.dataset.theme}#home`);home()});
}
function assessmentPage(){
 let body=`<button class="back" onclick="location.hash='#home'">← Retour</button><section class="hero"><div class="eyebrow">SUIVI PAR OBSERVATION</div><h1>${esc(theme.assessment.title_fr)}</h1><p>${esc(theme.assessment.title_en)}</p></section><div class="notice">Évaluer ici signifie observer pour mieux accompagner. On ne cherche ni classement ni note.</div>`;
 body+=`<div class="sectionTitle"><h2>Échelle</h2></div>${theme.assessment.scale.map(s=>`<div class="themeCard"><div class="themeNum">${s.code}</div><div><strong>${esc(s.label_fr)} · ${esc(s.label_en)}</strong><div>${esc(s.description)}</div></div></div>`).join('')}`;
 body+=`<div class="sectionTitle"><h2>Indicateurs</h2></div><section class="assessment">${theme.assessment.indicators.map(x=>`<div class="indicator"><span>○</span><div>${esc(x)}</div></div>`).join('')}</section>`;
 shell(body);
}
window.addEventListener('hashchange',route);
boot().catch(e=>app.innerHTML=`<div class="loading">Impossible de charger la Moyenne Section : ${esc(e.message)}</div>`);
