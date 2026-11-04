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
 let generation=0,activeStatus=null,releaseWait=null,clearStart=null;
 function stop(){
  generation++;releaseWait?.();releaseWait=null;clearStart?.();clearStart=null;
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
   const utterance=new env.SpeechSynthesisUtterance(text);
   // An incomplete voice list does not establish that the requested language is unavailable.
   // Leave voice unset so the engine can resolve lang; never assign another language.
   if(voice)utterance.voice=voice;
   utterance.lang=voice?voice.lang:lang;utterance.rate=.85;
   const timer=setTimeout(()=>{if(token===generation){utterance.onerror();env.speechSynthesis.cancel();}},10000);
   clearStart=()=>clearTimeout(timer);
   let finished=false;
   utterance.onstart=()=>{
    if(token!==generation||finished)return;
    clearStart?.();clearStart=null;
    status.textContent=voice?(english?'English voice: ':'Voix française : ')+voice.name+(voice.localService?(english?' · on device':' · sur l’appareil'):(english?' · may require a connection':' · connexion éventuellement nécessaire')):
     (english?'Reading requested in English · device voice.':'Lecture demandée en français · voix choisie par l’appareil.');
   };
   utterance.onend=()=>{if(token===generation&&!finished){finished=true;clearStart?.();clearStart=null;status.textContent=english?'Reading finished.':'Lecture terminée.';activeStatus=null;}};
   utterance.onerror=()=>{
    if(token!==generation||finished)return;
    finished=true;clearStart?.();clearStart=null;activeStatus=null;
    status.textContent=english?
     'Reading unavailable. Enable or download an English text-to-speech voice in your device settings, then try again.':
     'Lecture française impossible. Activez ou téléchargez une voix française dans les réglages de synthèse vocale de l’appareil, puis réessayez.';
   };
   try{env.speechSynthesis.speak(utterance);}catch{utterance.onerror();}
  };
 }
 if(env){env.addEventListener('hashchange',stop);env.addEventListener('pagehide',stop);env.document.addEventListener('klassia:render',stop);}
 return {selectVoice,add,stop};
});
