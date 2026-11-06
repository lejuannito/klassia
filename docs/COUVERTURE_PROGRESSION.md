# Couverture du curriculum et progression des cinq classes

Relevé du 6 novembre 2026 sur le contenu de Klassia au commit de référence [de701af](https://github.com/lejuannito/klassia/commit/de701af1fc9bb75f846f3370a44a3c3bdef0d41a). Ce premier passage examine 30 repères, soit six par classe. Il couvre le langage et la lecture, l’écriture, le calcul, les arts, la motricité et un repère d’anglais. La matrice part des attendus des tableaux du MINEDUB, puis rapproche les supports, consignes et retours réellement présents dans Klassia. [Matrice des 30 repères](MATRICE_CURRICULUM.csv)

| Classe | Ressources dans l’inventaire | Repères couverts | Partiels | Absents |
|---|---:|---:|---:|---:|
| Moyenne section | 160 | 5 | 1 | 0 |
| Grande section | 162 | 1 | 5 | 0 |
| SIL | 88 | 4 | 1 | 1 |
| CE1 | 87 | 1 | 5 | 0 |
| CE2 | 347 | 4 | 2 | 0 |
| **Total** | **844** | **15** | **14** | **1** |

Un repère est **couvert** lorsque le support, la tâche et le critère d’évaluation permettent de travailler l’attendu retenu. Il est **partiel** lorsqu’il manque une composante du support, une mise en pratique ou une preuve de réalisation. **Absent** désigne un attendu ciblé sans tâche correspondante dans le périmètre indiqué. Les chiffres portent sur les repères examinés. La relecture pédagogique et la couverture de l’année se vérifient à leurs propres échelles. [Inventaire des ressources](couverture.csv) · [Procédure de relecture](VALIDATION_PEDAGOGIQUE.md)

## Passages entre les classes

| Passage | Point d’appui dans Klassia | Vérification à organiser |
|---|---|---|
| MS → GS | Écouter et identifier un personnage, puis restituer une suite d’actions | Faire raconter le début, le problème et la fin d’un récit nouveau. Observer l’ordre des faits et le degré d’aide. |
| GS → SIL | Tracer et reconnaître des lettres, puis les associer progressivement à des sons | Faire lire une syllabe et une petite phrase séparément. Observer le décodage et demander ensuite une information de sens. |
| SIL → CP → CE1 | En SIL, groupements autour de dix puis nombres jusqu’à vingt. En CE1, le premier chapitre mobilise les centaines. | Le CP se situe entre les deux niveaux et ne figure pas dans l’offre actuelle de Klassia. Relever les acquis en lecture de phrases, en écriture et en dizaines-unités avant la première unité CE1. [Fiche de positionnement](DIAGNOSTIC_ENTREE_CE1.md) |
| CE1 → CE2 | Passer d’un récit suivi et d’une production courte à un avis justifié et à des écrits plus différenciés | Vérifier que l’élève peut citer un détail du texte pour expliquer son avis et relire son écrit selon son destinataire. |

L’anglais est rapproché des références effectivement visées par les contenus. Les repères maternels utilisent Nursery One et Nursery Two, la SIL utilise Class 1 et le CE1 Class 3 pour les activités de langue. Le repère d’anglais du CE2 suit la discipline English Language du curriculum francophone. La comparaison avec Class 4 relève d’un travail distinct.

## Corrections à engager

1. **CE1, lecture et production écrite.** Construire un récit suivi avec les supports annoncés pour [CE1-U1-L01](../ce1/data/unit1.json). Pour [CE1-U6-L01](../ce1/data/unit6.json), fournir le début d’une histoire, deux fins à comparer et un corrigé qui permette de vérifier la fin rédigée par l’élève. La fiche de positionnement permet de choisir les reprises à l’entrée en CE1.
2. **MS, GS et SIL.** Pour la MS, expliciter le décalage entre les identifiants T5 et T6 et les thèmes animal et végétal du curriculum. En GS, relier les modèles d’écriture des chiffres 1 à 10 à une tâche chiffrée du thème des transports. En SIL, ajouter l’activité de distinction des couleurs primaires de l’unité 1. [GS et Bassa](GS_BASSA.md) · [Activités SIL de l’unité 1](../sil/data/sil-u1.json)
3. **Évaluations des arts et de la motricité.** En CE1, compléter les retours verbaux par l’observation d’une composition et d’un enchaînement de passes. Étendre ensuite le rapprochement aux autres attendus, avec les références et les décisions de relecture renseignées par repère.

Pour étendre la matrice, attribuer un identifiant interne à chaque nouvel attendu, indiquer la colonne de classe et la page imprimée, puis vérifier le support et le critère de réussite avant d’attribuer le statut. Une même ressource peut servir plusieurs repères. Les essais de terrain renseignent ensuite ce que l’élève réalise seul ou avec aide.

## Références

Les six documents ont été consultés dans des copies publiques du MINEDUB de 2018. Les pages de la matrice sont les numéros imprimés sur ces documents.

- [Maternelle francophone](https://fr.scribd.com/document/578040708/Programme-Maternel-2019-01) · [Nursery School, English Subsystem](https://www.readkong.com/page/cameroon-nursery-school-curriculum-english-subsystem-2018-5662948)
- [Primaire francophone, SIL–CP](https://s3.eu-west-2.amazonaws.com/ebase-bucket/branding/pages/01-Programme_Niveau_01__2019_01.pdf?v=1745409608) · [Primaire francophone, CE1–CE2](https://champions-edicef-cle.com/fichiers/Curriculum-CE.pdf)
- [Primary School, English Subsystem, Level I](https://s3.eu-west-2.amazonaws.com/ebase-bucket/branding/Cameroon-Primary-School-_Level_One.pdf?v=1744208110) · [Primary School, English Subsystem, Level II](https://s3.eu-west-2.amazonaws.com/ebase-bucket/branding/pages/Cameroon-Primary-School_English-Subsystem_Level2_class3-4.pdf?v=1744208191)
