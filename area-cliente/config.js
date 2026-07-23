/* ============================================================
   Zync — Área do Cliente · CONFIGURAÇÃO
   ------------------------------------------------------------
   Este é o ÚNICO arquivo que você precisa editar para ligar o
   portal ao backend real. Veja SETUP.md para o passo a passo.
   ============================================================ */

window.ZYNC_CONFIG = {

  /* -----------------------------------------------------------
     MODO DE OPERAÇÃO
     -----------------------------------------------------------
     'demo'     → login local com contas de demonstração.
                  NÃO É SEGURO. Use só para demonstrar em reunião.
                  Nenhum dado real de cliente pode entrar aqui.

     'supabase' → autenticação e dados reais via Supabase.
                  Exige preencher supabaseUrl e supabaseAnonKey.
     ----------------------------------------------------------- */
  mode: 'demo',

  /* Credenciais do projeto Supabase (Settings → API).
     A anon key é pública por natureza — a segurança vem das
     policies de Row Level Security, não do segredo da chave. */
  supabaseUrl: '',
  supabaseAnonKey: '',

  /* Contato de suporte exibido no portal */
  suporte: {
    whatsapp: '5561982503561',
    email: 'contato@zynchub.com.br',
  },

  /* Chave do storage local da sessão de demonstração */
  demoSessionKey: 'zync_demo_session',
};
