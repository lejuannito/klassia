(() => {
  'use strict';
  const V9 = { version: '15.0', schema: 1, activityKey: 'klassia_activity_v9', backupKey: 'klassia_last_backup_v9', deviceKey: 'klassia_device_v9' };
  const $ = (q, root=document) => root.querySelector(q);
  const loadJson = (key, fallback) => { try { const v=Klassia.storage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } };
  const saveJson = (key, value) => { try { Klassia.storage.setItem(key, JSON.stringify(value)); } catch {} };
  const escHtml = value => String(value ?? '').replace(/[&<>\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));
  const formatDate = iso => { try { return new Intl.DateTimeFormat('fr-FR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}).format(new Date(iso)); } catch { return ''; } };

  function deviceId(){
    let id=Klassia.storage.getItem(V9.deviceKey);
    if(!id){ id=(crypto?.randomUUID?.() || `klassia-${Date.now()}-${Math.random().toString(36).slice(2)}`); Klassia.storage.setItem(V9.deviceKey,id); }
    return id;
  }
  function activities(){ return loadJson(V9.activityKey,[]); }
  function log(type,label,unit=null){
    const a=activities();
    const last=a[0];
    if(last && last.type===type && last.label===label && Date.now()-new Date(last.at).getTime()<1500) return;
    a.unshift({type,label,unit,at:new Date().toISOString()});
    saveJson(V9.activityKey,a.slice(0,80));
  }
  function icon(type){ return ({lesson:'📘',mastery:'✓',review:'↻',evaluation:'★',qcm:'🧩',project:'◆',backup:'⇩',restore:'↥'})[type] || '•'; }
  function activityHtml(limit=6){
    const a=activities().slice(0,limit);
    if(!a.length) return '<p class="muted">Aucune activité enregistrée pour le moment.</p>';
    return `<div class="v9-activity-list">${a.map(x=>`<div class="v9-activity"><span>${icon(x.type)}</span><div><strong>${escHtml(x.label)}</strong><small>${escHtml(formatDate(x.at))}${x.unit?` · ${escHtml(x.unit)}`:''}</small></div></div>`).join('')}</div>`;
  }
  const downloadBackup=()=>Klassia.downloadBackup();
  const openData=()=>Klassia.openProfiles();
  function planHtml(){return `<section class="v9-plan"><div class="section-title-row"><div><div class="eyebrow">MON PLAN DU JOUR</div><h2>3 petites étapes</h2></div></div><div class="v9-plan-grid"><button onclick="location.hash='#learn'"><span>1</span><b>📘 Apprendre</b><small>Continuer une leçon</small></button><button onclick="location.hash='#revise'"><span>2</span><b>🧩 Réviser</b><small>Consolider les acquis</small></button><button onclick="location.hash='#progress'"><span>3</span><b>◎ Faire le point</b><small>Voir ma progression</small></button></div></section>`;}
  function renderActivityTargets(){ document.querySelectorAll('[data-v9-activity]').forEach(el=>el.innerHTML=activityHtml(Number(el.dataset.v9Activity)||6)); }
  function decorate(){
    const top=$('.topbar'); if(top && !$('.v9-save-btn',top)){const b=document.createElement('button');b.className='iconBtn v9-save-btn';b.title='Sauvegarder la progression';b.setAttribute('aria-label','Sauvegarder la progression');b.textContent='⇩';b.onclick=openData;const logout=$('#logout',top);top.insertBefore(b,logout||null);}
    const hero=$('.hero-dashboard'); const recommend=$('.recommend-card'); if(hero && recommend && !$('.v9-plan')) recommend.insertAdjacentHTML('afterend',planHtml());
    const reset=$('.reset-card'); if(reset && !$('.v9-data-cta')) reset.insertAdjacentHTML('beforebegin',`<section class="v9-data-cta"><div><h3>Protéger ma progression</h3><p>Sauvegarde tes résultats avant de changer de téléphone ou de navigateur.</p></div><button class="btn soft" id="v9OpenData">Gérer mes données</button></section><section class="v9-activity-card"><div class="eyebrow">ACTIVITÉ RÉCENTE</div><h3>Ce qui vient d’être travaillé</h3><div data-v9-activity="5"></div></section>`);
    const open=$('#v9OpenData'); if(open&&!open.dataset.bound){open.dataset.bound='1';open.onclick=openData;}
    const parentGrid=$('.parent-unit-grid'); if(parentGrid && !$('.v9-parent-activity')) parentGrid.insertAdjacentHTML('afterend',`<section class="v9-parent-activity"><div class="row between"><div><div class="eyebrow">ACTIVITÉ RÉCENTE</div><h3>Derniers apprentissages</h3></div><button class="text-btn" id="v9ParentBackup">Sauvegarder</button></div><div data-v9-activity="6"></div></section>`);
    const pb=$('#v9ParentBackup'); if(pb&&!pb.dataset.bound){pb.dataset.bound='1';pb.onclick=openData;}
    renderActivityTargets();
  }
  function wrapActions(){
    if(window.setStatus && !window.setStatus.__v9){const base=window.setStatus;window.setStatus=(id,st)=>{try{const title=document.querySelector('.lesson-header h1')?.textContent || id;log(st==='MAITRISEE'?'mastery':'review',`${st==='MAITRISEE'?'Compréhension déclarée':'Leçon à revoir'} : ${title}`,Klassia.storage.getItem('klassia_unit'));}catch{} return base(id,st);};window.setStatus.__v9=true;}
    if(window.saveEval && !window.saveEval.__v9){const base=window.saveEval;window.saveEval=id=>{const raw=document.getElementById('score')?.value;const v=raw?.trim()?Number(raw):NaN;if(Number.isFinite(v)&&v>=0&&v<=20)log('evaluation',`Évaluation enregistrée : ${v}/20`,Klassia.storage.getItem('klassia_unit'));return base(id);};window.saveEval.__v9=true;}
    if(window.correctQcm && !window.correctQcm.__v9){const base=window.correctQcm;window.correctQcm=i=>{const out=base(i);setTimeout(()=>{const t=document.getElementById('scoreQcm')?.innerText?.trim();if(t)log('qcm',`Série QCM : ${t.split('\n')[0]}`,Klassia.storage.getItem('klassia_unit'));},0);return out;};window.correctQcm.__v9=true;}
    document.addEventListener('change',e=>{if(e.target?.matches?.('[data-project]')&&e.target.checked)log('project',`Étape ${Number(e.target.dataset.project)+1} du projet réalisée`,Klassia.storage.getItem('klassia_unit'));});
    window.addEventListener('hashchange',()=>{const h=location.hash;if(h.startsWith('#lesson:'))setTimeout(()=>{const t=document.querySelector('.lesson-header h1')?.textContent;if(t)log('lesson',`Leçon consultée : ${t}`,Klassia.storage.getItem('klassia_unit'));renderActivityTargets();},200);});
  }
  deviceId(); wrapActions();
  document.addEventListener('klassia:render',decorate);
  window.addEventListener('load',()=>{decorate(); if(navigator.storage?.persisted)navigator.storage.persisted().then(ok=>{if(!ok&&navigator.storage?.persist)navigator.storage.persist().catch(()=>{});});});
  window.KlassiaV9={openData,downloadBackup,version:V9.version};
})();

