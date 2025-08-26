# Supabase Column Changes Required

## Overview
This document outlines the required column name changes and additions to align the Supabase schema with EquiTie's business terminology as defined in the Master Sheet glossary.

## deals_clean Table Changes

### Column Renames
| Current Column Name | New Column Name | Reason |
|-------------------|-----------------|---------|
| `initial_net_capital` | `deal_net_capital` | Clarity - refers to deal-level net capital |
| `exit_price_per_unit` | `exit_unit_price` | Consistency with `initial_unit_price` |
| `eq_deal_annual_management_fee_percent` | `eq_deal_annual_management_fee_1_percent` | Support for multiple fee tiers |
| `partner_performance_fee_percent` | `partner_performance_fee_rate` | Align with rate terminology |
| `partner_annual_management_fee_percent` | `partner_management_fee_rate` | Align with rate terminology |
| `partner_structuring_fee_percent` | `partner_structuring_fee_rate` | Align with rate terminology |

### New Columns to Add
| Column Name | Data Type | Description |
|------------|-----------|-------------|
| `eq_deal_annual_management_fee_2_percent` | numeric | Second management fee tier if applicable |
| `partner_admin_fee` | numeric | Flat admin fee charged by partner |
| `exit_share_price` | numeric | Price per share used for partner proceeds at exit |
| `eq_admin_fee` | numeric | Flat admin fee charged to investors by EquiTie |
| `eq_other_fee` | numeric | One-time transactional or miscellaneous fees |
| `deal_discount_partner_management_fee_percent` | numeric | Discount on partner's management fee (0-1) |
| `deal_discount_partner_structuring_fee_percent` | numeric | Discount on partner's structuring fee (0-1) |
| `deal_discount_partner_admin_fee_percent` | numeric | Discount on partner's admin fee (0-1) |
| `deal_discount_partner_performance_fee_percent` | numeric | Discount on partner's performance fee (0-1) |

### Foreign Exchange Enhancement
- Create new `fx_rates` table for exchange rate history
- Change `exchange_rate_usd_gbp` to reference `fx_rates` table

## transactions_clean Table Changes

### Column Renames
| Current Column Name | New Column Name | Reason |
|-------------------|-----------------|---------|
| `unit_price` | `investor_share_price` | Better reflects investor's actual price |
| `management_fee_percent` | `management_fee_rate` | Align with rate terminology |
| `performance_fee_percent` | `performance_fee_rate` | Align with rate terminology |
| `structuring_fee_percent` | `structuring_fee_rate` | Align with rate terminology |
| `structuring_fee_discount_percent` | `discount_on_structuring_fee_rate` | Clearer naming |
| `premium_amount` | `premium_fee` | Consistency with other fee naming |

### New Columns to Add
| Column Name | Data Type | Description |
|------------|-----------|-------------|
| `management_fee_discount_percent` | numeric | Discount on management fee rate |
| `performance_fee_amount` | numeric | Calculated performance fee amount |
| `performance_fee_discount_percent` | numeric | Discount on performance fee rate |
| `premium_fee_discount_percent` | numeric | Discount on premium fee rate |

## Key Business Logic Rules from Master Sheet

### Deal-Level Rules
1. **Net Capital Calculation**: `deal_net_capital = deal_gross_capital - (structuring_fees + premium_fees)`
2. **Units Calculation**: `Units = net_capital / initial_unit_price`
3. **Premium Calculation**: Premium = `(pre_money_sell_price / investor_share_price) - 1` OR `exit_unit_price / initial_unit_price`
4. **Fee Locking**: Prohibit edits to fee schedules after deal status = 'closed'

### Transaction-Level Rules
1. **Discount Application**: All discounts expressed as rates between 0-1 (0 = no discount, 1 = 100% discount)
2. **Fee Calculation Method**: Track whether percentage or fixed fee calculation
3. **Sub-nominee Structure**: If `nominee = TRUE`, must have valid `subnominee_investor_id`

### Validation Rules
1. If `deal_exited = TRUE`:
   - `exit_date` must NOT be NULL
   - `exit_date` must be >= `deal_date`
   - `exit_unit_price` must be populated

2. For Partnership Deals (`deal_type = partnership`):
   - `deal_partner_name` required
   - Partner fee fields must be populated
   - Partner discounts default to 0 if not specified

3. For Advisory Deals (`deal_type = advisory`):
   - `advisory_shares_earned` must be > 0
   - Investor fee fields may be 0 or NULL

## Migration Script Structure

```sql
-- Step 1: Add new columns
ALTER TABLE deals_clean 
ADD COLUMN eq_deal_annual_management_fee_2_percent numeric,
ADD COLUMN partner_admin_fee numeric,
ADD COLUMN exit_share_price numeric,
ADD COLUMN eq_admin_fee numeric,
ADD COLUMN eq_other_fee numeric,
ADD COLUMN deal_discount_partner_management_fee_percent numeric DEFAULT 0,
ADD COLUMN deal_discount_partner_structuring_fee_percent numeric DEFAULT 0,
ADD COLUMN deal_discount_partner_admin_fee_percent numeric DEFAULT 0,
ADD COLUMN deal_discount_partner_performance_fee_percent numeric DEFAULT 0;

-- Step 2: Rename existing columns
ALTER TABLE deals_clean 
RENAME COLUMN initial_net_capital TO deal_net_capital;

ALTER TABLE deals_clean 
RENAME COLUMN exit_price_per_unit TO exit_unit_price;

-- Continue for all renames...

-- Step 3: Add constraints
ALTER TABLE deals_clean 
ADD CONSTRAINT check_exit_date_logic 
CHECK ((deal_exited = FALSE) OR (deal_exited = TRUE AND exit_date IS NOT NULL AND exit_date >= deal_date));

-- Step 4: Create FX rates table
CREATE TABLE fx_rates (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_currency varchar(3) NOT NULL,
    to_currency varchar(3) NOT NULL,
    rate numeric NOT NULL,
    effective_date date NOT NULL,
    source varchar(100),
    created_at timestamptz DEFAULT now(),
    UNIQUE(from_currency, to_currency, effective_date)
);

-- Step 5: Update views for backward compatibility
CREATE OR REPLACE VIEW deals_legacy AS
SELECT 
    deal_id,
    deal_net_capital as initial_net_capital,
    exit_unit_price as exit_price_per_unit,
    -- Map all renamed columns
    *
FROM deals_clean;
```

## Implementation Priority

### Phase 1 - Critical (Immediate)
1. Add missing fee columns for complete fee calculation
2. Fix column naming inconsistencies

### Phase 2 - Important (Week 1)
1. Implement discount columns
2. Add validation constraints
3. Create FX rates table

### Phase 3 - Enhancement (Week 2)
1. Add audit columns
2. Implement fee locking mechanism
3. Create backward compatibility views

## Testing Requirements

1. **Data Integrity**: Ensure no data loss during migration
2. **Calculation Verification**: Test all fee calculations with new columns
3. **Backward Compatibility**: Verify legacy views work correctly
4. **Constraint Testing**: Validate all new constraints with edge cases

## Rollback Plan

1. Keep backup of original schema
2. Create reversible migration scripts
3. Maintain legacy column names via views
4. Document all changes in migration log

## Notes

- All percentage fields should store actual percentages (e.g., 2.5 for 2.5%)
- All monetary fields should use `numeric` type for precision
- Discount fields default to 0 (no discount)
- Consider adding `updated_by` field for audit trail
- Implement row-level security (RLS) for sensitive fee data