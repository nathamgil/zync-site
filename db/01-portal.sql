-- ============================================================
-- ZYNC — Área do Cliente · schema do portal
-- ------------------------------------------------------------
-- Extraído de zync-docs/SETUP.md (seções 4 e 5) em 05/09/2026.
-- Idempotente o suficiente para rodar de novo sem quebrar.
--
-- Schema não é segredo: o que protege os dados são as policies
-- de RLS, não o desconhecimento das tabelas. Por isso ele mora
-- no repositório, versionado. Conteúdo de cliente, nunca.
-- ============================================================

-- ============================================================
-- 1. CLIENTES E VÍNCULO COM O LOGIN
-- ============================================================

create table clientes (
  id             uuid primary key default gen_random_uuid(),
  empresa        text not null,
  nome           text,                 -- pessoa de contato
  plano          text,
  gerente        text,
  gerente_cargo  text,
  cliente_desde  date,
  ativo          boolean not null default true,
  criado_em      timestamptz not null default now()
);

-- liga um usuário do Auth a um cliente. Um login por empresa.
create table perfis (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  cliente_id uuid not null references clientes(id) on delete cascade
);

-- resolve o cliente do usuário logado. SECURITY DEFINER para poder ler
-- perfis sem entrar em recursão de policy.
create or replace function meu_cliente_id()
returns uuid
language sql stable security definer set search_path = public
as $$ select cliente_id from perfis where user_id = auth.uid() $$;

-- ============================================================
-- 2. TABELAS DE CONTEÚDO
-- Toda tabela carrega cliente_id. É a coluna sobre a qual a RLS decide.
-- ============================================================

create table periodos (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references clientes(id) on delete cascade,
  label text, inicio date, fim date,
  comparado_com text, atualizado_em timestamptz default now()
);

create table kpis (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references clientes(id) on delete cascade,
  ordem int not null default 0,
  label text not null,
  valor numeric,
  fmt text default 'num',          -- num | brl | brl0 | pct | mult
  delta numeric,
  inverso boolean default false,   -- true quando cair é bom (ex.: CPL)
  neutro  boolean default false,
  hint text,
  nota text check (char_length(nota) <= 200),  -- anotação ancorada no número
  spark numeric[]
);

create table insights (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references clientes(id) on delete cascade,
  tipo text default 'ganho',       -- ganho | atencao
  titulo text, texto text,
  criado_em timestamptz default now()
);

create table leitura_estrategista (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references clientes(id) on delete cascade,
  data date not null,
  autor text, cargo text, iniciais text,
  titulo text, paragrafos text[]
);

create table trafego_resumo (
  cliente_id uuid primary key references clientes(id) on delete cascade,
  impressoes bigint, cliques bigint, ctr numeric, cpc numeric,
  investimento numeric, leads int, cpl numeric,
  qualificados int, custo_qualificado numeric,
  tempo_medio_resposta text  -- ex.: "4h20" · preenchido no fechamento mensal
);

create table trafego_campanhas (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references clientes(id) on delete cascade,
  nome text, canal text, status text,
  invest numeric, leads int, cpl numeric, ctr numeric
);

create table trafego_serie (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references clientes(id) on delete cascade,
  dia text, invest numeric, leads int
);

create table funil (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references clientes(id) on delete cascade,
  ordem int not null default 0,
  etapa text, valor bigint
);

create table site_resumo (
  cliente_id uuid primary key references clientes(id) on delete cascade,
  url text, visitas bigint, usuarios_novos bigint,
  tempo_medio text, taxa_conversao numeric,
  performance int, uptime numeric,
  top_paginas jsonb default '[]'::jsonb,
  origens jsonb default '[]'::jsonb
);

create table conteudo_itens (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references clientes(id) on delete cascade,
  data date, canal text, titulo text, alcance bigint, eng numeric
);

-- Resumo do mês de conteúdo. publicados/alcance/engajamento são
-- CALCULADOS no front a partir de conteudo_itens; aqui ficam só os
-- números que não dá para derivar de um item individual.
create table conteudo_resumo (
  cliente_id uuid primary key references clientes(id) on delete cascade,
  seguidores_novos int, delta_alcance numeric
);

create table agente_ia (
  cliente_id uuid primary key references clientes(id) on delete cascade,
  ativo boolean default true,
  conversas int, resolvidas_sem_humano int, taxa_resolucao numeric,
  leads_gerados int, tempo_medio_resposta text,
  horario_pico text, fora_horario int,
  serie jsonb default '[]'::jsonb,
  top_perguntas jsonb default '[]'::jsonb,
  conversas_recentes jsonb default '[]'::jsonb,
  -- margem: nunca exibido ao cliente, mas registrado desde o primeiro dia.
  -- Retroagir custo depois é impossível.
  custo_conversa numeric,
  custo_bsp numeric
);

