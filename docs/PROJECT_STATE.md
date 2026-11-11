# Klassia — état synthétique du projet

_Mise à jour le 8 novembre 2026_

Ce document donne uniquement le contexte nécessaire pour reprendre rapidement le développement. Pour les détails, consulter les documents spécialisés.

## Produit

Klassia est un manuel interactif camerounais en **édition pilote accompagnée**, utilisable sur smartphone et hors connexion. L’application est actuellement statique, sans serveur de comptes, paiement, synchronisation centrale ni télémétrie.

## Classes actuellement présentes

- Moyenne Section bilingue : 160 activités / 8 thèmes.
- Grande Section bilingue : 162 activités / 8 thèmes / 5 domaines.
- SIL bilingue : 122 leçons, dont 32 leçons de lecture (un son par semaine et un bilan par unité).
- CE1 bilingue : 183 leçons / 8 unités, dont 32 leçons d’anglais d’après le programme francophone (quatre par unité) et 36 leçons d’étude de la langue (grammaire, vocabulaire, orthographe, conjugaison), 26 leçons de mathématiques par savoir (nombres, calcul, mesures, géométrie).
- CE2 : 347 leçons / 8 unités.

L’inventaire consolidé compte 974 ressources. La matrice suit 70 repères examinés. [Matrice des repères](MATRICE_CURRICULUM.csv)

## État fonctionnel notable

- navigation commune par classe, unité ou thème, matière et domaine, avec retour à la page précédente ;
- profils et rôles locaux : Enfant, Parent, Enseignant, Administration ;
- sauvegarde/restauration locale avec profils séparés ;
- revue éditoriale accessible et exportable ;
- fonctionnement hors connexion avec contrôle d’intégrité du précache ;
- lecture optionnelle FR/EN via les voix disponibles sur l’appareil et six extraits intégrés pour la SIL et le CE1 ;
- absence volontaire de synthèse vocale bassa avec voix FR/EN ;
- 45 panneaux de traductions bassa dans les cinq classes ;
- capture et réécoute des quatre premières entrées bassa dans l’atelier Enseignant, avec avis du référent associé à la prise conservée sur l’appareil ;
- cahier de maternelle et exercices ouverts du primaire avec tracé au doigt, annulation et reprise locale par profil ;
- carnet du pilote accessible hors connexion, avec vingt séances proposées, un relevé téléphone, une synthèse des observations et l’échange de relevés par import et export ;
- toutes les variantes bassa proposées pour le sens demandé restent acceptées ;
- les 39 leçons de français CE2 U4–U8 ont été enrichies avec supports et exercices corrigés.

## Architecture résumée

- application web statique ;
- contenus pédagogiques principalement en JSON ;
- `shared/core.js`, `shared/ui.js` et `shared/learning-app.js` portent les mécanismes partagés ;
- stockage local dans le navigateur ;
- service worker et manifeste de précache généré ;
- Node.js >= 22 pour les scripts de validation, catalogage, build et tests ;
- Playwright utilisé pour les tests navigateur.

Voir `docs/ARCHITECTURE.md` pour les contrats techniques détaillés.

## Contraintes durables

- conserver le caractère pilote tant qu’une validation nominative pédagogique/linguistique n’est pas acquise ;
- ne pas transformer les vues locales en pseudo-authentification ;
- ne pas renommer les identifiants de ressources sans migration des progressions ;
- préserver le fonctionnement hors connexion ;
- préserver les progressions distinctes francophone et anglophone ;
- pour les langues et cultures nationales, poursuivre d’abord avec le bassa ;
- ne pas considérer une correspondance curriculaire proposée comme une homologation officielle.

## Références utiles

- Architecture : `docs/ARCHITECTURE.md`
- Trajectoire : `docs/TRAJECTOIRE.md`
- Audio : `docs/AUDIO_FR_CE2.md`
- Bassa / GS : `docs/GS_BASSA.md`
- Validation pédagogique : `docs/VALIDATION_PEDAGOGIQUE.md`
- Enrichissement : `docs/ENRICHISSEMENT.md`

## État de reprise recommandé

Pour une nouvelle session de développement, lire dans cet ordre :

1. `AGENTS.md`
2. `docs/NEXT.md`
3. ce fichier seulement si un contexte produit plus large est nécessaire
4. la documentation spécialisée directement liée à la tâche

Éviter de relire l’intégralité du dépôt avant une tâche locale.
