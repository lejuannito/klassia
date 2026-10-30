# Klassia v8 — Installation sur smartphone

## Condition indispensable
Une PWA installable doit être ouverte depuis une adresse **HTTPS** (ou `localhost` sur le même appareil). Le ZIP seul ne peut pas s'installer directement depuis l'application Fichiers du téléphone.

## Android — Chrome / Edge
1. Publier le contenu de ce dossier sur un hébergement HTTPS.
2. Ouvrir l'adresse de Klassia dans Chrome ou Edge.
3. Attendre le premier chargement complet afin que les huit unités soient mises en cache.
4. Utiliser le bouton **Installer** proposé par Klassia, ou le menu du navigateur > **Installer l'application / Ajouter à l'écran d'accueil**.
5. Lancer Klassia depuis son icône. Après la première synchronisation, les contenus CE2 restent disponibles hors connexion.

## iPhone / iPad — Safari
1. Ouvrir l'adresse HTTPS de Klassia dans Safari.
2. Toucher **Partager**.
3. Choisir **Sur l'écran d'accueil**.
4. Confirmer **Ajouter**.

## Données locales
La progression, les scores et les préférences de la version pilote sont enregistrés dans le stockage local du navigateur/appareil. Une désinstallation ou un effacement des données du site peut les supprimer. La synchronisation multi-appareils nécessitera le futur serveur central Klassia.

## Publication
Le dossier est entièrement statique : `index.html`, CSS, JavaScript, manifeste, service worker et fichiers JSON. Il peut être publié tel quel sur GitHub Pages, Cloudflare Pages, Netlify, Firebase Hosting ou tout serveur HTTPS statique.
