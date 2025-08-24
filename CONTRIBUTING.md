# Contributing

Thanks for contributing to EquiTie! This guide outlines how to set up, run, and contribute changes safely.

## Setup

1. Node 20+
2. Install deps:
   ```bash
   npm install
   ```
3. Env file:
   ```bash
   cp .env.example .env.local
   # Fill in values (Supabase URL/keys, etc.)
   ```
4. Start dev:
   ```bash
   npm run dev
   # If port 3000 busy, keep existing server or free the port
   ```

## Useful Scripts

- Typecheck: `npm run typecheck`
- Lint: `npm run lint`
- E2E: `npm run test:e2e`
- Health check: `npm run health`
- Docker MCP up/down: `npm run mcp:up` / `npm run mcp:down`

## Data Modes

- Mock data: set `NEXT_PUBLIC_USE_MOCK_DATA=true` in `.env.local`
- Supabase: set `NEXT_PUBLIC_SUPABASE_URL` and key (`NEXT_PUBLIC_SUPABASE_ANON_KEY` or `SUPABASE_SERVICE_ROLE_KEY` on server)
- No app code changes required; the client switches at runtime

## Branch & Commits

- Branch: `feature/<scope>`, `fix/<scope>`, `docs/<scope>`
- Commits: short imperative line + context; reference files or routes when helpful

## Quality Gates

- Before PR: `npm run typecheck && npm run lint && npm run health`
- Keep UI classes aligned to tokens/utilities in `app/globals.css`
- Use `getDataClient()` (no direct adapter usage in pages/components)

## Adding DB Queries

- Add methods to `lib/db/supabase-unified.ts` and mirror in `lib/db/mock-adapter.ts`
- Return types from `lib/db/types.ts`
- Keep mapping from DB rows to TS entities inside the adapter

## Documentation

- Update `DOCS/FEATURE_MAP.md` and/or `DOCS/feature-map.json` when adding routes/APIs
- Update `lib/db/README.md` if adding new repos/adapters
