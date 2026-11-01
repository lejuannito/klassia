const app = document.getElementById('app');
let content, qcm, catalog, currentUnit;

const S = {
  user: 'klassia_user',
  progress: 'klassia_progress',
  evals: 'klassia_evals',
  exercises: 'klassia_exercises',
  project: 'klassia_project',
  recent: 'klassia_recent',
  unit: 'klassia_unit',
  qcmScores: 'klassia_qcm_scores'
};

const SUBJECT_META = {
  FR: { icon: '📖', short: 'Français' },
  EN: { icon: '🇬🇧', short: 'English' },
  BA: { icon: '🗣️', short: 'LCN · Bassa' },
  MA: { icon: '➗', short: 'Mathématiques' },
  SC: { icon: '🔬', short: 'Sciences' },
  TI: { icon: '💻', short: 'TIC' },
  SH: { icon: '🌍', short: 'SHS' },
  AR: { icon: '🎨', short: 'Arts' },
  EP: { icon: '🏃', short: 'EPS' },
  DP: { icon: '🧰', short: 'Dév. personnel' }
};

const load = (k, d = {}) => {
  try {
    const raw = Klassia.storage.getItem(k);
    return raw ? JSON.parse(raw) : d;
  } catch {
    return d;
  }
};
const save = (k, v) => Klassia.storage.setItem(k, JSON.stringify(v));
const esc = s => String(s ?? '').replace(/[&<>\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const nl = s => esc(s).replace(/\n/g, '<br>');
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

async function boot() {
  catalog = await fetch('./data/catalog.json').then(r => {
    if (!r.ok) throw new Error('Catalogue des unités indisponible');
    return r.json();
  });
  const preferred = new URLSearchParams(location.search).get('unit') || Klassia.storage.getItem(S.unit) || catalog.default_unit || catalog.units[0].id;
  await loadUnit(catalog.units.some(u => u.id === preferred) ? preferred : catalog.units[0].id);
  route();
}

async function loadUnit(id) {
  const unit = catalog.units.find(u => u.id === id) || catalog.units[0];
  const [newContent, newQcm] = await Promise.all([
    fetch(unit.content).then(r => { if (!r.ok) throw new Error('Contenu pédagogique indisponible'); return r.json(); }),
    fetch(unit.qcm).then(r => { if (!r.ok) throw new Error('Banque QCM indisponible'); return r.json(); })
  ]);
  currentUnit = unit;
  content = newContent;
  qcm = newQcm;
  Klassia.storage.setItem(S.unit, unit.id);
}

function unitNumber() { return currentUnit?.number || content?.metadata?.unit || 1; }
function unitTitle() { return currentUnit?.title || content?.metadata?.unit_title || content?.metadata?.center_of_interest || ''; }
function unitCaption() { return `Unité ${unitNumber()} · ${unitTitle()}`; }
function qcmTotal() { return qcm.epreuves.filter(e=>e.subject_id!=='BA').reduce((n, e) => n + e.questions.length, 0); }

function currentUser() { return {role: load(S.user, {})?.role || 'ELEVE', name: Klassia.profile().name}; }
function progressData() { return load(S.progress, {}); }
function evalData() {
  const k = `${S.evals}:${currentUnit.id}`;
  const scoped = load(k, null);
  if (scoped !== null) return scoped;
  return currentUnit.id === 'U1' ? load(S.evals, {}) : {};
}
function saveEvalData(v) { save(`${S.evals}:${currentUnit.id}`, v); }
function qcmScoreData() { return load(`${S.qcmScores}:${currentUnit.id}`, {}); }
function saveQcmScoreData(v) { save(`${S.qcmScores}:${currentUnit.id}`, v); }
function exerciseData() { return load(S.exercises, {}); }
function projectData() { return load(`${S.project}:${currentUnit.id}`, {}); }
function saveProjectData(v) { save(`${S.project}:${currentUnit.id}`, v); }
function lessonTotal() { return content.subjects.reduce((n, s) => n + s.lessons.length, 0); }
function currentLessonIds() { return new Set(allLessons().map(x => x.lesson.id)); }
function masteredCount() { const ids=currentLessonIds(), p=progressData(); return Object.entries(p).filter(([id,st]) => ids.has(id) && st === 'MAITRISEE').length; }
function subjectMeta(id) { return SUBJECT_META[id] || { icon: '📘', short: id }; }
function statusLabel(st) {
  if (st === 'MAITRISEE') return ['Je me sens prêt', 'ok'];
  if (st === 'A_REVOIR') return ['À revoir', 'warn'];
  if (st === 'EN_COURS') return ['En cours', 'active'];
  return ['À faire', ''];
}

function allLessons() {
  return content.subjects.flatMap(s => s.lessons.map(l => ({ subject: s, lesson: l })));
}

function recommendedLesson() {
  const p = progressData();
  const recent = load(S.recent, {});
  const lessons = allLessons();
  if (recent.lessonId) {
    const same = lessons.find(x => x.lesson.id === recent.lessonId && p[x.lesson.id] !== 'MAITRISEE');
    if (same) return same;
  }
  const review = lessons.find(x => p[x.lesson.id] === 'A_REVOIR');
  if (review) return review;
  const inProgress = lessons.find(x => p[x.lesson.id] === 'EN_COURS');
  if (inProgress) return inProgress;
  return lessons.find(x => p[x.lesson.id] !== 'MAITRISEE') || lessons[0];
}

function login() { Klassia.openProfiles(); home(); }

function shell(body, active = 'home') {
  const u = currentUser();
  const isAdmin = u?.role === 'ADMIN';
  const isTeacher = u?.role === 'ENSEIGNANT';
  const isParent = u?.role === 'PARENT';
  const nav = isParent ? [
    ['home', '⌂', 'Synthèse'],
    ['progress', '◎', 'Progression']
  ] : [
    ['home', '⌂', 'Accueil'],
    ['learn', '▤', 'Apprendre'],
    ['revise', '✓', 'Réviser'],
    ['project', '◆', 'Projet'],
    ['progress', '◎', 'Suivi']
  ];
  if (isAdmin || isTeacher) nav.push(['coverage', '☷', 'Revue éditoriale'], ['bassa', '🗣', 'Bassa']);
  app.innerHTML = `
    <div class="shell">
      <header class="topbar">
        <button class="brand brand-button" data-go="home" aria-label="Accueil Klassia"><span class="brandMark">K</span><span>Klassia</span></button>
        <nav class="nav desktop-nav" aria-label="Navigation principale">
          ${nav.map(([id, icon, label]) => `<button data-go="${id}" class="${active === id ? 'active' : ''}"><span>${icon}</span>${label}</button>`).join('')}
          ${isAdmin ? `<button data-go="admin" class="${active === 'admin' ? 'active' : ''}"><span>⚙</span>Administration</button>` : ''}
        </nav>
        <div class="spacer"></div>
        <label class="unit-switch" title="Changer d’unité"><span>Unité</span><select id="unitSelect">${catalog.units.map(x => `<option value="${x.id}" ${x.id===currentUnit.id?'selected':''}>${x.number} · ${esc(x.title)}</option>`).join('')}</select></label>
        <div class="who"><b>${esc(u?.name || '')}</b><span>${isAdmin ? 'Administrateur local' : isTeacher ? 'Enseignant · appareil local' : isParent ? 'Espace parent · CE2' : `CE2 · Unité ${unitNumber()}`}</span></div>
        <button id="logout" class="iconBtn" title="Déconnexion" aria-label="Déconnexion">↪</button>
      </header>
      <main class="main">${body}</main>
      <nav class="mobile-nav" aria-label="Navigation mobile">
        ${nav.map(([id, icon, label]) => `<button data-go="${id}" class="${active === id ? 'active' : ''}"><span class="mobile-nav-icon">${icon}</span><span>${label}</span></button>`).join('')}
      </nav>
    </div>`;
  document.querySelectorAll('[role=button][tabindex]').forEach(el=>el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();el.click();}});
  document.querySelectorAll('[data-go]').forEach(b => b.onclick = () => location.hash = '#' + b.dataset.go);
  const unitSelect = document.getElementById('unitSelect');
  if (unitSelect) unitSelect.onchange = async () => {
    await loadUnit(unitSelect.value);
    location.hash = '#home';
    route();
  };
  document.getElementById('logout').onclick = () => {
    Klassia.storage.removeItem(S.user);
    location.hash = '#login';
  };
  Klassia.rendered();
}

