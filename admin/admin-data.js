/* ============================================================
   Zync — Painel do Administrador · CAMADA DE DADOS
   ------------------------------------------------------------
   Dois modos, escolhidos em config-admin.js:

     'local'    → lê window.ZYNC_ADMIN_DADOS, definido em
                  dados-locais.js — arquivo que está no
                  .gitignore e NUNCA vai para o repositório.

     'supabase' → lê as tabelas crm_* com RLS de admin.
                  Credenciais vêm de area-cliente/config.js.

   A tela nunca sabe de onde veio o dado. Trocar de origem é
   reescrever só este arquivo.
   ============================================================ */

(function (global) {
  'use strict';

  var CFG = global.ZYNC_ADMIN || {};
  var PORTAL = global.ZYNC_CONFIG || {};
  var MODO = CFG.mode || 'local';

  /* ---------- formatação ---------- */
  var Fmt = {
    brl: function (v) {
      if (v === null || v === undefined || v === '') return '—';
      return 'R$ ' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    },
    data: function (iso) {
      if (!iso) return '—';
      var p = String(iso).slice(0, 10).split('-');
      if (p.length !== 3) return String(iso);
      return p[2] + '/' + p[1] + '/' + p[0];
    },
    dataCurta: function (iso) {
      if (!iso) return '—';
      var p = String(iso).slice(0, 10).split('-');
      if (p.length !== 3) return String(iso);
      return p[2] + '/' + p[1] + '/' + p[0].slice(2);
    },
    atrasado: function (iso) {
      if (!iso) return false;
      return String(iso).slice(0, 10) < new Date().toISOString().slice(0, 10);
    },
  };

  var ROTULO_STATUS = {
    cliente: 'cliente',
    proposta: 'proposta enviada',
    prospect: 'prospect',
    perdido: 'não fechou',
    pausado: 'pausado',
  };

  /* ---------- ordenação: o que exige ação primeiro ---------- */
  var PESO = { proposta: 0, cliente: 1, prospect: 2, pausado: 3, perdido: 4 };

  function ordena(lista) {
    return lista.slice().sort(function (a, b) {
      var d = (PESO[a.status] === undefined ? 9 : PESO[a.status]) -
              (PESO[b.status] === undefined ? 9 : PESO[b.status]);
      if (d !== 0) return d;
      return String(a.empresa).localeCompare(String(b.empresa), 'pt-BR');
    });
  }

  /* ---------- normaliza um cliente vindo de qualquer origem ---------- */
  function normaliza(c) {
    return {
      slug: c.slug,
      empresa: c.empresa,
      contato_nome: c.contato_nome || '',
      contato_papel: c.contato_papel || '',
      segmento: c.segmento || '',
      cidade: c.cidade || '',
      status: c.status || 'prospect',
      desde: c.desde || null,
      valor_mensal: c.valor_mensal === undefined ? null : c.valor_mensal,
      valor_implantacao: c.valor_implantacao === undefined ? null : c.valor_implantacao,
      resumo: c.resumo || '',
      reunioes: (c.reunioes || []).slice().sort(function (a, b) {
        return String(b.data).localeCompare(String(a.data));
      }),
      apresentacoes: (c.apresentacoes || []).slice().sort(function (a, b) {
        return String(b.data || '').localeCompare(String(a.data || ''));
      }),
      timeline: (c.timeline || []).slice().sort(function (a, b) {
        return String(b.data).localeCompare(String(a.data));
      }),
      passos: (c.passos || []).slice().sort(function (a, b) {
        if (a.feito !== b.feito) return a.feito ? 1 : -1;
        return String(a.prazo || '9999').localeCompare(String(b.prazo || '9999'));
      }),
    };
  }

  /* ============================================================
     MODO LOCAL
     ============================================================ */
  function carregaLocal() {
    var d = global.ZYNC_ADMIN_DADOS;
    if (!d || !d.clientes || !d.clientes.length) {
      return Promise.resolve({
        ok: false,
        motivo: 'sem-arquivo',
        clientes: [],
      });
    }
    return Promise.resolve({
      ok: true,
      origem: 'local',
      clientes: ordena(d.clientes.map(normaliza)),
    });
  }

  /* ============================================================
     MODO SUPABASE
     ============================================================ */
  function carregaSupabase() {
    var url = PORTAL.supabaseUrl, key = PORTAL.supabaseAnonKey;
    if (!url || !key) {
      return Promise.resolve({ ok: false, motivo: 'sem-credencial', clientes: [] });
    }
    if (!global.supabase || !global.supabase.createClient) {
      return Promise.resolve({ ok: false, motivo: 'sem-sdk', clientes: [] });
    }

    var sb = global.__sbAdmin || (global.__sbAdmin = global.supabase.createClient(url, key));

    return sb.auth.getUser().then(function (u) {
      if (!u || !u.data || !u.data.user) {
        return { ok: false, motivo: 'sem-sessao', clientes: [] };
      }
      return Promise.all([
        sb.from('crm_clientes').select('*'),
        sb.from('crm_reunioes').select('*'),
        sb.from('crm_apresentacoes').select('*'),
        sb.from('crm_timeline').select('*'),
        sb.from('crm_passos').select('*'),
      ]).then(function (r) {
        var erro = r.find(function (x) { return x.error; });
        if (erro) return { ok: false, motivo: 'erro', detalhe: erro.error.message, clientes: [] };

        var cls = r[0].data || [];
        if (!cls.length) return { ok: false, motivo: 'sem-admin', clientes: [] };

        function doCliente(arr, id) {
          return (arr || []).filter(function (x) { return x.cliente_id === id; });
        }
        var montados = cls.map(function (c) {
          c.reunioes = doCliente(r[1].data, c.id);
          c.apresentacoes = doCliente(r[2].data, c.id);
          c.timeline = doCliente(r[3].data, c.id);
          c.passos = doCliente(r[4].data, c.id);
          return normaliza(c);
        });
        return { ok: true, origem: 'supabase', clientes: ordena(montados) };
      });
    }).catch(function (e) {
      return { ok: false, motivo: 'erro', detalhe: String(e && e.message || e), clientes: [] };
    });
  }

  /* ---------- API pública ---------- */
  global.ZyncAdmin = {
    modo: MODO,
    Fmt: Fmt,
    rotuloStatus: function (s) { return ROTULO_STATUS[s] || s; },
    carregar: function () {
      return MODO === 'supabase' ? carregaSupabase() : carregaLocal();
    },
  };

})(window);
