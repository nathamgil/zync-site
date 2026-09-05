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

var CACHE_VERSION = 'zync-area-cliente-v3';

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
      /* `cache: 'reload'` obriga a ida à rede e ignora o cache HTTP.
         Com addAll simples, o navegador pode servir uma cópia velha
         do config.js e o pré-cache nasce desatualizado — foi
         exatamente o que aconteceu na virada de 05/09/2026, e o
         portal ficou preso em modo demo depois do deploy. */
      return Promise.all(APP_SHELL.map(function (u) {
        return cache.add(new Request(u, { cache: 'reload' }));
      }));
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

  /* config.js decide se o portal roda em demonstração ou com dado
     real do cliente. Servir uma versão velha dele é o pior erro que
     este service worker pode cometer, então aqui é network-first:
     o cache só entra em jogo se a rede falhar. */
  if (url.origin === self.location.origin && url.pathname.indexOf('/config.js') > -1) {
    event.respondWith(
      fetch(req, { cache: 'no-store' }).then(function (resp) {
        if (resp && resp.ok) {
          var copia = resp.clone();
          caches.open(CACHE_VERSION).then(function (cache) { cache.put(req, copia); });
        }
        return resp;
      }).catch(function () {
        return caches.match(req);
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
