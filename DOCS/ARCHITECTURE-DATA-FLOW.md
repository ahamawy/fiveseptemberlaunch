# EQUITIE Data Flow and Calculation Architecture

Purpose: Stop churn by enforcing a single source of truth, clear contracts, and testable boundaries.

## Principles

- Single source of truth for numbers is Supabase (tables, views, SQL/PLPGSQL functions).
- No money/valuation/fee calculations in the frontend or API handlers; only in DB or ARCHON Fee Engine.
- API routes validate and shape data only; repositories fetch; UI renders.
- Contracts (Zod) define exact input/output for each API.
- Fees: precedence enforced, discounts are negative, 2-decimal rounding, integer units, audit trail in notes.

## Data Sources by Metric

- AUM (fund/investor aggregates): portfolio_analytics.total_aum
- Portfolio Value (NAV): portfolio_analytics.total_portfolio_value
- Average MOIC: portfolio_analytics.average_moic
- Portfolio IRR: portfolio_analytics.irr_portfolio
- Active Deals Count: portfolio_analytics.active_deals_count
- Deal Valuations: deal_valuations (or company_latest_valuation for latest)
- Transactions Aggregates: dedicated views, not JS sums (e.g., transactions.transaction.primary)

## Layered Responsibilities

- Database: Performs all aggregations/valuations and logs to calculation_audit_log when applicable.
- Repositories (lib/db/repos/\*): Query DB views/tables and map to DTOs. No calculations.
- API Routes (app/api/\*): Validate with Zod, handle errors, return typed shapes.
- UI (app/\*): Render validated data. No calculations beyond formatting.

## Contracts Workflow

1. Define Zod schemas in lib/contracts/api/{feature}.ts
2. Repositories return DTOs that match these schemas
3. API routes parse and return only valid data
4. UI consumes typed, validated data

## Guardrails

- TypeScript strict; no any.
- Use enhanced fee engine only for fees: lib/services/fee-engine/enhanced-service
- Use brand tokens for styling; logging via lib/utils/improved-logger.ts
- CI gates: typecheck, lint, unit (fees), e2e (Playwright)

## Definition of Done

- Zero frontend math for monetary/fee/valuation metrics.
- APIs Zod-validated; UI renders only validated shapes.
- Playwright checks UI values against DB truth for seeded investors.
