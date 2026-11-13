import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {execFileSync} from 'node:child_process';
import {validateBassaRecordings} from './validate-bassa-recordings.mjs';
import {createRequire} from 'node:module';
// Same comparison as the application: every accepted form and the written answer must be recognised.
const answers=createRequire(import.meta.url)('../shared/core.js')({m:new Map(),get length(){return this.m.size},key(i){return [...this.m.keys()][i]},getItem(k){return this.m.get(k)??null},setItem(k,v){this.m.set(k,String(v))},removeItem(k){this.m.delete(k)}});
let shortAnswers=0,linkedQuestions=0;
function shortAnswer(e){
 const list=x=>Array.isArray(x)&&x.length&&x.every(v=>typeof v==='string'&&answers.answerTokens(v).length);
 assert.equal(e.type,'open','Short answer check on a non-open exercise '+e.id);
 assert.ok(list(e.accept)&&(e.reject===undefined||list(e.reject)),'Invalid accepted or rejected forms '+e.id);
 for(const v of [e.answer,...e.accept])assert.equal(answers.matchAnswer(v,e),'correct','Accepted form not recognised '+e.id+' : '+v);
 for(const v of e.reject||[])assert.equal(answers.matchAnswer(v,e),'wrong','Rejected form not refused '+e.id+' : '+v);
 shortAnswers++;
}
// Lot 2e: SIL and CE1 short answers use the same comparison; the written answer may stay unrecognised but never refused.
let learningShortAnswers=0;
// Checked formats (shared/exercises.js): order at least three distinct items, match at least three pairs with distinct sides, gaps written [[answer|variant]].
let checkedFormats=0;
function checkedFormat(p,id){
 if(p.type===undefined)return;
 const text=v=>typeof v==='string'&&v.trim();
 assert.ok(['order','match','gaps'].includes(p.type),'Unknown practice type '+id);
 if(p.type==='order')assert.ok(Array.isArray(p.items)&&p.items.length>=3&&p.items.every(text)&&new Set(p.items).size===p.items.length,'Order items '+id);
 if(p.type==='match')assert.ok(Array.isArray(p.pairs)&&p.pairs.length>=3&&p.pairs.every(x=>Array.isArray(x)&&x.length===2&&x.every(text))&&[0,1].every(k=>new Set(p.pairs.map(x=>x[k])).size===p.pairs.length),'Match pairs '+id);
 if(p.type==='gaps'){const gaps=[...String(p.text||'').matchAll(/\[\[([^\]]+)\]\]/g)];assert.ok(gaps.length&&gaps.every(g=>g[1].split('|').every(text)),'Gaps '+id);}
 checkedFormats++;
}
function learningShort(x,prompt,id){
 if(x.accept===undefined&&x.reject===undefined)return;
 const list=v=>Array.isArray(v)&&v.length&&v.every(w=>typeof w==='string'&&answers.answerTokens(w).length);
 assert.ok(list(x.accept)&&(x.reject===undefined||list(x.reject)),'Invalid accepted or rejected forms '+id);
 const rule={accept:x.accept,reject:x.reject||[],prompt};
 for(const v of x.accept)assert.equal(answers.matchAnswer(v,rule),'correct','Accepted form not recognised '+id+' : '+v);
 for(const v of x.reject||[])assert.equal(answers.matchAnswer(v,rule),'wrong','Rejected form not refused '+id+' : '+v);
 assert.notEqual(answers.matchAnswer(x.answer,rule),'wrong','Written answer refused '+id);
 learningShortAnswers++;
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
  learningShort(p, p.prompt, l.id);
  checkedFormat(p, l.id);
 }
 learningShort(l, l.exercise, l.id);
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
// Lot 6c : chaque activité de maternelle cite un tableau du programme francophone (9 à 29) et se range dans le
// parcours de base (par défaut) ou « pour aller plus loin » (`path: 'plus'`).
const nurseryPaths={MS:{base:0,plus:0},GS:{base:0,plus:0}};
function nurseryPath(a,grade){assert.ok(a.path===undefined||a.path==='plus','Nursery path '+a.id);nurseryPaths[grade][a.path||'base']++;assert.ok(Array.isArray(a.source_refs)&&a.source_refs.length,'Curriculum reference required '+a.id);const m=/tableaux? (\d+)(?:–(\d+))?/.exec(a.source_refs[0]);assert.ok(m&&Number(m[1])>=9&&Number(m[2]||m[1])<=29,'Curriculum table '+a.id);}
function editorial(x){assert.ok(['draft','in_review','validated','published','withdrawn'].includes(x.editorial?.status),'Editorial status required');if(published){assert.equal(x.editorial.status,'published','Public release blocked: pedagogical validation pending');assert.ok(x.editorial.reviewer&&x.editorial.validated_at,'Named review and date required');}}
for(let i=1;i<=8;i++){
 const c=read(`data/content-u${i}.json`),q=read(`data/qcm-u${i}.json`);
 for(const s of c.subjects){assert.equal(s.assessment.items.reduce((n,e)=>n+e.points,0),s.assessment.total);for(const l of s.lessons){lessons++;assert.ok(!ids.has(l.id));ids.add(l.id);assert.ok(l.source&&l.objectives.length&&l.learn.length);editorial(l);for(const e of l.exercises){assert.ok(e.id&&e.prompt);if(e.accept!==undefined||e.reject!==undefined)shortAnswer(e);if(s.id!=='BA')assert.ok(String(e.explanation||'').trim(),'Missing explanation '+e.id);assert.ok(['open','mcq','number'].includes(e.type));if(e.audio!==undefined){assert.equal(e.type,'open');assert.ok(['FR','EN'].includes(s.id));checkAudio(e.audio,e.prompt,e.id,'./assets/');}if(e.type==='mcq'){assert.ok(Number.isInteger(e.correct_choice));assert.equal(e.answer,e.choices[e.correct_choice]);}if(e.type==='number')assert.ok(Number.isFinite(e.answer));}if(l.figure)assert.ok(fs.existsSync(path.join(root,l.figure.src)));}}
 for(const e of q.epreuves)for(const x of e.questions){questions++;assert.ok(x.id&&x.choix.length>=2&&new Set(x.choix).size===x.choix.length,x.id);assert.ok(Number.isInteger(x.bonne)&&x.bonne>=0&&x.bonne<x.choix.length);if(published)assert.equal(x.editorial_status,'published');if(x.lecon!==undefined){const ls=c.subjects.find(s=>s.id===e.subject_id)?.lessons||[];assert.ok(ls.some(l=>l.id===x.lecon),'QCM linked to a lesson of another subject or unit '+x.id);linkedQuestions++;}}
 const t=read(`ms/data/themes/T${i}.json`),seen=new Set();for(const d of t.domains)for(const a of d.activities){activities++;assert.ok(!seen.has(a.id));seen.add(a.id);editorial(a);nurseryAudio(a);assert.ok(a.title_fr&&a.title_en&&a.goal_fr&&a.goal_en);assert.ok(a.duration_minutes>0&&a.materials?.length&&a.materials_en?.length===a.materials.length,'MS parent card '+a.id);assert.equal(Boolean(a.prompt_fr),Boolean(a.prompt_en),'MS prompt in both languages '+a.id);assert.equal((a.observe_en||[]).length,(a.observe||[]).length,'MS observation in English '+a.id);if(a.figure)assert.ok(fs.existsSync(path.join(root,'ms',a.figure.src)));nurseryPath(a,'MS');}
}
// QCM reliés : chaque question qui nomme sa leçon (`lecon`) pointe vers une leçon de la même unité et de la même matière.
assert.equal(linkedQuestions,1073,'QCM linked to their lesson');
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
let sil5c=0;
for(const ref of sil.units){const u=read(`sil/data/${ref.path}`);assert.ok(u.title_fr&&u.title_en&&u.subcentres.length===3);for(const l of u.lessons){lessons++;learningExtras(l);assert.ok(l.id&&l.domain&&l.objective&&l.course&&l.model&&l.guided&&l.exercise&&l.answer&&l.remediation&&l.transfer&&l.materials,`Incomplete SIL lesson ${l.id}`);assert.ok(l.source?.title&&l.source?.url);if(l.domain==='English'&&!/-E\d$/.test(l.id)){assert.ok(l.course.includes('SIL English progression (francophone programme)')&&/SIL column/.test(l.source.pages),`Incomplete English SIL track ${l.id}`);assert.ok(!/\b(2[1-9]|[3-9]\d)\b|0–50/.test([l.objective,l.course,l.model,l.guided,l.exercise,l.answer].join(' ')),`SIL English numbers stop at 20 ${l.id}`);}
 // Lot 5c: English, measures and geometry from the francophone Niveau 1 programme (SIL column).
 if(/-(E\d|MM|MG)$/.test(l.id)){assert.ok(/Niveau 1 \(SIL-CP\)/.test(l.source.title)&&/SIL column|colonne SIL/.test(l.source.pages),'SIL programme source '+l.id);sil5c++;}editorial(l);}}
