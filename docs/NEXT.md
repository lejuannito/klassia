# Klassia — prochain travail

_Mise à jour le 11 novembre 2026_

Ce fichier sert de **file d’attente courte** pour les prochaines sessions. Il ne remplace pas `docs/TRAJECTOIRE.md`.

## Lot 1 — mode famille (PR #51 à #56)

Public prioritaire : élèves et parents. Le lot est découpé en sous-lots livrés séparément.

- **1a. Barre famille** — fusionné (PR #51). En vue Enfant, la barre ne garde que le retour, la classe, les outils et un menu « Parents » qui regroupe suivi, profil, recherche, espace et validation pédagogique. Les vues adultes sont inchangées.
- **1b. Porte Parents et atelier** — un calcul à résoudre par l’adulte avant d’ouvrir « Parents » ou de quitter la vue Enfant (valable dix minutes, réarmé au retour en vue Enfant ; ce n’est pas un mot de passe) ; vues Enseignant et Administration regroupées sous « Atelier pédagogique » dans le choix de l’espace.
- **1c. Premier lancement** — sur la page d’entrée, un encart demande une fois le prénom, l’école (francophone, anglophone, bilingue) et la classe, enregistrés dans le profil (`klassia_family`, hors sauvegarde). Ensuite, l’ouverture depuis l’icône, un favori ou l’adresse racine mène à la classe mémorisée ; les liens directs et le passage au CE2 depuis Klassia ne sont pas redirigés. Tant que les classes anglophones n’existent pas, la classe francophone équivalente s’ouvre.
- **1d. Continuer** — en vue Enfant, l’accueil de chaque classe commence par une carte « Commencer » puis « Continuer » : dernière leçon ou activité ouverte si elle n’est pas acquise, sinon la première non acquise (unité en cours au CE2, thème en cours en maternelle). Chaque moteur déclare `Klassia.nextStep()` ; SIL, CE1, MS et GS mémorisent la dernière ouverture (`klassia_<classe>_recent_v1`, hors sauvegarde).
- **1e. Mots et confort** — « bilingue » retiré des noms de classes ; application installée nommée « Klassia » ; en vue Enfant, bandeau pilote et statut éditorial des leçons déplacés (bandeau visible pour les adultes et dans le menu Parents) ; écran QCM reformulé pour les familles ; en vues Enfant et Parent (`html[data-klassia-view="family"]`), commandes de 44 px et texte de 14 px au moins. Les vues de l’atelier gardent leur mise en page compacte.

## Lot 2 — corrections enrichies (en cours)

- **2a. Réponses courtes vérifiées** — 90 exercices ouverts du CE2 à réponse courte (nombre, mot, choix entre deux termes) disent dès « Valider ma tentative » si la réponse est reconnue juste, reconnue fausse ou non reconnue. Une réponse reconnue est enregistrée comme les autres exercices ; une réponse non reconnue renvoie à la correction sans être comptée fausse. Le bassa n’est pas concerné : ses variantes restent arbitrées par l’enseignant.
- **2b. Réponse de l’enfant gardée** — au CE2 (exercices et bilans), en SIL et en CE1, la réponse écrite validée reste dans le profil sur l’appareil (`klassia_answers_v1`, incluse dans la sauvegarde exportée, 400 réponses au plus). Au retour sur la leçon, elle est réaffichée, la correction est accessible, et la correction commence par « Ta réponse ». En vue Parent, le corrigé adulte commence par « Réponse écrite par l’enfant ». La maternelle répond à l’oral et n’est pas concernée.
- **2c. « As-tu réussi seul ? » en SIL et CE1** — sous la correction de l’exercice et de chaque entraînement, comme au CE2. La réponse est notée dans le journal des essais (`klassia_attempts`) ; « Pas encore » montre une aide (relire l’exemple expliqué, refaire « Ensemble » avec un adulte) ; une leçon « À découvrir » passe « En cours ». En vue Parent, la dernière auto-évaluation de l’enfant s’affiche dans le corrigé.
- **2d. Explications** — les 282 exercices du CE2 qui n’en avaient pas (unités 1 à 3, hors bassa) ont reçu une explication courte adressée à l’enfant : la raison de la réponse ou la méthode pour vérifier, et, pour les activités pratiques, ce qui fait réussir. Elle s’affiche dans la correction et sert d’aide après « Pas encore ». `npm run validate` exige désormais une explication pour tout exercice CE2 hors bassa. Les 18 exercices bassa des unités 1 à 3 restent sans explication, en attendant l’arbitrage des formes.
- **SC-U3-L1** : la note éditoriale (« intitulé officiel à valider ») a quitté le titre et le cours de l’enfant ; elle reste dans les notes de la leçon pour la revue. L’exercice 2 porte sur les branchies et les poumons.

## Lot 3 — semaine et manuels (en cours)

- **3a. Sous-centres officiels** — le curriculum du Niveau 2 (MINEDUB 2018, §2.5) donne trois sous-centres d’intérêt par centre, un par semaine, et réserve la quatrième semaine à l’intégration et à l’évaluation. Les cartes d’unités du CE2 les affichent désormais ; ceux du CE1, qui n’étaient pas ceux du programme, sont remplacés par les mêmes. `npm run validate` vérifie que le CE1 et le CE2 partagent les sous-centres officiels.
- **3b. Cette semaine** — onglet « Cette semaine » en SIL, CE1 et CE2. Le parent choisit l’unité et la semaine de l’école (`klassia_<classe>_week_v1`, hors sauvegarde) ; Klassia affiche le sous-centre, les pages du manuel de français quand son sommaire est relevé, puis les leçons de chaque matière réparties dans leur ordre sur les trois semaines (proposition de Klassia, annoncée comme telle). La semaine 4 propose les évaluations, le projet et les leçons pas encore acquises. Au CE2, choisir une unité change l’unité affichée partout.
- **3c. Dans ton manuel** — sommaires de *Champions en français* SIL et CE2 relevés dans les guides de l’éditeur ([MANUELS.md](MANUELS.md)) ; les leçons de français de ces classes indiquent les pages de l’unité dans le manuel. Reste à trouver les sommaires des autres manuels de la liste (français CE1, mathématiques…) et, plus tard, à relier chaque leçon de Klassia à la leçon correspondante du manuel.

## Lot 4 — format commun et séance guidée (en cours)

- **4a. Séance guidée en maternelle** — chaque activité de MS et de GS s’affiche dans une seule langue, avec un choix Français / English gardé dans le profil (`klassia_nursery_lang_v1`, anglais par défaut pour une école anglophone). Une fiche parent de quatre lignes ouvre l’activité (durée, matériel, ce que je dis, ce que je regarde) quand ces données existent ; « Montrer à l’enfant » ouvre un écran plein sans texte à lire (image, haut-parleur, action, « J’ai fini ! »). La réussite se note en un geste : Seul (Acquis), Avec aide, Pas encore (En cours), avec l’échelle enregistrée dans les observations ; la note libre reste possible. La carte « Continuer » devient « L’activité du jour ». En MS, la fiche est complète depuis le lot 6a ; en GS, le matériel reste en français dans la vue anglaise. Les critères d’observation restent en français dans les deux classes.
- **4b. Séance guidée en SIL** — chaque leçon de SIL commence par une fiche parent de trois lignes (matériel, ce que je dis, si c’est difficile) et propose « Montrer à l’enfant » : écran plein avec le haut-parleur qui lit la consigne, le support de la leçon (image, phrase à lire en grand, extrait audio) et « J’ai fini ! », qui ramène l’adulte à la réponse. L’écran est construit à l’ouverture, pour ne pas doubler les extraits et les voix. Le CE1 n’est pas concerné : les enfants y lisent seuls.
- **4c. Format commun** — à faire : sous-système, langue et classe jumelle dans les catalogues.

## Lot 5 — SIL (en cours)

- **5a. Une leçon de lecture par semaine** — 32 leçons « Français · lecture » (`SIL-U<n>-R1` à `R4`) : un son par semaine dans l’ordre de *Champions en français SIL* (voyelles et alphabet en unité 1, puis a, o, i · u, e/é, è/ê · ou, l, m · r, t, p · s, b, d · n, an/en, v · c/qu/k, z/f, eu) et un bilan de lecture en semaine 4. Chaque leçon donne un tableau de syllabes, des mots et une ou deux phrases à comprendre, une dictée écoutée avec la voix de l’appareil et une zone d’écriture au doigt. À partir de l’unité 4, `npm run validate` vérifie que les mots à lire n’emploient que des lettres déjà étudiées. Le champ `week` place ces leçons dans « Cette semaine » (la leçon de synthèse L01 de chaque unité passe en semaine 3, le bilan ouvre la semaine 4) ; la leçon indique la page du manuel pour la semaine. Textes rédigés pour Klassia, à relire par un enseignant de SIL.
- **5b. À faire** — sons enregistrés (voix Piper non téléchargeables dans l’environnement actuel ; voix de l’appareil en attendant), mesures et géométrie, anglais d’après le programme francophone.

## Lot 6 — maternelle (en cours)

- **6a. Fiche parent complète en MS** — les 160 activités de MS ont une durée et un matériel en français et en anglais (`materials_en`, affiché dans la vue anglaise). 123 activités ont reçu une consigne courte adressée à l’enfant (`prompt_fr` / `prompt_en`), qui remplit « Ce que je dis » et que lit le haut-parleur de l’écran de l’enfant ; 136 en ont désormais une, les autres gardent leur consigne directe existante ou relèvent du bassa. Les consignes des parcours moteurs suivent les déroulés existants. `npm run validate` exige désormais ces champs pour chaque activité de MS. Matériel courant de la maison, sans objet dangereux.
- **À faire** — GS réécrite selon le même modèle, parcours « pour aller plus loin », images et voix.

Programmes anglophones : les liens eBASE (Level I à III) sont connus mais ne s’ouvrent pas depuis l’environnement de travail ; l’aperçu public du Level I s’arrête avant le contenu d’English Language (p. 41) et de Mathematics (p. 48). Il faudra le PDF complet pour la piste anglophone (A2, Class 1).

Décisions du porteur de projet (11 novembre 2026), à reporter dans `DECISIONS.md` lors du lot qui les met en œuvre : remplacer « bilingue » par des classes anglophones équivalentes avec passerelle par thème et semaine ; la langue nationale est celle des parents, le bassa étant la première traitée pour la famille pilote ; en maternelle, parcours de base calé sur le programme et parcours « pour aller plus loin ».

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
