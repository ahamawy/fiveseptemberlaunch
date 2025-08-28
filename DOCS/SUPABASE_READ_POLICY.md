### Supabase Read Policy (Investor Portal)

Principles

- Server routes use `lib/db/supabase/server-client.ts` (service-role key).
- Public dot-named tables are table names, not schema refs: `from("deals.deal")`, `from("companies.company")`.
- No schema changes in portal work. Respect existing RLS where applicable.
- Portfolio schema access: use `(client as any).schema('portfolio')` server-side. Do NOT create public shadow views for `portfolio.*`.
- Audit schema read-only: access `audit.investment_entries`, `audit.net_capital_entries`, `audit.nav_cascade_log` via service-role only; never expose to client.

Do

- In API routes, call repos/services; repos perform all Supabase access.
- Use `from("schema.table")` ONLY for non-public schemas via `.schema(<schema>)` (e.g., `portfolio.deal_company_positions` via `.schema("portfolio")`).
- For audit tables: `.schema("audit").from("nav_cascade_log")` read-only in admin contexts.
- Order and page queries server-side; avoid large client merges.

Don’t

- Use `schema("deals").from("deal")` for public dot-named tables.
- Create public views or rules to proxy `portfolio.*` tables.
- Query Supabase directly from components.
- Fetch more than needed (prefer selected columns and ranges).

Error handling

- Log `error.message` only; never leak keys.
- Return 200 with `{ success: false, error }` only for health/diagnostic endpoints; otherwise use proper HTTP codes.

References

- `DOCS/SUPABASE_SCHEMA.md` — dot-named table notes and examples; portfolio schema access
- `DOCS/API.md` — endpoints and cross-schema patterns
 - `EQUITIELOGIC/FORMULA_ENGINE_SCHEMA_MAPPING.md` — NC entry points and portfolio flow

External assets & CI

- Storage images are served via Supabase Storage and may be blocked in CI (ORB). Do not couple tests to successful image network loads.
- Prefer asserting presence of logo placeholders/containers.