const ce1Catalog=read('ce1/data/catalog.json');assert.equal(ce1Catalog.grade,'CE1');assert.equal(ce1Catalog.releaseStatus,'in_review');assert.equal(ce1Catalog.availableUnits.length,8);
const ce1UnitCounts = {'CE1-U1': 23, 'CE1-U2': 25, 'CE1-U3': 24, 'CE1-U4': 24, 'CE1-U5': 24, 'CE1-U6': 24, 'CE1-U7': 24, 'CE1-U8': 23};
let ce1Lessons = 0;
for (const ref of ce1Catalog.units) {
 const ce1 = read(`ce1/data/${ref.path}`);
 assert.equal(ce1.grade, 'CE1');
 assert.equal(ce1.releaseStatus, 'in_review');
 assert.equal(ce1.lessons.length, ce1UnitCounts[ref.id]);
 // Lot 7b: French language study by « savoir » — grammar, vocabulary, spelling and conjugation in every unit.
 for(const [code,domain] of [['G1','Français · grammaire'],['V1','Français · vocabulaire'],['O1','Français · orthographe'],['C1','Français · conjugaison']]){const l=ce1.lessons.find(x=>x.id===`${ref.id}-${code}`);assert.ok(l&&l.domain===domain&&/tableau (7|8|9|10) /.test(l.source.pages)&&l.practice.length>=2,'CE1 language '+ref.id+'-'+code);}
 // Lot 7d : une leçon de littérature par unité autour de l'œuvre au programme ; le livre n'est pas reproduit et la note éditoriale dit que le guide est écrit sans son texte.
 {const l=ce1.lessons.find(x=>x.id===`${ref.id}-LT`);assert.ok(l&&l.domain==='Français · littérature'&&/tableau 6 \(littérature\), p\. 3[456], /.test(l.source.pages)&&l.practice.length>=2&&/sans le texte du livre/.test(l.editorial.notes),'CE1 literature '+ref.id);}
 // Lot 7c: mathematics by « savoir » — calculation and measures in every unit, numbers and geometry where the existing lessons did not cover them.
 for(const code of ['MC','MM']){const l=ce1.lessons.find(x=>x.id===`${ref.id}-${code}`);assert.ok(l&&l.domain.startsWith('Mathématiques · ')&&/tableau (19|20|21) /.test(l.source.pages)&&l.practice.length>=2,'CE1 maths '+ref.id+'-'+code);}
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
assert.equal(ce1Lessons, 191);
// CE1 QCM reliés : 32 séries (français, mathématiques, anglais et autres matières × 8 unités), chaque question reliée à une leçon de la même unité.
{const bank=read('ce1/data/qcm.json'),unitOf=new Map();assert.equal(bank.grade,'CE1');let n=0;
 for(const ref of ce1Catalog.units)for(const l of read(`ce1/data/${ref.path}`).lessons)unitOf.set(l.id,ref.id);
 for(const s of bank.series){editorial(s);assert.ok(s.id&&s.subject&&s.questions.length,'CE1 QCM series '+s.id);
  for(const q of s.questions){n++;assert.ok(q.id&&q.enonce&&q.corrige,'CE1 QCM '+q.id);assert.ok(q.choix.length>=2&&new Set(q.choix).size===q.choix.length&&Number.isInteger(q.bonne)&&q.bonne>=0&&q.bonne<q.choix.length,'CE1 QCM choices '+q.id);assert.equal(unitOf.get(q.lecon),s.unit,'CE1 QCM lesson '+q.id);}}
 assert.equal(n,184);assert.equal(bank.series.length,32);
 // Lot 7d : deux questions par unité sur l'œuvre de littérature, reliées à la leçon CE1-U<n>-LT.
 for(let u=1;u<=8;u++)assert.equal(bank.series.flatMap(s=>s.questions).filter(q=>q.lecon===`CE1-U${u}-LT`).length,2,'CE1 literature QCM '+u);}
// Lot 4c : chaque classe francophone déclare son sous-système, sa langue et sa classe anglophone jumelle,
// la même que celle que propose l'accueil (familyClasses dans shared/ui.js).
// ADR-013 et ADR-014 : le registre unique des classes (shared/classes.js) est la seule liste de classes ; chaque catalogue
// déclare la jumelle que le registre annonce, chaque page de classe charge le registre avant son moteur, sans configuration en ligne.
{const registry=createRequire(import.meta.url)('../shared/classes.js');assert.deepEqual(registry.classes.map(c=>c.grade),['MS','GS','SIL','CE1','CE2','CLASS1']);
 for(const c of registry.classes.filter(x=>x.subsystem!=='anglophone')){const cat=read(c.catalog),twin=registry.classes.find(x=>x.subsystem==='anglophone'&&x.twin===c.grade);assert.equal(cat.subsystem,'francophone',c.grade);assert.equal(cat.language,'fr',c.grade);assert.deepEqual(cat.twin,{subsystem:'anglophone',grade:c.twin,status:twin?'available':'planned'},'Twin class '+c.grade);assert.ok(Array.isArray(cat[c.group]),'Catalogue group '+c.grade);assert.ok(c.engine==='lessons'&&c.progressKey&&c.home.includes('')&&c.overview,'Class contract '+c.grade);if(c.qcm)read(c.qcm);
  const page=fs.readFileSync(path.join(root,c.dir,'index.html'),'utf8'),at=page.indexOf('shared/classes.js');assert.ok(at>page.indexOf('shared/core.js')&&at<page.indexOf('shared/ui.js'),'Registry order '+c.grade);assert.ok(!/Klassia(Learning|Nursery)Config/.test(page),'Inline class configuration '+c.grade);assert.equal(registry.currentClass('/klassia/'+c.dir).grade,c.grade);assert.equal(registry.currentClass('/klassia/'+c.dir+'index.html').grade,c.grade);}
 // Piste anglophone (lot A2) : une classe en préparation a son catalogue anglophone, en anglais, relié à sa jumelle
 // francophone thème par thème (même rang, même titre français) ; sa page charge la traduction de l'interface après le registre.
 // ADR-018 : la Class 1 est proposée aux familles ; plus aucune classe n'est tenue à l'écart.
 assert.deepEqual(registry.upcoming,[]);const anglophone=registry.classes.filter(c=>c.subsystem==='anglophone');assert.deepEqual(anglophone.map(c=>c.grade),['CLASS1']);
 for(const c of anglophone){const cat=read(c.catalog),twin=registry.classInfo(c.twin),tw=read(twin.catalog);assert.equal(c.language,'en');assert.equal(cat.grade,c.grade);assert.equal(cat.subsystem,'anglophone');assert.equal(cat.language,'en');assert.deepEqual(cat.twin,{subsystem:'francophone',grade:c.twin,status:'available'});
  assert.equal(tw.twin.grade,c.label,'Twin of '+c.twin);assert.equal(cat.units.length,8);cat.units.forEach((u,i)=>{assert.equal(u.id,c.grade+'-T'+(i+1));assert.ok(u.title_en&&(Array.isArray(u.lessons)||u.path)&&u.source_refs?.length,u.id);assert.equal(u.twin,tw.units[i].id);assert.equal(u.title_fr,tw.units[i].title_fr,u.id);});
  // Lots A3 et A4 : par thème, quatre leçons d'English Language, quatre de Mathematics et une de chacune des huit autres matières, d'après les colonnes Class 1 des tableaux 20 à 29 ;
  // chaque leçon remplit les quatre étapes, ses exercices typés sont complets et ses réponses courtes reconnues.
  {const M=createRequire(import.meta.url)('../shared/lesson-model.js'),seen=new Set(),names=cat.subjects.map(s=>s.name);let n=0;
   for(const u of cat.units){const data=u.lessons?u:read(c.dir+'data/'+u.path);assert.equal(data.id,u.id);assert.equal(data.title_en,u.title_en);
    for(const l of data.lessons){n++;assert.ok(!seen.has(l.id)&&new RegExp('^'+u.id+'-((E|M)[1-4]|[SFCVAPNI])$').test(l.id),'Class 1 lesson id '+l.id);seen.add(l.id);assert.ok(names.includes(l.domain),l.id);editorial(l);
     assert.ok(/Level I/.test(l.source?.title)&&/Class 1 column/.test(l.source.pages)&&/table 2\d /.test(l.source.pages)&&l.source.url,'Class 1 source '+l.id);assert.equal(l.domain==='Mathematics',/-M\d$/.test(l.id),l.id);assert.equal(l.domain==='Français',/-F$/.test(l.id),l.id);
     const f=M.filled(M.fromLesson(l));for(const k of ['decouvrir','retenir','exercer','point'])assert.ok(f[k],l.id+' '+k);
     for(const [j,p] of (l.practice||[]).entries()){const id=l.id+':'+j;assert.ok(p.prompt&&p.answer!==undefined&&p.explanation,id);
      if(p.type==='order')assert.ok(p.items?.length>=2,id);if(p.type==='match')assert.ok(p.pairs?.length>=2&&new Set(p.pairs.map(x=>x[1])).size>=2,id);if(p.type==='gaps')assert.ok(/\[\[[^\]]+\]\]/.test(p.text),id);
      if(p.type==='mcq')assert.ok(p.choices?.length>=2&&Number.isInteger(p.correct)&&p.choices[p.correct]===p.answer,id);if(p.type==='number')assert.ok(Number.isFinite(p.answer),id);
      if(p.accept){for(const v of [p.answer,...p.accept])assert.equal(answers.matchAnswer(v,p),'correct',id+' '+v);for(const v of p.reject||[])assert.equal(answers.matchAnswer(v,p),'wrong',id+' '+v);}}
     if(l.accept)for(const v of [l.answer,...l.accept])assert.equal(answers.matchAnswer(v,{accept:l.accept,prompt:l.exercise}),'correct',l.id+' '+v);}}
   assert.equal(n,128,'Class 1: 128 lessons (A3: English Language and Mathematics; A4: one lesson per theme in each of the eight other subjects)');}
  assert.ok(cat.subjects?.length===10&&cat.subjects.every(s=>s.name&&s.hours_per_week&&s.curriculum_table),'Subjects '+c.grade);
  const page=fs.readFileSync(path.join(root,c.dir,'index.html'),'utf8');assert.ok(page.includes('<html lang="en">'));assert.ok(page.indexOf('shared/i18n.js')>page.indexOf('shared/classes.js')&&page.indexOf('shared/i18n.js')<page.indexOf('shared/ui.js'),'Interface translation order '+c.grade);assert.equal(registry.currentClass('/klassia/'+c.dir).grade,c.grade);}
 // M2 : chaque ressource des cinq classes se range dans le modèle commun et remplit Je découvre, Je retiens et Je m'exerce.
 {const M=createRequire(import.meta.url)('../shared/lesson-model.js'),empty=[];let modelled=0;const check=m=>{modelled++;const f=M.filled(m);for(const k of ['decouvrir','retenir','exercer','point'])if(!f[k])empty.push(m.id+' '+k);};
  for(const c of registry.classes){const cat=read(c.catalog);
   if(c.engine==='lessons'&&!c.format)for(const u of cat.units){const data=u.lessons?u:read(c.dir+'data/'+u.path);for(const l of data.lessons)check(M.fromLesson(l));}
   else if(c.format==='nursery')for(const t of cat.themes)for(const d of read(c.dir+'data/themes/'+t.id+'.json').domains)for(const a of d.activities){check(M.fromActivity(a));check(M.fromActivity(a,true));}
   else for(const u of cat.units)for(const sub of read('data/content-u'+Number(u.id.slice(1))+'.json').subjects)for(const l of sub.lessons)check(M.fromCE2(l));}
  assert.deepEqual(empty,[],'Resources missing a lesson step');assert.equal(modelled,335+347+128+2*(168+167),'Common model coverage');}
 for(const f of ['shared/ui.js','shared/search.js','shared/pilot.js','shared/print-page.js','shared/learning-app.js','shared/nursery.js'])assert.ok(/classes|currentClass|classInfo/.test(fs.readFileSync(path.join(root,f),'utf8')),'Registry not used by '+f);}
