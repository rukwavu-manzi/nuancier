# Le Nuancier

10 000 couleurs à explorer en glissant, réparties en 7 niveaux de difficulté,
de l'arc-en-ciel à « Twilight Meadow ». Mode devinette (chaud / froid) et favoris.

**Jouer :** https://rukwavu-manzi.github.io/nuancier/ (installable sur l'écran d'accueil, fonctionne hors connexion).

## Structure

- `index.html` : la source de l'appli (page autonome).
- `build.sh` : génère `docs/index.html`, la version app installable servie par GitHub Pages.
- `docs/` : le site publié (page, manifeste, service worker, icônes).
- `data/` : `build_levels.js` construit `levels.json` (les 7 niveaux) à partir des sources.

Après une modification de `index.html` : lancer `./build.sh`, puis commit et push.
Penser à incrémenter `CACHE` dans `docs/sw.js` pour forcer la mise à jour hors connexion.

## Sources des noms de couleur

- Standard CSS (W3C), via le paquet `color-name` (MIT).
- [Liste des couleurs de Wikipédia](https://en.wikipedia.org/wiki/List_of_colors_(compact)) en anglais (CC BY-SA).
- [color-name-list](https://github.com/meodai/color-names) de David Aerne (MIT).
