# Equitie Investor Portal

## Quick Start

```bash
npm install
npm run dev   # http://localhost:3000
```

## Key Features

### Investor Portal

- `/investor-portal/dashboard` - Portfolio metrics
- `/investor-portal/portfolio` - Holdings
- `/investor-portal/transactions` - History
- `/investor-portal/deals` - Opportunities

### Admin Tools

- `/admin/chat` - AI assistant with fee calculations
- `/admin/formulas` - Formula templates, assignments, testing
- `/admin/formula-manager` - Visual formula editor
- `/admin/fees/profiles` - Legacy fee profiles

## Environment Setup

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
# New API key format (2025+) - both formats supported
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_xxx
NEXT_PUBLIC_USE_MOCK_DATA=false
OPENROUTER_API_KEY=your-key
# Database connection (for migrations/scripts)
DATABASE_URL=postgresql://postgres.project:password@region.pooler.supabase.com:6543/postgres
```

**Important Notes:**
- Node.js 20+ recommended (warnings shown for v18 and below)
- Supabase supports both old JWT format and new publishable key format (sb_publishable_*)
- The system automatically detects and uses the appropriate key format

### Supabase Schema Access

- Use `@supabase/supabase-js` with explicit schemas for cross‑schema tables:
  - Deals: `client.schema('deals').from('deal')`
  - Companies: `client.schema('companies').from('company')`
  - Public tables (e.g., `deal_formula_templates`) use default schema

## Testing

```bash
npx playwright test      # All tests
npx playwright test --ui  # Interactive
```

## ARCHON Fee Engine

- Precedence-based ordering (PREMIUM first)
- Basis: GROSS | NET | NET_AFTER_PREMIUM
- Discounts as negative amounts
- Full audit trail

## Formula System

- Database‑driven formula templates and per‑deal assignments
- API:
  - `GET/POST /api/deals/[id]/formula`
  - `POST /api/deals/[id]/calculate`, `GET /api/deals/[id]/calculate`
- Admin UI: `/admin/formulas`, `/admin/formula-manager`

## Documentation

- **Main**: [CLAUDE.md](./CLAUDE.md)
- **Bot Context**: [MASTER_CONTEXT.md](./MASTER_CONTEXT.md)
- **API**: [DOCS/API.md](./DOCS/API.md)
  - Investors endpoint `/api/investors/[id]` accepts numeric id or `public_id`

## Database Sync (Drizzle)

- Add `SUPABASE_DB_URL` to `.env.local` (direct Postgres URL for your Supabase project).
- Generate typed schema from the live DB (read-only sync):
  ```bash
  npm run db:drizzle:introspect
  ```
- Keep DDL in SQL under `DB/migrations/` (source of truth for schema changes).
- App runtime: use `@supabase/supabase-js` (RLS-aware). Use `createDrizzleDirectClient()` ONLY for server scripts/ops.

## MCP Tooling (Docker-only)

- Run MCP services via Docker for isolation and modularity; avoid host-bound processes.
- Example pattern:
  ```bash
  docker run --rm \
    --env-file ./.env.local \
    -v "$PWD":/workspace \
    -w /workspace \
    your-mcp-image:latest
  ```

## Chat Commands

```text
"Calculate fees for deal 1 with $1M"
"Import CSV" → Upload file
"Show fee schedule"
```

## Project Structure

```
/app              # Pages & API
/lib/services     # Service layer
/lib/db          # Database
/components      # UI components
/BRANDING       # Design tokens
```

## Status

✅ Supabase integrated
✅ ARCHON Fee Engine operational
✅ 25 tests passing
✅ AI assistant active

Branch: `dealformulas`
