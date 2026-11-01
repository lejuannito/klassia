# Lecture vocale et français CE2

## Comportement attendu

Dans une leçon française, utiliser **Écouter en français**. Dans une leçon anglaise, utiliser **Listen in English**. Les activités bilingues MS/GS proposent les deux commandes, chacune attachée au texte correspondant. Les compléments SIL « English · … » sont aussi reconnus comme anglais. Les récits et poèmes du nouveau lot CE2 disposent d’un bouton de lecture propre au support.

Le moteur demande explicitement une voix de la langue correspondante, en privilégiant la variante exacte et, à variante égale, une voix locale. Une autre variante du français peut être utilisée si nécessaire, mais pas l’anglais. Il attend brièvement une liste de voix différée et affiche un message si aucune voix adaptée n’est disponible. **Arrêter / Stop** et le changement de page annulent la lecture en cours ou en attente.

Si la voix française manque, ouvrir les réglages de synthèse vocale de l’appareil, activer ou télécharger une voix française, puis réessayer. Les noms des menus dépendent de l’appareil et du moteur vocal. La disponibilité hors connexion dépend de la voix installée. Les pages et contenus sont mis en cache, pas les voix du système.

Les propositions bassa restent lisibles et utilisables dans les exercices. Elles ne sont pas confiées à une voix française ou anglaise : des enregistrements à prononciation vérifiée restent à produire.

## Choix technique

`shared/speech.js` centralise la sélection via `speechSynthesis.getVoices()`, l’écoute de `voiceschanged`, l’affectation de `SpeechSynthesisUtterance.voice` et de `lang`, les messages et l’annulation. L’ancien code ne fixait que `lang`, sans choisir explicitement une voix. Référence de l’API : [Web Speech API — Speech Synthesis](https://webaudio.github.io/web-speech-api/#speechsynthesis).

Les 39 leçons françaises U4–U8 gardent leurs identifiants et références curriculaires. Leurs 78 exercices conservent leurs identifiants. Les supports sont originaux ; les modèles de dictée se trouvent dans un panneau fermé par défaut et doivent être cachés pendant l’écriture. Les corrections restent consultables à la demande.

## Vérifications reproductibles

- `npm test` : sélection de langue/variante, absence de voix compatible, stockage, hors-ligne et bassa.
- `npm run catalog && npm run audit:content && npm run validate && npm run build` : inventaire, structure, syntaxe et manifeste hors connexion.
- `npm run test:browser` : navigation et fonctionnement hors connexion.
- `npm run test:gs` : parcours GS et 45 panneaux bassa.
- `npm run test:speech` : moteur vocal simulé avec anglais par défaut, français disponible/différé/absent, arrêt, navigation, parcours des cinq classes, exclusion de synthèse bassa et affichage des 39 leçons réécrites.

Les tests de sélection utilisent des voix simulées. Ils ne certifient pas la qualité sonore d’un téléphone physique ni la justesse d’une prononciation bassa.
