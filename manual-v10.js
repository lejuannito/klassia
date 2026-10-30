(() => {
  'use strict';
  let manualPatch = null;
  const esc10 = value => String(value ?? '').replace(/[&<>\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const nl10 = value => esc10(value).replace(/\n/g, '<br>');

  function applyPatchToContent(){
    if (!manualPatch || typeof content === 'undefined' || !content?.subjects || typeof currentUnit === 'undefined' || currentUnit?.id !== 'U1') return false;
    for (const s of content.subjects) {
      const sp = manualPatch.subjects?.[s.id];
      if (sp?.chapter_intro) s.chapter_intro = sp.chapter_intro;
      for (const l of (s.lessons || [])) {
        const lp = manualPatch.lessons?.[l.id];
        if (lp) Object.assign(l, lp);
      }
    }
    Object.assign(content.metadata || (content.metadata = {}), manualPatch.metadata || {});
    return true;
  }

  function renderSection(section, index){
    const icons = { reading:'📚', method:'🧭', example:'🔎', table:'▦', activity:'👐', warning:'⚠️', text:'📘' };
    const icon = icons[section.kind] || '📘';
    let inside = section.body ? `<p>${nl10(section.body)}</p>` : '';
    if ((section.items || []).length) inside += `<ul>${section.items.map(x=>`<li>${nl10(x)}</li>`).join('')}</ul>`;
    if (section.table?.headers?.length) {
      inside += `<div class="manual-table-wrap"><table class="manual-table"><thead><tr>${section.table.headers.map(h=>`<th>${esc10(h)}</th>`).join('')}</tr></thead><tbody>${(section.table.rows||[]).map(row=>`<tr>${row.map(c=>`<td>${nl10(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    }
    return `<details class="manual-section kind-${esc10(section.kind||'text')}" ${index===0?'open':''}><summary><span class="manual-section-icon">${icon}</span><span>${esc10(section.title||'Approfondir')}</span><span class="manual-toggle">⌄</span></summary><div class="manual-section-body">${inside}</div></details>`;
  }

  function currentSubjectFromHash(){
    const h=decodeURIComponent(location.hash||'');
    if(h.startsWith('#subject:')) return content?.subjects?.find(s=>s.id===h.slice(9));
    if(h.startsWith('#lesson:')) {
      const id=h.slice(8); return content?.subjects?.find(s=>s.lessons?.some(l=>l.id===id));
    }
    return null;
  }
  function currentLessonFromHash(){
    const h=decodeURIComponent(location.hash||''); if(!h.startsWith('#lesson:')) return null;
    const id=h.slice(8); for(const s of (content?.subjects||[])){const l=s.lessons?.find(x=>x.id===id);if(l)return l;} return null;
  }

  function decorate(){
    if (typeof content === 'undefined' || typeof currentUnit === 'undefined' || currentUnit?.id !== 'U1') return;
    applyPatchToContent();
    const subj=currentSubjectFromHash();
    const hero=document.querySelector('.subject-hero');
    if(hero && subj?.chapter_intro && !document.querySelector('.chapter-intro')){
      hero.insertAdjacentHTML('afterend',`<section class="chapter-intro"><div class="eyebrow">DANS CE CHAPITRE</div><p>${nl10(subj.chapter_intro)}</p></section>`);
    }
    const lesson=currentLessonFromHash();
    const page=document.querySelector('.lesson-page');
    if(page && lesson?.manual_sections?.length && !page.querySelector('.manual-chapter')){
      const target=page.querySelector('.learning-block.takeaway');
      if(target){
        const html=`<section class="manual-chapter"><div class="manual-chapter-head"><div><div class="block-kicker"><span>📖</span> MON MANUEL</div><p>Approfondis la leçon avec les explications, exemples et activités. Ouvre les rubriques à ton rythme.</p></div><span class="manual-count">${lesson.manual_sections.length} rubriques</span></div>${lesson.manual_sections.map(renderSection).join('')}</section>`;
        target.insertAdjacentHTML('beforebegin',html);
      }
    }
  }

  if (typeof loadUnit === 'function' && !loadUnit.__manualV10) {
    const baseLoadUnit=loadUnit;
    loadUnit=async function(id){ const out=await baseLoadUnit(id); applyPatchToContent(); return out; };
    loadUnit.__manualV10=true;
  }

  fetch('./data/u1-manual/index.json').then(r=>r.ok?r.json():null).then(async idx=>{
    if(!idx) return null;
    const parts=await Promise.all((idx.subjects||[]).map(id=>fetch(`./data/u1-manual/${id}.json`).then(r=>r.ok?r.json():null)));
    const patch={subjects:{},lessons:{},metadata:idx.metadata||{}};
    parts.filter(Boolean).forEach(x=>{patch.subjects[x.subject]={chapter_intro:x.chapter_intro};Object.assign(patch.lessons,x.lessons||{});});
    return patch;
  }).then(p=>{
    manualPatch=p; if(p && applyPatchToContent() && typeof route==='function') route(); decorate();
  }).catch(()=>{});

  const root=document.getElementById('app');
  if(root) new MutationObserver(()=>requestAnimationFrame(decorate)).observe(root,{childList:true,subtree:true});
  window.addEventListener('hashchange',()=>setTimeout(decorate,50));
  window.addEventListener('load',()=>setTimeout(decorate,100));
})();
