# Klassia — prochain travail

_Mise à jour : 2 novembre 2026_

Ce fichier sert de **file d’attente courte** pour les prochaines sessions. Il ne remplace pas `docs/TRAJECTOIRE.md`.

## Lot prioritaire — correctif ciblé

### 1. Audio français sur appareil réel

Constat du pilote : sur un téléphone réel, Klassia affiche qu’aucune voix française n’a été trouvée. Les tests automatisés actuels utilisent des voix simulées et ne reproduisent donc pas nécessairement le comportement du navigateur/appareil.

Objectif : diagnostiquer le comportement réel de `speechSynthesis` sur navigateur mobile et rendre la lecture française plus robuste **sans basculer silencieusement vers une voix anglaise**.

Attendus :

- analyser `shared/speech.js`, `tests/speech-browser.cjs` et `docs/AUDIO_FR_CE2.md` ;
- distinguer absence réelle de moteur/voix française, liste de voix non exposée ou chargée tardivement, et échec de synthèse ;
- prévoir une stratégie de repli sûre lorsque le navigateur sait synthétiser `fr-FR` sans exposer explicitement une voix française ;
- conserver un message clair lorsque la synthèse française est réellement impossible ;
- ajouter des tests couvrant le cas réel qui manquait ;
- ne pas toucher aux contenus pédagogiques dans ce lot.

Validation minimale : tests vocaux ciblés, puis `npm test`, `npm run validate` et `npm run build` si des fichiers servis changent.

## Lot fonctionnel suivant

### 2. Recherche rapide dans Klassia

Besoin : permettre à un parent, élève ou enseignant de saisir une notion vue dans un cahier (mot ou petite expression) et de retrouver rapidement **ce que Klassia contient sur cette notion**.

Cible minimale :

- recherche plein texte locale, sans serveur et compatible hors connexion ;
- couvrir au minimum titres, objectifs, cours/supports et principaux mots-clés des ressources ;
- résultats groupés par classe, matière/domaine et leçon/activité ;
- extrait court montrant pourquoi le résultat correspond ;
- clic vers la ressource concernée ;
- tolérance raisonnable aux accents, casse et formes simples ;
- ne pas introduire de moteur externe ni de dépendance lourde sans nécessité.

Commencer par un diagnostic de l’architecture et proposer la solution minimale avant implémentation.

## Lot éditorial / documentaire

### 3. Couverture des manuels et référentiels

Les listes de manuels scolaires fournies par le porteur de projet servent de **repères d’usage scolaire**, distincts des curricula officiels. Les photographies et la synthèse privée ne doivent pas être publiées dans le dépôt public.

Objectifs :

- retrouver, lorsque cela est légalement et publiquement possible, sommaires, tables des matières, présentations éditeur ou extraits autorisés des ouvrages identifiés ;
- rapprocher les notions réellement vérifiables des contenus Klassia ;
- produire une matrice : couvert / partiellement couvert / absent / à vérifier ;
- compléter Klassia avec des contenus originaux lorsque des lacunes pertinentes sont confirmées ;
- ne jamais inventer le sommaire d’un manuel ni reproduire des passages protégés.

Cette recherche documentaire doit être menée séparément des tâches de codage. Codex ne doit pas supposer connaître le contenu d’un manuel à partir de son seul titre.

## Enrichissement CE2

### 4. Sciences et TIC CE2

Périmètre repéré :

- Sciences : 17 leçons génériques ;
- TIC : 12 leçons génériques ;
- total : 29 leçons.

Attendus : observations ou expériences simples lorsque pertinent, supports intégrés, exercices progressifs, corrections explicites et cohérence avec `docs/ENRICHISSEMENT.md`.

### 5. Autres leçons génériques CE2

Périmètre repéré : 90 leçons :

- Sciences humaines / sociales : 45 ;
- Développement personnel : 16 ;
- Arts : 15 ;
- EPS : 9 ;
- Bassa : 5.

Pour les cinq leçons bassa, conserver les propositions lexicales centrales déjà présentes et enrichir autour d’elles.

## Consolidation ultérieure

- couverture et progression des cinq classes ;
- supports sonores/visuels maîtrisés, dont enregistrements bassa à prononciation vérifiée ;
- pilote réel Android/iOS avec parents, enfants et enseignants.

## Règle pour chaque nouvelle session

Ne prendre **qu’un lot ou sous-lot clairement borné**. Éviter les demandes du type « améliorer tout Klassia ».

Format recommandé :

- OBJECTIF
- ÉTAT ACTUEL
- ATTENDU
- CONTRAINTES

Si une tâche locale révèle un problème architectural transversal, suspendre l’élargissement du périmètre et consigner d’abord le diagnostic.