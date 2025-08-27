# Formula Engine ↔ Clean Schema Mapping

This addendum maps variables and template logic from the Formula Engine to the clean tables and new fields added on 2024-11-26. It also lists invariants and audit requirements.

## Tables
- `deals_clean` (per-deal config)
- `transactions_clean` (per-transaction amounts and results)
- `formula_templates` (canonical template definitions)
- `formula_calculation_log` (audit trail)

## New Fields (recap)
- `deals_clean.nc_calculation_method` (enum)
- `deals_clean.formula_template` (varchar)
- `deals_clean.fee_base_capital` ('GC'|'NC')
- `deals_clean.premium_calculation_method` (enum)
- `deals_clean.management_fee_tier_1_percent`
- `deals_clean.management_fee_tier_2_percent`
- `deals_clean.tier_1_period`
- `deals_clean.other_fees_allowed` (boolean)
- `transactions_clean.other_fees`, `transactions_clean.other_fees_description`

## Variable-to-Field Mapping
- GC: `transactions_clean.gross_capital`
- NC: Derived per template; persisted as `transactions_clean.initial_net_capital` if materialized
- IUP: `deals_clean.initial_unit_price` (or deal-level reference)
- EUP: Exit input; logged in `formula_calculation_log.input_variables`
- PMSP/ISP: `deals_clean.pre_money_share_price` / `transactions_clean.investor_share_price`
- T: `DATE_DIFF(year, investment_date, exit_date)`; stored per transaction context
- MFR/SFR/PFR/AF: Deal-level percents and fees (eq + partner) in `deals_clean`, applied to `fee_base_capital`
- Discounts (D*): Stored as rates; applied as reductions; negative fee entries in accounting tables when persisted

## Template Controls
- Select by `deals_clean.formula_template`
- Apply base capital from `deals_clean.fee_base_capital`
- Determine NC by `deals_clean.nc_calculation_method`
- Premium path by `deals_clean.premium_calculation_method`
- Tier logic by `management_fee_tier_*` and `tier_1_period`

## Invariants
- Precedence: structuring → premium → admin → management → performance
- Discounts reduce fees (0..1), stored as negative amounts where line-items are persisted
- Money rounded to 2 decimals; units are integers
- Performance fee only on gains: max(0, proceeds - cost_basis)
- Partner fees prefixed `PARTNER_` and validated sum with EquiTie fees ≤ policy caps

## Audit Trail
Log to `formula_calculation_log` with:
- `input_variables`: GC, rates, discounts, prices, T
- `calculation_steps`: ordered fee applications with amounts
- `output_results`: NC, units, proceeds, fees, MOIC/IRR
- `validation_status` and discrepancies
- `notes` including template and rule version

## Example Mapping (SpaceX1)
- `nc_calculation_method = 'inverse'`
- `fee_base_capital = 'NC'`
- Tiered management: use `management_fee_tier_1_percent`, `management_fee_tier_2_percent`, `tier_1_period=2`
- Structuring fee base: NC

## Testing Hooks
- UI validator: `/formula-validator`
- Unit tests: `lib/services/fee-engine/__tests__/enhanced-calculator.test.ts`

## Change Management
- Update template text in `formula_templates`
- Bump version notes in this file and `CLAUDE.md`
