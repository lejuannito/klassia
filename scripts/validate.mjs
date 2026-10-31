import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {execFileSync} from 'node:child_process';
const root=path.resolve(import.meta.dirname,'..'),read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));let lessons=0,activities=0,questions=0;const ids=new Set();
const published=process.argv.includes('--public');
function editorial(x){assert.ok(['draft','in_review','validated','published','withdrawn'].includes(x.editorial?.status),'Editorial status required');if(published){assert.equal(x.editorial.status,'published','Public release blocked: pedagogical validation pending');assert.ok(x.editorial.reviewer&&x.editorial.validated_at,'Named review and date required');}}
for(let i=1;i<=8;i++){
 const c=read(`data/content-u${i}.json`),q=read(`data/qcm-u${i}.json`);
 for(const s of c.subjects){assert.equal(s.assessment.items.reduce((n,e)=>n+e.points,0),s.assessment.total);for(const l of s.lessons){lessons++;assert.ok(!ids.has(l.id));ids.add(l.id);assert.ok(l.source&&l.objectives.length&&l.learn.length);editorial(l);for(const e of l.exercises){assert.ok(e.id&&e.prompt);assert.ok(['open','mcq','number'].includes(e.type));if(e.type==='mcq'){assert.ok(Number.isInteger(e.correct_choice));assert.equal(e.answer,e.choices[e.correct_choice]);}if(e.type==='number')assert.ok(Number.isFinite(e.answer));}if(l.figure)assert.ok(fs.existsSync(path.join(root,l.figure.src)));}}
 for(const e of q.epreuves)for(const x of e.questions){questions++;assert.ok(x.id&&x.choix.length>=2&&new Set(x.choix).size===x.choix.length,x.id);assert.ok(Number.isInteger(x.bonne)&&x.bonne>=0&&x.bonne<x.choix.length);if(published)assert.equal(x.editorial_status,'published');}
 const t=read(`ms/data/themes/T${i}.json`),seen=new Set();for(const d of t.domains)for(const a of d.activities){activities++;assert.ok(!seen.has(a.id));seen.add(a.id);editorial(a);assert.ok(a.title_fr&&a.title_en&&a.goal_fr&&a.goal_en);if(a.figure)assert.ok(fs.existsSync(path.join(root,'ms',a.figure.src)));}
}
for(const f of ['app.js','v9.js','v14.js','pwa.js','service-worker.js','shared/core.js','shared/ui.js','class-switch-v12.js','ms/app-core-v13.js','ms/app-ui-v13.js','ms/ms-v14.js'])execFileSync(process.execPath,['--check',path.join(root,f)]);
assert.equal(lessons,347);assert.equal(activities,160);assert.equal(read('data/coverage.json').items.length,507);assert.equal(questions,read('docs/metrics.json').storedQuestions);
console.log(`Validated structure: ${lessons} lessons, ${activities} activities, ${questions} stored questions. Editorial validation is separate.`);
