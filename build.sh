#!/bin/sh
# Génère docs/index.html, la version app installable (PWA) publiée sur GitHub Pages,
# à partir de index.html (la version publiée en artifact).
cd "$(dirname "$0")" && mkdir -p docs && {
  printf '<!doctype html>\n<html lang="fr">\n<head>\n<meta charset="utf-8">\n'
  printf '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
  printf '<meta name="theme-color" content="#141414">\n'
  printf '<link rel="manifest" href="manifest.webmanifest">\n'
  printf '<link rel="icon" href="icon-192.png">\n'
  printf '<link rel="apple-touch-icon" href="apple-touch-icon.png">\n'
  printf '<meta name="apple-mobile-web-app-capable" content="yes">\n'
  printf '<meta name="mobile-web-app-capable" content="yes">\n'
  printf '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">\n'
  printf '<meta name="apple-mobile-web-app-title" content="Nuancier">\n'
  sed -n '1,/<\/style>/p' index.html
  printf '</head>\n<body>\n'
  sed '1,/<\/style>/d' index.html
  printf '<script>if ("serviceWorker" in navigator) addEventListener("load", () => navigator.serviceWorker.register("sw.js"));</script>\n'
  printf '</body>\n</html>\n'
} > docs/index.html

# Version « raccourci » : même appli, sans manifeste. Les navigateurs l'ajoutent à
# l'écran d'accueil comme simple raccourci (pas d'application créée, donc pas de
# contrôle Google Play Protect). Passe en plein écran au premier toucher.
sed -e '/rel="manifest"/d' \
    -e 's#</body>#<script>addEventListener("pointerdown", () => { const d = document.documentElement; if (!document.fullscreenElement \&\& d.requestFullscreen) d.requestFullscreen().catch(() => {}); }, { once: true });</script>\n</body>#' \
    docs/index.html > docs/raccourci.html
