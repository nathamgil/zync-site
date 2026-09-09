/* ============================================================
   Zync — medição de audiência (GA4)
   ------------------------------------------------------------
   >>> PARA LIGAR: preencha ID abaixo com o código de medição do
   >>> GA4 (formato G-XXXXXXXXXX) e publique. É a única edição.

   Enquanto ID estiver vazio, este arquivo não carrega nada e não
   envia requisição nenhuma — o site funciona igual.

   Onde NÃO medimos, de propósito:
     - /area-cliente/  → área logada de cliente
     - /admin/         → painel interno
   Medir a navegação de um cliente dentro do painel dele seria
   coletar comportamento identificado sem necessidade. O que
   interessa é o site público, que é onde a audiência chega.
   ============================================================ */

(function () {
  'use strict';

  var ID = '';   // <<< G-XXXXXXXXXX

  if (!ID) return;

  /* nao poluir o relatorio com acesso local ou de preview */
  var h = location.hostname;
  if (h !== 'zynchub.com.br' && h !== 'www.zynchub.com.br') return;

  /* area logada fica de fora */
  var p = location.pathname;
  if (p.indexOf('/area-cliente') === 0 || p.indexOf('/admin') === 0) return;

  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(ID);
  document.head.appendChild(s);

  window.dataLayer = window.dataLayer || [];
  function gtag(){ window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', ID);
})();
