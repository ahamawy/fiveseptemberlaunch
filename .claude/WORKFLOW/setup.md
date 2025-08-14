# Setup & Keys

1) Copy `.env.example` → `.env` and fill:
   - `SUPABASE_URL` — your project URL
   - `SUPABASE_ANON_KEY` — public key (frontend reads)
   - `SUPABASE_SERVICE_ROLE_KEY` — secret (server-only)
   - `SUPABASE_SCHEMA` — e.g. `equitie`
   - `SCHEMA_ID` — version tag (e.g., eqt-2025-08-12-001)

2) Apply roles and grants:
```
psql -f DB/roles.sql
psql -f DB/permissions.sql
```

3) Run migrations:
```
psql -f DB/migrations/000_init.sql
psql -f DB/migrations/001_views.sql
# (whatever else you add)
```

4) Policies:
- Start from `DB/policies/BASE_RLS.sql` and extend per table.

5) Claude MCP:
- Ensure Node deps installed for MCP server (`npm i` in `MCP/servers/supabase`).
- Add `MCP/mcp.json` servers to Claude Desktop config or use `clients/claude.config.json` as a reference.
