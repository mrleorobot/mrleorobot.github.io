// Service worker do portfólio — cache leve do app shell.
// Suba a versão abaixo sempre que quiser forçar limpeza de cache antigo.
const CACHE_VERSION = "v20260821";
const CACHE_NAME = `leo-portfolio-${CACHE_VERSION}`;

const APP_SHELL = [
  "./",
  "./index.html",
  "./style.css?v=20260821",
  "./css/ag-upgrade-2026.css?v=20260821",
  "./polish.css?v=20260821",
  "./script.js?v=20260821",
  "./hero-ink.js?v=20260821",
  "./manifest.json?v=20260821",
  "./icon-192.png",
  "./icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .catch(() => {}) // não bloqueia instalação se algum asset falhar
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith("leo-portfolio-") && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Só cuida de requisições GET same-origin. Tudo externo (thum.io, CDN de
  // ícones, fontes, Vercel) passa direto pra rede, sem interferência.
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) {
    return;
  }

  // Navegação (abrir a página): tenta rede primeiro, cai pro cache só se
  // estiver offline. Isso evita servir uma versão antiga presa em cache.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match("./index.html"))
    );
    return;
  }

  // Assets do app shell (já versionados via ?v=): cache-first, já que a
  // query string muda quando o conteúdo muda.
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => cached);
    })
  );
});
