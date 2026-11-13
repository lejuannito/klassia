# Moteur unique — plan et avancement

_Décision du porteur de projet, 12 novembre 2026 (ADR-014)_

## Pourquoi

Klassia avait trois moteurs de rendu, nés à des moments différents. Depuis M4 il n’en reste qu’un : le CE2 (M3h-4) puis la maternelle (M4) ont rejoint `shared/learning-app.js`, et leurs anciens fichiers sont supprimés. Situation de départ :

| Moteur | Classes | Fichiers | Taille |
|---|---|---|---|
| CE2 | CE2 | `app.js`, `v9.js`, `v14.js` | environ 80 ko |
| Maternelle | MS, GS | `ms/app-core-v13.js`, `ms/app-ui-v13.js`, `ms/ms-v14.js` | environ 28 ko |
| Leçons | SIL, CE1 | `shared/learning-app.js` | environ 24 ko |

Chaque nouveauté (mode famille, « Je révise », formats vérifiés, semaine à l’école) doit être écrite deux ou trois fois, ou reste absente d’une classe. Les classes anglophones doubleraient encore ce coût.

## Cible

Un seul moteur, `shared/learning-app.js`, qui lit le **registre des classes** et rend toutes les classes. Ce qui est propre à une classe est une donnée (catalogue, fonctions offertes) ou un module de page (évaluation et projet du CE2, fiche parent de maternelle), pas un moteur.

Règles tenues à chaque étape :

- aucun identifiant de ressource renommé ; les adresses existantes (`#lesson:…`, `#domain:…`) continuent d’ouvrir la même ressource ;
- les clés de progression locales sont relues telles quelles ; aucune progression perdue ;
- le hors-connexion et les tests navigateur restent verts à chaque fusion ;
- une étape = une PR que l’on peut annuler seule.

## Étapes

