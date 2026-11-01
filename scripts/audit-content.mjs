import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..'),read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const items=read('data/coverage.json').items;
const grades=['MS','GS','SIL','CE1','CE2'].map(grade=>{const rows=items.filter(x=>x.grade===grade);return {grade,resources:rows.length,genericDiscoveries:rows.filter(x=>x.generic_discovery).map(x=>x.id),unverifiedCurriculumMappings:rows.filter(x=>!x.official_competency_id).length};});
const warnings=[],supportLessons=[],additionalPractice=[];
for(const grade of ['sil','ce1']){
 const catalog=read(grade==='sil'?'sil/data/curriculum.json':'ce1/data/catalog.json');
 for(const u of catalog.units)for(const l of read(`${grade}/data/${u.path}`).lessons){
  if(l.support)supportLessons.push(l.id);
  for(const [index,p] of (l.practice||[]).entries())additionalPractice.push({lesson:l.id,index:index+1,prompt:p.prompt});
  if(/réponse lue|valeur indiquée|réponse vérifiée sur le tableau/i.test(l.answer))warnings.push({id:l.id,issue:'Correction sans valeur explicite : vérifier le support.'});
  if(l.domain==='Langues et cultures nationales'&&!l.proposedWords?.length)warnings.push({id:l.id,issue:'Aucune proposition lexicale attachée : vérifier si l’objectif en exige.'});
 }
}
const report={notice:'Indicateurs structurels et alertes heuristiques, pas une validation pédagogique. Les alertes ne recensent pas tous les défauts de contenu.',grades,supportLessons,additionalPractice,warnings};
fs.writeFileSync(path.join(root,'docs/content-audit.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({resources:items.length,additionalPractice:additionalPractice.length,supportLessons:supportLessons.length,warnings:warnings.length}));
