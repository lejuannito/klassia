import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {execFileSync} from 'node:child_process';
import {validateBassaRecordings} from './validate-bassa-recordings.mjs';
import {createRequire} from 'node:module';
// Same comparison as the application: every accepted form and the written answer must be recognised.
const answers=createRequire(import.meta.url)('../shared/core.js')({m:new Map(),get length(){return this.m.size},key(i){return [...this.m.keys()][i]},getItem(k){return this.m.get(k)??null},setItem(k,v){this.m.set(k,String(v))},removeItem(k){this.m.delete(k)}});
let shortAnswers=0;
function shortAnswer(e){
 const list=x=>Array.isArray(x)&&x.length&&x.every(v=>typeof v==='string'&&answers.answerTokens(v).length);
 assert.equal(e.type,'open','Short answer check on a non-open exercise '+e.id);
 assert.ok(list(e.accept)&&(e.reject===undefined||list(e.reject)),'Invalid accepted or rejected forms '+e.id);
 for(const v of [e.answer,...e.accept])assert.equal(answers.matchAnswer(v,e),'correct','Accepted form not recognised '+e.id+' : '+v);
 for(const v of e.reject||[])assert.equal(answers.matchAnswer(v,e),'wrong','Rejected form not refused '+e.id+' : '+v);
 shortAnswers++;
}
const root=path.resolve(import.meta.dirname,'..'),read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));let lessons=0,activities=0,questions=0;const ids=new Set();
const published=process.argv.includes('--public');
function checkAudio(src, transcript, id, prefix = '../assets/') {
 if (src === undefined) return;
 assert.ok(typeof src === 'string' && src.startsWith(prefix) && /^[\w.-]+\.mp3$/.test(src.slice(prefix.length)), 'Invalid lesson audio path '+id);
 assert.ok(typeof transcript === 'string' && transcript.trim(), 'Missing lesson audio transcript '+id);
 const file = fs.statSync(path.join(root, 'assets', path.basename(src)), { throwIfNoEntry: false });
 assert.ok(file?.isFile() && file.size > 0, 'Missing or empty lesson audio '+id);
}
function nurseryAudio(a) {
 for (const lang of ['fr','en']) {
  const src = a['audio_'+lang];
  if (src !== undefined) assert.notEqual(a.type,'bassa','Synthetic audio is reserved for FR/EN');
  checkAudio(src,a['story_'+lang] || a['prompt_'+lang],a.id);
 }
}
function learningExtras(l){
 assert.ok(!ids.has(l.id),'Duplicate lesson '+l.id);ids.add(l.id);
 for (const p of l.practice || []) {
  assert.ok(p.prompt && p.answer && p.explanation, 'Incomplete additional practice ' + l.id);
  if (p.listen !== undefined) assert.ok(typeof p.listen === 'string' && p.listen.trim(), 'Invalid listening message ' + l.id);
  checkAudio(p.audio, p.listen, l.id);
 }
 checkAudio(l.support?.audio, l.support?.text, l.id);
 if(l.support?.table){const t=l.support.table;assert.ok(t.headers.length&&t.rows.length,'Empty table '+l.id);for(const row of t.rows)assert.equal(row.length,t.headers.length,'Table alignment '+l.id);}
 const figure = l.support?.figure;
 if (figure) {
  assert.match(figure.src, /^\.\.\/assets\/[\w.-]+$/, 'Invalid support image path '+l.id);
  assert.ok(figure.alt?.trim(), 'Missing support image description '+l.id);
  assert.ok(fs.statSync(path.join(root, 'assets', path.basename(figure.src)), { throwIfNoEntry: false })?.isFile(), 'Missing support image '+l.id);
 }
 for(const w of l.proposedWords||[])assert.ok(w.concept&&w.forms.length&&w.sources.length,'Unsourced lexical proposal '+l.id);
}
function editorial(x){assert.ok(['draft','in_review','validated','published','withdrawn'].includes(x.editorial?.status),'Editorial status required');if(published){assert.equal(x.editorial.status,'published','Public release blocked: pedagogical validation pending');assert.ok(x.editorial.reviewer&&x.editorial.validated_at,'Named review and date required');}}
for(let i=1;i<=8;i++){
 const c=read(`data/content-u${i}.json`),q=read(`data/qcm-u${i}.json`);
 for(const s of c.subjects){assert.equal(s.assessment.items.reduce((n,e)=>n+e.points,0),s.assessment.total);for(const l of s.lessons){lessons++;assert.ok(!ids.has(l.id));ids.add(l.id);assert.ok(l.source&&l.objectives.length&&l.learn.length);editorial(l);for(const e of l.exercises){assert.ok(e.id&&e.prompt);if(e.accept!==undefined||e.reject!==undefined)shortAnswer(e);if(s.id!=='BA')assert.ok(String(e.explanation||'').trim(),'Missing explanation '+e.id);assert.ok(['open','mcq','number'].includes(e.type));if(e.audio!==undefined){assert.equal(e.type,'open');assert.ok(['FR','EN'].includes(s.id));checkAudio(e.audio,e.prompt,e.id,'./assets/');}if(e.type==='mcq'){assert.ok(Number.isInteger(e.correct_choice));assert.equal(e.answer,e.choices[e.correct_choice]);}if(e.type==='number')assert.ok(Number.isFinite(e.answer));}if(l.figure)assert.ok(fs.existsSync(path.join(root,l.figure.src)));}}
 for(const e of q.epreuves)for(const x of e.questions){questions++;assert.ok(x.id&&x.choix.length>=2&&new Set(x.choix).size===x.choix.length,x.id);assert.ok(Number.isInteger(x.bonne)&&x.bonne>=0&&x.bonne<x.choix.length);if(published)assert.equal(x.editorial_status,'published');}
 const t=read(`ms/data/themes/T${i}.json`),seen=new Set();for(const d of t.domains)for(const a of d.activities){activities++;assert.ok(!seen.has(a.id));seen.add(a.id);editorial(a);nurseryAudio(a);assert.ok(a.title_fr&&a.title_en&&a.goal_fr&&a.goal_en);assert.ok(a.duration_minutes>0&&a.materials?.length&&a.materials_en?.length===a.materials.length,'MS parent card '+a.id);assert.equal(Boolean(a.prompt_fr),Boolean(a.prompt_en),'MS prompt in both languages '+a.id);if(a.figure)assert.ok(fs.existsSync(path.join(root,'ms',a.figure.src)));}
}
const sil=read('sil/data/curriculum.json');assert.equal(sil.grade,'SIL');assert.equal(sil.units.length,8);assert.equal(sil.releaseStatus,'in_review');
// Textbook tables of contents (« Cette semaine », « Dans ton manuel »): 8 units, 4 weeks, pages increasing through the book.
for(const name of ['champions-francais-ce2','champions-francais-sil']){const m=read(`data/manuels/${name}.json`);assert.equal(m.format,'klassia-manual-progression');assert.ok(m.title&&m.source?.url&&m.source?.method,'Manual source '+name);assert.deepEqual(m.units.map(u=>u.unit),[1,2,3,4,5,6,7,8]);let last=0;for(const u of m.units){assert.deepEqual(u.weeks.map(w=>w.week),[1,2,3,4],name+' U'+u.unit);for(const w of u.weeks){assert.ok(w.items.length,name+' empty week');const nums=w.items.flatMap(([r,t,p])=>{assert.ok(typeof r==='string'&&r&&typeof t==='string');assert.ok(p===null||Number.isInteger(p)||/^\d+-\d+$/.test(p),'Manual page '+name+' U'+u.unit+' S'+w.week);return p===null?[]:String(p).split('-').map(Number);});assert.ok(Math.min(...nums)>last,name+' pages go back at U'+u.unit+' S'+w.week);last=Math.max(...nums);}}}
// Niveau 2 (CE1–CE2, MINEDUB 2018, §2.5) : trois sous-centres d’intérêt par centre, communs au CE1 et au CE2.
{const ce2=read('data/catalog.json').units,ce1=read('ce1/data/catalog.json').units;assert.equal(ce2.length,8);for(const u of ce2){assert.equal(u.subcentres?.length,3,'CE2 sub-centres '+u.id);const ref=ce1[u.number-1];assert.deepEqual(read(`ce1/data/${ref.path}`).subcentres,u.subcentres,'CE1 and CE2 share the Niveau 2 sub-centres '+u.id);}}
// SIL reading (lot 5): one lesson per week of each unit, R1–R3 for the sounds of weeks 1–3 and R4 for the review,
// in the weeks where the recorded SIL textbook has a reading lesson. From unit 4 on, the words to read use only letters already taught.
{const book=read('data/manuels/champions-francais-sil.json');let taught=new Set(['à']);
 sil.units.forEach((ref,n)=>{const u=read(`sil/data/${ref.path}`),reading=u.lessons.filter(l=>/-R\d$/.test(l.id));
  assert.deepEqual(reading.map(l=>[l.id,l.week]),[1,2,3,4].map(w=>[`${u.id}-R${w}`,w]),'SIL reading weeks '+u.id);
  for(const l of u.lessons)if(l.week!==undefined)assert.ok([1,2,3,4].includes(l.week),'Week '+l.id);
  for(const l of reading){assert.equal(l.domain,'Français · lecture');assert.ok(l.support?.text&&l.practice?.length>=2,'Reading support '+l.id);
   if(l.week<4)assert.ok(book.units[n].weeks[l.week-1].items.some(([r])=>r==='Lecture'),'No textbook reading lesson for '+l.id);
   for(const g of l.graphemes||[])for(const ch of g)taught.add(ch);
   if(n>=3){const words=[l.support.text,...(l.support.table?.rows||[]).flat()].join(' ').toLowerCase();for(const ch of words)if(/\p{L}/u.test(ch))assert.ok(taught.has(ch),`Letter « ${ch} » not taught yet in ${l.id}`);}}
 });}
