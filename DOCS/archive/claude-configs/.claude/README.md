# EQT Config (Unified)

Generated: 2025-08-12

This pack **combines** the core config and the guardrails pack, and adds **MCP** (Model Context Protocol) wiring so Claude can read the schema, run safe SQL, and scaffold features on the spot.

**What you do first**
1. Copy `.env.example` → `.env` and fill `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_SCHEMA`, `SCHEMA_ID`.
2. Apply DB roles + perms: `psql -f DB/roles.sql && psql -f DB/permissions.sql` (or run via Supabase SQL editor).
3. Run migrations in `DB/migrations/` (Supabase CLI or your migrator).
4. In Claude Desktop, add `MCP/mcp.json` servers to the config (see `MCP/README.md`).

Then juniors can generate a feature folder and pair with Claude using the included templates.