const gs=read('gs/data/catalog-v13.json');assert.equal(gs.themes.length,8);let gsActivities=0;
for(const ref of gs.themes){const t=read(`gs/data/themes/${ref.id}.json`);assert.equal(t.grade,'GS');assert.equal(t.domains.length,5);for(const d of t.domains)for(const a of d.activities){gsActivities++;assert.ok(!ids.has(a.id),'Duplicate GS activity');ids.add(a.id);editorial(a);nurseryAudio(a);for(const f of ['title_fr','title_en','goal_fr','goal_en','prompt_fr','prompt_en'])assert.ok(a[f],a.id+' '+f);assert.ok(a.steps_fr.length>=3&&a.steps_en.length>=3);assert.ok(a.questions.every(q=>q.fr&&q.en&&q.answer));assert.ok(a.source_refs.length>=1&&a.source_refs.length<=2&&a.source_refs[0].startsWith('FR : tableau'),'GS curriculum reference '+a.id);nurseryPath(a,'GS');assert.ok(a.materials.length&&a.observe.length);
 // Lot 6b: no generated filler left in GS activities; steps, materials and observation points are specific.
 assert.ok(a.duration_minutes>0&&a.materials_en?.length===a.materials.length,'GS parent card '+a.id);assert.equal(a.steps_fr.length,a.steps_en.length,'GS steps '+a.id);assert.equal(a.observe_en?.length,a.observe.length,'GS observation in English '+a.id);
 assert.ok(!a.steps_fr.some(s=>s.startsWith('Préparer avec l’adulte :'))&&!a.materials.some(m=>/décrits dans la consigne|^papier et crayons$/.test(m))&&!a.observe.some(o=>o.startsWith('Répond ou montre sa démarche')||o==='Comprend la consigne et commence avec une aide adaptée.'),'GS generated filler '+a.id);}}assert.equal(gsActivities,167);
