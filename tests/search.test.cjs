const {test,before}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const S=require('../shared/search.js'),root=path.resolve(__dirname,'..');
let records;
before(async()=>{records=await S.load(async p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8')));});
test('all 1209 public resources from the seven classes have unique, valid direct routes',()=>{
 assert.deepEqual(Object.fromEntries(['MS','GS','SIL','CE1','CE2','CLASS1','CLASS3'].map(g=>[g,records.filter(r=>r.grade===g).length])),{MS:168,GS:167,SIL:144,CE1:191,CE2:347,CLASS1:128,CLASS3:64});
 assert.equal(new Set(records.map(r=>r.href)).size,1209);
 for(const r of records){const u=new URL(r.href,'https://example.org/klassia/');
  if(['MS','GS'].includes(r.grade)){
   const t=JSON.parse(fs.readFileSync(path.join(root,r.grade.toLowerCase(),'data/themes',u.searchParams.get('theme')+'.json')));
   const [,domain,index]=u.hash.split(':');assert.equal(t.domains.find(d=>d.id===domain).activities[Number(index)].id,r.id);
  }else assert.equal(decodeURIComponent(u.hash.slice('#lesson:'.length)),r.id);
 }
});
test('exact title, accent/case folding, apostrophes, plurals and multiple terms find water states',()=>{
 const query='les états de l’eau',hits=S.search(records,query);
 assert.equal(hits[0].id,'SC-U2-L5');assert.match(hits[0].excerpt,/liquide.*solide/);
 assert.deepEqual(S.search(records,"LES ETATS DE L'EAU").map(r=>r.href),hits.map(r=>r.href));
 assert.ok(S.search(records,'état eau').some(r=>r.id==='SC-U2-L5'));
 assert.equal(S.search(records,'L’eau : vases communicants et changements d’état')[0].id,'SC-U2-L5');
 assert.deepEqual(new Set(S.search(records,'école').map(r=>r.grade)),new Set(['MS','GS','SIL','CE1','CE2','CLASS1']));
});
test('all significant query terms are required and filters restrict grade and subject',()=>{
 assert.deepEqual(S.search(records,'eau zzzintrouvable'),[]);assert.deepEqual(S.search(records,'le de et'),[]);
 const hits=S.search(records,'eau',{grade:'CE2',subject:'Sciences et technologies'});
 assert.ok(hits.length>0);assert.ok(hits.every(r=>r.grade==='CE2'&&r.subject==='Sciences et technologies'));
});
test('title outranks objectives, which outrank body; relevant exercise/support text is searchable',()=>{
 const rs=[S.record('CE2','Sciences',{id:'body',title:'Autre',course:'condensation'},'body'),S.record('CE2','Sciences',{id:'goal',title:'Autre',objective:'condensation'},'goal'),S.record('CE2','Sciences',{id:'title',title:'Condensation'},'title')];
 assert.deepEqual(S.search(rs,'condensation').map(r=>r.id),['title','goal','body']);
 const r=S.record('CE1','Français',{title:'Support',objective:'Lire',support:{text:'Un ornithorynque près du lac'},practice:[{prompt:'Un scarabée marche',explanation:'Une métamorphose'}],activity_fr:'Observer un nénuphar',game_en:'Count butterflies',editorial:{notes:'privéinvisible'},source:{title:'sourceinvisible'}},'lesson');
 for(const q of ['ornithorynque','scarabée','métamorphose','nénuphar','butterflies'])assert.equal(S.search([r],q).length,1);
 for(const q of ['privéinvisible','sourceinvisible'])assert.equal(S.search([r],q).length,0);
});
test('failed loading rejects rather than presenting incomplete search results',async()=>{
 await assert.rejects(S.load(async p=>{if(p==='data/catalog.json')throw Error('offline pack missing');return JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));}),/offline pack missing/);
});

test('offline, a class that is not installed is skipped and named; other failures still reject',async()=>{
 const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
 const records=await S.load(async p=>{if(p.startsWith('sil/data/sil-u')){const e=Error('Contenu indisponible');e.notInstalled=true;throw e;}return read(p);});
 assert.deepEqual(records.missing,['SIL']);assert.equal(records.filter(r=>r.grade==='SIL').length,0);assert.equal(records.filter(r=>r.grade==='CE1').length,191);
 await assert.rejects(S.load(async p=>{if(p.startsWith('ce1/data/unit'))throw Error('broken file');return read(p);}),/broken file/);
});
