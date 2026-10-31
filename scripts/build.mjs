import {execFileSync} from 'node:child_process';
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
const root=path.resolve(import.meta.dirname,'..');const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
if(process.argv.includes('--public'))execFileSync(process.execPath,[path.join(root,'scripts/validate.mjs'),'--public'],{stdio:'inherit'});
const names=['index.html','service-worker.js','app.js','style.css','v9.js','v9.css','manual-v11.css','class-switch-v12.js','v14.js','v14.css','pwa.js','manifest.webmanifest','shared/core.js','shared/ui.js','shared/style.css','shared/learning-app.js','data/catalog.json','data/coverage.json','data/bassa-lexicon-variants.json','data/ce2-practice-v14.json','ms/index.html','ms/app-core-v13.js','ms/app-ui-v13.js','ms/style-v13.css','ms/ms-v14.js','ms/ms-v14.css','ms/practice-v14.json','ms/data/catalog-v13.json','sil/index.html','sil/style.css','sil/data/curriculum.json','ce1/index.html','ce1/data/catalog.json',...JSON.parse(fs.readFileSync(path.join(root,'ce1/data/catalog.json'),'utf8')).units.map(u=>'ce1/data/'+u.path)];
for(let i=1;i<=8;i++)names.push(`data/content-u${i}.json`,`data/qcm-u${i}.json`,`ms/data/themes/T${i}.json`,`sil/data/sil-u${i}.json`);
const assets=path.join(root,'assets');if(fs.existsSync(assets))for(const f of fs.readdirSync(assets))names.push('assets/'+f);
// Icons and install screenshots are optional presentation assets, not learning dependencies.
const files=names.sort().map(url=>({url:'./'+url,sha256:sha(fs.readFileSync(path.join(root,url)))}));
const version=sha(JSON.stringify(files));fs.writeFileSync(path.join(root,'precache-manifest.js'),'self.KLASSIA_RELEASE = '+JSON.stringify({version,files},null,2)+';\n');
console.log(`Release ${version.slice(0,12)}: ${files.length} critical assets`);
