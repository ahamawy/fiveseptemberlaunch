# Claude Pairing Instructions (Unified)

Use the per-feature template in `GUARDRAILS/TEMPLATES/CLAUDE_FEATURE_PROMPT_TEMPLATE.md`.
Additionally, Claude may use MCP tools (see `MCP/README.md`) to:
- `supabase.sql.query` – read-only SELECTs to inspect shape/sample rows
- `supabase.sql.migrate` – create migration sketches (outputs SQL into `DB/migrations`)
- `supabase.storage.upload` – store generated artifacts (optional)

Always finish with:
- DTO + zod validation
- RLS confirmation
- Unit + Playwright E2E tests
- Update `FEATURE.md` success metrics
