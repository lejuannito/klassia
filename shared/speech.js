/* Device speech: never fall back silently to a voice in another language. */
(function(root,factory){
 if(typeof module==='object'&&module.exports)module.exports=factory();
 else root.Klassia.speech=factory(root);
})(typeof window!=='undefined'?window:globalThis,env=>{
 'use strict';
 const tag=s=>String(s||'').replaceAll('_','-').toLowerCase();
 function selectVoice(voices,lang){
  const target=tag(lang),base=target.split('-')[0];
  const matching=voices.filter(v=>tag(v.lang).split('-')[0]===base);
  const score=v=>(tag(v.lang)===target?4:0)+(v.localService?2:0)+(v.default?1:0);
  return matching.sort((a,b)=>score(b)-score(a))[0]||null;
 }
 let generation=0,activeStatus=null,releaseWait=null;
 function stop(){
  generation++;releaseWait?.();releaseWait=null;
  env?.speechSynthesis?.cancel();
  if(activeStatus?.isConnected)activeStatus.textContent='Lecture arrêtée / Reading stopped.';
  activeStatus=null;
 }
 function waitForVoices(lang){
  const synth=env.speechSynthesis;
  if(selectVoice(synth.getVoices(),lang))return Promise.resolve();
  return new Promise(resolve=>{
   let timer;
   function done(){clearTimeout(timer);synth.removeEventListener('voiceschanged',changed);releaseWait=null;resolve();}
   function changed(){if(selectVoice(synth.getVoices(),lang))done();}
   releaseWait=done;synth.addEventListener('voiceschanged',changed);
   timer=setTimeout(done,1800);changed();
  });
 }
 function add(container,text,lang){
  if(!container||!text)return;
  const wrap=env.document.createElement('div');wrap.className='speech-tools';
  const button=env.document.createElement('button'),cancel=env.document.createElement('button'),status=env.document.createElement('p');
  const english=tag(lang).startsWith('en');
  button.className='classBtn speech-control';button.dataset.speechLang=lang;
  button.textContent=english?'🔊 Listen in English':'🔊 Écouter en français';button.lang=english?'en':'fr';
  cancel.textContent='■ Arrêter / Stop';cancel.className='classBtn speech-stop';
  status.className='speech-status';status.setAttribute('role','status');
  wrap.append(button,cancel,status);container.prepend(wrap);
  if(!env.speechSynthesis||!env.SpeechSynthesisUtterance){
   button.disabled=true;cancel.disabled=true;
   status.textContent='Lecture vocale indisponible dans ce navigateur / Device speech unavailable.';return;
  }
  cancel.onclick=stop;
  button.onclick=async()=>{
   stop();const token=generation;activeStatus=status;
   status.textContent=english?'Looking for an English voice…':'Recherche d’une voix française…';
   await waitForVoices(lang);
   if(token!==generation||!wrap.isConnected)return;
   const voice=selectVoice(env.speechSynthesis.getVoices(),lang);
   if(!voice){
    status.textContent=english?
     'No English voice is available. Enable an English text-to-speech voice on your device, then try again.':
     'Aucune voix française disponible. Activez ou téléchargez une voix française dans les réglages de synthèse vocale de l’appareil, puis réessayez.';
    return;
   }
   const utterance=new env.SpeechSynthesisUtterance(text);
   utterance.voice=voice;utterance.lang=voice.lang;utterance.rate=.85;
   utterance.onstart=()=>{if(token===generation)status.textContent=(english?'English voice: ':'Voix française : ')+voice.name+(voice.localService?(english?' · on device':' · sur l’appareil'):(english?' · may require a connection':' · connexion éventuellement nécessaire'));};
   utterance.onend=()=>{if(token===generation){status.textContent=english?'Reading finished.':'Lecture terminée.';activeStatus=null;}};
   utterance.onerror=()=>{if(token===generation)status.textContent=english?'Reading unavailable. Check your device voice settings and try again.':'Lecture indisponible. Vérifiez les réglages vocaux de l’appareil puis réessayez.';};
   try{env.speechSynthesis.speak(utterance);}catch{utterance.onerror();}
  };
 }
 if(env){env.addEventListener('hashchange',stop);env.addEventListener('pagehide',stop);env.document.addEventListener('klassia:render',stop);}
 return {selectVoice,add,stop};
});
