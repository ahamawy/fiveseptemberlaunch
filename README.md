# Equitie Investor Portal

## Quick Start

```bash
npm install
npm run dev   # http://localhost:3000
```

## Status

- ✅ All 25 tests passing
- ✅ Supabase integrated
- ✅ Mock/Production modes working

## Key Pages

- `/investor-portal/dashboard` - Main dashboard
- `/investor-portal/portfolio` - Holdings
- `/investor-portal/transactions` - Transaction history
- `/investor-portal/deals` - Available deals

## Environment Setup

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
NEXT_PUBLIC_USE_MOCK_DATA=false  # true for mock mode
OPENROUTER_API_KEY=your-openrouter-api-key  # required for AI ingestion
```

## Testing

```bash
npx playwright test        # Run all tests
npx playwright test --ui   # Debug mode
```

## Current Branch: legacydealengines

Working on admin fee management features.

## AI Ingestion

- Context doc: `DOCS/EQUITIE_BOT_CONTEXT.md`
- Endpoints:
  - POST `/api/admin/ingest/parse` — parse pasted document into structured mapping and profile suggestion
  - POST `/api/admin/ingest/apply` — stage rows (and optionally create a profile)
- UIs:
  - `/admin/fees/profiles` — Extract profile from document (AI)
  - `/admin/fees/import` — Parse document with AI and stage
