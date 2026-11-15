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
  const GRADES = ['CE2','MS','GS','SIL','CE1','NURSERY1','NURSERY2','CLASS1','CLASS3','CLASS4'];
  const known = k => /^(klassia_(progress|exercises|recent|unit|activity_v9|last_backup_v9|review_dates|attempts|observations)|klassia_(evals|project|qcm_scores)(:U[1-8])?|klassia_(ms|gs|nursery[12])_theme_v2|klassia_(ms|gs)_progress_v2:T[1-8]|klassia_nursery[12]_progress_v1:T[1-8]|klassia_(sil|ce1|class[134])_progress_v1|klassia_ce1_qcm_v1|klassia_(ms|gs|sil|ce1|ce2|nursery[12]|class[134])_recent_v1|klassia_(sil|ce1|ce2|class[134])_week_v1|klassia_(answers_v1|family|home_language_v1|home_words_v1|nursery_lang_v1|lesson_view_v1))$/.test(k);
  function validate(k, raw) {
    if (!known(k) || typeof raw !== 'string' || raw.length > 2000000) throw Error('Donnée de sauvegarde non reconnue : ' + k);
    if (k === 'klassia_unit') { if (!/^U[1-8]$/.test(raw)) throw Error('Unité invalide.'); return; }
    if (/^klassia_(ms|gs|nursery[12])_theme_v2$/.test(k)) { if (!/^T[1-8]$/.test(raw)) throw Error('Thème invalide.'); return; }
    if (k === 'klassia_last_backup_v9') { if (!Number.isFinite(Date.parse(raw))) throw Error('Date invalide.'); return; }
    let v; try { v = JSON.parse(raw); } catch { throw Error('Donnée JSON invalide : ' + k); }
    safeTree(v);
    if (k === 'klassia_nursery_lang_v1' || k === 'klassia_lesson_view_v1') {
      if (!(k === 'klassia_nursery_lang_v1' ? ['fr','en'] : ['all','one']).includes(v)) throw Error('Préférence invalide.');
      return;
    }
    if (/_recent_v1$/.test(k) && v === null) return;
    if (['klassia_activity_v9','klassia_attempts','klassia_observations'].includes(k)) {
      if (!Array.isArray(v) || v.length > 10000 || v.some(x=>!object(x))) throw Error('Journal invalide.');
    } else if (!object(v)) throw Error('Objet attendu : ' + k);
    if (k === 'klassia_progress' && Object.entries(v).some(([id,s])=>! /^[A-Z]{2}-U[1-8]-L\d+$/.test(id) || !['MAITRISEE','A_REVOIR','EN_COURS'].includes(s))) throw Error('Progression CE2 invalide.');
    if (/^klassia_(?:(?:ms|gs)_progress_v2:|nursery[12]_progress_v1:|(?:sil|ce1|class[134])_progress_v1$)/.test(k) && Object.values(v).some(s=>!['D','EC','A'].includes(s))) throw Error('Progression invalide.');
    if (k === 'klassia_family' && !(v.dismissed === true || (['fr','en','both'].includes(v.school) && GRADES.includes(v.grade)))) throw Error('Réglage de la famille invalide.');
    if (k === 'klassia_home_language_v1' && (typeof v.name !== 'string' || v.name.length > 40)) throw Error('Langue de la maison invalide.');
    if (k === 'klassia_home_words_v1' && Object.values(v).some(x=>typeof x !== 'string' || x.length > 160)) throw Error('Mot de la maison invalide.');
    if (/_week_v1$/.test(k) && (!/^[UT][1-8]$/.test(v.unit) || !Number.isInteger(v.week) || v.week < 1 || v.week > 4)) throw Error('Semaine invalide.');
    if (k.startsWith('klassia_evals') && Object.values(v).some(e=>!object(e)||!Number.isFinite(e.score)||e.score<0||e.score>20)) throw Error('Évaluation invalide.');
    if (k.startsWith('klassia_qcm_scores') && Object.values(v).some(e=>!object(e)||!Number.isFinite(e.score)||!Number.isFinite(e.total)||e.total<=0||e.score<0||e.score>e.total)) throw Error('Score QCM invalide.');
    if (k === 'klassia_exercises' && Object.values(v).some(e=>!object(e)||typeof e.ok!=='boolean')) throw Error('Exercice invalide.');
    if (k === 'klassia_answers_v1' && (Object.keys(v).length > 400 || Object.values(v).some(e=>!object(e)||typeof e.text!=='string'||e.text.length>1500||typeof e.at!=='string'))) throw Error('Réponse écrite invalide.');
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
  function exportBackup(){refresh();return {product:'Klassia',schemaVersion:2,appVersion:'15.0',exportedAt:new Date().toISOString(),profile:{name:state.profiles[state.active].name},scope:[...GRADES],data:Object.fromEntries(Object.entries(data()).filter(([k])=>known(k))) };}
  function prepareImport(payload) {
    if(!object(payload)||payload.product!=='Klassia'||![1,2].includes(payload.schemaVersion)||!object(payload.data)) throw Error('Sauvegarde Klassia non reconnue.');
    safeTree(payload);const values={};
    for(const [k,v] of Object.entries(payload.data)) {
      if(!known(k)) {if(['klassia_device_v9','klassia_user'].includes(k)&&payload.schemaVersion===1)continue;throw Error('Clé inconnue : '+k);}
      const raw=payload.schemaVersion===1?(typeof v==='string'?v:JSON.stringify(v)):v;validate(k,raw);values[k]=raw;
    }
    if(!Object.keys(values).length)throw Error('Sauvegarde vide.');
    const sourceName=payload.profile?.name||'Ancienne sauvegarde Klassia';
    if(typeof sourceName!=='string'||!sourceName.trim()||sourceName.length>40) throw Error('Nom du profil invalide.');
    const grades=[...new Set(Object.keys(values).map(k=>GRADES.find(g=>k.startsWith('klassia_'+g.toLowerCase()+'_')) || (/^klassia_(progress|exercises|recent|unit|evals|project|qcm_scores)(:|$)/.test(k)?'CE2':null)).filter(Boolean))];
    return {values,count:Object.keys(values).length,sourceName,grades};
  }
  // Merge distinct records, taking the imported value for an explicitly shared record.
  // Neither this operation nor replacement is an automatic multi-device synchronisation.
  function restore(payload, {mode='merge'}={}) {
    if(!['merge','replace','new'].includes(mode)) throw Error('Mode de restauration invalide.');
    const prepared=prepareImport(payload);refresh();
    const previousUndo=native.getItem(UNDO);native.setItem(UNDO,JSON.stringify(state));
    try { commit(e=>{
      if(mode==='new') { const id='p'+Date.now().toString(36)+Math.random().toString(36).slice(2,8);e.profiles[id]={name:prepared.sourceName,data:{}};e.active=id; }
      const target=e.profiles[e.active].data;
      for(const [key,raw] of Object.entries(prepared.values)) {
        let value=raw;
        if(mode==='merge' && target[key]!==undefined && key!=='klassia_unit' && !/_theme_v2$/.test(key)) {
          const local=JSON.parse(target[key]),incoming=JSON.parse(raw);
          if(Array.isArray(local)&&Array.isArray(incoming)) {
            const unique=new Map([...local,...incoming].map(x=>[JSON.stringify(x),x]));value=JSON.stringify([...unique.values()]);
          } else if(object(local)&&object(incoming)) value=JSON.stringify({...local,...incoming});
        }
        validate(key,value);target[key]=value;
      }
    }); } catch(error) {
      try { if(previousUndo===null)native.removeItem(UNDO);else native.setItem(UNDO,previousUndo); } catch {}
      throw error;
    }
    return prepared;
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
  // Short answers: tolerant comparison with the accepted and rejected forms written in the content.
  const ANSWER_STOP=new Set(['le','la','les','l','un','une','des','du','de','d','au','aux','a','an','the','et','and']);
  const ANSWER_FILLER=new Set(['il','elle','on','je','j','y','c','ca','cela','est','sont','fait','font','egal','egale','reste','restera','recoit','rend','rendre','doit','faut','resultat','reponse','total','trouve','en','tout','it','is','are','answer']);
  const ANSWER_UNIT={francs:'f',franc:'f',fcfa:'f',cfa:'f',frs:'f'};
  function numberText(s, lang='fr') {
    let t=String(s??'').replace(/−/g,'-').replace(/([+-])\s+(?=\d)/g,'$1');
    t=t.replace(/\b\d{1,3}(?:[ \u00a0\u202f]\d{3})+\b/g,m=>m.replace(/\s/g,''));
    const groups=lang==='en'?/\b\d{1,3}(?:,\d{3})+(?:\.\d+)?\b/g:/\b\d{1,3}(?:\.\d{3})+\b/g;
    t=t.replace(groups,m=>m.replace(lang==='en'?/,/g:/\./g,''));
    return t.replace(/(\d),(\d)/g,'$1.$2');
  }
  function parseNumber(s, lang='fr') {
    const raw=String(s??'').trim().replace(/−/g,'-').replace(/\s/g,'');
    const grouped=lang==='en'&&/^[+-]?\d{1,3}(?:,\d{3})+(?:\.\d+)?$/.test(raw);
    const t=grouped?raw.replace(/,/g,''):lang==='en'?raw:raw.replace(',','.');
    return /^[+-]?\d+(?:\.\d+)?$/.test(t)&&Number.isFinite(Number(t))?Number(t):NaN;
  }
  function answerTokens(s, {lang='fr'}={}){
    let t=String(s??'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[’‘`´]/g,"'").replace(/aujourd'?hui/g,'aujourdhui').replace(/²/g,'2').replace(/³/g,'3');
    t=numberText(t,lang);
    const canonical=w=>{
      if(ANSWER_UNIT[w])return ANSWER_UNIT[w];
      let token=w.replace(/^\+/,'');
      if(/^-?\d+(?:\.\d+)?$/.test(token)){
        const negative=token.startsWith('-');let [whole,decimal='']=token.replace(/^-/,'').split('.');
        whole=whole.replace(/^0+(?=\d)/,'');decimal=decimal.replace(/0+$/,'');
        token=(negative&&(whole!=='0'||decimal)?'-':'')+whole+(decimal?'.'+decimal:'');
      }
      return token;
    };
    const words=(t.match(/[+-]?\d+(?:[.\/]\d+)*(?![a-z0-9])|[a-z0-9]+|[<>=]/g)||[]).map(canonical),kept=words.filter(w=>!ANSWER_STOP.has(w));
    return kept.length?kept:words;
  }
  // Returns correct, wrong, number (right number, other words) or unknown. Unknown never means wrong.
  function matchAnswer(input,{accept=[],reject=[],prompt='',lang='fr'}={}){
    const tokens=s=>answerTokens(s,{lang}),A=accept.map(tokens).filter(x=>x.length),R=reject.map(tokens).filter(x=>x.length);
    const num=w=>/^-?\d+(?:[.\/]\d+)?$/.test(w),keep=new Set([...A,...R].flat()),context=new Set(tokens(prompt));
    const lean=c=>c.filter(w=>keep.has(w)||num(w)||!(ANSWER_FILLER.has(w)||context.has(w)));
    const all=tokens(input);if(!all.length)return 'unknown';
    const at=all.lastIndexOf('='),base=at>=0&&at<all.length-1?[all,all.slice(at+1)]:[all];
    const cands=[...base,...base.map(lean)].filter(c=>c.length),key=c=>c.join(' ');
    if(cands.some(c=>A.some(x=>key(x)===key(c))))return 'correct';
    if(cands.some(c=>R.some(x=>key(x)===key(c))))return 'wrong';
    const numeric=A.filter(x=>x.some(num));
    if(numeric.length&&numeric.every(x=>x.filter(num).length===1)){
      const last=lean(base[base.length-1]),n=last.filter(num);
      if(n.length===1){
        const same=numeric.filter(x=>x.find(num)===n[0]);
        if(!same.length)return 'wrong';
        const words=last.filter(w=>!num(w));
        return same.some(x=>words.every(w=>x.includes(w)))?'correct':'number';
      }
    }
    return 'unknown';
  }
  const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const read=(k,fallback)=>{try{return JSON.parse(storage.getItem(k))??fallback;}catch{return fallback;}};
  const isAdultSpace=()=>['PARENT','ENSEIGNANT','ADMIN'].includes(read('klassia_user',{})?.role);
  return {isAdultSpace,version:'15.0',matchAnswer,answerTokens,parseNumber,storage,exportBackup,prepareImport,restore,undoRestore,createProfile,selectProfile,renameProfile,append,shuffleOptions,registerRoutes,specialRoute,rendered,escape,
    profile:()=>{refresh();return {id:state.active,name:state.profiles[state.active].name};},profiles:()=>{refresh();return Object.entries(state.profiles).map(([id,p])=>({id,name:p.name}));},
    read,write:(k,v)=>storage.setItem(k,JSON.stringify(v))};
});
