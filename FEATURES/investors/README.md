# Investors — Canonical Feature Index

## Feature Code

`2` — Investors domain (see `FEATURES/FEATURE_TREE.md`).

## Scope

- Investor profiles, KYC status, portfolio views, and dashboards.

## Entry Points

- UI (investor app)
  - `app/investor-portal/investors/page.tsx` (list)
  - `app/investor-portal/profile/page.tsx` (profile)
- API
  - `app/api/investors/route.ts`
  - `app/api/investors/[id]/route.ts`
  - `app/api/investors/[id]/dashboard/route.ts`
  - `app/api/investors/[id]/portfolio/route.ts`
  - `app/api/investors/[id]/commitments/route.ts`
  - `app/api/investors/[id]/transactions/route.ts`
- Services
  - `lib/services/investors.service.ts`
  - `lib/services/portfolio-aggregator.service.ts`

## Key Docs

- Platform: `DOCS/API.md`, `CLAUDE.md`
- Related: `FEATURES/transactions/README.md`, `FEATURES/documents/README.md`

## Invariants / Rules

- RLS-protected data; PII handling per security policy; no schema changes.

## Tests

- See `e2e/investor-portal.spec.ts`, `tests/investor-portal.spec.ts`

## Owners

- Feature owners: Investors team
