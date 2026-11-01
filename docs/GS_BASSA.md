# Grande section bilingue et bassa — livraison du 1er novembre 2026

## Accéder au contenu

Choisir **Grande section bilingue** dans le sélecteur de classe, ou ouvrir `gs/`. Le parcours propose **162 activités originales**, huit thèmes et cinq domaines. Les thèmes 1 et 4 ont chacun 21 activités; les autres en ont 20. La navigation par thème, domaine et matière/activité, le cahier imprimable, les observations et le suivi parent sont disponibles.

| Thème | Contenu dominant et projet |
|---|---|
| École | Récit, présentation, matériel, comptage, ordinateur; petit livre de classe |
| Corps humain | Sensations, repos, hygiène, partage, gestes; carnet du corps |
| Famille et maison | Ordre des actions, positions, ombres, rangement; maison en maquette |
| Fêtes | Participation, motifs, calendrier, création collective; fête accueillante |
| Monde animal | Observation à distance, milieux, comparaison, récit; carnet d’animaux |
| Monde végétal | Germination, observation datée, mesure, soin; journal d’une graine |
| Métiers | Questions, matériaux, heures, coopération; galerie des métiers |
| Transport | Itinéraire, places, déplacement, communication; voyage en maquette |

Les pourcentages de domaine affichés sont des repères annuels du curriculum, pas les proportions du nombre d’activités ni un emploi du temps imposé.

Les activités comprennent une consigne FR/EN, des étapes, une question et son retour, des critères d’observation et une adaptation. Huit récits et huit comptines originaux ont leurs versions française et anglaise. Le parcours anglais comporte aussi une activité de sons/mots/phrase par thème. Les 26 lettres sont réparties dans le cahier graphique. Les nombres sont manipulés jusqu’à 20; les modèles d’écriture chiffrée du cahier portent sur 1–10. Deux activités explicites traitent des jours et des mois.

Les références par activité figurent dans `source_refs` et dans [la matrice GS](../gs/data/curriculum-map.json). Il s’agit de propositions de correspondance aux tableaux MINEDUB 2018, deuxième année / Nursery Two, et non d’une certification d’exhaustivité ou d’un manuel homologué. Les thèmes animal/végétal suivent ici l’ordre du document francophone; les identifiants historiques MS sont conservés.

## Traductions bassa dans les cinq classes

Les **45 leçons de langues nationales** disposent directement du panneau **Bassa · traductions et entraînement** : CE2 13, SIL 8, CE1 8, MS 8 et GS 8. Il est accessible aux enfants et aux parents sans changer d’espace. Le lexique contient **58 entrées** : mots, expressions courtes et variantes documentaires, dont quinze entrées ajoutées à partir des publications consultées.

Pour répondre, choisir le sens demandé, saisir une forme bassa ou utiliser les boutons des variantes, puis vérifier. **Toutes les formes affichées pour ce sens sont acceptées**, y compris une forme signalée à revoir. Les encodages Unicode équivalents, la casse et les espaces superflus ne provoquent pas de refus. Les marques tonales ne sont pas arbitrairement supprimées. Aucune note certificative n’est donnée.

L’arbitrage enseignant est conservé comme annotation. L’ancien état interne `exclude` signifie maintenant « signalée à revoir, toujours acceptée à l’entraînement ». Les décisions existantes ne sont pas effacées. Les QCM historiques Bassa suspendus ne sont pas utilisés pour noter ces nouvelles traductions.

Le sens reste important : « salue-moi » n’est pas présenté comme « bonjour », et la maison-bâtiment reste distincte de l’unité domestique. Le module ne fabrique pas des phrases entières en assemblant des mots isolés. Les tâches dépassant le lexique disponible restent des activités accompagnées; une traduction complète non trouvée n’est pas annoncée comme fournie.

## Sources et prudence éditoriale

- [Resulam / collaboration de Z. D. Bitjaa Kody, liste publique de 2020](https://resulam.com/fr/2020/05/13/mes-500-premiers-mots-et-expressions-en-langue-bassa-%C9%93asaa/) : compléments lexicaux, notamment nombres et parties du corps.
- [EDU-KULTUR, alphabet ɓàsàá](https://edukultur.com/lalphabet-%C9%93asaa/) : exemples lexicaux et graphies.
- [Culture Basaa, Pondi Pondi, vocabulaire scolaire](https://antoinepondipondi.blogspot.com/2009/09/sukulu.html?m=0) : source communautaire identifiée comme telle.
- [CNRS/LGIDF, Basaa](https://lgidf.cnrs.fr/node/1790) et [copie du cours Cameroon Basaa](https://fr.scribd.com/document/895662227/Le-Basaa-du-Cameroun-Cours-d-Introduction) : références déjà présentes dans le corpus. Certaines références héritées restent à préciser; leur présence n’est pas une nouvelle validation.

Les liens consultables accompagnent les propositions. Les anciennes transcriptions OCR restent marquées comme incertaines. Une ancienne chaîne mêlant une hypothèse de forme et une note éditoriale a été retirée des réponses; les annotations entre parenthèses ont été séparées des formes. Les propositions ne servent pas de modèle de prononciation synthétique bassa.

## Intégration et vérification

MS et GS partagent le moteur maternel; `KlassiaNurseryConfig` détermine le niveau. Les clés `klassia_gs_theme_v2` et `klassia_gs_progress_v2:T1` à `T8` sont distinctes des clés MS, sauvegardées et restaurées par profil. La revue éditoriale et la synthèse parent incluent GS. Le pack hors connexion comprend les huit thèmes, le lexique et les correspondances Bassa.

- `npm test` : 15 tests, dont toutes les variantes proposées, la couverture des 45 leçons, les comptages GS, l’alphabet et l’isolation/restauration des progrès.
- `npm run validate` : structure des 522 leçons, 160 activités MS et 162 activités GS.
- `npm run test:browser` : non-régression des classes existantes.
- `npm run test:gs` : ouverture des 162 activités, exercice Bassa dans chacune des 45 leçons, variantes et annotations, progression, revue, impression, largeurs 320/390/1280, installation directe GS et exercice Bassa hors connexion.

Pour régénérer les créations GS : `python scripts/content/build-gs.py`, puis `npm run catalog`, `npm run audit:content`, `npm run build`. Le générateur s’appuie sur les identifiants stables de `data/bassa-lessons.json` et le lexique central. Les textes originaux sont conservés dans ce script pour rendre les modifications reproductibles.
