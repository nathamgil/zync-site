/* ============================================================
   Zync — Painel do Administrador · CONFIGURAÇÃO
   ------------------------------------------------------------
   Único arquivo a editar para ligar o painel ao Supabase.
   Passo a passo: nathamlife\zync-docs\SETUP-ADMIN.md
   ============================================================ */

window.ZYNC_ADMIN = {

  /* -----------------------------------------------------------
     'local'    → lê dados-locais.js (fora do repositório).
                  Funciona só na sua máquina. É o modo de hoje.

     'supabase' → lê as tabelas crm_* com RLS de admin, usando
                  as credenciais de area-cliente/config.js.
     ----------------------------------------------------------- */
  mode: 'supabase',

};