for(const ref of sil.units){const u=read(`sil/data/${ref.path}`);assert.ok(u.title_fr&&u.title_en&&u.subcentres.length===3);for(const l of u.lessons){lessons++;learningExtras(l);assert.ok(l.id&&l.domain&&l.objective&&l.course&&l.model&&l.guided&&l.exercise&&l.answer&&l.remediation&&l.transfer&&l.materials,`Incomplete SIL lesson ${l.id}`);assert.ok(l.source?.title&&l.source?.url);if(l.domain==='English')assert.ok(l.course.includes('Class 1 English literacy progression'),`Incomplete English SIL track ${l.id}`);editorial(l);}}
const ce1Catalog=read('ce1/data/catalog.json');assert.equal(ce1Catalog.grade,'CE1');assert.equal(ce1Catalog.releaseStatus,'in_review');assert.equal(ce1Catalog.availableUnits.length,8);
const ce1UnitCounts = {'CE1-U1': 19, 'CE1-U2': 20, 'CE1-U3': 20, 'CE1-U4': 20, 'CE1-U5': 19, 'CE1-U6': 20, 'CE1-U7': 20, 'CE1-U8': 19};
let ce1Lessons = 0;
for (const ref of ce1Catalog.units) {
 const ce1 = read(`ce1/data/${ref.path}`);
 assert.equal(ce1.grade, 'CE1');
 assert.equal(ce1.releaseStatus, 'in_review');
 assert.equal(ce1.lessons.length, ce1UnitCounts[ref.id]);
 // Lot 7b: French language study by « savoir » — grammar, vocabulary, spelling and conjugation in every unit.
 for(const [code,domain] of [['G1','Français · grammaire'],['V1','Français · vocabulaire'],['O1','Français · orthographe'],['C1','Français · conjugaison']]){const l=ce1.lessons.find(x=>x.id===`${ref.id}-${code}`);assert.ok(l&&l.domain===domain&&/tableau (7|8|9|10) /.test(l.source.pages)&&l.practice.length>=2,'CE1 language '+ref.id+'-'+code);}
 // Lot 7a: four English lessons per unit after the francophone curriculum (listening and speaking, reading, writing, grammar).
 assert.deepEqual(ce1.lessons.filter(l=>/-E\d$/.test(l.id)).map(l=>[l.id,l.domain,/Niveau 2/.test(l.source.title)]),[1,2,3,4].map(k=>[`${ref.id}-E${k}`,'English',true]),'CE1 English '+ref.id);
 for (const l of ce1.lessons) {
  lessons++; ce1Lessons++;
  learningExtras(l);
  assert.ok(l.id&&l.domain&&l.objective&&l.course&&l.model&&l.guided&&l.exercise&&l.answer&&l.remediation&&l.transfer&&l.materials,`Incomplete CE1 lesson ${l.id}`);
  assert.ok(l.source?.title&&l.source?.url);
  editorial(l);
 }
}
assert.equal(ce1Lessons, 157);
const gs=read('gs/data/catalog-v13.json');assert.equal(gs.themes.length,8);let gsActivities=0;
for(const ref of gs.themes){const t=read(`gs/data/themes/${ref.id}.json`);assert.equal(t.grade,'GS');assert.equal(t.domains.length,5);for(const d of t.domains)for(const a of d.activities){gsActivities++;assert.ok(!ids.has(a.id),'Duplicate GS activity');ids.add(a.id);editorial(a);nurseryAudio(a);for(const f of ['title_fr','title_en','goal_fr','goal_en','prompt_fr','prompt_en'])assert.ok(a[f],a.id+' '+f);assert.ok(a.steps_fr.length>=3&&a.steps_en.length>=3);assert.ok(a.questions.every(q=>q.fr&&q.en&&q.answer));assert.ok(a.source_refs.length===2);assert.ok(a.materials.length&&a.observe.length);
 // Lot 6b: no generated filler left in GS activities; steps, materials and observation points are specific.
 assert.ok(a.duration_minutes>0&&a.materials_en?.length===a.materials.length,'GS parent card '+a.id);assert.equal(a.steps_fr.length,a.steps_en.length,'GS steps '+a.id);
 assert.ok(!a.steps_fr.some(s=>s.startsWith('Préparer avec l’adulte :'))&&!a.materials.some(m=>/décrits dans la consigne|^papier et crayons$/.test(m))&&!a.observe.some(o=>o.startsWith('Répond ou montre sa démarche')||o==='Comprend la consigne et commence avec une aide adaptée.'),'GS generated filler '+a.id);}}assert.equal(gsActivities,162);
