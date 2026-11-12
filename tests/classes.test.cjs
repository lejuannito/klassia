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
