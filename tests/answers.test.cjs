const test=require('node:test'),assert=require('node:assert/strict'),factory=require('../shared/core.js');
class Memory{constructor(){this.m=new Map()}get length(){return this.m.size}key(i){return [...this.m.keys()][i]}getItem(k){return this.m.get(k)??null}setItem(k,v){this.m.set(k,String(v))}removeItem(k){this.m.delete(k)}}
const {matchAnswer}=factory(new Memory());
const money={accept:['1 150 F','1 150'],prompt:'Une famille a 1 800 F et dépense 650 F. Combien reste-t-il ?'};
test('numbers: spaces, units, answer sentence and calculation are recognised',()=>{
 for(const a of ['1 150 F','1150','Il reste 1 150 francs.','1 800 − 650 = 1 150','1 150 FCFA'])assert.equal(matchAnswer(a,money),'correct',a);
 for(const a of ['1 050 F','650','2 450'])assert.equal(matchAnswer(a,money),'wrong',a);
 assert.equal(matchAnswer('1 150 kg',money),'number');
 assert.equal(matchAnswer('24 cm',{accept:['24 cm²','24'],prompt:'Calcule l’aire.'}),'number','an area without square unit is not counted as correct');
 assert.equal(matchAnswer('24 cm2',{accept:['24 cm²','24'],prompt:'Calcule l’aire.'}),'correct');
});
test('words: case, accents, articles and words of the question are tolerated',()=>{
 const glass={accept:['transparente','transparent'],reject:['opaque','translucide'],prompt:'Une vitre claire est généralement…'};
 for(const a of ['Transparente','transparente.','Elle est transparente','Une vitre claire est généralement transparente.'])assert.equal(matchAnswer(a,glass),'correct',a);
 assert.equal(matchAnswer('opaque',glass),'wrong');
 assert.equal(matchAnswer('pas transparente',glass),'unknown','a negation is never counted as correct');
 assert.equal(matchAnswer('l’ecole elle meme',{accept:['l’école elle-même'],prompt:'Quelle source ?'}),'correct');
});
test('choices copied from the question stay unknown; the other option is wrong',()=>{
 const key={accept:['entrée'],reject:['sortie'],prompt:'Clavier : entrée ou sortie ?'};
 assert.equal(matchAnswer('Le clavier est une entrée',key),'correct');
 assert.equal(matchAnswer('sortie',key),'wrong');
 assert.equal(matchAnswer('entrée ou sortie',key),'unknown');
});
test('several numbers are compared as a whole, never one by one',()=>{
 const split={accept:['2 000 + 700 + 5'],prompt:'Décompose 2 705.'};
 assert.equal(matchAnswer('2000+700+5',split),'correct');
 assert.equal(matchAnswer('2 705 = 2 000 + 700 + 5',split),'correct');
 assert.equal(matchAnswer('2 000 + 70 + 5',split),'unknown');
 assert.equal(matchAnswer('56',{accept:['56 ; 54'],prompt:'Calcule 8 × 7 puis 6 × 9.'}),'unknown');
});
test('written answers stay in the active profile and on this device, outside the backup',()=>{
 const k=factory(new Memory());k.write('klassia_answers_v1',{'CE2:MA-U1-L3-E1':{text:'Nelly et Amadou',at:new Date().toISOString()}});
 assert.equal(k.read('klassia_answers_v1',{})['CE2:MA-U1-L3-E1'].text,'Nelly et Amadou');
 assert.equal(JSON.stringify(k.exportBackup()).includes('Nelly et Amadou'),false);
 const first=k.profile().id;k.createProfile('Autre');assert.deepEqual(k.read('klassia_answers_v1',{}),{});
 k.selectProfile(first);assert.equal(k.read('klassia_answers_v1',{})['CE2:MA-U1-L3-E1'].text,'Nelly et Amadou');
});
