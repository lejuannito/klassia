/* Interface en anglais des classes anglophones (piste anglophone, lot A2 ; ADR-017).
   Les pages sont écrites en français ; pour une classe dont la langue est « en » (shared/classes.js), ce module traduit
   l'interface au moment de l'affichage : textes, aria-label, title et placeholder, y compris ce qui s'ajoute ensuite
   (dialogues, messages d'état). La clé est le libellé français exact ; ce qui n'est pas au dictionnaire reste tel quel.
   Le contenu pédagogique n'est jamais traduit : une zone marquée translate="no" est laissée intacte. */
(function (K) {
'use strict';
// Pages communes (recherche, outils, langue de la maison, impression) : elles ne sont dans aucun dossier de classe.
// Leur langue vient de la classe de la fiche (?classe=), sinon du lien suivi depuis une classe anglophone (?lang=en),
// sinon de la classe choisie par la famille à l'accueil (klassia_family). Par défaut, le français.
const COMMON = /\/(?:search|outils|maison|imprimer)(?:\.html)?$/;
const isCommon = () => typeof location === 'object' && COMMON.test(location.pathname);
function lang() {
 if (!isCommon()) return K.currentClass?.()?.language || 'fr';
 const q = new URLSearchParams(location.search), sheet = K.classInfo?.(q.get('classe'))?.language;
 if (sheet) return sheet;
 if (q.get('lang') === 'en' || q.get('lang') === 'fr') return q.get('lang');
 return K.classInfo?.(K.read?.('klassia_family', null)?.grade)?.language || 'fr';
}
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
 'Classes hors connexion': 'Offline classes', 'Installer toutes les classes': 'Install all the classes',
 'La mise à jour a été interrompue.': 'The update was interrupted.', 'L’édition installée est à jour.': 'The installed edition is up to date.',
 'Le téléchargement de toutes les classes est incomplet.': 'The download of all the classes is incomplete.',
 'Reconnectez-vous pour vérifier les mises à jour.': 'Reconnect to check for updates.', 'Vérifier les mises à jour': 'Check for updates',
 'Vérification des mises à jour…': 'Checking for updates…', 'Préparation de toutes les classes hors connexion…': 'Preparing all the classes for offline use…',
 'Mise à jour des classes hors connexion…': 'Updating the offline classes…', 'Chargement de la nouvelle édition…': 'Loading the new edition…',
 'Nouvelle édition téléchargée et vérifiée.': 'New edition downloaded and checked.', 'Recharger avec la nouvelle édition': 'Reload with the new edition',
 'Une nouvelle édition est active. Rechargez cette page pour l’utiliser.': 'A new edition is active. Reload this page to use it.',
 'Choisissez les classes à garder sur cet appareil.': 'Choose the classes to keep on this device.', 'Enregistrer ce choix': 'Save this choice',
 'Gardez au moins une classe.': 'Keep at least one class.',
 'Revue éditoriale (atelier pédagogique)': 'Editorial review (teaching workshop)', 'Moyenne section': 'Nursery (MS)', 'Grande section': 'Nursery (GS)',
 // Mention des contenus en relecture (ADR-018)
 'En relecture pédagogique': 'Under teaching review', '· contenu proposé par Klassia, pas encore validé par un enseignant.': '· content proposed by Klassia, not yet validated by a teacher.',
 'Pour utiliser Klassia sans connexion, choisissez la classe de votre enfant à l’accueil, ou installez tout.': 'To use Klassia offline, choose your child’s class on the welcome screen, or install everything.',
 // Pages communes (recherche, outils, langue de la maison, impression), en anglais quand on y arrive depuis une classe anglophone
 '← Accueil Klassia': '← Klassia home', 'Klassia · Accueil': 'Klassia · Home',
 'Rechercher une notion': 'Search for a topic', 'Notion à rechercher': 'Topic to search for',
 'Retrouvez les cours et activités de toutes les classes, de la moyenne section au CE2 et de la Class 1 à la Class 4. Édition pilote accompagnée.': 'Find the lessons and activities of every class, from the nursery classes (MS, GS) to CE2 and from Class 1 to Class 4. Supported pilot edition.',
 'Toutes les classes': 'All the classes', 'Matière ou domaine': 'Subject or domain', 'Toutes les matières': 'All the subjects',
 'Afficher les résultats suivants': 'Show the next results', 'Les états de l’eau': 'States of water', 'Résultats de recherche': 'Search results',
 'Saisissez une notion, par exemple : les états de l’eau.': 'Type a topic, for example: states of water.',
 'Recherche dans toutes les classes…': 'Searching all the classes…', 'les titres et objectifs sont prioritaires.': 'titles and objectives come first.',
 'Aucun résultat. Essayez moins de mots ou une autre notion, ou retirez les filtres.': 'No result. Try fewer words or another topic, or remove the filters.',
 'Recherche indisponible : vérifiez la connexion ou attendez le téléchargement complet de toutes les classes, puis réessayez.': 'Search is not available: check the connection or wait until all the classes are downloaded, then try again.',
 'Outils de référence': 'Reference tools', 'Nombres': 'Numbers', 'Tables de multiplication': 'Multiplication tables', 'Montants en lettres': 'Amounts in words',
 'Alphabet français': 'The alphabet', 'Chaque carte associe une majuscule et sa minuscule. Suis l’ordre de A à Z.': 'Each card shows a capital letter and its small letter. Follow the order from A to Z.',
 'Lire et décomposer un nombre': 'Read and break down a number',
 'Choisis un nombre entier de 0 à 99 999. Les rangs se lisent de gauche à droite, des dizaines de milliers aux unités.': 'Choose a whole number from 0 to 99 999. The places are read from left to right, from ten thousands to units.',
 'Nombre': 'Number', 'Lire le nombre': 'Read the number', 'Choisis une table. Lis d’abord les deux facteurs, puis le produit.': 'Choose a table. Read the two factors first, then the product.',
 'Table de': 'Times table', 'Calcul': 'Calculation', 'Produit': 'Product', 'Écrire un montant en lettres': 'Writing an amount in words',
 'Décompose le montant, écris chaque groupe et ajoute l’unité monétaire. Essaie d’abord seul, puis compare avec le résultat.': 'Break the amount down, write each group and add the currency. Try on your own first, then compare with the result.',
 'Montant entier en F CFA, de 0 à 10 000': 'Whole amount in CFA francs, from 0 to 10 000', 'Voir le montant en lettres': 'See the amount in words',
 'Enregistrez quelques mots de la langue que vous parlez en famille. L’enfant les écoute, puis retrouve l’image qui va avec.': 'Record a few words of the language you speak at home. The child listens to them, then finds the matching picture.',
 'Écouter et trouver': 'Listen and find', 'Enregistrer les mots': 'Record the words', 'Chargement…': 'Loading…',
 'La langue de la famille': 'The family language', 'Nom de la langue parlée à la maison': 'Name of the language spoken at home',
 'par exemple : bassa, ewondo, duala, fulfulde…': 'for example: Bassa, Ewondo, Duala, Fulfulde…', 'Enregistrer le nom': 'Save the name', 'Langue choisie :': 'Chosen language:',
 'Les enregistrements restent sur cet appareil, dans le profil de l’enfant. Ils ne sont ni envoyés, ni inclus dans la sauvegarde.': 'The recordings stay on this device, in the child’s profile. They are neither sent nor included in the backup.',
 'L’enregistrement n’est pas possible dans ce navigateur : essayez Chrome à jour.': 'Recording is not possible in this browser: try an up-to-date Chrome.',
 'Pour l’adulte : enregistrer les mots': 'For the adult: record the words',
 'Dites le mot une fois, clairement, comme vous le dites à la maison. L’enregistrement s’arrête seul après 6 secondes.': 'Say the word once, clearly, as you say it at home. The recording stops by itself after 6 seconds.',
 'Ces mots reviennent dans les leçons de langue nationale de la classe. Enregistrés ici, ils apparaissent dans la leçon, sous les formes bassa proposées.': 'These words come back in the national language lessons of the class. Recorded here, they appear in the lesson, next to the proposed Bassa forms.',
 '🎙️ Refaire': '🎙️ Record again', '🎙️ Enregistrer': '🎙️ Record', 'Effacer': 'Delete', 'Écrit dans la langue (facultatif)': 'Written in the language (optional)',
 'Il faut au moins trois mots enregistrés pour jouer.': 'At least three recorded words are needed to play.', 'Commencez par l’enregistrement ci-dessous.': 'Start with the recording below.',
 'Écoute le mot dans la langue de la maison, puis touche la bonne image.': 'Listen to the word in the home language, then touch the right picture.',
 '▶ Écouter le mot': '▶ Listen to the word', 'Le micro est indisponible dans ce navigateur.': 'The microphone is not available in this browser.',
 'Aucun son enregistré.': 'No sound recorded.', 'Réessayez plus près du micro.': 'Try again closer to the microphone.', '⏹ Arrêter': '⏹ Stop',
 'Enregistrement en cours… parlez maintenant.': 'Recording… speak now.',
 'Accès au micro refusé : autorisez le micro pour ce site dans le navigateur.': 'Microphone access refused: allow the microphone for this site in the browser.',
 'Le micro n’a pas pu démarrer.': 'The microphone could not start.', 'Enregistrement effacé.': 'Recording deleted.', 'Bravo !': 'Well done!', 'Mot suivant': 'Next word',
 'Écoute encore et essaie une autre image.': 'Listen again and try another picture.', 'Nom de la langue enregistré.': 'Language name saved.', 'Mot écrit enregistré.': 'Written word saved.',
 'La liste des mots n’a pas pu être chargée.': 'The list of words could not be loaded.', 'Rechargez la page avec la connexion.': 'Reload the page with the connection.',
 'Fiche imprimable': 'Printable sheet', '← Retour à Klassia': '← Back to Klassia', 'Imprimer / PDF': 'Print / PDF', 'Imprimer depuis le navigateur': 'Print from the browser',
 'Si l’aperçu reste blanc dans l’application, ouvrez cette fiche dans Chrome ou Safari.': 'If the preview stays blank in the app, open this sheet in Chrome or Safari.',
 'Ouvrir dans le navigateur': 'Open in the browser', 'Lien à copier si la fiche reste dans l’application': 'Link to copy if the sheet stays in the app',
 'Commandes d’impression': 'Print controls', 'Fiche élève': 'Pupil’s sheet', 'Guide et corrigé adulte': 'Adult guide and answers',
 'Ouvrir la fiche élève': 'Open the pupil’s sheet', 'Ouvrir le corrigé adulte': 'Open the adult answers',
 'Une image est indisponible.': 'A picture is not available.', 'Rechargez la fiche avant d’imprimer si l’image est nécessaire.': 'Reload the sheet before printing if the picture is needed.',
 'Fiche prête.': 'Sheet ready.', 'Dans la fenêtre d’impression, vous pouvez aussi choisir « Enregistrer en PDF ».': 'In the print window, you can also choose “Save as PDF”.',
 'Leçon introuvable.': 'Lesson not found.', 'Lien de fiche incomplet.': 'Incomplete sheet link.', 'Ressource indisponible.': 'Resource not available.',
 'Revenez à Klassia et rouvrez la fiche.': 'Go back to Klassia and open the sheet again.',
 // Maternelle anglophone (Nursery One, lot A7) : interface de shared/nursery.js
 'Thème': 'Theme', 'Par thème': 'By theme', 'L’activité du jour': 'Today’s activity', '🖨 Thème / PDF': '🖨 Theme / PDF',
 'Les 5 domaines': 'The 5 domains', 'Les activités mêlent oral, manipulation, visuel, autonomie, création et motricité.': 'The activities mix speaking, handling, looking, independence, creating and moving.',
 'Projet du thème': 'Theme project', 'À la fin du thème, utilisez la grille d’observation pour faire le point sans transformer la maternelle en examen.': 'At the end of the theme, use the observation grid to take stock without turning nursery school into an exam.',
 'Ouvrir la grille d’observation': 'Open the observation grid', 'Les 8 thèmes': 'The 8 themes', 'Voir le parcours complet': 'See the whole pathway', 'Repères documentaires :': 'Documentary references:',
 '← Retour au thème': '← Back to the theme', '🖨 Domaine / PDF': '🖨 Domain / PDF', '🖨 Activité / PDF': '🖨 Activity / PDF',
 'Guide adulte de l’activité / PDF': 'Adult guide to the activity / PDF', 'Guide adulte du domaine / PDF': 'Adult guide to the domain / PDF',
 'Repères du curriculum': 'Curriculum references', 'Activité originale Klassia; correspondance proposée à relire.': 'Original Klassia activity; proposed match, to be reviewed.',
 'Activités': 'Activities', 'Préparer et adapter l’activité': 'Prepare and adapt the activity', 'Parcourir les thèmes': 'Browse the themes',
 'Choisis un thème pour ouvrir ses activités.': 'Choose a theme to open its activities.', 'SUIVI PAR OBSERVATION': 'FOLLOW-UP BY OBSERVATION', '← Retour': '← Back',
 'Évaluer ici signifie observer pour mieux accompagner. On ne cherche ni classement ni note.': 'Assessing here means observing to support the child better. There is no ranking and no mark.',
 'Échelle': 'Scale', 'Indicateurs': 'Indicators', 'Observations enregistrées': 'Saved observations', 'Aucune observation enregistrée pour ce thème.': 'No observation saved for this theme yet.',
 'Seul': 'On their own', 'Avec aide': 'With help', 'Pas encore': 'Not yet',
 'Parcourir les matières et activités': 'Browse the subjects and activities', 'Les activités sont regroupées sur les huit thèmes.': 'The activities are grouped across the eight themes.',
 'Choisir d’abord un domaine': 'Choose a domain first', 'Parcours ensuite les huit thèmes pour ce même domaine.': 'Then go through the eight themes for this domain.',
 '8 thèmes': '8 themes', '← Domaines': '← Domains', '8 THÈMES': '8 THEMES', '🖨 Domaine complet / PDF': '🖨 Whole domain / PDF', 'Ouvrir': 'Open',
 'étoiles': 'stars', 'étoile': 'star', 'une par leçon réalisée': 'one per lesson done', 'une par activité réalisée': 'one per activity done', 'jours de suite': 'days in a row',
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
 [/^(\d+) en cours$/, '$1 in progress'],
 [/^(.+) disponibles? hors connexion · édition (\w+)\.$/, (m, list, code) => list.replace(/ et /g, ' and ') + ' available offline · edition ' + code + '.'],
 [/^Le téléchargement de (.+) est incomplet\.$/, (m, list) => 'The download of ' + list.replace(/ et /g, ' and ') + ' is incomplete.'],
 [/^(?:la )?(.+) n’est pas installée hors connexion sur cet appareil\.$/, '$1 is not installed offline on this device.'],
 [/^Ajouter (?:la )?(.+) \((.+) Mo\)$/, 'Add $1 ($2 MB)'], [/^Préparation de (.+) hors connexion…$/, 'Preparing $1 for offline use…'],
 [/^La base commune \((.+) Mo\) est toujours installée\.$/, 'The common base ($1 MB) is always installed.'],
 [/^(.+) Mo$/, '$1 MB'], [/^(\d+) à revoir$/, '$1 to look at again'],
 [/^(\d+) résultats?$/, (m, n) => n + (n === '1' ? ' result' : ' results')],
 [/^Hors connexion, la recherche ne couvre pas (.+) : (?:ces classes ne sont pas installées|cette classe n’est pas installée) sur cet appareil\.$/, (m, list) => 'Offline, the search does not cover ' + list + ': ' + (list.includes(',') ? 'these classes are' : 'this class is') + ' not installed on this device.'],
 [/^Table de (\d+)$/, 'The $1 times table'], [/^Saisis un entier de 0 à ([\d\s]+)\.$/, 'Enter a whole number from 0 to $1.'],
 [/^(\d+) mots? enregistrés? sur (\d+) mots du quotidien(?:, et (\d+) sur (\d+) mots des leçons)?\.$/, (m, a, b, c, d) => a + ' of ' + b + ' everyday words recorded' + (c ? ', and ' + c + ' of ' + d + ' lesson words' : '') + '.'],
 [/^Mots des leçons de l’école \((\d+)\)$/, 'Words from the school lessons ($1)'], [/^Encore (\d+)\.$/, '$1 more.'],
 [/^Écouter « (.+) »$/, 'Listen to “$1”'], [/^« (.+) » est enregistré\.$/, '“$1” is recorded.'],
 [/^(.+) · THÈME (\d+)$/, '$1 · THEME $2'], [/^(.+) · PAR DOMAINE$/, '$1 · BY DOMAIN'],
 [/^(\d+) activités?$/, (m, n) => n + (n === '1' ? ' activity' : ' activities')], [/^(\d+) acquises?$/, '$1 achieved'],
 [/^(\d+) activités? · (\d+)% acquis$/, (m, n, p) => n + (n === '1' ? ' activity' : ' activities') + ' · ' + p + '% achieved'],
 [/^(\d+) min avec un adulte$/, '$1 min with an adult'], [/^Commencer ›$/, 'Start ›'], [/^Continuer ›$/, 'Continue ›'],
 [/^moyenne des évaluations ([\d.,]+)\/20$/, 'assessment average $1/20'], [/^Unité (\d+) · (.+)$/, 'Theme $1 · $2'],
];

function whole(core) {
 if (EN[core] !== undefined) return EN[core];
 for (const [re, to] of PATTERNS) if (re.test(core)) return core.replace(re, to);
 return undefined;
}
// Un libellé fait de morceaux séparés par « · » (« 0/32 · réalisées · 1 en cours ») se traduit morceau par morceau.
// Un message fait de plusieurs phrases (état hors connexion) se traduit phrase par phrase.
function pieces(core, sep) {
 const parts = core.split(sep), done = parts.map(x => whole(x) ?? x);
 return done.some((x, i) => x !== parts[i]) ? done.join(sep === ' · ' ? ' · ' : ' ') : undefined;
}
function translate(text) {
 const core = text.trim();
 if (!core) return text;
 let out = whole(core);
 if (out === undefined && core.includes(' · ')) out = pieces(core, ' · ');
 if (out === undefined && /[.!?…] \S/.test(core)) out = pieces(core, /(?<=[.!?…]) (?=\S)/);
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
  // Depuis une classe anglophone, un lien vers une page commune garde l'anglais.
  if (!isCommon() && el.matches('a[href]')) { const url = new URL(el.href, location.href); if (url.origin === location.origin && COMMON.test(url.pathname) && !url.searchParams.has('lang') && !url.searchParams.has('classe')) { url.searchParams.set('lang', 'en'); el.href = url.href; } }
 }
 const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
 for (let t = walker.nextNode(); t; t = walker.nextNode()) translateNode(t);
}
function start() {
 document.documentElement.lang = 'en';
 // Un passage écrit pour chaque langue (data-lang) : on montre celui de l'anglais.
 for (const el of document.querySelectorAll('[data-lang]')) el.hidden = el.dataset.lang !== 'en';
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
