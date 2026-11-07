/* Shared documentary Bassa practice. Editorial opinions never change accepted answers. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(null);else root.Klassia.Bassa=factory(root.Klassia);})(typeof window!=='undefined'?window:globalThis,K=>{
 'use strict';
 const normalize=s=>String(s??'').normalize('NFC').trim().replace(/\s+/g,' ').toLocaleLowerCase('fr').replace(/[.!?]+$/,'').trim();
 const accepts=(entry,value)=>normalize(value)!==''&&entry.forms.some(f=>normalize(f)===normalize(value));
 const hasText=value=>typeof value==='string'&&value.trim().length>0;
 const isReference=value=>typeof value==='string'&&/^[A-Za-z0-9][A-Za-z0-9_-]*$/.test(value);
 function isPublishableRecording(entry, recording) {
  const file=typeof recording?.src==='string'&&/^assets\/bassa-(ba\d{3})-(0[1-9]|[1-9]\d)\.mp3$/.exec(recording.src);
  const reviewDate=typeof recording?.reviewed_on==='string'?Date.parse(recording.reviewed_on):NaN;
  return file?.[1]===entry.id.toLowerCase()
   && entry.forms.includes(recording.form) && hasText(recording.sense)
   && Number.isFinite(reviewDate) && new Date(reviewDate).toISOString().slice(0,10)===recording.reviewed_on
   && isReference(recording.review_ref) && isReference(recording.consent_ref)
   && typeof recording.sha256==='string' && /^[a-f0-9]{64}$/.test(recording.sha256)
   && (recording.credit===undefined || hasText(recording.credit));
 }
 if(!K)return {normalize,accepts,isPublishableRecording};
 const base=new URL('../',document.currentScript.src),E=K.escape;
 const get=p=>fetch(new URL(p,base)).then(r=>{if(!r.ok)throw Error('Lexique indisponible');return r.json();});
 let ready, playing;
 function load(){if(!ready)ready=Promise.all([get('data/bassa-lexicon-variants.json'),get('data/bassa-lessons.json')]).catch(e=>{ready=null;throw e;});return ready;}

 function stopRecording() {
  playing?.pause();
  playing=undefined;
 }
 document.addEventListener('play', ({target: audio})=>{
  if (!audio.matches?.('.bassa-audio audio') || audio.paused || audio===playing) return;
  stopRecording();
  playing=audio;
 }, true);
 document.addEventListener('klassia:render', stopRecording);
 window.addEventListener('pagehide', stopRecording);

 function lexicalCard(entry, decisions) {
  const forms=entry.forms.map(form=>{
   const annotation=decisions?.[form]?.decision==='exclude'?' · signalée à revoir (acceptée)':'';
   return `<span>${E(form)}${annotation}</span>`;
  }).join('');
  const recordings=(Array.isArray(entry.recordings)?entry.recordings:[])
   .filter(recording=>isPublishableRecording(entry,recording))
   .map(recording=>{
    const label=`Prononciation vérifiée · ${recording.form} (${recording.sense})`;
    const credit=recording.credit?`<p class="source">Voix · ${E(recording.credit)}</p>`:'';
    return `<div class="lesson-audio bassa-audio"><p>${E(label)}</p>
     <audio aria-label="${E(label)}" controls preload="none" crossorigin="anonymous" src="${E(new URL(recording.src,base).href)}"></audio>${credit}</div>`;
   }).join('');
  const links=(entry.source_links||[]).map(s=>`<a href="${E(s.url)}" target="_blank" rel="noopener">Consulter ${E(s.title)} ↗</a>`).join(' · ');
  const notes=entry.notes.length?`<details><summary>Précisions sur les variantes</summary><p>${entry.notes.map(E).join(' ')}</p></details>`:'';
  return `<article><h3>${E(entry.concept)}</h3><p class="bassa-forms">${forms}</p>${recordings}
   <p class="source">Sources : ${entry.sources.map(E).join(' · ')}</p>${links}${notes}</article>`;
 }

 async function mount(container,grade,lessonId){
  if(!container||container.querySelector('.bassa-learning'))return;
  const section=document.createElement('section');section.className='bassa-learning';section.innerHTML='<h2>Bassa · traductions et entraînement</h2><p>Chargement des propositions documentaires…</p>';const before=container.querySelector('.learning-block,.bilingual');if(before&&before.parentElement===container)container.insertBefore(section,before);else container.append(section);
  try{const [lex,map]=await load();if(!section.isConnected)return;const row=map.lessons[grade+':'+lessonId];if(!row)throw Error('Correspondance Bassa à compléter');const entries=row.concept_ids.map(id=>lex.entries.find(x=>x.id===id)).filter(Boolean);
   let reviews={};try{reviews=JSON.parse(localStorage.getItem('klassia_bassa_review_v1')||'{}');}catch{}
   section.innerHTML=`<h2>Bassa · traductions et entraînement</h2><p>Les variantes écrites restent des propositions documentaires pendant la revue du lexique. <b>Toutes les variantes affichées pour le sens demandé sont acceptées</b>, y compris celles signalées à revoir.</p><p>${E(row.note)}</p><div class="bassa-lexical-cards">${entries.map(x=>lexicalCard(x,reviews[x.concept])).join('')}</div><div class="bassa-training"><h3>À toi de traduire / Try a translation</h3><label>Sens demandé <select class="bassa-concept">${entries.map((x,i)=>`<option value="${i}">${E(x.concept)}</option>`).join('')}</select></label><p class="bassa-task"></p><label>Ta réponse bassa <input class="bassa-response" autocomplete="off" spellcheck="false"></label><p>Tu peux aussi choisir une proposition si le clavier ne possède pas ses caractères.</p><div class="bassa-choices"></div><button class="classBtn bassa-submit">Vérifier la traduction</button><p class="bassa-result" role="status"></p></div><p><a href="${new URL('#bassa',base)}">Consulter tout le lexique et les remarques de relecture</a></p>`;
   section.insertBefore(section.querySelector('.bassa-training'),section.querySelector('.bassa-lexical-cards'));
   const select=section.querySelector('select'),input=section.querySelector('input'),feedback=section.querySelector('.bassa-result');
   function current(){return entries[Number(select.value)];}
   function draw(){input.value='';feedback.textContent='';const x=current();section.querySelector('.bassa-task').textContent='Donne une forme bassa proposée pour : '+x.concept;const choices=section.querySelector('.bassa-choices');choices.replaceChildren();for(const f of x.forms){const b=document.createElement('button');b.type='button';b.textContent=f;b.onclick=()=>{input.value=f;input.focus();};choices.append(b);}}
   function check(){feedback.textContent=accepts(current(),input.value)?'Réponse acceptée. Cette traduction reste une proposition documentaire à confirmer.':'Cette forme ne figure pas dans les propositions pour ce sens. Compare les variantes ci-dessus ou choisis-en une; aucune note n’est attribuée.';}
   select.onchange=draw;section.querySelector('.bassa-submit').onclick=check;input.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();check();}};draw();
  }catch(e){section.innerHTML='<h2>Bassa</h2><p>'+E(e.message)+'</p><button class="classBtn">Réessayer</button>';section.querySelector('button').onclick=()=>{section.remove();mount(container,grade,lessonId);};}
 }
 return {normalize,accepts,mount};
});
