# Klassia — candidate technique 15.1.0-rc.1

Ressources scolaires camerounaises en **édition pilote accompagnée**, pour dix classes des sous-systèmes francophone et anglophone. Les contenus restent en relecture pédagogique et linguistique ; leur nombre ne prouve pas une couverture annuelle exhaustive.

## Utiliser

L’accueil propose Français / English, puis la classe. MS, GS, SIL, CE1 et CE2 ont leurs parcours ; Nursery One, Nursery Two, Class 1, Class 3 et Class 4 sont des parcours anglophones distincts. Le prénom et les progressions restent dans un profil local, sans compte sécurisé. Les vues Enfant, Parent et Enseignant ne constituent pas une authentification.

Choisir les classes à télécharger et attendre la confirmation hors connexion avant de couper le réseau. Exporter les sauvegardes utiles avant de changer d’appareil ou d’effacer les données. Le JSON du profil ne comprend pas les dessins, les prises sonores et les relevés éditoriaux ; leurs outils d’export restent distincts.

- `ecriture.html` : 80 modèles de copie/dictée, script ou cursive FR/EN, lignages et impression ; graphies locales à confirmer.
- `diagnostic.html` : relevé technique exportable pour les incidents navigateur et PWA, sans lecture des données enfant ni envoi automatique.
- `confidentialite.html` : fonctionnement des données de l’édition pilote.
- atelier pédagogique : consulter les ressources, enregistrer et exporter des décisions rattachées à la version du contenu. Une décision locale ne publie pas une validation sur le site.

## État et suite

Voir [les lots et prochaines étapes](docs/NEXT.md), [la préparation de la revue](docs/REVUE_CANDIDATE.md), [la matrice anglophone](docs/matrice-anglophone.csv) et [le dossier de candidate](docs/CANDIDATE_15_1.md).

Le dépôt reste public jusqu’à la candidate, selon l’autorisation du porteur. Le passage en privé viendra ensuite, en préservant déploiement et accès autorisés. Le choix propriétaire n’écarte pas les licences tierces : [notices](NOTICES.md).

## Développer

Node >= 22. Les contrôles, le paquet statique Cloudflare, les limites de test et la procédure de retour sont décrits dans [CANDIDATE_15_1.md](docs/CANDIDATE_15_1.md). Pour reprendre un lot, lire `AGENTS.md` puis `docs/NEXT.md`.
