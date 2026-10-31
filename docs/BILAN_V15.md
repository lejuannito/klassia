# Bilan de consolidation — 31 octobre 2026

Base : commit `61a343f1d27a67c5c7d72173cb2f946411da2b95`.

| Constat de la revue | Traitement v15 | Reste à faire |
|---|---|---|
| K01 Rendus continus | Observateurs supprimés des parcours ; tests DOM au repos | Essais sur téléphones physiques |
| K02 Exercice impossible | Événement et identité de réponse corrigés | Relecture générale des autres corrigés |
| K03 Position QCM prévisible | Mélange à chaque ouverture, identifiants stables pendant la tentative | Revue des distracteurs et distribution des difficultés |
| K04 Trames génériques | 47 leçons MA/EN réécrites ; inventaire des 158 restantes | Réécriture par discipline et relecture enseignante |
| K05 QCM sur titres | 225 questions génériques remplacées par des situations concrètes, copies retirées des compléments | Validation cognitive et rattachement précis aux compétences |
| K06 Hors connexion | Installation complète avec empreintes, refus des packs incohérents, accès direct MS | Essais Android/iOS, téléchargements sélectifs avec futurs médias |
| K07 Restauration | Schéma 2, prévalidation, fusion des rubriques, écriture atomique, annulation | Essais de migration avec sauvegardes réelles supplémentaires |
| K08 Plusieurs enfants | Profils locaux indépendants, affichages libres explicités | Synchronisation distante seulement si demandée |
| K09 Impression MS | Champs anglais, matériel, questions, références Bassa, diagrammes et guide repris | Contrôle exhaustif de pagination et polices sur toutes les fiches |
| K10 Traçabilité | Matrice des 507 ressources, sources conservées, statuts explicites | Identifiants des attendus officiels et validation complète du référentiel |
| K11 Bassa | 136 QCM suspendus ; MS en documentation adulte non validée | Locuteurs/relecteurs, graphies, contexte et audios validés |
| K12 Supports | Deux SVG pédagogiques, exercices numériques, voix appareil FR/EN optionnelle | Banque d’illustrations et d’audios enregistrés/validés |
| K13 Ergonomie | Une activité MS par écran ; suivi CE2 sans débordement testé à 390 px | Accessibilité exhaustive et observation d’enfants en situation |
| K14 Architecture | Sources JSON lisibles, services communs, événements de rendu explicites, tests/CI | Achever la séparation des moteurs d’affichage et ajouter des types plus stricts |
| K15 Publication | Statuts par ressource, inventaire consultable, construction publique bloquée sans validation | Véritable comité de validation et circuit de signature |

## Contrôles exécutés

- 10 tests unitaires : migration et séparation des profils, import sélectif, refus de données invalides, quota, aller-retour schéma 2, mélange des choix, instances concurrentes, interruption réseau et intégrité des caches.
- Validation de structure des 347 leçons, 160 activités, questions et barèmes ; contrôle syntaxique des scripts.
- Tests navigateur : réponse FR-U1-L1, exercices numériques CE2/MS, recherche dans l’inventaire, résultats QCM sur les huit unités, absence de mutations continues, absence de débordement sur les vues ciblées, score vide refusé, profils, observation MS et présence des étapes anglaises à l’impression.
- Installation via MS puis réouverture hors connexion de MS T8 et CE2 U8.

Ces tests ne constituent ni une validation pédagogique ni une certification de compatibilité universelle. Les tests d’interface sont exécutés sous Chromium avec un viewport mobile ; ils ne remplacent pas des essais sur appareils physiques. Le test d’impression vérifie les contenus HTML de la fenêtre imprimable, pas toute la pagination PDF.

## Décision proposée pour la suite

La branche est destinée à une revue et à un pilote accompagné. Le site existant n’est pas remplacé automatiquement par la création de cette branche. La consolidation technique permet d’engager une réécriture ciblée ; elle ne permet pas de déclarer l’année CE2 et la maternelle achevées.
