/* ============================================================
   Zync — Área do Cliente · CAMADA DE AUTENTICAÇÃO
   ------------------------------------------------------------
   Abstrai o provedor de autenticação. Hoje suporta:
     - modo 'demo'      → sessão local, só para demonstração
     - modo 'supabase'  → Supabase Auth (e-mail + senha)

   As telas nunca falam com o Supabase diretamente: elas usam
   ZyncAuth. Trocar de provedor no futuro é reescrever só aqui.
   ============================================================ */

(function (global) {
  'use strict';

  var CFG = global.ZYNC_CONFIG || {};
  var LOGIN_URL = 'index.html';
  var APP_URL = 'app.html';

  /* ---------- contas de demonstração ----------
     Existem apenas para demonstrar o portal em reunião comercial.
     Qualquer pessoa que abra o código-fonte consegue lê-las — por
     isso nenhum dado real de cliente pode estar no modo demo. */
  var DEMO_ACCOUNTS = [
    {
      email: 'demo@zynchub.com.br',
      senha: 'zync2026',
      cliente_id: 'demo',
      nome: 'Cliente Demonstração',
      empresa: 'Empresa Demo Ltda.',
      plano: 'Full Growth',
    },
  ];

  /* ---------- utilidades ---------- */

  function normalizaEmail(v) {
    return String(v || '').trim().toLowerCase();
  }

  function traduzErro(msg) {
    var m = String(msg || '').toLowerCase();
    if (m.indexOf('invalid login') > -1 || m.indexOf('invalid_credentials') > -1) {
      return 'E-mail ou senha incorretos.';
    }
    if (m.indexOf('email not confirmed') > -1) {
      return 'Seu e-mail ainda não foi confirmado. Verifique a caixa de entrada.';
    }
    if (m.indexOf('rate limit') > -1 || m.indexOf('too many') > -1) {
      return 'Muitas tentativas. Aguarde alguns minutos e tente de novo.';
    }
    if (m.indexOf('failed to fetch') > -1 || m.indexOf('networkerror') > -1) {
      return 'Sem conexão com o servidor. Verifique sua internet.';
    }
    return 'Não foi possível entrar. Tente novamente ou fale com a Zync.';
  }

  /* ---------- cliente Supabase (carregado sob demanda) ---------- */

  var _sb = null;
  var _sbPromise = null;

  function carregaSupabase() {
    if (_sb) return Promise.resolve(_sb);
    if (_sbPromise) return _sbPromise;

    _sbPromise = new Promise(function (resolve, reject) {
      if (!CFG.supabaseUrl || !CFG.supabaseAnonKey) {
        reject(new Error('Supabase não configurado em config.js'));
        return;
      }
      var s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js';
      s.onload = function () {
        _sb = global.supabase.createClient(CFG.supabaseUrl, CFG.supabaseAnonKey, {
          auth: { persistSession: true, autoRefreshToken: true },
        });
        resolve(_sb);
      };
      s.onerror = function () { reject(new Error('failed to fetch')); };
      document.head.appendChild(s);
    });
    return _sbPromise;
  }

  /* ---------- sessão de demonstração ---------- */

  function leSessaoDemo() {
    try {
      var raw = localStorage.getItem(CFG.demoSessionKey || 'zync_demo_session');
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function gravaSessaoDemo(conta) {
    var sess = {
      demo: true,
      email: conta.email,
      cliente_id: conta.cliente_id,
      nome: conta.nome,
      empresa: conta.empresa,
      plano: conta.plano,
    };
    localStorage.setItem(CFG.demoSessionKey || 'zync_demo_session', JSON.stringify(sess));
    return sess;
  }

  /* ============================================================
     API PÚBLICA
     ============================================================ */

  var ZyncAuth = {

    modo: CFG.mode || 'demo',
    ehDemo: function () { return (CFG.mode || 'demo') === 'demo'; },

    /* Entra com e-mail e senha.
       Resolve { ok:true, sessao } ou { ok:false, erro:'mensagem' } */
    entrar: function (email, senha) {
      email = normalizaEmail(email);

      if (!email || !senha) {
        return Promise.resolve({ ok: false, erro: 'Preencha e-mail e senha.' });
      }

      if (this.ehDemo()) {
        return new Promise(function (resolve) {
          // atraso proposital: a tela precisa se comportar como
          // a versão real, com estado de carregamento visível
          setTimeout(function () {
            var conta = DEMO_ACCOUNTS.filter(function (c) {
              return c.email === email && c.senha === senha;
            })[0];
            if (!conta) {
              resolve({ ok: false, erro: 'E-mail ou senha incorretos.' });
              return;
            }
            resolve({ ok: true, sessao: gravaSessaoDemo(conta) });
          }, 600);
        });
      }

      return carregaSupabase()
        .then(function (sb) {
          return sb.auth.signInWithPassword({ email: email, password: senha });
        })
        .then(function (r) {
          if (r.error) return { ok: false, erro: traduzErro(r.error.message) };
          return { ok: true, sessao: { email: r.data.user.email, uid: r.data.user.id } };
        })
        .catch(function (e) {
          return { ok: false, erro: traduzErro(e.message) };
        });
    },

    /* Envia e-mail de redefinição de senha. */
    redefinirSenha: function (email) {
      email = normalizaEmail(email);
      if (!email) return Promise.resolve({ ok: false, erro: 'Informe seu e-mail.' });

      if (this.ehDemo()) {
        return Promise.resolve({
          ok: false,
          erro: 'Redefinição de senha só funciona com o backend ligado. Fale com a Zync.',
        });
      }

      var redirect = location.href.replace(/[^/]*$/, 'nova-senha.html');
      return carregaSupabase()
        .then(function (sb) {
          return sb.auth.resetPasswordForEmail(email, { redirectTo: redirect });
        })
        .then(function (r) {
          if (r.error) return { ok: false, erro: traduzErro(r.error.message) };
          return { ok: true };
        })
        .catch(function (e) { return { ok: false, erro: traduzErro(e.message) }; });
    },

    /* Grava a nova senha. Só funciona logo após o clique no link de
       recuperação, quando o Supabase já criou a sessão temporária. */
    definirNovaSenha: function (senha) {
      if (!senha || senha.length < 8) {
        return Promise.resolve({ ok: false, erro: 'A senha precisa ter pelo menos 8 caracteres.' });
      }
      if (this.ehDemo()) {
        return Promise.resolve({ ok: false, erro: 'Redefinição de senha só funciona com o backend ligado.' });
      }
      return carregaSupabase()
        .then(function (sb) { return sb.auth.updateUser({ password: senha }); })
        .then(function (r) {
          if (r.error) return { ok: false, erro: traduzErro(r.error.message) };
          return { ok: true };
        })
        .catch(function (e) { return { ok: false, erro: traduzErro(e.message) }; });
    },

    /* Retorna a sessão atual ou null. */
    sessao: function () {
      if (this.ehDemo()) return Promise.resolve(leSessaoDemo());

      return carregaSupabase()
        .then(function (sb) { return sb.auth.getSession(); })
        .then(function (r) {
          if (!r.data || !r.data.session) return null;
          var u = r.data.session.user;
          return { email: u.email, uid: u.id, demo: false };
        })
        .catch(function () { return null; });
    },

    /* Garante sessão ativa; se não houver, manda para o login.
       Resolve com a sessão quando existe. */
    exigirSessao: function () {
      return this.sessao().then(function (s) {
        if (!s) {
          location.replace(LOGIN_URL + '?redirect=' + encodeURIComponent(location.pathname));
          return new Promise(function () {}); // trava a cadeia durante o redirect
        }
        return s;
      });
    },

    /* Encerra a sessão e volta para o login. */
    sair: function () {
      var vaiParaLogin = function () { location.replace(LOGIN_URL); };

      if (this.ehDemo()) {
        localStorage.removeItem(CFG.demoSessionKey || 'zync_demo_session');
        vaiParaLogin();
        return Promise.resolve();
      }
      return carregaSupabase()
        .then(function (sb) { return sb.auth.signOut(); })
        .then(vaiParaLogin, vaiParaLogin);
    },

    /* Exposto para a camada de dados montar queries autenticadas. */
    _supabase: carregaSupabase,

    URL_APP: APP_URL,
    URL_LOGIN: LOGIN_URL,
  };

  global.ZyncAuth = ZyncAuth;

})(window);
