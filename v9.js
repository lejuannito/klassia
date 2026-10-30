(() => {
  'use strict';
  const V9 = { version: '9.0', schema: 1, activityKey: 'klassia_activity_v9', backupKey: 'klassia_last_backup_v9', deviceKey: 'klassia_device_v9' };
  const $ = (q, root=document) => root.querySelector(q);
  const loadJson = (key, fallback) => { try { const v=localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } };
  const saveJson = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} };
  const escHtml = value => String(value ?? '').replace(/[&<>\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));
  const formatDate = iso => { try { return new Intl.DateTimeFormat('fr-FR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}).format(new Date(iso)); } catch { return ''; } };

  function deviceId(){
    let id=localStorage.getItem(V9.deviceKey);
    if(!id){ id=(crypto?.randomUUID?.() || `klassia-${Date.now()}-${Math.random().toString(36).slice(2)}`); localStorage.setItem(V9.deviceKey,id); }
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
  function snapshot(){
    const data={};
    for(let i=0;i<localStorage.length;i++){
      const key=localStorage.key(i);
      if(!key || !key.startsWith('klassia_') || key==='klassia_user') continue;
      const raw=localStorage.getItem(key);
      try{data[key]=JSON.parse(raw);}catch{data[key]=raw;}
    }
    return {product:'Klassia',appVersion:V9.version,schemaVersion:V9.schema,grade:'CE2',studentId:'demo-junior-ce2',deviceId:deviceId(),exportedAt:new Date().toISOString(),data};
  }
  function downloadBackup(){
    const payload=snapshot();
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob), a=document.createElement('a');
    a.href=url; a.download=`Klassia-CE2-progression-${new Date().toISOString().slice(0,10)}.json`; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
    localStorage.setItem(V9.backupKey,payload.exportedAt); log('backup','Progression sauvegardée'); renderActivityTargets();
    setMessage('Sauvegarde créée. Le fichier a été enregistré dans les téléchargements de cet appareil.','ok');
  }
  async function restoreBackup(file){
    if(!file) return;
    try{
      const payload=JSON.parse(await file.text());
      if(payload?.product!=='Klassia' || Number(payload?.schemaVersion)!==V9.schema || !payload?.data || typeof payload.data!=='object') throw new Error('Fichier de sauvegarde Klassia non reconnu.');
      if(!confirm('Restaurer cette sauvegarde ? Les données pédagogiques locales actuelles seront remplacées.')) return;
      const keepUser=localStorage.getItem('klassia_user'), keepDevice=deviceId();
      const keys=[]; for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k?.startsWith('klassia_'))keys.push(k);} keys.forEach(k=>localStorage.removeItem(k));
      Object.entries(payload.data).forEach(([k,v])=>{ if(!k.startsWith('klassia_') || k==='klassia_user')return; localStorage.setItem(k,typeof v==='string'?v:JSON.stringify(v)); });
      if(keepUser) localStorage.setItem('klassia_user',keepUser); localStorage.setItem(V9.deviceKey,keepDevice); localStorage.setItem(V9.backupKey,new Date().toISOString());
      log('restore','Progression restaurée'); setMessage('Restauration réussie. Klassia va recharger la progression.','ok'); setTimeout(()=>location.reload(),550);
    }catch(e){setMessage(e.message || 'Impossible de restaurer ce fichier.','error');}
  }
  async function persistStorage(){
    if(!navigator.storage?.persist){setMessage('Ce navigateur ne propose pas le stockage persistant. La sauvegarde manuelle reste disponible.','warn');return;}
    try{const granted=await navigator.storage.persist(); setMessage(granted?'Stockage persistant activé. Le navigateur protégera mieux les données locales.':'Le navigateur n’a pas accordé le stockage persistant. La sauvegarde manuelle reste recommandée.',granted?'ok':'warn');}catch{setMessage('Impossible de demander le stockage persistant.','warn');}
  }
  function setMessage(text,type='ok'){
    const box=$('#v9DataMessage'); if(!box)return; box.className=`v9-message ${type}`; box.textContent=text;
  }
  function openData(){
    let modal=$('#v9DataModal'); if(modal){modal.classList.add('open');return;}
    modal=document.createElement('div'); modal.id='v9DataModal'; modal.className='v9-modal open';
    const last=localStorage.getItem(V9.backupKey);
    modal.innerHTML=`<div class="v9-dialog" role="dialog" aria-modal="true" aria-label="Sauvegarde Klassia"><div class="v9-dialog-head"><div><div class="eyebrow">KLASSIA V9 · DONNÉES</div><h2>Sauvegarde de la progression</h2></div><button class="v9-close" aria-label="Fermer">×</button></div><p class="muted">Les progrès restent sur ce téléphone. Créez une sauvegarde avant de changer d’appareil ou de nettoyer le navigateur.</p><div class="v9-data-grid"><article><b>⇩ Sauvegarder</b><p>Leçons, exercices, évaluations, QCM et projets.</p><button id="v9Export" class="btn primary full">Télécharger la sauvegarde</button></article><article><b>↥ Restaurer</b><p>Recharge une sauvegarde Klassia v9 sur cet appareil.</p><label class="btn soft full v9-file">Choisir un fichier<input id="v9Import" type="file" accept="application/json,.json"></label></article><article><b>🛡 Protéger le stockage</b><p>Demande au navigateur de mieux conserver les données hors ligne.</p><button id="v9Persist" class="btn soft full">Activer si disponible</button></article><article><b>☁ Synchronisation</b><p>Le format est prêt pour un futur compte Klassia en ligne.</p><span class="v9-chip">À connecter</span></article></div><div class="v9-meta"><span>Version <b>${V9.version}</b></span><span>Appareil <b>${escHtml(deviceId().slice(0,8))}…</b></span><span>Dernière sauvegarde <b>${last?escHtml(formatDate(last)):'jamais'}</b></span></div><div id="v9DataMessage" class="v9-message"></div><div class="v9-privacy">Aucune progression n’est envoyée vers un serveur Klassia dans cette version. Le fichier exporté ne contient pas le mot de passe de démonstration.</div></div>`;
    document.body.appendChild(modal);
    $('.v9-close',modal).onclick=()=>modal.classList.remove('open'); modal.addEventListener('click',e=>{if(e.target===modal)modal.classList.remove('open');});
    $('#v9Export',modal).onclick=downloadBackup; $('#v9Persist',modal).onclick=persistStorage; $('#v9Import',modal).onchange=e=>restoreBackup(e.target.files?.[0]).finally(()=>e.target.value='');
  }
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
    if(window.setStatus && !window.setStatus.__v9){const base=window.setStatus;window.setStatus=(id,st)=>{try{const title=document.querySelector('.lesson-header h1')?.textContent || id;log(st==='MAITRISEE'?'mastery':'review',`${st==='MAITRISEE'?'Leçon maîtrisée':'Leçon à revoir'} : ${title}`,localStorage.getItem('klassia_unit'));}catch{} return base(id,st);};window.setStatus.__v9=true;}
    if(window.saveEval && !window.saveEval.__v9){const base=window.saveEval;window.saveEval=id=>{const v=Number(document.getElementById('score')?.value);if(Number.isFinite(v)&&v>=0&&v<=20)log('evaluation',`Évaluation enregistrée : ${v}/20`,localStorage.getItem('klassia_unit'));return base(id);};window.saveEval.__v9=true;}
    if(window.correctQcm && !window.correctQcm.__v9){const base=window.correctQcm;window.correctQcm=i=>{const out=base(i);setTimeout(()=>{const t=document.getElementById('scoreQcm')?.innerText?.trim();if(t)log('qcm',`Série QCM : ${t.split('\n')[0]}`,localStorage.getItem('klassia_unit'));},0);return out;};window.correctQcm.__v9=true;}
    document.addEventListener('change',e=>{if(e.target?.matches?.('[data-project]')&&e.target.checked)log('project',`Étape ${Number(e.target.dataset.project)+1} du projet réalisée`,localStorage.getItem('klassia_unit'));});
    window.addEventListener('hashchange',()=>{const h=location.hash;if(h.startsWith('#lesson:'))setTimeout(()=>{const t=document.querySelector('.lesson-header h1')?.textContent;if(t)log('lesson',`Leçon consultée : ${t}`,localStorage.getItem('klassia_unit'));renderActivityTargets();},200);});
  }
  deviceId(); wrapActions();
  const observer=new MutationObserver(()=>requestAnimationFrame(decorate)); const root=document.getElementById('app'); if(root)observer.observe(root,{childList:true,subtree:true});
  window.addEventListener('load',()=>{decorate(); if(navigator.storage?.persisted)navigator.storage.persisted().then(ok=>{if(!ok&&navigator.storage?.persist)navigator.storage.persist().catch(()=>{});});});
  window.KlassiaV9={openData,downloadBackup,version:V9.version};
})();
