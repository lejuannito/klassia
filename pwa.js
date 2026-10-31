(() => {
'use strict';const root=document.getElementById('pwaTools');if(!root)return;
const base=new URL('.',document.currentScript.src);let registration;
function show(message,action,label){root.replaceChildren();const bar=document.createElement('div');bar.className='offline-state offline-tools';const text=document.createElement('span');text.textContent=message;bar.append(text);if(action){const b=document.createElement('button');b.textContent=label;b.onclick=action;bar.append(b);}root.append(bar);}
function status(worker){return new Promise(resolve=>{if(!worker)return resolve(null);const c=new MessageChannel(),timer=setTimeout(()=>resolve(null),5000);c.port1.onmessage=e=>{clearTimeout(timer);resolve(e.data)};worker.postMessage({type:'OFFLINE_STATUS'},[c.port2]);});}
async function refresh(){
 if(registration?.waiting){show('Nouvelle édition téléchargée et vérifiée.',()=>{registration.waiting.postMessage({type:'ACTIVATE_RELEASE'});},'Recharger avec la nouvelle édition');return;}
 const s=await status(registration?.active);if(s?.ready)show('CE2 et MS disponibles hors connexion · édition '+s.version.slice(0,8),()=>registration.update().catch(()=>show('Mise à jour impossible. L’édition téléchargée reste disponible.')),'Vérifier les mises à jour');
 else show('Téléchargement incomplet : le mode hors connexion n’est pas encore garanti.',()=>location.reload(),'Réessayer');
}
if(!('serviceWorker'in navigator)){show('Le mode hors connexion nécessite un navigateur compatible.');return;}
let reloading=false;navigator.serviceWorker.addEventListener('controllerchange',()=>{if(registration?.active&&navigator.serviceWorker.controller&&!reloading){reloading=true;location.reload();}});
window.addEventListener('load',async()=>{
 show('Préparation du CE2 et de la MS hors connexion…');
 try{registration=await navigator.serviceWorker.register(new URL('service-worker.js',base),{scope:base.pathname,updateViaCache:'none'});
  registration.addEventListener('updatefound',()=>{const w=registration.installing;w?.addEventListener('statechange',()=>{if(w.state==='installed'||w.state==='redundant')refresh();});});
  if(registration.installing){const w=registration.installing;w.addEventListener('statechange',()=>{if(w.state==='installed'||w.state==='redundant')refresh();});}else await refresh();
 }catch{show('Téléchargement interrompu. Les contenus déjà installés sont conservés.',()=>location.reload(),'Réessayer');}
});
window.addEventListener('offline',refresh);window.addEventListener('online',refresh);
window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();const b=document.createElement('button');b.textContent='Installer Klassia';b.onclick=()=>event.prompt();root.append(b);});
})();