const lex=read('data/bassa-lexicon-variants.json'),bm=read('data/bassa-lessons.json');
// Lot 8c : notions communes des leçons de langue nationale. Les 29 mots du quotidien gardent leurs identifiants (clés des
// enregistrements familiaux) ; chaque forme bassa documentée renvoie à une seule notion ; chaque leçon trouve ses notions.
{const lcn=read('data/lcn-concepts.json'),themes=new Set(lcn.themes.map(t=>t.id)),ids=new Set(),bassa=new Map();
 for(const c of lcn.concepts){assert.ok(/^[a-z_]+$/.test(c.id)&&!ids.has(c.id)&&themes.has(c.theme)&&c.icon&&c.fr&&c.en,'LCN concept '+c.id);ids.add(c.id);for(const b of c.bassa||[]){assert.ok(!bassa.has(b),'Bassa form in two concepts '+b);bassa.set(b,c.id);}}
 assert.deepEqual(lcn.concepts.filter(c=>c.daily).map(c=>c.id),['hello','thanks','please','howareyou','goodbye','goodnight','mother','father','child','grandmother','grandfather','baby','eyes','ear','nose','mouth','hand','foot','one','two','three','four','five','house','water','eat','bed','sleep','fire']);
 assert.deepEqual([...bassa.keys()].sort(),lex.entries.map(e=>e.id).sort(),'Every documented Bassa entry has a concept');
 for(const [k,row] of Object.entries(bm.lessons))assert.ok(row.concept_ids.every(id=>bassa.has(id)),'LCN lesson concepts '+k);}
