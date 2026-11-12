/* Public curriculum only: no profile, progress, annotation or network service. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else {root.KlassiaSearch=api;api.mount(root.document);}
})(typeof window==='undefined'?globalThis:window,()=>{
 'use strict';
 const stopWords=new Set('le la les un une des du de d l au aux et en dans sur pour avec a ce ces mon ma mes the a an of to and in is'.split(' '));
 const normalize=s=>String(s??'').normalize('NFD').replace(/\p{M}/gu,'').toLowerCase().replaceAll('œ','oe').replaceAll('æ','ae');
 const stem=w=>w.length>3?w.replace(/eaux$/,'eau').replace(/s$/,''):w;
 const words=s=>normalize(s).match(/[\p{L}\p{N}]+/gu)||[];
 const terms=s=>[...new Set(words(s).filter(w=>!stopWords.has(w)).map(stem))];
 const bodyFields=['discover','learn','takeaway','exercises','practical','manual_sections','support','course','model','guided','exercise','answer','practice','remediation','transfer','competencies','notions','keywords','prompt_fr','prompt_en','steps_fr','steps_en','story_fr','story_en','questions','visual','activity_fr','activity_en','game_fr','game_en','diagram','table','interactive','materials','proposedWords','check'];
 function text(value){
  if(value==null)return '';
  if(Array.isArray(value))return value.map(text).filter(Boolean).join(' ');
  if(typeof value==='object')return Object.entries(value).filter(([k])=>!['id','type','kind','src','source','sources','source_refs','editorial','correct_choice'].includes(k)).map(([,v])=>text(v)).filter(Boolean).join(' ');
  return String(value);
 }
 function record(grade,subject,lesson,href){
  const title=text(lesson.title||[lesson.title_fr,lesson.title_en]);
  const objective=text(lesson.objectives||lesson.objective||lesson.goal||[lesson.goal_fr,lesson.goal_en]);
  const body=bodyFields.map(k=>text(lesson[k])).filter(Boolean).join('\n');
  return {grade,subject,id:lesson.id,title,objective,body,href,
   titleTerms:terms(title),goalTerms:terms(objective),bodyTerms:terms(body)};
 }
 async function load(get){
  const records=[];
  // Read catalog paths instead of maintaining a second curriculum inventory.
  const C=typeof module==='object'&&module.exports?require('./classes.js'):globalThis.Klassia,catalogs=Object.fromEntries(await Promise.all(C.classes.map(async c=>[c.grade,await get(c.catalog)]))),ce2=catalogs.CE2;
  const jobs=[];
  for(const u of ce2.units)jobs.push(async()=>{
   const data=await get(`data/content-u${u.number}.json`);
   for(const s of data.subjects)for(const l of s.lessons)records.push(record('CE2',s.name,l,`./?unit=${u.id}#lesson:${encodeURIComponent(l.id)}`));
  });
  for(const {grade,dir} of C.classes.filter(c=>c.engine==='activities'))for(const t of catalogs[grade].themes)jobs.push(async()=>{
   const data=await get(`${dir}data/themes/${t.id}.json`);
   for(const d of data.domains)d.activities.forEach((l,i)=>records.push(record(grade,d.name_fr,l,`${dir}?theme=${t.id}#domain:${d.id}:${i}`)));
  });
  for(const {grade,dir} of C.classes.filter(c=>c.engine==='lessons'))for(const u of catalogs[grade].units)jobs.push(async()=>{
   const data=u.lessons?u:await get(`${dir}data/${u.path}`);
   for(const l of data.lessons)records.push(record(grade,l.domain,l,`${dir}#lesson:${encodeURIComponent(l.id)}`));
  });
  let next=0;
  await Promise.all(Array.from({length:4},async()=>{while(next<jobs.length)await jobs[next++]();}));
  return records;
 }
 const matches=(list,q)=>list.some(w=>w===q||(q.length>=4&&w.startsWith(q)));
 function excerpt(r,query){
  const qs=terms(query),chunks=(r.objective+'\n'+r.body).split(/\n|(?<=[.!?])\s+/).filter(Boolean);
  const best=chunks.map((s,i)=>({s,i,n:qs.filter(q=>matches(terms(s),q)).length})).sort((a,b)=>b.n-a.n||a.i-b.i)[0];
  const s=best?.s||r.title;
  if(s.length<=220)return s;
  const at=words(query).filter(w=>!stopWords.has(w)).map(w=>normalize(s).indexOf(w)).filter(i=>i>=0);
  let start=Math.max(0,(at.length?Math.min(...at):0)-60);
  if(start>0){const space=s.indexOf(' ',start);if(space>=0)start=space+1;}
  return (start?'…':'')+s.slice(start,start+220).trim()+'…';
 }
 function search(records,query,{grade='',subject=''}={}){
  const qs=terms(query);if(!qs.length)return [];
  return records.filter(r=>(!grade||r.grade===grade)&&(!subject||r.subject===subject)).map(r=>{
   let score=0;
   for(const q of qs){const n=matches(r.titleTerms,q)?12:matches(r.goalTerms,q)?6:matches(r.bodyTerms,q)?1:0;if(!n)return null;score+=n;}
   if(normalize(r.title).includes(normalize(query).trim()))score+=20;
   return {...r,score,excerpt:excerpt(r,query)};
  }).filter(Boolean).sort((a,b)=>b.score-a.score||a.grade.localeCompare(b.grade)||a.title.localeCompare(b.title)||a.href.localeCompare(b.href));
 }
 function mount(document){
  const form=document.getElementById('searchForm');if(!form)return;
  const input=form.elements.q,grade=form.elements.grade,subject=form.elements.subject;
  const status=document.getElementById('searchStatus'),results=document.getElementById('searchResults'),more=document.getElementById('searchMore');
  const params=new URLSearchParams(location.search);input.value=(params.get('q')||'').slice(0,200);grade.value=params.get('grade')||'';
  if(params.get('subject')){subject.add(new Option(params.get('subject'),params.get('subject')));subject.value=params.get('subject');}
  let loading=null,revision=0,found=[],shown=0;
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function page(){
   const batch=found.slice(shown,shown+30);shown+=batch.length;
   for(const r of batch){const href=new URL(r.href,location.href);href.searchParams.set('recherche',location.search.slice(1));const li=document.createElement('li');li.innerHTML=`<article><p class="search-meta">${esc(r.grade)} · ${esc(r.subject)}</p><h2><a href="${esc(href.href)}">${esc(r.title)}</a></h2><p>${esc(r.excerpt)}</p></article>`;results.append(li);}
   more.hidden=shown>=found.length;
  }
  async function run(){
   const token=++revision,query=input.value.trim(),gradeFilter=grade.value,subjectFilter=subject.value;
   const state=new URLSearchParams();if(query)state.set('q',query);if(gradeFilter)state.set('grade',gradeFilter);if(subjectFilter)state.set('subject',subjectFilter);
   history.replaceState(history.state,'',location.pathname+(state.size?'?'+state:''));
   results.replaceChildren();more.hidden=true;
   if(!terms(query).length){status.textContent='Saisissez une notion, par exemple : les états de l’eau.';return;}
   status.textContent='Recherche dans les cinq classes…';
   try{
    if(!loading)loading=load(async p=>{const r=await fetch(new URL(p,location.href));if(!r.ok)throw Error('Contenu indisponible');return r.json();}).catch(e=>{loading=null;throw e;});
    const records=await loading;if(token!==revision)return;
    const selected=subjectFilter;
    subject.replaceChildren(new Option('Toutes les matières',''),...[...new Set(records.map(r=>r.subject))].sort().map(s=>new Option(s,s)));
    subject.value=selected;
    found=search(records,query,{grade:gradeFilter,subject:subject.value});shown=0;
    status.textContent=found.length?`${found.length} résultat${found.length>1?'s':''} · les titres et objectifs sont prioritaires.`:'Aucun résultat. Essayez moins de mots ou une autre notion, ou retirez les filtres.';page();
   }catch{if(token===revision)status.textContent='Recherche indisponible : vérifiez la connexion ou attendez le téléchargement complet des cinq classes, puis réessayez.';}
  }
  form.onsubmit=e=>{e.preventDefault();run();};grade.onchange=run;subject.onchange=run;more.onclick=page;
  // URL state survives browser Back, including when the page is restored from memory.
  run();
 }
 return {normalize,terms,record,load,search,mount};
});
