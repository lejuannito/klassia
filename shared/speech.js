/* Device speech and pre-recorded clips have separate controls and labels. */
(function(root,factory){
 if(typeof module==='object'&&module.exports)module.exports=factory();
 else root.Klassia.speech=factory(root);
})(typeof window!=='undefined'?window:globalThis,env=>{
 'use strict';
 const tag = value => String(value||'').replaceAll('_','-').toLowerCase();
 const language = value => tag(value).split('-')[0];
 const settingsKey = 'klassia_device_voices_v1';
 const voiceId = voice => voice.voiceURI || JSON.stringify([voice.name,voice.lang,voice.localService]);
 const synth = env?.speechSynthesis;
 const doc = env?.document;
 const copy = {
  fr: {
   play:'🔊 Écouter en français', device:'Voix de cet appareil', settings:'Choisir et essayer une voix',
   choice:'Voix française', missingShort:'aucune voix listée', offlineShort:'aucune voix locale', automatic:'Choix automatique', preview:'Écouter un exemple',
   sample:'Bonjour. Choisis la voix que tu comprends le mieux.',
   missing:'Aucune voix française n’est déclarée. Activez ou téléchargez une voix française dans les réglages de synthèse vocale de l’appareil.',
   missingSelection:'La voix enregistrée est indisponible. Le choix automatique est utilisé.',
   offline:'Aucune voix française locale n’est déclarée pour le mode hors connexion.',
   unavailable:'Lecture vocale indisponible dans ce navigateur.',
   searching:'Recherche d’une voix française…',
   local:'sur l’appareil', network:'connexion éventuellement nécessaire',
   requested:'Lecture demandée en français · voix choisie par l’appareil.',
   done:'Lecture terminée.',
   error:'Lecture française impossible. Activez ou téléchargez une voix française dans les réglages de synthèse vocale de l’appareil, puis réessayez.',
   clip:'Extrait Klassia hors connexion · voix de synthèse'
  },
  en: {
   play:'🔊 Listen in English', device:'Device voice', settings:'Choose and try a voice',
   choice:'English voice', missingShort:'no voices listed', offlineShort:'no local voices', automatic:'Automatic choice', preview:'Play a sample',
   sample:'Hello. Choose the voice you understand best.',
   missing:'No English voice is listed. Enable or download an English text-to-speech voice in your device settings.',
   missingSelection:'Your saved voice is unavailable. An available voice will be selected.',
   offline:'No local English voice is listed for offline use.',
   unavailable:'Device speech unavailable in this browser.',
   searching:'Looking for an English voice…',
   local:'on device', network:'may require a connection',
   requested:'Reading requested in English · device voice.',
   done:'Reading finished.',
   error:'Reading unavailable. Enable or download an English text-to-speech voice in your device settings, then try again.',
   clip:'Offline Klassia clip · synthetic voice'
  }
 };
 function orderedVoices(voices,lang) {
  const target=tag(lang), base=language(lang);
  const score=voice=>(tag(voice.lang)===target?4:0)+(voice.localService?2:0)+(voice.default?1:0);
  return voices.filter(voice=>language(voice.lang)===base).sort((a,b)=>score(b)-score(a));
 }
 function selectVoice(voices,lang) {
  return orderedVoices(voices,lang)[0] || null;
 }
 let preferences = {};
 try { preferences = JSON.parse(env?.localStorage.getItem(settingsKey) || '{}') || {}; } catch { /* Use automatic selection. */ }
 function savePreference(lang,value) {
  preferences = {...preferences,[language(lang)]:value};
  try { env.localStorage.setItem(settingsKey,JSON.stringify(preferences)); } catch { /* Keep the choice for this page. */ }
 }
 function available(voices) {
  return env.navigator.onLine===false ? voices.filter(voice=>voice.localService) : voices;
 }
 function refreshPicker(picker) {
  const lang = picker.dataset.voicePicker, t = copy[language(lang)];
  const voices = orderedVoices(synth.getVoices(),lang);
  const usable = available(voices);
  const pref = preferences[language(lang)];
  const select = picker.querySelector('select');
  select.replaceChildren(new env.Option(t.automatic,''));
  for (const voice of voices) {
   const option = new env.Option(voice.name+' ('+voice.lang+') · '+(voice.localService?t.local:t.network),voiceId(voice));
   option.disabled = env.navigator.onLine===false && !voice.localService;
   select.add(option);
  }
  select.value = usable.some(voice=>voiceId(voice)===pref) ? pref : '';
  select.disabled = !usable.length;
  const cue = !voices.length ? t.missingShort : !usable.length ? t.offlineShort : '';
  picker.querySelector('summary').textContent = t.settings+(cue?' · '+cue:'');
  picker.querySelector('.speech-availability').textContent = !voices.length ? t.missing
   : !usable.length ? t.offline
   : pref && !select.value ? t.missingSelection : '';
 }
 function refreshPickers() {
  doc.querySelectorAll('[data-voice-picker]').forEach(refreshPicker);
 }

 let generation=0,activeStatus=null,releaseWait=null,clearStart=null,activeClip=null;
 function pauseClip() {
  activeClip?.pause();
  activeClip = null;
 }
 function stop() {
  generation++;releaseWait?.();releaseWait=null;clearStart?.();clearStart=null;
  synth?.cancel();
  if(activeStatus?.isConnected)activeStatus.textContent='Lecture arrêtée / Reading stopped.';
  activeStatus=null;
 }
 function stopAll() {
  pauseClip();
  stop();
 }
 function waitForVoices(lang) {
  if(selectVoice(synth.getVoices(),lang))return Promise.resolve();
  return new Promise(resolve=>{
   let timer;
   function done(){clearTimeout(timer);synth.removeEventListener('voiceschanged',changed);releaseWait=null;resolve();}
   function changed(){if(selectVoice(synth.getVoices(),lang))done();}
   releaseWait=done;synth.addEventListener('voiceschanged',changed);
   timer=setTimeout(done,1800);changed();
  });
 }
 async function speak(wrap,status,text,lang) {
  stopAll();
  const token=generation, t=copy[language(lang)];
  activeStatus=status;
  status.textContent=t.searching;
  await waitForVoices(lang);
  if(token!==generation||!wrap.isConnected)return;
  const voices=available(orderedVoices(synth.getVoices(),lang));
  const voice=voices.find(candidate=>voiceId(candidate)===preferences[language(lang)]) || voices[0];
  const utterance=new env.SpeechSynthesisUtterance(text);
  // Some mobile engines report an incomplete list. Request the language without assigning an unrelated voice.
  if(voice)utterance.voice=voice;
  utterance.lang=voice?.lang||lang;
  utterance.rate=.85;
  let finished=false;
  const timer=setTimeout(()=>{if(token===generation){utterance.onerror();synth.cancel();}},10000);
  clearStart=()=>clearTimeout(timer);
  function finish(message) {
   if(token!==generation||finished)return;
   finished=true;clearStart?.();clearStart=null;activeStatus=null;
   status.textContent=message;
  }
  utterance.onstart=()=>{
   if(token!==generation||finished)return;
   clearStart?.();clearStart=null;
   status.textContent=voice?t.choice+' · '+voice.name+' · '+(voice.localService?t.local:t.network):t.requested;
  };
  utterance.onend=()=>finish(t.done);
  utterance.onerror=()=>finish(t.error);
  try{synth.speak(utterance);}catch{utterance.onerror();}
 }

 function add(container,text,lang) {
  if(!container||!text)return;
  const base=language(lang),t=copy[base];
  if(!t)return;
  const wrap=doc.createElement('div');
  wrap.className='speech-tools';
  wrap.lang=base;
  const title=doc.createElement('p');
  title.className='speech-source';
  title.textContent=t.device;
  const button=doc.createElement('button'),cancel=doc.createElement('button'),status=doc.createElement('p');
  button.type=cancel.type='button';
  button.className='classBtn speech-control';button.dataset.speechLang=lang;
  button.textContent=t.play;
  cancel.textContent='■ Arrêter / Stop';cancel.className='classBtn speech-stop';
  status.className='speech-status';status.setAttribute('role','status');
  wrap.append(title,button,cancel,status);
  container.prepend(wrap);
  if(!synth||!env.SpeechSynthesisUtterance){
   button.disabled=true;cancel.disabled=true;status.textContent=t.unavailable;
   return;
  }

  const picker=doc.createElement('details');
  picker.className='speech-picker';picker.dataset.voicePicker=lang;
  const summary=doc.createElement('summary'),label=doc.createElement('label'),select=doc.createElement('select');
  const preview=doc.createElement('button'),availability=doc.createElement('p');
  summary.textContent=t.settings;
  label.append(t.choice+' ',select);
  preview.type='button';preview.className='classBtn speech-preview';preview.textContent=t.preview;
  availability.className='speech-availability';
  availability.setAttribute('role','status');
  picker.append(summary,label,preview,availability);
  wrap.insertBefore(picker,status);
  picker.ontoggle=()=>{if(picker.open)refreshPicker(picker);};
  select.onfocus=()=>refreshPicker(picker);
  select.onchange=()=>{savePreference(lang,select.value);refreshPickers();};
  preview.onclick=()=>speak(wrap,status,t.sample,lang);
  button.onclick=()=>speak(wrap,status,text,lang);
  cancel.onclick=stop;
  refreshPicker(picker);
 }

 function clip(src,lang) {
  if(!src)return '';
  const base=language(lang), E=env.Klassia.escape, label=copy[base].clip;
  return '<div class="lesson-audio" lang="'+base+'"><p>'+label+'</p>'+
   '<audio aria-label="'+label+'" controls preload="none" crossorigin="anonymous" src="'+E(src)+'"></audio></div>';
 }
 if(env) {
  synth?.addEventListener('voiceschanged',refreshPickers);
  env.addEventListener('online',refreshPickers);
  env.addEventListener('offline',refreshPickers);
  env.addEventListener('hashchange',stopAll);
  env.addEventListener('pagehide',stopAll);
  doc.addEventListener('klassia:render',stopAll);
  doc.addEventListener('play',event=>{
   const audio=event.target;
   if(!audio.matches?.('.lesson-audio audio')||audio.paused)return;
   if(audio!==activeClip)pauseClip();
   activeClip=audio;
   stop();
  },true);
 }
 return {selectVoice,add,stop,clip};
});