function progressRing(pct) {
  const deg = clamp(pct, 0, 100) * 3.6;
  return `<div class="ring" style="--ring:${deg}deg"><div><strong>${pct}%</strong><span>progression</span></div></div>`;
}

function parentHome() {
  const p = progressData();
  const total = catalog.summary?.lesson_count || catalog.units.reduce((n,u)=>n+(u.lesson_count||0),0);
  const mastered = Object.values(p).filter(x => x === 'MAITRISEE').length;
  const review = Object.values(p).filter(x => x === 'A_REVOIR').length;
  const pct = total ? Math.round(mastered * 100 / total) : 0;
  const unitsStarted = catalog.units.filter(u => Object.keys(p).some(id => id.includes(`-U${u.number}-`) && p[id] !== undefined)).length;
  let body = `
    <section class="hero hero-dashboard parent-hero">
      <div class="hero-copy"><div class="eyebrow light">ESPACE PARENT · CE2</div><h1>Progression de ${esc(Klassia.profile().name)}</h1><p>Suivi local de cet enfant : les déclarations de confiance et les résultats sont présentés séparément.</p></div>
      ${progressRing(pct)}
    </section>
    <section class="stats-row four">
      <div class="mini-stat"><span class="mini-icon">✓</span><div><strong>${mastered}/${total}</strong><span>leçons déclarées comprises</span></div></div>
      <div class="mini-stat"><span class="mini-icon">↻</span><div><strong>${review}</strong><span>à revoir</span></div></div>
      <div class="mini-stat"><span class="mini-icon">▦</span><div><strong>${unitsStarted}/8</strong><span>unités commencées</span></div></div>
      <div class="mini-stat"><span class="mini-icon">🧩</span><div><strong>${catalog.summary?.qcm_count || '—'}</strong><span>QCM disponibles</span></div></div>
    </section>
    <div class="page-head compact"><div><div class="eyebrow">PAR UNITÉ</div><h2>Avancement du CE2</h2><p>Sélectionnez une unité pour consulter son suivi détaillé.</p></div></div>
    <div class="parent-unit-grid">`;
  catalog.units.forEach(u => {
    const unitEntries = Object.entries(p).filter(([id]) => id.includes(`-U${u.number}-`));
    const done = unitEntries.filter(([,st]) => st === 'MAITRISEE').length;
    const rev = unitEntries.filter(([,st]) => st === 'A_REVOIR').length;
    const upct = u.lesson_count ? Math.round(done * 100 / u.lesson_count) : 0;
    const ev = load(`${S.evals}:${u.id}`, u.id === 'U1' ? load(S.evals,{}) : {});
    const scores = Object.values(ev).map(x=>Number(x.score)).filter(Number.isFinite);
    const avg = scores.length ? (scores.reduce((a,b)=>a+b,0)/scores.length).toFixed(1) : '—';
    body += `<button class="parent-unit-card" data-parent-unit="${u.id}"><div class="row between"><div><span class="unit-number">U${u.number}</span><strong>${esc(u.title)}</strong></div><span class="parent-unit-pct">${upct}%</span></div><div class="progress"><span style="width:${upct}%"></span></div><div class="parent-unit-meta"><span>${done}/${u.lesson_count} déclarées comprises</span><span>${rev ? `${rev} à revoir` : 'aucune à revoir'}</span><span>moy. ${avg}/20</span></div></button>`;
  });
  body += `</div><section class="source-note always"><h3>À propos de cette vue</h3><p>Les données appartiennent au profil actif sur cet appareil. Exportez une sauvegarde avant de changer d’appareil. Les états de confiance sont déclaratifs et ne remplacent pas une évaluation accompagnée.</p></section>`;
  shell(body, 'home');
  document.querySelectorAll('[data-parent-unit]').forEach(b => b.onclick = async () => {
    await loadUnit(b.dataset.parentUnit);
    location.hash = '#progress';
    progressPage();
  });
}

