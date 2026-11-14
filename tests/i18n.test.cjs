const test = require('node:test'), assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
// Interface en anglais des classes anglophones (lot A2) : la traduction suit le dictionnaire, ne touche pas au reste,
// et ne fait rien dans une classe francophone.
const source = fs.readFileSync(path.join(__dirname, '..', 'shared', 'i18n.js'), 'utf8');
const load = language => { const K = {currentClass: () => ({language})}; vm.runInNewContext(source, {window: {Klassia: K}}); return K; };

test('an English class translates the interface labels it knows and nothing else', () => {
  const K = load('en');
  assert.equal(K.lang(), 'en');
  assert.equal(K.t('Accueil'), 'Home');
  assert.equal(K.t('  Par matière \n'), '  By subject \n', 'surrounding spaces are kept');
  assert.equal(K.t('Unité 3'), 'Theme 3');
  assert.equal(K.t('12 leçons'), '12 lessons');
  assert.equal(K.t('1 leçon'), '1 lesson');
  assert.equal(K.t('Bonjour Mon enfant'), 'Hello My child', 'the default profile name is translated');
  assert.equal(K.t('Bonjour Awa'), 'Hello Awa', 'a name chosen by the family is kept');
  assert.equal(K.t('Class 1 · 2 leçons réalisées sur 64'), 'Class 1 · 2 of 64 lessons done');
  assert.equal(K.t('La maison'), 'La maison', 'content outside the dictionary is left as it is');
  assert.equal(K.t('Français'), 'Français', 'a subject name is not an interface label');
});

test('a French class keeps its interface', () => {
  const K = load('fr');
  assert.equal(K.lang(), 'fr');
  assert.equal(K.t('Accueil'), 'Accueil');
});

test('every translation is filled and no label is listed twice', () => {
  const {dictionary} = load('en').i18n;
  for (const [fr, en] of Object.entries(dictionary)) assert.ok(en && en !== fr || fr === 'Bassa' || fr === 'Parents', fr);
  const keys = [...source.matchAll(/^\s*'([^']+)':/gm)].map(m => m[1]).concat([...source.matchAll(/, '([^']+)': '/g)].map(m => m[1]));
  assert.equal(new Set(keys).size, keys.length, 'duplicate keys: ' + keys.filter((k, i) => keys.indexOf(k) !== i).join(', '));
});

test('a label made of parts separated by « · » is translated part by part', () => {
  const K = load('en');
  assert.equal(K.t('0/32 · réalisées · 1 en cours'), '0/32 · done · 1 in progress');
  assert.equal(K.t('The home · La maison'), 'The home · La maison', 'nothing to translate: unchanged');
});

test('offline messages are translated sentence by sentence, with the names of the classes', () => {
  const K = load('en');
  assert.equal(K.t('La mise à jour a été interrompue. Le téléchargement de Class 1 est incomplet.'), 'The update was interrupted. The download of Class 1 is incomplete.');
  assert.equal(K.t('SIL et Class 1 disponibles hors connexion · édition 1a2b3c4d.'), 'SIL and Class 1 available offline · edition 1a2b3c4d.');
  assert.equal(K.t('Nursery Two disponible hors connexion · édition c804776f. la Nursery One n’est pas installée hors connexion sur cet appareil.'), 'Nursery Two available offline · edition c804776f. Nursery One is not installed offline on this device.');
  assert.equal(K.t('Ajouter la Class 1 (0,2 Mo)'), 'Add Class 1 (0,2 MB)');
  assert.equal(K.t('En relecture pédagogique'), 'Under teaching review');
});
