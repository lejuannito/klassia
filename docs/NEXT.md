# Klassia — prochain travail

_Mise à jour : 4 novembre 2026_

Ce fichier sert de **file d’attente courte** pour les prochaines sessions. Il ne remplace pas `docs/TRAJECTOIRE.md`.

## Correctif audio — intégré, validation terrain à effectuer

Le correctif du moteur de lecture française est **présent sur `main`** (commit `9aee6d0`). Une voix française explicite reste prioritaire ; si `getVoices()` est vide ou incomplet, une tentative de synthèse avec `lang="fr-FR"` est autorisée sans affecter de voix anglaise. Tests automatisés annoncés comme réussis.

**Reste à vérifier sur smartphone réel** : prononciation effectivement française, démarrage, arrêt, changement de page et disponibilité hors connexion. Si échec, noter navigateur/appareil/message affiché et ouvrir une tâche de diagnostic ciblée plutôt que reprendre toute l'architecture.

## Lot prioritaire

### 1. Recherche rapide dans Klassia

Premier lot livré le 4 novembre 2026 : recherche locale des 844 ressources des cinq classes, filtres, extraits, liens directs et retour aux résultats, avec précache PWA. Voir `docs/RECHERCHE.md` pour les limites et la vérification sur smartphone. Les attendus ci-dessous définissent le périmètre de ce lot.

Besoin : permettre à un parent, élève ou enseignant de saisir une notion vue dans un cahier (mot ou petite expression) et de retrouver rapidement **ce que Klassia contient sur cette notion**.

Cible minimale :

- recherche plein texte locale, sans serveur et compatible hors connexion ;
- couvrir au minimum titres, objectifs, cours/supports et principaux mots-clés des ressources ;
- résultats groupés par classe, matière/domaine et leçon/activité ;
- extrait court montrant pourquoi le résultat correspond ;
- clic vers la ressource concernée ;
- tolérance raisonnable aux accents, casse et formes simples ;
- ne pas introduire de moteur externe ni de dépendance lourde sans nécessité.

Commencer par un diagnostic de l’architecture et proposer la solution minimale avant implémentation.

## Lot éditorial / documentaire

### 2. Couverture des manuels et référentiels

Les listes de manuels scolaires fournies par le porteur de projet servent de **repères d’usage scolaire**, distincts des curricula officiels. Les photographies et la synthèse privée ne doivent pas être publiées dans le dépôt public.

Objectifs :

- retrouver, lorsque cela est légalement et publiquement possible, sommaires, tables des matières, présentations éditeur ou extraits autorisés des ouvrages identifiés ;
- rapprocher les notions réellement vérifiables des contenus Klassia ;
- produire une matrice : couvert / partiellement couvert / absent / à vérifier ;
- compléter Klassia avec des contenus originaux lorsque des lacunes pertinentes sont confirmées ;
- ne jamais inventer le sommaire d’un manuel ni reproduire des passages protégés.

Cette recherche documentaire doit être menée séparément des tâches de codage. Codex ne doit pas supposer connaître le contenu d’un manuel à partir de son seul titre.

## Enrichissement CE2

### 3. Sciences et TIC CE2

Périmètre repéré :

- Sciences : 17 leçons génériques ;
- TIC : 12 leçons génériques ;
- total : 29 leçons.

Attendus : observations ou expériences simples lorsque pertinent, supports intégrés, exercices progressifs, corrections explicites et cohérence avec `docs/ENRICHISSEMENT.md`.

### 4. Autres leçons génériques CE2

Périmètre repéré : 90 leçons :

- Sciences humaines / sociales : 45 ;
- Développement personnel : 16 ;
- Arts : 15 ;
- EPS : 9 ;
- Bassa : 5.

Pour les cinq leçons bassa, conserver les propositions lexicales centrales déjà présentes et enrichir autour d’elles.

## Consolidation ultérieure

- couverture et progression des cinq classes ;
- supports sonores/visuels maîtrisés, dont enregistrements bassa à prononciation vérifiée ;
- pilote réel Android/iOS avec parents, enfants et enseignants.

## Règle pour chaque nouvelle session

Ne prendre **qu’un lot ou sous-lot clairement borné**. Éviter les demandes du type « améliorer tout Klassia ».

Format recommandé :

- OBJECTIF
- ÉTAT ACTUEL
- ATTENDU
- CONTRAINTES

Si une tâche locale révèle un problème architectural transversal, suspendre l’élargissement du périmètre et consigner d’abord le diagnostic.