const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const {accepts}=require('../shared/bassa.js'),lex=read('data/bassa-lexicon-variants.json');
test('every displayed Bassa form is accepted, including equivalent Unicode and spacing',()=>{for(const e of lex.entries)for(const form of e.forms){assert.ok(accepts(e,form),e.concept+' '+form);assert.ok(accepts(e,'  '+form.normalize('NFD')+'  '));assert.ok(!accepts(e,''));}assert.ok(!accepts(lex.entries[0],'not a documented answer'));});

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
test('GS activities have supplied stories, bilingual tasks and coherent counting answers',()=>{let count=0;for(let u=1;u<=8;u++){const t=read(`gs/data/themes/T${u}.json`);for(const d of t.domains)for(const a of d.activities){count++;if(['story','poem'].includes(a.type))assert.ok(a.story_fr&&a.story_en,a.id);if(a.interactive){const dots=a.visual.items.join('').split('●').length-1;assert.equal(dots,a.interactive.answer,a.id);}}}assert.equal(count,162);});

test('GS tracing models cover all 26 letters without duplication',()=>{const p=read('gs/practice-v14.json');assert.equal(Object.values(p.themes).flatMap(t=>t.letters).join(''),'ABCDEFGHIJKLMNOPQRSTUVWXYZ');});
