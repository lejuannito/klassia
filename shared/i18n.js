/* Interface en anglais des classes anglophones (piste anglophone, lot A2 ; ADR-017).
   Les pages sont écrites en français ; pour une classe dont la langue est « en » (shared/classes.js), ce module traduit
   l'interface au moment de l'affichage : textes, aria-label, title et placeholder, y compris ce qui s'ajoute ensuite
   (dialogues, messages d'état). La clé est le libellé français exact ; ce qui n'est pas au dictionnaire reste tel quel.
   Le contenu pédagogique n'est jamais traduit : une zone marquée translate="no" est laissée intacte. */
(function (K) {
'use strict';
const lang = () => K.currentClass?.()?.language || 'fr';
K.lang = lang;

// Libellés exacts (texte d'un nœud, sans les espaces autour).
const EN = {
 // En-tête, navigation de la classe, barre d'onglets
 'Accueil': 'Home', 'Apprendre': 'Learn', 'Semaine': 'Week', 'Réviser': 'Revise', 'Suivi': 'Progress',
 'Revue': 'Review', 'Bassa': 'Bassa',
 'Par unité': 'By theme', 'Par matière': 'By subject', 'Par domaine': 'By domain', 'Cette semaine': 'This week',
 'Parcourir la classe': 'Browse the class', 'Navigation de la classe': 'Class navigation',
 'Classe': 'Class', 'Outils': 'Tools', 'Parents': 'Parents', 'Rechercher': 'Search',
 '← Parcours de la classe': '← Class pathway', 'Retour à ma classe': 'Back to my class',
 // Accueil de la classe
 'Pour commencer': 'To begin', 'Ta prochaine étape': 'Your next step', 'Continuer': 'Continue', 'Commencer': 'Start',
 'Tu as travaillé aujourd’hui': 'You worked today',
 'Bonjour': 'Hello',
 'Toutes les leçons, par unité, par matière ou par domaine.': 'All the lessons, by theme, by subject or by domain.',
 'Toutes les leçons, par unité ou par matière.': 'All the lessons, by theme or by subject.',
 'Cette semaine à l’école': 'This week at school', 'Les leçons de la semaine en cours.': 'The lessons of the current week.',
 'Des séries de questions par matière, avec la leçon à revoir.': 'Sets of questions by subject, with the lesson to look at again.',
 'Les leçons de cette classe sont en préparation. Les thèmes et les matières du programme sont déjà en place.': 'The lessons of this class are being prepared. The themes and subjects of the curriculum are already in place.',
 'Édition pilote accompagnée · relecture pédagogique en cours': 'Supported pilot edition · teaching review in progress',
 'Édition pilote accompagnée · contenus en cours de relecture pédagogique.': 'Supported pilot edition · contents under teaching review.',
 // Parcours : thèmes et matières
 'Parcourir les unités': 'Browse the themes', 'Choisis une unité, puis une leçon.': 'Choose a theme, then a lesson.',
 '← Toutes les unités': '← All the themes', 'Unités': 'Themes', 'Unité': 'Theme',
 'Parcourir les matières': 'Browse the subjects', 'Les matières du programme, en préparation.': 'The subjects of the curriculum, being prepared.',
 'Les leçons de chaque matière sont réunies sur les huit unités.': 'The lessons of each subject, across the eight themes.',
 'Les leçons de ce thème sont en préparation.': 'The lessons of this theme are being prepared.',
 'En préparation': 'Being prepared', 'Autres matières, en préparation': 'Other subjects, being prepared', '← Page précédente': '← Previous page',
 'Ce lien ne correspond pas à une leçon de cette classe.': 'This link does not match a lesson of this class.', 'Revenir aux unités': 'Back to the themes',
 'Fil d’Ariane': 'Breadcrumb',
 // Semaine à l'école (shared/week.js)
 'Choisis l’unité et la semaine où en est la classe. Klassia te montre le thème, les pages du manuel et les leçons qui vont avec.': 'Choose the theme and the week the class has reached. Klassia shows the theme and the lessons that go with it.',
 'Thème de la semaine': 'Theme of the week', 'Dans Klassia cette semaine': 'In Klassia this week',
 'Klassia répartit les leçons de chaque matière sur les trois semaines de l’unité, dans leur ordre. C’est une proposition : l’ordre suivi par l’école peut être différent.': 'Klassia spreads the lessons of each subject over the three weeks of the theme, in order. This is a suggestion: the school may follow a different order.',
 'Bilan, révisions et projet de l’unité': 'Review, revision and project of the theme', 'Dans Klassia : bilan de l’unité': 'In Klassia: theme review',
 'Toutes les leçons de l’unité sont réalisées. Bravo !': 'All the lessons of the theme are done. Well done!',
 // Leçon : état, navigation entre leçons, tracé au doigt, lecture à voix haute
 'À découvrir': 'To discover', 'Réalisé': 'Done', 'En cours': 'In progress', 'À faire': 'To do', 'À revoir': 'To look at again', 'Je me sens prêt': 'I feel ready',
 '← Toutes les matières': '← All the subjects', 'Choisissez une leçon.': 'Choose a lesson.', 'Leçons de cette unité': 'Lessons of this theme',
 '← Précédente': '← Previous', 'Suivante →': 'Next →',
 'Écrire ou dessiner au doigt': 'Write or draw with a finger', 'Couleur': 'Colour', 'Trait': 'Line', 'Noir': 'Black', 'Bleu': 'Blue', 'Rouge': 'Red', 'Jaune': 'Yellow', 'Vert': 'Green',
 'Fin': 'Thin', 'Large': 'Thick', 'Annuler le dernier trait': 'Undo the last line', 'Tout effacer': 'Clear everything', 'Terminer le tracé': 'Finish drawing',
 'Surface pour écrire ou dessiner': 'Space to write or draw', 'Maison à colorier avec un toit, une porte et une fenêtre': 'House to colour with a roof, a door and a window',
 'Préparation de la fiche…': 'Preparing the sheet…', 'Tracés conservés dans ce profil.': 'Drawings kept in this profile.',
 'Tu peux tracer pendant cette séance. Le stockage local est indisponible.': 'You can draw during this session. Local storage is not available.',
 'Le stockage du tracé est indisponible. Les traits restent visibles pendant cette séance.': 'Drawing storage is not available. The lines stay visible during this session.',
 'Le cahier a changé dans une autre fenêtre. Rouvrez la fiche pour retrouver les traits conservés.': 'The workbook changed in another window. Open the sheet again to find the saved lines.',
 'Effacer tous les tracés de cette fiche ?': 'Clear all the drawings on this sheet?',
 '■ Arrêter / Stop': '■ Stop', 'Lecture arrêtée / Reading stopped.': 'Reading stopped.',
 // Suivi
 'Suivi de progression': 'Progress', 'leçons réalisées': 'lessons done', 'leçon réalisée': 'lesson done', 'unités commencées': 'themes started', 'unité commencée': 'theme started',
 'Activité récente': 'Recent activity', 'Aucune activité enregistrée pour le moment.': 'No activity recorded yet.',
 // Menu des parents, profils, sauvegarde
 'Classes et espaces': 'Classes and spaces', 'Outils des parents': 'Parents’ tools', 'Suivi, profils, sauvegarde et recherche.': 'Progress, profiles, backup and search.',
 'Édition pilote accompagnée : les contenus sont en cours de relecture pédagogique.': 'Supported pilot edition: the contents are under teaching review.',
 'Suivi des classes': 'Progress in every class', 'Langue de la maison': 'Home language', 'Atelier pédagogique': 'Teaching workshop',
 'Validation pédagogique': 'Teaching validation', 'Recommander Klassia (WhatsApp)': 'Recommend Klassia (WhatsApp)',
 'Espace des parents': 'Parents’ space', 'Fermer': 'Close', 'Annuler': 'Cancel', 'Réessayer': 'Try again',
 'Pour continuer, un adulte répond à ce calcul. Ce n’est pas un mot de passe : la question évite seulement les ouvertures par erreur.': 'To continue, an adult answers this sum. It is not a password: the question only prevents opening by mistake.',
 'Ce n’est pas le bon résultat. Voici un autre calcul.': 'That is not the right answer. Here is another sum.',
 'Profil et espace de travail': 'Profile and workspace',
 'Klassia fonctionne sans compte en ligne. Choisissez le profil de l’enfant, puis l’espace à afficher. Ces choix restent sur cet appareil et ne sont pas protégés par mot de passe.': 'Klassia works without an online account. Choose the child’s profile, then the space to show. These choices stay on this device and are not protected by a password.',
 'Enfant actif': 'Active child', 'Mon enfant': 'My child', 'Ajouter un enfant (prénom ou pseudonyme)': 'Add a child (first name or nickname)', 'Ajouter le profil': 'Add the profile',
 'Renommer le profil actif': 'Rename the active profile', 'Espace affiché': 'Space shown', 'Enfant · apprendre et réviser': 'Child · learn and revise',
 'Parent · consulter la progression': 'Parent · see progress', 'Enseignant · revue éditoriale et Bassa': 'Teacher · editorial review and Bassa',
 'Changer d’espace ne crée pas de session sécurisée et ne modifie pas les données de l’enfant.': 'Changing space does not create a secure session and does not change the child’s data.',
 'Exporter régulièrement les progrès avant de changer d’appareil.': 'Export progress regularly before changing device.', 'Télécharger la sauvegarde': 'Download the backup',
 'Restaurer dans ce profil': 'Restore into this profile', 'Annuler la dernière restauration': 'Undo the last restore',
 'Retour à la vue enfant': 'Back to the child view',
 // Suivi des classes (vue d'ensemble) et espace adulte
 'Avancement déclaré sur cet appareil. Réaliser une activité ne vaut pas validation pédagogique.': 'Progress reported on this device. Doing an activity is not a teaching validation.',
 'Les 7 derniers jours': 'The last 7 days', 'Aucune activité enregistrée ces 7 derniers jours sur cet appareil.': 'No activity recorded on this device in the last 7 days.',
 'Ouvrir cette classe': 'Open this class', 'Carnet du pilote': 'Pilot notebook', 'Revue éditoriale': 'Editorial review', 'Atelier bassa': 'Bassa workshop',
 'Les données appartiennent au profil actif sur cet appareil. Exportez une sauvegarde avant de changer d’appareil.': 'The data belongs to the active profile on this device. Export a backup before changing device.',
 'réalisées': 'done', 'en cours': 'in progress', 'à revoir': 'to look at again',
 // Hors connexion (pwa.js)
 'Classes hors connexion': 'Offline classes', 'Installer les cinq classes': 'Install the five classes',
 'Pour utiliser Klassia sans connexion, choisissez la classe de votre enfant à l’accueil, ou installez tout.': 'To use Klassia offline, choose your child’s class on the welcome screen, or install everything.',
};

// Le profil créé d'office s'appelle « Mon enfant » ; un prénom choisi par la famille reste tel quel.
const name = n => (n === 'Mon enfant' ? 'My child' : n);
// Libellés qui contiennent un nombre ou un nom : expression → remplacement.
const PATTERNS = [
 [/^Unité (\d+)$/, 'Theme $1'],
 [/^Bonjour (.+) !$/, (m, n) => 'Hello ' + name(n) + '!'],
 [/^Bonjour (.+)$/, (m, n) => 'Hello ' + name(n)],
 [/^(.+) · (\d+) leçons? réalisées? sur (\d+)$/, '$1 · $2 of $3 lessons done'],
 [/^(\d+) leçons?$/, (m, n) => n + (n === '1' ? ' lesson' : ' lessons')],
 [/^([\d.,]+) h par semaine · tableau (\d+) du programme$/, '$1 h a week · curriculum table $2'],
 [/^(.+) · ce que l’enfant déclare avoir réalisé\. Une déclaration ne prouve pas une compétence acquise\.$/, '$1 · what the child reports having done. A report does not prove a skill has been mastered.'],
 [/^Profil : (.+)$/, (m, n) => 'Profile: ' + name(n)], [/^Sauvegarde de (.+)$/, (m, n) => 'Backup of ' + name(n)],
 [/^Espace : Enfant · changer$/, 'Space: Child · change'], [/^Espace : Parent · changer$/, 'Space: Parent · change'], [/^Espace : Enseignant · changer$/, 'Space: Teacher · change'],
 [/^Semaine (\d)$/, 'Week $1'],
 [/^Semaine 4 \(bilan\)$/, 'Week 4 (review)'],
 [/^Leçon consultée : (.+)$/, 'Lesson opened: $1'], [/^Leçon réalisée : (.+)$/, 'Lesson done: $1'], [/^Leçon à revoir : (.+)$/, 'Lesson to look at again: $1'],
 [/^Série QCM : (\d+)\/(\d+)$/, 'Question set: $1/$2'],
 [/^Édition en préparation : (.+) sont en relecture ; les autres matières suivent\.$/, 'Edition in preparation: $1 are under review; the other subjects will follow.'],
 [/^Suivi de (.+)$/, (m, n) => 'Progress of ' + name(n)],
 [/^(\d+) \/ (\d+) activités ou leçons réalisées$/, '$1 / $2 activities or lessons done'],
 [/^(\d+)\/(\d+) · réalisées$/, '$1/$2 · done'],
 [/^(\d+) en cours$/, '$1 in progress'], [/^(\d+) à revoir$/, '$1 to look at again'],
 [/^moyenne des évaluations ([\d.,]+)\/20$/, 'assessment average $1/20'], [/^Unité (\d+) · (.+)$/, 'Theme $1 · $2'],
];

function whole(core) {
 if (EN[core] !== undefined) return EN[core];
 for (const [re, to] of PATTERNS) if (re.test(core)) return core.replace(re, to);
 return undefined;
}
// Un libellé fait de morceaux séparés par « · » (« 0/32 · réalisées · 1 en cours ») se traduit morceau par morceau.
function translate(text) {
 const core = text.trim();
 if (!core) return text;
 let out = whole(core);
 if (out === undefined && core.includes(' · ')) {
  const parts = core.split(' · '), done = parts.map(x => whole(x) ?? x);
  if (done.some((x, i) => x !== parts[i])) out = done.join(' · ');
 }
 return out === undefined ? text : text.replace(core, out);
}
K.t = text => (lang() === 'en' ? translate(String(text)) : String(text));

const ATTRS = ['aria-label', 'title', 'placeholder'];
const skip = el => el.closest?.('[translate="no"], script, style, textarea, code');
function translateNode(node) {
 if (node.nodeType === Node.TEXT_NODE) {
  if (node.parentElement && skip(node.parentElement)) return;
  const next = translate(node.data);
  if (next !== node.data) node.data = next;
  return;
 }
 if (node.nodeType !== Node.ELEMENT_NODE || skip(node)) return;
 for (const el of [node, ...node.querySelectorAll('*')]) {
  if (skip(el)) continue;
  for (const a of ATTRS) if (el.hasAttribute(a)) { const v = el.getAttribute(a), next = translate(v); if (next !== v) el.setAttribute(a, next); }
  if (el.matches('input[type="submit"], input[type="button"]')) { const next = translate(el.value); if (next !== el.value) el.value = next; }
 }
 const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
 for (let t = walker.nextNode(); t; t = walker.nextNode()) translateNode(t);
}
function start() {
 document.documentElement.lang = 'en';
 translateNode(document.body);
 document.title = translate(document.title);
 new MutationObserver(list => {
  for (const m of list) {
   if (m.type === 'childList') m.addedNodes.forEach(translateNode);
   else if (m.type === 'characterData') translateNode(m.target);
   else if (m.type === 'attributes') translateNode(m.target);
  }
 }).observe(document.body, {childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS});
}
if (lang() === 'en' && typeof document === 'object') {
 if (document.body) start(); else document.addEventListener('DOMContentLoaded', start, {once: true});
}
K.i18n = {translate, dictionary: EN, patterns: PATTERNS};
})(window.Klassia);