function home() {
  if (currentUser()?.role === 'PARENT') return parentHome();
  const total = lessonTotal();
  const done = masteredCount();
  const pct = Math.round(done * 100 / total);
  const ev = evalData();
  const nev = Object.keys(ev).length;
  const rec = recommendedLesson();
  const meta = subjectMeta(rec.subject.id);

  let body = `
    <section class="hero hero-dashboard">
      <div class="hero-copy">
        <div class="eyebrow light">CE2 · UNITÉ ${unitNumber()} · ${esc(unitTitle().toUpperCase())}</div>
        <h1>Bonjour ${esc(currentUser()?.name || 'Junior')} 👋</h1>
        <p>Apprendre, s’exercer, progresser — à ton rythme.</p>
        <button class="btn hero-btn" onclick="location.hash='#lesson:${encodeURIComponent(rec.lesson.id)}'">Continuer ma prochaine leçon</button>
      </div>
      ${progressRing(pct)}
    </section>

    <section class="stats-row">
      <div class="mini-stat"><span class="mini-icon">📘</span><div><strong>${done}/${total}</strong><span>leçons déclarées comprises</span></div></div>
      <div class="mini-stat"><span class="mini-icon">🎯</span><div><strong>${nev}/10</strong><span>évaluations</span></div></div>
      <div class="mini-stat"><span class="mini-icon">🧩</span><div><strong>${qcmTotal()}</strong><span>QCM disponibles</span></div></div>
    </section>

    <section class="section-title-row"><div><div class="eyebrow">RECOMMANDÉ POUR TOI</div><h2>À travailler maintenant</h2></div></section>
    <article class="recommend-card" onclick="location.hash='#lesson:${encodeURIComponent(rec.lesson.id)}'" tabindex="0" role="button">
      <div class="subject-icon large">${meta.icon}</div>
      <div class="grow">
        <div class="small-label">${esc(meta.short)}</div>
        <h3>${esc(rec.lesson.title)}</h3>
        <p>${esc(rec.lesson.objectives?.[0] || 'Poursuivre ton apprentissage.')}</p>
        <div class="recommend-meta"><span>⏱ 8–12 min</span><span>•</span><span>${statusLabel(progressData()[rec.lesson.id])[0]}</span></div>
      </div>
      <span class="chevron">›</span>
    </article>

    <section class="section-title-row"><div><div class="eyebrow">MES MATIÈRES</div><h2>Progression de l’unité</h2></div><button class="text-btn" onclick="location.hash='#learn'">Voir tout</button></section>
    <div class="subject-grid">`;

  content.subjects.forEach(s => {
    const ids = s.lessons.map(l => l.id);
    const d = ids.filter(id => progressData()[id] === 'MAITRISEE').length;
    const sp = Math.round(d * 100 / ids.length);
    const m = subjectMeta(s.id);
    body += `
      <button class="subject-card" onclick="location.hash='#subject:${encodeURIComponent(s.id)}'">
        <div class="subject-card-top"><span class="subject-icon">${m.icon}</span><span class="subject-pct">${sp}%</span></div>
        <strong>${esc(m.short)}</strong>
        <span>${d}/${ids.length} leçons déclarées comprises</span>
        <div class="progress"><span style="width:${sp}%"></span></div>
      </button>`;
  });
  body += '</div>';
  shell(body, 'home');
}

function learn() {
  const p = progressData();
  let body = `
    <div class="page-head"><div><div class="eyebrow">CE2 · UNITÉ ${unitNumber()} · ${esc(unitTitle().toUpperCase())}</div><h1>Apprendre</h1><p>Choisis une matière puis avance leçon par leçon.</p></div><span class="pill">${lessonTotal()} leçons</span></div>
    <div class="subject-grid wide">`;
  content.subjects.forEach(s => {
    const d = s.lessons.filter(l => p[l.id] === 'MAITRISEE').length;
    const r = s.lessons.filter(l => p[l.id] === 'A_REVOIR').length;
    const pct = Math.round(d * 100 / s.lessons.length);
    const m = subjectMeta(s.id);
    body += `
      <button class="subject-card subject-card-rich" onclick="location.hash='#subject:${encodeURIComponent(s.id)}'">
        <div class="subject-card-top"><span class="subject-icon large">${m.icon}</span><span class="subject-pct">${pct}%</span></div>
        <strong>${esc(s.name)}</strong>
        <span>${s.lessons.length} leçon${s.lessons.length > 1 ? 's' : ''} · ${d} déclarée comprise${d > 1 ? 's' : ''}${r ? ` · ${r} à revoir` : ''}</span>
        <div class="progress"><span style="width:${pct}%"></span></div>
      </button>`;
  });
  body += '</div>';
  shell(body, 'learn');
}

function subject(id) {
  const s = content.subjects.find(x => x.id === id);
  if (!s) return learn();
  const p = progressData();
  const m = subjectMeta(s.id);
  const done = s.lessons.filter(l => p[l.id] === 'MAITRISEE').length;
  const pct = Math.round(done * 100 / s.lessons.length);
  let body = `
    <div class="crumb"><a onclick="location.hash='#learn'">Apprendre</a><span>›</span>${esc(m.short)}</div>
    <section class="subject-hero">
      <div class="subject-icon xlarge">${m.icon}</div>
      <div class="grow"><div class="eyebrow">UNITÉ ${unitNumber()} · ${esc(unitTitle().toUpperCase())}</div><h1>${esc(s.name)}</h1><p>${done}/${s.lessons.length} leçons déclarées comprises</p><div class="progress"><span style="width:${pct}%"></span></div></div>
      <div class="subject-score">${pct}%</div>
    </section>
    <div class="lessonList">`;

  s.lessons.forEach((l, i) => {
    const st = p[l.id];
    const [label, cls] = statusLabel(st);
    body += `
      <button class="lessonItem" onclick="location.hash='#lesson:${encodeURIComponent(l.id)}'">
        <div class="lessonNo">${i + 1}</div>
        <div class="grow"><b>${esc(l.title)}</b><div class="muted line-clamp">${esc(l.objectives?.[0] || '')}</div></div>
        <span class="badge ${cls}">${label}</span><span class="chevron">›</span>
      </button>`;
  });
  const ev = evalData()[id];
  body += `</div>
    <section class="assessment-card">
      <div><div class="eyebrow">ÉVALUATION DE LA MATIÈRE</div><h3>${esc(s.assessment?.title || 'Évaluation')}</h3><p>${ev ? `Dernier résultat : <b>${esc(ev.score)}/20</b>` : 'À réaliser après les leçons de la matière.'}</p></div>
      <button class="btn primary" onclick="location.hash='#eval:${encodeURIComponent(s.id)}'">${ev ? 'Revoir' : 'Commencer'}</button>
    </section>`;
  shell(body, 'learn');
}