create table entregas (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references clientes(id) on delete cascade,
  titulo text, "desc" text,
  status text default 'pendente',   -- concluido | andamento | pendente
  prazo date
);

create table proximos_passos (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references clientes(id) on delete cascade,
  ordem int default 0,
  titulo text, "desc" text, prazo text
);

create table pendencias (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references clientes(id) on delete cascade,
  titulo text, "desc" text,
  urgencia text default 'media',    -- alta | media | baixa
  desde date default current_date,
  resolvida boolean not null default false
);

create table arquivos (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references clientes(id) on delete cascade,
  nome text, tipo text, tam text, data date, url text
);

create table financeiro (
  cliente_id uuid primary key references clientes(id) on delete cascade,
  fee_mensal numeric, verba_aprovada numeric, verba_usada numeric,
  proxima_cobranca date, contrato_ate date, status_pagamento text
);

create table contas_acessos (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references clientes(id) on delete cascade,
  conta text, proprietario text, papel text, status text default 'ativo'
);

-- ============================================================
-- 3. LEADS — dado pessoal, tratamento separado
-- ============================================================

create table leads (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references clientes(id) on delete cascade,
  data date not null default current_date,
  nome text,
  telefone text,          -- só dígitos: 61982503561
  origem text, campanha text,
  responsavel text,       -- corretor / vendedor que atendeu
  t1 text,                -- tempo até o 1º contato: '6 min', '4h20'
  status text default 'novo'
);

-- log de quem revelou qual telefone e quando
create table leads_acessos (
  id bigserial primary key,
  lead_id uuid not null references leads(id) on delete cascade,
  user_id uuid not null default auth.uid(),
  visto_em timestamptz not null default now()
);

-- O portal NUNCA lê a tabela leads direto: lê esta view, que já entrega
-- o telefone mascarado e filtra pelo cliente do usuário logado.
create or replace view leads_publicos with (security_invoker = off) as
  select id, cliente_id, data, nome,
         '(' || left(telefone, 2) || ') 9****-**' || right(telefone, 2) as fone,
         origem, campanha, responsavel, t1, status
    from leads
   where cliente_id = meu_cliente_id()
     and data >= current_date - interval '90 days';   -- retenção declarada na tela

-- revela o número completo, registrando o acesso
create or replace function revelar_telefone(lead_id uuid)
returns text
language plpgsql security definer set search_path = public
as $$
declare v_fone text; v_cli uuid;
begin
  select telefone, cliente_id into v_fone, v_cli from leads where id = lead_id;
  if v_cli is null or v_cli is distinct from meu_cliente_id() then
    raise exception 'sem permissao';
  end if;
  insert into leads_acessos(lead_id) values (lead_id);
  return v_fone;
end $$;

do $$
declare t text;
begin
  foreach t in array array[
    'clientes','perfis','periodos','kpis','insights','leitura_estrategista',
    'trafego_resumo','trafego_campanhas','trafego_serie','funil',
    'site_resumo','conteudo_itens','conteudo_resumo','agente_ia','entregas','proximos_passos',
    'pendencias','arquivos','financeiro','contas_acessos','leads','leads_acessos'
  ]
  loop
    execute format('alter table %I enable row level security', t);
    execute format('revoke all on %I from anon, authenticated', t);
  end loop;
end $$;

-- leitura: só as linhas do próprio cliente
do $$
declare t text;
begin
  foreach t in array array[
    'periodos','kpis','insights','leitura_estrategista','trafego_resumo',
    'trafego_campanhas','trafego_serie','funil','site_resumo','conteudo_itens',
    'conteudo_resumo','agente_ia','entregas','proximos_passos','pendencias','arquivos',
    'financeiro','contas_acessos'
  ]
  loop
    execute format('drop policy if exists le_proprio on %I', t);
    execute format(
      'create policy le_proprio on %I for select to authenticated
         using (cliente_id = meu_cliente_id())', t);
    execute format('grant select on %I to authenticated', t);
  end loop;
end $$;

-- clientes: a linha da própria empresa
drop policy if exists le_proprio on clientes;
create policy le_proprio on clientes for select to authenticated
  using (id = meu_cliente_id());
grant select on clientes to authenticated;

-- a view já filtra e mascara; a tabela leads continua fechada
grant select on leads_publicos to authenticated;
grant execute on function revelar_telefone(uuid) to authenticated;

-- agente_ia: esconde as colunas de margem do cliente
revoke select on agente_ia from authenticated;
create or replace view agente_ia_publico with (security_invoker = off) as
  select cliente_id, ativo, conversas, resolvidas_sem_humano, taxa_resolucao,
         leads_gerados, tempo_medio_resposta, horario_pico, fora_horario,
         serie, top_perguntas, conversas_recentes
    from agente_ia where cliente_id = meu_cliente_id();
grant select on agente_ia_publico to authenticated;
