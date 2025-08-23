# Documentation Index

## Core Docs

- **[CLAUDE.md](./CLAUDE.md)** - Main context for Claude Code (159 lines)
- **[MASTER_CONTEXT.md](./MASTER_CONTEXT.md)** - Complete AI bot context (350 lines)
- **[README.md](./README.md)** - Quick start guide
- **[DOCS/API.md](./DOCS/API.md)** - API endpoints reference
- **[DOCS/SUPABASE_SCHEMA.md](./DOCS/SUPABASE_SCHEMA.md)** - Supabase table naming & schema gotchas

## ARCHON Fee Engine

- **[DOCS/ARCHON.md](./DOCS/ARCHON.md)** - Fee calculation guide
- **[DOCS/CSV_FORMATS.md](./DOCS/CSV_FORMATS.md)** - Import formats
- **Tests**: `lib/services/fee-engine/__tests__/`

## Per-Feature (Canonical)

- **[DOCS/FEATURES_GUIDE.md](./DOCS/FEATURES_GUIDE.md)** — How feature docs are organized
- **[FEATURES/fees/README.md](./FEATURES/fees/README.md)** — Fees (canonical)
- **[FEATURES/deals/README.md](./FEATURES/deals/README.md)** — Deals (canonical)
- **[FEATURES/investors/README.md](./FEATURES/investors/README.md)** — Investors (canonical)
- **[FEATURES/transactions/README.md](./FEATURES/transactions/README.md)** — Transactions (canonical)
- **[FEATURES/documents/README.md](./FEATURES/documents/README.md)** — Documents (canonical)
- **[FEATURES/investor-portal/README.md](./FEATURES/investor-portal/README.md)** — Investor Portal (canonical)

## Configuration

- **[.env.example](./.env.example)** - Environment template
- **[BRANDING/](./BRANDING/)** - Brand tokens and styles
- **[ultrathink/](./ultrathink/)** - Feature context files

## Quick Links

### Start Here

```bash
npm install
npm run dev
open http://localhost:3000/investor-portal/dashboard
```

### Journeys

- Investor Journey:

  - Entry: `/investor-portal/select` → enter investor ID or public_id
  - Dashboard: `/investor-portal/dashboard?investor=<id>`
  - Portfolio: `/investor-portal/portfolio?investor=<id>`
  - Transactions: `/investor-portal/transactions?investor=<id>`
  - Deals: `/investor-portal/deals?investor=<id>`

- Admin Journey:
  - Fees Hub: `/admin/fees`
  - All Deals: `/admin/deals`
  - All Transactions: `/admin/transactions`

### Test

```bash
npx playwright test
```

### Database Sync (Drizzle)

```bash
export SUPABASE_DB_URL=postgresql://postgres:password@db.<ref>.supabase.co:5432/postgres
npm run db:drizzle:introspect
```

### MCP via Docker (required)

```bash
docker run --rm --env-file ./.env.local -v "$PWD":/workspace -w /workspace your-mcp-image:latest
```

### Admin Tools

- Chat: `/admin/chat`
- Formula System: `/admin/formulas`
- Formula Manager: `/admin/formula-manager`
- Fees Hub: `/admin/fees`
- Fee Profiles: `/admin/fees/profiles`
- Fee Import V2: `/admin/fees/import-v2`
- Smart Import: `/admin/fees/smart-import`
- Legacy Import: `/admin/fees/import`
- Fee Editor: `/admin/fees/editor`
- Bespoke Import: `/admin/fees/bespoke`
- ARCHON Fee Engine: `/admin/equitie-fee-engine`
- Deal Equations: `/admin/deal-equations`

## UI & Visualization

- Chart wrappers (brand-themed):
  - Chart.js: `components/ui/Charts.tsx`
  - Nivo: `components/ui/NivoCharts.tsx`
  - Victory: `components/ui/VictoryCharts.tsx`
- Motion helper: `components/ui/Motion.tsx`
- Drag & Drop: `components/ui/DnD.tsx`

## Last Updated: 2025-08-22
