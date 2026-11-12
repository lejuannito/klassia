const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const {accepts}=require('../shared/bassa.js'),lex=read('data/bassa-lexicon-variants.json');
test('every displayed Bassa form is accepted, including equivalent Unicode and spacing',()=>{for(const e of lex.entries)for(const form of e.forms){assert.ok(accepts(e,form),e.concept+' '+form);assert.ok(accepts(e,'  '+form.normalize('NFD')+'  '));assert.ok(!accepts(e,''));}assert.ok(!accepts(lex.entries[0],'not a documented answer'));});

// Lot 8b : saisie sans marques de ton acceptée avec rappel de la forme ; les lettres ne sont pas rapprochées ; repères d'écriture sourcés.
test('tone-free typing matches the documented form, letters stay distinct, writing notes are sourced',()=>{
 const {toneless,tonelessMatch,KEYS}=require('../shared/bassa.js'),w=read('data/bassa-ecriture.json');
 for(const e of lex.entries)for(const form of e.forms){assert.ok(tonelessMatch(e,toneless(form)),e.concept+' '+form);assert.equal(tonelessMatch(e,''),null);}
 const sample={forms:['Ntôñ diséé','ŋɛ̂m']};
 assert.equal(tonelessMatch(sample,'ntoñ disee'),'Ntôñ diséé');assert.equal(tonelessMatch(sample,'ŋɛm'),'ŋɛ̂m');
 assert.equal(tonelessMatch(sample,'nton disee'),null,'ñ is a letter, not a tone');assert.equal(tonelessMatch(sample,'nem'),null,'ŋ and ɛ are letters');
 assert.ok(!accepts(sample,'ŋɛm'),'Exact acceptance is unchanged');
 assert.equal(w.status,'documented_pending_review');assert.match(w.notice,/ne valident aucune forme/);assert.deepEqual(w.keys,KEYS);
 const ids=new Set(w.sources.map(x=>x.id));assert.ok(w.sources.every(x=>x.title&&/^https:\/\//.test(x.url)));
 for(const x of [...w.letters,...w.tones])assert.ok(ids.has(x.source),'Unsourced writing note');assert.ok(ids.has(w.examples_source)&&w.examples.every(x=>x.form&&x.gloss));
 assert.deepEqual(w.tones.map(x=>x.mark),['\u0301','','\u0300','\u0302','\u030C']);for(const t of w.tones)if(t.mark)assert.ok(t.example.normalize('NFD').includes(t.mark),t.name);
});

test('a Bassa MP3 needs an exact form, approval references and matching bytes', async t => {
 const { createHash } = require('node:crypto');
 const { tmpdir } = require('node:os');
 const { validateBassaRecordings } = await import('../scripts/validate-bassa-recordings.mjs');
 const fixtureRoot = fs.mkdtempSync(path.join(tmpdir(), 'klassia-bassa-'));
 t.after(() => fs.rmSync(fixtureRoot, { recursive: true, force: true }));
 fs.mkdirSync(path.join(fixtureRoot, 'assets'));
 const entry = { id: 'BA004', forms: ['málêt'] };
 const bytes = fs.readFileSync(path.join(root, 'assets/sil-u4-l01-lou-a-mal.mp3'));
 const clip = {
  form: 'málêt', sense: 'enseignant(e)', src: 'assets/bassa-ba004-01.mp3',
  reviewed_on: '2026-11-07', review_ref: 'TEST-REVUE', consent_ref: 'TEST-ACCORD',
  sha256: createHash('sha256').update(bytes).digest('hex')
 };
 const validate = (...recordings) => validateBassaRecordings(fixtureRoot, [{ ...entry, recordings }]);
 assert.throws(() => validate(clip), /Missing or empty Bassa recording/);
 const file = path.join(fixtureRoot, clip.src);
 fs.writeFileSync(file, bytes);
 assert.throws(() => validate(), /without a publishable record/);
 for (const invalid of [
  { form: 'malet' }, { src: 'assets/bassa-ba005-01.mp3' }, { reviewed_on: '2026-02-30' },
  { review_ref: '' }, { consent_ref: '' }
 ]) {
  assert.throws(() => validate({ ...clip, ...invalid }), /Invalid Bassa recording metadata/);
 }
 assert.doesNotThrow(() => validate(clip));
 assert.throws(() => validate(clip, clip), /Duplicate Bassa recording/);
 fs.appendFileSync(file, 'changed');
 assert.throws(() => validate(clip), /differs from the approved file/);
});

test('all national-language lessons have live sourced Bassa translations',()=>{
 const map=read('data/bassa-lessons.json').lessons,ids=new Set(lex.entries.map(x=>x.id)),expected=[];
 for(let u=1;u<=8;u++){
  for(const s of read(`data/content-u${u}.json`).subjects)if(s.id==='BA')for(const l of s.lessons)expected.push('CE2:'+l.id);
  for(const [g,p] of [['SIL',`sil/data/sil-u${u}.json`],['CE1',`ce1/data/unit${u}.json`]])for(const l of read(p).lessons)if(l.domain.includes('national'))expected.push(g+':'+l.id);
  for(const g of ['MS','GS'])for(const d of read(`${g.toLowerCase()}/data/themes/T${u}.json`).domains)for(const a of d.activities)if(a.type==='bassa')expected.push(g+':'+a.id);
 }
 assert.equal(expected.length,45);for(const key of expected){assert.ok(map[key]?.concept_ids.length,key);for(const id of map[key].concept_ids)assert.ok(ids.has(id),id);}
});
test('GS activities have supplied stories, bilingual tasks and coherent counting answers',()=>{let count=0;for(let u=1;u<=8;u++){const t=read(`gs/data/themes/T${u}.json`);for(const d of t.domains)for(const a of d.activities){count++;if(['story','poem'].includes(a.type))assert.ok(a.story_fr&&a.story_en,a.id);if(a.interactive){const dots=a.visual.items.join('').split('●').length-1;assert.equal(dots,a.interactive.answer,a.id);}}}assert.equal(count,167);});

test('GS tracing models cover all 26 letters without duplication',()=>{const p=read('gs/practice-v14.json');assert.equal(Object.values(p.themes).flatMap(t=>t.letters).join(''),'ABCDEFGHIJKLMNOPQRSTUVWXYZ');});

// Lot 8c : une leçon de langue nationale vise des notions, reliées au bassa documenté et aux mots de la famille.
test('a national-language lesson finds its concepts, whatever the family language',async()=>{
 const L=require('../shared/lcn.js'),data=await L.load(async p=>read(p));
 const sil=L.conceptsFor(data,'SIL','SIL-U1-L10').map(c=>c.id);assert.ok(sil.length>0);
 const ce2=L.conceptsFor(data,'CE2','BA-U3-L1').map(c=>c.id);assert.ok(ce2.includes('classroom')&&ce2.includes('teacher'));
 assert.deepEqual(L.conceptsFor(data,'CE1','CE1-U1-L01'),[],'not a national-language lesson');
 const car=data.concepts.find(c=>c.id==='car');assert.deepEqual(car.bassa,['BA039','BA043']);
 const dup=L.conceptsFor({concepts:data.concepts,lessons:{'X:1':{concept_ids:['BA039','BA043']}}},'X','1');assert.equal(dup.length,1,'one concept once');
});
