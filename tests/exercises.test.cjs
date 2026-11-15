const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const factory=require('../shared/core.js');
function harness(){
 const data=new Map(),K=factory({get length(){return data.size},key:i=>[...data.keys()][i],getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)}),listeners={};
 const shuffle=K.shuffleOptions;K.shuffleOptions=q=>shuffle(q,()=>0);
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../shared/exercises.js'),'utf8'),{Klassia:K,document:{addEventListener:(name,fn)=>listeners[name]=fn},CustomEvent:class {constructor(name,options){this.type=name;this.detail=options.detail;}}});
 const decode=s=>s.replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
 function exercise(p,entries,en=true){
  const html=K.exercises.html(p,'stable-id',en),solution=decode(html.match(/data-solution="([^"]*)"/)[1]),status={dataset:{},textContent:''},events=[],details={hidden:true};
  const fields=(entries||[]).map((entry,i)=>({value:String(entry),dataset:{slot:String(i),gap:String(i)},selectedOptions:[{textContent:p.pairs?.[entry]?.[1]}],closest:()=>({dataset:{}})}));
  const placed=(entries||[]).map(entry=>({textContent:p.items?.[entry],dataset:{item:String(entry)}}));
  const box={dataset:{ex:p.type,key:'stable-id',solution},lang:en?'en':'fr',
   querySelectorAll:selector=>selector.includes('data-order-answer')?placed:fields,
   querySelector:selector=>selector==='.klassia-ex-status'?status:selector==='.klassia-ex-answer'?details:selector==='[data-number]'?{value:String(entries[0])}:selector==='input[type=radio]:checked'?{value:String(entries[0])}:selector.startsWith('input[value=')?{nextElementSibling:{textContent:p.choices[JSON.parse(solution).choice]}}:null,
   dispatchEvent:event=>events.push(event)};
  const button={closest:()=>box};listeners.click({target:{closest:selector=>selector==='.klassia-ex [data-ex-check]'?button:null}});
  return {html,verdict:status.dataset.verdict,events};
 }
 return {exercise};
}
function duplicateExercises(){
 const affected=[];
 for(const grade of ['class1','class3','class4'])for(const file of fs.readdirSync(path.join(__dirname,'..',grade,'data')).filter(x=>x.endsWith('.json'))){
  const walk=(x,id='')=>{if(Array.isArray(x))x.forEach(y=>walk(y,id));else if(x&&typeof x==='object'){
   const current=x.id||id,values=x.type==='order'?x.items:x.type==='match'?x.pairs.map(p=>p[1]):[];
   if(values&&values.length>new Set(values).size)affected.push({id:current,p:x,values});Object.values(x).forEach(y=>walk(y,current));
  }};walk(JSON.parse(fs.readFileSync(path.join(__dirname,'..',grade,'data',file),'utf8')));
 }
 return affected;
}
test('all eight real corpus exercises accept identical labels in interchangeable positions',()=>{
 const {exercise}=harness(),affected=duplicateExercises();assert.equal(affected.length,8);
 for(const {id,p,values} of affected){
  const indices=values.map((value,i)=>{const other=values.findIndex((v,j)=>v===value&&j!==i);return other<0?i:other;});
  const result=exercise(p,indices);assert.equal(result.verdict,'correct',id);assert.equal(result.events[0].detail.ok,true,id);
  const different=values.findIndex(x=>x!==values[0]),wrong=[...indices];[wrong[0],wrong[different]]=[wrong[different],wrong[0]];
  assert.equal(exercise(p,wrong).verdict,'wrong',id+' genuinely wrong labels');
 }
});
test('lesson QCM are shuffled without changing the stored correct identity',()=>{
 const {exercise}=harness(),p={type:'mcq',choices:['yes','no','maybe'],correct_choice:0};
 const correct=exercise(p,[0]),positions=[...correct.html.matchAll(/type="radio"[^>]*value="(\d+)"/g)].map(m=>Number(m[1]));
 assert.deepEqual(positions,[1,2,0]);assert.equal(correct.verdict,'correct');assert.equal(exercise(p,[1]).verdict,'wrong');assert.equal(correct.events[0].detail.key,'stable-id');
});
test('numeric exercise handler respects grouping, decimal separators and signs',()=>{
 const {exercise}=harness();assert.equal(exercise({type:'number',answer:1000},['1,000']).verdict,'correct');
 assert.equal(exercise({type:'number',answer:1.5},['1,5'],false).verdict,'correct');
 assert.equal(exercise({type:'number',answer:-3},['3']).verdict,'wrong');assert.equal(exercise({type:'number',answer:3},['−3']).verdict,'wrong');
 assert.equal(exercise({type:'number',answer:-3},['−3']).verdict,'correct');assert.equal(exercise({type:'number',answer:1000},['1,00,000']).verdict,undefined);
});
