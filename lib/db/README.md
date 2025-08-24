# Database Layer Overview

This folder centralizes all database access for the EquiTie platform. It provides a clear, typed API that works in both Mock and Supabase modes with the same interface.

## Architecture

- `client.ts` — Single entry point. Chooses Mock vs Supabase at runtime based on env.
- `supabase-unified.ts` — Supabase adapter with view/table compatibility and mapping helpers.
- `mock-adapter.ts` — In-memory/mock datasets for local development.
- `types.ts` — Canonical, typed entities and API contracts.
- `repos/` — Higher-level query helpers grouped by domain.
- `schema/` — DB schema references for context.

## Environment Switching

- Mock mode: set `NEXT_PUBLIC_USE_MOCK_DATA=true` or leave Supabase env missing.
- Supabase mode: set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (or service role on server).
- Switching requires no code changes — the `IDataClient` interface is identical.

## Naming Conventions

- Use schema-qualified names (`investors.investor`) when reading from Supabase views.
- Keep method names verb-first and domain-specific: `getDeals`, `getInvestorById`, `getTransactions`.
- Map DB fields to TypeScript entities in adapter mappers to keep UI strictly typed.

## How to Add Queries

1. Prefer adding to the `UnifiedSupabaseAdapter` and Mock adapter with matching signatures.
2. Return types from `lib/db/types.ts`.
3. Avoid leaking raw Supabase types beyond the adapter.

## Health & Diagnostics

- `/api/health/supabase` uses `lib/db/supabase/status.ts` to report configuration and table access.
- `SCRIPTS/health-check.js` includes API and page smoke tests.

## Quick Usage

```ts
import { getDataClient } from '@/lib/db/client';

const client = getDataClient();
const deals = await client.getDeals({ stage: 'active' });
```
