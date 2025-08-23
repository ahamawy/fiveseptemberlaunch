### Supabase Read Policy (Investor Portal)

Principles
- Server routes use `lib/db/supabase/server-client.ts` (service-role key).
- Public dot-named tables are table names, not schema refs: `from("deals.deal")`, `from("companies.company")`.
- No schema changes in portal work. Respect existing RLS where applicable.

Do
- In API routes, call repos/services; repos perform all Supabase access.
- Use `from("schema.table")` ONLY for non-public schemas (e.g., `documents.document` via `.schema("documents")`) when required.
- Order and page queries server-side; avoid large client merges.

Don’t
- Use `schema("deals").from("deal")` for public dot-named tables.
- Query Supabase directly from components.
- Fetch more than needed (prefer selected columns and ranges).

Error handling
- Log `error.message` only; never leak keys.
- Return 200 with `{ success: false, error }` only for health/diagnostic endpoints; otherwise use proper HTTP codes.

References
- `DOCS/SUPABASE_SCHEMA.md` — dot-named table notes and examples
- `DOCS/API.md` — endpoints and cross-schema patterns