function markStarted(id) {
  const p = progressData();
  if (!p[id]) {
    p[id] = 'EN_COURS';
    save(S.progress, p);
  }
  save(S.recent, { lessonId: id, at: Date.now() });
}

function lesson(id) {
  let s, l, index = -1;
  for (const x of content.subjects) {
    const i = x.lessons.findIndex(z => z.id === id);
    if (i >= 0) { s = x; l = x.lessons[i]; index = i; break; }
  }
  if (!l) return learn();
  markStarted(id);
  const st = progressData()[id];
  const [label, cls] = statusLabel(st);
  const m = subjectMeta(s.id);
  const prev = s.lessons[index - 1];
  const next = s.lessons[index + 1];

  let body = `
    <div class="crumb"><a onclick="location.hash='#subject:${encodeURIComponent(s.id)}'">${esc(m.short)}</a><span>›</span>Leçon ${index + 1}/${s.lessons.length}</div>
    <article class="lesson-page">
      <header class="lesson-header">
        <div class="row"><span class="pill">${m.icon} ${esc(m.short)}</span><span class="badge ${cls}">${label}</span></div>
        <h1>${esc(l.title)}</h1><span class="editorial-status">${l.editorial?.status==='draft'?'Trame en cours de rédaction · accompagnement nécessaire':'Contenu pilote · relecture pédagogique à confirmer'}</span>
        <p>${esc(l.objectives?.[0] || '')}</p>
        <div class="lesson-step"><span style="width:${Math.round((index + 1) * 100 / s.lessons.length)}%"></span></div>
      </header>
      <section class="learning-block discover"><div class="block-kicker"><span>👀</span> JE DÉCOUVRE</div><p>${nl(l.discover || '')}</p></section>
      <section class="learning-block"><div class="block-kicker"><span>🧠</span> JE COMPRENDS</div>${(l.learn || []).map(x => `<p>${nl(x)}</p>`).join('')}</section>
      ${renderManualSections(l)}
      <section class="learning-block takeaway"><div class="block-kicker"><span>💡</span> JE RETIENS</div><p>${nl(l.takeaway || '')}</p></section>`;

  if ((l.practical || []).length) {
    body += `<section class="learning-block practical"><div class="block-kicker"><span>👐</span> J’EXPÉRIMENTE</div><ul>${l.practical.map(x => `<li>${nl(x)}</li>`).join('')}</ul></section>`;
  }

  body += `<section class="learning-block practice"><div class="block-kicker"><span>✍️</span> JE M’EXERCE</div>${(l.exercises || []).map((e, i) => exerciseHtml(e, id, i)).join('')}</section>
      <section class="mastery-card">
        <div><div class="eyebrow">MON SUIVI</div><h3>Comment te sens-tu après cette leçon ?</h3><p id="masteryMsg">Klassia utilisera ce choix pour te proposer la suite.</p></div>
        <div class="mastery-actions"><button class="btn review" onclick="setStatus('${id}','A_REVOIR')">↻ À revoir</button><button class="btn success" onclick="setStatus('${id}','MAITRISEE')">✓ Je me sens prêt</button></div>
      </section>
      <nav class="lesson-nav">
        ${prev ? `<button class="btn soft" onclick="location.hash='#lesson:${encodeURIComponent(prev.id)}'">‹ Leçon précédente</button>` : '<span></span>'}
        ${next ? `<button class="btn primary" onclick="location.hash='#lesson:${encodeURIComponent(next.id)}'">Leçon suivante ›</button>` : `<button class="btn primary" onclick="location.hash='#eval:${encodeURIComponent(s.id)}'">Passer l’évaluation ›</button>`}
      </nav>
      <details class="source-note"><summary>Référence pédagogique</summary><p>${esc(l.source || '')}</p>${(l.notes || []).map(n => `<p>${esc(n)}</p>`).join('')}</details>
    </article>`;

  if(l.teacher_guide)body+=teacherGuideHtml(l.teacher_guide);
  shell(body, 'learn');
  if(s.id==='BA')Klassia.Bassa.mount(document.querySelector('.lesson-page'),'CE2',l.id);
  document.querySelectorAll('.numeric-check').forEach(button=>button.onclick=()=>{const e=l.exercises[Number(button.dataset.exercise)],raw=document.getElementById('num_'+button.dataset.feedback).value.trim().replace(/\s/g,'').replace(',','.');const box=document.getElementById(button.dataset.feedback);box.classList.remove('hidden');if(raw===''||!/^[-+]?\d+(\.\d+)?$/.test(raw)){box.textContent='Écris un nombre avant de vérifier.';return;}const ok=Number(raw)===e.answer;box.textContent=(ok?'Bravo ! ':'Essaie encore. ')+e.explanation;const key=l.id+':'+button.dataset.exercise;const d=exerciseData();d[key]={ok,at:new Date().toISOString()};save(S.exercises,d);Klassia.append('klassia_attempts',{kind:'number',exercise:e.id,ok});});
  if(s.id!=='BA')Klassia.addSpeech(document.querySelector('.lesson-header'),[l.title,l.discover,...l.learn].join('. '),s.id==='EN'?'en-GB':'fr-FR');
  (l.manual_sections||[]).forEach((sec,i)=>{if(sec.audio_lang&&sec.body&&s.id!=='BA')Klassia.addSpeech(document.querySelectorAll('.manual-section-body')[i],sec.body,sec.audio_lang);});
}

