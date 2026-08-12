/* ============================================================
   Zync — Área do Cliente · SERVICE WORKER
   ------------------------------------------------------------
   Estratégia:
     - App shell (HTML/CSS/JS/ícones) → cache-first, com fallback
       de rede quando o recurso ainda não está em cache.
     - Qualquer requisição para *.supabase.co (dados/autenticação
       de cliente) → SEMPRE rede, NUNCA cache. Dado de cliente não
       pode ficar armazenado localmente.

   Versionamento: mude CACHE_VERSION a cada deploy para invalidar
   o cache antigo. O 'activate' limpa qualquer cache de versão
   anterior automaticamente.
   ============================================================ */

'use strict';

var CACHE_VERSION = 'zync-area-cliente-v1';

var APP_SHELL = [
  '/area-cliente/',
  '/area-cliente/index.html',
  '/area-cliente/app.html',
  '/area-cliente/nova-senha.html',
  '/area-cliente/portal.css',
  '/area-cliente/config.js',
  '/area-cliente/zync-auth.js',
  '/area-cliente/zync-data.js',
  '/area-cliente/manifest.webmanifest',
  '/favicon-192.png',
  '/favicon.png',
  '/apple-touch-icon.png',
];

/* ---------- install: pré-cache do app shell ---------- */
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(function (cache) {
      return cache.addAll(APP_SHELL);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

/* ---------- activate: limpa caches de versões antigas ---------- */
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (nomes) {
      return Promise.all(
        nomes
          .filter(function (nome) { return nome !== CACHE_VERSION; })
          .map(function (nome) { return caches.delete(nome); })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

/* ---------- fetch: roteia por tipo de requisição ---------- */
self.addEventListener('fetch', function (event) {
  var req = event.request;

  // só intercepta GET — o resto (POST/PUT/PATCH de auth/dados) segue direto pra rede
  if (req.method !== 'GET') return;

  var url = new URL(req.url);

  // dado de cliente (Supabase) NUNCA pode ficar em cache: network-first, sem cache
  if (url.hostname.indexOf('supabase.co') > -1) {
    event.respondWith(
      fetch(req).catch(function () {
        return new Response(
          JSON.stringify({ erro: 'Sem conexão com o servidor.' }),
          { status: 503, headers: { 'Content-Type': 'application/json' } }
        );
      })
    );
    return;
  }

  // app shell / estáticos: cache-first, com atualização em segundo plano
  event.respondWith(
    caches.match(req).then(function (cached) {
      var buscaRede = fetch(req).then(function (resp) {
        if (resp && resp.ok && url.origin === self.location.origin) {
          caches.open(CACHE_VERSION).then(function (cache) { cache.put(req, resp.clone()); });
        }
        return resp;
      }).catch(function () { return cached; });

      return cached || buscaRede;
    })
  );
});
