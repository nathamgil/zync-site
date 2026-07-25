/* ============================================================
   Zync — Área do Cliente · CONFIGURAÇÃO
   ------------------------------------------------------------
   Este é o ÚNICO arquivo que você precisa editar para ligar o
   portal ao backend real.

   Passo a passo e schema SQL: nathamlife\zync-docs\SETUP.md
   (fica FORA do repositório do site — é documento interno).
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

  /* Credenciais do projeto Supabase → Settings → API.
     Preencha as duas linhas e troque o mode acima para 'supabase'.
     São as ÚNICAS três edições necessárias para o portal virar real.

     A anon key é pública por natureza — a segurança vem das policies
     de Row Level Security no banco, não do segredo da chave.
     A service_role key NUNCA entra aqui: ela ignora toda RLS. */
  supabaseUrl: '',            // https://SEUPROJETO.supabase.co
  supabaseAnonKey: '',        // eyJhbGciOi...

  /* Contato de suporte exibido no portal */
  suporte: {
    whatsapp: '5561982503561',
    email: 'contato@zynchub.com.br',
  },

  /* Chave do storage local da sessão de demonstração */
  demoSessionKey: 'zync_demo_session',
};