function exerciseHtml(e, lid, i) {
  const ansId = `ans_${lid.replace(/\W/g, '')}_${i}`;
  const key = `${lid}:${i}`;
  const history = exerciseData()[key];
  if(e.type==='number')return `<div class="exercise-card"><div class="grow"><label for="num_${ansId}"><b>${esc(e.prompt)}</b></label><input id="num_${ansId}" inputmode="decimal" autocomplete="off"><button class="btn soft numeric-check" data-lesson="${lid}" data-exercise="${i}" data-feedback="${ansId}">Vérifier le nombre</button><div id="${ansId}" class="feedback hidden" role="status"></div></div></div>`;
  if (e.type === 'mcq' && e.choices) {
    return `<div class="exercise-card"><div class="exercise-number">${i + 1}</div><div class="grow"><b>${esc(e.prompt)}</b>${e.choices.map((c, j) => `<label class="choice"><input type="radio" name="q_${ansId}" value="${j}"><span>${esc(c)}</span></label>`).join('')}<button class="btn soft" onclick="checkMcq('${ansId}',${e.correct_choice},'${key}')">Vérifier ma réponse</button><div id="${ansId}" class="feedback hidden"></div>${history ? `<div class="exercise-history">Dernière tentative : ${history.ok ? 'réussie ✓' : 'à retravailler'}</div>` : ''}</div></div>`;
  }
  return `<div class="exercise-card"><div class="exercise-number">${i + 1}</div><div class="grow"><b>${esc(e.prompt)}</b><p class="exercise-hint">Réfléchis d’abord, puis compare avec la correction.</p><button class="btn soft" onclick="showOpenCorrection('${ansId}')">Voir la correction</button><div id="${ansId}" class="feedback hidden"><b>Correction proposée</b><p>${nl(e.answer || '')}</p>${e.explanation ? `<p class="muted">${nl(e.explanation)}</p>` : ''}<div class="self-check"><span>As-tu réussi seul ?</span><button class="btn mini review" onclick="rateOpen('${key}',false,'${ansId}')">Pas encore</button><button class="btn mini success" onclick="rateOpen('${key}',true,'${ansId}')">Oui ✓</button></div><div class="remediation hidden" data-remed="${ansId}"><b>Remédiation</b><p>${nl(e.explanation || 'Relis « Je retiens », reprends l’exemple puis essaie de résoudre la question une seconde fois.')}</p></div></div>${history ? `<div class="exercise-history">Auto-évaluation : ${history.ok ? 'réussie ✓' : 'à retravailler'}</div>` : ''}</div></div>`;
}

window.showOpenCorrection = id => document.getElementById(id)?.classList.remove('hidden');
window.rateOpen = (key, ok, id) => {
  const d = exerciseData();
  d[key] = { ok, at: new Date().toISOString() };
  save(S.exercises, d);
  Klassia.append('klassia_attempts',{kind:'self_report',exercise:key,ok});
  const box = document.getElementById(id);
  const remed = box?.querySelector(`[data-remed="${id}"]`);
  if (remed) remed.classList.toggle('hidden', ok);
  const self = box?.querySelector('.self-check');
  if (self) self.insertAdjacentHTML('beforeend', `<span class="self-result ${ok ? 'good' : 'retry'}">${ok ? 'Bien joué !' : 'À retravailler'}</span>`);
};
window.checkMcq = (id, answer, key) => {
  const r = [...document.querySelectorAll(`input[name="q_${id}"]`)].find(x => x.checked);
  const box = document.getElementById(id);
  box.classList.remove('hidden');
  if (!r) { box.innerHTML = '<b>Choisis d’abord une réponse.</b>'; return; }
  const ok = Number(r.value) === answer;
  const d = exerciseData(); d[key] = { ok, at: new Date().toISOString() }; save(S.exercises, d);
  Klassia.append('klassia_attempts',{kind:'mcq',exercise:key,ok});
  box.innerHTML = ok ? `<div class="feedback-good"><b>Bravo ! 🎉</b><p>Bonne réponse.</p></div>` : `<div class="feedback-retry"><b>Pas encore.</b><p>Réponse attendue : <strong>${esc(document.querySelector(`input[name="q_${id}"][value="${answer}"]`)?.nextElementSibling?.textContent || '')}</strong></p><div class="remediation visible"><b>Remédiation Klassia</b><p>Relis « Je retiens », observe l’exemple puis réessaie avant de poursuivre.</p></div></div>`;
};
window.setStatus = (id, st) => {
  const p = progressData(); p[id] = st; save(S.progress, p);
  const msg = document.getElementById('masteryMsg');
  if (msg) msg.innerHTML = st === 'MAITRISEE' ? '<strong>Leçon déclarée comprise ✓</strong> Ta progression a été mise à jour.' : '<strong>Ajoutée aux révisions.</strong> Klassia te reproposera cette notion.';
  setTimeout(() => lesson(id), 450);
};

function evaluation(id) {
  const s = content.subjects.find(x => x.id === id);
  if (!s || !s.assessment) return subject(id);
  const a = s.assessment;
  const e = evalData()[id];
  const m = subjectMeta(id);
  let body = `
    <div class="crumb"><a onclick="location.hash='#subject:${encodeURIComponent(id)}'">${esc(m.short)}</a><span>›</span>Évaluation</div>
    <div class="page-head"><div><div class="eyebrow">${m.icon} ${esc(m.short)}</div><h1>${esc(a.title)}</h1><p>Évaluation accompagnée · Total ${a.total || 20} points</p></div>${e ? `<span class="score-pill">${esc(e.score)}/20</span>` : ''}</div>
    <div class="assessment-list">`;
  a.items.forEach((it, i) => {
    const rid = `corr_${id}_${i}`;
    body += `<article class="evalItem"><div class="eval-head"><span class="eval-number">${i + 1}</span><span class="points">${it.points} pt${it.points > 1 ? 's' : ''}</span></div><b>${esc(it.prompt)}</b><button class="text-btn correction-btn" onclick="toggle('${rid}')">Voir les éléments de correction</button><div id="${rid}" class="feedback hidden">${nl(it.answer)}</div></article>`;
  });
  body += `</div>
    <section class="score-entry"><div><div class="eyebrow">MON RÉSULTAT</div><h3>Enregistrer mon score</h3><p>Pour ce pilote, la correction est accompagnée et le score est saisi après comparaison avec les réponses proposées.</p></div><div class="score-controls"><input id="score" type="number" min="0" max="20" step="0.5" value="${e?.score ?? ''}" aria-label="Score sur 20"><span>/20</span><button class="btn primary" onclick="saveEval('${id}')">Enregistrer</button></div><div id="evalMsg" class="eval-message">${e ? evalFeedback(Number(e.score)) : ''}</div></section>
    <section class="remediation-card"><div class="eyebrow">REMÉDIATION</div><h3>Que faire si certaines notions restent fragiles ?</h3><ul>${(s.remediation || []).map(x => `<li>${esc(x)}</li>`).join('')}</ul></section>`;
  shell(body, 'learn');
}

