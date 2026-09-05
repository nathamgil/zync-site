/* ============================================================
   Zync — Painel do Administrador · EXEMPLO DE DADOS LOCAIS
   ------------------------------------------------------------
   Copie para `dados-locais.js` e preencha. O arquivo real está
   no .gitignore e NUNCA pode ser commitado: o repositório
   zync-site é público, e o dossiê carrega piso de preço,
   fallback de negociação e transcrição de reunião.

   Este exemplo é fictício de propósito.
   ============================================================ */

window.ZYNC_ADMIN_DADOS = {
  clientes: [
    {
      slug: 'exemplo',
      empresa: 'Empresa Exemplo Ltda.',
      contato_nome: 'Nome do decisor',
      contato_papel: 'sócio',
      segmento: 'Segmento',
      cidade: 'Cidade / UF',
      /* prospect | proposta | cliente | perdido | pausado */
      status: 'prospect',
      desde: '2026-01-01',
      valor_mensal: null,
      valor_implantacao: null,
      resumo: 'O que a empresa é e o que foi descoberto no diagnóstico.',
      reunioes: [
        {
          data: '2026-01-01',
          titulo: 'Diagnóstico',
          participantes: ['Natham', 'Decisor'],
          resumo: 'Resumo da conversa.',
          notas_url: '',      // link do doc do Gemini no Drive
          gravacao_url: '',   // link do vídeo no Drive
          pontos: [
            { t: '00:00:00', texto: 'Trecho citável, com o carimbo de tempo.' },
          ],
        },
      ],
      apresentacoes: [
        {
          titulo: 'Nome da proposta',
          data: '2026-01-01',
          /* rascunho | enviada | apresentada | aceita | recusada */
          status: 'rascunho',
          caminho: 'pasta/arquivo.html',
          url_publica: '',
        },
      ],
      timeline: [
        /* reuniao | proposta | fechamento | perda | pagamento | nota */
        { data: '2026-01-01', tipo: 'reuniao', texto: 'O que aconteceu.' },
      ],
      passos: [
        { texto: 'O que falta fazer', prazo: '2026-01-15', feito: false },
      ],
    },
  ],
};
