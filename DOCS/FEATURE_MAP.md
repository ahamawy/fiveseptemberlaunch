## Feature Map

This overview helps developers and AI agents navigate the codebase quickly. For each feature, we list routes, APIs, and key files. Keep this concise and update when adding features.

- fees
  - routes: `/admin/fees`
  - apis: `/api/admin/fees/*`
  - key files: `lib/services/fee-engine/enhanced-service.ts`, `lib/services/fee-engine/enhanced-calculator.ts`
  - invariants: precedence ordering; discounts negative; audit notes; round money to 2 decimals; units are integers

- deals
  - routes: `/admin/deals`, `/investor-portal/deals`, `/investor-portal/deals/[id]`
  - apis: `/api/deals`, `/api/deals/[id]`
  - key files: `components/deals/DealsList.tsx`, `lib/db/supabase-unified.ts`

- investors
  - routes: `/investor-portal/dashboard`, `/investor-portal/portfolio`, `/investor-portal/profile`
  - apis: `/api/investors/[id]`, `/api/investors/[id]/dashboard`, `/api/investors/[id]/portfolio`, `/api/investors/[id]/transactions`
  - key files: `app/investor-portal/*`, `lib/db/*`

- transactions
  - routes: `/admin/transactions`, `/investor-portal/transactions`
  - apis: `/api/transactions/*`
  - key files: `app/*/transactions/*`, `lib/db/supabase-unified.ts`

- companies
  - routes: `/admin/companies`
  - apis: `/api/companies`
  - key files: `app/admin/companies/*`, `lib/db/supabase-unified.ts`

- documents
  - routes: `/investor-portal/documents`
  - apis: `/api/documents`
  - key files: `app/investor-portal/documents/page.tsx`, `lib/db/supabase-unified.ts`

- health
  - routes: `N/A`
  - apis: `/api/health`, `/api/health/supabase`
  - key files: `app/api/health/route.ts`, `app/api/health/supabase/route.ts`, `lib/db/supabase/status.ts`, `SCRIPTS/health-check.js`

- chat
  - routes: `N/A`
  - apis: `/api/admin/chat`
  - key files: `app/api/admin/chat/route.ts`

Conventions:
- Add new features to `DOCS/feature-map.json` as the machine-readable source.
- Place any deeper docs under `FEATURES/<feature>/README.md` when available.
