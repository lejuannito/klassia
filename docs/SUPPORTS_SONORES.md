# Extraits sonores du pilote Klassia

Douze extraits de synthèse accompagnent des activités des cinq classes. Ouvrir le lecteur **Extrait Klassia hors connexion** après le téléchargement de l’édition. Il joue le même fichier sur chaque appareil. La commande **Voix de cet appareil** permet d’écouter d’autres textes. Ouvrir **Choisir et essayer une voix** pour sélectionner et préécouter une voix disponible en français ou en anglais. Le choix reste sur l’appareil. Les voix signalées comme dépendantes du réseau peuvent être indisponibles en mode avion. [Protocole d’essai](GUIDE_PILOTE.md#essai-sur-android-et-iphone)

| Leçon | Extrait et usage | Voix |
|---|---|---|
| `MS-T1-LC2` | Modèle « Je m’appelle Amina » et équivalent anglais. [FR](../assets/ms-t1-je-me-presente-fr.mp3) · [EN](../assets/ms-t1-je-me-presente-en.mp3) | Français et anglais britannique |
| `GS-T1-LC1` | Le récit du cahier retrouvé. Faire retrouver l’ordre des trois cartes après l’écoute. [FR](../assets/gs-t1-cahier-retrouve-fr.mp3) · [EN](../assets/gs-t1-cahier-retrouve-en.mp3) | Français et anglais britannique |
| `SIL-U4-L01` | « Lou a mal. » à écouter après un premier essai de lecture. [MP3](../assets/sil-u4-l01-lou-a-mal.mp3) | Français |
| `SIL-U4-L11` | Consigne de reproduction d’une figure sur quadrillage. [MP3](../assets/sil-u4-l11-modeles-quadrillage.mp3) | Français |
| `SIL-U5-L02` | Destination et moyen de transport à repérer à l’écoute. [MP3](../assets/sil-u5-l02-school-by-bus.mp3) | Anglais britannique |
| `CE1-U1-L01` | Passage de « L’album sous la table » à écouter pour retrouver un indice et un lieu. [MP3](../assets/ce1-u1-l01-marque-page.mp3) | Français |
| `CE1-U5-L03` | Départ et premier arrêt à retrouver dans un itinéraire oral. [MP3](../assets/ce1-u5-l03-from-library.mp3) | Anglais britannique |
| `CE1-U8-L03` | Deuxième message de l’entraînement, sur le club de musique. Le texte est dans le volet adulte. [MP3](../assets/ce1-u8-l03-music-club.mp3) | Anglais britannique |
| `FR-U7-L2-E2` · CE2 | Consigne pour écrire une notice en trois étapes. [MP3](../assets/ce2-u7-notice-cartes-fr.mp3) | Français |
| `EN-U7-L2-E2` · CE2 | Question sur l’action à effectuer si le ballon tombe. [MP3](../assets/ce2-u7-passing-game-en.mp3) | Anglais britannique |

Les extraits ont été générés à partir des textes de Klassia avec Piper 1.4.2, un facteur de durée de 1,10 et une normalisation ciblant −17 LUFS, puis encodés en MP3 mono à 24 kHz et 40 kbit/s. Ils représentent environ 365 ko. Le moteur et les modèles ont servi à la préparation des fichiers. Les MP3 sont vérifiés et téléchargés avec l’édition. [Piper](https://github.com/OHF-Voice/piper1-gpl)

## Lectures et dictées de SIL

Les 32 leçons de lecture de SIL (`SIL-U<n>-R1` à `R4`) ont un enregistrement du support à lire (`sil-u<n>-r<k>-lecture.mp3`) et de la dictée écoutée (`sil-u<n>-r<k>-ecoute-3.mp3`) : 63 extraits, environ 2,1 Mo. Chaque ligne du support est lue avec une pause de 0,8 s ; chaque élément de la dictée est lu seul, suivi de 1,6 s pour écrire. Ils ont été générés avec Piper 1.8.0 et le modèle `fr_FR-siwis-medium`, avec les mêmes réglages que ci-dessus. Pour qu’un son isolé soit prononcé et non épelé, la synthèse lit « hé » pour é, « eh » pour è et ê, « an » et « en » pour am et em, « mant » pour la syllabe man ; le texte affiché reste celui de la leçon. Les phonèmes produits ont été relus avant la synthèse ; l’écoute par des enfants et des enseignants reste à faire pendant le pilote.

Pour refaire ou compléter ces extraits : `python3 scripts/audio-sil.py --voices <dossier des modèles>` (paquet `piper-tts`, FFmpeg avec libmp3lame). Le script ne remplace pas un enregistrement existant et ajoute le champ `audio` à côté du texte.

La voix française utilise le modèle `fr_FR-siwis-medium`. Le corpus de Yamagishi, Honnet, Garner et Lazaridis est attribué à l’Université d’Édimbourg et diffusé sous CC BY 4.0. La voix anglaise utilise le modèle `en_GB-cori-medium` de Bryce Beattie, entraîné sur des enregistrements LibriVox indiqués comme relevant du domaine public dans la fiche du modèle. Klassia a utilisé ces modèles pour synthétiser ses propres textes. [Corpus SIWIS](https://doi.org/10.7488/ds/1705) · [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) · [Modèle SIWIS](https://huggingface.co/rhasspy/piper-voices/blob/e7229f7d33a10e145e109b886d661984201ac3c4/fr/fr_FR/siwis/medium/MODEL_CARD) · [Modèle Cori](https://huggingface.co/rhasspy/piper-voices/blob/e7229f7d33a10e145e109b886d661984201ac3c4/en/en_GB/cori/medium/MODEL_CARD)

Pendant le pilote, faire écouter les extraits sur les appareils retenus. Noter les mots mal compris, la vitesse perçue et le nombre d’écoutes nécessaires. Le référent bassa examine séparément les prises des locuteurs.

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

1. Ouvrir Klassia en HTTPS. Dans le **Carnet du pilote**, choisir **Prises bassa › Ouvrir l’atelier des prises bassa**. Si l’atelier propose **Passer en espace Enseignant**, choisir ce bouton. Le raccourci **Prises bassa** apparaît aussi dans les espaces adultes.
2. Dans **Enregistrer une prononciation**, choisir un des quatre raccourcis du pilote ou filtrer l’ensemble du lexique par code, mot ou forme. Choisir ensuite la forme. Utiliser la situation proposée pour préciser le sens avec le locuteur. Appuyer sur **Enregistrer au micro** et autoriser le micro dans le navigateur. Prononcer la forme puis appuyer sur **Arrêter la prise**. L’essai s’arrête automatiquement au bout de 12 secondes.
3. Réécouter, puis **Conserver la prise** ou refaire l’essai. Klassia garde une prise par forme et par profil sur cet appareil. Une nouvelle prise ne remplace la précédente qu’après avoir choisi **Remplacer la prise**.
4. Faire écouter la prise au référent sur le même appareil. Dans **Vérifier la prononciation**, renseigner son nom ou code, choisir **Prononciation et tons confirmés** ou **À reprendre**, puis **Enregistrer l’avis**. Si le locuteur autorise l’écoute par l’élève sur cet appareil, cocher cette option avant d’enregistrer. Le lecteur apparaît dans le lexique et les leçons associées avec le même profil. Une prise de remplacement demande un nouvel avis et un nouvel accord pour l’écoute.
5. Pour transmettre la prise, utiliser **Télécharger la source** et reporter l’avis dans le relevé privé. Le fichier utilise le format enregistré par le navigateur, par exemple WebM ou M4A. Conserver la source et le relevé avant d’effacer les données du site.

Ouvrir l’atelier avec la même adresse et le même profil pour retrouver les prises et leurs avis. Après téléchargement de l’édition, vérifier la capture et la réécoute en mode avion. Pour intégrer une prise aux leçons, conserver l’avis favorable et l’accord de diffusion dans le dossier privé, puis suivre la procédure d’intégration ci-dessous.

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

L’atelier accepte toutes les formes documentées du lexique. Après confirmation de la prononciation, développer **Préparer la diffusion sur tous les appareils**. Renseigner le sens et les codes de l’avis favorable et de l’accord de diffusion. **Télécharger le dossier de diffusion** regroupe la source et les références. Transmettre ce fichier en privé. Les justificatifs et le dossier source restent dans le suivi privé.

Depuis le dépôt, avec FFmpeg et l’encodeur libmp3lame, préparer puis réécouter le candidat. Consigner l’empreinte affichée uniquement après l’accord sur ce MP3. Réutiliser le même environnement FFmpeg pour l’intégration.

```sh
npm run bassa:diffusion -- preparer /chemin/prive/dossier.json /chemin/prive/candidat.mp3
npm run bassa:diffusion -- integrer /chemin/prive/dossier.json /chemin/prive/candidat.mp3 EMPREINTE_APPROUVEE
npm run validate && npm run build
```

Le script vérifie la forme, les références, la provenance du MP3 et son empreinte. Il prépare uniquement le MP3 public et sa fiche dans le lexique. Après revue et mise en ligne, l’extrait se charge avec l’édition et reste disponible hors connexion. Répéter l’opération pour chaque forme validée et autorisée.

La procédure manuelle reste possible.

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
