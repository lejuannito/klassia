# Déploiement Klassia sur Cloudflare Pages

Le dépôt GitHub reste la source de vérité. GitHub Pages (`lejuannito.github.io/klassia/`) conserve son fonctionnement actuel ; Cloudflare Pages publie une **copie statique isolée** à la racine du domaine.

## Configuration dans Cloudflare Pages

Dans **Workers & Pages → Create → Pages → Connect to Git**, sélectionner `lejuannito/klassia`.

| Champ | Valeur |
| --- | --- |
| Project name | `klassia` (si disponible) |
| Production branch | `main` |
| Framework preset | `None` |
| Root directory | laisser vide (racine du dépôt) |
| Build command | `npm run build:cloudflare` |
| Build output directory | `dist` |
| Environment variable | `NODE_VERSION=22` |

Utiliser la version Node.js 22 ou supérieure compatible. La commande génère le manifeste de précache existant puis copie uniquement les fichiers statiques servis (HTML, JS, CSS, JSON, images, icônes, médias) dans `dist/`. Elle vérifie les empreintes SHA-256 de toutes les ressources exigées par le service worker ; elle échoue si une ressource manque.

**Ne pas publier `/` comme dossier de sortie.** Le dépôt contient aussi des scripts, tests et documents qui ne font pas partie du site. `dist/` est ignoré par Git. Ne pas utiliser `build:public` pour cette édition pilote : cette commande impose une validation pédagogique nominative qui n'est pas acquise.

## Première mise en ligne et nom de domaine

1. Fusionner la PR contenant ce build dans `main`.
2. Dans la configuration Cloudflare préparée, saisir les paramètres ci-dessus puis lancer **Save and Deploy**.
3. Vérifier l'URL de test créée par Cloudflare (par exemple `klassia.pages.dev`). La disponibilité de ce sous-domaine dépend du projet.
4. Dans le projet Pages → **Custom domains**, ajouter `klassia.app` (domaine déjà enregistré chez Cloudflare). Suivre les indications affichées pour le DNS et le certificat HTTPS ; ne pas créer manuellement de redirection avant le contrôle du site.
5. Ajouter `www.klassia.app` en second domaine si souhaité et configurer une redirection permanente vers `https://klassia.app`.
6. Conserver GitHub Pages comme accès indépendant et **ne pas rediriger GitHub Pages vers Cloudflare**.

## Vérification avant annonce aux familles

- Ouvrir depuis un navigateur privé `/`, `/search.html`, `/ms/`, `/gs/`, `/sil/`, `/ce1/` et les pages CE2.
- Tester les thèmes/leçons, les images, la recherche, les voix FR/EN (selon disponibilité du téléphone), le Bassa et les téléchargements.
- Vérifier que `/service-worker.js`, `/precache-manifest.js`, `/manifest.webmanifest` et `/icons/icon-192.png` répondent.
- Attendre que le message de mise en cache des cinq classes soit complet ; passer en mode avion et rouvrir chaque classe et la recherche.
- Vérifier l'installation PWA sur Android. L'application installée depuis `github.io` et celle installée depuis `klassia.app` utilisent **deux origines différentes** : les progrès locaux ne sont **pas** automatiquement transférés. Utiliser l'export et la restauration des données pour migrer, si nécessaire.
- Maintenir les avertissements « édition pilote accompagnée / non certifiée » : le domaine public ne constitue pas une validation pédagogique.

## Vérification locale

```sh
npm run build:cloudflare
node --test tests/cloudflare-build.test.cjs
```

La génération ne modifie pas la logique des classes ni les URLs relatives, et utilise la même génération de manifeste que GitHub Pages. La CI reste responsable de la validation de contenu et des tests navigateur.
