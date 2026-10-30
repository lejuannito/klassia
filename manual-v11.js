(() => {
  'use strict';
  let manualPack = null;
  const escM = value => String(value ?? '').replace(/[&<>\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const nlM = value => escM(value).replace(/\n/g, '<br>');

  async function loadPack(){
    const names = ["./data/manual/part-01.txt", "./data/manual/part-02.txt", "./data/manual/part-03.txt", "./data/manual/part-04.txt", "./data/manual/part-05a.txt", "./data/manual/part-05b.txt", "./data/manual/part-05c.txt", "./data/manual/part-06a.txt", "./data/manual/part-06b-1.txt", "./data/manual/part-06b-2.txt", "./data/manual/part-06c-1.txt", "./data/manual/part-06c-2.txt", "./data/manual/part-07.txt"];
    const parts = await Promise.all(names.map(u => fetch(u).then(r => { if(!r.ok) throw new Error(`Supplément manuel indisponible: ${u}`); return r.text(); })));
    if(typeof DecompressionStream !== 'function') throw new Error('Ce navigateur ne prend pas en charge la décompression du manuel enrichi. Le parcours de base reste disponible.');
    const bin = Uint8Array.from(atob(parts.join('')), c => c.charCodeAt(0));
    const stream = new Blob([bin]).stream().pipeThrough(new DecompressionStream('gzip'));
    return JSON.parse(await new Response(stream).text());
  }

  function unitPatch(){
    if(!manualPack || typeof currentUnit === 'undefined') return null;
    return manualPack.units?.[currentUnit?.id] || null;
  }
  function applyPatch(){
    const patch=unitPatch();
    if(!patch || typeof content === 'undefined' || !content?.subjects) return false;
    for(const s of content.subjects){
      const sp=patch.subjects?.[s.id]; if(sp?.chapter_intro) s.chapter_intro=sp.chapter_intro;
      for(const l of (s.lessons||[])){ const lp=patch.lessons?.[l.id]; if(lp) Object.assign(l,lp); }
    }
    Object.assign(content.metadata || (content.metadata={}), patch.metadata || {});
    return true;
  }
  function renderSection(section,index){
    const icons={reading:'📚',method:'🧭',example:'🔎',table:'▦',activity:'👐',warning:'⚠️',text:'📘'};
    let inside=section.body?`<p>${nlM(section.body)}</p>`:'';
    if((section.items||[]).length) inside+=`<ul>${section.items.map(x=>`<li>${nlM(x)}</li>`).join('')}</ul>`;
    if(section.table?.headers?.length) inside+=`<div class="manual-table-wrap"><table class="manual-table"><thead><tr>${section.table.headers.map(h=>`<th>${escM(h)}</th>`).join('')}</tr></thead><tbody>${(section.table.rows||[]).map(row=>`<tr>${row.map(c=>`<td>${nlM(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    return `<details class="manual-section kind-${escM(section.kind||'text')}" ${index===0?'open':''}><summary><span class="manual-section-icon">${icons[section.kind]||'📘'}</span><span>${escM(section.title||'Approfondir')}</span><span class="manual-toggle">⌄</span></summary><div class="manual-section-body">${inside}</div></details>`;
  }
  function currentSubject(){ const h=decodeURIComponent(location.hash||''); if(h.startsWith('#subject:'))return content?.subjects?.find(s=>s.id===h.slice(9)); if(h.startsWith('#lesson:')){const id=h.slice(8);return content?.subjects?.find(s=>s.lessons?.some(l=>l.id===id));} return null; }
  function currentLesson(){ const h=decodeURIComponent(location.hash||''); if(!h.startsWith('#lesson:'))return null; const id=h.slice(8); for(const s of(content?.subjects||[])){const l=s.lessons?.find(x=>x.id===id);if(l)return l;} return null; }
  function decorate(){
    if(typeof content==='undefined') return; applyPatch();
    const subj=currentSubject(), hero=document.querySelector('.subject-hero');
    if(hero && subj?.chapter_intro && !document.querySelector('.chapter-intro')) hero.insertAdjacentHTML('afterend',`<section class="chapter-intro"><div class="eyebrow">DANS CE CHAPITRE</div><p>${nlM(subj.chapter_intro)}</p></section>`);
    const lesson=currentLesson(), page=document.querySelector('.lesson-page');
    if(page && lesson?.manual_sections?.length && !page.querySelector('.manual-chapter')){
      const target=page.querySelector('.learning-block.takeaway');
      if(target) target.insertAdjacentHTML('beforebegin',`<section class="manual-chapter"><div class="manual-chapter-head"><div><div class="block-kicker"><span>📖</span> MON MANUEL</div><p>Approfondis la leçon avec les explications, méthodes, exemples et activités. Ouvre les rubriques à ton rythme.</p></div><span class="manual-count">${lesson.manual_sections.length} rubriques</span></div>${lesson.manual_sections.map(renderSection).join('')}</section>`);
    }
  }
  if(typeof loadUnit==='function'&&!loadUnit.__manualV11){const base=loadUnit;loadUnit=async function(id){const out=await base(id);applyPatch();return out;};loadUnit.__manualV11=true;}
  loadPack().then(p=>{manualPack=p;if(applyPatch()&&typeof route==='function')route();decorate();}).catch(err=>{console.warn('[Klassia manuel]',err.message);});
  const root=document.getElementById('app'); if(root)new MutationObserver(()=>requestAnimationFrame(decorate)).observe(root,{childList:true,subtree:true});
  window.addEventListener('hashchange',()=>setTimeout(decorate,50)); window.addEventListener('load',()=>setTimeout(decorate,100));
})();