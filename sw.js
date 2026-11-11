/* Service worker: deixa o roteiro funcionando sem internet.
   - Arquivos do site: tenta a rede primeiro (para pegar edições) e usa a cópia guardada se estiver offline.
   - Fotos, blocos de mapa, fontes e Leaflet: usa a cópia guardada se existir; senão baixa e guarda.
   Ao mudar a lista SHELL_FILES, suba VERSION para renovar a cópia do site. */
const VERSION = "v1";
const SHELL = "ba-shell-" + VERSION;
const PHOTOS = "ba-fotos-v1";          // mesmo nome usado em app.js (botão "Baixar fotos")
const TILES = "ba-mapas-v1";
const FONTS = "ba-fontes-v1";
const MAX_TILES = 1500;

const SHELL_FILES = [
  "./", "index.html", "css/style.css", "js/data.js", "js/app.js", "manifest.webmanifest",
  "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png"
];
const CDN_FILES = [
  "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css",
  "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"
];

self.addEventListener("install", (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(SHELL);
    await cache.addAll(SHELL_FILES);
    await Promise.all(CDN_FILES.map((u) => cache.add(new Request(u, { mode: "cors" })).catch(() => {})));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    const keep = [SHELL, PHOTOS, TILES, FONTS];
    for (const k of await caches.keys()) if (k.startsWith("ba-") && !keep.includes(k)) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin === self.location.origin) e.respondWith(networkFirst(req));
  else if (url.hostname === "cdnjs.cloudflare.com") e.respondWith(cacheFirst(req, SHELL));
  else if (url.hostname.endsWith("wikimedia.org")) e.respondWith(cacheFirst(req, PHOTOS));
  else if (url.hostname === "tile.openstreetmap.org") e.respondWith(cacheFirst(req, TILES, MAX_TILES));
  else if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") e.respondWith(cacheFirst(req, FONTS));
});

async function networkFirst(req) {
  const cache = await caches.open(SHELL);
  const net = fetch(req).then((res) => { if (res.ok) cache.put(req, res.clone()); return res; });
  net.catch(() => {});
  const slow = new Promise((_, reject) => setTimeout(() => reject(new Error("rede lenta")), 4000));
  try {
    return await Promise.race([net, slow]);
  } catch (err) {
    const hit = (await cache.match(req, { ignoreSearch: true })) || (req.mode === "navigate" ? await cache.match("./") : null);
    return hit || net;                 // sem cópia guardada: continua esperando a rede
  }
}

async function cacheFirst(req, name, max) {
  const cache = await caches.open(name);
  const hit = await cache.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok || res.type === "opaque") {
    await cache.put(req, res.clone());
    if (max) trim(cache, max);
  }
  return res;
}

async function trim(cache, max) {
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - max; i++) await cache.delete(keys[i]);
}
