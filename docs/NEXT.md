# Klassia — prochain travail

_Mise à jour : 2 novembre 2026_

Ce fichier sert de **file d’attente courte** pour les prochaines sessions. Il ne remplace pas `docs/TRAJECTOIRE.md`.

## Lot prioritaire

### 1. Enrichissement Sciences et TIC CE2

Objectif : remplacer les contenus encore trop génériques par des séquences exploitables et adaptées au niveau CE2.

Périmètre actuel :

- Sciences : 17 leçons génériques repérées ;
- TIC : 12 leçons génériques repérées ;
- total du lot : 29 leçons.

Attendus :

- observations ou expériences simples lorsque pertinent ;
- supports intégrés ;
- exercices progressifs ;
- corrections explicites ;
- cohérence avec les principes de `docs/ENRICHISSEMENT.md` ;
- ne pas modifier les autres matières sans nécessité.

Validation minimale du lot :

- contenus non génériques pour les 29 leçons ciblées ;
- structure JSON valide ;
- `npm run validate` ;
- tests concernés ;
- `npm run catalog` si l’inventaire ou les métriques changent ;
- `npm run build` après modification des fichiers servis.

## Lot suivant

### 2. Autres leçons génériques CE2

Périmètre repéré : 90 leçons :

- Sciences humaines / sociales : 45 ;
- Développement personnel : 16 ;
- Arts : 15 ;
- EPS : 9 ;
- Bassa : 5.

Pour les cinq leçons bassa, **conserver les propositions lexicales centrales déjà présentes** et enrichir autour d’elles.

## Après enrichissement CE2

### 3. Couverture et progression des cinq classes

- rapprocher systématiquement objectifs, contenus et évaluations des référentiels réellement disponibles ;
- identifier les lacunes ;
- vérifier prérequis et progression de difficulté ;
- ne pas présenter une correspondance proposée comme validation officielle.

### 4. Supports sonores et visuels

- préparer des médias FR/EN maîtrisés ;
- préparer des enregistrements bassa avec prononciation vérifiée ;
- documenter sources, droits et variantes ;
- conserver en attendant le bassa écrit et les variantes acceptées.

### 5. Pilote réel

Tester sur téléphones Android/iOS avec parents, enfants et enseignants :

- navigation ;
- lisibilité ;
- écoute effective ;
- disponibilité des voix hors connexion ;
- compréhension des consignes ;
- charge de travail ;
- pertinence pédagogique.

## Règle pour chaque nouvelle session

Ne prendre **qu’un lot ou sous-lot clairement borné**. Éviter les demandes du type « améliorer tout Klassia ».

Format recommandé :

- OBJECTIF
- ÉTAT ACTUEL
- ATTENDU
- CONTRAINTES

Si une tâche locale révèle un problème architectural transversal, suspendre l’élargissement du périmètre et consigner d’abord le diagnostic.