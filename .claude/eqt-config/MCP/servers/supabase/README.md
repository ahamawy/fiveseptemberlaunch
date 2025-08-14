This server exposes a tiny MCP toolset for Supabase.

**Important:** `supabase.sql.query` is SELECT-only. For writes, generate a migration file via `supabase.sql.migrate` and run it through your normal migration pipeline.

Install deps in this folder:
```
npm i @supabase/supabase-js @modelcontextprotocol/sdk
```
Then run:
```
node MCP/servers/supabase/index.mjs
```
