/* Maternelle (MS, GS) sur le moteur commun (ADR-014, M4) : pages par thème, fiche parent, mode enfant et observation.
   Le moteur commun (shared/learning-app.js) charge ce module pour les classes de format « nursery » et lui confie le rendu ;
   la maternelle garde sa présentation (ADR-016). Données, clés locales et adresses inchangées :
   ?theme=T3#home, #domain:LC:2, #themes, #assessment, #worksheets, #subjects-all, #activity-subject:…, #domains-all, #domain-all:LC. */
(function (K) {
'use strict';
async function start({info, root: app, get}) {
const NURSERY=info,esc=K.escape;
// Classe anglophone (Nursery One, Nursery Two ; ADR-019) : activités rédigées en anglais, interface traduite par shared/i18n.js.
// L(o,k) prend le champ de la langue de la classe ; dual(o,k) garde « français · anglais » dans une classe francophone.
const EN=info.language==='en';
const L=(o,k)=>(EN?(o?.[k+'_en']??o?.[k+'_fr']):(o?.[k+'_fr']??o?.[k+'_en']))??'';
const dual=(o,k)=>EN?esc(L(o,k)):`${esc(o?.[k+'_fr'])} · ${esc(o?.[k+'_en'])}`;
let catalog=null,theme=null,currentThemeMeta=null,themePack=null,practice=null;
const THEME_KEY='klassia_'+NURSERY.grade.toLowerCase()+'_theme_v2';
const PROG_PREFIX=NURSERY.progressKey+':';
const progKey=()=>PROG_PREFIX+(theme?.id||'T1');
const loadProg=()=>{try{return JSON.parse(K.storage.getItem(progKey())||'{}')}catch{return {}}};
const saveProg=p=>K.storage.setItem(progKey(),JSON.stringify(p));
// Carte « Continuer » (shared/ui.js) : dernière activité ouverte du thème si elle n'est pas acquise, sinon la première non acquise.
const RECENT_KEY='klassia_'+NURSERY.grade.toLowerCase()+'_recent_v1';
K.nextStep=()=>{if(!theme)return null;const p=loadProg(),r=K.read(RECENT_KEY,null);const all=theme.domains.flatMap(d=>d.activities.map((a,i)=>({d,a,i}))),items=[...all.filter(y=>y.a.path!=='plus'),...all.filter(y=>y.a.path==='plus')];const x=(r&&r.theme===theme.id&&items.find(y=>y.a.id===r.id&&p[y.a.id]!=='A'))||items.find(y=>p[y.a.id]==='EC')||items.find(y=>p[y.a.id]!=='A')||items[0];return x?{href:'#domain:'+x.d.id+':'+x.i,title:L(x.a,'title'),meta:L(x.d,'name')+' · '+L(theme,'title')+(x.a.duration_minutes?' · '+x.a.duration_minutes+' min avec un adulte':''),started:Boolean(r&&r.theme===theme.id)||Object.keys(p).length>0}:null;};
const allActivities=()=>theme.domains.flatMap(d=>d.activities);
const pctDomain=d=>{const p=loadProg(),n=d.activities.length,done=d.activities.filter(a=>p[a.id]==='A').length;return n?Math.round(done*100/n):0};
const acquiredCount=()=>{const p=loadProg();return allActivities().filter(a=>p[a.id]==='A').length};
const {renderVisual,renderDiagram,renderTable,worksheetsForTheme}=K.nurserySupport;
const openPrint=(fiche,id,adult=false)=>K.printing.open(NURSERY.grade,fiche,theme.id,id,adult);
function loadTheme(id){
 currentThemeMeta=catalog.themes.find(t=>t.id===id)||catalog.themes[0];
 theme=themePack.themes[currentThemeMeta.id];if(!theme)throw new Error('Thème indisponible');
 K.storage.setItem(THEME_KEY,currentThemeMeta.id);
}
function shell(body){
 app.innerHTML=`<header class="top"><div class="brand"><span class="k">K</span>Klassia</div><div class="topActions"><label class="themeSwitch"><span>Thème</span><select id="themeSelect">${catalog.themes.map(t=>`<option value="${t.id}" ${t.id===theme.id?'selected':''}>${t.number} · ${esc(L(t,'title'))}</option>`).join('')}</select></label></div></header><main class="wrap">${body}</main>`;
 K.rendered();
 const sel=document.getElementById('themeSelect');
 if(sel)sel.onchange=()=>location.assign('?theme='+sel.value+'#home');
}
K.paint=shell;
function curriculumThemeNote(t){
 return t.curriculum_number?(EN?`<small>Klassia code ${esc(t.id)} · theme ${esc(t.curriculum_number)} of the English-subsystem curriculum</small>`:`<small>Code Klassia ${esc(t.id)} · thème ${esc(t.curriculum_number)} du programme francophone</small>`):'';
}
function home(){
 const total=allActivities().length,acquired=acquiredCount();
 const plusCount=allActivities().filter(a=>a.path==='plus').length;
 let body=`<section class="hero"><div class="eyebrow">${esc(NURSERY.label.toUpperCase())} · THÈME ${currentThemeMeta.number}</div><h1>${themeIcon(theme.id)} ${dual(theme,'title')}</h1>${curriculumThemeNote(currentThemeMeta)}<p>${EN?'An interactive early-learning book to talk, play, handle, observe, create and move, following the English-subsystem nursery curriculum, with a little French as the curriculum asks.':'Un livre d’éveil interactif pour parler, jouer, manipuler, observer, créer et bouger en français et en anglais, avec des repères Bassa documentés quand ils sont disponibles.'}</p><div class="chips"><span class="chip">${total} activités</span>${plusCount?`<span class="chip" data-path-count>${total-plusCount} au programme · ${plusCount} pour aller plus loin</span>`:''}<span class="chip">${acquired} acquises</span><span class="chip">${esc((EN?theme.duration_en:theme.duration)||'4 semaines')}</span></div></section>`;
 body+=`<div class="print-actions"><button class="classBtn" id="printTheme14">🖨 Thème / PDF</button></div>`;if(practice)body+=`<section class="workbookPromo"><div><b>✍️ Cahier tactile et imprimable</b><p>Coloriage, lettres, chiffres et graphisme. Trace au doigt ou imprime la fiche.</p></div><button class="classBtn" onclick="location.hash='#worksheets'">Ouvrir le cahier</button></section>`;
 body+=EN?`<div class="notice"><b>Nursery approach:</b> no marks. The adult leads the activity, shows it to the child, then notes in one tap: <b>On their own</b>, <b>With help</b> or <b>Not yet</b>. Activities are short, can be repeated and adapted.</div>`:`<div class="notice"><b>Approche maternelle :</b> pas de note sur 20. L’adulte mène l’activité, la montre à l’enfant, puis note en un geste : <b>Seul</b>, <b>Avec aide</b> ou <b>Pas encore</b>. Les activités sont courtes, répétables et adaptables.</div>`;
 body+=`<div class="sectionTitle"><h2>Les 5 domaines</h2><p>Les activités mêlent oral, manipulation, visuel, autonomie, création et motricité.</p></div><div class="grid">`;
 theme.domains.forEach(d=>{const pc=pctDomain(d);body+=`<button class="domain" onclick="location.hash='#domain:${d.id}'"><div class="icon">${d.icon}</div><strong>${esc(L(d,'name'))}</strong><small>${EN?'':esc(d.name_en)+' · '}${d.weight}</small><div class="bar"><span style="width:${pc}%"></span></div><small>${d.activities.length} activités · ${pc}% acquis</small></button>`});
 body+=`</div><div class="sectionTitle"><h2>Projet du thème</h2></div><section class="project"><h3>${dual(theme.project,'title')}</h3>${EN?`<p>${esc(theme.project.description_en)}</p>`:`<p>${esc(theme.project.description_fr)}</p><p><i>${esc(theme.project.description_en)}</i></p>`}</section>`;
 body+=`<div class="sectionTitle"><h2>Suivi</h2></div><section class="project"><p>À la fin du thème, utilisez la grille d’observation pour faire le point sans transformer la maternelle en examen.</p><button class="classBtn" onclick="location.hash='#assessment'">Ouvrir la grille d’observation</button></section>`;
 body+=`<div class="sectionTitle"><h2>Les 8 thèmes</h2></div><button class="classBtn" onclick="location.hash='#themes'">Voir le parcours complet</button>`;
 if(theme.sources?.length) body+=`<p class="source"><b>Repères documentaires :</b> ${theme.sources.map(esc).join(' · ')}</p>`;
 body+=EN?`<p class="source">Teaching basis: Cameroon Nursery School Curriculum, English Subsystem (MINEDUB, 2018), cited and not reproduced; original Klassia activities, under teaching review.</p>`:`<p class="source">Base pédagogique : curriculum maternel camerounais et adaptation K. Les propositions Bassa documentées restent consultables avec leur mention « non validé »; l’atelier Bassa permet leur relecture et leur arbitrage.</p>`;
 shell(body);
 document.getElementById('printTheme14').onclick=()=>openPrint('theme');
}
function themeIcon(id){const gs=['GS','NURSERY2'].includes(NURSERY.grade);if(gs&&id==='T5')return '🐾';if(gs&&id==='T6')return '🌱';return ({T1:'🏫',T2:'🧍',T3:'🏠',T4:'🎉',T5:'🌱',T6:'🐾',T7:'🧑‍🔧',T8:'🚌'})[id]||'📘'}
function renderList(title,arr){
 return arr?.length?`<div class="lang"><b>${esc(title)}</b><ol class="steps">${arr.map(x=>`<li>${esc(x)}</li>`).join('')}</ol></div>`:'';
}
function renderBassaVariants(items){
 if(!items?.length)return '';
 return `<details class="bassaBox"><summary>Documentation adulte — formes Bassa non validées</summary><div><div class="bassaTitle">🗣️ Variantes Bassa conservées</div>${items.map(x=>`<div class="bassaEntry"><div class="bassaConcept">${esc(x.concept)}</div><div class="bassaForms">${(x.forms||[]).map(f=>`<span>${esc(f)}</span>`).join('')}</div>${x.sources?.length?`<div class="bassaSources">Sources : ${x.sources.map(esc).join(' · ')}</div>`:''}${x.note?`<div class="bassaNote">${esc(x.note)}</div>`:''}</div>`).join('')}<div class="bassaPolicy">Ne pas faire mémoriser ces graphies avant validation par un référent linguistique.</div></div></details>`;
}

const NURSERY_LANG='klassia_nursery_lang_v1';
function nurseryLang(){if(EN)return 'en';const v=K.read(NURSERY_LANG,null);return v==='fr'||v==='en'?v:(K.read('klassia_family',{})?.school==='en'?'en':'fr');}
const NL={
 fr:{name:'Français',goal:'Objectif',card:'Fiche parent',time:'Durée',materials:'Matériel',say:'Ce que je dis',watch:'Ce que je regarde',show:'▶ Montrer à l’enfant',close:'✕ Retour à l’adulte',done:'✋ J’ai fini !',steps:'Déroulement',story:'📖 Histoire',game:'🎲 Jeu',activity:'👐 Activité',questions:'Questions',check:'Vérifier',number:'Écris un nombre.',bravo:'Bravo ! ',again:'Comptons ensemble. ',rate:'Comment ça s’est passé ?',rated:'C’est noté.',minutes:n=>n+' min environ',base:y=>'Programme · '+(y===2?'2e année':'1re année'),plus:'Pour aller plus loin',note:'Ajouter une note d’observation',noteLabel:'Ce que j’ai observé (sans donnée sensible)',save:'Enregistrer l’observation',saved:n=>'Observation datée enregistrée pour '+n},
 en:{name:'English',goal:'Goal',card:'Parent card',time:'Time',materials:'Materials',say:'What I say',watch:'What I watch for',show:'▶ Show the child',close:'✕ Back to the adult',done:'✋ I’ve finished!',steps:'Steps',story:'📖 Story',game:'🎲 Game',activity:'👐 Activity',questions:'Questions',check:'Check',number:'Write a number.',bravo:'Well done! ',again:'Let’s count together. ',rate:'How did it go?',rated:'Noted.',minutes:n=>'about '+n+' min',base:y=>'Curriculum · year '+(y===2?'two':'one'),plus:'Going further',note:'Add an observation note',noteLabel:'What I observed (no sensitive data)',save:'Save the observation',saved:n=>'Dated observation saved for '+n}
};
// Outcome scale of the nursery curriculum: on their own, with help, not yet.
const RATINGS=[['alone','A',{fr:'✓ Seul',en:'✓ On their own'}],['helped','EC',{fr:'Avec aide',en:'With help'}],['notyet','EC',{fr:'Pas encore',en:'Not yet'}]];
const pick=(a,k,l)=>a[k+'_'+l]||a[k+'_'+(l==='fr'?'en':'fr')]||'';
const steps=(a,l)=>a['steps_'+l]||a.steps_fr||a.steps_en||[];
function sayText(a,l){return pick(a,'prompt',l)||pick(a,'activity',l)||pick(a,'game',l)||steps(a,l)[0]||pick(a,'goal',l);}
function lastRating(id){const p=loadProg()[id],o=[...K.read('klassia_observations',[])].reverse().find(x=>x.grade===NURSERY.grade&&x.activity===id&&x.rating);return o?.rating||(p==='A'?'alone':p==='EC'?'helped':'');}
function activityCard(a,i){
 const l=nurseryLang(),t=NL[l],voice=l==='fr'?'fr-FR':'en-GB',say=sayText(a,l),watch=a['observe_'+l]||a.observe||[],rated=lastRating(a.id);
 const mats=(l==='en'&&a.materials_en?.length?a.materials_en:a.materials)||[];
 const card=[a.duration_minutes?`<div><dt>⏱ ${t.time}</dt><dd>${esc(t.minutes(a.duration_minutes))}</dd></div>`:'',mats.length?`<div><dt>🧺 ${t.materials}</dt><dd>${mats.map(esc).join(' · ')}</dd></div>`:'',say?`<div><dt>💬 ${t.say}</dt><dd>${esc(say)}</dd></div>`:'',watch.length?`<div><dt>👀 ${t.watch}</dt><dd>${watch.map(esc).join(' · ')}</dd></div>`:''].join('');
 let stage='';
 if(a.type!=='bassa')stage+=K.speech.clip(a['audio_'+l],voice);
 if(a.figure)stage+=`<img class="lesson-figure" src="${esc(a.figure.src)}" alt="${esc(a.figure.alt)}">`;
 stage+=renderVisual(a.visual)+renderDiagram(a.diagram)+renderTable(a.table);
 if(a.interactive)stage+=`<div class="lang nursery-number"><label for="msNumber"><b>${esc(pick(a.interactive,'prompt',l))}</b></label><input id="msNumber" inputmode="numeric"><button class="classBtn" id="msCheckNumber">${t.check}</button><p id="msNumberResult" role="status"></p></div>`;
 if(a.ink)stage+=K.ink.pad(NURSERY.grade+':'+a.id,a.ink);
 let more='';
 const story=pick(a,'story',l);if(story)more+=`<div class="lang"><b>${t.story}</b>${esc(story)}</div>`;
 more+=renderList(t.steps,steps(a,l));
 const game=pick(a,'game',l);if(game)more+=`<div class="lang"><b>${t.game}</b>${esc(game)}</div>`;
 const act=pick(a,'activity',l);if(act)more+=`<div class="lang"><b>${t.activity}</b>${esc(act)}</div>`;
 if(a.course)more+=renderList('Parcours',a.course);
 if(a.questions?.length)more+=`<div class="observe"><b>${t.questions}</b>${a.questions.map((q,index)=>`<div class="nursery-question"><p>${esc(q[l]||q.fr)}</p>${q.answer?K.correction.html(a.id+'_question_'+index,`<p>${esc(q.answer)}</p>`,{nursery:true}):''}</div>`).join('')}</div>`;
 if(a.source_note)more+=`<div class="notice">${esc(a.source_note)}</div>`;
 if(a.type!=='bassa')more+=renderBassaVariants(a.bassa_variants);
 if(a.source_refs)more+=`<details class="adult-guide"><summary>Repères du curriculum</summary><p>${esc(a.source_refs.join(' · '))}</p><p>Activité originale Klassia; correspondance proposée à relire.</p></details>`;
 if(a.teacher_guide&&K.isAdultSpace())more+=`<details class="adult-guide"><summary>Préparer et adapter l’activité</summary><p>${esc(a.teacher_guide.preparation)}</p><p>${esc(a.teacher_guide.adaptation)}</p><p>${esc(a.teacher_guide.follow_up)}</p></details>`;
 const rating=`<section class="nursery-rating" aria-labelledby="rate-${esc(a.id)}"><h4 id="rate-${esc(a.id)}">${t.rate}</h4><div role="group">${RATINGS.map(([key,,label])=>`<button type="button" data-rate="${key}" aria-pressed="${rated===key}">${label[l]}</button>`).join('')}</div><p class="nursery-rated" role="status"></p></section>`;
 return `<article class="activityCard" data-activity-id="${esc(a.id)}" lang="${l}"><div class="activityHead"><div class="num">${i+1}</div><div><h3>${esc(pick(a,'title',l))}</h3>${K.reviewMark(a.editorial,l==='en')}</div><div class="print-actions"><button class="classBtn printActivity14">🖨 Activité / PDF</button>${K.isAdultSpace()?'<button class="classBtn printActivityAdult">Guide adulte de l’activité / PDF</button>':''}</div></div><div class="activityBody"><p class="nursery-path${a.path==='plus'?' nursery-path-plus':''}" data-path="${a.path==='plus'?'plus':'base'}">${a.path==='plus'?t.plus:EN?'Curriculum · '+esc(NURSERY.label):t.base(NURSERY.grade==='GS'?2:1)}</p><p class="nursery-goal"><b>${t.goal}</b> ${esc(pick(a,'goal',l))}</p>${card?`<dl class="nursery-card" aria-label="${t.card}">${card}</dl>`:''}${a.type==='bassa'?'':`<button type="button" class="nursery-show" data-child-show>${t.show}</button>`}<div class="nursery-stage"><button type="button" class="nursery-close" data-child-close>${t.close}</button>${stage}<button type="button" class="nursery-done" data-child-close>${t.done}</button></div><div class="nursery-more">${more}</div>${rating}</div></article>`;
}
function domainPage(id,index=0){
 const d=theme.domains.find(x=>x.id===id);if(!d)return home();
 index=Math.max(0,Math.min(d.activities.length-1,index));const a=d.activities[index];K.write(RECENT_KEY,{theme:theme.id,id:a.id,at:Date.now()});
 const l=nurseryLang(),t=NL[l];
 let body=`<button class="back" onclick="location.hash='#home'">← Retour au thème</button><section class="hero"><h1>${d.icon} ${esc(l==='en'?L(d,'name'):d.name_fr)}</h1><div class="print-actions"><button class="classBtn printDomain14">🖨 Domaine / PDF</button>${K.isAdultSpace()?'<button class="classBtn printDomainAdult">Guide adulte du domaine / PDF</button>':''}</div></section>${EN?'':`<div class="nursery-lang" role="group" aria-label="Langue de l’activité · Activity language">${['fr','en'].map(x=>`<button type="button" data-nursery-lang="${x}" aria-pressed="${x===l}" lang="${x}">${NL[x].name}</button>`).join('')}</div>`}<nav class="activity-browser" aria-label="Activités"><button id="prevActivity" ${index===0?'disabled':''}>← Précédente</button><span>${index+1} / ${d.activities.length}</span><button id="nextActivity" ${index===d.activities.length-1?'disabled':''}>Suivante →</button></nav>`;
 body+=activityCard(a,index);body+=`<details class="adult-guide"><summary>${t.note}</summary><form id="observeActivity" class="observation-form"><label>${t.noteLabel}<textarea id="observeNote" maxlength="500"></textarea></label><button class="classBtn">${t.save}</button><p id="observeResult" role="status"></p></form></details>`;
 shell(body);document.getElementById('prevActivity').onclick=()=>location.hash='#domain:'+id+':'+(index-1);document.getElementById('nextActivity').onclick=()=>location.hash='#domain:'+id+':'+(index+1);
 document.querySelectorAll('[data-nursery-lang]').forEach(b=>b.onclick=()=>{K.write(NURSERY_LANG,b.dataset.nurseryLang);domainPage(id,index);});
 const article=document.querySelector('.activityCard'),stageEl=article.querySelector('.nursery-stage');
 const printing=[['.printDomain14',()=>openPrint('domaine',d.id)],['.printDomainAdult',()=>openPrint('domaine',d.id,true)],['.printActivity14',()=>openPrint('activite',a.id)],['.printActivityAdult',()=>openPrint('activite',a.id,true)]];
 for(const [sel,fn] of printing){const b=document.querySelector(sel);if(b)b.onclick=fn;}
 const childMode=on=>{article.classList.toggle('nursery-child',on);document.documentElement.classList.toggle('nursery-child-open',on);if(on)stageEl.scrollIntoView({block:'start'});};
 article.querySelector('[data-child-show]')?.addEventListener('click',()=>childMode(true));
 article.querySelectorAll('[data-child-close]').forEach(b=>b.onclick=()=>{childMode(false);if(b.classList.contains('nursery-done')){const r=article.querySelector('.nursery-rating');r.scrollIntoView({block:'center'});r.querySelector('button')?.focus();}});
 if(a.interactive)document.getElementById('msCheckNumber').onclick=()=>{const raw=document.getElementById('msNumber').value.trim(),box=document.getElementById('msNumberResult');if(!/^\d+$/.test(raw)){box.textContent=t.number;return;}const ok=Number(raw)===a.interactive.answer;box.textContent=(ok?t.bravo:t.again)+pick(a.interactive,'explanation',l);K.append('klassia_attempts',{grade:NURSERY.grade,kind:'number',activity:a.id,theme:theme.id,ok});};
 article.querySelectorAll('[data-rate]').forEach(b=>b.onclick=()=>{const [key,st]=RATINGS.find(r=>r[0]===b.dataset.rate);const p=loadProg();p[a.id]=st;saveProg(p);K.append('klassia_observations',{grade:NURSERY.grade,theme:theme.id,activity:a.id,status:st,rating:key,language:l});article.querySelectorAll('[data-rate]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));article.querySelector('.nursery-rated').textContent=t.rated;});
 document.getElementById('observeActivity').onsubmit=e=>{e.preventDefault();K.append('klassia_observations',{grade:NURSERY.grade,theme:theme.id,activity:a.id,language:l,rating:lastRating(a.id)||undefined,note:document.getElementById('observeNote').value});document.getElementById('observeResult').textContent=t.saved(K.profile().name);};
 const body2=article.querySelector('.activityBody');if(a.type==='bassa')K.Bassa?.mount(body2,NURSERY.grade,a.id);
 else K.addSpeech(stageEl,[pick(a,"title",l),sayText(a,l),pick(a,'story',l),...steps(a,l),...(a.questions||[]).map(q=>q[l]||q.fr)].filter(Boolean).join('. '),l==='fr'?'fr-FR':'en-GB');
}

function themesPage(){
 const cards = catalog.themes.map(theme => ({
  href: '?theme=' + theme.id + '#home', title: L(theme,'title'), translation: EN ? '' : theme.title_en, code: theme.id,
  detail: theme.curriculum_number ? (EN ? 'Klassia code ' + theme.id + ' · theme ' + theme.curriculum_number + ' of the English-subsystem curriculum' : 'Code Klassia ' + theme.id + ' · thème ' + theme.curriculum_number + ' du programme francophone') : ''
 }));
 shell(K.catalogue('Parcourir les thèmes', NURSERY.label + ' · Choisis un thème pour ouvrir ses activités.', cards));
}
function assessmentPage(){
 let body=`<button class="back" onclick="location.hash='#home'">← Retour</button><section class="hero"><div class="eyebrow">SUIVI PAR OBSERVATION</div><h1>${esc(L(theme.assessment,'title'))}</h1>${EN?'':`<p>${esc(theme.assessment.title_en)}</p>`}</section><div class="notice">Évaluer ici signifie observer pour mieux accompagner. On ne cherche ni classement ni note.</div>`;
 body+=`<div class="sectionTitle"><h2>Échelle</h2></div>${theme.assessment.scale.map(s=>`<div class="themeCard"><div class="themeNum">${s.code}</div><div><strong>${dual(s,'label')}</strong><div>${esc(s.description)}</div></div></div>`).join('')}`;
 body+=`<div class="sectionTitle"><h2>Indicateurs</h2></div><section class="assessment">${theme.assessment.indicators.map(x=>`<div class="indicator"><span>○</span><div>${esc(x)}</div></div>`).join('')}</section>`;
 const observations=K.read('klassia_observations',[]).filter(x=>x.grade===NURSERY.grade&&x.theme===theme.id);body+=`<section class="project"><h2>Observations enregistrées</h2>${observations.slice(-20).reverse().map(x=>`<p><b>${esc(x.activity)}</b> · ${esc(new Date(x.at).toLocaleDateString(EN?'en-GB':'fr-FR'))} · ${esc(x.language||'')} ${esc(x.rating?({alone:'Seul',helped:'Avec aide',notyet:'Pas encore'})[x.rating]:(x.help||x.status||''))}<br>${esc(x.note||'')}</p>`).join('')||'<p>Aucune observation enregistrée pour ce thème.</p>'}</section>`;shell(body);
}
function worksheetsPage(){
 const ws=worksheetsForTheme(practice?.themes?.[theme.id],NURSERY.grade,theme.id);let body=`<button class="back" onclick="location.hash='#home'">← Retour au thème</button><section class="hero"><div class="eyebrow">CAHIER TACTILE ET IMPRIMABLE</div><h1>✍️ Coloriage, lettres, chiffres et graphisme</h1><p>${dual(theme,'title')}</p></section><div class="worksheetGrid">`;
 ws.forEach(w=>body+=`<article class="worksheetCard"><h2>${w.title}</h2><p>${esc(w.instruction_fr)}</p><p><i>${esc(w.instruction_en)}</i></p>${K.ink.worksheet(NURSERY.grade+':'+theme.id+':cahier:'+w.id,w.html,['letters','numbers'].includes(w.id))}<button class="classBtn" data-print-ws="${w.id}">🖨 Imprimer / PDF</button></article>`);
 body+=`</div><button class="classBtn" id="printAllWs">🖨 Imprimer tout le cahier du thème</button>`;shell(body);
 document.querySelectorAll('[data-print-ws]').forEach(b=>{const w=ws.find(x=>x.id===b.dataset.printWs);b.onclick=()=>openPrint('graphisme',w.id)});
 document.getElementById('printAllWs').onclick=()=>openPrint('graphisme');
}
function domainsAllPage(){
 const sample=themePack.themes[catalog.themes[0].id].domains;let body=`<button class="back" onclick="location.hash='#home'">← Retour</button><section class="hero"><div class="eyebrow">${esc(NURSERY.label.toUpperCase())} · PAR DOMAINE</div><h1>Choisir d’abord un domaine</h1><p>Parcours ensuite les huit thèmes pour ce même domaine.</p></section><div class="grid">`;
 sample.forEach(d=>body+=`<button class="domain" data-domain-all="${d.id}"><div class="icon">${d.icon}</div><strong>${esc(L(d,'name'))}</strong><small>${EN?'':esc(d.name_en)+' · '}${d.weight}</small><small>8 thèmes</small></button>`);
 body+='</div>';shell(body);document.querySelectorAll('[data-domain-all]').forEach(b=>b.onclick=()=>location.hash='#domain-all:'+b.dataset.domainAll);
}
function domainAllPage(id){
 const sample=themePack.themes[catalog.themes[0].id].domains.find(d=>d.id===id);if(!sample)return home();
 let body=`<button class="back" onclick="location.hash='#domains-all'">← Domaines</button><section class="hero"><div class="eyebrow">8 THÈMES</div><h1>${sample.icon} ${esc(L(sample,'name'))}</h1>${EN?'':`<p>${esc(sample.name_en)}</p>`}<button class="classBtn" id="printDomainAll">🖨 Domaine complet / PDF</button></section><div class="themes">`;
 for(const t of catalog.themes){const th=themePack.themes[t.id],d=th.domains.find(x=>x.id===id);body+=`<article class="themeCard themeDomainCard"><div class="themeNum">${t.number}</div><div><strong>${esc(L(th,'title'))}</strong><div>${EN?'':esc(th.title_en)+' · '}${d.activities.length} activités</div><small>${d.activities.slice(0,3).map(a=>esc(L(a,'title'))).join(' · ')}</small></div><div class="spacer"></div><button class="classBtn" data-open-domain-theme="${t.id}">Ouvrir</button></article>`;}
 body+='</div>';shell(body);document.getElementById('printDomainAll').onclick=()=>openPrint('domaine-complet',id);
 document.querySelectorAll('[data-open-domain-theme]').forEach(b=>b.onclick=()=>location.assign('?theme='+b.dataset.openDomainTheme+'#domain:'+id));
}
function activitySubject(a,d){
 if(a.area)return a.area; // activités des classes anglophones : la rubrique du programme (Storytelling, Mathematics…)
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
 const rows = catalog.themes.flatMap(t => themePack.themes[t.id].domains.flatMap(d => d.activities.map((a,i) => ({a,d,t,i,subject:activitySubject(a,d)}))));
 const names = [...new Set(rows.map(row => row.subject))];
 const cards = selected ? rows.filter(row => row.subject === selected).map(({a,d,t,i}) => ({
  href: '?theme=' + t.id + '#domain:' + d.id + ':' + i, title: L(a,'title'), translation: EN ? '' : a.title_en, detail: L(t,'title')
 })) : names.map(title => ({
  title, href: '#activity-subject:' + encodeURIComponent(title), count: rows.filter(row => row.subject === title).length + ' activités'
 }));
 shell(K.catalogue(selected || 'Parcourir les matières et activités', 'Les activités sont regroupées sur les huit thèmes.', cards));
}
function route(){
 document.documentElement.classList.remove('nursery-child-open');
 const h=location.hash||'#home';
 if(K.specialRoute(NURSERY.grade,h))return;
 if(h.startsWith('#domain:'))return domainPage(h.split(':')[1],Number(h.split(':')[2]||0));
 if(h==='#themes')return themesPage();
 if(h==='#assessment')return assessmentPage();
 if(h==='#worksheets')return worksheetsPage();
 if(h==='#subjects-all')return activitiesPage();
 if(h.startsWith('#activity-subject:'))return activitiesPage(decodeURIComponent(h.slice(18)));
 if(h==='#domains-all')return domainsAllPage();
 if(h.startsWith('#domain-all:'))return domainAllPage(h.split(':')[1]);
 return home();
}
try{
 catalog=await get(K.classLocalPath(NURSERY,NURSERY.catalog));
 const themes={};
 // Le cahier imprimable est facultatif : son absence n'empêche pas d'ouvrir les thèmes.
 [practice]=await Promise.all([EN?null:get('./practice-v14.json').catch(()=>null),...catalog.themes.map(async t=>{themes[t.id]=await get('./data/themes/'+t.id+'.json');})]);
 themePack={themes};
 const requested=new URLSearchParams(location.search).get('theme')||K.storage.getItem(THEME_KEY)||'T1';
 loadTheme(catalog.themes.some(t=>t.id===requested)?requested:'T1');
}catch(e){app.innerHTML=`<div class="loading">Impossible de charger ${esc(NURSERY.label)} : ${esc(e.message)}</div>`;return;}
window.addEventListener('hashchange',route);route();
}
K.nursery={start};
})(window.Klassia);
