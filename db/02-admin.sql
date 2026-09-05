-- ============================================================
-- ZYNC — Painel do Administrador · schema do CRM interno
-- ------------------------------------------------------------
-- Extraído de zync-docs/SETUP-ADMIN.md em 05/09/2026.
-- Já aplicado no projeto zync-portal nesta data.
-- ============================================================

-- ============================================================
-- PAINEL ADMIN — quem é da Zync
-- ============================================================
-- Tabela minúscula e proposital: ser admin é pertencer a esta
-- lista. Sem coluna de papel espalhada por outras tabelas.
create table if not exists admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  nome    text not null,
  criado_em timestamptz not null default now()
);

alter table admins enable row level security;

-- Função de conveniência: usada por TODAS as policies, inclusive a
-- da própria tabela admins. É security definer de propósito: roda
-- como dona da tabela e não reaplica RLS.
create or replace function e_admin() returns boolean
language sql security definer stable
set search_path = public
as $$ select exists (select 1 from admins where user_id = auth.uid()) $$;

-- ATENÇÃO: a policy de admins TEM que passar por e_admin().
-- Escrever "exists (select 1 from admins ...)" direto aqui cria
-- recursão infinita — a policy sobre admins consultando admins.
-- Esse erro foi cometido e corrigido em 05/09/2026.
create policy "admins leem admins" on admins
  for select using (e_admin());


-- ============================================================
-- CLIENTES DO PAINEL (CRM interno)
-- ============================================================
-- Separado da tabela `clientes` do portal de propósito: lá é
-- "quem tem login"; aqui é "quem está no funil", incluindo
-- prospect que nunca vai ter acesso a portal nenhum.
create table if not exists crm_clientes (
  id                uuid primary key default gen_random_uuid(),
  slug              text unique not null,
  empresa           text not null,
  contato_nome      text,
  contato_papel     text,
  segmento          text,
  cidade            text,
  status            text not null default 'prospect'
                    check (status in ('prospect','proposta','cliente','perdido','pausado')),
  desde             date,
  valor_mensal      numeric(10,2),
  valor_implantacao numeric(10,2),
  resumo            text,
  criado_em         timestamptz not null default now(),
  atualizado_em     timestamptz not null default now()
);

create table if not exists crm_reunioes (
  id            uuid primary key default gen_random_uuid(),
  cliente_id    uuid not null references crm_clientes(id) on delete cascade,
  data          date not null,
  titulo        text not null,
  resumo        text,
  participantes text[],
  notas_url     text,   -- doc de anotações do Gemini no Drive
  gravacao_url  text,   -- vídeo no Drive
  pontos        jsonb,  -- [{t:"00:12:33", texto:"..."}]
  criado_em     timestamptz not null default now()
);

create table if not exists crm_apresentacoes (
  id          uuid primary key default gen_random_uuid(),
  cliente_id  uuid not null references crm_clientes(id) on delete cascade,
  titulo      text not null,
  data        date,
  url_publica text,   -- link que vai para o cliente
  caminho     text,   -- caminho do arquivo no repositório
  status      text not null default 'rascunho'
              check (status in ('rascunho','enviada','apresentada','aceita','recusada')),
  criado_em   timestamptz not null default now()
);

create table if not exists crm_timeline (
  id         uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references crm_clientes(id) on delete cascade,
  data       date not null,
  tipo       text not null default 'nota'
             check (tipo in ('reuniao','proposta','fechamento','perda','pagamento','nota')),
  texto      text not null,
  criado_em  timestamptz not null default now()
);

create table if not exists crm_passos (
  id         uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references crm_clientes(id) on delete cascade,
  texto      text not null,
  prazo      date,
  feito      boolean not null default false,
  criado_em  timestamptz not null default now()
);

create index if not exists ix_reunioes_cli    on crm_reunioes(cliente_id, data desc);
create index if not exists ix_apres_cli       on crm_apresentacoes(cliente_id, data desc);
create index if not exists ix_timeline_cli    on crm_timeline(cliente_id, data desc);
create index if not exists ix_passos_cli      on crm_passos(cliente_id, feito, prazo);


-- ============================================================
-- RLS — nenhuma tabela sem policy
-- ============================================================
-- Todas as tabelas do painel são "só admin", leitura e escrita.
-- Cliente logado no portal NÃO enxerga nada daqui.
do $$
declare t text;
begin
  foreach t in array array['crm_clientes','crm_reunioes','crm_apresentacoes','crm_timeline','crm_passos']
  loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists "admin total" on %I', t);
    execute format(
      'create policy "admin total" on %I for all using (e_admin()) with check (e_admin())', t);
  end loop;
end $$;
