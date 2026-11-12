const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost');let name=decodeURIComponent(url.pathname);
 if(!name.startsWith('/klassia/')){res.writeHead(404).end();return;}
 name=name.slice('/klassia/'.length);if(!name||name.endsWith('/'))name+='index.html';
 const file=path.resolve(root,name);if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 try{res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.html')?'text/html':file.endsWith('.json')?'application/json':'application/octet-stream');res.end(fs.readFileSync(file));}catch{res.writeHead(404).end();}
});
(async()=>{
 await new Promise(r=>server.listen(8770,'127.0.0.1',r));let b;
 try{
 b=await chromium.launch({...(process.env.KLASSIA_CHROMIUM?{executablePath:process.env.KLASSIA_CHROMIUM}:{}),headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 const ctx=await b.newContext({viewport:{width:320,height:844},serviceWorkers:'allow'});await require('./offline-all.cjs')(ctx);const p=await ctx.newPage(),errors=[];
 p.setDefaultTimeout(15000);p.on('pageerror',e=>errors.push(e.message));const base='http://127.0.0.1:8770/klassia/';
 async function query(q){await p.locator('[name=q]').fill(q);await p.locator('button[type=submit]').click();await p.waitForFunction(()=>!document.querySelector('#searchStatus').textContent.includes('Recherche dans'));}
 await p.goto(base+'search.html');await query('les états de l’eau');
 assert.match(await p.locator('#searchResults h2').first().innerText(),/changements d’état/);
 const exact=await p.locator('#searchResults h2').allTextContents();await query("LES ETATS DE L'EAU");assert.deepEqual(await p.locator('#searchResults h2').allTextContents(),exact);
 await p.locator('#searchResults h2 a').first().click();await p.locator('.lesson-header h1').waitFor();
 assert.match(p.url(),/unit=U2/);assert.match(p.url(),/#lesson:SC-U2-L5/);
 await p.locator('[data-search-return]').click();await p.locator('#searchResults li').first().waitFor();assert.equal(await p.locator('[name=q]').inputValue(),"LES ETATS DE L'EAU");
 await query('école');
 for(const grade of ['MS','GS','SIL','CE1','CE2']){
  await p.locator('[name=grade]').selectOption(grade);await p.waitForFunction(g=>[...document.querySelectorAll('#searchResults .search-meta')].length>0&&[...document.querySelectorAll('#searchResults .search-meta')].every(n=>n.textContent.startsWith(g+' ·')),grade);
  const target=new URL(await p.locator('#searchResults h2 a').first().getAttribute('href'));
  await p.locator('#searchResults h2 a').first().click();await p.locator('[data-search-return]').waitFor();
  assert.equal(new URL(p.url()).hash,target.hash);assert.equal(new URL(p.url()).searchParams.get('theme'),target.searchParams.get('theme'));
  if(['MS','GS'].includes(grade))assert.equal(await p.locator('.activityCard').count(),1);
  else if(['SIL','CE1'].includes(grade))assert.equal(await p.locator('[data-lesson]').getAttribute('data-lesson'),decodeURIComponent(target.hash.slice(8)));
  else await p.locator('.lesson-header h1').waitFor();
  assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,grade+' mobile overflow');
  await p.locator('[data-search-return]').click();await p.locator('#searchResults li').first().waitFor();assert.equal(await p.locator('[name=grade]').inputValue(),grade);
 }
 await p.locator('[name=grade]').selectOption('');await query('école');
 assert.ok(await p.locator('#searchResults li').count()===30);await p.locator('#searchMore').click();assert.equal(await p.locator('#searchResults li').count(),60);
 const subject='Français';await p.locator('[name=subject]').selectOption(subject);
 await p.waitForFunction(s=>document.querySelectorAll('#searchResults li').length>0&&[...document.querySelectorAll('#searchResults .search-meta')].every(n=>n.textContent.endsWith(' · '+s)),subject);
 await p.reload();await p.locator('#searchResults li').first().waitFor();assert.equal(await p.locator('[name=subject]').inputValue(),subject);
 await p.locator('[name=subject]').selectOption('');await query('zzzintrouvable');assert.match(await p.locator('#searchStatus').innerText(),/Aucun résultat/);assert.equal(await p.locator('#searchResults li').count(),0);
 // Profiles/annotations never supply search terms.
 await p.evaluate(()=>localStorage.setItem('klassia_private_test','privéuniquexyz'));await query('privéuniquexyz');assert.equal(await p.locator('#searchResults li').count(),0);
 // A parent can open a CE2 result without the role guard redirecting to the dashboard.
 await p.goto(base);await p.locator('[data-profiles]').waitFor({state:'attached'});await p.evaluate(()=>Klassia.write('klassia_user',{role:'PARENT'}));
 await p.goto(base+'search.html?q=les+états+de+l’eau');await p.locator('#searchResults h2 a').first().click();await p.locator('.lesson-header h1').waitFor();
 await p.locator('[data-search-return]').click();await p.locator('#searchResults li').first().waitFor();
 await p.locator('#pwaTools').filter({hasText:'disponibles hors connexion'}).waitFor();
 await ctx.setOffline(true);await p.reload();await p.locator('#searchResults li').first().waitFor();
 await p.locator('#searchResults h2 a').first().click();await p.locator('.lesson-header h1').waitFor();
 await p.locator('[data-search-return]').click();await p.locator('#searchResults li').first().waitFor();
 await p.locator('[name=grade]').selectOption('');await query('école');
 for(const grade of ['MS','GS','SIL','CE1','CE2']){
  await p.locator('[name=grade]').selectOption(grade);await p.waitForFunction(g=>document.querySelector('#searchResults .search-meta')?.textContent.startsWith(g+' ·'),grade);
  await p.locator('#searchResults h2 a').first().click();await p.locator('[data-search-return]').waitFor();
  await p.goBack();await p.locator('#searchResults li').first().waitFor();assert.equal(await p.locator('[name=grade]').inputValue(),grade);
 }
 assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'search mobile overflow');
 assert.deepEqual(errors,[]);console.log('PASS mobile search, exact/accent/multiword queries, filters and pagination, five grade routes, parent access, return/back, private data exclusion and offline reload/navigation under /klassia/');
 }finally{await b?.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
