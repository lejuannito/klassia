# Klassia 15.1.0-rc.1 — candidate technique

## Périmètre

Cette candidate prépare la revue pédagogique et le pilote de dix classes. Le catalogue comprend 1 593 ressources, dont 576 anglophones. Les nouveaux projets, modèles d’écriture et scripts de prise complètent les ressources sans les déclarer validées ni exhaustives. Les rôles sont locaux ; compte, paiement et synchronisation centrale ne sont pas activés.

Les correctifs et enrichissements R1–R7 sont décrits dans `NEXT.md` et `REVUE_CANDIDATE.md`. Le catalogue et l’audit sont reproductibles ; zéro alerte structurelle ne signifie pas zéro erreur pédagogique. Les enregistrements définitifs et les modèles d’écriture attendus au Cameroun demandent un avis réel.

## Recette reproductible

Node >= 22 :

```sh
npm install --ignore-scripts
npm run catalog
npm run audit:content
node scripts/audio-preparation.mjs
npm run validate
npm test
npm run build
npm run test:browser
npm run test:gs
npm run test:speech
npm run test:search
npm run build:cloudflare
```

Les suites Playwright emploient Chromium et des voix simulées pour la logique audio. Elles couvrent l’accueil, les dix classes, les profils, les réponses, les décisions versionnées, les modèles cursifs, l’impression sans réponse de dictée et le cycle PWA (téléchargement, mise à jour, interruption, hors-ligne). Elles ne remplacent ni l’écoute sur appareil ni les vérifications iPhone et Android physiques. Le navigateur local de l’environnement de développement n’étant pas exécutable, les parcours navigateur sont exécutés par GitHub Actions.

## Paquet et diffusion

`npm run build:cloudflare` produit `dist/`, uniquement avec les fichiers publics autorisés et le manifeste d’intégrité. Les polices TTF et leur licence OFL sont incluses ; aucun fichier de travail ou secret n’y est ajouté. Les fonctions audio optionnelles nécessitent toujours leurs bindings et Cloudflare Access ; ce paquet ne les active pas à lui seul.

Le site public peut servir la candidate après fusion et déploiement de la branche principale. Avant de couper le réseau, attendre que les classes choisies soient déclarées prêtes. La base commune représente environ 1,35 Mo, puis environ 0,15 à 3,01 Mo par classe, hors autres caches du navigateur. Le relevé du manifeste fait foi pour chaque reconstruction.

En cas de régression, redéployer le dernier commit connu bon par la procédure habituelle. Le contenu des profils ne doit pas être effacé. Une ancienne édition peut ne pas exporter les nouveaux réglages : garder la sauvegarde produite par cette candidate avant tout retour. Ne pas demander aux familles de purger le cache sans sauvegarde préalable.

## Passage en privé

Le dépôt reste public jusqu’à la fin de cette candidate conformément à l’autorisation du porteur. Préparer ensuite les accès du titulaire, des collaborateurs et des outils autorisés, puis vérifier qu’un déploiement depuis un dépôt privé fonctionne sur l’hébergement retenu. L’hébergement public de la PWA est distinct de la visibilité du dépôt. Les conditions du compte GitHub et du mode GitHub Pages doivent être vérifiées avant la bascule. La publication de fichiers exécutés dans le navigateur reste visible par ses utilisateurs.

L’orientation propriétaire est matérialisée par `license: UNLICENSED` dans les métadonnées npm ; cela n’attribue pas fictivement les droits à la SARL et ne remplace pas la formalisation du titulaire et des contributions. Les licences des tiers restent applicables ; voir `NOTICES.md`.

## Boutiques et modèle connecté

La PWA constitue la première diffusion de cette candidate. Aucun APK/AAB, IPA, compte de boutique ou certificat de signature n’est annoncé comme livré.

Pour Android, préparer après pilote un emballage TWA si la PWA satisfait le besoin, ou un conteneur natif si des fonctions locales le justifient. Le nom d’application, le domaine, la signature, les liens d’association et la fiche de confidentialité devront correspondre au titulaire retenu. Le public enfant, les permissions, les déclarations de données et les achats demandent un examen avant soumission.

Pour iOS, conserver la PWA installable pendant le pilote. Une distribution App Store demande un paquet signé et une application présentant une valeur et une expérience appropriées ; la simple présence d’un site web ne démontre pas l’acceptabilité en boutique. Les conditions des boutiques devront être vérifiées au moment de leur préparation. Il n’y a donc pas d’engagement d’acceptation dans cette candidate.

Le mode connecté facultatif viendra ensuite : compte adulte sécurisé, sauvegarde et synchronisation avec gestion des conflits et minimisation des données enfant. La lecture et le travail hors ligne doivent rester disponibles. Ne pas confondre les profils locaux actuels avec cette future authentification.

## Conditions de sortie du pilote

- avis pédagogiques sur un premier parcours complet, incluant les classes anglophones retenues ;
- vérification locale des graphies et de la prononciation ;
- tests physiques Android/iPhone et qualification des incidents Chrome/impression ;
- titulaire, contact, conditions d’utilisation et information sur les données finalisés avant commercialisation ;
- décision de distribution fondée sur les résultats du pilote.

Références de préparation : [Trusted Web Activities](https://developer.android.com/develop/ui/views/layout/webapps/trusted-web-activities), [règles de revue App Store, notamment 4.2](https://developer.apple.com/app-store/review/guidelines/). À revérifier lors de la préparation effective des paquets.
