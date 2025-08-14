# MCP (Model Context Protocol) Wiring

This lets Claude use tools to read schema and propose migrations safely.

## 1) Configure Claude Desktop (or Claude Code)
Add the servers from `MCP/mcp.json` to your Claude config.
Set env vars from `.env` in your shell before launching Claude.

## 2) Tools exposed
- `supabase.sql.query`    — **read-only** SELECT (guards against writes)
- `supabase.sql.migrate`  — writes SQL file into `DB/migrations/` (no direct DDL to DB)
- `supabase.storage.upload` — optional helper to stash artifacts

## 3) Security
- Use `SUPABASE_ANON_KEY` for queries that respect RLS.
- Use `SUPABASE_SERVICE_ROLE_KEY` **only** if a migration preview needs metadata.
- Policies still apply; the server blocks non-SELECT queries for `sql.query`.

Run locally:
```
node MCP/servers/supabase/index.mjs
```
