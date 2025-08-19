# Fees — Canonical Feature Index

This page is the canonical source of truth for the Fees feature. Older documents now link here for consistency.

## Feature Code

`7` — Fees domain (see `FEATURES/FEATURE_TREE.md`).

## Scope

- Define and apply fee schedules to transactions with precedence ordering and auditable calculations. Supports imports, previews, application, and reporting.

## Entry Points

- UI: `app/admin/fees/*`
  - `app/admin/fees/profiles/page.tsx`
  - `app/admin/fees/import/page.tsx`
  - `app/admin/fees/import-v2/page.tsx`
  - `app/admin/fees/smart-import/page.tsx`
- API: `app/api/admin/fees/*`
  - `app/api/admin/fees/profiles/route.ts`
  - `app/api/admin/fees/import/route.ts`
  - `app/api/admin/fees/apply/route.ts`
  - `app/api/admin/fees/apply-v2/route.ts`
  - `app/api/admin/fees/smart-import/route.ts`
  - `app/api/admin/fees/smart-import/[session_id]/apply/route.ts`
- Services: `lib/services/fee-engine/*`
  - `lib/services/fee-engine/enhanced-calculator.ts`
  - `lib/services/fee-engine/enhanced-service.ts`
  - `lib/services/fee-engine/fee-service.ts`

## Key Docs

- Architecture & Reasoning: `ARCHON_FEE_ENGINE_CONTEXT.md` (supporting context)
- Concise Guide: `DOCS/ARCHON.md` (supporting context)
- Bot Integration: `EQUITIE_BOT_INTEGRATION.md`, `DOCS/EQUITIE_BOT_CONTEXT.md` (supporting context)
- Legacy Engine: `LEGACY_DEAL_ENGINE_DOCS.md` (legacy reference)

Note: The above are references. This `README.md` is the canonical doc for current state and navigation.

## Invariants / Rules

- Premium precedence = 1; respect strict precedence ordering.
- Basis: `GROSS`, `NET`, `NET_AFTER_PREMIUM`.
- Discounts stored as negative amounts in `fees.fee_application`.
- Amounts rounded to 2 decimal places; units are integers (floor).
- Partner fees prefixed with `PARTNER_` and excluded from investor analytics.

See `ARCHON_FEE_ENGINE_CONTEXT.md` for detailed reasoning and validation patterns.

## Tasks & Workflows

- Import (legacy): Stage → Preview → Apply
- Import (v2): Componentized rows with `basis`/`percent`/`amount`
- Smart Import: Session-based mapping and staged application
- Chat: Unified interaction for parsing, previewing, and applying

## Tests

- Unit: `lib/services/fee-engine/__tests__/*`
- E2E: `e2e/fee-engine.spec.ts`, `e2e/fee-management.spec.ts`

Commands:

```bash
npm run test:fees
npx playwright test e2e/fee-engine.spec.ts
```

## Deprecations

- Legacy instructions in `LEGACY_DEAL_ENGINE_DOCS.md` are retained for historical reference. Prefer the enhanced engine and APIs linked above.

## Owners

- Feature owners: Fees team (see CODEOWNERS if available)
