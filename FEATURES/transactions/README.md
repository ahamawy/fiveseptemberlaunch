# Transactions — Canonical Feature Index

## Feature Code

`3` — Transactions domain (see `FEATURES/FEATURE_TREE.md`).

## Scope

- Transaction store, journal views, reconciliation support, fee links.

## Entry Points

- UI (investor app)
  - `app/investor-portal/transactions/page.tsx`
- API
  - `app/api/transactions/route.ts`
- Services
  - `lib/services/transactions.service.ts`

## Key Docs

- Platform: `DOCS/API.md`, `CLAUDE.md`
- Fees linkage: `FEATURES/fees/README.md`

## Invariants / Rules

- Idempotency and consistent posting; no schema changes.

## Tests

- See `tests/investor-portal.spec.ts`

## Owners

- Feature owners: Transactions team
