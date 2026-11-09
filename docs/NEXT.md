# Klassia — prochain travail

_Mise à jour le 8 novembre 2026_

Ce fichier sert de **file d’attente courte** pour les prochaines sessions. Il ne remplace pas `docs/TRAJECTOIRE.md`.

## Lots techniques à essayer sur appareils réels

Les trois correctifs sont fusionnés. Les essais Android et iPhone se comparent dans le carnet par édition, adresse, mode d’ouverture et réseau. La lecture des prises bassa intégrées a son propre contrôle. [Guide du pilote](GUIDE_PILOTE.md#relevé-à-transmettre)

- Ouvrir une fiche A4 depuis l’icône et essayer l’impression ou l’export PDF. En cas de difficulté, essayer la même fiche dans Chrome ou Safari. [Impression](https://github.com/lejuannito/klassia/issues/35)
- Vérifier dans les cinq classes que le corrigé s’ouvre après une tentative, puis vérifier l’accès direct dans un espace adulte. [Corrigés](https://github.com/lejuannito/klassia/issues/36)
- Comparer les extraits fixes et les voix de l’appareil sur la tablette qui a posé problème, sur Android et sur iPhone. Relever la compréhension et les mots mal prononcés. [Voix FR/EN](https://github.com/lejuannito/klassia/issues/37) · [Carnet du pilote](GUIDE_PILOTE.md)

## Recherche et mises à jour hors connexion

La recherche des 844 ressources a été fusionnée le 4 novembre 2026. Le guide de vérification mobile figure dans [RECHERCHE.md](RECHERCHE.md).

Le lot du 6 novembre protège le cache installé lors d’un échec, indique le résultat de la vérification et demande de fermer les autres onglets Klassia avant le rechargement. Après fusion, vérifier sur téléphone le passage à la nouvelle édition, la reprise de la leçon et l’accès en mode avion. Pour ce premier passage depuis l’ancienne interface, fermer les autres onglets Klassia avant de cliquer sur « Recharger avec la nouvelle édition ».

Le correctif de navigation Cloudflare traite le `ERR_FAILED` reproduit dans Chromium après l’activation du service worker. L’affichage dans Chrome a été signalé comme rétabli. Le parcours complet depuis l’icône reste à relever sur les appareils du pilote. [Procédure de vérification](DEPLOIEMENT_CLOUDFLARE.md#rechargement-dans-chrome-après-installation) · [Ticket Chrome](https://github.com/lejuannito/klassia/issues/34)

## Lot éditorial / documentaire

### 1. Couverture des manuels et référentiels

Les listes de manuels scolaires fournies par le porteur de projet servent de **repères d’usage scolaire**, distincts des curricula officiels. Les photographies et la synthèse privée ne doivent pas être publiées dans le dépôt public.

Le premier rapprochement couvre les 62 leçons de sciences et de TIC du CE2. La matrice relie les leçons aux pages du curriculum MINEDUB et indique les supports à compléter. Les deux titres COSMOS sont attestés par les listes publiques. Leur comparaison chapitre par chapitre reste à vérifier à partir des sommaires ou extraits. [Matrice de couverture CE2](CE2_SCIENCES_TIC.md)

Objectifs :

- retrouver, lorsque cela est légalement et publiquement possible, sommaires, tables des matières, présentations éditeur ou extraits autorisés des ouvrages identifiés ;
- rapprocher les notions réellement vérifiables des contenus Klassia ;
- produire une matrice : couvert / partiellement couvert / absent / à vérifier ;
- compléter Klassia avec des contenus originaux lorsque des lacunes pertinentes sont confirmées ;
- ne jamais inventer le sommaire d’un manuel ni reproduire des passages protégés.

Cette recherche documentaire doit être menée séparément des tâches de codage. Codex ne doit pas supposer connaître le contenu d’un manuel à partir de son seul titre.

## Enrichissement CE2

### Sciences et TIC CE2 — lot réalisé

Les 29 leçons des unités 4 à 8 ont reçu des supports originaux et 58 exercices corrigés. Les bilans et les QCM essentiels de ces unités ont été repris avec les leçons. [Détail du lot et sources](CE2_SCIENCES_TIC.md#réécriture-intégrée)

### Sciences humaines et sociales CE2 — lot réalisé

Les 45 leçons des unités 4 à 8 ont été reprises avec 90 exercices corrigés, quatre figures, cinq bilans et 88 QCM. Les sources et les points d’arbitrage du curriculum sont documentés. [Détail du lot](CE2_SCIENCES_HUMAINES_SOCIALES.md)

### Développement personnel CE2 — lot réalisé

Les 16 leçons des unités 4 à 8 ont reçu des modèles à observer, des fiches de suivi, des mises en situation et 32 exercices ouverts corrigés. Les cinq bilans et les 60 QCM ont été alignés sur ces activités. [Détail du lot](CE2_DEVELOPPEMENT_PERSONNEL.md)

### Arts CE2 — lot réalisé

Les 15 leçons des unités 4 à 8 proposent des modèles visuels, des portées, des sketchs et des motifs à jouer. Les 30 exercices, cinq bilans et 60 QCM ont été alignés sur les supports. [Détail du lot](CE2_ARTS.md)

### EPS CE2 — lot réalisé

Les neuf leçons des unités 4 à 8 couvrent les sports collectifs et la communication en équipe. Elles proposent deux schémas, 18 exercices corrigés, cinq bilans et 60 QCM alignés. [Détail du lot](CE2_EPS.md)

### Bassa CE2 — lot réalisé

Les cinq leçons des unités 4 à 8 proposent des scènes, dix exercices ouverts et des bilans accompagnés. Le lexique documentaire, ses variantes acceptées et la suspension des QCM historiques sont conservés. [Détail du lot](CE2_BASSA.md)

L’audit ne relève plus de découverte générique dans le périmètre CE2 suivi.

## Consolidation

Le relevé examine 70 repères dans les cinq classes. Le lot arts et motricité enrichit dix ressources. Le carnet propose vingt séances et un contrôle du tracé sur téléphone. La navigation de classe est harmonisée. Le cahier de maternelle et les exercices ouverts du primaire permettent le tracé au doigt. [Matrice et bilan](COUVERTURE_PROGRESSION.md) · [Carnet du pilote](GUIDE_PILOTE.md)

1. Dans **Carnet du pilote › Prises bassa**, ouvrir l’atelier et choisir l’espace Enseignant. Enregistrer `BA002`, `BA004`, `BA005` et `BA006`, puis consigner l’avis du référent et l’accord éventuel pour l’écoute locale par l’élève. Le sélecteur de l’atelier couvre toutes les entrées du lexique. Après l’accord de diffusion, télécharger le dossier privé et préparer le MP3. L’intégrer après réécoute et contrôle de l’empreinte. [Enregistrement dans Klassia](SUPPORTS_SONORES.md#enregistrer-au-micro-dans-klassia)
2. Remplir le relevé du carnet sur Android et iPhone. Vérifier l’écran Bassa, le micro, l’écoute en mode avion, le tracé tactile et la reprise de la progression. Refaire l’écoute Bassa après intégration des prises. [Guide pilote](GUIDE_PILOTE.md#essai-sur-android-et-iphone)
3. Importer les relevés des familles et des enseignants, traiter les exercices signalés et faire un nouvel essai. Utiliser les variantes proposées pour le prochain lot des cinq classes. [Grille de retours](GUIDE_PILOTE.md#retours-des-familles-et-enseignants)

Les listes de thèmes, unités et matières partagent désormais les mêmes cartes. L’accueil Enfant du CE2 s’ouvre sur les unités. Le menu Outils donne accès hors connexion à l’alphabet, aux tables de 1 à 10, aux nombres jusqu’à 99 999 et aux montants en francs CFA jusqu’à 10 000. Les leçons de numération U2 et de monnaie U8 explicitent l’écriture des milliers et la vérifient dans un exercice. [Outils de référence](https://lejuannito.github.io/klassia/outils.html)

Essayer les cinq séances d’arts et de motricité. Pour chaque classe, relever séparément l’aide nécessaire pour l’expression artistique et le déplacement ou la coopération. Préparer l’intégration progressive du CP après l’exploitation des retours, puis celle des autres classes selon la feuille de route.

## Lot audio partagé et lecture étendue — PR à fusionner

- Lecture des cours élargie aux objectifs, exemples guidés, synthèses et activités, en respectant les langues des parcours. Il s'agit encore de synthèse vocale dépendante de l'appareil ; **aucun nouveau MP3 long n'est livré dans ce lot**.
- Publication directe de prises bassa approuvées par un référent, avec avis favorable et accord de diffusion, au moyen d'une API Cloudflare Pages + D1 + R2 privé + authentification Cloudflare Access ; liste des prises et retrait depuis l'atelier. L'écoute locale et l'exportation manuelle sont conservées en secours.
- Catalogue public consultable depuis `klassia.app` et `lejuannito.github.io/klassia` lorsque le service partagé est opérationnel. Le service n'est **pas actif** avant la configuration D1/R2/Access et l'application de la migration.
- Mise en service et protocole de vérification : [Audio partagé](AUDIO_PARTAGE.md). Avant de déclarer le lot disponible, vérifier les connexions, la publication, l'écoute entre deux appareils, le retrait, le micro sur Android et iPhone et le comportement sans réseau.
- Lots suivants : (1) enregistrements MP3 longs et stables, avec navigation par séquences et commandes pause/reprise/vitesse ; (2) cache optionnel hors connexion des prises distantes approuvées ; (3) référentiels/consentements et délégation par classe/langue, revue à deux niveaux ; (4) enrichissements des cinq classes à partir des retours terrain et intégration du CP, puis des classes restantes.

## Règle pour chaque nouvelle session

Ne prendre **qu’un lot ou sous-lot clairement borné**. Éviter les demandes du type « améliorer tout Klassia ».

Format recommandé :

- OBJECTIF
- ÉTAT ACTUEL
- ATTENDU
- CONTRAINTES

Si une tâche locale révèle un problème architectural transversal, suspendre l’élargissement du périmètre et consigner d’abord le diagnostic.
