# EQUITIE Bot Context (Backend Reasoning Guide with ARCHON Fee Engine)

> For feature-specific canonical docs, refer to `FEATURES/<feature-code>-<feature-name>/README.md`. For Fees, see `FEATURES/fees/README.md`.

This document provides the AI agent with comprehensive context about our data model, conventions, flows, and the integrated ARCHON Fee Engine for intelligent data processing and fee calculations.

## Conventions

- Naming: snake_case for DB columns; schemas: public, analytics, fees, eng, ref, core, docs, archive
- Units standard: default 1,000 USD per unit unless a deal explicitly defines otherwise
- SoT vs Views: tables hold SoT, analytics schema exposes stable views; app consumes `analytics.*` when possible
- No PK renumbering; prefer additive migrations; use `NOT VALID` FKs when needed

## Key Schemas

- fees: `calculator_profile`, `fee_schedule`, `schedule_version`, `fee_application`, `legacy_import`
- eng: `units_config`, `units_ledger` (preferred for AUM positions)
- analytics: `v_deals`, `v_investors`, `v_transactions`, `v_unit_prices`, `v_positions_units`, `v_aum_*`, `v_fee_import_preview`, `v_fee_profiles`
- transactions: `transactions.transaction.primary` (legacy-compatible, moving towards derived views)
- docs: `container`, `container_item` (organize artifacts)
- ref/core: currencies and FX support; valuations summarized in views

## Fee Profiles

- LEGACY: per-deal JSON config supports ordering and component logic (PREMIUM, STRUCTURING, MANAGEMENT, ADMIN, PERFORMANCE)
- MODERN: standardized `fee_schedule` + `schedule_version` referencing a `calculator_profile`
- Discounts: per-investor pct for structuring/management/admin; applied before computing transfer_post_discount

## Premium Calculation

- Derived from valuation deltas when available: premium_pct = (sell_pre_money - purchase_pre_money) / purchase_pre_money
- PREMIUM component typically `PCT_OF_GROSS` with direction `DEDUCTS_NET`

## Import Flow

- Stage rows in `fees.legacy_import` (investor*id or investor_name, gross_capital_usd, discount*\*\_pct)
- Preview in `analytics.v_fee_import_preview`
- Apply to `fees.fee_application`, then update derived views

## Units & AUM

- Use `eng.units_ledger` + `analytics.v_unit_prices` for AUM and MOIC
- Normalize legacy rows to 1,000 USD unit price unless explicitly documented otherwise

## ARCHON Fee Engine Integration

### Enhanced Calculator (`lib/services/fee-engine/enhanced-calculator.ts`)

- **Precedence Ordering**: Fees applied in strict order (PREMIUM always first)
- **Basis Calculations**: GROSS, NET, NET_AFTER_PREMIUM
- **Discounts**: Stored as NEGATIVE amounts in fee_application
- **Validation**: Full invariant checking and reconciliation
- **Annual Fees**: Multiplier with audit notes

### Enhanced Service (`lib/services/fee-engine/enhanced-service.ts`)

- **CSV Import**: Parse and preview with validation
- **Schedule Management**: Version control for fee configurations
- **Partner Fees**: Excluded from investor analytics (PARTNER\_ prefix)
- **Batch Processing**: Efficient multi-transaction calculations
- **Reporting**: Comprehensive fee reports with audit trails

### Chat Interface (`/admin/chat`)

The EQUITIE Bot integrates media ingestion with fee calculations:

- **File Processing**: CSV, PDF (LPAs, fee schedules)
- **Commands**:
  - "Calculate fees for deal X with $Y"
  - "Show fee schedule for deal X"
  - "Validate fee configuration"
  - "Apply fees" (saves to database)
  - "Generate fee report"
- **AI Reasoning**: GPT-5 powered analysis with fee context

## Admin APIs

### Original Endpoints

- POST `/api/admin/fees/profiles`: create/activate profiles
- GET `/api/admin/fees/profiles`: list from `analytics.v_fee_profiles`
- POST `/api/admin/fees/import`: CSV → `fees.legacy_import`
- GET `/api/admin/fees/import`: preview view
- POST `/api/admin/fees/apply`: apply staged rows
- POST `/api/admin/ingest/parse`: AI parse doc → mapping + profile suggestion

### Enhanced Chat Endpoint

- POST `/api/admin/chat`: Unified interface for all operations
  - Accepts FormData with message and file
  - Auto-detects fee data vs investor data
  - Returns structured responses with actions
  - Maintains context for multi-step operations
- POST `/api/admin/ingest/apply`: stage rows (optionally create profile)

## Parsing Guidance

- Extract: deal_id, unit_price_usd, valuations (purchase/sell pre-money), premium_percent or inputs to derive it
- Extract partner fees: management_pct (net or gross basis), admin_fee amount, structuring_pct, performance_pct
- Extract investor lines: investor*name/id, gross_capital_usd, discount*% per component
- Prefer IDs if available; else include exact names for resolver

## Invariants

- Sum of investor initial net equals deal partner subscription net (after premiums)
- Units = floor(net_capital / unit_price_usd) by default
- Net transfer = gross - total_fees; total_fees is sum of components

Keep outputs strictly JSON for machine consumption. When unsure, include a `notes` field in JSON for human review.
