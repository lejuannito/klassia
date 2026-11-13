# Klassia — prochain travail

_Mise à jour le 12 novembre 2026_

Ce fichier sert de **file d’attente courte** pour les prochaines sessions. Il ne remplace pas `docs/TRAJECTOIRE.md`.

## État des lots

| Lot | Fait | Reste faisable ici | Attend une ressource |
|---|---|---|---|
| 1. Mode famille | tout | — | — |
| 2. Corrections enrichies | 2a à 2g | — | — |
| 3. Semaine et manuels | SIL, CE1, CE2 ; manuels de français SIL et CE2 | — | sommaires des autres manuels |
| 4. Format commun | formats d’exercices, classes jumelles ; moteur unique décidé (ADR-014) : registre des classes (M1), modèle commun et leçons en quatre étapes (M2), leçon CE2 en quatre étapes, bilan, exercices, QCM, listes, barre d’onglets et page Suivi communs (M3a à M3g) ; CE2 lu par le moteur commun en aperçu sous `/ce2/`, avec QCM, évaluation, projet, manuel et cahier pratique (M3h-1, M3h-2) ; espace adulte du CE2 en modules indépendants du moteur (M3h-3) ; CE2 servi par le moteur commun, ancien moteur supprimé (M3h-4) ; maternelle sur le moteur commun, présentation conservée (M4) ; une feuille de style par habillage, règles mortes retirées (M5) | moteur unique terminé ; prochaine étape : piste anglophone (`PISTE_ANGLOPHONE.md`) | — |
| 5. SIL | lecture avec sons enregistrés ; mesures, géométrie et anglais du programme (5c) | — | — |
| 6. Maternelle | MS complétée, GS réécrite, vue anglaise ; parcours « programme » et « pour aller plus loin », 13 activités du programme ajoutées (6c) | — | relecture par un enseignant de maternelle ; images et voix |
| 7. CE1 | français et mathématiques par savoir, anglais, QCM reliés dans toutes les matières sauf la langue nationale ; guide de lecture de l’œuvre de littérature et son QCM (7d) ; 35 dictées enregistrées | — | relecture du guide livre en main |
| 8. Langue de la maison | enregistreur familial ; repères d’écriture du bassa, touches de lettres et de tons, saisie sans tons annotée (8b) ; modèle multilingue des leçons LCN (8c) | — | relecteur bassa (forme principale) |
| 9. Confiance et diffusion | bilan de la semaine, partage, mises à jour légères, téléchargement par classe (9c) | — | relecteurs nommés (badge) |
| Piste anglophone | vue anglaise de la maternelle ; cartographie des programmes Level I et II ; Class 1 en préparation (`/class1/`) avec interface en anglais, huit thèmes reliés à la SIL et dix matières (A2, ADR-017) ; 64 leçons d’English Language et de Mathematics en relecture (A3) ; Class 1 proposée aux familles avec la mention de relecture (ADR-018) ; les huit autres matières de la Class 1 (A4) : 128 leçons en tout | A5 Class 3, A6 Class 4 ; relecture de la Class 1 par un enseignant anglophone | programme Nursery complet ; relecteur anglophone |

Hors lots, d’après l’analyse : formats vérifiés (fait, E1), encouragements (fait : étoiles et jours de suite sur l’accueil de chaque classe), leçons en quatre étapes (fait pour SIL et CE1 avec l’étape M2 du moteur unique ; CE2 et maternelle suivront avec M3 et M4).

## Lot 1 — mode famille (PR #51 à #56)

Public prioritaire : élèves et parents. Le lot est découpé en sous-lots livrés séparément.