function evalFeedback(score) {
  if (score >= 15) return `<strong>Très bien — ${score}/20.</strong> Tu peux poursuivre tout en révisant ponctuellement les erreurs.`;
  if (score >= 10) return `<strong>${score}/20.</strong> Les bases sont présentes ; reprends les leçons liées aux erreurs avant de poursuivre.`;
  return `<strong>${score}/20.</strong> Klassia recommande une remédiation ciblée et une nouvelle tentative.`;
}

window.toggle = id => document.getElementById(id)?.classList.toggle('hidden');
window.saveEval = id => {
  const input = document.getElementById('score');
  const v = input.value.trim()==='' ? NaN : Number(input.value);
  const msg = document.getElementById('evalMsg');
  if (!Number.isFinite(v) || v < 0 || v > 20) { msg.textContent = 'Entre un score compris entre 0 et 20.'; return; }
  const e = evalData(); e[id] = { score: v, date: new Date().toISOString() }; saveEvalData(e);
  msg.innerHTML = evalFeedback(v);
};

function seriesForSubject(id) {
  return qcm.epreuves.map((e,i)=>({e,i})).filter(x => x.e.subject_id === id);
}
function seriesKey(e, i) { return e.id || e.cle || `${e.subject_id || 'Q'}-${i}`; }

function revise() {
  let body = `<div class="page-head"><div><div class="eyebrow">ENTRAÎNEMENT</div><h1>Réviser avec les QCM</h1><p>Commence par la série essentielle, puis utilise la banque complémentaire pour t’entraîner davantage.</p></div><span class="pill">${qcmTotal()} QCM</span></div>
    <section class="bank-note"><div><strong>${qcm.epreuves.filter(e=>e.subject_id!=='BA'&&e.serie_type==='ESSENTIELLE').reduce((n,e)=>n+e.questions.length,0)} questions essentielles</strong><span> à relire et mettre en correspondance avec les leçons</span></div><div><strong>${qcm.epreuves.filter(e=>e.subject_id!=='BA'&&e.serie_type==='COMPLEMENTAIRE').reduce((n,e)=>n+e.questions.length,0)} complémentaires</strong><span> issues de la banque historique, à conserver sous revue pédagogique</span></div></section>
    <div class="subject-grid wide">`;
  content.subjects.forEach(s => {
    if(s.id==='BA')return;
    const m = subjectMeta(s.id); const series = seriesForSubject(s.id); const total = series.reduce((n,x)=>n+x.e.questions.length,0);
    const essential = series.find(x=>x.e.serie_type==='ESSENTIELLE')?.e.questions.length || 0;
    const extra = total-essential;
    body += `<button class="subject-card subject-card-rich" onclick="location.hash='#reviseSubject:${encodeURIComponent(s.id)}'"><div class="subject-card-top"><span class="subject-icon large">${m.icon}</span><span class="subject-pct">${total} QCM</span></div><strong>${esc(s.name)}</strong><span>${essential} essentiels · ${extra} complémentaires</span><div class="card-action">Choisir une série ›</div></button>`;
  });
  body += '</div>';
  shell(body, 'revise');
}

function reviseSubject(id) {
  const s = content.subjects.find(x=>x.id===id); if(!s) return revise();
  const m=subjectMeta(id); const series=seriesForSubject(id); const scores=qcmScoreData();
  let body=`<div class="crumb"><a onclick="location.hash='#revise'">Réviser</a><span>›</span>${esc(m.short)}</div><div class="page-head"><div><div class="eyebrow">QCM · UNITÉ ${unitNumber()}</div><h1>${m.icon} ${esc(s.name)}</h1><p>Deux niveaux d’entraînement complémentaires.</p></div><span class="pill">${series.reduce((n,x)=>n+x.e.questions.length,0)} QCM</span></div><div class="series-grid">`;
  series.sort((a,b)=>(a.e.serie_type==='ESSENTIELLE'?-1:1)).forEach(({e,i})=>{
    const key=seriesKey(e,i); const last=scores[key]; const essential=e.serie_type==='ESSENTIELLE';
    body += `<article class="series-card ${essential?'essential':''}"><div class="row between"><span class="series-tag">${essential?'ESSENTIEL':'COMPLÉMENT'}</span><span class="pill">${e.questions.length} questions</span></div><h3>${esc(e.serie_label || e.titre)}</h3><p>${esc(e.description || '')}</p>${last?`<div class="last-score">Dernier score : <b>${last.score}/${last.total}</b> · ${last.pct}%</div>`:''}<button class="btn ${essential?'primary':'soft'} full" onclick="location.hash='#qcm:${i}'">${last?'Recommencer':'Commencer'}</button></article>`;
  });
  body += `</div><section class="source-note always"><h3>Pourquoi deux séries ?</h3><p>La série essentielle vérifie les acquis directement liés aux leçons riches. La banque complémentaire augmente le volume d’entraînement ; ses questions historiques restent identifiées séparément afin de faciliter leur revue pédagogique.</p></section>`;
  shell(body,'revise');
}

