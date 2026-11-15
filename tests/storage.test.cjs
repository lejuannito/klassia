const test=require('node:test'),assert=require('node:assert/strict'),factory=require('../shared/core.js');
class Memory{constructor(){this.m=new Map();this.fail=false}get length(){return this.m.size}key(i){return [...this.m.keys()][i]}getItem(k){return this.m.get(k)??null}setItem(k,v){if(this.fail&&k==='klassia_profiles_v15')throw Error('QuotaExceededError');this.m.set(k,String(v))}removeItem(k){this.m.delete(k)}}
test('migrate legacy CE2 and MS without deleting source; isolate children',()=>{const n=new Memory();n.setItem('klassia_progress',JSON.stringify({'FR-U1-L1':'MAITRISEE'}));n.setItem('klassia_ms_progress_v2:T1',JSON.stringify({LC1:'A'}));const k=factory(n);assert.equal(k.read('klassia_progress',{})['FR-U1-L1'],'MAITRISEE');k.createProfile('Enfant 2');assert.deepEqual(k.read('klassia_progress',{}),{});k.selectProfile('initial');assert.equal(k.read('klassia_ms_progress_v2:T1',{}).LC1,'A');assert.ok(n.getItem('klassia_progress'));});
test('legacy CE2 restore preserves MS and other profiles; undo restores old state',()=>{const n=new Memory(),k=factory(n);k.write('klassia_ms_progress_v2:T1',{LC1:'A'});k.write('klassia_progress',{'FR-U1-L1':'EN_COURS'});k.restore({product:'Klassia',schemaVersion:1,data:{klassia_progress:{'FR-U1-L1':'MAITRISEE'}}});assert.equal(k.read('klassia_ms_progress_v2:T1',{}).LC1,'A');assert.equal(k.read('klassia_progress',{})['FR-U1-L1'],'MAITRISEE');k.undoRestore();assert.equal(k.read('klassia_progress',{})['FR-U1-L1'],'EN_COURS');});
test('invalid payload, invalid score and forbidden key rejected before any write',()=>{const n=new Memory(),k=factory(n),before=n.getItem('klassia_profiles_v15');for(const data of [{klassia_progress:[]},{'klassia_evals:U1':{FR:{score:99}}},{unknown:1},JSON.parse('{"__proto__":{}}')])assert.throws(()=>k.restore({product:'Klassia',schemaVersion:1,data}));assert.equal(n.getItem('klassia_profiles_v15'),before);});
test('quota failure preserves atomic envelope and visible state',()=>{const n=new Memory(),k=factory(n);k.write('klassia_progress',{'FR-U1-L1':'EN_COURS'});const before=n.getItem('klassia_profiles_v15');n.fail=true;assert.throws(()=>k.restore({product:'Klassia',schemaVersion:1,data:{klassia_progress:{'FR-U1-L1':'MAITRISEE'}}}));assert.equal(n.getItem('klassia_profiles_v15'),before);assert.equal(k.read('klassia_progress',{})['FR-U1-L1'],'EN_COURS');});
test('schema2 export roundtrip preserves all grades',()=>{const k=factory(new Memory());k.write('klassia_ms_progress_v2:T2',{ST1:'EC'});k.storage.setItem('klassia_unit','U3');const b=k.exportBackup(),other=factory(new Memory());other.restore(b);assert.equal(other.storage.getItem('klassia_unit'),'U3');assert.equal(other.read('klassia_ms_progress_v2:T2',{}).ST1,'EC');});
test('shuffle preserves stable identities and the correct answer',()=>{const k=factory(new Memory()),q={choix:['a','b','c','d'],bonne:0},o=k.shuffleOptions(q,()=>0);assert.equal(o.find(x=>x.id===q.bonne).text,'a');assert.notEqual(o[0].id,0);assert.equal(new Set(o.map(x=>x.id)).size,4);});
test('two instances merge writes against latest envelope',()=>{const n=new Memory(),a=factory(n),b=factory(n);a.write('klassia_progress',{'FR-U1-L1':'EN_COURS'});b.write('klassia_ms_progress_v2:T1',{LC1:'A'});assert.equal(a.read('klassia_ms_progress_v2:T1',{}).LC1,'A');assert.equal(b.read('klassia_progress',{})['FR-U1-L1'],'EN_COURS');});
test('GS progress is isolated from MS and other children and survives export/restore',()=>{const k=factory(new Memory());k.write('klassia_gs_progress_v2:T1',{'GS-T1-LC1':'A'});k.write('klassia_ms_progress_v2:T1',{LC1:'EC'});k.storage.setItem('klassia_gs_theme_v2','T8');const backup=k.exportBackup();assert.ok(backup.scope.includes('GS'));k.createProfile('Autre');assert.deepEqual(k.read('klassia_gs_progress_v2:T1',{}),{});const restored=factory(new Memory());restored.restore(backup);assert.equal(restored.read('klassia_gs_progress_v2:T1',{})['GS-T1-LC1'],'A');assert.equal(restored.read('klassia_ms_progress_v2:T1',{}).LC1,'EC');assert.equal(restored.storage.getItem('klassia_gs_theme_v2'),'T8');assert.throws(()=>restored.restore({product:'Klassia',schemaVersion:2,data:{'klassia_gs_progress_v2:T1':{x:'INVALID'}}}));});
test('ten registered classes and family preferences travel between devices and children stay separate',()=>{
 const registry=require('../shared/classes.js'),a=factory(new Memory()),b=factory(new Memory());a.renameProfile('Awa');
 for(const c of registry.classes) {
  const key=c.progressKey+(c.format==='nursery'?':T2':'');
  a.write(key,c.grade==='CE2'?{'FR-U1-L1':'MAITRISEE'}:{[c.grade+'-lesson']:'A'});
  if(c.format==='nursery')a.storage.setItem('klassia_'+c.grade.toLowerCase()+'_theme_v2','T2');
  a.write('klassia_'+c.grade.toLowerCase()+'_recent_v1',{lessonId:c.grade+'-lesson'});
  if(c.week)a.write('klassia_'+c.grade.toLowerCase()+'_week_v1',{unit:'U1',week:2});
 }
 a.write('klassia_family',{school:'en',grade:'CLASS1'});a.write('klassia_home_language_v1',{name:'bassa'});a.write('klassia_home_words_v1',{mother:'mot'});a.write('klassia_nursery_lang_v1','en');a.write('klassia_entry_lang_v1','en');a.write('klassia_lesson_view_v1','all');a.write('klassia_user',{role:'ADMIN'});
 const backup=a.exportBackup();assert.deepEqual(new Set(backup.scope),new Set(registry.classes.map(c=>c.grade)));assert.ok(!('klassia_user' in backup.data));
 b.renameProfile('Bobo');b.write('klassia_progress',{'MA-U1-L1':'EN_COURS'});b.restore(backup,{mode:'new'});
 assert.equal(b.profile().name,'Awa');assert.deepEqual(b.exportBackup().data,backup.data);
 b.selectProfile('initial');assert.equal(b.profile().name,'Bobo');assert.deepEqual(b.read('klassia_progress',{}),{'MA-U1-L1':'EN_COURS'});
 b.undoRestore();assert.equal(b.profiles().length,1);assert.equal(b.profile().name,'Bobo');
});
test('merge preserves distinct progress, answers and attempts; replacement is explicit and reversible',()=>{
 const k=factory(new Memory());k.write('klassia_class1_progress_v1',{a:'A',b:'EC'});k.write('klassia_attempts',[{at:'2026-11-15',ok:true}]);
 const backup={product:'Klassia',schemaVersion:2,data:{klassia_class1_progress_v1:JSON.stringify({b:'A',c:'EC'}),klassia_attempts:JSON.stringify([{at:'2026-11-15',ok:true},{at:'2026-11-16',ok:false}])}};
 k.restore(backup);assert.deepEqual(k.read('klassia_class1_progress_v1',{}),{a:'A',b:'A',c:'EC'});assert.equal(k.read('klassia_attempts',[]).length,2);
 k.restore(backup,{mode:'replace'});assert.deepEqual(k.read('klassia_class1_progress_v1',{}),{b:'A',c:'EC'});k.undoRestore();assert.equal(k.read('klassia_class1_progress_v1',{}).a,'A');
});
test('invalid anglophone progress, preferences and new-profile imports leave all profiles untouched',()=>{
 const n=new Memory(),k=factory(n);k.write('klassia_class4_progress_v1',{x:'EC'});const before=n.getItem('klassia_profiles_v15');
 for(const data of [{klassia_class1_progress_v1:'{"x":"INVALID"}'},{klassia_nursery1_theme_v2:'T9'},{klassia_nursery2_progress_v1: '"invalid"'},{klassia_family:'{"school":"unknown","grade":"CLASS1"}'},{klassia_home_words_v1:'{"word":4}'},{klassia_nursery_lang_v1:'"xx"'},{klassia_class1_week_v1:'{"unit":"U1","week":8}'}])assert.throws(()=>k.restore({product:'Klassia',schemaVersion:2,data},{mode:'new'}));
 assert.equal(n.getItem('klassia_profiles_v15'),before);
});
test('an interrupted import keeps both the current data and the previous undo snapshot',()=>{
 const n=new Memory(),k=factory(n);k.write('klassia_progress',{'FR-U1-L1':'EN_COURS'});const backup=k.exportBackup();
 k.write('klassia_progress',{'FR-U1-L1':'MAITRISEE'});k.restore(backup);const previous=n.getItem('klassia_restore_undo_v15'),before=n.getItem('klassia_profiles_v15');
 n.fail=true;assert.throws(()=>k.restore(backup,{mode:'new'}));assert.equal(n.getItem('klassia_profiles_v15'),before);assert.equal(n.getItem('klassia_restore_undo_v15'),previous);
 n.fail=false;k.undoRestore();assert.equal(k.read('klassia_progress',{})['FR-U1-L1'],'MAITRISEE');
});

test('weekly settings retain real unit identifiers and English projects travel in backups',()=>{
 const K=factory(new Memory());
 for(const [grade,unit] of [['SIL','SIL-U3'],['CE1','CE1-U5'],['CE2','U2'],['CLASS1','CLASS1-T1'],['CLASS3','CLASS3-T4'],['CLASS4','CLASS4-T8']]){
  K.write('klassia_'+grade.toLowerCase()+'_week_v1',{unit,week:3});
 }
 K.write('klassia_project:CLASS4-T8',{'0':true});
 const backup=K.exportBackup();
 K.restore(backup,{mode:'new'});
 assert.equal(K.read('klassia_sil_week_v1',{}).unit,'SIL-U3');
 assert.equal(K.read('klassia_class4_week_v1',{}).unit,'CLASS4-T8');
 assert.equal(K.read('klassia_project:CLASS4-T8',{})['0'],true);
});
