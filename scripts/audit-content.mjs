import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const root=path.resolve(import.meta.dirname,'..'),read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const {classes}=createRequire(import.meta.url)('../shared/classes.js');
const items=read('data/coverage.json').items,warnings=[],resources=[],units=[];
for(const c of classes){
 const cat=read(c.catalog),refs=cat[c.group];
 for(const ref of refs){
  const file=c.format==='ce2'?ref.content:c.format==='nursery'?`${c.dir}data/themes/${ref.id}.json`:`${c.dir}data/${ref.path}`;
  const u=read(file),list=c.format==='ce2'?u.subjects.flatMap(s=>s.lessons.map(l=>({...l,domain:s.name}))):c.format==='nursery'?u.domains.flatMap(d=>d.activities.map(a=>({...a,domain:d.name_en||d.name_fr}))):u.lessons;
  for(const l of list){
   const nursery=c.format==='nursery',en=c.language==='en',id=l.id;
   const required=nursery?[['goal',l.goal_en||l.goal_fr],['steps',l.steps_en||l.steps_fr||l.game_en||l.game_fr||l.activity_en||l.activity_fr||l.story_en||l.story_fr||l.course],['sources',l.source_refs]]:c.format==='ce2'?[['objectives',l.objectives],['discovery',l.discover],['exercises',l.exercises]]:[['objective',l.objective],['course',l.course],['model',l.model],['guided',l.guided],['exercise',l.exercise],['answer',l.answer],['remediation',l.remediation],['source',l.source?.pages]];
   const missing=required.filter(([,v])=>!v||Array.isArray(v)&&!v.length).map(([k])=>k);
   if(missing.length)warnings.push({grade:c.grade,id,issue:'Champs à examiner',fields:missing});
   if(/réponse lue|valeur indiquée|réponse vérifiée sur le tableau/i.test(l.answer||''))warnings.push({grade:c.grade,id,issue:'Correction sans valeur explicite : vérifier le support.'});
   const practice=l.practice||l.exercises||[],unexplained=practice.filter(p=>!p.explanation&&!/national|bassa/i.test(l.domain)).length;
   if(unexplained)warnings.push({grade:c.grade,id,issue:'Exercices sans explication attachée',count:unexplained});
   const mapping=items.find(x=>x.grade===c.grade&&(x.id===id||x.id===u.id+'-'+id));
   resources.push({grade:c.grade,unit:ref.id,id:mapping?.id||id,subject:l.domain,title:l.title||l.title_en||l.title_fr,objective:l.objective||l.goal_en||l.goal_fr||(l.objectives||[]).join(' / '),components:(l.competencies||[l.area]).filter(Boolean).join(' / '),source:mapping?.source||'',source_url:l.source?.url||'',practice_count:practice.length,missing_fields:missing.join(', '),status:l.editorial?.status||'in_review',official_competency_id:mapping?.official_competency_id||null,mapping_status:mapping?.mapping_status||'to_check'});
  }
  units.push({grade:c.grade,unit:ref.id,resources:list.length,subjects:[...new Set(list.map(l=>l.domain))],integration_project:Boolean(u.integration_project||u.project),status:'prepared_for_review',curriculum_completeness:'not_established'});
 }
}
const grades=classes.map(c=>{const rows=items.filter(x=>x.grade===c.grade);return {grade:c.grade,resources:rows.length,genericDiscoveries:rows.filter(x=>x.generic_discovery).map(x=>x.id),unverifiedCurriculumMappings:rows.filter(x=>!x.official_competency_id).length};});
const notice='Audit structurel des dix classes, pas une validation pédagogique. Un thème pourvu, un projet et un nombre de ressources ne prouvent pas la couverture exhaustive des attendus. Les correspondances au programme et la répartition mensuelle sont proposées, à comparer colonne par colonne aux référentiels par les relecteurs.';
fs.writeFileSync(path.join(root,'docs/content-audit.json'),JSON.stringify({notice,grades,units,warnings},null,2)+'\n');
const columns=['grade','unit','subject','id','title','objective','components','source','source_url','practice_count','missing_fields','status','mapping_status','official_competency_id'];
const csv=v=>'"'+String(v??'').replaceAll('"','""')+'"';
fs.writeFileSync(path.join(root,'docs/matrice-anglophone.csv'),'\uFEFF'+columns.map(csv).join(';')+'\n'+resources.filter(r=>r.grade.startsWith('CLASS')||r.grade.startsWith('NURSERY')).map(r=>columns.map(k=>csv(r[k])).join(';')).join('\n')+'\n');
console.log(JSON.stringify({resources:resources.length,grades:grades.length,units:units.length,warnings:warnings.length,anglophoneMatrix:resources.filter(r=>/^(CLASS|NURSERY)/.test(r.grade)).length}));
