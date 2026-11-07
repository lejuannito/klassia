# Extraits sonores du pilote Klassia

Six clips de synthèse créés à partir des textes de Klassia sont intégrés à l’édition pilote. Le lecteur de la fiche peut les rejouer après le téléchargement de l’édition, y compris en mode avion. La commande générale « Écouter » utilise la voix de l’appareil. [Protocole d’essai](GUIDE_PILOTE.md#essai-sur-android-et-iphone)

| Leçon | Extrait et usage | Voix de synthèse |
|---|---|---|
| `SIL-U4-L01` | « Lou a mal. » à écouter après un premier essai de lecture. [MP3](../assets/sil-u4-l01-lou-a-mal.mp3) | `fr-fr`, français |
| `SIL-U4-L11` | Consigne de reproduction d’une figure sur quadrillage. [MP3](../assets/sil-u4-l11-modeles-quadrillage.mp3) | `fr-fr`, français |
| `SIL-U5-L02` | Destination et moyen de transport à repérer à l’écoute. [MP3](../assets/sil-u5-l02-school-by-bus.mp3) | `en-gb`, anglais britannique |
| `CE1-U1-L01` | Passage de « L’album sous la table » à écouter pour retrouver un indice et un lieu. [MP3](../assets/ce1-u1-l01-marque-page.mp3) | `fr-fr`, français |
| `CE1-U5-L03` | Départ et premier arrêt à retrouver dans un itinéraire oral. [MP3](../assets/ce1-u5-l03-from-library.mp3) | `en-gb`, anglais britannique |
| `CE1-U8-L03` | Deuxième message de l’entraînement, sur le club de musique. Le texte reste dans le volet adulte. [MP3](../assets/ce1-u8-l03-music-club.mp3) | `en-gb`, anglais britannique |

Les textes ont été générés à 142 mots par minute avec eSpeak NG (distribution JavaScript 1.0.2), puis normalisés et encodés en MP3 mono à 24 kHz et 48 kbit/s. Les six clips totalisent environ 212 ko. Le service worker les inclut dans la vérification d’intégrité de l’édition et sert les plages d’octets demandées par le lecteur. [eSpeak NG](https://github.com/espeak-ng/espeak-ng) · [Distribution utilisée](https://www.npmjs.com/package/espeak-ng/v/1.0.2) · [Lecture de médias en cache](https://developer.chrome.com/docs/workbox/serving-cached-audio-and-video)

Faire écouter les six extraits lors de la vérification finale sur téléphone. Noter les mots difficiles à comprendre et le nombre d’écoutes nécessaires pour retrouver l’information.

## Préparer les prises bassa

Commencer par quatre entrées de l’école, `BA002` (salle de classe), `BA004` (enseignant ou enseignante), `BA005` (livre) et `BA006` (crayon). Le lexique contient les formes documentées et leurs sources. Choisir avec le référent les formes à prononcer et rattacher chacune à l’entrée et au sens précis. Une variante documentée reste recevable dans les exercices. [Lexique](../data/bassa-lexicon-variants.json) · [Suivi de la revue bassa](GS_BASSA.md)

| Entrée | Formes à examiner avec le référent | Contexte pour préparer la prise |
|---|---|---|
| `BA002` | `Ndap sukulu`, `Ndap yigil` | Montrer une salle de classe et préciser le contexte d’emploi des formes retenues. |
| `BA004` | `málêt`, `malet`, `mhiet` | Montrer la personne qui enseigne. Distinguer les variantes prononcées des graphies ou transcriptions anciennes. |
| `BA005` | `káat`, `Kaat añ` | Présenter un livre puis un livre de lecture. Préciser le sens auquel correspond chaque prise. |
| `BA006` | `Liwindi` | Montrer un crayon et confirmer la forme retenue pour cet objet. |

1. Demander au locuteur son accord pour enregistrer et diffuser sa voix. Conserver l’accord et les coordonnées dans le suivi privé du projet.
2. Enregistrer une prise par forme retenue. Relever l’identifiant lexical, la forme exacte avec ses signes, le sens, la variété régionale si elle est connue et la date de la prise.
3. Faire réécouter chaque prise par le référent. Relever le résultat pour la prononciation, les tons, la correspondance avec la graphie et l’intelligibilité. Reprendre les clips à corriger.
4. Après confirmation du référent et de l’accord de diffusion, encoder le clip public, ajouter l’attribution autorisée et vérifier sa lecture dans l’activité hors connexion.

### Enregistrer au micro dans Klassia

1. Ouvrir Klassia en HTTPS. Choisir **Espace Enseignant** ou **Administration locale**, puis **Validation pédagogique › Ouvrir l’atelier Bassa**.
2. Dans **Enregistrer une prononciation**, choisir l’entrée et la forme. Utiliser la situation proposée pour préciser le sens avec le locuteur. Appuyer sur **Enregistrer au micro** et autoriser le micro dans le navigateur. Prononcer la forme puis appuyer sur **Arrêter la prise**. L’essai s’arrête automatiquement au bout de 12 secondes.
3. Réécouter, puis **Conserver la prise** ou refaire l’essai. Klassia garde une prise par forme et par profil sur cet appareil. Une nouvelle prise ne remplace la précédente qu’après avoir choisi **Remplacer la prise**.
4. Faire écouter la prise au référent sur le même appareil. Pour la transférer ou préparer sa diffusion, utiliser **Télécharger la source** et noter le nom généré dans le relevé. Le fichier utilise le format enregistré par le navigateur, par exemple WebM ou M4A. Conserver la source téléchargée avant d’effacer les données du site.

Ouvrir l’atelier avec la même adresse et le même profil pour retrouver les prises. Sauvegarder les sources avec **Télécharger la source**, séparément de la sauvegarde des progrès. Après téléchargement de l’édition, vérifier également la capture et la réécoute en mode avion. Les prises de l’atelier sont des brouillons locaux. La revue linguistique et l’accord de diffusion restent nécessaires pour les intégrer aux leçons.

Si un locuteur propose un autre contexte d’emploi ou si une variante prête à confusion, utiliser le lien **Proposer une autre situation ou signaler une difficulté**. Il ouvre le carnet sur le code de l’entrée choisie. Réserver la décision linguistique et les justificatifs d’accord au dossier privé de la prise.

### Relevé privé des prises

Avant la séance, montrer l’objet ou la scène et faire préciser au référent la forme à enregistrer. Prendre deux essais dans une pièce calme, avec une courte pause avant et après le mot. Si le référent demande une phrase pour apprécier les tons en contexte, conserver cet essai dans le dossier privé. Retenir un fichier par forme effectivement validée.

| Identifiant de la prise | Forme retenue et sens précis | Contrôle du référent | Accord de diffusion | Décision |
|---|---|---|---|---|
| `BA002` | Salle de classe · à préciser | À faire | À recueillir | En attente |
| `BA004` | Enseignant(e) · à préciser | À faire | À recueillir | En attente |
| `BA005` | Livre ou livre de lecture · à préciser | À faire | À recueillir | En attente |
| `BA006` | Crayon · à préciser | À faire | À recueillir | En attente |

Dupliquer une ligne si le référent retient une deuxième forme. Consigner le nom du fichier source, la date, la variété régionale si connue, le nom du référent et son avis sur la prononciation, les tons, la graphie, le sens et l’intelligibilité. Garder la source, l’avis et l’accord dans le dossier privé. Relever le crédit que le locuteur autorise à publier, le cas échéant.

### Intégration des prises autorisées

1. Exporter le MP3 mono à 24 kHz et 48 kbit/s. Retirer les métadonnées du fichier source. Réécouter le MP3 avec le référent et conserver dans le dossier privé son empreinte et les références de l’avis et de l’accord couvrant cette prise.
2. Ajouter le MP3 à `assets/` et renseigner le tableau facultatif `recordings` dans l’entrée correspondante de `data/bassa-lexicon-variants.json`. Pour une graphie corrigée par le référent, documenter d’abord cette forme dans le lexique en conservant les variantes documentaires existantes.

| Champ d’une prise | Valeur attendue |
|---|---|
| `form` | Graphie exacte dans `forms`, avec les signes tonals |
| `sense` | Sens effectivement prononcé, par exemple « livre de lecture » |
| `src` | Chemin depuis la racine, par exemple `assets/bassa-ba002-01.mp3` |
| `reviewed_on` | Date de confirmation du référent au format `AAAA-MM-JJ` |
| `review_ref`, `consent_ref` | Codes de l’avis favorable et de l’accord de diffusion conservés en privé. Utiliser des lettres, des chiffres, des tirets ou des soulignés, sans nom ni coordonnées. |
| `sha256` | Empreinte du MP3 exact autorisé, en 64 caractères hexadécimaux minuscules |
| `credit` | Attribution publique convenue, si applicable |

3. Exécuter `npm run validate` et `npm run build` avant de proposer la diffusion. La construction vérifie la correspondance avec l’entrée, la présence des deux références et l’empreinte du MP3. Elle bloque les fichiers de la série sans fiche publiable. Le lecteur s’affiche dans les leçons qui utilisent l’entrée, sous les variantes écrites.
4. Faire le contrôle d’écoute en ligne puis en mode avion sur la leçon CE2 `BA-U3-L1`, qui réunit les quatre entrées. Les mêmes prises sont reprises dans les leçons liées des autres classes. [Essai sur Android et iPhone](GUIDE_PILOTE.md#essai-sur-android-et-iphone)
