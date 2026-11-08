(() => {
'use strict';
const esc = Klassia.escape;
function renderVisual(v){
 if(!v?.items?.length)return '';
 return `<div class="visual">${v.items.map(x=>`<span>${esc(x)}</span>`).join('')}</div>`;
}
function renderDiagram(d){
 if(!d?.labels?.length)return '';
 const cls='diagram diagram-'+esc(d.kind||'generic');
 return `<div class="${cls}">${d.labels.map((x,i)=>`<div class="diagramNode"><span>${esc(x)}</span>${i<d.labels.length-1?'<b>→</b>':''}</div>`).join('')}</div>`;
}
function renderTable(t){
 if(!t?.headers)return '';
 return `<div class="tableWrap"><table><thead><tr>${t.headers.map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${(t.rows||[]).map(r=>`<tr>${r.map(c=>`<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
function drawingSvg(kind){
 const common='viewBox="0 0 300 210" class="worksheet-svg" aria-hidden="true"';
 const s=(x)=>`<svg ${common}>${x}</svg>`;
 const a='fill="none" stroke="#202633" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"';
 if(kind==='schoolbag')return s(`<path ${a} d="M80 70 Q150 25 220 70 L235 175 Q150 195 65 175 Z"/><path ${a} d="M115 68 Q115 30 150 30 Q185 30 185 68"/><path ${a} d="M100 120 H200 V165 H100 Z"/><path ${a} d="M82 90 L55 120 M218 90 L245 120"/>`);
 if(kind==='face')return s(`<circle ${a} cx="150" cy="105" r="72"/><circle ${a} cx="125" cy="88" r="5"/><circle ${a} cx="175" cy="88" r="5"/><path ${a} d="M150 92 L145 120 L155 120"/><path ${a} d="M120 140 Q150 160 180 140"/><path ${a} d="M95 60 Q150 15 205 60"/>`);
 if(kind==='house')return s(`<path ${a} d="M55 105 L150 35 L245 105"/><rect ${a} x="75" y="105" width="150" height="80"/><rect ${a} x="135" y="130" width="35" height="55"/><rect ${a} x="92" y="125" width="28" height="28"/><rect ${a} x="185" y="125" width="25" height="28"/>`);
 if(kind==='cake')return s(`<ellipse ${a} cx="150" cy="155" rx="85" ry="26"/><path ${a} d="M65 115 Q150 85 235 115 V155"/><path ${a} d="M65 115 V155"/><path ${a} d="M100 100 V62 M150 92 V50 M200 100 V62"/><path ${a} d="M95 62 Q100 48 105 62 M145 50 Q150 36 155 50 M195 62 Q200 48 205 62"/>`);
 if(kind==='flower')return s(`<circle ${a} cx="150" cy="80" r="20"/><circle ${a} cx="150" cy="45" r="22"/><circle ${a} cx="185" cy="70" r="22"/><circle ${a} cx="175" cy="105" r="22"/><circle ${a} cx="125" cy="105" r="22"/><circle ${a} cx="115" cy="70" r="22"/><path ${a} d="M150 125 V190"/><path ${a} d="M150 150 Q120 130 105 150 Q125 170 150 165"/><path ${a} d="M150 165 Q185 140 200 160 Q180 180 150 178"/>`);
 if(kind==='cat')return s(`<path ${a} d="M95 75 L105 35 L135 65 Q150 55 165 65 L195 35 L205 75 Q225 95 215 130 Q205 165 150 170 Q95 165 85 130 Q75 95 95 75 Z"/><circle ${a} cx="125" cy="105" r="5"/><circle ${a} cx="175" cy="105" r="5"/><path ${a} d="M145 122 L155 122 L150 130 Z M150 130 Q135 142 125 135 M150 130 Q165 142 175 135"/><path ${a} d="M90 125 H55 M92 140 H58 M210 125 H245 M208 140 H242"/>`);
 if(kind==='tools')return s(`<path ${a} d="M85 50 L120 85 L95 110 L60 75 Z"/><path ${a} d="M108 97 L205 194"/><path ${a} d="M180 50 Q215 70 200 100 L175 90 Q183 72 165 64 Z"/><path ${a} d="M182 92 L95 180 Q80 195 65 180 Q52 165 68 150 L165 72"/>`);
 return s(`<rect ${a} x="55" y="80" width="190" height="95" rx="18"/><circle ${a} cx="100" cy="180" r="22"/><circle ${a} cx="205" cy="180" r="22"/><rect ${a} x="80" y="100" width="40" height="32"/><rect ${a} x="130" y="100" width="40" height="32"/><rect ${a} x="180" y="100" width="40" height="32"/><path ${a} d="M55 80 L90 45 H205 L245 80"/>`);
}
function traceLettersSvg(letters){
 const step=550/Math.max(1,letters.length),size=Math.min(175,step*.8);
 return `<svg viewBox="0 0 600 280" class="trace-svg"><g stroke="#ccd2dd" stroke-width="2">${[55,120,185,250].map(y=>`<line x1="25" y1="${y}" x2="575" y2="${y}"/>`).join('')}</g>${letters.map((l,i)=>`<text x="${30+i*step}" y="190" font-size="${size}" font-family="Arial" font-weight="700" fill="none" stroke="#9aa5b7" stroke-width="3" stroke-dasharray="7 6">${esc(l)}</text>`).join('')}</svg>`;
}
function traceNumbersSvg(numbers){
 const step=550/Math.max(1,numbers.length),size=Math.min(125,step*.75);
 return `<svg viewBox="0 0 600 260" class="trace-svg" role="img" aria-label="${numbers.join(', ')}"><g stroke="#ccd2dd" stroke-width="2"><line x1="20" y1="210" x2="580" y2="210"/><line x1="20" y1="90" x2="580" y2="90"/></g>${numbers.map((n,i)=>`<text x="${30+i*step}" y="195" font-size="${size}" font-family="Arial" font-weight="700" fill="none" stroke="#9aa5b7" stroke-width="3" stroke-dasharray="6 5">${n}</text>`).join('')}</svg>`;
}
function graphismSvg(themeId){
 const paths={
  T1:['M30 45 V210','M90 45 V210','M150 45 V210','M210 45 V210','M270 45 V210','M330 45 V210','M390 45 V210','M450 45 V210','M510 45 V210'],
  T2:['M40 130 C80 40 120 220 160 130 S240 40 280 130 S360 220 400 130 S480 40 540 130'],
  T3:['M30 180 L90 80 L150 180 L210 80 L270 180 L330 80 L390 180 L450 80 L540 180'],
  T4:['M40 150 C70 70 110 70 140 150 C170 230 210 230 240 150 C270 70 310 70 340 150 C370 230 410 230 440 150 C470 70 510 70 550 150'],
  T5:['M40 190 C80 160 80 120 40 90 C80 60 120 60 150 95 C180 130 180 170 150 200','M220 200 C190 165 190 125 220 90 C250 55 290 55 320 90 C350 125 350 165 320 200','M390 200 C360 160 365 110 400 80 C440 45 490 65 515 105 C535 140 525 180 490 205'],
  T6:['M30 130 Q80 60 130 130 T230 130 T330 130 T430 130 T550 130'],
  T7:['M40 50 L180 210 M180 50 L40 210 M240 50 L380 210 M380 50 L240 210 M440 50 L560 210 M560 50 L440 210'],
  T8:['M30 180 C100 40 170 40 240 180 S380 320 450 180 S540 40 570 120']
 };
 return `<svg viewBox="0 0 600 250" class="trace-svg"><path d="${paths[themeId][0]}" fill="none" stroke="#9aa5b7" stroke-width="5" stroke-dasharray="10 8" stroke-linecap="round"/>${paths[themeId].slice(1).map(p=>`<path d="${p}" fill="none" stroke="#9aa5b7" stroke-width="5" stroke-dasharray="10 8" stroke-linecap="round"/>`).join('')}</svg>`;
}
function worksheetsForTheme(p,grade,themeId){
 if(!p)return [];
 const fullSeries=grade==='GS'&&themeId==='T8';
 const numberRows=fullSeries?[p.numbers.slice(0,5),p.numbers.slice(5)]:[p.numbers.slice(-6)];
 return [
  {id:'color',title:'🎨 Je colorie',instruction_fr:`Colorie le dessin du thème « ${p.title_fr} ». Essaie de rester à l’intérieur des contours.`,instruction_en:`Colour the ${p.title_en.toLowerCase()} picture. Try to stay inside the lines.`,html:drawingSvg(p.drawing)},
  {id:'letters',title:'✍️ Je forme les lettres',instruction_fr:`Repasse les lettres ${p.letters.join(' et ')} avec le doigt, puis avec un crayon.`,instruction_en:`Trace the letters ${p.letters.join(' and ')} with your finger, then with a pencil.`,html:traceLettersSvg(p.letters)},
  {id:'numbers',title:fullSeries?'🔢 J’écris les nombres de 1 à 10':'🔢 Je forme les chiffres',
   instruction_fr:fullSeries?'Repasse les modèles de 1 à 5, puis de 6 à 10. Écris ensuite toute la suite sur une ligne libre.':'Repasse les chiffres proposés. Dis ensuite combien d’objets chaque chiffre peut représenter.',
   instruction_en:fullSeries?'Trace the numbers from 1 to 5, then 6 to 10. Then write the whole sequence on an empty line.':'Trace the numbers. Then say how many objects each number can represent.',
   html:numberRows.map(traceNumbersSvg).join('')},
  {id:'graph',title:'➰ Je fais du graphisme',instruction_fr:`Repasse les ${p.trace}. Commence lentement et garde le même sens.`,instruction_en:`Trace the patterns slowly and keep the same direction.`,html:graphismSvg(themeId)}
 ];
}
Klassia.nurserySupport = {renderVisual,renderDiagram,renderTable,worksheetsForTheme};
})();