const lex=read('data/bassa-lexicon-variants.json'),bm=read('data/bassa-lessons.json');
validateBassaRecordings(root,lex.entries);
for(const [lesson,row] of Object.entries(bm.lessons)){assert.ok(row.concept_ids.length,lesson);for(const id of row.concept_ids)assert.ok(lex.entries.some(x=>x.id===id&&x.forms.length&&x.sources.length),lesson+' '+id);}
for(const f of ['shared/correction.js','shared/search.js','shared/pilot.js','shared/speech.js','shared/bassa.js','shared/bassa-recorder.js','shared/learning-app.js','app.js','v9.js','v14.js','pwa.js','service-worker.js','shared/core.js','shared/ui.js','class-switch-v12.js','ms/app-core-v13.js','ms/app-ui-v13.js','ms/ms-v14.js'])execFileSync(process.execPath,['--check',path.join(root,f)]);
assert.equal(lessons,626);assert.equal(activities,160);assert.equal(read('data/coverage.json').items.length,948);assert.equal(questions,read('docs/metrics.json').storedQuestions);
console.log(`Validated structure: ${lessons} lessons, ${activities} MS + ${gsActivities} GS activities, ${questions} stored questions, ${shortAnswers} CE2 short answers with automatic check. Editorial validation is separate.`);
