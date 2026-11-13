/* Local freehand work on the worksheet or a blank page. */
(() => {
 'use strict';
 const K = Klassia;
 const svgNS = 'http://www.w3.org/2000/svg';
 const colors = { noir: '#16213a', bleu: '#205bc8', rouge: '#c6333d', jaune: '#e6ad16', vert: '#16834a' };
 const editors = new WeakMap();
 const writes = new Map();
 let opening;

 function database() {
  if (!opening) opening = new Promise((resolve, reject) => {
   const request = indexedDB.open('klassia-cahier-tactile', 1);
   request.onupgradeneeded = () => request.result.createObjectStore('sheets');
   request.onsuccess = () => resolve(request.result);
   request.onerror = () => reject(request.error);
  }).catch(error => { opening = undefined; throw error; });
  return opening;
 }
 async function sheetTransaction(mode, action) {
  const db = await database();
  return new Promise((resolve, reject) => {
   const tx = db.transaction('sheets', mode);
   const request = action(tx.objectStore('sheets'));
   tx.oncomplete = () => resolve(request.result);
   tx.onabort = () => reject(tx.error);
  });
 }

 function sheet(key, model, preview) {
  return '<div class="ink-editor" lang="fr" data-ink-key="'+K.escape(key)+'">'+
   '<button class="ink-toggle" type="button" data-ink-toggle aria-expanded="false">Écrire ou dessiner au doigt</button>'+
   '<div class="ink-tools" data-ink-tools hidden>'+
   '<label>Couleur <select data-ink-color><option value="noir">Noir</option><option value="bleu">Bleu</option>'+
   '<option value="rouge">Rouge</option><option value="jaune">Jaune</option><option value="vert">Vert</option></select></label>'+
   '<label>Trait <select data-ink-width><option value="fin">Fin</option><option value="large">Large</option></select></label>'+
   '<button type="button" data-ink-undo>Annuler le dernier trait</button><button type="button" data-ink-clear>Tout effacer</button>'+
   '</div><p class="ink-status" data-ink-status role="status"></p>'+
   '<div class="ink-surfaces" data-ink-surfaces'+(preview?'':' hidden')+'>'+model+'</div></div>';
 }
 function surface(layout) {
  let guide = '';
  if (layout === 'lignes' || layout === 'grille') {
   const lines = [40,80,120,160,200].map(y => 'M20 '+y+'H580');
   if (layout === 'grille') {
    for (let x=20;x<=580;x+=40) lines.push('M'+x+' 0V240');
   }
   guide = '<path d="'+lines.join(' ')+'" fill="none" stroke="#d4ddeb" stroke-width="2"/>';
  } else if (layout === 'maison') {
   guide = '<path d="M125 115L300 25L475 115Z M155 115H445V225H155Z M266 225V153H334V225 M363 141H420V184H363Z" fill="none" stroke="#223453" stroke-width="5" stroke-linejoin="round"/>';
  }
  const label = layout === 'maison' ? 'Maison à colorier avec un toit, une porte et une fenêtre' : 'Surface pour écrire ou dessiner';
  return '<svg class="ink-pad" viewBox="0 0 600 240" role="img" aria-label="'+label+'">'+guide+'</svg>';
 }
 const pad = (key, layout='lignes') => sheet(key, surface(layout), false);
 const worksheet = (key, model, freeLine=false) => {
  const extra = freeLine ? '<div data-ink-extra hidden>'+surface('lignes')+'</div>' : '';
  return sheet(key, model+extra, true);
 };

 function setStatus(state, message) {
  state.root.querySelector('[data-ink-status]').textContent = message;
 }
 function buttons(state) {
  for (const button of state.root.querySelectorAll('[data-ink-undo],[data-ink-clear]')) {
   button.disabled = !state.ready || !state.strokes.length;
  }
 }
 function path(stroke) {
  const node = document.createElementNS(svgNS, 'path');
  node.setAttribute('data-ink-stroke', '');
  node.setAttribute('fill', 'none');
  node.setAttribute('stroke', colors[stroke.color]);
  node.setAttribute('stroke-width', stroke.width);
  node.setAttribute('stroke-linecap', 'round');
  node.setAttribute('stroke-linejoin', 'round');
  node.setAttribute('d', stroke.d);
  return node;
 }
 function draw(state) {
  state.layers.forEach((layer, index) => {
   layer.replaceChildren(...state.strokes.filter(stroke => stroke.layer === index).map(path));
  });
  buttons(state);
 }

 function save(state) {
  if (state.conflicted) return;
  const strokes = state.strokes.slice();
  const before = writes.get(state.queueKey) || Promise.resolve();
  const operation = before.then(async () => {
   if (state.conflicted) return;
   const revision = crypto.getRandomValues(new Uint32Array(2)).join('-');
   const previous = await sheetTransaction('readwrite', store => {
    const request = store.get(state.key);
    request.onsuccess = () => {
     if (request.result?.revision === state.revision) store.put({ revision, strokes }, state.key);
    };
    return request;
   });
   if (previous?.revision !== state.revision) {
    state.conflicted = true;
    setStatus(state, 'Le cahier a changé dans une autre fenêtre. Rouvrez la fiche pour retrouver les traits conservés.');
    return;
   }
   state.revision = revision;
   setStatus(state, 'Tracés conservés dans ce profil.');
  }).catch(() => {
   setStatus(state, 'Le stockage du tracé est indisponible. Les traits restent visibles pendant cette séance.');
  });
  writes.set(state.queueKey, operation);
  operation.then(() => { if (writes.get(state.queueKey) === operation) writes.delete(state.queueKey); });
 }

 function coordinates(svg, event) {
  const screen = svg.getScreenCTM();
  if (!screen) return null;
  const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(screen.inverse());
  const box = svg.viewBox.baseVal;
  const x = Math.round(Math.max(box.x, Math.min(point.x, box.x + box.width)));
  const y = Math.round(Math.max(box.y, Math.min(point.y, box.y + box.height)));
  return x+' '+y;
 }
 function cancel(state) {
  state.active?.node.remove();
  state.active = null;
 }
 function bindSurface(state, svg, layer) {
  svg.addEventListener('pointerdown', event => {
   if (!state.ready || !state.root.classList.contains('ink-active') || state.active || !event.isPrimary ||
       (event.pointerType==='mouse' && event.button!==0)) return;
   if (state.strokes.length >= 200) {
    setStatus(state, 'Annulez un trait ou effacez la fiche pour continuer.');
    return;
   }
   const point = coordinates(svg,event);
   if (!point) return;
   const color = state.root.querySelector('[data-ink-color]').value;
   const broad = state.root.querySelector('[data-ink-width]').value === 'large';
   const width = Math.max(2, Math.round(svg.viewBox.baseVal.width * (broad ? 0.055 : 0.009)));
   const stroke = { layer, color, width, d: 'M'+point+'L'+point };
   const node = path(stroke);
   state.active = { stroke, node, pointer: event.pointerId, point, count: 0 };
   state.layers[layer].append(node);
   svg.setPointerCapture(event.pointerId);
   event.preventDefault();
  });
  svg.addEventListener('pointermove', event => {
   const active = state.active;
   if (active?.pointer !== event.pointerId || active.count >= 1000) return;
   const point = coordinates(svg,event);
   if (!point || point === active.point) return;
   active.point = point;
   active.count++;
   active.stroke.d += 'L'+point;
   active.node.setAttribute('d',active.stroke.d);
  });
  svg.addEventListener('pointerup', event => {
   const active = state.active;
   if (active?.pointer !== event.pointerId) return;
   state.active = null;
   state.strokes.push(active.stroke);
   buttons(state);
   save(state);
  });
  for (const type of ['pointercancel','lostpointercapture']) {
   svg.addEventListener(type, event => { if (state.active?.pointer===event.pointerId) cancel(state); });
  }
 }
 async function load(state) {
  try {
   await writes.get(state.queueKey);
   const current = await sheetTransaction('readonly', store => store.get(state.key));
   state.revision = current?.revision;
   state.strokes = current?.strokes || [];
   setStatus(state, 'Choisis une couleur. Trace avec le doigt, le stylet ou la souris.');
  } catch {
   setStatus(state, 'Tu peux tracer pendant cette séance. Le stockage local est indisponible.');
  }
  state.ready = true;
  draw(state);
 }
 function mount(root) {
  const key = [K.profile().id,root.dataset.inkKey];
  const state = { root, key, queueKey: JSON.stringify(key), layers: [], strokes: [] };
  editors.set(root,state);
  for (const svg of root.querySelectorAll('[data-ink-surfaces] svg')) {
   const layer = document.createElementNS(svgNS,'g');
   layer.setAttribute('aria-hidden', 'true');
   svg.append(layer);
   state.layers.push(layer);
   bindSurface(state,svg,state.layers.length-1);
  }
  setStatus(state, 'Préparation de la fiche…');
  buttons(state);
  load(state);
  return state;
 }
 document.addEventListener('click', event => {
  const action = event.target.closest('[data-ink-toggle],[data-ink-undo],[data-ink-clear]');
  if (!action) return;
  const root = action.closest('[data-ink-key]');
  const state = editors.get(root) || mount(root);
  if (action.hasAttribute('data-ink-toggle')) {
   const active = root.classList.toggle('ink-active');
   action.setAttribute('aria-expanded',String(active));
   action.textContent = active ? 'Terminer le tracé' : 'Écrire ou dessiner au doigt';
   root.querySelector('[data-ink-tools]').hidden = !active;
   root.querySelector('[data-ink-surfaces]').hidden = false;
   root.querySelector('[data-ink-extra]')?.removeAttribute('hidden');
   if (!active) cancel(state);
   return;
  }
  if (!state.ready || !state.strokes.length) return;
  if (action.hasAttribute('data-ink-clear')) {
   if (!confirm(K.t ? K.t('Effacer tous les tracés de cette fiche ?') : 'Effacer tous les tracés de cette fiche ?')) return;
   state.strokes = [];
  } else state.strokes.pop();
  cancel(state);
  draw(state);
  save(state);
 });
 K.ink = { pad, worksheet };
})();
