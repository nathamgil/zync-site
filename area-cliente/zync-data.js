/* ============================================================
   Zync — Área do Cliente · CAMADA DE DADOS
   ------------------------------------------------------------
   Entrega SEMPRE o mesmo formato de objeto para as telas, venha
   o dado do conjunto de demonstração ou do Supabase. Se um
   módulo não tiver dado, ele volta null e a tela mostra estado
   vazio — nunca número inventado.
   ============================================================ */

(function (global) {
  'use strict';

  /* ============================================================
     FORMATADORES
     ============================================================ */
  var Fmt = {
    brl: function (n) {
      if (n == null) return '—';
      return 'R$ ' + Number(n).toLocaleString('pt-BR', {
        minimumFractionDigits: 2, maximumFractionDigits: 2,
      });
    },
    brl0: function (n) {
      if (n == null) return '—';
      return 'R$ ' + Number(n).toLocaleString('pt-BR', {
        minimumFractionDigits: 0, maximumFractionDigits: 0,
      });
    },
    num: function (n) {
      if (n == null) return '—';
      return Number(n).toLocaleString('pt-BR');
    },
    pct: function (n, casas) {
      if (n == null) return '—';
      return Number(n).toLocaleString('pt-BR', {
        minimumFractionDigits: casas == null ? 2 : casas,
        maximumFractionDigits: casas == null ? 2 : casas,
      }) + '%';
    },
    mult: function (n) { return n == null ? '—' : Number(n).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + 'x'; },
    data: function (iso) {
      if (!iso) return '—';
      var p = String(iso).slice(0, 10).split('-');
      return p[2] + '/' + p[1] + '/' + p[0];
    },
    dataCurta: function (iso) {
      if (!iso) return '—';
      var p = String(iso).slice(0, 10).split('-');
      return p[2] + '/' + p[1];
    },
  };

  /* ============================================================
     CONJUNTO DE DEMONSTRAÇÃO
     Números plausíveis de uma PME em operação Full Growth.
     ============================================================ */
  function datasetDemo() {
    return {
      cliente: {
        nome: 'Marcelo Andrade',
        empresa: 'Empresa Demo',
        iniciais: 'ED',
        plano: 'Full Growth',
        gerente: 'Gabriel Briglia',
        gerente_cargo: 'CMO · Zync',
        cliente_desde: '2026-02-10',
      },

      periodo: {
        label: 'Julho / 2026',
        inicio: '2026-07-01',
        fim: '2026-07-22',
        atualizado_em: '2026-07-22T09:40:00',
        comparado_com: 'Junho / 2026',
      },

      /* ---------- KPIs do topo ---------- */
      kpis: [
        {
          id: 'leads', label: 'LEADS GERADOS', valor: 187, fmt: 'num',
          delta: 23.8, hint: '151 no mês anterior',
          nota: 'O volume subiu porque separamos remarketing do público frio no dia 8. Cada campanha passou a ter verba própria.',
          spark: [4, 6, 5, 9, 7, 11, 8, 12, 10, 14, 13, 16],
        },
        {
          id: 'cpl', label: 'CUSTO POR LEAD', valor: 25.94, fmt: 'brl',
          delta: -14.2, inverso: true, hint: 'R$ 30,24 no mês anterior',
          nota: 'Caiu junto com a reestruturação de públicos. Em agosto vamos remanejar 20% da verba de topo para remarketing.',
          spark: [16, 15, 14, 15, 13, 12, 12, 11, 11, 10, 10, 9],
        },
        {
          id: 'invest', label: 'INVESTIMENTO EM MÍDIA', valor: 4850, fmt: 'brl0',
          delta: 6.2, neutro: true, hint: 'de R$ 6.000 aprovados',
          spark: [3, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
        },
        {
          id: 'qualificados', label: 'LEADS QUALIFICADOS', valor: 94, fmt: 'num',
          delta: 18.0, hint: '50,3% dos leads captados',
          nota: 'Metade dos leads passa na triagem. O que trava daqui pra frente é o tempo de resposta, não o volume.',
          spark: [2, 3, 3, 5, 4, 6, 4, 6, 5, 7, 7, 8],
        },
      ],

      /* ---------- Leitura do estrategista (assinada, mensal) ----------
         Bloco humano. É o que nenhuma ferramenta automática entrega
         e o que sustenta o fee de gestão. */
      leitura: {
        autor: 'Gabriel Briglia',
        cargo: 'CMO · Zync',
        iniciais: 'GB',
        data: '2026-07-22',
        titulo: 'Julho foi o mês em que o gargalo saiu da mídia e foi para o atendimento',
        paragrafos: [
          'A conta parou de ter problema de aquisição. Geramos 187 leads a R$ 25,94 — 24% mais volume por 14% menos custo que junho. A estrutura de públicos que separamos no dia 8 é a explicação: o remarketing agora tem verba própria e entrega lead a R$ 14,72.',
          'O problema mudou de lugar. Hoje o tempo médio até o primeiro contato com o lead é de 4h20. Nesta conta, lead respondido em até 10 minutos converte 3,1 vezes mais. Ou seja: metade do resultado de agosto não depende de verba, depende de velocidade de resposta.',
          'Por isso o plano de agosto tem duas frentes: remanejar 20% da verba de topo para remarketing (movimento barato e já validado) e implantar o alerta de lead novo direto no WhatsApp do comercial. Nenhuma das duas exige aumentar a verba — as duas atacam o que hoje está travando a conversão.',
        ],
      },

      /* ---------- Pendências com o cliente ----------
         O que a Zync está esperando. Documenta atraso de origem
         do cliente sem desgastar o relacionamento por WhatsApp. */
      pendencias: [
        { titulo: 'Aprovar os 3 criativos de vídeo de agosto', desde: '2026-07-17', desc: 'Enviados por e-mail. Sem aprovação, a subida fica para depois do dia 05/08.', urgencia: 'alta' },
        { titulo: 'Liberar acesso de administrador ao Business Manager', desde: '2026-07-12', desc: 'Necessário para publicar os anúncios em nome da sua página.', urgencia: 'alta' },
        { titulo: 'Confirmar a verba de mídia de agosto', desde: '2026-07-20', desc: 'Sugestão da Zync: manter R$ 6.000 e realocar 20% para remarketing.', urgencia: 'media' },
        { titulo: 'Enviar fotos novas do ponto físico', desde: '2026-07-08', desc: 'Para renovar o banco de criativos, hoje com 3 semanas de veiculação.', urgencia: 'baixa' },
      ],

      /* ---------- Contas e acessos administrados ----------
         Declara que a propriedade é do cliente. Facilitar a saída
         reduz a vontade de sair. */
      contas: [
        { conta: 'Meta Business Manager', proprietario: 'Empresa Demo Ltda.', papel: 'Zync administra', status: 'ativo' },
        { conta: 'Google Ads', proprietario: 'Empresa Demo Ltda.', papel: 'Zync administra', status: 'ativo' },
        { conta: 'Google Analytics 4', proprietario: 'Empresa Demo Ltda.', papel: 'Zync administra', status: 'ativo' },
        { conta: 'Domínio empresademo.com.br', proprietario: 'Empresa Demo Ltda.', papel: 'Zync administra', status: 'ativo' },
        { conta: 'Hospedagem do site', proprietario: 'Zync (repassável)', papel: 'Zync administra', status: 'ativo' },
      ],

      /* ---------- Destaques do mês (curtos, no topo) ---------- */
      insights: [
        {
          tipo: 'ganho',
          titulo: 'A campanha de remarketing virou a mais barata da conta',
          texto: 'Depois que separamos o público que visitou o site sem converter, o CPL dessa campanha caiu para R$ 14,80 — 43% abaixo da média da conta. Vamos remanejar 20% da verba de topo para ela em agosto.',
        },
        {
          tipo: 'atencao',
          titulo: 'Tempo de resposta ao lead está travando a conversão',
          texto: 'Leads respondidos em até 10 minutos convertem 3,1x mais nesta conta. Hoje a média está em 4h20. É o maior ponto de perda do funil — e não depende de mais verba.',
        },
      ],

      /* ---------- Tráfego pago ---------- */
      trafego: {
        impressoes: 312400,
        cliques: 6180,
        ctr: 1.98,
        cpc: 0.78,
        investimento: 4850,
        leads: 187,
        cpl: 25.94,
        qualificados: 94,
        custo_qualificado: 51.60,
        serie: [
          { dia: '01/07', leads: 4, invest: 210 }, { dia: '03/07', leads: 6, invest: 225 },
          { dia: '05/07', leads: 5, invest: 215 }, { dia: '07/07', leads: 9, invest: 240 },
          { dia: '09/07', leads: 7, invest: 230 }, { dia: '11/07', leads: 11, invest: 255 },
          { dia: '13/07', leads: 8, invest: 235 }, { dia: '15/07', leads: 12, invest: 260 },
          { dia: '17/07', leads: 10, invest: 245 }, { dia: '19/07', leads: 14, invest: 270 },
          { dia: '21/07', leads: 13, invest: 265 }, { dia: '22/07', leads: 16, invest: 280 },
        ],
        campanhas: [
          { nome: 'Remarketing · Site 30d', canal: 'Meta', status: 'ativa', invest: 780, leads: 53, cpl: 14.72, ctr: 3.10 },
          { nome: 'Institucional · Interesse', canal: 'Meta', status: 'ativa', invest: 1620, leads: 61, cpl: 26.56, ctr: 1.84 },
          { nome: 'Pesquisa · Marca + Serviço', canal: 'Google', status: 'ativa', invest: 1450, leads: 49, cpl: 29.59, ctr: 4.42 },
          { nome: 'Lookalike 1% · Compradores', canal: 'Meta', status: 'teste', invest: 640, leads: 18, cpl: 35.56, ctr: 1.21 },
          { nome: 'Display · Awareness', canal: 'Google', status: 'pausada', invest: 360, leads: 6, cpl: 60.00, ctr: 0.42 },
        ],
      },

      /* ---------- Funil ---------- */
      funil: [
        { etapa: 'Impressões', valor: 312400 },
        { etapa: 'Cliques no anúncio', valor: 6180 },
        { etapa: 'Leads captados', valor: 187 },
        { etapa: 'Leads qualificados', valor: 94 },
        { etapa: 'Reuniões marcadas', valor: 38 },
        { etapa: 'Vendas fechadas', valor: 12 },
      ],

      /* ---------- Leads ---------- */
      leads: {
        total: 187, novos_semana: 41, qualificados: 94, taxa_qualificacao: 50.3,
        tempo_medio_resposta: '4h20',
        /* O telefone chega mascarado do banco. A revelação é feita por uma
           função no servidor que registra quem viu, quando e qual lead.
           Ver SETUP.md → função revelar_telefone. */
        lista: [
          { data: '2026-07-22', nome: 'Ricardo Almeida', fone: '(61) 9****-**41', origem: 'Meta',     campanha: 'Remarketing · Site 30d',     responsavel: '—',         t1: null,     status: 'novo' },
          { data: '2026-07-22', nome: 'Juliana Moraes',  fone: '(61) 9****-**08', origem: 'Google',   campanha: 'Pesquisa · Marca + Serviço', responsavel: 'Ana Paula', t1: '6 min',  status: 'qualificado' },
          { data: '2026-07-21', nome: 'Fernando Castro', fone: '(61) 9****-**77', origem: 'Meta',     campanha: 'Institucional · Interesse',  responsavel: 'Ana Paula', t1: '22 min', status: 'reuniao' },
          { data: '2026-07-21', nome: 'Patrícia Lemos',  fone: '(61) 9****-**13', origem: 'Meta',     campanha: 'Remarketing · Site 30d',     responsavel: 'Rodrigo',   t1: '4 min',  status: 'ganho' },
          { data: '2026-07-20', nome: 'Bruno Siqueira',  fone: '(61) 9****-**60', origem: 'Google',   campanha: 'Pesquisa · Marca + Serviço', responsavel: 'Rodrigo',   t1: '1h10',   status: 'qualificado' },
          { data: '2026-07-20', nome: 'Camila Rocha',    fone: '(61) 9****-**25', origem: 'Meta',     campanha: 'Lookalike 1% · Compradores', responsavel: '—',         t1: '9h40',   status: 'perdido' },
          { data: '2026-07-19', nome: 'Anderson Prado',  fone: '(61) 9****-**94', origem: 'Meta',     campanha: 'Institucional · Interesse',  responsavel: 'Ana Paula', t1: '35 min', status: 'qualificado' },
          { data: '2026-07-19', nome: 'Letícia Ferraz',  fone: '(61) 9****-**52', origem: 'Orgânico', campanha: 'Instagram @empresademo',     responsavel: '—',         t1: '12h05',  status: 'novo' },
        ],
      },

      /* ---------- Site e analytics ---------- */
      site: {
        url: 'empresademo.com.br',
        visitas: 8940, delta_visitas: 18.5,
        usuarios_novos: 6720,
        tempo_medio: '2m 14s',
        taxa_conversao: 2.09,
        performance: 96,
        uptime: 99.98,
        top_paginas: [
          { pagina: '/', visitas: 3810, conv: 2.4 },
          { pagina: '/servicos', visitas: 1920, conv: 3.1 },
          { pagina: '/contato', visitas: 1340, conv: 8.7 },
          { pagina: '/sobre', visitas: 890, conv: 0.9 },
          { pagina: '/blog/como-escolher', visitas: 620, conv: 1.4 },
        ],
        origens: [
          { origem: 'Tráfego pago', visitas: 5210, pct: 58.3 },
          { origem: 'Busca orgânica', visitas: 1890, pct: 21.1 },
          { origem: 'Direto', visitas: 1120, pct: 12.5 },
          { origem: 'Social orgânico', visitas: 720, pct: 8.1 },
        ],
      },

      /* ---------- Conteúdo orgânico ---------- */
      conteudo: {
        publicados: 18, alcance: 42800, delta_alcance: 31.2,
        seguidores_novos: 340, engajamento: 4.8,
        itens: [
          { data: '2026-07-21', canal: 'Instagram', titulo: 'Carrossel · 5 erros que travam sua captação', alcance: 6400, eng: 6.2 },
          { data: '2026-07-18', canal: 'Instagram', titulo: 'Reels · Bastidores do atendimento', alcance: 11200, eng: 8.1 },
          { data: '2026-07-16', canal: 'Blog', titulo: 'Como escolher o serviço certo em 2026', alcance: 620, eng: 3.4 },
          { data: '2026-07-14', canal: 'Instagram', titulo: 'Carrossel · Antes e depois de cliente', alcance: 5800, eng: 5.5 },
          { data: '2026-07-11', canal: 'LinkedIn', titulo: 'Artigo · O custo real de não medir', alcance: 2100, eng: 4.0 },
        ],
      },

      /* ---------- Agente de IA ---------- */
      agente_ia: {
        ativo: true,
        conversas: 412, resolvidas_sem_humano: 331, taxa_resolucao: 80.3,
        leads_gerados: 68, tempo_medio_resposta: '8s',
        horario_pico: '19h — 22h',
        fora_horario: 47,
        serie: [
          { sem: 'Sem 1', total: 88 }, { sem: 'Sem 2', total: 104 },
          { sem: 'Sem 3', total: 119 }, { sem: 'Sem 4', total: 101 },
        ],
        top_perguntas: [
          { pergunta: 'Qual o valor do serviço?', vezes: 96 },
          { pergunta: 'Vocês atendem em qual região?', vezes: 71 },
          { pergunta: 'Qual o prazo de entrega?', vezes: 58 },
          { pergunta: 'Como funciona o pagamento?', vezes: 44 },
        ],
        /* Amostra das últimas conversas, sem telefone e sem nome do
           cliente final. Serve para o cliente auditar e corrigir o
           agente — é o que nenhum painel de terceiro entrega. */
        conversas_recentes: [
          {
            quando: '2026-07-22 21:14', canal: 'WhatsApp', desfecho: 'lead',
            pergunta: 'Vocês trabalham com parcelamento?',
            resposta: 'Trabalhamos sim! Fazemos em até 12x no cartão ou com desconto à vista. Quer que eu já chame um consultor para montar a condição pra você?',
          },
          {
            quando: '2026-07-22 19:02', canal: 'WhatsApp', desfecho: 'resolvido',
            pergunta: 'Que horas vocês abrem no sábado?',
            resposta: 'Aos sábados atendemos das 9h às 13h. Fora desse horário eu sigo por aqui e já deixo tudo encaminhado para segunda.',
          },
          {
            quando: '2026-07-22 17:40', canal: 'WhatsApp', desfecho: 'escalado',
            pergunta: 'Preciso falar sobre um problema no meu pedido 4471.',
            resposta: 'Sinto muito pelo transtorno. Esse caso eu passo direto para uma pessoa do time — já registrei aqui e alguém te responde em instantes.',
          },
          {
            quando: '2026-07-22 14:28', canal: 'WhatsApp', desfecho: 'lead',
            pergunta: 'Quanto custa o serviço completo?',
            resposta: 'O investimento varia conforme o porte. Para te passar um número exato preciso de dois detalhes rápidos — posso perguntar?',
          },
        ],
      },

      /* ---------- Entregas do mês ---------- */
      entregas: [
        { titulo: 'Reestruturação das campanhas de Meta Ads', desc: 'Separação de públicos frio, morno e remarketing com verba própria.', status: 'concluido', prazo: '2026-07-08' },
        { titulo: 'Instalação de rastreamento de conversão (GA4 + Pixel)', desc: 'Eventos de lead, WhatsApp e formulário validados na origem.', status: 'concluido', prazo: '2026-07-11' },
        { titulo: 'Nova página de captação /servicos', desc: 'Layout de alta conversão com prova social e formulário curto.', status: 'concluido', prazo: '2026-07-16' },
        { titulo: 'Treinamento do agente de IA com objeções reais', desc: 'Base atualizada com as 40 perguntas mais frequentes do time comercial.', status: 'andamento', prazo: '2026-07-26' },
        { titulo: 'Calendário editorial de agosto', desc: '16 peças planejadas com roteiro e referência visual.', status: 'andamento', prazo: '2026-07-29' },
        { titulo: 'Teste A/B de criativo na campanha institucional', desc: 'Duas linhas criativas rodando com verba equivalente.', status: 'pendente', prazo: '2026-08-05' },
      ],

      /* ---------- Próximos passos (o que a Zync vai fazer) ---------- */
      proximos_passos: [
        { titulo: 'Remanejar 20% da verba de topo para remarketing', prazo: 'Início de agosto', desc: 'Movimento baseado no CPL 43% menor dessa campanha.' },
        { titulo: 'Implantar alerta de lead novo no WhatsApp do comercial', prazo: 'Primeira semana de agosto', desc: 'Ataca o tempo de resposta de 4h20, hoje o maior gargalo do funil.' },
        { titulo: 'Subir 2 novas linhas criativas em vídeo', prazo: 'Até 12/08', desc: 'Os criativos atuais já passaram de 3 semanas de veiculação.' },
      ],

      /* ---------- Arquivos ---------- */
      arquivos: [
        { nome: 'Relatório de performance — Junho 2026', tipo: 'PDF', tam: '2,4 MB', data: '2026-07-03', url: '#' },
        { nome: 'Relatório de performance — Maio 2026', tipo: 'PDF', tam: '2,1 MB', data: '2026-06-04', url: '#' },
        { nome: 'Contrato de prestação de serviços', tipo: 'PDF', tam: '380 KB', data: '2026-02-10', url: '#' },
        { nome: 'Manual da marca — v2', tipo: 'PDF', tam: '8,7 MB', data: '2026-05-22', url: '#' },
        { nome: 'Banco de criativos — Julho', tipo: 'ZIP', tam: '64 MB', data: '2026-07-02', url: '#' },
      ],

      /* ---------- Financeiro / contrato ---------- */
      financeiro: {
        fee_mensal: 2500,
        verba_aprovada: 6000,
        verba_usada: 4850,
        proxima_cobranca: '2026-08-05',
        contrato_ate: '2027-02-10',
        status_pagamento: 'em dia',
      },
    };
  }

  /* ============================================================
     LEITURA VIA SUPABASE
     ------------------------------------------------------------
     Cada bloco do portal vem de uma tabela. As policies de Row
     Level Security no banco garantem que o cliente só enxergue
     as próprias linhas — não confie no filtro do front-end.
     ============================================================ */
  function datasetSupabase() {
    return ZyncAuth._supabase().then(function (sb) {
      return Promise.all([
        sb.from('clientes').select('*').single(),
        sb.from('periodos').select('*').order('fim', { ascending: false }).limit(1).single(),
        sb.from('kpis').select('*').order('ordem'),
        sb.from('insights').select('*').order('criado_em', { ascending: false }).limit(3),
        sb.from('trafego_resumo').select('*').single(),
        sb.from('trafego_campanhas').select('*').order('invest', { ascending: false }),
        sb.from('trafego_serie').select('*').order('dia'),
        sb.from('funil').select('*').order('ordem'),
        sb.from('leads_publicos').select('*').order('data', { ascending: false }).limit(50),
        sb.from('site_resumo').select('*').single(),
        sb.from('conteudo_itens').select('*').order('data', { ascending: false }).limit(20),
        sb.from('agente_ia_publico').select('*').single(),
        sb.from('entregas').select('*').order('prazo'),
        sb.from('proximos_passos').select('*').order('ordem'),
        sb.from('arquivos').select('*').order('data', { ascending: false }),
        sb.from('financeiro').select('*').single(),
        sb.from('leitura_estrategista').select('*').order('data', { ascending: false }).limit(1).single(),
        sb.from('pendencias').select('*').eq('resolvida', false).order('desde'),
        sb.from('contas_acessos').select('*').order('conta'),
      ]).then(function (r) {
        var v = function (i) { return r[i] && !r[i].error ? r[i].data : null; };
        var cli = v(0) || {};
        var traf = v(4);
        var leadsLista = v(8) || [];

        return {
          cliente: {
            nome: cli.nome, empresa: cli.empresa,
            iniciais: (cli.empresa || cli.nome || '?').split(/\s+/).slice(0, 2)
                        .map(function (p) { return p[0]; }).join('').toUpperCase(),
            plano: cli.plano, gerente: cli.gerente, gerente_cargo: cli.gerente_cargo,
            cliente_desde: cli.cliente_desde,
          },
          periodo: v(1) || {},
          kpis: v(2) || [],
          insights: v(3) || [],
          trafego: traf ? Object.assign({}, traf, {
            campanhas: v(5) || [], serie: v(6) || [],
          }) : null,
          funil: v(7) || [],
          leads: leadsLista.length ? {
            total: leadsLista.length,
            lista: leadsLista,
            qualificados: leadsLista.filter(function (l) { return l.status !== 'novo' && l.status !== 'perdido'; }).length,
          } : null,
          site: v(9),
          conteudo: (v(10) || []).length ? { itens: v(10) } : null,
          agente_ia: v(11),
          entregas: v(12) || [],
          proximos_passos: v(13) || [],
          arquivos: v(14) || [],
          financeiro: v(15),
          leitura: v(16),
          pendencias: v(17) || [],
          contas: v(18) || [],
        };
      });
    });
  }

  /* ============================================================
     API PÚBLICA
     ============================================================ */
  global.ZyncData = {
    Fmt: Fmt,

    /* Revela o telefone de um lead.
       O número completo NUNCA vem no carregamento da lista — só sob
       demanda, por uma função no servidor que grava o acesso em
       leads_acessos. Ver SETUP.md → função revelar_telefone. */
    revelarTelefone: function (leadId) {
      if (ZyncAuth.ehDemo()) {
        return new Promise(function (res) {
          var n = parseInt(leadId, 10) || 0;
          setTimeout(function () {
            res({ ok: true, fone: '(61) 9' + (1000 + (n * 1373) % 8999) + '-' + (1000 + (n * 4517) % 8999) });
          }, 260);
        });
      }
      return ZyncAuth._supabase()
        .then(function (sb) { return sb.rpc('revelar_telefone', { lead_id: leadId }); })
        .then(function (r) {
          if (r.error || !r.data) return { ok: false };
          return { ok: true, fone: r.data };
        })
        .catch(function () { return { ok: false }; });
    },

    carregar: function (sessao) {
      if (ZyncAuth.ehDemo()) {
        return new Promise(function (res) {
          setTimeout(function () { res(datasetDemo()); }, 420);
        });
      }
      return datasetSupabase();
    },
  };

})(window);
