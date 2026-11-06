# Couverture du curriculum et progression des cinq classes

Relevé initial du 6 novembre 2026 au commit de référence [de701af](https://github.com/lejuannito/klassia/commit/de701af1fc9bb75f846f3370a44a3c3bdef0d41a), mis à jour le 7 novembre 2026. Le relevé examine 30 repères, soit six par classe. Il couvre le langage et la lecture, l’écriture, le calcul, les arts, la motricité et un repère d’anglais. La matrice part des attendus des tableaux du MINEDUB, puis rapproche les supports, consignes et retours réellement présents dans Klassia. [Matrice des 30 repères](MATRICE_CURRICULUM.csv)

| Classe | Ressources dans l’inventaire | Repères couverts | Partiels | Absents |
|---|---:|---:|---:|---:|
| Moyenne section | 160 | 5 | 1 | 0 |
| Grande section | 162 | 2 | 4 | 0 |
| SIL | 88 | 5 | 1 | 0 |
| CE1 | 87 | 3 | 3 | 0 |
| CE2 | 347 | 4 | 2 | 0 |
| **Total** | **844** | **19** | **11** | **0** |

Un repère est **couvert** lorsque le support, la tâche et le critère d’évaluation permettent de travailler l’attendu retenu. Il est **partiel** lorsqu’il manque une composante du support, une mise en pratique ou une preuve de réalisation. **Absent** désigne un attendu ciblé sans tâche correspondante dans le périmètre indiqué. Les chiffres portent sur les repères examinés. La relecture pédagogique et la couverture de l’année se vérifient à leurs propres échelles. [Inventaire des ressources](couverture.csv) · [Procédure de relecture](VALIDATION_PEDAGOGIQUE.md)

## Passages entre les classes

| Passage | Point d’appui dans Klassia | Vérification à organiser |
|---|---|---|
| MS → GS | Écouter et identifier un personnage, puis restituer une suite d’actions | Faire raconter le début, le problème et la fin d’un récit nouveau. Observer l’ordre des faits et le degré d’aide. |
| GS → SIL | Tracer et reconnaître des lettres, puis les associer progressivement à des sons | Faire lire une syllabe et une petite phrase séparément. Observer le décodage et demander ensuite une information de sens. |
| SIL → CP → CE1 | En SIL, groupements autour de dix puis nombres jusqu’à vingt. En CE1, le premier chapitre mobilise les centaines. | Le CP se situe entre les deux niveaux et ne figure pas dans l’offre actuelle de Klassia. Relever les acquis en lecture de phrases, en écriture et en dizaines-unités avant la première unité CE1. [Fiche de positionnement](DIAGNOSTIC_ENTREE_CE1.md) |
| CE1 → CE2 | Passer d’un récit suivi et d’une production courte à un avis justifié et à des écrits plus différenciés | Vérifier que l’élève peut citer un détail du texte pour expliquer son avis et relire son écrit selon son destinataire. |

L’anglais est rapproché des références effectivement visées par les contenus. Les repères maternels utilisent Nursery One et Nursery Two, la SIL utilise Class 1 et le CE1 Class 3 pour les activités de langue. Le repère d’anglais du CE2 suit la discipline English Language du curriculum francophone. La comparaison avec Class 4 relève d’un travail distinct.

## Corrections du CE1

La lecture de l’U1 s’appuie sur un récit original en trois épisodes, des cartes illustrées et une réponse qui demande un indice du texte. En U6, l’élève compare deux fins, écrit sa propre suite et la relit avec quatre critères. L’observation en classe précisera le degré d’aide nécessaire. [Lecture U1](../ce1/data/unit1.json) · [Production écrite U6](../ce1/data/unit6.json) · [Fiche de positionnement](DIAGNOSTIC_ENTREE_CE1.md)

## Corrections en MS, GS et SIL

| MS dans Klassia | Thème du programme francophone MINEDUB, première année |
|---|---|
| T5 · Les plantes | 6 · Le monde végétal |
| T6 · Les animaux | 5 · Le monde animal |

La correspondance s’affiche dans le parcours MS et à l’ouverture de chaque thème. Les codes Klassia restent les clés des liens et de la progression enregistrée. En GS, T5 et T6 suivent l’ordre du programme. [Curriculum maternel francophone, tableau 17, p. 66–67](https://fr.scribd.com/document/578040708/Programme-Maternel-2019-01)

- **GS, thème des transports.** L’enfant complète les numéros manquants des places du bus, puis écrit la suite entière de 1 à 10. Le cahier du thème fournit les dix modèles à repasser. L’adulte observe l’ordre, la lisibilité des chiffres et l’écriture de 10. [Activité GS-T8-ST2](../gs/data/themes/T8.json)
- **SIL, unité 1.** L’enfant repère le rouge, le jaune et le bleu dans un nuancier de cinq couleurs, puis les utilise pour colorier trois éléments de la maison. Le corrigé sert à vérifier le classement et le dessin. [Leçon SIL-U1-L07](../sil/data/sil-u1.json)

## Corrections à engager

En CE1, compléter les retours verbaux par l’observation d’une composition en arts et d’un enchaînement de passes en motricité. Étendre ensuite le rapprochement aux autres attendus, avec les références et les décisions de relecture renseignées par repère.

Pour étendre la matrice, attribuer un identifiant interne à chaque nouvel attendu, indiquer la colonne de classe et la page imprimée, puis vérifier le support et le critère de réussite avant d’attribuer le statut. Une même ressource peut servir plusieurs repères. Les essais de terrain renseignent ensuite ce que l’élève réalise seul ou avec aide.

## Références

Les six documents ont été consultés dans des copies publiques du MINEDUB de 2018. Les pages de la matrice sont les numéros imprimés sur ces documents.

- [Maternelle francophone](https://fr.scribd.com/document/578040708/Programme-Maternel-2019-01) · [Nursery School, English Subsystem](https://www.readkong.com/page/cameroon-nursery-school-curriculum-english-subsystem-2018-5662948)
- [Primaire francophone, SIL–CP](https://s3.eu-west-2.amazonaws.com/ebase-bucket/branding/pages/01-Programme_Niveau_01__2019_01.pdf?v=1745409608) · [Primaire francophone, CE1–CE2](https://champions-edicef-cle.com/fichiers/Curriculum-CE.pdf)
- [Primary School, English Subsystem, Level I](https://s3.eu-west-2.amazonaws.com/ebase-bucket/branding/Cameroon-Primary-School-_Level_One.pdf?v=1744208110) · [Primary School, English Subsystem, Level II](https://s3.eu-west-2.amazonaws.com/ebase-bucket/branding/pages/Cameroon-Primary-School_English-Subsystem_Level2_class3-4.pdf?v=1744208191)
