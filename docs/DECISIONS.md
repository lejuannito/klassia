# Klassia — décisions durables

Ce fichier conserve uniquement les décisions structurantes utiles aux prochaines sessions. Les détails d’implémentation restent dans les documents spécialisés.

## ADR-001 — Application pilote web statique

**Décision :** conserver à ce stade une application web statique installable et utilisable hors connexion.

**Conséquence :** ne pas introduire de backend, de compte centralisé, de paiement ou de télémétrie sans décision explicite de changement de cible.

## ADR-002 — Données d’apprentissage locales

**Décision :** les profils, progrès, observations et décisions de revue restent stockés localement dans le navigateur, avec export/import.

**Conséquence :** les rôles Enfant, Parent, Enseignant et Administration ne doivent pas être présentés comme une authentification sécurisée.

## ADR-003 — Préservation des identifiants pédagogiques

**Décision :** les identifiants de ressources pédagogiques sont stables.

**Conséquence :** tout renommage nécessitant une rupture d’identifiant doit inclure une stratégie de migration des progressions.

## ADR-004 — Progressions linguistiques distinctes

**Décision :** conserver séparément les progressions francophone et anglophone lorsqu’elles proviennent de référentiels distincts.

**Conséquence :** ne pas fusionner artificiellement les objectifs ou niveaux FR/EN pour simplifier le modèle de données.

## ADR-005 — Langues et cultures nationales : priorité au bassa

**Décision :** le bassa est la première langue nationale traitée transversalement dans Klassia.

**Conséquence :** les nouvelles fonctions de langue nationale doivent d’abord rester compatibles avec les contenus et variantes bassa existants avant généralisation à d’autres langues.

## ADR-006 — Variantes de traduction bassa

**Décision :** les variantes proposées pour un même sens doivent rester acceptées comme réponses lorsque le contenu les reconnaît comme formes valides ou à arbitrer.

**Conséquence :** une préférence éditoriale ou linguistique ne doit pas transformer automatiquement les autres variantes en réponses fausses.

## ADR-007 — Audio FR/EN dépendant de l’appareil

**Décision :** la lecture actuelle repose sur les voix disponibles sur l’appareil ; aucun pack audio validé n’est encore embarqué.

**Conséquence :** ne pas simuler une voix bassa avec une voix française ou anglaise. Les futurs médias enregistrés constituent un lot distinct.

## ADR-008 — Intégrité du hors-ligne

**Décision :** une édition hors connexion n’est activée qu’après téléchargement complet et vérification des empreintes.

**Conséquence :** après modification de fichiers servis, reconstruire le manifeste avec `npm run build` et ne pas publier un ensemble partiel incohérent.

## ADR-009 — Validation pédagogique explicite

**Décision :** aucun contenu ne doit être présenté comme validé par un enseignant, linguiste ou organisme sans validation réelle et traçable.

**Conséquence :** conserver les mentions de pilote et les statuts de revue tant que la validation nominative n’est pas acquise.

## ADR-010 — Développement assisté par IA à contexte minimal

**Décision :** les agents doivent charger le minimum de contexte utile et privilégier les modifications locales.

**Conséquence :** `AGENTS.md`, `docs/NEXT.md` et, si nécessaire, `docs/PROJECT_STATE.md` servent de contexte de reprise ; la lecture exhaustive du dépôt ou de longs historiques de conversation n’est pas la méthode par défaut.

## ADR-011 — Escalade des modèles selon la difficulté

**Décision :** utiliser un modèle courant pour l’implémentation et réserver les modèles les plus coûteux aux diagnostics, décisions architecturales, sécurité et blocages persistants.

**Conséquence :** après diagnostic par un modèle haut de gamme, revenir à un modèle courant pour appliquer et itérer sur la correction.