| Étape | Contenu | État |
|---|---|---|
| **M1. Registre des classes** | `shared/classes.js` décrit chaque classe (dossier, catalogue, clés, accueil, fonctions). Les trois moteurs, la navigation, le suivi, la recherche, l’impression et le carnet de pilote le lisent ; les configurations écrites dans les pages disparaissent. | **fait** |
| **M2. Modèle commun de ressource** | `shared/lesson-model.js` range une leçon SIL/CE1, une leçon CE2 et une activité de maternelle dans la même forme en quatre étapes : Je découvre, Je retiens, Je m’exerce, Je fais le point. La page de leçon SIL/CE1 s’affiche une étape à la fois (ou toute la leçon, au choix de l’appareil), avec un bilan des réponses vérifiées, le QCM lié et la leçon suivante. | **fait** |
| **M3a. Leçon CE2 en quatre étapes** | `shared/lesson-steps.js` porte la barre d’étapes, le passage d’une étape à l’autre et le choix « Toute la leçon » pour les deux moteurs. La leçon CE2 range ses blocs dans les quatre étapes ; le lien « Je révise » ouvre l’étape de l’exercice visé. | **fait** |
| **M3b. Bilan commun** | Le bilan de « Je fais le point » (réponses vérifiées, réussites seul) est calculé et tenu à jour par le composant partagé, pour SIL, CE1 et CE2. | **fait** |
| **M3c. Exercices communs** | Le QCM et la réponse numérique entrent dans le composant d’exercices partagé (`shared/exercises.js`) ; le CE2 les rend par lui. Les formats « ranger, relier, compléter » deviennent utilisables au CE2, et le QCM et le nombre en SIL et CE1. | **fait** |
| **M3d. Lecteur de QCM commun** | `shared/qcm.js` affiche et corrige une série pour toutes les classes (CE1 et CE2 aujourd’hui) : questions mélangées, corrigé, méthode, leçon à revoir, corrigé adulte sans essai enregistré. Chaque classe garde son en-tête et l’enregistrement de son score. | **fait** |
| **M3e. Listes communes** | Les listes de classes utilisaient déjà `K.catalogue` (unités, matières, thèmes). `K.lessonList` y ajoute la liste de leçons avec leur état, pour SIL, CE1 et CE2. | **fait** |
| **M3f. Barre d’onglets commune** | Décision du porteur de projet (12 novembre 2026) : la barre d’onglets du CE2 devient l’habillage des classes du primaire ; la maternelle garde le sien. `K.tabBar` l’affiche au CE2 et, désormais, en SIL et CE1 (Accueil, Apprendre, Semaine, Réviser), avec une page d’accueil de classe. | **fait** |
| **M3g. Page Suivi commune** | `K.progressSummary` affiche les chiffres clés et une ligne par matière. Le CE2 l’utilise pour sa page Suivi ; SIL et CE1 reçoivent l’onglet Suivi et la même page, sur l’année entière. | **fait** |
| **M3h-1. Le CE2 lu par le moteur commun (aperçu)** | Le moteur commun charge les huit unités du CE2 par un adaptateur (`ce2Unit`) et les affiche sous `/ce2/` : accueil, unités, matières, leçon en quatre étapes, exercices, semaine, suivi. Il lit et écrit la progression du CE2 sous ses noms d’origine, donc les deux moteurs partagent les mêmes données. L’ancien moteur reste en service à la racine. | **fait** |
| **M3h-2. Parité de l’aperçu, côté enfant** | Dans l’aperçu : QCM par unité (banque chargée à la demande, séries bassa toujours suspendues), évaluation de matière, projet d’intégration, pages du manuel et figure dans « Je retiens », guide de l’adulte, cahier pratique (dictée, problèmes) et impression. Scores, évaluations et projet sont enregistrés sous les clés de l’ancien moteur. | **fait** |
| **M3h-3. Espace adulte du CE2 en modules** | Revue éditoriale et atelier Bassa sortent de `v14.js` vers `shared/workshop.js` ; le journal d’activité sort de `v9.js` vers `shared/activity.js`. Les deux moteurs les utilisent. Dans le moteur commun, en espace adulte, la page Suivi ajoute le détail par unité (à revoir, moyenne des évaluations), l’activité récente et les liens de l’atelier ; le profil Administration ouvre « Contenu de la classe » (`#admin`) ; le profil Parent ne répond pas aux QCM ni au projet à la place de l’enfant ; la page d’unité du CE2 imprime le thème et chaque matière. Une matière du CE2 garde un seul nom d’une unité à l’autre et `#subject:FR` reste valide. | fait |
| **M3h-4. Bascule du CE2** | La racine est servie par le moteur commun ; `app.js`, `v9.js`, `v14.js` et leurs feuilles de style sont supprimés, ainsi que l’aperçu `/ce2/`. Dans le registre, le CE2 est une classe du moteur `lessons` dont les données gardent leur forme (`format: 'ce2'`). Les anciennes adresses restent valides (`?unit=U3#lesson:…`, `#learn`, `#progress`, `#revise`, `#qcm:n`, `#eval:FR`, `#project`, `#subject:FR`, `#subjects-all`, `#domain-all:n`). Progression, scores, évaluations, projet, réponses écrites, tracés et journal restent sous leurs clés d’origine. Seul `klassia_exercises` (dernier résultat par exercice de l’ancien moteur) n’est plus écrit : il reste dans les sauvegardes, et les nouvelles réponses vont au journal commun `klassia_attempts`. Enseignant et administration ont les onglets Revue et Bassa. Ouverture mesurée en local : environ 0,4 s, 0,9 s avec un processeur ralenti quatre fois (les huit unités, 1,5 Mo, sont lues à l’ouverture). | fait |
| **M4. Maternelle sur le moteur commun** | MS et GS sont chargées par `shared/learning-app.js`, qui confie leurs pages au module `shared/nursery.js` (thèmes, fiche parent, mode enfant, observation, cahier, parcours par matière et par domaine, impressions). La maternelle garde sa présentation (ADR-016). Registre : `engine: 'lessons', format: 'nursery'`. `ms/app-core-v13.js`, `ms/app-ui-v13.js` et `ms/ms-v14.js` sont supprimés ; les boutons d’impression, auparavant ajoutés après coup à la page, font partie de son rendu, et le cahier imprimable est lu au chargement au lieu de provoquer un second rendu. Adresses (`?theme=T3#domain:LC:2`, `#themes`, `#assessment`, `#worksheets`, `#subjects-all`, `#domains-all`, `#domain-all:LC`) et clés locales inchangées. | fait |
| **M5. Nettoyage** | Une seule feuille de style par habillage ; `ms/nursery-support.js` rejoint `shared/` ; tests navigateur réécrits sur les sélecteurs communs. | à faire |

M3 est l’étape la plus lourde : le CE2 porte l’évaluation, les projets, les QCM par unité et l’essentiel des tests navigateur. Elle sera découpée (leçon, puis listes, puis révision).

## Ce que change M1

- Ajouter une classe (par exemple Class 1) revient à ajouter une entrée au registre et un dossier de données.
- `npm run validate` vérifie que le registre et les catalogues disent la même chose (classe jumelle, liste d’unités ou de thèmes), que chaque page de classe charge le registre avant son moteur et qu’aucune configuration en ligne ne revient.
- Rien ne change à l’écran.

## Ce que change M2

- Les données ne changent pas : les adaptateurs rangent les champs existants. `npm run validate` vérifie que les 1 017 ressources des cinq classes (et la version anglaise des activités de maternelle) remplissent les quatre étapes.
- Le choix « une étape à la fois » ou « Toute la leçon » est gardé dans le profil (`klassia_lesson_view_v1`). L’impression montre toujours toute la leçon.
- Les tests de contenu lisent la leçon entière (`tests/whole-lesson.cjs`) ; un test dédié suit le parcours par étapes.

Reste hors du registre : la liste des classes dans la sauvegarde (`shared/core.js`, champ `scope`, purement informatif).
