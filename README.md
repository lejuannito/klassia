# Klassia v15 — consolidation du pilote CE2 et MS

Manuel interactif camerounais pour un usage **accompagné**. Cette branche consolide la v14 ; elle ne constitue pas une édition scolaire validée.

## Utiliser

Ouvrir la racine du site pour le CE2, ou `ms/` pour la moyenne section. Le bouton portant le prénom permet de créer un profil par enfant, de choisir l’affichage adulte et d’exporter/restaurer ses progrès. Aucun téléphone ni mot de passe n’est demandé ; il ne s’agit pas de comptes sécurisés.

Attendre le message **« CE2 et MS disponibles hors connexion »** avant de couper la connexion. Une mise à jour incomplète n’active pas une édition partielle. Une nouvelle édition vérifiée propose un rechargement explicite. L’export manuel reste nécessaire avant de changer d’appareil ou de vider les données du navigateur.

## Ce qui change

- Rendus explicites : suppression des boucles `MutationObserver` des écrans CE2/MS.
- Exercice FR-U1-L1 corrigé ; choix QCM mélangés sans perdre l’identité de la bonne réponse.
- Profils locaux séparés, migration conservant les anciennes clés, sauvegarde version 2, import validé, fusion des seules rubriques présentes et annulation de restauration.
- Mise en cache atomique avec SHA-256 ; accès direct MS et contenus CE2/MS testés hors connexion.
- Contenus du manuel en JSON lisible, sans découpage gzip/base64 ni dépendance à `DecompressionStream`.
- Une activité MS à la fois, observations datées et imprimables bilingues enrichis.
- 27 leçons de mathématiques et 20 d’anglais U4–U8 réécrites avec des situations spécifiques, toujours en attente de relecture.
- Guide adulte pour l’unité CE2 U1 et le thème MS T1 ; deux supports visuels et exercices numériques démontrant le moteur d’interaction.
- Lecture optionnelle FR/EN par la voix de l’appareil. Ce n’est pas un pack audio validé ; disponibilité et fonctionnement hors ligne dépendent de l’appareil. Aucun audio Bassa synthétique n’est proposé.
- Inventaire de 507 ressources et correspondances proposées ; consultation via l’affichage « Revue éditoriale » puis « Couverture ».

## Volumes et limites

347 leçons CE2, 160 activités MS, 80 évaluations CE2. La banque contient 1 323 questions après remplacement de 225 questions essentielles génériques par des questions concrètes déjà présentes dans les compléments, dont les copies ont été retirées. **1 187 questions sont accessibles ; 136 QCM Bassa sont suspendus** jusqu’à validation linguistique. Les anciens contenus restent dans l’historique Git.

Il reste **158 découvertes génériques** à reprendre. Aucune ressource n’est déclarée validée par un enseignant ou un linguiste. La correspondance exhaustive avec les programmes reste à compléter, notamment en maternelle. Les GS, SIL et CE1 ne sont pas annoncées comme disponibles.

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
