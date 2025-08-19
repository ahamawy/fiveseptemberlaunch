# Deals — Canonical Feature Index

## Feature Code

`1` — Deals domain (see `FEATURES/FEATURE_TREE.md`).

## Scope

- Deal master data, lifecycle/status, identifiers, and fee links; APIs and UI for viewing and managing deals.

## Entry Points

- UI (investor app)
  - `app/investor-portal/deals/page.tsx`
- API
  - `app/api/deals/route.ts`
  - `app/api/deals/[dealId]/route.ts`
- Services
  - `lib/services/deals.service.ts`

## Key Docs

- Platform: `DOCS/API.md`, `CLAUDE.md`
- Fees: `FEATURES/fees/README.md`

## Invariants / Rules

- Stable identifiers; status transitions guarded; no schema changes.

## Tests

- See `e2e/deal-equations.spec.ts`, `tests/investor-portal.spec.ts`

## Owners

- Feature owners: Deals team
