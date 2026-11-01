const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{let p=path.join(root,decodeURIComponent(req.url.split('?')[0]));if(p.endsWith('/'))p+='index.html';try{res.setHeader('Content-Type',p.endsWith('.js')?'text/javascript':p.endsWith('.css')?'text/css':p.endsWith('.html')?'text/html':'application/json');res.end(fs.readFileSync(p));}catch{res.statusCode=404;res.end('404');}});
(async()=>{
 await new Promise(r=>server.listen(8768,r));
 const b=await chromium.launch({...(process.env.KLASSIA_CHROMIUM?{executablePath:process.env.KLASSIA_CHROMIUM}:{}),headless:true,args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--no-zygote','--single-process']});
 try{
  const ctx=await b.newContext({viewport:{width:320,height:844},serviceWorkers:'block'});
  await ctx.addInitScript(()=>{
   const synth=new EventTarget();
   window.testVoices=[{name:'English default',lang:'en-US',default:true,localService:true},{name:'Français',lang:'fr-FR',default:false,localService:true}];
   window.spoken=[];window.cancellations=0;
   synth.getVoices=()=>window.testVoices;
   synth.cancel=()=>window.cancellations++;
   synth.speak=u=>{window.spoken.push({lang:u.lang,voice:u.voice?.lang,text:u.text});u.onstart?.();};
   Object.defineProperty(window,'speechSynthesis',{value:synth,configurable:true});
   Object.defineProperty(window,'SpeechSynthesisUtterance',{value:class{constructor(text){this.text=text;}},configurable:true});
  });
  const p=await ctx.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
  async function visit(route){await p.goto('http://localhost:8768'+route);await p.locator('.speech-control').first().waitFor();}
  async function say(lang,index=0){const btn=p.locator(`[data-speech-lang="${lang}"]`).nth(index);await btn.click();await p.waitForFunction(()=>spoken.length>0);const u=await p.evaluate(()=>spoken.at(-1));assert.equal(u.lang.split('-')[0],lang.split('-')[0]);assert.equal(u.voice,u.lang);await p.evaluate(()=>spoken=[]);return u;}
  for(const route of ['/?unit=U4#lesson:FR-U4-L1','/?unit=U1#lesson:MA-U1-L2','/sil/#lesson:SIL-U1-L03','/ce1/#lesson:CE1-U1-L01']){await visit(route);await say('fr-FR');}
  for(const route of ['/?unit=U1#lesson:EN-U1-L1','/sil/#lesson:SIL-U1-L02','/sil/#lesson:SIL-U1-P05','/ce1/#lesson:CE1-U1-L02']){await visit(route);const spoken=await say('en-GB');assert.ok(!spoken.text.includes('Séquence pilote conservée'));}
  for(const g of ['ms','gs']){await visit(`/${g}/?theme=T1#domain:LC:0`);await say('fr-FR');await say('en-GB');assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,g+' speech overflow');}
  await visit('/?unit=U4#lesson:FR-U4-L3');const story=await say('fr-FR',1);assert.match(story.text,/Le banc de la classe/);
  // Voice lists may become available only after the initial user click.
  await p.evaluate(()=>{testVoices=[];spoken=[];});await p.locator('.speech-control').first().click();
  await p.evaluate(()=>{testVoices=[{name:'Français différé',lang:'fr-FR',localService:true}];speechSynthesis.dispatchEvent(new Event('voiceschanged'));});
  await p.waitForFunction(()=>spoken.length===1);assert.equal(await p.evaluate(()=>spoken[0].voice),'fr-FR');
  // A device with only English must show a clear remedy and never speak French through English.
  await p.evaluate(()=>{testVoices=[{name:'English only',lang:'en-US',default:true}];spoken=[];});await p.locator('.speech-control').first().click();
  await p.locator('.speech-status').first().filter({hasText:'Aucune voix française disponible'}).waitFor();assert.equal(await p.evaluate(()=>spoken.length),0);
  // Stop while enumeration is pending, then supply voices: no delayed reading.
  await p.evaluate(()=>testVoices=[]);await p.locator('.speech-control').first().click();await p.locator('.speech-stop').first().click();
  await p.evaluate(()=>{testVoices=[{name:'Français',lang:'fr-FR'}];speechSynthesis.dispatchEvent(new Event('voiceschanged'));});await p.waitForTimeout(100);assert.equal(await p.evaluate(()=>spoken.length),0);
  await p.evaluate(()=>testVoices=[]);await p.locator('.speech-control').first().click();await p.evaluate(()=>location.hash='#home');await p.getByRole('heading',{name:/Bonjour/}).waitFor();
  await p.evaluate(()=>{testVoices=[{name:'Français',lang:'fr-FR'}];speechSynthesis.dispatchEvent(new Event('voiceschanged'));});assert.equal(await p.evaluate(()=>spoken.length),0);
  for(const route of ['/ms/#domain:LC:6','/gs/#domain:LC:5','/sil/#lesson:SIL-U1-L10','/ce1/#lesson:CE1-U1-L10','/?unit=U1#lesson:BA-U1-L1']){await p.goto('http://localhost:8768'+route);await p.locator('.bassa-learning').waitFor();assert.equal(await p.locator('.speech-control').count(),0,'No French/English synthesis of Bassa: '+route);}
  // Every rewritten lesson must render its supplied support and correction controls.
  let count=0;
  for(let u=4;u<=8;u++)for(const l of JSON.parse(fs.readFileSync(path.join(root,`data/content-u${u}.json`))).subjects.find(s=>s.id==='FR').lessons){
   await visit(`/?unit=U${u}#lesson:${l.id}`);assert.equal(await p.locator('.exercise-card').count(),2,l.id);assert.ok((await p.locator('.manual-section-body').first().innerText()).length>80,l.id);count++;
  }
  assert.equal(count,39);assert.deepEqual(errors,[]);
  console.log('PASS speech language/voice across five classes, delayed and missing voices, cancellation, Bassa exclusion, 39 French supports');
 }finally{await b.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exit(1);});
