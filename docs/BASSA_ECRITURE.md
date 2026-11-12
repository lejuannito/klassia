# Bassa — repères d’écriture et saisie

_Lot 8b — novembre 2026_

## Ce qui a été trouvé

| Référence | Ce qu’elle apporte |
|---|---|
| Paul Roger Bassong et Anne Zribi-Hertz, « Le basaa », projet *Langues et Grammaires du Monde dans l’Espace Francophone*, CNRS, 2024 (HAL 04455092) — <https://lgidf.cnrs.fr/sites/lgidf.cnrs.fr/files/images/BASAA_A5.pdf> | Sept voyelles (i, e, ɛ, a, ɔ, o, u) ; lettres ɓ, ŋ, ɲ ; tj et dj ; cinq tons (haut, moyen, bas, haut-bas, bas-haut) et leur écriture ; une vingtaine d’exemples glosés. Les auteurs disent suivre l’alphabet général des langues camerounaises. Variété décrite : mbɛnɛ. |
| Alphabet général des langues camerounaises (Tadadjeu et Sadembouo, 1979, rééd. 1984), d’après l’article de Wikipédia en anglais | Principes communs : signes de ton, voyelles longues doublées. Le texte d’origine n’a pas pu être consulté. |

Ces repères sont dans `data/bassa-ecriture.json`, avec leur source pour chaque ligne et le statut `documented_pending_review`. **Ils ne valident aucune forme du lexique Klassia** et aucun locuteur référent ne les a relus.

## Ce qui change dans l’application

- **Atelier Bassa** (`#bassa`) : un encart « Écrire le bassa : lettres et tons » affiche les lettres, les cinq tons avec un exemple, des mots de la référence et les questions ouvertes pour le relecteur.
- **Touches** : sous chaque champ de réponse bassa (leçons et atelier), neuf touches insèrent ɓ, ŋ, ɲ, ɛ, ɔ et les quatre signes de ton. Les claviers de téléphone n’ont pas ces signes.
- **Saisie sans tons** : une réponse identique à une forme proposée, mais sans les marques de ton, est acceptée avec le rappel « Forme proposée : … ». Les lettres ne sont pas rapprochées : `n` ne vaut pas `ñ` ni `ŋ`, `e` ne vaut pas `ɛ`. L’acceptation exacte de toutes les variantes ne change pas.

La saisie sans tons est une proposition de Klassia, dans l’esprit de la règle « une annotation, pas une pénalité ». Le porteur de projet ou le relecteur peut la retirer : elle tient dans `tonelessMatch` (`shared/bassa.js`).

## Questions pour le relecteur

1. Ton moyen : sans accent (référence de 2024) ou avec macron (alphabet général) ? Le lexique contient les deux usages.
2. `ñ` et `ny` des sources anciennes : à réécrire `ŋ` et `ɲ` ?
3. Voyelles doubles : deux voyelles avec chacune son ton, ou une voyelle longue ?
4. Quelle variété retenir comme forme principale, et laquelle signaler comme variante ?
5. La consonne β notée par la référence a-t-elle sa place dans l’écriture scolaire ?

## Ce qui reste

- Choisir une **forme principale** par mot quand le relecteur aura répondu ; les autres formes resteront acceptées.
- Exercice d’écoute sur les mots dont l’enregistrement est publié.
- Texte d’origine de l’alphabet général (non accessible depuis cet environnement).
