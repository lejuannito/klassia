# Klassia — manuel interactif CE2, MS, SIL et CE1

Manuel interactif camerounais pour un usage **accompagné**. Cette branche consolide la v14 ; elle ne constitue pas une édition scolaire validée.

## Utiliser

Ouvrir la racine du site pour le CE2, `ms/` pour la moyenne section, `gs/` pour la grande section bilingue, `sil/` pour la SIL ou `ce1/` pour le CE1. Le bouton « Changer d’espace » permet de passer aux vues enfant, parent, enseignant ou administration locale. Le lien « Validation pédagogique » reste visible dans toutes les classes. Ces espaces sont des vues locales sans compte sécurisé; les décisions de revue restent sur l’appareil et sont exportables. Aucun téléphone ni mot de passe n’est demandé ; il ne s’agit pas de comptes sécurisés.

Attendre le message **« CE2, MS, GS, SIL et CE1 disponibles hors connexion »** avant de couper la connexion. Une mise à jour incomplète n’active pas une édition partielle. Une nouvelle édition vérifiée propose un rechargement explicite. L’export manuel reste nécessaire avant de changer d’appareil ou de vider les données du navigateur.

## Ce qui change

- Rendus explicites : suppression des boucles `MutationObserver` des écrans CE2/MS.
- Exercice FR-U1-L1 corrigé ; choix QCM mélangés sans perdre l’identité de la bonne réponse.
- Profils locaux séparés, migration conservant les anciennes clés, sauvegarde version 2, import validé, fusion des seules rubriques présentes et annulation de restauration.
- Mise en cache atomique avec SHA-256 ; accès direct aux classes et contenus disponibles vérifiés hors connexion.
- Contenus du manuel en JSON lisible, sans découpage gzip/base64 ni dépendance à `DecompressionStream`.
- Une activité MS à la fois, observations datées et imprimables bilingues enrichis.
- 27 leçons de mathématiques et 20 d’anglais U4–U8 réécrites avec des situations spécifiques, toujours en attente de relecture.
- Guide adulte pour l’unité CE2 U1 et le thème MS T1 ; deux supports visuels et exercices numériques démontrant le moteur d’interaction.
- Lecture optionnelle FR/EN par la voix de l’appareil. Ce n’est pas un pack audio validé ; disponibilité et fonctionnement hors ligne dépendent de l’appareil. Aucun audio Bassa synthétique n’est proposé.
- Inventaire de 605 ressources et correspondances proposées ; consultation via l’affichage « Revue éditoriale » puis « Couverture ».

## Volumes et limites

347 leçons CE2, 160 activités MS, 80 évaluations CE2. La banque contient 1 323 questions après remplacement de 225 questions essentielles génériques par des questions concrètes déjà présentes dans les compléments, dont les copies ont été retirées. **1 187 questions sont accessibles ; 136 QCM Bassa sont suspendus** jusqu’à validation linguistique. Les anciens contenus restent dans l’historique Git.

Les contenus SIL (8 centres d’intérêt) et CE1 (8 unités) sont des propositions éditoriales en attente de revue; ils ne sont pas déclarés validés par un enseignant ou un linguiste. Le CE1 suit les objectifs CE1 de Niveau 2 en français et la colonne Class 3 en anglais. Le CP reste une étape entre la SIL et le CE1. Les propositions de langues nationales restent visibles et provisoires jusqu’à arbitrage linguistique.

## Développer et vérifier

Node.js 22 ou ultérieur. Pas de compilation requise pour consulter le site ; servir les fichiers en HTTP local (par exemple `python -m http.server 8000`).

```sh
npm install --ignore-scripts
npm run catalog
npm run validate
npm test
npm run build
npx playwright install chromium
npm run test:browser
```

`catalog` régénère les compteurs, la matrice et les métriques. `build` doit être exécuté après chaque modification des fichiers servis : les empreintes de `precache-manifest.js` doivent correspondre exactement aux fichiers publiés. Copier une partie d’une nouvelle édition rend volontairement son installation hors ligne invalide.

`npm run build:public` échoue tant que les ressources ne possèdent pas de validation nominative et de statut publié. Cette barrière de construction n’empêche pas quelqu’un de publier manuellement un pilote : les mentions de pilote doivent donc rester visibles et une diffusion grand public ne doit pas être présentée comme certifiée.

