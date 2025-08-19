# Investor Portal — Canonical Feature Index

## Feature Code

`15.1` — Investor app portal (see `FEATURES/FEATURE_TREE.md`).

## Scope

- Investor-facing pages for dashboard, portfolio, deals, documents, profile, transactions.

## Entry Points

- UI
  - `app/investor-portal/dashboard/page.tsx`
  - `app/investor-portal/portfolio/page.tsx`
  - `app/investor-portal/deals/page.tsx`
  - `app/investor-portal/documents/page.tsx`
  - `app/investor-portal/profile/page.tsx`
  - `app/investor-portal/transactions/page.tsx`

## Key Docs

- Platform: `DOCS/API.md`, `CLAUDE.md`
- Branding: `BRANDING/`

## Invariants / Rules

- Consistent UX and tokens; error boundaries; no schema changes.

## Tests

- See `e2e/investor-portal.spec.ts`, `tests/investor-portal.spec.ts`

## Owners

- Feature owners: Investor app team
