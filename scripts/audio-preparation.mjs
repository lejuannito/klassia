import fs from 'node:fs';import crypto from 'node:crypto';import {createRequire} from 'node:module';
const read=p=>JSON.parse(fs.readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const {segments}=createRequire(import.meta.url)('../shared/speech.js');
const takes=read('data/writing-models.json').items.map(m=>({id:m.id,grade:m.grade,language:m.lang,text:m.copy,role:m.dictation?'copy_and_dictation':'copy_model'}));
for(const dir of ['nursery1','nursery2'])for(let i=1;i<=8;i++){
 const t=read(`${dir}/data/themes/T${i}.json`),a=t.domains.flatMap(d=>d.activities).find(a=>a.story_en);
 if(a)takes.push({id:a.id,grade:t.grade,language:'en',text:a.story_en,role:'story'});
}
const output={format:'klassia-audio-preparation',version:1,notice:'Textes de travail à relire avant enregistrement. Aucun fichier sonore ni accord de diffusion n’est créé par ce script. Voix humaines, prononciation, identité du lecteur, accord et écoute finale doivent être consignés avant publication. Pour le bassa, utiliser l’atelier et ses prises déjà référencées ; aucune synthèse FR/EN.',takes:takes.map(t=>({...t,content_version:'sha256:'+crypto.createHash('sha256').update(t.text).digest('hex'),segments:segments(t.text),status:'text_in_review',recording:null,reviewer:null,consent_reference:null}))};
fs.writeFileSync(new URL('../docs/audio-preparation.json',import.meta.url),JSON.stringify(output,null,1)+'\n');console.log(`${takes.length} scripts de prise préparés`);
