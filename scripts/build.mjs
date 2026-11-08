import {execFileSync} from 'node:child_process';
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
import {validateBassaRecordings} from './validate-bassa-recordings.mjs';
const root=path.resolve(import.meta.dirname,'..');const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
if(process.argv.includes('--public'))execFileSync(process.execPath,[path.join(root,'scripts/validate.mjs'),'--public'],{stdio:'inherit'});
const bassaLexicon='data/bassa-lexicon-variants.json';
validateBassaRecordings(root,JSON.parse(fs.readFileSync(path.join(root,bassaLexicon),'utf8')).entries);
const names=['search.html','shared/search.js','shared/search.css','index.html','service-worker.js','app.js','style.css','v9.js','v9.css','manual-v11.css','class-switch-v12.js','v14.js','v14.css','pwa.js','manifest.webmanifest','shared/core.js','shared/navigation.js','shared/ui.js','shared/style.css','shared/learning-app.js','data/catalog.json','data/coverage.json',bassaLexicon,'data/ce2-practice-v14.json','ms/index.html','ms/app-core-v13.js','ms/app-ui-v13.js','ms/style-v13.css','ms/ms-v14.js','ms/ms-v14.css','ms/practice-v14.json','ms/data/catalog-v13.json','sil/index.html','sil/style.css','sil/data/curriculum.json','ce1/index.html','ce1/data/catalog.json',...JSON.parse(fs.readFileSync(path.join(root,'ce1/data/catalog.json'),'utf8')).units.map(u=>'ce1/data/'+u.path)];
for(let i=1;i<=8;i++)names.push(`data/content-u${i}.json`,`data/qcm-u${i}.json`,`ms/data/themes/T${i}.json`,`sil/data/sil-u${i}.json`);
names.push('shared/speech.js','shared/bassa.js','shared/bassa-recorder.js','data/bassa-lessons.json','gs/index.html','gs/practice-v14.json','gs/data/catalog-v13.json','gs/data/curriculum-map.json');
names.push('pilote.html','shared/pilot.js','shared/pilot.css');
names.push('shared/correction.js');
names.push('imprimer.html','shared/print.js','shared/print-page.js','shared/print-ce2.js','shared/print-nursery.js','shared/print.css','shared/lesson-support.js','ms/nursery-support.js');
for(let i=1;i<=8;i++)names.push(`gs/data/themes/T${i}.json`);
const assets=path.join(root,'assets');if(fs.existsSync(assets))for(const f of fs.readdirSync(assets))names.push('assets/'+f);
// Icons and install screenshots are optional presentation assets, not learning dependencies.
const files=names.sort().map(url=>({url:'./'+url,sha256:sha(fs.readFileSync(path.join(root,url)))}));
const version=sha(JSON.stringify(files));fs.writeFileSync(path.join(root,'precache-manifest.js'),'self.KLASSIA_RELEASE = '+JSON.stringify({version,files},null,2)+';\n');
console.log(`Release ${version.slice(0,12)}: ${files.length} critical assets`);
