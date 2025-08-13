# TECH_STACK.md

- **Frontend**: Next.js (App Router) + TypeScript + TailwindCSS + Radix + CVA + shadcn primitives.
- **Backend**: Supabase (Postgres + Auth) + Edge Functions where needed.
- **Data**: Postgres SQL migrations (this pack), Materialized Views for dashboards.
- **Search**: Postgres FTS (GIN) + trigram indexes.
- **Queue/Jobs**: Supabase functions/cron or lightweight worker (Deno/Node) + `api.event_outbox` pattern.
- **Auth & RBAC**: Supabase Auth + RLS (row-level security).
- **Docs**: This repo; generated OpenAPI (future).
- **Observability**: HTTP logs + basic p95 metrics in app; DB `ops.audit_log`.

## Coding Conventions
- `snake_case` for tables; `camelCase` in TS.
- Money: `numeric(20,4)`; Rates: `numeric(20,8)`; Currency: `char(3)`.
- Default columns: `created_at`, `updated_at`, `public_id` when exposing externally.
