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
## ADR-012 — La langue nationale est celle de la famille

**Décision (porteur de projet, 11 novembre 2026) :** la langue et culture nationale travaillée est celle que parlent les parents ; le bassa reste la première langue documentée dans Klassia. La page « Langue de la maison » (lot 8a) permet à un adulte d’enregistrer des mots du quotidien dans sa langue et à l’enfant de les écouter et de les reconnaître.

**Conséquence :** les enregistrements familiaux restent sur l’appareil, dans le profil de l’enfant (IndexedDB), sans envoi ni inclusion dans la sauvegarde JSON ; ils ne sont pas présentés comme des formes validées. Les formes bassa documentées gardent leur circuit de relecture et de diffusion propre. Depuis le lot 8c, les leçons de langue nationale sont décrites par des notions communes (`data/lcn-concepts.json`) : les formes bassa et les mots de la famille s’y rattachent, ce qui permet d’accueillir une autre langue sans réécrire les leçons.

## ADR-013 — Des classes anglophones jumelles plutôt qu’une classe « bilingue »

**Décision (porteur de projet, 11 novembre 2026) :** Klassia ne présente plus de classe « bilingue ». Chaque classe francophone a une classe anglophone jumelle du sous-système anglophone (MS ↔ Nursery One, GS ↔ Nursery Two, SIL ↔ Class 1, CE1 ↔ Class 3, CE2 ↔ Class 4), reliée par thème et par semaine quand ses contenus existeront.

**Conséquence :** chaque catalogue de classe déclare `subsystem`, `language` et `twin` (sous-système, classe et statut de la jumelle) ; `npm run validate` vérifie que ces jumelles sont celles que propose l’accueil. Tant que les programmes anglophones ne sont pas disponibles, la jumelle est au statut `planned` et l’accueil ouvre la classe francophone équivalente, où l’anglais est une matière. Les classes anglophones auront leurs propres catalogues (`subsystem: anglophone`, `language: en`) ; les identifiants de ressources francophones ne changent pas.

## ADR-014 — Un moteur unique pour toutes les classes

**Décision (porteur de projet, 12 novembre 2026) :** toutes les classes seront rendues par un seul moteur, pour simplifier l’architecture, renforcer la cohérence et faciliter la maintenance. Pour ce chantier, elle autorise une refonte plus large que la « modification minimale » demandée par `AGENTS.md`.

**Conséquence :** la migration se fait par étapes annulables (`docs/MOTEUR_UNIQUE.md`), sans renommer d’identifiant ni perdre de progression locale. Première étape : `shared/classes.js` est la seule liste des classes ; les pages n’ont plus de configuration en ligne et `npm run validate` le vérifie. Les classes anglophones seront ajoutées sur le moteur commun, pas sur les anciens.

## ADR-015 — Hors connexion, une classe à la fois

**Décision (12 novembre 2026, lot 9c) :** un appareil neuf n’installe plus les cinq classes d’un bloc, mais la base commune et la classe de l’enfant ; la famille ajoute ou retire des classes. Les appareils déjà installés gardent tout.

**Conséquence :** chaque fichier du manifeste appartient à un paquet ; le choix des classes est propre à l’appareil, pas au profil. La recherche et le suivi doivent tolérer une classe absente hors connexion et le dire. Les futures classes anglophones et les sons enregistrés arriveront comme de nouveaux paquets.

## ADR-016 — Habillage commun du primaire : la barre d’onglets

**Décision (porteur de projet, 12 novembre 2026) :** SIL, CE1 et CE2 partagent la barre d’onglets en bas d’écran et un accueil de classe, sur le modèle du CE2. La maternelle garde sa présentation par thèmes et sa fiche parent, pensées pour l’adulte.

**Conséquence :** un seul moteur en dessous, deux habillages (primaire, maternelle). Les classes anglophones du primaire prendront la barre d’onglets.