La CI vérifie structure, stockage, service worker, navigation mobile, impression bilingue et accès hors connexion. Les fichiers `tests/browser.cjs` peuvent utiliser `KLASSIA_CHROMIUM=/chemin/vers/chromium` pour un navigateur déjà installé.

## Documentation

- [Bilan par constat d’audit](docs/BILAN_V15.md)
- [Architecture et contrats](docs/ARCHITECTURE.md)
- [Guide parents et enseignants](docs/GUIDE_PILOTE.md)
- [Processus de relecture et publication](docs/VALIDATION_PEDAGOGIQUE.md)
- [Feuille de route GS, SIL, CE1](docs/TRAJECTOIRE.md)
- [Matrice de travail CSV](docs/couverture.csv)
- [Métriques calculées](docs/metrics.json)

Le dépôt ne comporte aucun serveur de comptes, paiement, synchronisation ou télémétrie. Les données d’apprentissage restent sur l’appareil ; les sauvegardes téléchargées contiennent les observations saisies par l’adulte et doivent être conservées avec soin.

### SIL bilingue

Huit centres d’intérêt sont accessibles à `/sil/` : maison, village/ville, école, métiers, voyages, santé, jeux et communications. Chaque centre propose dix séquences principales couvrant les matières et une tâche de réinvestissement ; les huit séquences pilotes précédentes restent consultables comme compléments. La progression française SIL suit sa colonne propre (alphabet, sons, syllabes, phrases, texte). L’anglais suit séparément les attendus Class 1 de lecture débutante, copie de noms/phrases et numéraux 0–50, en plus de l’oral; la progression Class 2 est exclue. Les séquences contiennent exemples, activités guidées, exercices, corrections, remédiations et prolongements. La navigation propose **Par unité**, **Par matière** et **Par domaine**.

Les propositions de mots bassa proviennent du lexique documentaire du dépôt. Les variantes et notes restent consultables et explicitement non validées ; aucun score officiel de langue n’est attribué.

### CE1 bilingue

Le CE1 est amorcé à `/ce1/` par l’unité 1 « La maison / The home », avec dix séquences et les mêmes choix de navigation. Le français s’appuie uniquement sur les objectifs CE1 du curriculum Niveau 2 ; l’anglais demeure une branche distincte limitée aux attendus Class 3. Cette unité ne représente pas l’année CE1 complète.

### Navigation des profils et des classes

Le bouton **Profil : …** ouvre le choix de l’enfant et de l’espace affiché (Enfant, Parent, Enseignant ou Administration). Le menu **Classe : …**, présent dans les espaces CE2, MS, SIL et CE1, permet de passer d’un parcours à l’autre. Depuis un affichage Enseignant/Administration, il propose aussi les accès à la revue éditoriale et à l’atelier Bassa. Klassia ne possède pas de connexion à un compte ni de déconnexion serveur : les profils et rôles sont locaux à l’appareil.

Dans l’espace Enseignant, la page Revue éditoriale permet désormais de consigner les décisions directement depuis l’interface, puis d’exporter un relevé JSON. Les décisions restent enregistrées dans le navigateur utilisé et doivent être reprises par l’équipe éditoriale pour rejoindre les sources du dépôt.

## Revue d’ensemble et grande section

Voir le [bilan de revue](docs/REVUE_ENSEMBLE.md), les [curricula retrouvés pour la grande section](docs/GRANDE_SECTION_CURRICULUM.md) et l’[audit reproductible](docs/content-audit.json). Exécuter `npm run audit:content` après `npm run catalog`. Huit unités structurées ne prouvent pas une couverture annuelle exhaustive.

## Grande section bilingue et bassa

La grande section propose désormais 162 activités originales dans huit thèmes et cinq domaines : `gs/`. Le même moteur maternel sert MS et GS, avec des progrès distincts. Les correspondances de curriculum sont fournies par activité. Voir [le guide GS et Bassa](docs/GS_BASSA.md).

Les 45 leçons de langues nationales des cinq classes ouvrent un panneau **Bassa · traductions et entraînement**, avec propositions sourcées et caractères sélectionnables. Toutes les formes affichées pour le sens demandé sont acceptées, même signalées à revoir. L’arbitrage reste une annotation, sans pénalité automatique. `npm run test:gs` vérifie les parcours GS et les panneaux Bassa.
