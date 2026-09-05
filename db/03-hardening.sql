-- ============================================================
-- ZYNC — Endurecimento de privilégios
-- ------------------------------------------------------------
-- O Supabase concede, por padrão, acesso a `anon` e
-- `authenticated` em toda tabela nova do schema public. A RLS
-- ainda barra a leitura, mas privilégio concedido é superfície
-- de ataque desnecessária — e as VIEWS são o caso perigoso:
-- `leads_publicos` e `agente_ia_publico` são security definer,
-- ou seja, rodam como dono e NÃO reaplicam RLS. Hoje elas se
-- protegem porque filtram por meu_cliente_id(), que devolve
-- nulo para anônimo. Isso é uma proteção só, e frágil.
--
-- Aqui `anon` perde acesso a tudo no schema public, agora e no
-- futuro. Anônimo só fala com o GoTrue para autenticar.
--
-- Aplicado em 05/09/2026.
-- ============================================================

revoke all on all tables in schema public from anon;
revoke all on all sequences in schema public from anon;
revoke all on all functions in schema public from anon;

-- tabela criada amanhã já nasce fechada para anon
alter default privileges in schema public revoke all on tables from anon;
alter default privileges in schema public revoke all on sequences from anon;
alter default privileges in schema public revoke all on functions from anon;

-- o painel admin escreve; o portal do cliente é só leitura.
-- crm_*: authenticated pode tudo, e a RLS (e_admin) decide quem é.
grant select, insert, update, delete on
  crm_clientes, crm_reunioes, crm_apresentacoes, crm_timeline, crm_passos
  to authenticated;
grant select on admins to authenticated;
