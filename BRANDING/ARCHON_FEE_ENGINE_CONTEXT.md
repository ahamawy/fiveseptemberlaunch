# ARCHON Fee Engine Context (Concise)

## Purpose
Institutional-grade overview of fee calculation rules powering EQUITIE. This summarizes precedence, invariants, and audit and testing requirements. Implementation lives in `lib/services/fee-engine/*` and schema fields in `deals_clean`, `transactions_clean`.

## Precedence Ordering (Always)
1. Structuring fee (GC or NC per `fee_base_capital`)
2. Premium (valuation/unit-price/built-in via `premium_calculation_method`)
3. Admin fee (flat)
4. Management fee (annual; tiered via `management_fee_tier_*`, `tier_1_period`)
5. Performance fee (on gains only)

## Basis Types
- GC: Gross Capital
- NC: Net Capital; computed via `nc_calculation_method` enum
- Fee base selected by `deals_clean.fee_base_capital` ('GC' | 'NC')

## Discounts
- Represented as rates in [0..1]
- Applied as reductions: `effective_fee = base_fee * (1 - discount)`
- When persisted as fee line items, discounts post to accounting as negative amounts

## Invariants
- Money rounded to 2 decimals; units are integers (floor division)
- Performance fee only on max(0, proceeds - cost_basis)
- Partner fees prefixed `PARTNER_` and combined fees must respect policy caps
- PREMIUM precedence equals 1 when modeled as a fee separate from NC
- Respect template controls: `formula_template`, `nc_calculation_method`, `premium_calculation_method`, `fee_base_capital`

## Audit Trail (formula_calculation_log)
- input_variables: GC, rates, discounts, prices, T, bases
- calculation_steps: ordered fee applications with amounts
- output_results: NC, units, proceeds, all fee totals, MOIC/IRR
- validation_status: 'valid' | 'warning' | 'error' | 'pending'
- notes: template version, rule set, discrepancies

## Testing
- UI: `/formula-validator` for live template calculations
- Unit tests: `lib/services/fee-engine/__tests__/*`
- Data validation: ensure enum values align with template mapping

## References
- `BRANDING/FORMULA_ENGINE.md`
- `BRANDING/FEE_CALCULATION_BIBLE.md`
- `BRANDING/FORMULA_ENGINE_SCHEMA_MAPPING.md`
- `CLAUDE.md` (Clean Schema with Formula Engine)
