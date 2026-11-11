import {printCE2} from './print-ce2.js';
import {printNursery} from './print-nursery.js';

const E = Klassia.escape;
const $ = id => document.getElementById(id);
const grades = {CE2:'CE2', MS:'Moyenne section', GS:'Grande section', SIL:'SIL', CE1:'CE1'};
const base = new URL('./', location.href);
const params = new URL(location.href).searchParams;
const grade = params.get('classe'), kind = params.get('fiche');
const unit = params.get('unite') || '', id = params.get('id');
const adult = params.get('mode') === 'adulte';

async function get(path) {
 const response = await fetch(new URL(path, base));
 if (!response.ok) throw Error('Ressource indisponible.');
 return response.json();
}

async function printPrimary({grade,kind,unit,id,adult,get,asset}) {
 const directory = grade.toLowerCase()+'/';
 const path = directory+'data/'+(grade==='SIL'?'curriculum.json':'catalog.json');
 const catalog = await get(path);
 const selected = catalog.units.find(u=>u.id===unit);
 const data = selected?.lessons ? selected : selected && await get(directory+'data/'+selected.path);
 const l = kind==='lecon' && data?.lessons.find(item=>item.id===id);
 if (!l) throw Error('Leçon introuvable.');
 const en = l.domain.startsWith('English');
 const paragraph = text => `<p class="preserve-lines">${E(text)}</p>`;
 const section = (title,text) => `<section><h2>${title}</h2>${paragraph(text)}</section>`;
 const correction = (answer,explanation) => adult
  ? `<div class="print-answer"><b>${en?'Suggested answer':'Correction proposée'}</b>${paragraph(answer)}${explanation?paragraph(explanation):''}</div>`
  : '<div class="answer-lines"></div>';
 // Checked formats on paper: the gaps become lines, the cards and the right-hand column are given out of order.
 const turn = a => a.map((x,i) => a[(i+1)%a.length]);
 const material = p => p.type==='gaps' ? paragraph(String(p.text).replace(/\[\[[^\]]+\]\]/g,'________'))
  : p.type==='order' ? `<p>${turn(p.items).map(E).join(' · ')}</p>`
  : p.type==='match' ? `<table class="print-match"><tbody>${p.pairs.map((x,i)=>`<tr><td>${E(x[0])}</td><td>•&nbsp;&nbsp;&nbsp;•</td><td>${E(turn(p.pairs)[i][1])}</td></tr>`).join('')}</tbody></table>` : '';
 const practice = (l.practice||[]).map((p,index)=>
  `<section class="print-question"><h2>${en?'Practice':'Entraînement'} ${index+2}</h2>${paragraph(p.prompt)}${material(p)}${p.listen&&adult?section(en?'Message to read aloud':'Message à lire à voix haute',p.listen):''}${p.type&&!adult&&p.type!=='order'?'':correction(p.answer,p.explanation)}</section>`).join('');
 const guide = adult ? `<section><h2>${en?'Adult guide':'Guide adulte'}</h2>${paragraph(l.remediation)}${paragraph(l.transfer)}${paragraph(l.materials)}</section>` : '';
 return {title:l.title,back:'./'+directory+'#lesson:'+encodeURIComponent(id),body:`<article lang="${en?'en':'fr'}">
  ${section(en?'Learning goal':'Objectif',l.objective)}
  ${l.prerequisites?section(en?'Before starting':'Avant de commencer',l.prerequisites):''}
  ${section(en?'Understand':'Comprendre',l.course)}
  ${Klassia.lessonSupport(l.support,'',asset)}
  ${section(en?'Worked example':'Exemple expliqué',l.model)}
  ${section(en?'Practise together':'Ensemble',l.guided)}
  <section class="print-question"><h2>${en?'Your turn':'À toi de jouer'}</h2>${paragraph(l.exercise)}${correction(l.answer)}</section>
  ${practice}${guide}</article>`};
}

async function prepare() {
 const nursery = grade==='MS' || grade==='GS';
 if (!Object.hasOwn(grades,grade) || !(nursery?/^T[1-8]$/:grade==='CE2'?/^U[1-8]$/:new RegExp('^'+grade+'-U[1-8]$')).test(unit)) {
  throw Error('Lien de fiche incomplet.');
 }
 const asset = src => new URL(src, new URL(grade==='CE2'?'./':grade.toLowerCase()+'/',base)).href;
 const render = nursery ? printNursery : grade==='CE2' ? printCE2 : printPrimary;
 const sheet = await render({grade,kind,unit,id,adult,get,asset});
 $('printBack').href = new URL(sheet.back,base);
 $('printTitle').textContent = sheet.title;
 document.title = sheet.title+' · Klassia';
 $('printLabel').textContent = 'Klassia · '+grades[grade]+' · '+(adult?'Guide et corrigé adulte':'Fiche élève');
 $('printBody').innerHTML = sheet.body;
 $('printDocument').hidden = false;
 if (sheet.adultVariant !== false && (adult || Klassia.isAdultSpace())) {
  const variant = new URL(location.href);
  if (adult) variant.searchParams.delete('mode');
  else variant.searchParams.set('mode','adulte');
  $('printVariant').textContent = adult ? 'Ouvrir la fiche élève' : 'Ouvrir le corrigé adulte';
  $('printVariant').href = variant;
  $('printVariant').hidden = false;
 }
 $('printExternal').href = location.href;
 $('printAddress').value = location.href;
 $('printAddress').onfocus = event => event.target.select();
 $('printFallback').hidden = false;
 const images = Array.from($('printBody').querySelectorAll('img'),image=>image.decode());
 const results = await Promise.allSettled([document.fonts.ready,...images]);
 $('printStatus').textContent = results.some(result=>result.status==='rejected')
  ? 'Une image est indisponible. Rechargez la fiche avant d’imprimer si l’image est nécessaire.'
  : 'Fiche prête. Dans la fenêtre d’impression, vous pouvez aussi choisir « Enregistrer en PDF ».';
 $('printNow').disabled = false;
 $('printNow').onclick = () => {
  if (typeof window.print === 'function') window.print();
  else $('printFallback').open = true;
 };
}

prepare().catch(error => {
 $('printStatus').textContent = error.message+' Revenez à Klassia et rouvrez la fiche.';
});
