# Architecture v15 et règles d’évolution

## Application statique et contenu canonique

Les fichiers `data/content-uN.json` sont désormais les sources complètes des unités CE2, enrichissements inclus. Les thèmes MS vivent dans `ms/data/themes/TN.json`. L’ancien découpage gzip/base64 a été retiré. Les pages n’ajoutent plus tardivement une seconde version du cours.

Les moteurs CE2 et MS restent distincts pour respecter leurs modes d’usage. Ils partagent `shared/core.js` (profils, stockage, sauvegarde, mélange QCM et registre de routes), `shared/ui.js` (profils, données et voix optionnelle), le service worker et les tests. Les noms historiques de certains scripts sont conservés pour limiter les changements ; ils ne signifient plus que plusieurs versions du produit se superposent.

`shell()` émet `klassia:render` une fois le DOM remplacé. Les modules ajoutent leurs commandes depuis cet événement, sans observer leurs propres mutations. Les routes spéciales sont enregistrées par classe et traitées depuis le routeur correspondant. Les chargements asynchrones des vues multi-unités vérifient la route avant de rendre leur résultat.

## Stockage

Une enveloppe locale `klassia_profiles_v15`, schéma 2, contient le profil actif et une collection de profils. Chaque profil possède un nom et ses données sérialisées. Les clés historiques sont copiées dans le premier profil au premier démarrage et ne sont pas supprimées. Les données invalides des anciennes clés ne sont pas importées ; elles restent récupérables dans le stockage d’origine.

Une mutation charge la dernière enveloppe, en construit une copie, la valide puis effectue un seul `localStorage.setItem`. Une erreur de quota ne peut pas laisser une demi-restauration. Cela ne constitue pas un verrou distribué : deux onglets écrivant exactement simultanément restent un cas à éviter ; les autres onglets se rechargent lors d’un changement de l’enveloppe.

Les sauvegardes concernent le profil actif et les deux classes. L’import v1/v2 valide les clés autorisées, les types et les principales bornes, puis remplace uniquement les rubriques présentes dans le fichier. Le profil cible est explicitement confirmé. Une copie de l’enveloppe antérieure permet d’annuler la dernière restauration. Cette annulation revient aussi sur les progrès saisis depuis la restauration.

Les rôles enfant/adulte/revue sont des **affichages locaux libres**, sans contrôle d’accès sécurisé. Aucun identifiant réel de connexion n’est demandé. Les futures fonctions serveur devront fournir leur propre authentification et leurs propres autorisations.

## Données pédagogiques

Une leçon possède identifiant stable, objectifs, référence, cours, exercices et statut éditorial. Un exercice est `open`, `mcq` ou `number`. Les sommaires de manuels (`data/manuels/*.json`) donnent, par unité et par semaine, la rubrique, le titre et la page du livre de l’élève ; `shared/week.js` les affiche dans « Cette semaine à l’école » (SIL, CE1, CE2). En SIL et CE1, une leçon peut porter `week` (1 à 4) pour être proposée une semaine précise ; les autres leçons de la matière se répartissent dans leur ordre sur les semaines 1 à 3. Les leçons de lecture de SIL (`-R1` à `-R4`) portent aussi `graphemes`, les graphies nouvelles de la semaine, qui servent au contrôle de déchiffrabilité de `npm run validate`. Un exercice `open` à réponse courte peut porter `accept` (formes reconnues comme justes) et `reject` (formes reconnues comme fausses) : la comparaison `Klassia.matchAnswer` tolère majuscules, accents, articles, espaces des nombres, phrase réponse et calcul posé ; une réponse non reconnue n’est jamais comptée fausse et la correction reste accessible après toute tentative. `npm run validate` vérifie que la réponse écrite et chaque forme acceptée sont reconnues, et que chaque forme refusée l’est. En SIL et CE1, l’exercice d’une leçon et chaque entraînement (`practice[]`) peuvent porter les mêmes `accept` et `reject` ; la consigne sert de contexte et la réponse du corrigé ne doit jamais être jugée fausse. Les QCM de banque gardent une identité de choix indépendante de la position affichée ; un mélange est conservé tant que la page de tentative reste ouverte.

Les observations, tentatives et confiance déclarée sont distinctes. Les anciennes valeurs `MAITRISEE` restent compatibles, mais sont présentées comme compréhension déclarée. Les observations MS incluent activité, thème, date, langue et aide lorsqu’elles sont saisies par l’adulte.

Une question de banque QCM du CE2 (`data/qcm-u*.json`) peut porter `lecon`, l’identifiant d’une leçon de la même unité et de la même matière : après une erreur, la correction propose « Revoir la leçon » ; sans `lecon`, elle renvoie aux leçons de la matière.

`data/coverage.json` est un inventaire dérivé, non un référentiel officiel. Ses `official_competency_id` restent nuls jusqu’à un rapprochement documentaire réellement effectué. Les identifiants de ressources ne doivent pas être renommés sans migration de progression.

## Hors connexion

`scripts/build.mjs` calcule les empreintes SHA-256 des fichiers critiques. Le service worker vérifie l’édition avec quatre téléchargements simultanés au maximum. Un échec ou un délai dépassé annule les téléchargements restants. Le service worker attend les écritures en cours avant de supprimer le cache créé par cette tentative. Il conserve les caches préexistants, y compris lorsque le manifeste désigne l’édition installée. Une mise à jour ne télécharge que les fichiers modifiés : un fichier déjà présent dans une édition installée est recopié lorsque ses octets correspondent à l’empreinte de la nouvelle édition.

Le service worker sert les pages et données de l’édition active. Lorsqu’un fichier critique manque, il vérifie l’empreinte de la réponse du serveur avant de l’utiliser. Les paramètres de thème conservent la même clé HTML. L’activation demandée depuis un onglet attend la fermeture des autres fenêtres Klassia. Le premier chargement continue sur la page ouverte lorsque le service worker prend le contrôle.

Le téléchargement couvre les cinq classes et leur recherche commune. Un découpage ultérieur par classe ou langue devra vérifier l’intégrité de chaque pack.


Les parcours SIL et CE1 partagent `shared/learning-app.js` et des catalogues de classe séparés. Les classes peuvent se parcourir par unité, matière ou domaine. Leurs ressources sont dans la revue éditoriale en statut `in_review`; une décision enregistrée localement ne publie ni ne modifie le JSON. SIL conserve ses huit anciennes clés de progression via des identifiants pilotes stables, et CE1 utilise sa propre clé incluse dans les sauvegardes.
