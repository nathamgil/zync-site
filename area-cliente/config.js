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
  supabaseUrl: 'https://okybfmwlcddbgasafndk.supabase.co',
  supabaseAnonKey: 'sb_publishable_E0prEca72hxtJsRqeIJZKg_8mLj8gOp',

  /* -----------------------------------------------------------
     MÉTRICAS BLOQUEADAS
     -----------------------------------------------------------
     Métrica que a Zync SABE que ainda não é confiável não é
     escondida nem publicada errada: ela aparece no lugar dela,
     visivelmente bloqueada, com a razão escrita na tela.

     Chave = id da métrica usada no portal:
       'cpl'                → Custo por lead (KPI e coluna de campanhas)
       'funil'              → Funil (visão geral e página Funil e leads)
       'custo_qualificado'  → Custo por lead qualificado
       (qualquer id de KPI de zync-data.js também vale)

     PARA DESTRAVAR uma métrica: apague o bloco dela daqui.
     Não é preciso mexer em HTML nenhum.

     Campos:
       titulo   → rótulo do card
       razao    → texto exibido ao cliente (card grande)
       resumo   → opcional; versão curta usada quando o bloqueio
                  ocupa uma célula de KPI. Sem ele, usa a razao.
       previsao → opcional; linha de rodapé do card
     ----------------------------------------------------------- */
  metricasBloqueadas: {
    cpl: {
      titulo: 'Custo por lead',
      razao: 'Aguardando correção do rastreamento de conversão. ' +
             'A conta registra hoje conversões que não correspondem a contatos reais, ' +
             'então qualquer custo por lead calculado a partir delas seria um número errado. ' +
             'Preferimos deixar o número de fora a te mostrar um número errado.',
      resumo: 'Aguardando correção do rastreamento de conversão. Calculado sobre os dados de hoje, este número estaria errado.',
      previsao: 'liberamos assim que o rastreamento estiver corrigido e com dado novo acumulado',
    },
    funil: {
      titulo: 'Funil',
      razao: 'Aguardando correção do rastreamento de conversão. ' +
             'Impressões e cliques são medidos com segurança, mas as etapas seguintes ' +
             'dependem do mesmo evento de conversão que a auditoria apontou como quebrado. ' +
             'Um funil montado sobre ele mostraria um caminho que não existe.',
      resumo: 'Aguardando correção do rastreamento de conversão. As etapas seguintes ao clique ainda não são medidas com segurança.',
      previsao: 'liberamos assim que o rastreamento estiver corrigido e com dado novo acumulado',
    },
  },

  /* Contato de suporte exibido no portal */
  suporte: {
    whatsapp: '5561982503561',
    email: 'contato@zynchub.com.br',
  },

  /* Chave do storage local da sessão de demonstração */
  demoSessionKey: 'zync_demo_session',
};