- **1a. Barre famille** — fusionné (PR #51). En vue Enfant, la barre ne garde que le retour, la classe, les outils et un menu « Parents » qui regroupe suivi, profil, recherche, espace et validation pédagogique. Les vues adultes sont inchangées.
- **1b. Porte Parents et atelier** — un calcul à résoudre par l’adulte avant d’ouvrir « Parents » ou de quitter la vue Enfant (valable dix minutes, réarmé au retour en vue Enfant ; ce n’est pas un mot de passe) ; vues Enseignant et Administration regroupées sous « Atelier pédagogique » dans le choix de l’espace.
- **1c. Premier lancement** — sur la page d’entrée, un encart demande une fois le prénom, l’école (francophone, anglophone, bilingue) et la classe, enregistrés dans le profil (`klassia_family`, hors sauvegarde). Ensuite, l’ouverture depuis l’icône, un favori ou l’adresse racine mène à la classe mémorisée ; les liens directs et le passage au CE2 depuis Klassia ne sont pas redirigés. Tant que les classes anglophones n’existent pas, la classe francophone équivalente s’ouvre.
- **1d. Continuer** — en vue Enfant, l’accueil de chaque classe commence par une carte « Commencer » puis « Continuer » : dernière leçon ou activité ouverte si elle n’est pas acquise, sinon la première non acquise (unité en cours au CE2, thème en cours en maternelle). Chaque moteur déclare `Klassia.nextStep()` ; SIL, CE1, MS et GS mémorisent la dernière ouverture (`klassia_<classe>_recent_v1`, hors sauvegarde).
- **1e. Mots et confort** — « bilingue » retiré des noms de classes ; application installée nommée « Klassia » ; en vue Enfant, bandeau pilote et statut éditorial des leçons déplacés (bandeau visible pour les adultes et dans le menu Parents) ; écran QCM reformulé pour les familles ; en vues Enfant et Parent (`html[data-klassia-view="family"]`), commandes de 44 px et texte de 14 px au moins. Les vues de l’atelier gardent leur mise en page compacte.

## Lot 2 — corrections enrichies (terminé)

- **2a. Réponses courtes vérifiées** — 90 exercices ouverts du CE2 à réponse courte (nombre, mot, choix entre deux termes) disent dès « Valider ma tentative » si la réponse est reconnue juste, reconnue fausse ou non reconnue. Une réponse reconnue est enregistrée comme les autres exercices ; une réponse non reconnue renvoie à la correction sans être comptée fausse. Le bassa n’est pas concerné : ses variantes restent arbitrées par l’enseignant.
- **2b. Réponse de l’enfant gardée** — au CE2 (exercices et bilans), en SIL et en CE1, la réponse écrite validée reste dans le profil sur l’appareil (`klassia_answers_v1`, incluse dans la sauvegarde exportée, 400 réponses au plus). Au retour sur la leçon, elle est réaffichée, la correction est accessible, et la correction commence par « Ta réponse ». En vue Parent, le corrigé adulte commence par « Réponse écrite par l’enfant ». La maternelle répond à l’oral et n’est pas concernée.
- **2c. « As-tu réussi seul ? » en SIL et CE1** — sous la correction de l’exercice et de chaque entraînement, comme au CE2. La réponse est notée dans le journal des essais (`klassia_attempts`) ; « Pas encore » montre une aide (relire l’exemple expliqué, refaire « Ensemble » avec un adulte) ; une leçon « À découvrir » passe « En cours ». En vue Parent, la dernière auto-évaluation de l’enfant s’affiche dans le corrigé.
- **2d. Explications** — les 282 exercices du CE2 qui n’en avaient pas (unités 1 à 3, hors bassa) ont reçu une explication courte adressée à l’enfant : la raison de la réponse ou la méthode pour vérifier, et, pour les activités pratiques, ce qui fait réussir. Elle s’affiche dans la correction et sert d’aide après « Pas encore ». `npm run validate` exige désormais une explication pour tout exercice CE2 hors bassa. Les 18 exercices bassa des unités 1 à 3 restent sans explication, en attendant l’arbitrage des formes.
- **2e. Réponses courtes vérifiées en SIL et CE1** — 220 réponses courtes (170 au CE1, 50 en SIL) portent des formes acceptées (`accept`) et, quand une erreur fréquente est prévisible, des formes refusées (`reject`) : nombres, mots, contraires, nombres en lettres anglais, phrases à accorder, syllabes et mots dictés. Même comparaison qu’au CE2 : la vérification ne bloque jamais la correction, une réponse non reconnue n’est pas comptée fausse. Une réponse reconnue est notée dans le journal des essais (`short_answer`) et une leçon « À découvrir » passe « En cours » ; en vue Parent, le corrigé affiche « Dernière vérification automatique ». Restent sans vérification automatique les réponses où la comparaison tolérante tromperait l’enfant : accents et cédille qui portent la leçon (participe passé en -é, ç), majuscules à corriger, « a / à » et « et / est », lettres isolées où « a » est un mot-outil, ainsi que les réponses ouvertes. `npm run validate` vérifie chaque forme acceptée et refusée, et qu’aucune réponse du corrigé n’est jugée fausse.
- **SC-U3-L1** : la note éditoriale (« intitulé officiel à valider ») a quitté le titre et le cours de l’enfant ; elle reste dans les notes de la leçon pour la revue. L’exercice 2 porte sur les branchies et les poumons.
- **2f. QCM reliés aux leçons (CE2)** — 1 073 des 1 187 QCM hors bassa portent `lecon`, l’identifiant de la leçon qu’ils vérifient (même unité, même matière). Après « Corriger la série », chaque erreur propose « Revoir la leçon « … » », et le score liste les leçons à revoir. Les 114 questions de la banque complémentaire historique qui ne correspondent à aucune leçon de l’unité (tressage, jardinage, handball, vannerie…) renvoient aux leçons de la matière. Le rattachement a été proposé par comparaison de vocabulaire puis relu question par question ; il reste à confirmer à la relecture enseignante. Le corrigé adulte affiche la leçon liée pour faciliter cette relecture. `npm run validate` vérifie chaque lien.
- **2g. Je révise** — sur l’accueil de la classe (SIL, CE1, CE2), sous « Ta prochaine étape », une carte « Je révise » propose jusqu’à cinq exercices à refaire : un exercice ou un entraînement marqué « pas encore » (auto-évaluation ou réponse courte reconnue fausse) revient le lendemain, puis une semaine après tant qu’il n’a pas été réussi à ces dates. Le calcul se fait à partir du journal des essais déjà présent (`klassia_attempts`), sans nouvelle donnée. Le lien ouvre la leçon et met l’exercice en évidence. Chaque moteur dit où se trouve un exercice (`Klassia.describeExercise`) ; au CE2, un exercice d’une autre unité s’ouvre dans son unité.

## Lot 3 — semaine et manuels (en cours)

- **3a. Sous-centres officiels** — le curriculum du Niveau 2 (MINEDUB 2018, §2.5) donne trois sous-centres d’intérêt par centre, un par semaine, et réserve la quatrième semaine à l’intégration et à l’évaluation. Les cartes d’unités du CE2 les affichent désormais ; ceux du CE1, qui n’étaient pas ceux du programme, sont remplacés par les mêmes. `npm run validate` vérifie que le CE1 et le CE2 partagent les sous-centres officiels.
- **3b. Cette semaine** — onglet « Cette semaine » en SIL, CE1 et CE2. Le parent choisit l’unité et la semaine de l’école (`klassia_<classe>_week_v1`, hors sauvegarde) ; Klassia affiche le sous-centre, les pages du manuel de français quand son sommaire est relevé, puis les leçons de chaque matière réparties dans leur ordre sur les trois semaines (proposition de Klassia, annoncée comme telle). La semaine 4 propose les évaluations, le projet et les leçons pas encore acquises. Au CE2, choisir une unité change l’unité affichée partout.
- **3c. Dans ton manuel** — sommaires de *Champions en français* SIL et CE2 relevés dans les guides de l’éditeur ([MANUELS.md](MANUELS.md)) ; les leçons de français de ces classes indiquent les pages de l’unité dans le manuel. Reste à trouver les sommaires des autres manuels de la liste (français CE1, mathématiques…) et, plus tard, à relier chaque leçon de Klassia à la leçon correspondante du manuel.

## Lot 4 — format commun et séance guidée (en cours)

- **4a. Séance guidée en maternelle** — chaque activité de MS et de GS s’affiche dans une seule langue, avec un choix Français / English gardé dans le profil (`klassia_nursery_lang_v1`, anglais par défaut pour une école anglophone). Une fiche parent de quatre lignes ouvre l’activité (durée, matériel, ce que je dis, ce que je regarde) quand ces données existent ; « Montrer à l’enfant » ouvre un écran plein sans texte à lire (image, haut-parleur, action, « J’ai fini ! »). La réussite se note en un geste : Seul (Acquis), Avec aide, Pas encore (En cours), avec l’échelle enregistrée dans les observations ; la note libre reste possible. La carte « Continuer » devient « L’activité du jour ». En MS (lot 6a) et en GS (lot 6b), la fiche est complète ; le matériel et les critères d’observation s’affichent en anglais dans la vue anglaise (A1a). Seul le guide « Préparer et adapter l’activité », réservé à l’espace adulte, reste en français.
- **4b. Séance guidée en SIL** — chaque leçon de SIL commence par une fiche parent de trois lignes (matériel, ce que je dis, si c’est difficile) et propose « Montrer à l’enfant » : écran plein avec le haut-parleur qui lit la consigne, le support de la leçon (image, phrase à lire en grand, extrait audio) et « J’ai fini ! », qui ramène l’adulte à la réponse. L’écran est construit à l’ouverture, pour ne pas doubler les extraits et les voix. Le CE1 n’est pas concerné : les enfants y lisent seuls.
- **4c. Classes jumelles** — les cinq catalogues déclarent leur sous-système (`francophone`), leur langue (`fr`) et leur classe anglophone jumelle (`twin`, statut `planned`) : Nursery One, Nursery Two, Class 1, Class 3, Class 4. `npm run validate` vérifie que ce sont les jumelles proposées par l’accueil. Décision reportée dans ADR-013.
- **Décidé (ADR-014), en place** — un moteur unique pour les cinq classes, `shared/learning-app.js` ; la maternelle y garde sa présentation par le module `shared/nursery.js`. Nettoyage fait (M5) : le moteur unique est terminé.

## Lot 5 — SIL (en cours)

- **5a. Une leçon de lecture par semaine** — 32 leçons « Français · lecture » (`SIL-U<n>-R1` à `R4`) : un son par semaine dans l’ordre de *Champions en français SIL* (voyelles et alphabet en unité 1, puis a, o, i · u, e/é, è/ê · ou, l, m · r, t, p · s, b, d · n, an/en, v · c/qu/k, z/f, eu) et un bilan de lecture en semaine 4. Chaque leçon donne un tableau de syllabes, des mots et une ou deux phrases à comprendre, une dictée écoutée avec la voix de l’appareil et une zone d’écriture au doigt. À partir de l’unité 4, `npm run validate` vérifie que les mots à lire n’emploient que des lettres déjà étudiées. Le champ `week` place ces leçons dans « Cette semaine » (la leçon de synthèse L01 de chaque unité passe en semaine 3, le bilan ouvre la semaine 4) ; la leçon indique la page du manuel pour la semaine. Textes rédigés pour Klassia, à relire par un enseignant de SIL.
- **5b. Sons enregistrés** — les 32 leçons de lecture de SIL ont maintenant un enregistrement fixe du support (lettres, syllabes, mots et phrases) et de la dictée écoutée : 63 extraits (2,1 Mo) générés avec la voix française Piper `fr_FR-siwis-medium`, avec le même réglage que les extraits du pilote, et téléchargés avec l’édition. La voix de l’appareil reste proposée en plus. Pour que la voix lise un son et non le nom d’une lettre, quelques graphies isolées sont réécrites pour la synthèse seulement (é, è, ê, am, em, man) ; le texte affiché ne change pas. Script reproductible : `scripts/audio-sil.py` (modèles hors dépôt). À faire écouter pendant le pilote.
- **5c. Programme Niveau 1 : mesures, géométrie, anglais** — d’après le programme SIL–CP 2018 reçu le 11 novembre 2026 (colonne SIL), 22 leçons originales. Mesures (`SIL-U<n>-MM`, tableau 17) : masses à la balance et aux bouchons, capacités au gobelet, monnaie jusqu’à 15 F, jours de la semaine, une semaine = sept jours, mesures au jeu, problèmes jusqu’à 20 ; la comparaison des longueurs de l’unité 1 existait déjà. Géométrie (`SIL-U<n>-MG`, tableau 18) : carré, rectangle et triangle, tracer à la règle et au gabarit, alignements, repérage (sur, sous, devant, derrière, gauche, droite, près, loin), déplacements par rapport à un repère, cube et pavé droit ; la reproduction sur quadrillage de l’unité 4 existait déjà. Anglais (`SIL-U<n>-E1`, tableaux 9 à 12) : une leçon par unité avec le vocabulaire du thème, les nombres de 0 à 20, les jours, les consignes, les contraires, le pluriel en -s, he/she/they, in/on/under, Hi!/Hello! ; support et dictée enregistrés avec la voix anglaise Piper (16 extraits). Chaque leçon a sa fiche parent et deux entraînements, dont un vérifié par Klassia. Statut `in_review`.
- **5d. Anglais réaligné** (décision du porteur de projet, 12 novembre 2026) — les huit leçons `SIL-U<n>-L02` suivent désormais le programme francophone de SIL : plus de cartes de nombres avant l’unité 5, puis 0 à 5, 6 à 10, 11 à 15 et 15 à 20. La progression anglophone Class 1 (jusqu’à 50) relève de la classe jumelle. `npm run validate` refuse tout nombre au-delà de 20 dans ces leçons.

## Lot 6 — maternelle (en cours)

- **6a. Fiche parent complète en MS** — les 160 activités de MS ont une durée et un matériel en français et en anglais (`materials_en`, affiché dans la vue anglaise). 123 activités ont reçu une consigne courte adressée à l’enfant (`prompt_fr` / `prompt_en`), qui remplit « Ce que je dis » et que lit le haut-parleur de l’écran de l’enfant ; 136 en ont désormais une, les autres gardent leur consigne directe existante ou relèvent du bassa. Les consignes des parcours moteurs suivent les déroulés existants. `npm run validate` exige désormais ces champs pour chaque activité de MS. Matériel courant de la maison, sans objet dangereux.
- **6b. GS réécrite** — 148 des 162 activités de GS sortaient d’un gabarit : objectif recopié de la consigne, étapes « Préparer avec l’adulte : … » qui répétaient la consigne, matériel « objets courants décrits dans la consigne », critères d’observation génériques, 12 minutes partout. Chacune a maintenant un objectif réel, trois étapes concrètes en français et en anglais, deux critères d’observation propres à l’activité, un matériel précis en français et en anglais et une durée adaptée (8 à 20 minutes). Les consignes maladroites ont été reprises (« essaie un sac de tissu vers un cercle », groupes de dix pour compter jusqu’à 5…) et les activités à deux se font avec l’adulte, un frère, une sœur ou un camarade. `npm run validate` refuse le retour de ces gabarits. Les familles d’activités (comptine, histoire, lecture en anglais, tracé de lettres, bassa, comptage, dessin, fabrication, rythme, motricité) gardent une démarche commune, avec les mots, nombres et objets propres à chaque thème.
- **6c. Parcours calés sur le programme** — le programme de maternelle francophone (MINEDUB 2018) a été retrouvé en ligne. Chaque activité de MS cite désormais son tableau du programme (`source_refs`, déjà présent en GS) et se range dans le parcours **Programme** (149 en MS, 143 en GS) ou **Pour aller plus loin** (`path: "plus"`, 19 en MS, 24 en GS) ; la fiche l’affiche, l’accueil du thème donne le compte et « À faire maintenant » propose le programme d’abord. Treize activités originales comblent des manques : voyelles et prénom en MS, lettres et syllabes en GS, TIC et astres en MS (MS 168, GS 167). Détail et classement dans `docs/MATERNELLE_PROGRAMME.md`.
- **À faire** — relecture du classement par un enseignant de maternelle ; images et voix.

## Lot 7 — CE1 (en cours)

- **7a. Anglais du programme francophone** — 32 leçons « English » (`CE1-U<n>-E1` à `E4`), quatre par unité : écoute et expression orale, lecture, écriture, grammaire et vocabulaire, d’après les tableaux 12 à 15 du programme de niveau 2 (p. 55 à 64, colonne CE1) : famille et pluriels, traditions et passé/futur, salutations et prépositions, métiers et adverbes, voyages, nombres jusqu’à 300, pronoms, maladies et conjonctions, jeux et interjections, moyens de communication et ponctuation. Chaque leçon a un texte à lire, un exemple, un exercice corrigé, deux entraînements dont une dictée écoutée avec la voix anglaise de l’appareil. Les huit leçons d’anglais déjà présentes (programme anglophone, Class 3) restent en place jusqu’à la piste anglophone, où elles seront déplacées en Class 3.
- **7b. Étude de la langue par savoir** — 36 leçons : grammaire (`-G1`, `-G2`), vocabulaire (`-V1`), orthographe (`-O1`, `-O2`) et conjugaison (`-C1`) dans chaque unité, d’après les tableaux 7 à 10 du programme de niveau 2 (p. 37 à 51, colonne CE1) : le nom, le groupe nominal, la phrase et sa ponctuation, les déterminants, le sujet, l’adjectif et les accords, l’épithète et l’attribut, le pronom, le groupe verbal, COD et COI, les conjonctions ; champs lexicaux de chaque thème, synonymes, homophones, contraires, familles de mots, dictionnaire ; pluriel et féminin, mots invariables, a/à, on/ont, et/est, son/sont, valeur des lettres, dictées ; présent, futur, passé composé, imparfait, être et avoir. Chaque leçon a un texte à observer (avec un tableau de conjugaison quand il le faut), un exemple, un exercice corrigé et deux entraînements, dont une dictée écoutée pour l’orthographe et la conjugaison. Les leçons « Français » déjà présentes (lecture, oral, écrits) restent ; certaines notions se recoupent avec les anciennes leçons L02.
- **7c. Mathématiques par savoir** — 26 leçons d’après les tableaux 19 à 21 du programme de niveau 2 (p. 75 à 91, colonne CE1) : calcul (`-MC`) et mesures (`-MM`) dans chaque unité, nombres (`-MN`) et géométrie (`-MG`) là où les leçons existantes ne les couvraient pas. Calcul mental et suites d’opérations, ensembles (∈, ∪, ∩), addition et soustraction posées, commutativité et distributivité, tables de 3, 4, 5 et preuve par 9, double et moitié, nombres pairs, division par un chiffre, triple et tiers, calculatrice ; longueurs, masses, capacités, périmètre et aire, périmètre du carré et du rectangle, calendrier, températures, heure, angles en degrés, monnaie jusqu’à 1 000 F ; règle et équerre, parallèles et perpendiculaires, cube, pavé, cylindre et empreintes, carré, rectangle, triangle, symétrie, angles ; nombres jusqu’à quatre chiffres et fractions simples. Chaque leçon finit par un petit problème de la vie courante.
- **7d. QCM reliés** — onglet « Réviser » en CE1 : 32 séries (français, mathématiques et anglais, cinq questions chacune ; « Autres matières », six questions, une par leçon de sciences et technologies, sciences humaines et sociales, TIC, éducation artistique, éducation physique et sportive, développement personnel), pour chacune des huit unités : 168 questions originales, chacune reliée à la leçon qu’elle vérifie (`ce1/data/qcm.json`, champ `lecon`). Après « Corriger la série », chaque erreur affiche la correction et « Revoir la leçon « … » », et le score liste les leçons à revoir. Le dernier score de chaque série est gardé dans le profil (`klassia_ce1_qcm_v1`, inclus dans la sauvegarde) et la série compte dans le bilan de la semaine. En vue adulte, la série s’affiche en corrigé avec la leçon liée. Statut `in_review`, relecture enseignante à faire. `npm run validate` vérifie chaque question et chaque lien.
- **7d. Œuvre de littérature accompagnée** — huit leçons « Français · littérature » (`CE1-U<n>-LT`, une par unité) accompagnent *Comment ça va Benjamin ?* (Kidi Bebey, Africa Education) selon le tableau 6 du programme : découvrir le livre, personnages, fiction et réalité, raconter, donner son avis, chemin du récit, décor. Le texte du livre n’est ni disponible ni reproduit : le guide n’affirme que la présentation de l’éditeur et renvoie au livre pour le reste (`docs/CE1_LITTERATURE.md`). CE1 : 191 leçons.
- **7e. QCM de littérature et dictées enregistrées** — deux questions par unité sur l’œuvre, reliées aux leçons `CE1-U<n>-LT` (184 questions) ; comme le guide, elles n’affirment rien du livre au-delà de la présentation de l’éditeur. Les 35 entraînements « Écoute et écris » du CE1 qui n’avaient que le volet adulte ont un enregistrement (Piper, mêmes réglages qu’en SIL, `scripts/audio-sil.py --grade ce1`) : l’enfant peut s’entraîner sans adulte qui lise.
- **À faire** — relire le guide livre en main. Les langues et cultures nationales n’ont pas de QCM, comme au CE2, en attendant la validation linguistique.

## Lot 8 — langue de la maison (en cours)

- **8a. Enregistreur familial** — page `maison.html` (menu Parents, « Langue de la maison ») : la famille note le nom de sa langue, enregistre 29 mots du quotidien (salutations, famille, corps, nombres de 1 à 5, maison et repas), peut écrire le mot si elle le souhaite ; l’enfant joue à « Écouter et trouver » (trois images, dès trois mots enregistrés). Audio dans IndexedDB par profil, hors sauvegarde ; le jeu compte dans le bilan de la semaine. Décision reportée dans ADR-012.
- **8b. Écrire le bassa** — une référence publique de 2024 (CNRS, Bassong et Zribi-Hertz) et la présentation de l’alphabet général ont été retrouvées. `data/bassa-ecriture.json` en tire des repères sourcés (lettres ɓ ŋ ɲ ɛ ɔ, cinq tons, exemples, questions ouvertes), affichés dans l’atelier Bassa sans valider aucune forme. Neuf touches insèrent lettres et tons sous les champs de réponse ; une réponse sans marques de ton est acceptée avec rappel de la forme proposée (proposition à confirmer). Voir `docs/BASSA_ECRITURE.md`.
- **8c. Modèle multilingue** — les leçons de langue nationale visent des notions, pas une langue : `data/lcn-concepts.json` (70 notions, dont les 29 mots du quotidien) relie chaque forme bassa documentée et chaque mot enregistré par la famille à une même notion. Dans les 45 leçons et activités de langue nationale des cinq classes, un panneau « Dans la langue de la maison » suit les formes bassa : il fait écouter les mots que la famille a enregistrés pour ces notions, quelle que soit sa langue, et invite à enregistrer les autres. « Langue de la maison » propose, en plus des 29 mots, les 41 mots des leçons. Rien ne quitte l’appareil (`shared/lcn.js`).
- **À faire** — forme principale par mot et exercice d’écoute (relecteur bassa à obtenir).

## Lot 9 — confiance et diffusion (en cours)

- **9a. Bilan de la semaine et partage** — « Suivi des classes » commence par « Les 7 derniers jours » : par classe, exercices essayés et réussis, séries de QCM, activités de maternelle notées seul / avec aide / pas encore, d’après les traces datées déjà enregistrées sur l’appareil (`klassia_attempts`, `klassia_observations`). Le parent peut envoyer ce bilan par WhatsApp (lien `wa.me`, sans compte ni serveur) ou le copier ; le message ne contient que ces nombres et le prénom du profil, ni réponses écrites ni notes. Le menu Parents propose aussi « Recommander Klassia (WhatsApp) » avec l’adresse de l’application.
- **9b. Mises à jour légères** — une nouvelle édition ne télécharge plus que les fichiers modifiés : le service worker recopie depuis l’édition installée chaque fichier dont les octets correspondent à l’empreinte SHA-256 de la nouvelle édition, puis télécharge et vérifie le reste. L’installation reste tout ou rien et l’édition installée reste utilisable en cas d’échec. Jusqu’ici, chaque mise à jour retéléchargeait les 5,6 Mo des cinq classes ; une mise à jour de contenu courante ne coûte plus que quelques fichiers. `tests/pwa-browser.cjs` vérifie qu’une mise à jour ne demande au serveur que les fichiers modifiés.
- **9c. Téléchargement par classe** — un appareil neuf n’installe que la base commune (0,5 Mo) et la classe de l’enfant (0,4 à 3 Mo) au lieu de tout (9 Mo). Le panneau « Classes hors connexion » ajoute ou retire des classes ; la revue éditoriale (0,7 Mo) est un paquet à part pour l’atelier pédagogique. Les appareils déjà installés gardent les cinq classes. Hors connexion, la recherche et le suivi signalent les classes non installées. Détail dans `ARCHITECTURE.md`, section « Hors connexion ».
- **À faire** — relecture nominative du noyau et badge (relecteurs à désigner).

## Expérience de l’enfant (d’après l’analyse, hors lots)

- **E1. Formats vérifiés** — trois nouveaux formats d’entraînement en SIL et CE1, vérifiés par Klassia : remise en ordre (on touche les étiquettes dans l’ordre), appariement (une liste à choisir en face de chaque mot) et texte à trous (accents et lettres exigés, majuscules et espaces tolérés). 38 entraînements : ordre alphabétique, nombres et longueurs à ranger, mois, syllabes d’un mot ; cris des animaux, contraires, conjugaisons, adverbes, familles de mots, durées ; pluriels, terminaisons, déterminants, a/à et on/ont, c/ç, prépositions et conjonctions. Chaque vérification est notée dans le journal des essais et alimente « Je révise » ; la correction s’ouvre après la première vérification. À l’impression, les trous deviennent des lignes et les étiquettes sont données dans le désordre. Schéma : `type` (`order`, `match`, `gaps`) avec `items`, `pairs` ou `text` (`[[réponse|variante]]`) ; `npm run validate` vérifie chaque entraînement.
- **Encouragements** — sur l’accueil de chaque classe, en vue Enfant : une étoile par leçon ou activité réalisée, et les jours de suite où l’enfant a travaillé (réponses ou observations). Rien de nouveau n’est enregistré ; aucun message quand la série s’arrête (`shared/encouragement.js`).
- **Leçons en quatre étapes** — en SIL et CE1, chaque leçon s’affiche en quatre étapes (Je découvre, Je retiens, Je m’exerce, Je fais le point), une à la fois ou en entier ; la dernière étape fait le bilan des réponses vérifiées et propose le QCM lié et la leçon suivante (`shared/lesson-model.js`).

## Piste anglophone (début)

- **A1a. Vue anglaise complète en maternelle** — les 438 critères d’observation de MS et les 195 de GS existent en anglais (`observe_en`), en plus du matériel (6a, 6b) et des consignes. `npm run validate` exige la traduction de chaque critère. Les classes anglophones elles-mêmes (Nursery One/Two, Class 1 à 4) attendent les programmes anglophones complets.

- **A2. Interface anglaise et Class 1 en préparation** — `/class1/` : interface en anglais par `shared/i18n.js` (ADR-017), huit thèmes du tableau 18 du Level I reliés aux unités de la SIL, dix matières avec horaire et tableau du programme. La classe est au registre dans `upcoming` : servie pour la relecture, pas encore proposée aux familles. 
- **A4. Class 1 : les huit autres matières** — une leçon par thème en Science and Technology, Français, Citizenship, Vocational Studies, Arts, Physical Education and Sports, National Languages and Cultures et ICTs (64 leçons, tableaux 22 à 29). Les leçons de Français sont rédigées en français, avec des gloses anglaises pour la famille ; leur contenu est marqué `lang="fr"` et `translate="no"`, leurs commandes restent en anglais. Les leçons de langues nationales travaillent des notions dans la langue de la famille (page « Langue de la maison ») ; aucune forme bassa n’y est proposée avant relecture linguistique. Reste en français : les commandes de la voix de synthèse dans une leçon de Français.
- **A3. Class 1 : English Language et Mathematics** — 64 leçons originales, quatre par thème et par matière : écoute et expression, lecture, écriture, grammaire et vocabulaire ; ensembles, nombres et opérations, mesures, géométrie, données. Chaque leçon cite le tableau, la composante et la page du Level I ; statut « à relire » par un enseignant de Class 1 du sous-système anglophone. Les leçons ont leur paquet hors connexion (CLASS1, 0,17 Mo), installé seulement avec « toutes les classes » tant que la classe n’est pas proposée. Restent en français dans une classe anglophone : la recherche, les outils, la page « Langue de la maison », le carnet du pilote, l’impression et l’atelier pédagogique, qui sont des pages communes.

Programmes anglophones : Level I (Class 1 et 2) et Level II (Class 3 et 4) reçus le 11 novembre 2026 ; Nursery seulement en transcription partielle. Cartographie et plan de construction (lots A2 à A7) : [PISTE_ANGLOPHONE.md](PISTE_ANGLOPHONE.md). Les classes anglophones suivent les mêmes huit thèmes mensuels que les unités francophones, mais leurs contenus diffèrent (Class 1 : nombres jusqu’à 100) et ne sont pas répartis par thème dans le programme.

Décisions du porteur de projet (11 novembre 2026), à reporter dans `DECISIONS.md` lors du lot qui les met en œuvre : remplacer « bilingue » par des classes anglophones équivalentes avec passerelle par thème et semaine (reportée : ADR-013) ; la langue nationale est celle des parents, le bassa étant la première traitée pour la famille pilote (reportée : ADR-012) ; en maternelle, parcours de base calé sur le programme et parcours « pour aller plus loin ».

## Lots techniques à essayer sur appareils réels

Les trois correctifs sont fusionnés. Les essais Android et iPhone se comparent dans le carnet par édition, adresse, mode d’ouverture et réseau. La lecture des prises bassa intégrées a son propre contrôle. [Guide du pilote](GUIDE_PILOTE.md#relevé-à-transmettre)

- Ouvrir une fiche A4 depuis l’icône et essayer l’impression ou l’export PDF. En cas de difficulté, essayer la même fiche dans Chrome ou Safari. [Impression](https://github.com/lejuannito/klassia/issues/35)
- Vérifier dans les cinq classes que le corrigé s’ouvre après une tentative, puis vérifier l’accès direct dans un espace adulte. [Corrigés](https://github.com/lejuannito/klassia/issues/36)
- Comparer les extraits fixes et les voix de l’appareil sur la tablette qui a posé problème, sur Android et sur iPhone. Relever la compréhension et les mots mal prononcés. [Voix FR/EN](https://github.com/lejuannito/klassia/issues/37) · [Carnet du pilote](GUIDE_PILOTE.md)

## Recherche et mises à jour hors connexion

La recherche des 844 ressources a été fusionnée le 4 novembre 2026. Le guide de vérification mobile figure dans [RECHERCHE.md](RECHERCHE.md).

Le lot du 6 novembre protège le cache installé lors d’un échec, indique le résultat de la vérification et demande de fermer les autres onglets Klassia avant le rechargement. Après fusion, vérifier sur téléphone le passage à la nouvelle édition, la reprise de la leçon et l’accès en mode avion. Pour ce premier passage depuis l’ancienne interface, fermer les autres onglets Klassia avant de cliquer sur « Recharger avec la nouvelle édition ».

Le correctif de navigation Cloudflare traite le `ERR_FAILED` reproduit dans Chromium après l’activation du service worker. L’affichage dans Chrome a été signalé comme rétabli. Le parcours complet depuis l’icône reste à relever sur les appareils du pilote. [Procédure de vérification](DEPLOIEMENT_CLOUDFLARE.md#rechargement-dans-chrome-après-installation) · [Ticket Chrome](https://github.com/lejuannito/klassia/issues/34)

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

Le relevé examine 70 repères dans les cinq classes. Le lot arts et motricité enrichit dix ressources. Le carnet propose vingt séances et un contrôle du tracé sur téléphone. La navigation de classe est harmonisée. Le cahier de maternelle et les exercices ouverts du primaire permettent le tracé au doigt. [Matrice et bilan](COUVERTURE_PROGRESSION.md) · [Carnet du pilote](GUIDE_PILOTE.md)

1. Dans **Carnet du pilote › Prises bassa**, ouvrir l’atelier et choisir l’espace Enseignant. Enregistrer `BA002`, `BA004`, `BA005` et `BA006`, puis consigner l’avis du référent et l’accord éventuel pour l’écoute locale par l’élève. Le sélecteur de l’atelier couvre toutes les entrées du lexique. Après l’accord de diffusion, télécharger le dossier privé et préparer le MP3. L’intégrer après réécoute et contrôle de l’empreinte. [Enregistrement dans Klassia](SUPPORTS_SONORES.md#enregistrer-au-micro-dans-klassia)
2. Remplir le relevé du carnet sur Android et iPhone. Vérifier l’écran Bassa, le micro, l’écoute en mode avion, le tracé tactile et la reprise de la progression. Refaire l’écoute Bassa après intégration des prises. [Guide pilote](GUIDE_PILOTE.md#essai-sur-android-et-iphone)
3. Importer les relevés des familles et des enseignants, traiter les exercices signalés et faire un nouvel essai. Utiliser les variantes proposées pour le prochain lot des cinq classes. [Grille de retours](GUIDE_PILOTE.md#retours-des-familles-et-enseignants)

Les listes de thèmes, unités et matières partagent désormais les mêmes cartes. L’accueil Enfant du CE2 s’ouvre sur les unités. Le menu Outils donne accès hors connexion à l’alphabet, aux tables de 1 à 10, aux nombres jusqu’à 99 999 et aux montants en francs CFA jusqu’à 10 000. Les leçons de numération U2 et de monnaie U8 explicitent l’écriture des milliers et la vérifient dans un exercice. [Outils de référence](https://lejuannito.github.io/klassia/outils.html)

Essayer les cinq séances d’arts et de motricité. Pour chaque classe, relever séparément l’aide nécessaire pour l’expression artistique et le déplacement ou la coopération. Préparer l’intégration progressive du CP après l’exploitation des retours, puis celle des autres classes selon la feuille de route.

## Lot audio partagé et lecture étendue — PR à fusionner

- Lecture des cours élargie aux objectifs, exemples guidés, synthèses et activités, en respectant les langues des parcours. Il s'agit encore de synthèse vocale dépendante de l'appareil ; **aucun nouveau MP3 long n'est livré dans ce lot**.
- Publication directe de prises bassa approuvées par un référent, avec avis favorable et accord de diffusion, au moyen d'une API Cloudflare Pages + D1 + R2 privé + authentification Cloudflare Access ; liste des prises et retrait depuis l'atelier. L'écoute locale et l'exportation manuelle sont conservées en secours.
- Catalogue public consultable depuis `klassia.app` et `lejuannito.github.io/klassia` lorsque le service partagé est opérationnel. Le service n'est **pas actif** avant la configuration D1/R2/Access et l'application de la migration.
- Mise en service et protocole de vérification : [Audio partagé](AUDIO_PARTAGE.md). Avant de déclarer le lot disponible, vérifier les connexions, la publication, l'écoute entre deux appareils, le retrait, le micro sur Android et iPhone et le comportement sans réseau.
- Lots suivants : (1) enregistrements MP3 longs et stables, avec navigation par séquences et commandes pause/reprise/vitesse ; (2) cache optionnel hors connexion des prises distantes approuvées ; (3) référentiels/consentements et délégation par classe/langue, revue à deux niveaux ; (4) enrichissements des cinq classes à partir des retours terrain et intégration du CP, puis des classes restantes.

## Règle pour chaque nouvelle session

Ne prendre **qu’un lot ou sous-lot clairement borné**. Éviter les demandes du type « améliorer tout Klassia ».

Format recommandé :

- OBJECTIF
- ÉTAT ACTUEL
- ATTENDU
- CONTRAINTES

Si une tâche locale révèle un problème architectural transversal, suspendre l’élargissement du périmètre et consigner d’abord le diagnostic.
