// Guided session (lot 4a): one language at a time, a four-line parent card,
// a child screen (picture, speaker, action) and the outcome in one gesture.
const NURSERY_LANG='klassia_nursery_lang_v1';
function nurseryLang(){const v=Klassia.read(NURSERY_LANG,null);return v==='fr'||v==='en'?v:(Klassia.read('klassia_family',{})?.school==='en'?'en':'fr');}
const NL={
 fr:{name:'Français',goal:'Objectif',card:'Fiche parent',time:'Durée',materials:'Matériel',say:'Ce que je dis',watch:'Ce que je regarde',show:'▶ Montrer à l’enfant',close:'✕ Retour à l’adulte',done:'✋ J’ai fini !',steps:'Déroulement',story:'📖 Histoire',game:'🎲 Jeu',activity:'👐 Activité',questions:'Questions',check:'Vérifier',number:'Écris un nombre.',bravo:'Bravo ! ',again:'Comptons ensemble. ',rate:'Comment ça s’est passé ?',rated:'C’est noté.',minutes:n=>n+' min environ',base:y=>'Programme · '+(y===2?'2e année':'1re année'),plus:'Pour aller plus loin',note:'Ajouter une note d’observation',noteLabel:'Ce que j’ai observé (sans donnée sensible)',save:'Enregistrer l’observation',saved:n=>'Observation datée enregistrée pour '+n},
 en:{name:'English',goal:'Goal',card:'Parent card',time:'Time',materials:'Materials',say:'What I say',watch:'What I watch for',show:'▶ Show the child',close:'✕ Back to the adult',done:'✋ I’ve finished!',steps:'Steps',story:'📖 Story',game:'🎲 Game',activity:'👐 Activity',questions:'Questions',check:'Check',number:'Write a number.',bravo:'Well done! ',again:'Let’s count together. ',rate:'How did it go?',rated:'Noted.',minutes:n=>'about '+n+' min',base:y=>'Curriculum · year '+(y===2?'two':'one'),plus:'Going further',note:'Add an observation note',noteLabel:'What I observed (no sensitive data)',save:'Save the observation',saved:n=>'Dated observation saved for '+n}
};
// Outcome scale of the nursery curriculum: on their own, with help, not yet.
const RATINGS=[['alone','A',{fr:'✓ Seul',en:'✓ On their own'}],['helped','EC',{fr:'Avec aide',en:'With help'}],['notyet','EC',{fr:'Pas encore',en:'Not yet'}]];
const pick=(a,k,l)=>a[k+'_'+l]||a[k+'_'+(l==='fr'?'en':'fr')]||'';
const steps=(a,l)=>a['steps_'+l]||a.steps_fr||a.steps_en||[];
function sayText(a,l){return pick(a,'prompt',l)||pick(a,'activity',l)||pick(a,'game',l)||steps(a,l)[0]||pick(a,'goal',l);}
function lastRating(id){const p=loadProg()[id],o=[...Klassia.read('klassia_observations',[])].reverse().find(x=>x.grade===NURSERY.grade&&x.activity===id&&x.rating);return o?.rating||(p==='A'?'alone':p==='EC'?'helped':'');}
function activityCard(a,i){
 const l=nurseryLang(),t=NL[l],voice=l==='fr'?'fr-FR':'en-GB',say=sayText(a,l),watch=a['observe_'+l]||a.observe||[],rated=lastRating(a.id);
 const mats=(l==='en'&&a.materials_en?.length?a.materials_en:a.materials)||[];
 const card=[a.duration_minutes?`<div><dt>⏱ ${t.time}</dt><dd>${esc(t.minutes(a.duration_minutes))}</dd></div>`:'',mats.length?`<div><dt>🧺 ${t.materials}</dt><dd>${mats.map(esc).join(' · ')}</dd></div>`:'',say?`<div><dt>💬 ${t.say}</dt><dd>${esc(say)}</dd></div>`:'',watch.length?`<div><dt>👀 ${t.watch}</dt><dd>${watch.map(esc).join(' · ')}</dd></div>`:''].join('');
 let stage='';
 if(a.type!=='bassa')stage+=Klassia.speech.clip(a['audio_'+l],voice);
 if(a.figure)stage+=`<img class="lesson-figure" src="${esc(a.figure.src)}" alt="${esc(a.figure.alt)}">`;
 stage+=renderVisual(a.visual)+renderDiagram(a.diagram)+renderTable(a.table);
 if(a.interactive)stage+=`<div class="lang nursery-number"><label for="msNumber"><b>${esc(pick(a.interactive,'prompt',l))}</b></label><input id="msNumber" inputmode="numeric"><button class="classBtn" id="msCheckNumber">${t.check}</button><p id="msNumberResult" role="status"></p></div>`;
 if(a.ink)stage+=Klassia.ink.pad(NURSERY.grade+':'+a.id,a.ink);
 let more='';
 const story=pick(a,'story',l);if(story)more+=`<div class="lang"><b>${t.story}</b>${esc(story)}</div>`;
 more+=renderList(t.steps,steps(a,l));
 const game=pick(a,'game',l);if(game)more+=`<div class="lang"><b>${t.game}</b>${esc(game)}</div>`;
 const act=pick(a,'activity',l);if(act)more+=`<div class="lang"><b>${t.activity}</b>${esc(act)}</div>`;
 if(a.course)more+=renderList('Parcours',a.course);
 if(a.questions?.length)more+=`<div class="observe"><b>${t.questions}</b>${a.questions.map((q,index)=>`<div class="nursery-question"><p>${esc(q[l]||q.fr)}</p>${q.answer?Klassia.correction.html(a.id+'_question_'+index,`<p>${esc(q.answer)}</p>`,{nursery:true}):''}</div>`).join('')}</div>`;
 if(a.source_note)more+=`<div class="notice">${esc(a.source_note)}</div>`;
 if(a.type!=='bassa')more+=renderBassaVariants(a.bassa_variants);
 if(a.source_refs)more+=`<details class="adult-guide"><summary>Repères du curriculum</summary><p>${esc(a.source_refs.join(' · '))}</p><p>Activité originale Klassia; correspondance proposée à relire.</p></details>`;
 if(a.teacher_guide&&Klassia.isAdultSpace())more+=`<details class="adult-guide"><summary>Préparer et adapter l’activité</summary><p>${esc(a.teacher_guide.preparation)}</p><p>${esc(a.teacher_guide.adaptation)}</p><p>${esc(a.teacher_guide.follow_up)}</p></details>`;
 const rating=`<section class="nursery-rating" aria-labelledby="rate-${esc(a.id)}"><h4 id="rate-${esc(a.id)}">${t.rate}</h4><div role="group">${RATINGS.map(([key,,label])=>`<button type="button" data-rate="${key}" aria-pressed="${rated===key}">${label[l]}</button>`).join('')}</div><p class="nursery-rated" role="status"></p></section>`;
 return `<article class="activityCard" data-activity-id="${esc(a.id)}" lang="${l}"><div class="activityHead"><div class="num">${i+1}</div><div><h3>${esc(pick(a,'title',l))}</h3></div></div><div class="activityBody"><p class="nursery-path${a.path==='plus'?' nursery-path-plus':''}" data-path="${a.path==='plus'?'plus':'base'}">${a.path==='plus'?t.plus:t.base(NURSERY.grade==='GS'?2:1)}</p><p class="nursery-goal"><b>${t.goal}</b> ${esc(pick(a,'goal',l))}</p>${card?`<dl class="nursery-card" aria-label="${t.card}">${card}</dl>`:''}${a.type==='bassa'?'':`<button type="button" class="nursery-show" data-child-show>${t.show}</button>`}<div class="nursery-stage"><button type="button" class="nursery-close" data-child-close>${t.close}</button>${stage}<button type="button" class="nursery-done" data-child-close>${t.done}</button></div><div class="nursery-more">${more}</div>${rating}</div></article>`;
}
function domainPage(id,index=0){
 const d=theme.domains.find(x=>x.id===id);if(!d)return home();
 index=Math.max(0,Math.min(d.activities.length-1,index));const a=d.activities[index];Klassia.write(RECENT_KEY,{theme:theme.id,id:a.id,at:Date.now()});
 const l=nurseryLang(),t=NL[l];
 let body=`<button class="back" onclick="location.hash='#home'">← Retour au thème</button><section class="hero"><h1>${d.icon} ${esc(l==='en'?d.name_en:d.name_fr)}</h1></section><div class="nursery-lang" role="group" aria-label="Langue de l’activité · Activity language">${['fr','en'].map(x=>`<button type="button" data-nursery-lang="${x}" aria-pressed="${x===l}" lang="${x}">${NL[x].name}</button>`).join('')}</div><nav class="activity-browser" aria-label="Activités"><button id="prevActivity" ${index===0?'disabled':''}>← Précédente</button><span>${index+1} / ${d.activities.length}</span><button id="nextActivity" ${index===d.activities.length-1?'disabled':''}>Suivante →</button></nav>`;
 body+=activityCard(a,index);body+=`<details class="adult-guide"><summary>${t.note}</summary><form id="observeActivity" class="observation-form"><label>${t.noteLabel}<textarea id="observeNote" maxlength="500"></textarea></label><button class="classBtn">${t.save}</button><p id="observeResult" role="status"></p></form></details>`;
 shell(body);document.getElementById('prevActivity').onclick=()=>location.hash='#domain:'+id+':'+(index-1);document.getElementById('nextActivity').onclick=()=>location.hash='#domain:'+id+':'+(index+1);
 document.querySelectorAll('[data-nursery-lang]').forEach(b=>b.onclick=()=>{Klassia.write(NURSERY_LANG,b.dataset.nurseryLang);domainPage(id,index);});
 const article=document.querySelector('.activityCard'),stageEl=article.querySelector('.nursery-stage');
 const childMode=on=>{article.classList.toggle('nursery-child',on);document.documentElement.classList.toggle('nursery-child-open',on);if(on)stageEl.scrollIntoView({block:'start'});};
 article.querySelector('[data-child-show]')?.addEventListener('click',()=>childMode(true));
 article.querySelectorAll('[data-child-close]').forEach(b=>b.onclick=()=>{childMode(false);if(b.classList.contains('nursery-done')){const r=article.querySelector('.nursery-rating');r.scrollIntoView({block:'center'});r.querySelector('button')?.focus();}});
 if(a.interactive)document.getElementById('msCheckNumber').onclick=()=>{const raw=document.getElementById('msNumber').value.trim(),box=document.getElementById('msNumberResult');if(!/^\d+$/.test(raw)){box.textContent=t.number;return;}const ok=Number(raw)===a.interactive.answer;box.textContent=(ok?t.bravo:t.again)+pick(a.interactive,'explanation',l);Klassia.append('klassia_attempts',{grade:NURSERY.grade,kind:'number',activity:a.id,theme:theme.id,ok});};
 article.querySelectorAll('[data-rate]').forEach(b=>b.onclick=()=>{const [key,st]=RATINGS.find(r=>r[0]===b.dataset.rate);const p=loadProg();p[a.id]=st;saveProg(p);Klassia.append('klassia_observations',{grade:NURSERY.grade,theme:theme.id,activity:a.id,status:st,rating:key,language:l});article.querySelectorAll('[data-rate]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));article.querySelector('.nursery-rated').textContent=t.rated;});
 document.getElementById('observeActivity').onsubmit=e=>{e.preventDefault();Klassia.append('klassia_observations',{grade:NURSERY.grade,theme:theme.id,activity:a.id,language:l,rating:lastRating(a.id)||undefined,note:document.getElementById('observeNote').value});document.getElementById('observeResult').textContent=t.saved(Klassia.profile().name);};
 const body2=article.querySelector('.activityBody');if(a.type==='bassa')Klassia.Bassa?.mount(body2,NURSERY.grade,a.id);
 else Klassia.addSpeech(stageEl,[pick(a,"title",l),sayText(a,l),pick(a,'story',l),...steps(a,l),...(a.questions||[]).map(q=>q[l]||q.fr)].filter(Boolean).join('. '),l==='fr'?'fr-FR':'en-GB');
}

function themesPage(){
 const cards = catalog.themes.map(theme => ({
  href: '?theme=' + theme.id + '#home', title: theme.title_fr, translation: theme.title_en, code: theme.id,
  detail: theme.curriculum_number ? 'Code Klassia ' + theme.id + ' · thème ' + theme.curriculum_number + ' du programme francophone' : ''
 }));
 shell(Klassia.catalogue('Parcourir les thèmes', NURSERY.label + ' · Choisis un thème pour ouvrir ses activités.', cards));
}
function assessmentPage(){
 let body=`<button class="back" onclick="location.hash='#home'">← Retour</button><section class="hero"><div class="eyebrow">SUIVI PAR OBSERVATION</div><h1>${esc(theme.assessment.title_fr)}</h1><p>${esc(theme.assessment.title_en)}</p></section><div class="notice">Évaluer ici signifie observer pour mieux accompagner. On ne cherche ni classement ni note.</div>`;
 body+=`<div class="sectionTitle"><h2>Échelle</h2></div>${theme.assessment.scale.map(s=>`<div class="themeCard"><div class="themeNum">${s.code}</div><div><strong>${esc(s.label_fr)} · ${esc(s.label_en)}</strong><div>${esc(s.description)}</div></div></div>`).join('')}`;
 body+=`<div class="sectionTitle"><h2>Indicateurs</h2></div><section class="assessment">${theme.assessment.indicators.map(x=>`<div class="indicator"><span>○</span><div>${esc(x)}</div></div>`).join('')}</section>`;
 const observations=Klassia.read('klassia_observations',[]).filter(x=>x.grade===NURSERY.grade&&x.theme===theme.id);body+=`<section class="project"><h2>Observations enregistrées</h2>${observations.slice(-20).reverse().map(x=>`<p><b>${esc(x.activity)}</b> · ${esc(new Date(x.at).toLocaleDateString('fr-FR'))} · ${esc(x.language||'')} ${esc(x.rating?({alone:'Seul',helped:'Avec aide',notyet:'Pas encore'})[x.rating]:(x.help||x.status||''))}<br>${esc(x.note||'')}</p>`).join('')||'<p>Aucune observation enregistrée pour ce thème.</p>'}</section>`;shell(body);
}
window.addEventListener('hashchange',route);
boot().catch(e=>app.innerHTML=`<div class="loading">Impossible de charger ${esc(NURSERY.label)} : ${esc(e.message)}</div>`);

