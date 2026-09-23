# Portfolio BTS SIO SISR — Jérémy Vallon

Portfolio statique + Pages CMS, conçu pour être publié sur GitHub Pages.

## Architecture

- `index.html` : site public
- `assets/css/style.css` : design
- `assets/js/app.js` : rendu dynamique depuis les données JSON
- `data/` : contenu modifiable depuis Pages CMS
- `media/images/` : captures et images
- `media/documents/` : CV, rapports, attestations et autres preuves
- `.pages.yml` : configuration du mini-CMS

## Administration

Utiliser Pages CMS :

1. Ouvrir https://app.pagescms.org/
2. Se connecter avec GitHub.
3. Installer l'application Pages CMS sur le dépôt.
4. Ouvrir `SiniX69/portfolio`.
5. Les rubriques Profil, Projets, Expériences, Certifications, Compétences et Compétences BTS sont déjà configurées.
6. Les fichiers/images peuvent être ajoutés via les champs d'upload.

Pages CMS enregistre les modifications directement dans le dépôt GitHub. Le site GitHub Pages est ensuite reconstruit à partir des fichiers modifiés.

## GitHub Pages

Dans GitHub :

`Settings → Pages → Deploy from a branch → main → / (root)`

Puis attendre le déploiement.

## Contenu à compléter plus tard

Le modèle prévoit déjà des champs pour :
- Stage 2
- nouvelles certifications
- captures d'écran
- rapports et preuves
- nouveau CV
- nouveaux projets
- évolution des compétences
