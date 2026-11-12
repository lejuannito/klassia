# Moteur unique — plan et avancement

_Décision du porteur de projet, 12 novembre 2026 (ADR-014)_

## Pourquoi

Klassia a trois moteurs de rendu, nés à des moments différents :

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
| **M3. CE2 sur le moteur commun** | Les pages unité, matière, domaine, leçon, semaine et révision du CE2 sont rendues par le moteur commun. Évaluation, projet, espace enseignant, revue éditoriale et atelier Bassa deviennent des modules de page. `app.js` se réduit à ces modules. | à faire |
| **M4. Maternelle sur le moteur commun** | Thèmes et activités rendus par le moteur commun ; fiche parent, mode enfant et observation deviennent un module. | à faire |
| **M5. Nettoyage** | Suppression de `app.js`, `v9.js`, `v14.js`, `ms/app-*-v13.js` ; une seule feuille de style de classe ; tests navigateur réécrits sur les sélecteurs communs. | à faire |

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