function qcmPage(i) {
  const e = qcm.epreuves[Number(i)];
  if (!e) return revise();
  if(e.subject_id==='BA'){ shell('<h1>Langues et cultures nationales</h1><p class="review-notice">Les QCM Bassa sont suspendus jusqu’à validation linguistique. Les ressources de travail restent accessibles avec un adulte.</p>','revise'); return; }
  const s = content.subjects.find(x=>x.id===e.subject_id); const m=subjectMeta(e.subject_id || s?.id || '');
  let body = `<div class="crumb"><a onclick="location.hash='#reviseSubject:${encodeURIComponent(e.subject_id || '')}'">Réviser · ${esc(m.short)}</a><span>›</span>${esc(e.serie_label || 'Série')}</div><div class="page-head"><div><div class="eyebrow">${esc(e.serie_label || 'QCM')} · UNITÉ ${unitNumber()}</div><h1>${m.icon} ${esc(s?.name || e.matiere)}</h1><p>${esc(e.description || e.titre)}</p></div><span class="pill">${e.questions.length} questions</span></div><div class="qcm-list" id="qcmBox">`;
  e.questions.forEach((q, qi) => {
    body += `<article class="qcmQuestion"><div class="eval-head"><span class="eval-number">${qi + 1}</span><span class="points">1 pt</span></div><b>${esc(q.enonce)}</b>${Klassia.shuffleOptions(q).map(c => `<label class="choice"><input type="radio" name="qq${qi}" value="${c.id}"><span>${esc(c.text)}</span></label>`).join('')}<div id="qc${qi}" class="feedback hidden"></div></article>`;
  });
  body += `</div><button class="btn primary large-action" onclick="correctQcm(${Number(i)})">Corriger la série</button><div id="scoreQcm" class="scoreBox"></div>`;
  shell(body, 'revise');
}
window.correctQcm = i => {
  const e = qcm.epreuves[i]; let score = 0;
  e.questions.forEach((q, qi) => {
    const r = [...document.querySelectorAll(`input[name="qq${qi}"]`)].find(x => x.checked);
    const b = document.getElementById('qc' + qi); b.classList.remove('hidden');
    const ok = r && Number(r.value) === q.bonne; if (ok) score++;
    b.innerHTML = `${ok ? '<div class="feedback-good"><b>Correct ✓</b>' : '<div class="feedback-retry"><b>À revoir</b>'}<p>${esc(q.corrige || '')}</p>${q.methode?`<p class="muted"><b>Méthode :</b> ${esc(q.methode)}</p>`:''}</div>`;
  });
  const pct = Math.round(score * 100 / e.questions.length);
  Klassia.append('klassia_attempts',{kind:'qcm',unit:currentUnit.id,series:seriesKey(e,i),score,total:e.questions.length});
  const scores=qcmScoreData(); const key=seriesKey(e,i); scores[key]={score,total:e.questions.length,pct,date:new Date().toISOString(),type:e.serie_type}; saveQcmScoreData(scores);
  document.getElementById('scoreQcm').innerHTML = `<strong>${score}/${e.questions.length}</strong><span>${pct >= 80 ? 'Très bien !' : pct >= 50 ? 'Bon début. Reprends les corrections.' : 'Revois les leçons correspondantes avant de réessayer.'}</span>`;
};

function project() {
  const p = content.integration_project;
  const state = projectData();
  let body = `
    <div class="page-head"><div><div class="eyebrow">PROJET D’INTÉGRATION</div><h1>${esc(p.title)}</h1><p>Mobilise plusieurs matières autour d’une situation concrète.</p></div><span class="pill">/20</span></div>
    <section class="project-mission"><div class="project-badge">MISSION</div><p>${esc(p.context)}</p></section>
    <section class="project-steps"><h2>Travail à réaliser</h2>`;
  p.tasks.forEach((x, i) => {
    body += `<label class="project-step"><input type="checkbox" data-project="${i}" ${state[i] ? 'checked' : ''}><span class="project-step-num">${i + 1}</span><span>${esc(x)}</span></label>`;
  });
  const done = p.tasks.filter((_, i) => state[i]).length;
  const pct = Math.round(done * 100 / p.tasks.length);
  body += `</section><section class="project-progress"><div class="row between"><span>Projet réalisé</span><strong id="projectPct">${pct}%</strong></div><div class="progress"><span id="projectBar" style="width:${pct}%"></span></div></section>
    <section class="rubric"><div class="eyebrow">BARÈME</div><h2>Comment le projet sera évalué</h2>${p.rubric.map(x => `<div class="rubric-row"><span>${esc(x[0])}</span><b>${x[1]} pt${x[1] > 1 ? 's' : ''}</b></div>`).join('')}<div class="rubric-total"><span>Total</span><b>${p.total}/20</b></div></section>`;
  shell(body, 'project');
  document.querySelectorAll('[data-project]').forEach(c => c.onchange = () => {
    const d = projectData(); d[c.dataset.project] = c.checked; saveProjectData(d);
    const checked = [...document.querySelectorAll('[data-project]')].filter(x => x.checked).length;
    const pp = Math.round(checked * 100 / p.tasks.length);
    document.getElementById('projectPct').textContent = pp + '%';
    document.getElementById('projectBar').style.width = pp + '%';
  });
}

function progressPage() {
  const total = lessonTotal();
  const p = progressData();
  const done = masteredCount();
  const ids = currentLessonIds();
  const review = Object.entries(p).filter(([id,st]) => ids.has(id) && st === 'A_REVOIR').length;
  const inProgress = Object.entries(p).filter(([id,st]) => ids.has(id) && st === 'EN_COURS').length;
  const ev = evalData();
  const scores = Object.values(ev).map(x => Number(x.score)).filter(Number.isFinite);
  const avg = scores.length ? (scores.reduce((a,b)=>a+b,0)/scores.length).toFixed(1) : '—';
  let body = `
    <div class="page-head"><div><div class="eyebrow">MON PARCOURS</div><h1>Suivi de progression</h1><p>Confiance déclarée par l’enfant, scores des exercices et notes accompagnées. Une déclaration ne prouve pas une compétence acquise.</p></div></div>
    <section class="stats-row four"><div class="mini-stat"><span class="mini-icon">✓</span><div><strong>${done}</strong><span>déclarées comprises</span></div></div><div class="mini-stat"><span class="mini-icon">↻</span><div><strong>${review}</strong><span>à revoir</span></div></div><div class="mini-stat"><span class="mini-icon">▶</span><div><strong>${inProgress}</strong><span>en cours</span></div></div><div class="mini-stat"><span class="mini-icon">★</span><div><strong>${avg}</strong><span>moyenne /20</span></div></div></section>
    <div class="progress-subjects">`;
  content.subjects.forEach(s => {
    const m = subjectMeta(s.id);
    const mastered = s.lessons.filter(l => p[l.id] === 'MAITRISEE').length;
    const reviser = s.lessons.filter(l => p[l.id] === 'A_REVOIR').length;
    const pct = Math.round(mastered * 100 / s.lessons.length);
    const score = ev[s.id]?.score;
    body += `<article class="progress-subject"><div class="subject-icon">${m.icon}</div><div class="grow"><div class="row between"><strong>${esc(m.short)}</strong><span>${pct}%</span></div><div class="progress"><span style="width:${pct}%"></span></div><div class="progress-details"><span>${mastered}/${s.lessons.length} déclarées comprises</span>${reviser ? `<span class="warn-text">${reviser} à revoir</span>` : ''}${score !== undefined ? `<span>Évaluation : ${esc(score)}/20</span>` : '<span>Évaluation non faite</span>'}</div></div></article>`;
  });
  body += `</div><section class="reset-card"><div><h3>Réinitialiser cette unité</h3><p>Efface uniquement cette unité CE2 pour le profil actif. Les autres enfants et la MS sont conservés.</p></div><button class="btn danger-soft" onclick="resetDemo()">Réinitialiser</button></section>`;
  shell(body, 'progress');
}
window.resetDemo = () => {
  if (!confirm(`Réinitialiser la progression de l’unité ${unitNumber()} ?`)) return;
  const ids = currentLessonIds();
  const p = progressData(); Object.keys(p).forEach(id => { if (ids.has(id)) delete p[id]; }); save(S.progress,p);
  const ex = exerciseData(); Object.keys(ex).forEach(k => { if ([...ids].some(id => k.startsWith(id+':'))) delete ex[k]; }); save(S.exercises,ex);
  Klassia.storage.removeItem(`${S.evals}:${currentUnit.id}`);
  Klassia.storage.removeItem(`${S.project}:${currentUnit.id}`);
  Klassia.storage.removeItem(`${S.qcmScores}:${currentUnit.id}`);
  if(currentUnit.id==='U1') Klassia.storage.removeItem(S.evals);
  const recent=load(S.recent,null); if(recent?.lessonId && ids.has(recent.lessonId)) Klassia.storage.removeItem(S.recent);
  progressPage();
};

