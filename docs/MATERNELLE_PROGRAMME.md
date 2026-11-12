# Maternelle — repères du programme et parcours

_Lot 6c — novembre 2026_

Ce document dit comment les activités de Moyenne section (MS) et de Grande section (GS) sont rattachées au programme, et ce que signifient les deux repères affichés sur chaque fiche : **Programme** et **Pour aller plus loin**.

Les correspondances sont des **propositions de l’équipe Klassia, à relire**. Elles ne valent pas certification de conformité et n’ont été validées par aucun enseignant ni inspecteur.

## Source

*Curriculum de l’enseignement maternel francophone camerounais*, MINEDUB, 2018 (113 pages). Deux années : la première correspond à la MS, la deuxième à la GS. Huit thèmes de vie par année.

Copie consultée en ligne : <https://www.slideshare.net/slideshow/maternel-curriculum-pour-l-education-nationale-pdf/283028493>. Le document n’est pas copié dans le dépôt ; seuls les numéros de tableaux, les pages et des reformulations courtes sont utilisés.

Le programme anglophone (*Cameroon Nursery School Curriculum*) n’a pas été retrouvé en entier. Les nouvelles activités de GS ne citent donc que le programme francophone ; les anciennes gardent leur double référence.

## Thèmes

| Programme | Thème de vie | Klassia MS | Klassia GS |
|---|---|---|---|
| 1 | L’école | T1 | T1 |
| 2 | Le corps humain | T2 | T2 |
| 3 | La famille et l’habitation | T3 | T3 |
| 4 | Les fêtes | T4 | T4 |
| 5 | Le monde animal | **T6** | T5 |
| 6 | Le monde végétal | **T5** | T6 |
| 7 | Les métiers | T7 | T7 |
| 8 | Les moyens de transport | T8 | T8 |

En MS, les thèmes 5 et 6 sont inversés par rapport au programme (l’accueil du thème l’indique). Les identifiants ne sont pas renommés.

## Tableaux du programme et activités rattachées

Chaque activité cite un tableau de « distribution des ressources » dans `source_refs`, par exemple `FR : tableau 17, p. 63–71, première année`. La fiche l’affiche sous « Repères du curriculum ».

| Tableau | Discipline | Pages | MS | GS |
|---|---|---|---|---|
| 9 | Langage | 37–40 | 22 | 8 |
| 10 | Contes | 41–43 | 8 | 8 |
| 11 | Comptines et poésie | 44–46 | 3 | 8 |
| 12 | Graphisme | 47–48 | 8 | 8 (avec 13) |
| 13 | Initiation à la lecture et à l’écriture | 49–51 | 6 | 5 + 8 (avec 14) |
| 14 | Anglais | 52–56 | dans chaque activité | 8 (avec 13) |
| 15 | Langues nationales | 57–58 | 8 | 8 |
| 16 | Expression gestuelle | 59–62 | 6 | — |
| 17 | Mathématiques | 63–71 | 20 | 18 |
| 18 | Éducation sensorielle | 72–76 | 7 | 8 |
| 19 | TIC | 77–78 | 2 | 8 |
| 20 | Sciences | 79–80 | 5 | 8 (20 à 22) |
| 21 | Technologies | 81–83 | 4 | voir 20 |
| 22 | Activités agro-pastorales | 84–86 | 6 | voir 20 |
| 23 | Santé et nutrition | 87–90 | 8 | 8 (23 et 24) |
| 24 | Environnement | 91–93 | 5 | voir 23 |
| 25 | Éducation civique et morale | 94–95 | 7 | 8 |
| 26 | Sécurité | 96–97 | 12 | 8 |
| 27 | Dessin, coloriage, peinture, musique, danse | 98–100 | 14 | 24 (27 et 28) |
| 28 | Activités manuelles | 101–105 | 8 | voir 27 |
| 29 | Motricité | 106–109 | 9 | 24 |
| | **Total** | | **168** | **167** |

L’anglais de MS n’a pas d’activité séparée : chaque activité existe en français et en anglais.

## Les deux parcours

- **Programme · 1re année** (MS) ou **Programme · 2e année** (GS) : l’activité travaille un contenu que le programme prévoit pour cette année. C’est le parcours de base. « À faire maintenant » propose ces activités en premier.
- **Pour aller plus loin** : l’activité dépasse ce que le programme demande cette année, ou dépend d’un choix de l’école ou de la famille. Elle porte `"path": "plus"` dans les données.

| Classe | Programme | Pour aller plus loin |
|---|---|---|
| MS | 149 | 19 |
| GS | 143 | 24 |

Activités « pour aller plus loin » :

- **MS** — les huit découvertes du bassa (une par thème : le programme demande une langue nationale sans la nommer, et les formes bassa attendent un relecteur) ; `T2-PV3`, `T3-PV4`, `T4-LC5`, `T4-PV3`, `T4-PV4`, `T5-ST3`, `T7-LC5`, `T7-PV3`, `T7-PV4`, `T8-LC5`, `T8-ST3`.
- **GS** — les huit lectures en anglais (`GS-T*-LC3`) et les huit activités de bassa (`GS-T*-LC6`) ; le comptage au-delà de 10 (`GS-T4-ST1` à `GS-T8-ST1`) ; `GS-T1-ST6` (jours de la semaine), `GS-T4-ST6` (mois et calendrier), `GS-T6-ST2` (mesurer avec une unité).

Ce classement est une proposition. Un enseignant de maternelle peut le corriger activité par activité : il suffit d’ajouter ou de retirer `"path": "plus"`.

## Activités ajoutées pour combler des manques

Le programme prévoit des contenus que Klassia ne couvrait pas. Treize activités originales ont été ajoutées à la fin de leur domaine (les adresses existantes ne changent pas).

| Classe | Activité | Contenu | Tableau |
|---|---|---|---|
| MS | `T4-LC8` | reconnaître la lettre o | 13 |
| MS | `T6-LC8` | reconnaître la lettre a | 13 |
| MS | `T5-LC8` | lire et écrire i | 13 |
| MS | `T7-LC8` | lire et écrire u | 13 |
| MS | `T8-LC8` | copier son prénom | 13 |
| MS | `ST5` (T1) | outils pour communiquer | 19 |
| MS | `T7-ST5` | jeu du téléphone | 19 |
| MS | `T4-ST5` | soleil, lune, étoiles | 20 |
| GS | `GS-T4-LC7` | lire et écrire o et a | 13 |
| GS | `GS-T5-LC7` | lire et écrire i et u | 13 |
| GS | `GS-T6-LC7` | e et révision des voyelles | 13 |
| GS | `GS-T7-LC7` | la lettre b et ses syllabes | 13 |
| GS | `GS-T8-LC7` | p et t, syllabes et mots | 13 |

## Ce qui reste

- Relecture du classement et des treize activités par un enseignant de maternelle.
- MS : les TIC n’ont que deux activités ; l’expression gestuelle et les comptines sont peu représentées dans certains thèmes.
- GS : pas d’activité propre à l’expression gestuelle (tableau 16).
- Références au programme anglophone à compléter quand le document entier sera disponible.
- Images et voix enregistrées pour les consignes.

## Contrôles

`npm run validate` vérifie que chaque activité de maternelle cite un tableau entre 9 et 29, que `path` vaut `plus` ou est absent, et les totaux par parcours. `tests/browser.cjs` vérifie l’affichage des deux repères, la référence au tableau et l’ordre proposé par « À faire maintenant ».
