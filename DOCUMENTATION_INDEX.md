# Documentation Index

## Core Docs

- **[CLAUDE.md](./CLAUDE.md)** - Main context for Claude Code (159 lines)
- **[MASTER_CONTEXT.md](./MASTER_CONTEXT.md)** - Complete AI bot context (350 lines)
- **[README.md](./README.md)** - Quick start guide
- **[DOCS/API.md](./DOCS/API.md)** - API endpoints reference

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
- Fees: `/admin/fees/profiles`

## Last Updated: 2025-08-17
