# Migrações do banco

SQL aplicado no projeto Supabase **`zync-portal`** (`okybfmwlcddbgasafndk`,
org Zync, AWS São Paulo). Rodar em ordem, no SQL Editor.

| Arquivo | O que cria |
|---|---|
| `01-portal.sql` | Área do Cliente: 22 tabelas, 2 views, `meu_cliente_id()`, `revelar_telefone()`, RLS por cliente |
| `02-admin.sql` | Painel interno: `admins`, 5 tabelas `crm_*`, `e_admin()`, RLS por admin |

## Por que isto está num repositório público

Schema não é segredo. O que protege os dados são as policies de Row Level
Security no banco — não o desconhecimento dos nomes das tabelas. Ter a migração
versionada é o que permite recriar o banco do zero e auditar o que mudou.

**Conteúdo de cliente nunca entra aqui.** Nenhum `insert` com dado real neste
diretório.

## A regra que não se negocia

Toda tabela nova nasce com RLS ligada e uma policy, na mesma transação. Confira
depois de qualquer alteração — tem que voltar zero linhas:

```sql
select tablename from pg_tables
where schemaname = 'public' and rowsecurity = false;
```

## Ordem de aplicação e estado

- `02-admin.sql` — aplicado em 05/09/2026.
- `01-portal.sql` — aplicado em 05/09/2026.
