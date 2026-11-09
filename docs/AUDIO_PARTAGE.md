# Klassia · audio partagé et narrations longues

## Objectif et état

La contribution Bassa reste locale tant qu’aucun service de publication n’est configuré. Un référent authentifié pourra publier sans release grâce à une Function Cloudflare Pages, un R2 **privé** et une base D1. L'ancienne écoute locale reste disponible. Aucune clé ni jeton permanent n'est stocké dans le navigateur. Les versions GitHub Pages peuvent lire le catalogue depuis l'API si l'URL de service est configurée.

## Mise en service (administrateur Cloudflare)

1. Dans Cloudflare, créer une base D1 `klassia-audio` et un compartiment R2 privé `klassia-audio`. Ne pas activer l'accès public du compartiment.
2. Dans Pages > Klassia > Settings > Bindings, associer `AUDIO_DB` à D1 et `AUDIO_MEDIA` à R2. Appliquer `migrations/0001_bassa_audio.sql` à D1 (console D1 ou Wrangler).
3. Configurer une application Cloudflare Access couvrant `https://klassia.app/api/bassa/author*` avec une politique d'autorisation limitée aux référents identifiés. Définir sur Pages les variables `ACCESS_ISSUER` (par exemple `https://<équipe>.cloudflareaccess.com`), `ACCESS_AUD` (audience JWT de cette application Access), `AUDIO_PUBLISHERS` (liste des courriels autorisés, séparés par virgule). Aucun de ces paramètres ne doit être inscrit dans les sources.
4. Déployer depuis `main` avec `npm run build:cloudflare`. **Important** : le répertoire `functions/` est découvert par l'intégration Git Cloudflare Pages ; il n'appartient pas aux fichiers statiques du dossier `dist/`.
5. Tester : `GET /api/bassa/catalog` doit retourner une liste vide ; `GET /api/bassa/author` sans session doit être refusé. Une session Access réellement autorisée doit permettre l'envoi, puis l'écoute publique depuis un autre appareil. Vérifier ensuite le retrait et l'absence d'écoute après retrait.
6. Sur GitHub Pages, l'API dynamique n'existe pas. Pour accéder au catalogue partagé depuis ce domaine, définir au besoin `window.KLASSIA_BASSA_API = 'https://klassia.app/api/bassa'` avant le script `shared/bassa.js`, ou privilégier `klassia.app` comme entrée principale.

## Circuit de contribution

Dans l'atelier Bassa, la prise locale doit être confirmée et l'accord de diffusion recueilli. La commande de publication se connecte à l'espace protégé Cloudflare Access ; elle envoie le son directement à l'API et le rattache à l'identifiant lexical, à la graphie et au sens. Les références d'avis et de consentement doivent désigner des justificatifs conservés en privé, pas simplement des cases cochées. Seules les prises publiées sont visibles dans les leçons ; les prises retirées disparaissent du catalogue et du service de lecture. Les lecteurs nécessitent du réseau pour une première écoute ; les données de cours et les prises locales restent disponibles hors connexion. La mise en cache partagée hors connexion viendra dans un lot distinct.

Ne jamais publier les coordonnées, signatures, voix non autorisées, sources brutes d'avis et données d'élèves. Les vues locales Enseignant/Admin **ne sont pas** des comptes authentifiés ; seul Cloudflare Access et la vérification cryptographique du JWT sur le serveur autorisent une publication. Éviter toute diffusion automatique sans réécoute.

## Narration des cours

La synthèse vocale navigateur peut désormais proposer une lecture plus complète du cours et non seulement du titre. Elle peut être variable selon le téléphone. Les MP3 validés restent préférables pour les supports les plus consultés, à commencer par les lectures SIL, CE1, CE2 et les consignes MS/GS. Produire ensuite un lot éditorial de narrations fixes de 2–5 minutes avec deux langues distinctes lorsqu'elles sont nécessaires, sans synthétiser les formes bassa avec les voix FR/EN.

## Vérifications restantes

Les API Cloudflare ne peuvent pas être déclarées opérationnelles tant que l’administrateur n’a pas provisionné D1/R2/Access et appliqué la migration. Tests de navigateur sur Android et iPhone, lecture multi-appareil, révocation, demandes simultanées et limites de taille doivent être réalisés sur le domaine de préproduction.
