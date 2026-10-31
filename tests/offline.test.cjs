const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),crypto=require('node:crypto');
async function install(failure){
 const old='klassia-v14-old',maps=new Map([[old,new Map([['saved','old']])]]),events={};
 const files=['app.js','data/content-u1.json','ms/index.html'].map(url=>({url,sha256:crypto.createHash('sha256').update(url).digest('hex')}));
 const ctx={self:{registration:{scope:'https://example.test/klassia/'},location:{origin:'https://example.test'},clients:{claim:async()=>{}},addEventListener:(e,fn)=>events[e]=fn},crypto:crypto.webcrypto,URL,Response,Promise,console,
 importScripts:()=>ctx.self.KLASSIA_RELEASE={version:'test-new',files},
 caches:{open:async key=>{if(!maps.has(key))maps.set(key,new Map());return {put:async(k,v)=>maps.get(key).set(String(k),v),match:async k=>maps.get(key).get(String(k))}},delete:async k=>maps.delete(k),keys:async()=>[...maps.keys()]},
 fetch:async url=>{const f=String(url).replace('https://example.test/klassia/','');if(failure==='network'&&f==='data/content-u1.json')throw Error('offline');return new Response(failure==='integrity'&&f==='app.js'?'wrong edition':f);}};
 vm.runInNewContext(fs.readFileSync(require.resolve('../service-worker.js'),'utf8'),ctx);let task;events.install({waitUntil:p=>task=p});let error;try{await task}catch(e){error=e}return {maps,error};
}
test('failed network installation removes incomplete release and preserves previous cache',async()=>{const r=await install('network');assert.ok(r.error);assert.ok(r.maps.has('klassia-v14-old'));assert.ok(!r.maps.has('klassia-v15-test-new'));});
test('hash mismatch never activates inconsistent edition',async()=>{const r=await install('integrity');assert.match(r.error.message,/incohérente/);assert.ok(r.maps.has('klassia-v14-old'));assert.ok(!r.maps.has('klassia-v15-test-new'));});
test('successful install retains every critical asset',async()=>{const r=await install();assert.equal(r.error,undefined);assert.equal(r.maps.get('klassia-v15-test-new').size,3);});
