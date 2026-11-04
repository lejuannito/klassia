# Rechercher une notion

Le lien **Rechercher**, dans la navigation commune des cinq classes, ouvre une page partagée. Saisir par exemple « les états de l’eau », puis valider. Les filtres Classe et Matière ou domaine réduisent les résultats. Chaque résultat affiche sa classe, sa matière, son titre et un extrait. **Retour aux résultats** dans la leçon ou le retour du navigateur retrouve la requête et ses filtres.

## Fonctionnement et limites

Le script `shared/search.js` charge à la demande les JSON publics existants, avec quatre lectures simultanées au maximum. Il construit en mémoire un index des 844 leçons et activités ; aucun index volumineux supplémentaire n’est publié. Les profils, progrès et annotations locales ne sont jamais consultés par le moteur.

Les titres et objectifs pèsent davantage que les cours, supports, explications et exercices. Tous les mots significatifs doivent correspondre. La casse, les accents et les apostrophes sont normalisés ; les mots grammaticaux courants sont ignorés, certains pluriels sont ramenés au singulier et les préfixes d’au moins quatre caractères sont acceptés. Il n’y a ni recherche sémantique, ni traduction, ni correction générale des fautes. Les matières conservent les appellations de leurs classes ; les domaines MS/GS figurent donc aussi dans le filtre.

Les résultats portent sur les leçons et activités, pas sur les séries d’évaluation séparées ni sur les documents éditoriaux. Trente résultats sont affichés à la fois, avec un bouton pour en afficher davantage. La recherche doit pouvoir lire tout le pack : si un fichier manque, un message demande de réessayer plutôt que d’afficher silencieusement un ensemble incomplet.

La page, le moteur et son style appartiennent au précache avec les contenus. L’installation complète ou la mise à jour de l’édition est nécessaire avant le premier usage hors connexion.

## Vérifier sur smartphone

1. Ouvrir Klassia, accepter le rechargement de la nouvelle édition et attendre « CE2, MS, GS, SIL et CE1 disponibles hors connexion ».
2. Depuis une classe, toucher **Rechercher**, puis saisir « les états de l’eau ». Vérifier le titre et l’extrait du premier résultat.
3. Ouvrir la leçon, puis toucher **Retour aux résultats**. Essayer aussi le retour du navigateur.
4. Saisir « ecole » sans accent, puis filtrer successivement MS, GS, SIL, CE1 et CE2 et ouvrir une ressource.
5. Essayer un terme absent, puis retirer les filtres.
6. Passer en mode avion et refaire une recherche, ouvrir un résultat et revenir aux résultats. Vérifier que la page tient sur l’écran sans défilement horizontal.

## Vérifications automatisées

- `node --test tests/search.test.cjs` : couverture des 844 ressources, routes, classement, normalisation, extraits, filtres et erreur de chargement.
- `npm run test:search` : parcours à 320 px, cinq classes, rôle Parent, retour/historique, pagination, données privées exclues et navigation hors connexion sous `/klassia/`.
- `npm test`, `npm run validate`, `npm run build` : suite Node, structure et précache.
- `npm run test:browser` : non-régression des parcours existants et de la PWA.

Les parcours navigateur acceptent `KLASSIA_CHROMIUM` pour utiliser un navigateur déjà installé.
