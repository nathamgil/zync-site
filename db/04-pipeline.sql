-- ============================================================
-- ZYNC — Painel do Administrador · funil de leads (pipeline)
-- ------------------------------------------------------------
-- 27/10/2026. Transforma crm_clientes no funil completo:
-- cada site feito para um lead vira uma linha, com etapa do
-- kanban, links, próximo contato e o que falta.
-- Idempotente: rodar de novo é seguro. Sem dado de cliente.
-- ============================================================

-- Etapa do kanban. `status` continua existindo (a ficha antiga
-- usa) e é mantido em sincronia pelo gatilho abaixo.
alter table crm_clientes add column if not exists etapa text not null default 'site_pronto';
alter table crm_clientes drop constraint if exists crm_clientes_etapa_check;
alter table crm_clientes add constraint crm_clientes_etapa_check check (etapa in (
  'site_pronto','contatado','conversa','proposta','cliente',
  'followup','perdido','encerrado','presente'));

alter table crm_clientes add column if not exists site_url        text;
alter table crm_clientes add column if not exists links           jsonb not null default '[]'::jsonb; -- [{rotulo,url}]
alter table crm_clientes add column if not exists whatsapp        text;
alter table crm_clientes add column if not exists instagram       text;
alter table crm_clientes add column if not exists review          text;   -- o que o site faz
alter table crm_clientes add column if not exists falta           text;   -- o que confirmar com o dono
alter table crm_clientes add column if not exists valor_texto     text;   -- proposta como foi falada
alter table crm_clientes add column if not exists proximo_contato date;
alter table crm_clientes add column if not exists proximo_passo   text;
alter table crm_clientes add column if not exists notas           text;
alter table crm_clientes add column if not exists ultimo_contato  date;
alter table crm_clientes add column if not exists site_criado_em  date;
alter table crm_clientes add column if not exists ordem           double precision not null default 0;

-- Linhas antigas: etapa a partir do status.
update crm_clientes set etapa = case status
  when 'cliente'  then 'cliente'
  when 'proposta' then 'proposta'
  when 'perdido'  then 'perdido'
  when 'pausado'  then 'followup'
  else 'conversa' end
where etapa = 'site_pronto' and site_url is null and criado_em < '2026-10-27';

-- status segue a etapa (a ficha e o MRR do topo leem status)
create or replace function crm_sincroniza_status() returns trigger
language plpgsql as $$
begin
  new.status := case new.etapa
    when 'cliente'   then 'cliente'
    when 'proposta'  then 'proposta'
    when 'conversa'  then 'proposta'
    when 'followup'  then 'pausado'
    when 'perdido'   then 'perdido'
    when 'encerrado' then 'perdido'
    else 'prospect' end;
  new.atualizado_em := now();
  return new;
end $$;

drop trigger if exists tg_crm_status on crm_clientes;
create trigger tg_crm_status before insert or update on crm_clientes
  for each row execute function crm_sincroniza_status();

create index if not exists ix_crm_etapa on crm_clientes(etapa, ordem);
create index if not exists ix_crm_prox  on crm_clientes(proximo_contato);

-- Histórico ganha o tipo "contato" (o botão "Contatei hoje").
alter table crm_timeline drop constraint if exists crm_timeline_tipo_check;
alter table crm_timeline add constraint crm_timeline_tipo_check check (tipo in (
  'reuniao','proposta','fechamento','perda','pagamento','nota','contato','etapa'));

-- Conferência: tem que voltar zero linhas.
select tablename from pg_tables where schemaname = 'public' and rowsecurity = false;