function adminPage() {
  if (currentUser()?.role !== 'ADMIN') return home();
  const lessonCount = lessonTotal();
  const qcmCount = qcm.epreuves.reduce((n,e)=>n+e.questions.length,0);
  const exerciseCount = content.subjects.reduce((n,s)=>n+s.lessons.reduce((x,l)=>x+(l.exercises||[]).length,0),0);
  let body = `<p><a href="#coverage">Consulter la couverture et les statuts éditoriaux</a></p><div class="page-head"><div><div class="eyebrow">MODE PILOTE</div><h1>Administration éditoriale</h1><p>Vue de contrôle du corpus de l’unité actuellement sélectionnée.</p></div></div>
    <section class="stats-row four"><div class="mini-stat"><span class="mini-icon">📚</span><div><strong>10</strong><span>matières</span></div></div><div class="mini-stat"><span class="mini-icon">📘</span><div><strong>${lessonCount}</strong><span>leçons</span></div></div><div class="mini-stat"><span class="mini-icon">✍️</span><div><strong>${exerciseCount}</strong><span>exercices</span></div></div><div class="mini-stat"><span class="mini-icon">✓</span><div><strong>${qcmCount}</strong><span>QCM</span></div></div></section>
    <section class="admin-table"><div class="admin-row admin-head"><span>Matière</span><span>Leçons</span><span>Évaluation</span><span>Source</span></div>`;
  content.subjects.forEach(s => body += `<div class="admin-row"><span>${subjectMeta(s.id).icon} ${esc(subjectMeta(s.id).short)}</span><span>${s.lessons.length}</span><span>${s.assessment?.total || 20}/20</span><span>${esc(s.source_pages || 'Référentiel U1')}</span></div>`);
  body += `</section><section class="source-note always"><h3>Statut de cette version</h3><p>Prototype autonome de validation. La banque QCM fusionne les séries essentielles Klassia et l’ancienne banque du prototype, conservée comme source complémentaire à revoir. Les contenus Bassa restent soumis à validation linguistique spécialisée avant publication.</p></section>`;
  shell(body, 'admin');
}

function route() {
  if (!currentUser()) { login(); return; }
  const h = (location.hash || '#home').slice(1);
  if (h === 'login') { login(); return; }
  if (currentUser()?.role === 'PARENT' && !['home','progress'].includes(h)) { location.hash='#home'; home(); return; }
  if (h === 'home') home();
  else if (Klassia.specialRoute('CE2', '#'+h)) return;
  else if (h === 'learn') learn();
  else if (h === 'revise') revise();
  else if (h === 'project') project();
  else if (h === 'progress') progressPage();
  else if (h.startsWith('reviseSubject:')) reviseSubject(decodeURIComponent(h.split(':').slice(1).join(':')));
  else if (h === 'admin') adminPage();
  else if (h.startsWith('subject:')) subject(decodeURIComponent(h.split(':').slice(1).join(':')));
  else if (h.startsWith('lesson:')) lesson(decodeURIComponent(h.split(':').slice(1).join(':')));
  else if (h.startsWith('eval:')) evaluation(decodeURIComponent(h.split(':').slice(1).join(':')));
  else if (h.startsWith('qcm:')) qcmPage(h.split(':')[1]);
  else home();
  window.scrollTo({ top: 0, behavior: 'auto' });
}

window.addEventListener('hashchange', route);
boot().catch(e => {
  app.innerHTML = `<div class="login"><div class="loginCard"><div class="brand brand-large"><span class="brandMark">K</span>Klassia</div><h1>Erreur de chargement</h1><p class="error">${esc(e.message)}</p><pre class="technical-error">${esc(e.stack || '')}</pre></div></div>`;
});


function renderManualSections(l){
 return `${l.figure?`<img class="lesson-figure" src="${esc(l.figure.src)}" alt="${esc(l.figure.alt)}">`:''}<section class="manual-chapter">${(l.manual_sections||[]).map((sec,i)=>`<details class="manual-section" ${i===0?'open':''}><summary>${esc(sec.title)}</summary><div class="manual-section-body">${sec.body?`<p>${nl(sec.body)}</p>`:''}${sec.items?`<ul>${sec.items.map(x=>`<li>${nl(x)}</li>`).join('')}</ul>`:''}${sec.table?`<div class="manual-table-wrap"><table><thead><tr>${sec.table.headers.map(x=>`<th>${esc(x)}</th>`).join('')}</tr></thead><tbody>${sec.table.rows.map(row=>`<tr>${row.map(x=>`<td>${esc(x)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`:''}</div></details>`).join('')}</section>`;
}

function teacherGuideHtml(g){return `<details class="adult-guide"><summary>Guide de l’adulte</summary><p>${esc(g.preparation)}</p><ul>${(g.observation||[]).map(x=>`<li>${esc(x)}</li>`).join('')}</ul><p>${esc(g.adaptation||'')}</p><p>${esc(g.follow_up||'')}</p></details>`;}
