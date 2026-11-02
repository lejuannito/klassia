# Klassia — instructions pour les agents de développement

Ce fichier est la porte d’entrée des travaux assistés par IA. L’objectif est double : **préserver la cohérence de Klassia** et **réduire les lectures, modifications et itérations inutiles**.

## 1. Charger le minimum de contexte utile

Avant une tâche :

1. lire ce fichier ;
2. lire `docs/NEXT.md` pour connaître le lot actif ;
3. lire `docs/PROJECT_STATE.md` seulement si l’état fonctionnel du produit est nécessaire ;
4. consulter uniquement la section pertinente de `docs/ARCHITECTURE.md` ou d’un guide spécialisé ;
5. ne pas relire tout le dépôt ni toute la documentation sans nécessité explicite.

Les documents spécialisés (`AUDIO_FR_CE2.md`, `GS_BASSA.md`, `VALIDATION_PEDAGOGIQUE.md`, etc.) ne doivent être ouverts que lorsqu’ils concernent directement la tâche.

## 2. Principe de modification minimale

Pour chaque demande :

- identifier d’abord le comportement actuel et le plus petit ensemble de fichiers concernés ;
- préférer une correction locale compatible avec l’architecture existante ;
- ne pas refactoriser du code fonctionnel hors périmètre ;
- ne pas renommer d’identifiants de ressources sans migration explicite de progression ;
- ne pas ajouter de dépendance, de service externe, de serveur ou de mécanisme de compte sans demande explicite ;
- préserver le fonctionnement hors connexion et les données locales existantes ;
- ne jamais supprimer une fonctionnalité existante simplement pour contourner un bug.

Si une demande implique une refonte plus large que nécessaire, proposer d’abord le changement minimal et signaler séparément la refonte éventuelle.

## 3. Boucle de travail recommandée

Pour une nouvelle fonctionnalité ou un bug non trivial :

1. **Diagnostiquer brièvement** : fichiers concernés, cause ou mécanisme actuel, solution minimale, risques.
2. **Modifier seulement le périmètre validé**.
3. **Tester d’abord au niveau le plus ciblé**.
4. Élargir les tests uniquement si la modification touche un composant transversal ou si les tests ciblés passent.
5. Résumer en fin de tâche : fichiers modifiés, comportement obtenu, tests exécutés, point restant éventuel.

Ne pas produire de longue analyse lorsque la modification est mécanique et évidente.

## 4. Tests et commandes

Environnement : Node.js >= 22.

Commandes disponibles :

- `npm run validate` : validation structurelle ;
- `npm test` : tests Node ;
- `npm run catalog` : régénération de l’inventaire et des métriques ;
- `npm run build` : reconstruction du manifeste hors connexion après modification de fichiers servis ;
- `npm run test:browser` : parcours navigateur ;
- `npm run test:gs` : parcours Grande Section et Bassa ;
- `npm run test:speech` : comportement des voix FR/EN ;
- `npm run audit:content` : audit éditorial du contenu.

Après toute modification d’un fichier servi, exécuter `npm run build` avant de conclure afin de maintenir les empreintes du précache cohérentes.

## 5. Règles pédagogiques et éditoriales à préserver

- Klassia reste une **édition pilote accompagnée**, pas une édition scolaire certifiée.
- Les progressions francophone et anglophone sont distinctes lorsqu’elles le sont dans les référentiels.
- Pour les langues et cultures nationales, la première langue traitée est le **bassa**.
- Les variantes de traduction bassa proposées doivent rester acceptées comme réponses lorsque le sens demandé est couvert ; les arbitrages linguistiques restent des annotations, pas des pénalités automatiques.
- Ne pas attribuer fictivement une validation à un enseignant, linguiste ou organisme.
- Les rôles Enfant/Parent/Enseignant/Administration sont actuellement des vues locales, pas des comptes sécurisés.

## 6. Seuil d’escalade pour les tâches assistées par IA

Le protocole de coût recommandé est :

- tâche mécanique : modèle économique ;
- développement courant : **Sol 6.1 Medium** ;
- problème complexe : **Sol 6.1 High** ;
- après deux tentatives infructueuses, ou pour une décision d’architecture/sécurité : **Astra ou Opus en diagnostic ciblé** ;
- une fois le diagnostic obtenu : revenir à **Sol 6.1 Medium** pour l’implémentation et les itérations.

Un modèle haut de gamme doit d’abord diagnostiquer ; il ne doit pas être utilisé pour des renommages, du formatage, des corrections mécaniques ou des boucles d’essai ordinaires.

## 7. Quand mettre à jour la documentation de pilotage

- `docs/PROJECT_STATE.md` : seulement si l’état fonctionnel, les volumes ou les limites changent durablement ;
- `docs/DECISIONS.md` : seulement pour une décision structurante ou durable ;
- `docs/NEXT.md` : à la fin d’un lot ou lorsque les priorités changent.

Éviter d’y recopier les détails déjà présents ailleurs. Ces fichiers doivent rester courts pour servir de contexte rapide aux prochaines sessions.