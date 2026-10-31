/* Shared local profiles and atomic storage. No remote account or telemetry. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory;
  else root.Klassia = factory(root.localStorage);
})(typeof window === 'object' ? window : globalThis, function (native) {
  'use strict';
  const KEY = 'klassia_profiles_v15', UNDO = 'klassia_restore_undo_v15';
  const clone = x => JSON.parse(JSON.stringify(x));
  const object = x => x !== null && typeof x === 'object' && !Array.isArray(x);
  const forbidden = new Set(['__proto__', 'constructor', 'prototype']);
  function safeTree(x, depth = 0) {
    if (depth > 15) throw Error('Structure de sauvegarde trop profonde.');
    if (x && typeof x === 'object') for (const [k, v] of Object.entries(x)) {
      if (forbidden.has(k)) throw Error('Clé de sauvegarde interdite.');
      safeTree(v, depth + 1);
    }
  }
  const known = k => /^(klassia_(progress|exercises|recent|unit|activity_v9|last_backup_v9|review_dates|attempts|observations)|klassia_(evals|project|qcm_scores)(:U[1-8])?|klassia_ms_theme_v2|klassia_ms_progress_v2:T[1-8])$/.test(k);
  function validate(k, raw) {
    if (!known(k) || typeof raw !== 'string' || raw.length > 2000000) throw Error('Donnée de sauvegarde non reconnue : ' + k);
    if (k === 'klassia_unit') { if (!/^U[1-8]$/.test(raw)) throw Error('Unité invalide.'); return; }
    if (k === 'klassia_ms_theme_v2') { if (!/^T[1-8]$/.test(raw)) throw Error('Thème invalide.'); return; }
    if (k === 'klassia_last_backup_v9') { if (!Number.isFinite(Date.parse(raw))) throw Error('Date invalide.'); return; }
    let v; try { v = JSON.parse(raw); } catch { throw Error('Donnée JSON invalide : ' + k); }
    safeTree(v);
    if (['klassia_activity_v9','klassia_attempts','klassia_observations'].includes(k)) {
      if (!Array.isArray(v) || v.length > 10000 || v.some(x=>!object(x))) throw Error('Journal invalide.');
    } else if (!object(v)) throw Error('Objet attendu : ' + k);
    if (k === 'klassia_progress' && Object.entries(v).some(([id,s])=>! /^[A-Z]{2}-U[1-8]-L\d+$/.test(id) || !['MAITRISEE','A_REVOIR','EN_COURS'].includes(s))) throw Error('Progression CE2 invalide.');
    if (k.startsWith('klassia_ms_progress_v2:') && Object.values(v).some(s=>!['D','EC','A'].includes(s))) throw Error('Progression MS invalide.');
    if (k.startsWith('klassia_evals') && Object.values(v).some(e=>!object(e)||!Number.isFinite(e.score)||e.score<0||e.score>20)) throw Error('Évaluation invalide.');
    if (k.startsWith('klassia_qcm_scores') && Object.values(v).some(e=>!object(e)||!Number.isFinite(e.score)||!Number.isFinite(e.total)||e.total<=0||e.score<0||e.score>e.total)) throw Error('Score QCM invalide.');
    if (k === 'klassia_exercises' && Object.values(v).some(e=>!object(e)||typeof e.ok!=='boolean')) throw Error('Exercice invalide.');
    if (k.startsWith('klassia_project') && Object.values(v).some(e=>typeof e!=='boolean')) throw Error('Projet invalide.');
    if (k === 'klassia_recent' && v.lessonId!==undefined && typeof v.lessonId!=='string') throw Error('Reprise invalide.');
  }
  function validateEnvelope(e) {
    safeTree(e);
    if (!object(e)||e.schema!==2||!object(e.profiles)||!Object.keys(e.profiles).length||Object.keys(e.profiles).length>30||!e.profiles[e.active]) throw Error('Profils locaux illisibles. Exportez les données avant toute réinitialisation.');
    for(const [id,p] of Object.entries(e.profiles)) {
      if(!/^[a-zA-Z0-9_-]{1,80}$/.test(id)||!object(p)||typeof p.name!=='string'||!p.name.trim()||p.name.length>40||!object(p.data)) throw Error('Profil invalide.');
      for(const [k,v] of Object.entries(p.data)) if(known(k))validate(k,v);
    }
  }
  function initial() {
    const data = {};
    // Legacy keys are copied once and retained unchanged as a recovery source.
    for (let i=0;i<native.length;i++) { const k=native.key(i); if(known(k)) { const raw=native.getItem(k); try { validate(k,raw); data[k]=raw; } catch {} } }
    return {schema:2,active:'initial',profiles:{initial:{name:'Mon enfant',data}}};
  }
  const raw = native.getItem(KEY);
  let state = raw ? JSON.parse(raw) : initial();
  validateEnvelope(state);
  if(!raw) native.setItem(KEY,JSON.stringify(state));
  function refresh(){const raw=native.getItem(KEY);if(raw){const next=JSON.parse(raw);validateEnvelope(next);state=next;}}
  function commit(change) {
    refresh();const next=clone(state);change(next);validateEnvelope(next);
    // A single setItem is atomic: quota failure leaves the old envelope intact.
    native.setItem(KEY,JSON.stringify(next));state=next;
  }
  const data=()=>state.profiles[state.active].data;
  const storage={
    getItem:k=>{refresh();return data()[k]??null;},
    setItem:(k,v)=>commit(e=>{if(known(k))validate(k,String(v));e.profiles[e.active].data[k]=String(v);}),
    removeItem:k=>commit(e=>{delete e.profiles[e.active].data[k];}),
    key:i=>Object.keys(data())[i]??null,
    get length(){return Object.keys(data()).length;}
  };
  function exportBackup(){refresh();return {product:'Klassia',schemaVersion:2,appVersion:'15.0',exportedAt:new Date().toISOString(),profile:{name:state.profiles[state.active].name},scope:['CE2','MS'],data:Object.fromEntries(Object.entries(data()).filter(([k])=>known(k))) };}
  function prepareImport(payload) {
    if(!object(payload)||payload.product!=='Klassia'||![1,2].includes(payload.schemaVersion)||!object(payload.data)) throw Error('Sauvegarde Klassia non reconnue.');
    safeTree(payload);const values={};
    for(const [k,v] of Object.entries(payload.data)) {
      if(!known(k)) {if(['klassia_device_v9','klassia_user'].includes(k)&&payload.schemaVersion===1)continue;throw Error('Clé inconnue : '+k);}
      const raw=payload.schemaVersion===1?(typeof v==='string'?v:JSON.stringify(v)):v;validate(k,raw);values[k]=raw;
    }
    if(!Object.keys(values).length)throw Error('Sauvegarde vide.');
    return {values,count:Object.keys(values).length,sourceName:payload.profile?.name||'Ancienne sauvegarde CE2',grades:[...new Set(Object.keys(values).map(k=>k.startsWith('klassia_ms_')?'MS':'CE2'))]};
  }
  function restore(payload) {
    const prepared=prepareImport(payload);refresh();native.setItem(UNDO,JSON.stringify(state));
    commit(e=>Object.assign(e.profiles[e.active].data,prepared.values));return prepared;
  }
  function undoRestore(){const raw=native.getItem(UNDO);if(!raw)throw Error('Aucune restauration à annuler.');const next=JSON.parse(raw);validateEnvelope(next);native.setItem(KEY,raw);state=next;native.removeItem(UNDO);}
  function createProfile(name){name=String(name).trim();if(!name||name.length>40)throw Error('Choisissez un prénom ou pseudonyme de 1 à 40 caractères.');const id='p'+Date.now().toString(36)+Math.random().toString(36).slice(2,8);commit(e=>{e.profiles[id]={name,data:{}};e.active=id;});return id;}
  function selectProfile(id){commit(e=>{if(!e.profiles[id])throw Error('Profil inconnu.');e.active=id;});}
  function renameProfile(name){name=String(name).trim();if(!name||name.length>40)throw Error('Nom invalide.');commit(e=>e.profiles[e.active].name=name);}
  function append(key,item){const a=JSON.parse(storage.getItem(key)||'[]');a.push({...item,at:new Date().toISOString()});storage.setItem(key,JSON.stringify(a.slice(-1000)));}
  function shuffleOptions(question,random=Math.random){const options=question.choix.map((text,i)=>({id:i,text}));for(let i=options.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[options[i],options[j]]=[options[j],options[i]];}return options;}
  const routes={};
  function registerRoutes(grade,fn){routes[grade]=fn;}
  function specialRoute(grade,hash){return routes[grade]?.(hash)||false;}
  function rendered(){if(typeof document!=='undefined')document.dispatchEvent(new CustomEvent('klassia:render'));}
  const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  return {version:'15.0',storage,exportBackup,prepareImport,restore,undoRestore,createProfile,selectProfile,renameProfile,append,shuffleOptions,registerRoutes,specialRoute,rendered,escape,
    profile:()=>{refresh();return {id:state.active,name:state.profiles[state.active].name};},profiles:()=>{refresh();return Object.entries(state.profiles).map(([id,p])=>({id,name:p.name}));},
    read:(k,fallback)=>{try{return JSON.parse(storage.getItem(k))??fallback;}catch{return fallback;}},write:(k,v)=>storage.setItem(k,JSON.stringify(v))};
});
