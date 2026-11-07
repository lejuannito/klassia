# Klassia — prochain travail

_Mise à jour le 7 novembre 2026_

Ce fichier sert de **file d’attente courte** pour les prochaines sessions. Il ne remplace pas `docs/TRAJECTOIRE.md`.

## Correctif audio — intégré, validation terrain à effectuer

Le correctif du moteur de lecture française est **présent sur `main`** (commit `9aee6d0`). Une voix française explicite reste prioritaire ; si `getVoices()` est vide ou incomplet, une tentative de synthèse avec `lang="fr-FR"` est autorisée sans affecter de voix anglaise. Tests automatisés annoncés comme réussis.

**Reste à vérifier sur smartphone réel** : prononciation effectivement française, démarrage, arrêt, changement de page et disponibilité hors connexion. Si échec, noter navigateur/appareil/message affiché et ouvrir une tâche de diagnostic ciblée plutôt que reprendre toute l'architecture.

## Recherche et mises à jour hors connexion

La recherche des 844 ressources a été fusionnée le 4 novembre 2026. Le guide de vérification mobile figure dans [RECHERCHE.md](RECHERCHE.md).

Le lot du 6 novembre protège le cache installé lors d’un échec, indique le résultat de la vérification et demande de fermer les autres onglets Klassia avant le rechargement. Après fusion, vérifier sur téléphone le passage à la nouvelle édition, la reprise de la leçon et l’accès en mode avion. Pour ce premier passage depuis l’ancienne interface, fermer les autres onglets Klassia avant de cliquer sur « Recharger avec la nouvelle édition ».

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

Le relevé examine 45 repères dans les cinq classes. Chacun dispose d’un support, d’une tâche et d’un critère de réussite, y compris la manipulation souris et clavier en CE1. Deux leçons de quadrillage rejoignent l’inventaire. Six extraits FR/EN se lisent hors connexion. Sur mobile, les commandes de la page matière CE2 passent sous le titre, dont celle du Bassa. [Matrice et bilan](COUVERTURE_PROGRESSION.md) · [Supports sonores](SUPPORTS_SONORES.md)

1. Vérifier le lot complet sur Android et iPhone, avec les six extraits, l’écran LCN Bassa et la reprise hors connexion. L’hypothèse de pilotes concluants a permis de poursuivre jusqu’à cette vérification finale. [Guide pilote](GUIDE_PILOTE.md)
2. Réaliser les premières prises bassa avec le référent, vérifier les tons et la forme prononcée, puis intégrer les enregistrements autorisés. [Préparation des prises](SUPPORTS_SONORES.md#préparer-les-prises-bassa)
3. Traiter les retours de terrain et compléter la relecture des exercices et des repères avant d’étendre le périmètre. [Trajectoire](TRAJECTOIRE.md)

## Règle pour chaque nouvelle session

Ne prendre **qu’un lot ou sous-lot clairement borné**. Éviter les demandes du type « améliorer tout Klassia ».

Format recommandé :

- OBJECTIF
- ÉTAT ACTUEL
- ATTENDU
- CONTRAINTES

Si une tâche locale révèle un problème architectural transversal, suspendre l’élargissement du périmètre et consigner d’abord le diagnostic.
