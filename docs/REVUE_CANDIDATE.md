# Préparation de la revue — candidate technique

Le catalogue contient 1 593 ressources réparties sur dix classes, dont 576 dans les cinq classes anglophones. Ce volume ne démontre ni une couverture annuelle exhaustive ni une conformité certifiée. Toutes les ressources conservent leur statut de relecture.

## Travail préparé avant les relecteurs

- R1–R2 : exercices, sauvegardes, accueil français/anglais, affichage mobile et navigation.
- R3 : 24 situations d’intégration originales pour les huit unités de Class 1, 3 et 4 ; déroulement et observations des 16 projets Nursery One/Two ; écran enfant accompagné en Class 1. L’allocation mensuelle reste une proposition Klassia.
- R4 : clarification des salutations (Good evening / Good night), PGCD/HCF et PPCM/LCM développés dans les leçons existantes de Class 4, premiers secours corrigés et sourcés (OMS/NHS, 15 novembre 2026). Aucun numéro britannique n’est transposé au Cameroun.
- `matrice-anglophone.csv` : objectifs, composantes déclarées, exercices et références pour les 576 ressources anglophones. La colonne des identifiants officiels demeure vide lorsqu’aucune correspondance précise n’a été établie.
- `content-audit.json` : contrôle structurel des dix classes et des 80 unités/thèmes. Une alerte appelle un examen ; son absence ne garantit pas la qualité d’un contenu.

## Mission des relecteurs

Comparer les contenus aux colonnes de leur classe dans les référentiels MINEDUB, et consigner les attendus absents, traités partiellement ou mal répartis. Vérifier séparément l’exactitude, le niveau, les exemples, les corrigés, l’anglais, le français et le bassa. Commencer par une unité complète de chaque classe pilote et non par des leçons isolées. Les repères de pages existants restent des correspondances proposées.

En Nursery, observer les objectifs en situation avec les échelles « seul / avec aide / pas encore ». Les barèmes des projets du primaire sont proposés aux adultes ; les cases cochées par l’enfant mesurent l’avancement, pas sa compétence. Les modèles cursifs des deux sous-systèmes doivent être confirmés localement avant leur adoption par défaut.

L’atelier permet de consulter puis d’enregistrer des décisions locales et de les exporter. La publication d’une décision dans les données du produit reste une opération éditoriale distincte. Ne pas ajouter de nom de validateur ou de date de validation sans son avis réel.

## Écriture, audio et versions

80 modèles courts originaux sont disponibles dans `ecriture.html`, avec script ou cursive Playwrite FR Trad / GB J, interlignes réglables, guides et impression. Les dictées du primaire sont masquées jusqu’à la déclaration d’une tentative et restent absentes de la fiche dictée imprimée. Les polices sont intégrées pour le hors-ligne, leurs licences OFL sont conservées ; elles ne certifient ni le ductus ni le modèle scolaire camerounais.

L’atelier lie chaque décision à une empreinte SHA-256 du contenu pédagogique de l’unité (hors tampons éditoriaux). Si l’unité change ou si une ancienne décision ne possède pas d’empreinte, la ressource revient à relire dans l’atelier, avec conservation des annotations antérieures. L’export version 2 indique `needs_review`. Cette empreinte est un contrôle de version, pas une signature ni une validation.
