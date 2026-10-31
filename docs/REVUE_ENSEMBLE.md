# Revue d’ensemble après la fusion #8

Base examinée : main `290177b2b5f4e001d983035ccb218f3e0479a915`. Revue du 31 octobre 2026.

## Diagnostic

La structure couvre huit unités ou thèmes pour chacune des quatre classes existantes : 347 leçons CE2, 160 activités MS, 88 séquences SIL et 87 séquences CE1. Cet inventaire n’est pas une matrice exhaustive des compétences officielles. Le corpus reste inégal : certaines activités MS ne comportaient qu’un objectif et des critères d’observation; plusieurs exercices CE1 supposaient des supports absents; 158 introductions CE2 restent génériques. Le CE1 ne doit donc pas encore être présenté comme un manuel annuel exhaustif. Le parcours SIL → CE1 saute le CP, toujours absent de la cible actuelle.

## Changements livrés

| Sujet | Comportement obtenu |
|---|---|
| Navigation commune | Sélecteur de classe, espace explicite, profil enfant, suivi des quatre classes et lien de validation dans chaque en-tête; suppression du sélecteur concurrent obsolète |
| Revue éditoriale | Classe d’origine présélectionnée, accès au contenu et aux exercices dans un nouvel onglet, retour à la classe et à la leçon quittées |
| Parcours | CE2 : ajout des domaines transversaux; MS : ajout des regroupements matière/activité; SIL/CE1 : conservation unité/matière/domaine |
| Lecture SIL/CE1 | Cartes de choix, puis une seule leçon avec fil de navigation, précédent/suivant, réponse libre et corrections fermées au départ |
| Suivi | Progression déclarative conservée par enfant, synthèse des quatre classes; aucune assimilation à une maîtrise certifiée |
| Exercices | Cinq supports CE1 affichés, remplacement d’une question exigeant une image absente, 16 entraînements mathématiques CE1 et 8 SIL; huit activités MS enrichies avec étapes FR/EN et retour explicite |
| CE2 | Texte du poème « Ma maison » fourni; huit lexiques Bassa documentés et huit tâches de mise en correspondance ajoutés |
| Langues nationales | Propositions du lexique existant attachées aux sept autres unités CE1; mentions CE2 contradictoires corrigées. Les traductions absentes ne sont pas inventées |
| Hors connexion | Installation directe depuis SIL/CE1, panneau d’état présent et manifeste régénéré |
| Contrôles | Audit reproductible du contenu, vérification des supports tabulaires, des propositions sourcées et des identifiants SIL/CE1 |

Les regroupements de navigation ne prétendent pas constituer une nouvelle classification officielle. Une même matière peut contribuer à plusieurs domaines.

## Architecture et limites

Le socle partagé gère les profils, les sauvegardes et la navigation globale. SIL et CE1 partagent un seul moteur de leçons. CE2 et MS conservent leurs moteurs historiques et leurs extensions de rendu : une réécriture globale risquerait les progrès locaux et les parcours existants. Les identifiants et clés de progression sont conservés.

La prochaine consolidation technique devrait extraire les tables de classes et la résolution des liens de ressources dans un module commun, puis remplacer progressivement les variables globales CE2/MS par des contrôleurs explicites. Conserver les tests de sauvegarde et de fonctionnement hors connexion à chaque étape.

Les espaces parent/enseignant/admin sont des **vues locales sans authentification**. La revue se fait bien dans l’interface, mais ses décisions restent sur l’appareil; elles s’exportent pour transmission. Une validation partagée nécessitera un service de stockage, une authentification, des droits et un historique de révision. Le changement de vue ne constitue pas une déconnexion sécurisée. Les réponses libres SIL/CE1 servent au travail de la séance; seule la progression est enregistrée.

L’audit automatique ne prouve ni la justesse linguistique, ni la pertinence de chaque consigne, ni l’exhaustivité annuelle. `docs/content-audit.json` donne les identifiants des découvertes génériques et des enrichissements. Les statuts éditoriaux existants sont conservés; aucune validation nominative n’est fabriquée.

## Vérifications

- `npm test` : 10 tests de stockage, restauration, isolation des profils et intégrité hors connexion.
- `npm run validate` : 522 leçons, 160 activités, 1 323 questions stockées; syntaxe des scripts et cohérence des nouveaux champs.
- `npm run catalog`, `npm run audit:content`, `npm run build` : inventaire et manifeste reproductibles.
- `npm run test:browser` : QCM des huit unités, navigation et absence de rendu en boucle, sauvegarde par enfant, revue, Bassa, impression bilingue MS, leçons SIL/CE1, supports et corrections, retour à la classe, suivi multiclasse, largeur 320/390/1280, parcours hors connexion et installation directe CE1.
- Inspection visuelle d’une leçon CE1 sur écran de 390 px.

## Suite éditoriale priorisée

1. Remplacer les 158 découvertes CE2 génériques par des situations propres à leur objectif, puis contrôler les supports référencés dans tout le texte, pas seulement les champs structurés.
2. Établir une matrice d’objectifs annuels pour SIL et CE1; compléter les compétences absentes et les évaluations formatives. Éviter de densifier par des paragraphes répétitifs.
3. Vérifier chaque correspondance MS première année, notamment l’ordre animal/végétal par rapport au document source, sans casser les identifiants ni la progression existante.
4. Produire la GS depuis le [dossier des curricula](GRANDE_SECTION_CURRICULUM.md), avec deux parcours de langue et des activités adaptées à Nursery II / deuxième année.
5. Si une revue collective est souhaitée, développer ensuite le service de validation partagée; l’export local constitue le fonctionnement disponible aujourd’hui.
