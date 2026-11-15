# Klassia — prochaine étape

_Mise à jour le 15 novembre 2026 — préparation de 15.1.0-rc.1_

Le porteur a autorisé la poursuite et la publication sur le dépôt public jusqu’à la candidate. **Ne pas basculer le dépôt en privé pendant cette séquence.** Le choix propriétaire est maintenu ; le portage personnel ou par la SARL reste à formaliser.

## Lots autonomes préparés

| Lot | Résultat |
|---|---|
| R1 — exercices et sauvegardes | étiquettes répétées, mélange des QCM, nombres signés et séparateurs par langue ; dix classes et réglages exportables ; import explicite et annulable ; persistance facultative |
| R2 — ergonomie | entrée FR/EN avant chargement des leçons ; accueil mobile ; choix de semaine conservé pour les identifiants réels de chaque classe |
| R3 — anglophone | matrice de 576 ressources ; 24 projets d’intégration Class 1/3/4 ; 16 projets Nursery enrichis ; vue enfant accompagnée en Class 1 |
| R4 — contenus | salutations clarifiées, GCD/HCF et LCM développés, premiers secours corrigés et sourcés ; 34 séquences MS explicitées en FR/EN ; audit structurel des dix classes |
| R5 — écriture | 80 modèles courts originaux ; script/cursive FR/EN embarquée ; lignages, dictée masquée et impression sans réponse pour la fiche dictée |
| R6 — audio | longues lectures segmentées sans perte de mots ; 95 scripts de prise avec empreintes ; enregistreur et publication Bassa existants conservés |
| R7 — revue | décision locale liée à la version du contenu de l’unité ; modification ou ancien avis sans empreinte = à relire ; export version 2 |
| R8 — candidate | version 15.1.0-rc.1 ; diagnostic navigateur exportable ; information sur les données ; paquet statique Cloudflare ; recette automatisée par GitHub Actions |

Il s’agit d’une **candidate technique pour la revue et le pilote**, pas d’une édition scolaire homologuée. Les 1 593 ressources demeurent en relecture. Aucun avis nominatif ni enregistrement humain n’a été fabriqué.

## Critères de livraison de la candidate

1. Ensemble des contrôles GitHub verts et paquet de publication vérifié.
2. PR #125 fusionnée et candidate publiée, avec ses limites et la procédure de retour.

Une fois ces critères satisfaits, le lot autonome R1–R8 est clos. Le prochain lot porte sur le passage en privé, puis sur la revue et le pilote ; ne pas inventer d’avis pédagogique pour clore la candidate technique.

## Après la candidate

1. **Bascule privée et propriété** : vérifier les accès GitHub des outils, l’hébergement et le pipeline de déploiement ; formaliser le titulaire personne physique/SARL et les droits des contributions ; conserver les licences des composants tiers. Changer la visibilité ne retire pas les copies déjà publiques et ne cache pas les fichiers servis au navigateur.
2. **Relecture ciblée** : une unité complète par classe pilote, anglophones compris ; vérifier attendus manquants, exactitude, niveau, corrigés et modèles d’écriture. Utiliser `REVUE_CANDIDATE.md`, la matrice et l’atelier versionné.
3. **Appareils réels** : Android Chrome normal/installé, Firefox et iPhone Safari normal/installé ; cache, téléchargement, reprise hors ligne, voix, microphone, dessin et impression. Le diagnostic aide à qualifier `ERR_CONNECTION_RESET` ; sa cause réseau/navigateur n’est pas considérée résolue sans reproduction.
4. **Voix et pilote** : stabiliser les textes, enregistrer avec accords, revoir les prononciations (bassa notamment), puis intégrer les retours familles/enseignants. Le service audio central optionnel exige une activation et une recette propres.
5. **Distribution** : PWA d’abord ; Android après pilote et préparation éditoriale/juridique ; iOS après validation de l’intérêt et des exigences de la boutique. Compte adulte et synchronisation facultatifs restent un lot ultérieur ; aucune dépendance à un compte pour lire hors ligne.
6. **Extension** : CP/Class 2 puis autres niveaux selon capacité de production et de revue.

Détails de distribution et d’exploitation : `CANDIDATE_15_1.md`. L’historique détaillé des anciens lots reste dans Git et `TRAJECTOIRE.md`.
