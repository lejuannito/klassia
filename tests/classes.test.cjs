const test=require('node:test'),assert=require('node:assert/strict');
const registry=require('../shared/classes.js'),cheer=require('../shared/encouragement.js');

test('the class registry resolves each class page and local paths',()=>{
 assert.deepEqual(registry.classes.map(c=>c.grade),['MS','GS','SIL','CE1','CE2']);
 assert.equal(registry.currentClass('/klassia/').grade,'CE2');assert.equal(registry.currentClass('/klassia/imprimer.html').grade,'CE2');
 assert.equal(registry.currentClass('/klassia/ce1/').grade,'CE1');assert.equal(registry.currentClass('/klassia/gs/index.html').grade,'GS');
 assert.equal(registry.classLocalPath(registry.classInfo('SIL'),'sil/data/curriculum.json'),'./data/curriculum.json');
 assert.ok(registry.isNurseryClass('MS')&&!registry.isNurseryClass('CE1'));assert.equal(registry.classInfo('CP'),null);
});

test('stars count completed resources; the streak counts consecutive days without blaming a missed day',()=>{
 const now=new Date(2026,10,12,10),d=n=>new Date(2026,10,12-n,9).toISOString();
 assert.deepEqual(cheer.streak([d(0),d(1),d(2),d(4)],now),{days:3,today:true});
 assert.deepEqual(cheer.streak([d(1),d(2)],now),{days:2,today:false},'Yesterday keeps the streak alive');
 assert.deepEqual(cheer.streak([d(2),d(3)],now),{days:0,today:false});assert.deepEqual(cheer.streak(['not a date'],now),{days:0,today:false});
 const store={klassia_ce1_progress_v1:{a:'A',b:'EC',c:'A'},klassia_progress:{x:'MAITRISEE',y:'A_REVOIR'},'klassia_ms_progress_v2:T1':{a:'A'},'klassia_ms_progress_v2:T3':{b:'A',c:'EC'},klassia_attempts:[{at:d(0)}],klassia_observations:[{at:d(1)}],klassia_activity_v9:[{at:d(2)}]};
 const read=(k,f)=>store[k]??f;
 assert.deepEqual(cheer.summary(registry.classInfo('CE1'),read,now),{stars:2,days:2,today:true},'Opening a page (activity log) is not work');
 assert.equal(cheer.summary(registry.classInfo('CE2'),read,now).stars,1);assert.equal(cheer.summary(registry.classInfo('MS'),read,now).stars,2);
});

test('the common lesson model reads the three data formats in four steps',()=>{
 const M=require('../shared/lesson-model.js');assert.deepEqual(M.STEPS.map(x=>x.fr),['Je découvre','Je retiens','Je m’exerce','Je fais le point']);
 const sil=M.fromLesson({id:'SIL-U1-L01',title:'T',domain:'English',objective:'Goal',course:'Rule',model:'Example',guided:'Together',exercise:'Do',answer:'A',practice:[{prompt:'p'}],remediation:'Help'});
 assert.equal(sil.english,true);assert.deepEqual(sil.retain.paragraphs,['Rule']);assert.equal(sil.practise.items.length,1);assert.deepEqual(M.filled(sil),{decouvrir:true,retenir:true,exercer:true,point:true});
 const ce2=M.fromCE2({id:'FR-U1-L1',title:'T',objectives:['O'],discover:'D',learn:['L1',''],takeaway:'K',practical:['P'],exercises:[{prompt:'e'}]});
 assert.deepEqual(ce2.retain,{paragraphs:['L1'],takeaway:'K',manual:null});assert.equal(ce2.practise.together,'P');
 const act=M.fromActivity({id:'LC1',title_fr:'Titre',title_en:'Title',goal_fr:'But',prompt_fr:'Consigne',steps_fr:['a','b'],steps_en:['x'],questions:[{fr:'q',answer:'r'}],observe:['o'],observe_en:['O'],materials:['m'],materials_en:['M']},true);
 assert.equal(act.title,'Title');assert.deepEqual(act.goals,['But'],'English falls back to French');assert.equal(act.practise.items.length,2);assert.deepEqual(act.review.observe,['O']);
 assert.deepEqual(M.attemptsSummary([{kind:'short_answer',exercise:'SIL:SIL-U1-L1',ok:false},{kind:'short_answer',exercise:'SIL:SIL-U1-L1',ok:true},{kind:'exercise',exercise:'SIL:SIL-U1-L1:entrainement:0',ok:false},{kind:'self_report',exercise:'SIL:SIL-U1-L1:entrainement:1',ok:true},{kind:'exercise',exercise:'SIL:SIL-U1-L10',ok:true}],'SIL:SIL-U1-L1'),{checked:2,right:1,self:1,selfOk:1});
 assert.deepEqual(M.attemptsSummary([{kind:'mcq',exercise:'FR-U1-L1:1',ok:true},{kind:'number',exercise:'FR-U1-L1-E3',ok:false},{kind:'mcq',exercise:'FR-U1-L10:0',ok:true}],'FR-U1-L1'),{checked:2,right:1,self:0,selfOk:0},'CE2 keys');
 assert.equal(M.tallyText({checked:2,right:1,self:0,selfOk:0}),'1 réponse juste sur 2 vérifiées');assert.match(M.tallyText({checked:0,self:0},true),/No answer checked/);
});
