# Extraits sonores du pilote Klassia

Deux clips de synthèse créés à partir des textes de Klassia sont intégrés à l’édition pilote. Le lecteur de la fiche peut les rejouer après le téléchargement de l’édition, y compris en mode avion. La commande générale « Écouter » utilise la voix de l’appareil. [Protocole d’essai](GUIDE_PILOTE.md#essai-sur-android-et-iphone)

| Leçon | Extrait et usage | Voix de synthèse |
|---|---|---|
| `SIL-U4-L01` | « Lou a mal. » à écouter après un premier essai de lecture. [MP3](../assets/sil-u4-l01-lou-a-mal.mp3) | `fr-fr`, français |
| `CE1-U8-L03` | Deuxième message de l’entraînement, sur le club de musique. Le texte reste dans le volet adulte. [MP3](../assets/ce1-u8-l03-music-club.mp3) | `en-gb`, anglais britannique |

Les deux phrases ont été générées à 142 mots par minute avec eSpeak NG (distribution JavaScript 1.0.2), puis normalisées et encodées en MP3 mono à 24 kHz et 48 kbit/s. Les deux clips totalisent environ 45 ko. Le service worker les inclut dans la vérification d’intégrité de l’édition et sert les plages d’octets demandées par le lecteur. [eSpeak NG](https://github.com/espeak-ng/espeak-ng) · [Distribution utilisée](https://www.npmjs.com/package/espeak-ng/v/1.0.2) · [Lecture de médias en cache](https://developer.chrome.com/docs/workbox/serving-cached-audio-and-video)

Faire écouter les deux voix pendant le pilote. Noter les mots difficiles à comprendre et le nombre d’écoutes nécessaires pour retrouver l’information.

## Préparer les prises bassa

Commencer par quatre entrées de l’école, `BA002` (salle de classe), `BA004` (enseignant ou enseignante), `BA005` (livre) et `BA006` (crayon). Le lexique contient les formes documentées et leurs sources. Choisir avec le référent les formes à prononcer et rattacher chacune à l’entrée et au sens précis. Une variante documentée reste recevable dans les exercices. [Lexique](../data/bassa-lexicon-variants.json) · [Suivi de la revue bassa](GS_BASSA.md)

1. Demander au locuteur son accord pour enregistrer et diffuser sa voix. Conserver l’accord et les coordonnées dans le suivi privé du projet.
2. Enregistrer une prise par forme retenue et garder un fichier source WAV. Relever l’identifiant lexical, la forme exacte avec ses signes, le sens, la variété régionale si elle est connue et la date de la prise.
3. Faire réécouter chaque prise par le référent. Relever le résultat pour la prononciation, les tons, la correspondance avec la graphie et l’intelligibilité. Reprendre les clips à corriger.
4. Après confirmation du référent et de l’accord de diffusion, encoder le clip public, ajouter l’attribution autorisée et vérifier sa lecture dans l’activité hors connexion.
