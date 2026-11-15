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
test('written answers stay in the active profile, travel with the backup and are validated',()=>{
 const k=factory(new Memory());k.write('klassia_answers_v1',{'CE2:MA-U1-L3-E1':{text:'Nelly et Amadou',at:new Date().toISOString()}});
 const backup=k.exportBackup();assert.equal(backup.data.klassia_answers_v1.includes('Nelly et Amadou'),true);
 k.createProfile('Autre');assert.deepEqual(k.read('klassia_answers_v1',{}),{});
 const other=factory(new Memory());other.restore(backup);assert.equal(other.read('klassia_answers_v1',{})['CE2:MA-U1-L3-E1'].text,'Nelly et Amadou');
 const many=Object.fromEntries(Array.from({length:401},(_,i)=>['CE2:x'+i,{text:'a',at:'d'}]));
 for(const bad of [{x:{text:1,at:'d'}},{x:{text:'a'.repeat(1501),at:'d'}},{x:'480'},many])assert.throws(()=>other.restore({product:'Klassia',schemaVersion:2,data:{klassia_answers_v1:bad}}));
});
test('signed numbers keep their meaning, including Unicode minus and calculations',()=>{
 for(const [answer,wrong] of [['-3','3'],['3','-3'],['-0.5','0.5'],['-1/2','1/2']]) {
  assert.equal(matchAnswer(answer,{accept:[answer]}),'correct');
  assert.equal(matchAnswer(wrong,{accept:[answer]}),'wrong');
 }
 assert.equal(matchAnswer('−3',{accept:['-3']}),'correct');
 assert.equal(matchAnswer('− 3',{accept:['-3']}),'correct');
 assert.equal(matchAnswer('− 3',{accept:['3']}),'wrong');
 assert.equal(matchAnswer('+3',{accept:['3']}),'correct');
 assert.equal(matchAnswer('5 − 8 = −3',{accept:['-3']}),'correct');
 assert.notEqual(matchAnswer('1a',{accept:['1']}),'correct');
});
test('English grouping is contextual and French decimal commas are preserved',()=>{
 for(const text of ['1,000','1,000 ml','The answer is 1,000 ml'])assert.equal(matchAnswer(text,{lang:'en',accept:['1000 ml','1000']}),'correct',text);
 assert.equal(matchAnswer('1,234,567',{lang:'en',accept:['1234567']}),'correct');
 assert.equal(matchAnswer('1,234.5',{lang:'en',accept:['1234.5']}),'correct');
 assert.equal(matchAnswer('1,5',{lang:'fr',accept:['1.5']}),'correct');
 assert.equal(matchAnswer('1,000',{lang:'fr',accept:['1000']}),'wrong');
 assert.equal(matchAnswer('1,000',{lang:'fr',accept:['1']}),'correct');
 assert.equal(matchAnswer('1.000',{lang:'en',accept:['1']}),'correct');
 assert.equal(matchAnswer('1.000',{lang:'en',accept:['1000']}),'wrong');
 const {parseNumber}=factory(new Memory());
 for(const [text,lang,value] of [['1,000','en',1000],['1,000.5','en',1000.5],['1.000','en',1],['1,5','fr',1.5],['1,000','fr',1],['−3','en',-3],['1 000','fr',1000]])assert.equal(parseNumber(text,lang),value);
 for(const text of ['','1,00,000','1.2.3','Infinity','3ml'])assert.ok(Number.isNaN(parseNumber(text,'en')),text);
});