validateBassaRecordings(root,lex.entries);
for(const [lesson,row] of Object.entries(bm.lessons)){assert.ok(row.concept_ids.length,lesson);for(const id of row.concept_ids)assert.ok(lex.entries.some(x=>x.id===id&&x.forms.length&&x.sources.length),lesson+' '+id);}
for(const f of ['shared/correction.js','shared/exercises.js','shared/search.js','shared/pilot.js','shared/speech.js','shared/bassa.js','shared/bassa-recorder.js','shared/learning-app.js','shared/workshop.js','shared/activity.js','pwa.js','service-worker.js','shared/core.js','shared/ui.js','shared/nursery.js','shared/nursery-support.js','shared/i18n.js'])execFileSync(process.execPath,['--check',path.join(root,f)]);
assert.equal(lessons,682);assert.equal(learningShortAnswers,254);assert.equal(checkedFormats,61);assert.equal(sil5c,22);assert.equal(activities,168);assert.deepEqual(nurseryPaths,{MS:{base:149,plus:19},GS:{base:143,plus:24}});assert.equal(read('data/coverage.json').items.length,1145);assert.equal(questions,read('docs/metrics.json').storedQuestions);
console.log(`Validated structure: ${lessons} lessons, ${activities} MS + ${gsActivities} GS activities, ${questions} stored questions, ${shortAnswers} CE2 + ${learningShortAnswers} SIL/CE1 short answers with automatic check. Editorial validation is separate.`);
