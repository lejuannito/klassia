# Piste anglophone — cartographie des programmes

_Établie le 11 novembre 2026 à partir des programmes reçus. Sert de base aux lots A2 et suivants ; décision structurante : [ADR-013](DECISIONS.md)._

## Sources

| Programme | Classes | Statut |
|---|---|---|
| Cameroon Primary School Curriculum, English Subsystem, Level I, MINEDUB, 2018 | Class 1, Class 2 | Reçu, lisible (86 pages) |
| Cameroon Primary School Curriculum, English Subsystem, Level II, MINEDUB, 2018 | Class 3, Class 4 | Reçu, lisible (99 pages) |
| Cameroon Nursery School Curriculum, English Subsystem, 2018 | Nursery One, Nursery Two | Transcription partielle seulement : insuffisante pour construire les deux classes |

Les PDF restent hors du dépôt ; Klassia cite le tableau, la classe et la page, sans reproduire le texte.

## Ce qui rend la jumelle possible

- **Les mêmes huit thèmes intégrés**, un par mois, pour les classes 1 à 4 (Level I et II, tableau 18) : The home, The village/town, The school, Occupations, Travelling, Health, Games, Communication. Ce sont les centres d’intérêt des unités 1 à 8 de la SIL, du CE1 et du CE2. La passerelle « même thème, même mois » est donc directe : l’unité *n* francophone et le thème *n* anglophone parlent du même sujet.
- **Une structure comparable** : dix matières, des contenus classés par composante, des résultats attendus et une méthodologie.

## Ce qui les distingue

Les classes jumelles ne sont pas des traductions : les contenus et leur rythme diffèrent.

| | Francophone | Anglophone |
|---|---|---|
| Nombres en 1re année | SIL : 0 à 20, monnaie jusqu’à 15 F | Class 1 : 0 à 100, quatre opérations, tables de multiplication, monnaie jusqu’à 100 F, fractions |
| Nombres, 3e et 4e année | CE1 : jusqu’à 9 999 ; CE2 : jusqu’à 10 000 et au-delà | Class 3 : jusqu’à 500 (place value jusqu’aux milliers), fractions ; Class 4 : jusqu’à 5 000, PGCD/PPCM, nombres premiers, priorités opératoires (BODMAS) |
| Langue d’enseignement | Français ; l’anglais est une matière | Anglais ; le français est une matière (4,5 h par semaine) |
| Langue anglaise | Quatre composantes (écoute et expression, lecture, écriture, grammaire et vocabulaire) | Level I : écoute et expression (phonics), lecture, écriture ; Level II : en plus grammaire, vocabulaire et prononciation, et **littérature** (récits d’aventure, prose, bandes dessinées, comptines) |
| Organisation | Contenus déjà répartis par unité dans les programmes | Contenus donnés **par classe et par composante**, sans répartition par thème : la répartition sur les huit thèmes est à construire, comme pour le CE1 par savoir |

## Matières et horaires (Level I et II, régime à plein temps, heures par semaine)

| Matière | Heures | Tableau des contenus (Level I / Level II) |
|---|---:|---|
| English Language (and Literature) | 7,5 | 20 / 20 |
| Mathematics | 3 | 21 / 21 |
| Science and Technology | 3 | 22 / 22 |
| Français | 4,5 | 23 / 23 |
| Citizenship (Level I) · Social Studies (Level II) | 1,5 | 24 / 24 |
| Vocational Studies | 3 | 25 / 25 |
| Arts | 1,5 | 26 / 26 |
| Physical Education and Sports | 1,5 | 27 / 27 |
| National Languages and Cultures | 1,5 | 28 / 28 |
| ICTs | 3 | 29 / 29 |

Composantes de Mathematics (les deux niveaux) : Sets and Logic ; Numbers and Operations ; Measurement and Size ; Geometry and Space ; Graphs and Statistics.

## Plan de construction proposé

Chaque classe jumelle reprend le moteur de la SIL et du CE1 (`shared/learning-app.js`), ses formats vérifiés et ses QCM reliés, avec ses propres catalogues (`subsystem: anglophone`, `language: en`, `twin` vers la classe francophone). Ordre proposé, du plus utile au plus coûteux :

| Lot | Contenu | Volume estimé |
|---|---|---|
| A2 | Interface en anglais pour les classes anglophones (navigation, fiches parent, corrections) ; catalogue Class 1 avec ses huit thèmes | **fait** : `shared/i18n.js` (ADR-017), `class1/`, registre `upcoming` |
| A3 | Class 1 : English Language et Mathematics, quatre leçons par thème et par matière | **fait** : 64 leçons en relecture (`class1/data/unit1.json` à `unit8.json`), d’après les colonnes Class 1 des tableaux 20 (p. 41–47) et 21 (p. 48–50) |
| A4 | Class 1 : les huit autres matières, une leçon par thème | **fait** : 64 leçons en relecture, d’après les colonnes Class 1 des tableaux 22 à 29 (p. 51–77) ; Français en français avec gloses anglaises ; langues nationales par notions, dans la langue de la famille |
| A5 | Class 3 (jumelle du CE1), même découpage, avec la littérature | environ 130 leçons |
| A6 | Class 4 (jumelle du CE2) | environ 130 leçons |
| A7 | Nursery One et Two | bloqué : programme complet manquant |

Chaque leçon cite le tableau, la classe et la page du programme et reste au statut `in_review` jusqu’à la relecture d’un enseignant du sous-système anglophone. La relecture par un enseignant anglophone est la condition pour publier ces classes.
