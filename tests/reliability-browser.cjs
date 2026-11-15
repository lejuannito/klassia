const assert=require('node:assert/strict'),fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),base='http://localhost:8771';
const types={'.js':'text/javascript','.css':'text/css','.html':'text/html','.json':'application/json','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{
 const name=decodeURIComponent(new URL(req.url,base).pathname),file=path.resolve(root,'.'+name+(name.endsWith('/')?'index.html':''));
 if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 try{res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));}catch{res.writeHead(404).end();}
});
const lessons=[];
for(const grade of ['class1','class3','class4'])for(const name of fs.readdirSync(path.join(root,grade,'data')).filter(x=>x.endsWith('.json'))){
 const walk=x=>{if(Array.isArray(x))x.forEach(walk);else if(x&&typeof x==='object'){if(Array.isArray(x.practice))lessons.push({grade,...x});Object.values(x).forEach(walk);}};
 walk(JSON.parse(fs.readFileSync(path.join(root,grade,'data',name),'utf8')));
}
const repeated=lessons.flatMap(l=>l.practice.map((p,j)=>({l,p,j}))).filter(({p})=>{
 const values=p.type==='order'?p.items:p.type==='match'?p.pairs.map(x=>x[1]):[];
 return new Set(values).size<values.length;
});
async function openProfiles(p){
 await p.evaluate(()=>Klassia.write('klassia_user',{role:'PARENT'}));
 await p.locator('[data-profiles]').first().evaluate(el=>el.click());
 await p.locator('#profilesDialog').waitFor();
}
(async()=>{
 await new Promise(resolve=>server.listen(8771,resolve));
 let browser;
 try{
  browser=await chromium.launch({headless:true,...(process.env.KLASSIA_CHROMIUM?{executablePath:process.env.KLASSIA_CHROMIUM}:{}),args:['--no-sandbox','--disable-dev-shm-usage']});
  const ctx=await browser.newContext({serviceWorkers:'block'});await require('./whole-lesson.cjs')(ctx);
  await ctx.addInitScript(()=>{Math.random=()=>0;Object.defineProperty(navigator,'storage',{configurable:true,value:{persisted:async()=>false,persist:async()=>window.persistenceGrant===true}});});
  const p=await ctx.newPage(),errors=[];p.setDefaultTimeout(10000);p.on('pageerror',e=>errors.push(e.message));
  assert.equal(repeated.length,8,'the eight affected corpus exercises are covered');
  for(const {l, p:exercise,j} of repeated){
   await p.goto(`${base}/${l.grade}/#lesson:${l.id}`);
   const box=p.locator(`[data-key="${l.grade.toUpperCase()}:${l.id}:entrainement:${j}"]`);await box.waitFor();
   const values=exercise.type==='order'?exercise.items:exercise.pairs.map(x=>x[1]);
   const equivalent=values.map((value,i)=>{const next=values.findIndex((v,k)=>v===value&&k!==i);return next>=0?next:i;});
   if(exercise.type==='order')for(const index of equivalent)await box.locator(`[data-order-pool] [data-item="${index}"]`).click();
   else for(let i=0;i<equivalent.length;i++)await box.locator(`select[data-slot="${i}"]`).selectOption(String(equivalent[i]));
   await box.locator('[data-ex-check]').click();assert.equal(await box.locator('[role=status]').getAttribute('data-verdict'),'correct',l.id);
   if(exercise.type==='match'){
    const wrong=values.findIndex(v=>v!==values[0]);await box.locator('select[data-slot="0"]').selectOption(String(wrong));
   }else{
    const first=box.locator('[data-order-answer] [data-item]').first();await first.click();await box.locator('[data-order-pool] [data-item]').click();
   }
   await box.locator('[data-ex-check]').click();assert.equal(await box.locator('[role=status]').getAttribute('data-verdict'),'wrong',l.id+' wrong answer');
  }
  console.log('PASS all eight corpus exercises accept interchangeable labels and still reject wrong answers');
  const mcq=lessons.find(l=>l.grade==='class4'&&l.practice.some(x=>x.type==='mcq'&&x.choices.length>1));
  await p.goto(`${base}/class4/#lesson:${mcq.id}`);
  const q=p.locator('[data-ex=mcq]').first();await q.waitFor();const solution=JSON.parse(await q.getAttribute('data-solution')).choice;
  assert.notEqual(await q.locator('input').first().inputValue(),String(solution),'deterministic shuffle moves the correct answer');
  await q.locator(`input[value="${solution}"]`).check();await q.locator('[data-ex-check]').click();assert.equal(await q.locator('[role=status]').getAttribute('data-verdict'),'correct');
  const wrongOption=q.locator(`input:not([value="${solution}"])`).first();await wrongOption.check();await q.locator('[data-ex-check]').click();assert.equal(await q.locator('[role=status]').getAttribute('data-verdict'),'wrong');
  await p.evaluate(()=>{const fixture=document.createElement('section');fixture.id='numberFixture';fixture.innerHTML=Klassia.exercises.html({type:'number',answer:1000},'test-number',true)+Klassia.correction.html('test-answer','<p>1000</p>',{en:true,check:{accept:['1000']}});document.body.append(fixture);});
  const number=p.locator('#numberFixture [data-ex=number]');await number.locator('input').fill('1,000');await number.locator('[data-ex-check]').click();assert.equal(await number.locator('[role=status]').getAttribute('data-verdict'),'correct');
  const answer=p.locator('#numberFixture [data-correction]');await answer.locator('textarea').fill('1,000');await answer.locator('[type=submit]').click();assert.equal(await answer.locator('.attempt-status').getAttribute('data-verdict'),'correct');
  console.log('PASS shuffled QCM keep stable answers; English grouped numbers work in both exercise formats');
  const backup=await p.evaluate(()=>{Klassia.renameProfile('Awa');Klassia.write('klassia_class4_progress_v1',{first:'A'});Klassia.write('klassia_home_words_v1',{mother:'mot'});const backup=Klassia.exportBackup();Klassia.createProfile('Bobo');Klassia.write('klassia_class1_progress_v1',{keep:'EC'});return backup;});
  await openProfiles(p);assert.equal(await p.locator('#importMode').inputValue(),'new');
  await p.locator('#storagePersistence').filter({hasText:'not granted'}).waitFor();await p.locator('#requestPersistence').click();await p.locator('#storagePersistence').filter({hasText:'not granted'}).waitFor();
  await p.evaluate(()=>window.persistenceGrant=true);await p.locator('#requestPersistence').click();await p.locator('#storagePersistence').filter({hasText:'granted in this browser'}).waitFor();
  assert.match(await p.locator('#profilesDialog').innerText(),/not included/);assert.equal(await p.locator('#exportProfile').isEnabled(),true);
  const imported=p.waitForEvent('load');p.once('dialog',dialog=>dialog.accept());await p.locator('#importProfile').setInputFiles({name:'Awa.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(backup))});await imported;
  await p.waitForFunction(()=>window.Klassia?.profile().name==='Awa');
  assert.equal(await p.evaluate(()=>Klassia.profiles().length),3);assert.equal(await p.evaluate(()=>Klassia.read('klassia_home_words_v1',{}).mother),'mot');
  const bobo=await p.evaluate(()=>Klassia.profiles().find(x=>x.name==='Bobo').id);await p.evaluate(id=>Klassia.selectProfile(id),bobo);assert.equal(await p.evaluate(()=>Klassia.read('klassia_class1_progress_v1',{}).keep),'EC');
  await openProfiles(p);const undone=p.waitForEvent('load');p.once('dialog',dialog=>dialog.accept());await p.locator('#undoImport').click();await undone;await p.waitForFunction(()=>window.Klassia?.profiles().length===2);
  assert.equal(await p.evaluate(()=>Klassia.profile().name),'Bobo');
  console.log('PASS English profile dialog: persistence denied/granted, new-profile import, other child preserved and undo');
  assert.deepEqual(errors,[]);await ctx.close();
  const unavailable=await browser.newContext({serviceWorkers:'block'});await unavailable.addInitScript(()=>Object.defineProperty(navigator,'storage',{value:undefined}));
  const f=await unavailable.newPage();await f.goto(base+'/sil/');await f.locator('[data-profiles]').first().waitFor();await openProfiles(f);
  assert.equal(await f.locator('#requestPersistence').isDisabled(),true);assert.equal(await f.locator('#exportProfile').isEnabled(),true);await unavailable.close();
  console.log('PASS unsupported persistence leaves manual backup available');
 }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e);process.exitCode=1;});
