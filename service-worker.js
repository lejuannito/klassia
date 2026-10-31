/* Release-level atomic offline installation. A failed release never replaces the old one. */
importScripts('./precache-manifest.js');
const CACHE_NAME='klassia-v15-'+self.KLASSIA_RELEASE.version;
const urls=self.KLASSIA_RELEASE.files;
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const cache=await caches.open(CACHE_NAME);
 try{
  // Bounded concurrency avoids opening dozens of connections on a mobile link.
  let index=0;
  const workers=await Promise.allSettled(Array.from({length:4},async()=>{
   while(index<urls.length){const file=urls[index++],response=await fetch(new URL(file.url,self.registration.scope),{cache:'reload'});
    if(!response.ok)throw Error('Téléchargement incomplet : '+file.url);
    const bytes=await response.clone().arrayBuffer();const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');
    if(hash!==file.sha256)throw Error('Version incohérente : '+file.url);
    await cache.put(new URL(file.url,self.registration.scope),response);
   }
  }));
  const failed=workers.find(x=>x.status==='rejected');if(failed)throw failed.reason;
 }catch(error){await caches.delete(CACHE_NAME);throw error;}
 // Do not force takeover in the middle of a lesson. User chooses a safe reload.
})()));
self.addEventListener('message',event=>{
 if(event.data?.type==='ACTIVATE_RELEASE')self.skipWaiting();
 if(event.data?.type==='OFFLINE_STATUS')event.waitUntil((async()=>{
  const cache=await caches.open(CACHE_NAME);let count=0;
  for(const f of urls)if(await cache.match(new URL(f.url,self.registration.scope)))count++;
  event.ports[0]?.postMessage({ready:count===urls.length,count,total:urls.length,version:self.KLASSIA_RELEASE.version});
 })());
});
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 // Installation has already verified every critical file. Keep one previous release
 // for recovery, but never mix it with current code in fetch handling.
 const keys=(await caches.keys()).filter(k=>k.startsWith('klassia-')&&k!==CACHE_NAME);
 await Promise.all(keys.slice(0,-1).map(k=>caches.delete(k)));
 await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);if(event.request.method!=='GET'||url.origin!==self.location.origin||!url.pathname.startsWith(new URL(self.registration.scope).pathname))return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE_NAME);const clean=new URL(url);clean.search='';clean.hash='';
  if(clean.pathname.endsWith('/'))clean.pathname+='index.html';
  const cached=await cache.match(clean);if(cached)return cached;
  try{return await fetch(event.request);}catch{return new Response('Cette ressource ne fait pas partie de l’édition téléchargée. Reconnectez-vous pour la mettre à jour.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});}
 })());
});
