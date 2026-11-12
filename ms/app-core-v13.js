const NURSERY=Klassia.currentClass();
const app=document.getElementById('app');
let catalog=null,theme=null,currentThemeMeta=null;
const THEME_KEY='klassia_'+NURSERY.grade.toLowerCase()+'_theme_v2';
const PROG_PREFIX='klassia_'+NURSERY.grade.toLowerCase()+'_progress_v2:';
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const progKey=()=>PROG_PREFIX+(theme?.id||'T1');
const loadProg=()=>{try{return JSON.parse(Klassia.storage.getItem(progKey())||'{}')}catch{return {}}};
const saveProg=p=>Klassia.storage.setItem(progKey(),JSON.stringify(p));
// Shared « Continuer » card (shared/ui.js): last open activity of the theme if not acquired, else the first one not acquired.
const RECENT_KEY='klassia_'+NURSERY.grade.toLowerCase()+'_recent_v1';
Klassia.nextStep=()=>{if(!theme)return null;const p=loadProg(),r=Klassia.read(RECENT_KEY,null);const all=theme.domains.flatMap(d=>d.activities.map((a,i)=>({d,a,i}))),items=[...all.filter(y=>y.a.path!=='plus'),...all.filter(y=>y.a.path==='plus')];const x=(r&&r.theme===theme.id&&items.find(y=>y.a.id===r.id&&p[y.a.id]!=='A'))||items.find(y=>p[y.a.id]==='EC')||items.find(y=>p[y.a.id]!=='A')||items[0];return x?{href:'#domain:'+x.d.id+':'+x.i,title:x.a.title_fr,meta:x.d.name_fr+' · '+theme.title_fr+(x.a.duration_minutes?' · '+x.a.duration_minutes+' min avec un adulte':''),started:Boolean(r&&r.theme===theme.id)||Object.keys(p).length>0}:null;};
const allActivities=()=>theme.domains.flatMap(d=>d.activities);
const pctDomain=d=>{const p=loadProg(),n=d.activities.length,done=d.activities.filter(a=>p[a.id]==='A').length;return n?Math.round(done*100/n):0};
const acquiredCount=()=>{const p=loadProg();return allActivities().filter(a=>p[a.id]==='A').length};
let themePack=null;
async function loadThemePack(){
 const themes={};
 await Promise.all(catalog.themes.map(async t=>{const r=await fetch('./data/themes/'+t.id+'.json');if(!r.ok)throw Error('Thème indisponible : '+t.id);themes[t.id]=await r.json();}));
 return {themes};
}
async function boot(){
 catalog=await fetch('./data/catalog-v13.json').then(r=>{if(!r.ok)throw new Error('Catalogue indisponible');return r.json()});
 themePack=await loadThemePack();
 const requested=new URLSearchParams(location.search).get('theme')||Klassia.storage.getItem(THEME_KEY)||'T1';
 await loadTheme(catalog.themes.some(t=>t.id===requested)?requested:'T1'); route();
}
async function loadTheme(id){
 currentThemeMeta=catalog.themes.find(t=>t.id===id)||catalog.themes[0];
 theme=themePack.themes[currentThemeMeta.id]; if(!theme)throw new Error('Thème indisponible');
 Klassia.storage.setItem(THEME_KEY,currentThemeMeta.id);
}
function shell(body){
  app.innerHTML=`<header class="top"><div class="brand"><span class="k">K</span>Klassia</div><div class="topActions"><label class="themeSwitch"><span>Thème</span><select id="themeSelect">${catalog.themes.map(t=>`<option value="${t.id}" ${t.id===theme.id?'selected':''}>${t.number} · ${esc(t.title_fr)}</option>`).join('')}</select></label></div></header><main class="wrap">${body}</main>`;
  Klassia.rendered();
  const sel=document.getElementById('themeSelect');
  if(sel)sel.onchange=()=>location.assign('?theme='+sel.value+'#home');
}
function route(){
 document.documentElement.classList.remove('nursery-child-open');
 const h=location.hash||'#home';
 if(Klassia.specialRoute(NURSERY.grade,h))return;
 if(h.startsWith('#domain:')) return domainPage(h.split(':')[1],Number(h.split(':')[2]||0));
 if(h==='#themes') return themesPage();
 if(h==='#assessment') return assessmentPage();
 return home();
}
function curriculumThemeNote(t){
 return t.curriculum_number?`<small>Code Klassia ${esc(t.id)} · thème ${esc(t.curriculum_number)} du programme francophone</small>`:'';
}
function home(){
 const total=allActivities().length,acquired=acquiredCount();
 const plusCount=allActivities().filter(a=>a.path==='plus').length;
 let body=`<section class="hero"><div class="eyebrow">${esc(NURSERY.label.toUpperCase())} · THÈME ${currentThemeMeta.number}</div><h1>${themeIcon(theme.id)} ${esc(theme.title_fr)} · ${esc(theme.title_en)}</h1>${curriculumThemeNote(currentThemeMeta)}<p>Un livre d’éveil interactif pour parler, jouer, manipuler, observer, créer et bouger en français et en anglais, avec des repères Bassa documentés quand ils sont disponibles.</p><div class="chips"><span class="chip">${total} activités</span>${plusCount?`<span class="chip" data-path-count>${total-plusCount} au programme · ${plusCount} pour aller plus loin</span>`:''}<span class="chip">${acquired} acquises</span><span class="chip">${esc(theme.duration||'4 semaines')}</span></div></section>`;
 body+=`<div class="notice"><b>Approche maternelle :</b> pas de note sur 20. L’adulte mène l’activité, la montre à l’enfant, puis note en un geste : <b>Seul</b>, <b>Avec aide</b> ou <b>Pas encore</b>. Les activités sont courtes, répétables et adaptables.</div>`;
 body+=`<div class="sectionTitle"><h2>Les 5 domaines</h2><p>Les activités mêlent oral, manipulation, visuel, autonomie, création et motricité.</p></div><div class="grid">`;
 theme.domains.forEach(d=>{const pc=pctDomain(d);body+=`<button class="domain" onclick="location.hash='#domain:${d.id}'"><div class="icon">${d.icon}</div><strong>${esc(d.name_fr)}</strong><small>${esc(d.name_en)} · ${d.weight}</small><div class="bar"><span style="width:${pc}%"></span></div><small>${d.activities.length} activités · ${pc}% acquis</small></button>`});
 body+=`</div><div class="sectionTitle"><h2>Projet du thème</h2></div><section class="project"><h3>${esc(theme.project.title_fr)} · ${esc(theme.project.title_en)}</h3><p>${esc(theme.project.description_fr)}</p><p><i>${esc(theme.project.description_en)}</i></p></section>`;
 body+=`<div class="sectionTitle"><h2>Suivi</h2></div><section class="project"><p>À la fin du thème, utilisez la grille d’observation pour faire le point sans transformer la maternelle en examen.</p><button class="classBtn" onclick="location.hash='#assessment'">Ouvrir la grille d’observation</button></section>`;
 body+=`<div class="sectionTitle"><h2>Les 8 thèmes</h2></div><button class="classBtn" onclick="location.hash='#themes'">Voir le parcours complet</button>`;
 if(theme.sources?.length) body+=`<p class="source"><b>Repères documentaires :</b> ${theme.sources.map(esc).join(' · ')}</p>`;
 body+=`<p class="source">Base pédagogique : curriculum maternel camerounais et adaptation Klassia. Les propositions Bassa documentées restent consultables avec leur mention « non validé »; l’atelier Bassa permet leur relecture et leur arbitrage.</p>`;
 shell(body);
}
function themeIcon(id){if(NURSERY.grade==='GS'&&id==='T5')return '🐾';if(NURSERY.grade==='GS'&&id==='T6')return '🌱';return ({T1:'🏫',T2:'🧍',T3:'🏠',T4:'🎉',T5:'🌱',T6:'🐾',T7:'🧑‍🔧',T8:'🚌'})[id]||'📘'}
const {renderVisual,renderDiagram,renderTable}=Klassia.nurserySupport;
function renderList(title,arr){
 return arr?.length?`<div class="lang"><b>${esc(title)}</b><ol class="steps">${arr.map(x=>`<li>${esc(x)}</li>`).join('')}</ol></div>`:'';
}
function renderBassaVariants(items){
 if(!items?.length)return '';
 return `<details class="bassaBox"><summary>Documentation adulte — formes Bassa non validées</summary><div><div class="bassaTitle">🗣️ Variantes Bassa conservées</div>${items.map(x=>`<div class="bassaEntry"><div class="bassaConcept">${esc(x.concept)}</div><div class="bassaForms">${(x.forms||[]).map(f=>`<span>${esc(f)}</span>`).join('')}</div>${x.sources?.length?`<div class="bassaSources">Sources : ${x.sources.map(esc).join(' · ')}</div>`:''}${x.note?`<div class="bassaNote">${esc(x.note)}</div>`:''}</div>`).join('')}<div class="bassaPolicy">Ne pas faire mémoriser ces graphies avant validation par un référent linguistique.</div></div></details>`;
}

