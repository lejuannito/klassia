import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
import {validateBassaRecordings} from './validate-bassa-recordings.mjs';
const root=path.resolve(import.meta.dirname,'..');const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
if(process.argv.includes('--public'))execFileSync(process.execPath,[path.join(root,'scripts/validate.mjs'),'--public'],{stdio:'inherit'});
const bassaLexicon='data/bassa-lexicon-variants.json';
validateBassaRecordings(root,JSON.parse(fs.readFileSync(path.join(root,bassaLexicon),'utf8')).entries);
const names=['search.html','shared/search.js','shared/classes.js','shared/encouragement.js','shared/lesson-model.js','shared/lesson-steps.js','shared/qcm.js','shared/search.css','index.html','service-worker.js','app.js','style.css','v9.js','v9.css','manual-v11.css','class-switch-v12.js','v14.js','v14.css','pwa.js','manifest.webmanifest','shared/core.js','shared/navigation.js','shared/ui.js','shared/style.css','shared/learning-app.js','data/catalog.json','data/coverage.json',bassaLexicon,'data/ce2-practice-v14.json','ms/index.html','ms/app-core-v13.js','ms/app-ui-v13.js','ms/style-v13.css','ms/ms-v14.js','ms/ms-v14.css','ms/practice-v14.json','ms/data/catalog-v13.json','sil/index.html','sil/style.css','sil/data/curriculum.json','ce1/index.html','ce1/data/catalog.json','ce1/data/qcm.json',...JSON.parse(fs.readFileSync(path.join(root,'ce1/data/catalog.json'),'utf8')).units.map(u=>'ce1/data/'+u.path)];
for(let i=1;i<=8;i++)names.push(`data/content-u${i}.json`,`data/qcm-u${i}.json`,`ms/data/themes/T${i}.json`,`sil/data/sil-u${i}.json`);
names.push('shared/speech.js','shared/bassa.js','shared/bassa-recorder.js','data/bassa-lessons.json','data/bassa-ecriture.json','gs/index.html','gs/practice-v14.json','gs/data/catalog-v13.json','gs/data/curriculum-map.json');
names.push('pilote.html','shared/pilot.js','shared/pilot.css');
names.push('shared/week.js','data/manuels/champions-francais-ce2.json','data/manuels/champions-francais-sil.json');
names.push('shared/correction.js', 'shared/exercises.js', 'shared/ink.js', 'outils.html', 'shared/reference.js', 'shared/reference.css');
names.push('maison.html', 'shared/home-language.js', 'shared/lcn.js', 'data/lcn-concepts.json');
names.push('imprimer.html','shared/print.js','shared/print-page.js','shared/print-ce2.js','shared/print-nursery.js','shared/print.css','shared/lesson-support.js','ms/nursery-support.js');
for(let i=1;i<=8;i++)names.push(`gs/data/themes/T${i}.json`);
const assets=path.join(root,'assets');if(fs.existsSync(assets))for(const f of fs.readdirSync(assets))names.push('assets/'+f);
// Icons and install screenshots are optional presentation assets, not learning dependencies.
// Téléchargement par classe (lot 9c) : les données et les sons propres à une classe forment son paquet ; le code, les pages,
// les catalogues et les ressources partagées forment le paquet commun. Un son appartient à une classe s'il n'est cité que par
// les données de cette classe.
const {classes}=createRequire(import.meta.url)('../shared/classes.js');
function dataPack(url){
 if(!url.endsWith('.json'))return null;
 if(url==='data/coverage.json')return 'ATELIER'; // inventaire de la revue éditoriale, pour l'atelier pédagogique seulement
 for(const c of classes)if(c.dir&&url.startsWith(c.dir)&&url!==c.catalog)return c.grade;
 if(/^data\/(content-u\d|qcm-u\d|ce2-practice-v14)\.json$/.test(url)||url==='data/manuels/champions-francais-ce2.json')return 'CE2';
 if(url==='data/manuels/champions-francais-sil.json')return 'SIL';
 return null;
}
const citedBy=new Map();
for(const url of names){const g=dataPack(url);if(!g)continue;for(const m of fs.readFileSync(path.join(root,url),'utf8').matchAll(/assets\/([\w.-]+)/g)){const a='assets/'+m[1];if(!citedBy.has(a))citedBy.set(a,new Set());citedBy.get(a).add(g);}}
const packOf=url=>url.startsWith('assets/')?(citedBy.get(url)?.size===1?[...citedBy.get(url)][0]:null):dataPack(url);
const files=names.sort().map(url=>{const bytes=fs.readFileSync(path.join(root,url)),pack=packOf(url);return {url:'./'+url,sha256:sha(bytes),size:bytes.length,...(pack?{pack}:{})};});
const packs={};for(const f of files){const k=f.pack||'common';packs[k]??={files:0,bytes:0};packs[k].files++;packs[k].bytes+=f.size;}
const version=sha(JSON.stringify(files));fs.writeFileSync(path.join(root,'precache-manifest.js'),'self.KLASSIA_RELEASE = '+JSON.stringify({version,packs,files},null,2)+';\n');
console.log(`Release ${version.slice(0,12)}: ${files.length} critical assets · `+Object.entries(packs).map(([k,v])=>`${k} ${(v.bytes/1e6).toFixed(2)} Mo`).join(', '));
