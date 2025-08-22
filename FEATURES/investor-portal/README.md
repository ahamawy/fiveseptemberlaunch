# Investor Portal — Canonical Feature Index

## Feature Code

`15.1` — Investor app portal (see `FEATURES/FEATURE_TREE.md`).

## Scope

- Investor-facing pages for dashboard, portfolio, deals, documents, profile, transactions.

## Entry Points

- UI
  - Selector: `app/investor-portal/select/page.tsx` (ID or public_id)
  - Dashboard: `app/investor-portal/dashboard/page.tsx`
  - Portfolio: `app/investor-portal/portfolio/page.tsx`
  - Deals & Commitments: `app/investor-portal/deals/page.tsx`
  - Documents: `app/investor-portal/documents/page.tsx`
  - Profile: `app/investor-portal/profile/page.tsx`
  - Transactions: `app/investor-portal/transactions/page.tsx`

## Key Docs

- Platform: `DOCS/API.md`, `CLAUDE.md`
- Branding: `BRANDING/`

## Invariants / Rules

- Investor scoping:

  - Preferred: `?investor=<id>` in URL
  - Fallback: `localStorage.equitie-current-investor-id`
  - Dev default: `1`

- Data sources:
  - Dashboard/Portfolio/Deals/Transactions fetch from `/api/investors/{id}/...`
  - Documents fetch from `/api/documents`
  - Profile fetch from `/api/investors/{id}`

## Journeys

- Investor Journey

  1. `/investor-portal/select` → enter ID/public_id
  2. Landing at `/investor-portal/dashboard?investor=<id>`
  3. Navigate to Portfolio/Transactions/Deals with same `?investor=<id>` retained

- Admin Journey (development)

  - Fees Hub: `/admin/fees`
  - Tables: `/admin/deals`, `/admin/transactions`

- Consistent UX and tokens; error boundaries; no schema changes.

## Tests

- See `e2e/investor-portal.spec.ts`, `tests/investor-portal.spec.ts`

## Owners

- Feature owners: Investor app team
