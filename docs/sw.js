/* Service worker du Nuancier : l'appli fonctionne hors connexion.
   - La page : réseau d'abord (pour recevoir les mises à jour), cache si hors ligne.
   - Icônes, manifeste, polices : cache d'abord. */
const CACHE = "nuancier-v4";
const CORE = ["./", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;

  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put("./", copy)); return res; })
        .catch(() => caches.match("./"))
    );
    return;
  }

  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      const url = new URL(req.url);
      const cacheable = url.origin === location.origin || (/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname) || url.hostname === "raw.githubusercontent.com");
      if (cacheable && (res.ok || res.type === "opaque")) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
      }
      return res;
    }))
  );
});
