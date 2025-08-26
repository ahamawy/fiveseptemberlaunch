# Supabase Schema Gaps Analysis

## Executive Summary

After analyzing the deal-specific formulas against the current Supabase schema, we've identified critical gaps that prevent proper tokenization and formula execution for legacy deals. This document outlines required schema changes, migration strategy, and validation requirements.

## Critical Missing Fields

### 1. Formula Configuration Fields

| Field Name | Table | Type | Purpose | Priority |
|------------|-------|------|---------|----------|
| `nc_calculation_method` | deals_clean | enum | Determines how NC is calculated | CRITICAL |
| `formula_template` | deals_clean | varchar(50) | Links to formula template | CRITICAL |
| `fee_base_capital` | deals_clean | varchar(2) | 'GC' or 'NC' for fee calculation | HIGH |
| `premium_calculation_method` | deals_clean | enum | How premium is calculated | HIGH |
| `other_fees` | transactions_clean | numeric | Reddit-specific other fees | MEDIUM |

### 2. Tiered Fee Structure

| Field Name | Table | Type | Purpose | Priority |
|------------|-------|------|---------|----------|
| `management_fee_tier_1` | deals_clean | numeric(5,2) | First tier rate | HIGH |
| `management_fee_tier_2` | deals_clean | numeric(5,2) | Second tier rate | HIGH |
| `tier_1_period` | deals_clean | integer | Years for tier 1 | HIGH |
| `tier_2_start` | deals_clean | integer | When tier 2 begins | MEDIUM |

### 3. Partner Fee Discounts

| Field Name | Table | Type | Purpose | Priority |
|------------|-------|------|---------|----------|
| `discount_partner_management_fee` | deals_clean | numeric(3,2) | 0-1 range | MEDIUM |
| `discount_partner_structuring_fee` | deals_clean | numeric(3,2) | 0-1 range | MEDIUM |
| `discount_partner_performance_fee` | deals_clean | numeric(3,2) | 0-1 range | MEDIUM |
| `discount_partner_admin_fee` | deals_clean | numeric(3,2) | 0-1 range | LOW |

## Formula Template Mapping

### NC Calculation Methods

```sql
CREATE TYPE nc_calculation_method AS ENUM (
  'standard',      -- NC = GC - (SFR × GC) - Premium
  'direct',        -- NC = GC (Reddit, Scout, New Heights, Egypt)
  'structured',    -- NC = GC × (1 - SFR) (Figure AI)
  'premium_based', -- NC = GC × (PMSP/ISP) (Impossible, SpaceX 2)
  'complex',       -- NC = (GC × (1 - SFR)) × (PMSP/ISP) (OpenAI)
  'inverse'        -- NC = GC / (1 + SFR) (SpaceX 1)
);
```

### Premium Calculation Methods

```sql
CREATE TYPE premium_calculation_method AS ENUM (
  'valuation_based',  -- (PMSP/ISP - 1)
  'unit_price_based', -- (EUP/IUP)
  'built_in_nc',      -- Built into NC calculation
  'none'              -- No premium
);
```

## Deal-to-Template Mapping

| Deal | Template | NC Method | Mgmt Tiers | Premium | Other Fees | Fee Base |
|------|----------|-----------|------------|---------|------------|----------|
| Impossible Foods | impossible | premium_based | No | built_in_nc | No | GC |
| Reddit | reddit | direct | No | valuation_based | Yes | GC |
| OpenAI | openai | complex | Yes | built_in_nc | No | GC |
| Figure AI 1/2 | figure | structured | No | valuation_based | No | GC |
| Scout AI | scout | direct | No | valuation_based | No | GC |
| SpaceX 1 | spacex1 | inverse | Yes | valuation_based | No | NC |
| SpaceX 2 | spacex2 | premium_based | No | built_in_nc | No | GC |
| New Heights 1/2 | newheights | direct | No | none | No | GC |
| Egypt Growth | egypt | direct | No | valuation_based | No | GC |

## Data Migration Requirements

### Phase 1: Schema Updates
```sql
-- Add formula support columns
ALTER TABLE deals_clean
  ADD COLUMN nc_calculation_method nc_calculation_method,
  ADD COLUMN formula_template varchar(50),
  ADD COLUMN fee_base_capital varchar(2) DEFAULT 'GC',
  ADD COLUMN premium_calculation_method premium_calculation_method,
  ADD COLUMN management_fee_tier_1 numeric(5,2),
  ADD COLUMN management_fee_tier_2 numeric(5,2),
  ADD COLUMN tier_1_period integer DEFAULT 1,
  ADD COLUMN other_fees_allowed boolean DEFAULT false;
```

### Phase 2: Data Population
```sql
-- Map existing deals to templates
UPDATE deals_clean SET 
  formula_template = CASE
    WHEN deal_name LIKE '%Impossible%' THEN 'impossible'
    WHEN deal_name LIKE '%Reddit%' THEN 'reddit'
    WHEN deal_name LIKE '%OpenAI%' OR deal_name LIKE '%Open AI%' THEN 'openai'
    WHEN deal_name LIKE '%Figure%' THEN 'figure'
    WHEN deal_name LIKE '%Scout%' THEN 'scout'
    WHEN deal_name LIKE '%SpaceX%' AND deal_name LIKE '%1%' THEN 'spacex1'
    WHEN deal_name LIKE '%SpaceX%' AND deal_name LIKE '%2%' THEN 'spacex2'
    WHEN deal_name LIKE '%Heights%' THEN 'newheights'
    WHEN deal_name LIKE '%Egypt%' THEN 'egypt'
    ELSE 'standard'
  END,
  nc_calculation_method = CASE
    WHEN deal_name LIKE '%Impossible%' THEN 'premium_based'
    WHEN deal_name LIKE '%Reddit%' THEN 'direct'
    WHEN deal_name LIKE '%OpenAI%' OR deal_name LIKE '%Open AI%' THEN 'complex'
    WHEN deal_name LIKE '%Figure%' THEN 'structured'
    WHEN deal_name LIKE '%Scout%' THEN 'direct'
    WHEN deal_name LIKE '%SpaceX%' AND deal_name LIKE '%1%' THEN 'inverse'
    WHEN deal_name LIKE '%SpaceX%' AND deal_name LIKE '%2%' THEN 'premium_based'
    WHEN deal_name LIKE '%Heights%' THEN 'direct'
    WHEN deal_name LIKE '%Egypt%' THEN 'direct'
    ELSE 'standard'
  END;
```

### Phase 3: Formula Templates Table
```sql
CREATE TABLE formula_templates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_name varchar(50) UNIQUE NOT NULL,
  nc_formula text NOT NULL,
  investor_proceeds_formula text NOT NULL,
  investor_proceeds_discount_formula text,
  eq_proceeds_formula text,
  eq_proceeds_discount_formula text,
  has_management_tiers boolean DEFAULT false,
  has_premium boolean DEFAULT false,
  has_other_fees boolean DEFAULT false,
  fee_base_capital varchar(2) DEFAULT 'GC',
  special_rules jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

## Validation Requirements

### Pre-Migration Validation
1. Verify all deals have identifiable templates
2. Check for fee rate conflicts
3. Validate premium calculation consistency
4. Ensure partner fee totals are reasonable

### Post-Migration Validation
1. Recalculate all historical transactions
2. Compare with existing net proceeds
3. Flag any discrepancies > 1%
4. Generate audit report

## Transaction Log Structure

```sql
CREATE TABLE formula_calculation_log (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id integer REFERENCES transactions_clean(transaction_id),
  deal_id integer REFERENCES deals_clean(deal_id),
  formula_template varchar(50),
  input_variables jsonb NOT NULL,
  calculation_steps jsonb NOT NULL,
  output_results jsonb NOT NULL,
  validation_status varchar(20),
  discrepancy_amount numeric(15,2),
  calculated_at timestamptz DEFAULT now(),
  calculated_by varchar(100)
);

-- Example log entry
INSERT INTO formula_calculation_log (
  transaction_id,
  deal_id,
  formula_template,
  input_variables,
  calculation_steps,
  output_results
) VALUES (
  12345,
  1,
  'openai',
  '{"GC": 100000, "SFR": 0.02, "PMSP": 35000, "ISP": 8.7, "T": 2}',
  '[
    {"step": 1, "operation": "calc_nc", "formula": "(GC*(1-SFR))*(PMSP/ISP)", "result": 392000},
    {"step": 2, "operation": "mgmt_fee", "formula": "MFR1*GC + MFR2*GC*(T-1)", "result": 4000},
    {"step": 3, "operation": "perf_fee", "formula": "PFR*((NC*(EUP/IUP))-NC)", "result": 78400}
  ]',
  '{"net_proceeds": 509600, "total_fees": 82750, "moic": 5.096}'
);
```

## Implementation Priority

### Week 1 - Critical
1. Create enum types
2. Add formula template fields
3. Map existing deals to templates
4. Create formula_templates table

### Week 2 - High Priority
1. Add tiered fee fields
2. Implement NC calculation methods
3. Create calculation log table
4. Build validation queries

### Week 3 - Medium Priority
1. Add discount fields
2. Implement premium calculations
3. Create audit reports
4. Test with historical data

## Risk Mitigation

### Data Integrity
- Keep original fields unchanged
- Run calculations in parallel
- Log all discrepancies
- Manual review for outliers

### Performance
- Index formula_template field
- Cache calculation results
- Batch process historical data
- Monitor query performance

### Compliance
- Maintain audit trail
- Document all changes
- Version control formulas
- Regular validation checks

## Success Metrics

1. **Coverage**: 100% of deals mapped to templates
2. **Accuracy**: < 1% discrepancy in recalculations
3. **Performance**: < 100ms formula execution
4. **Completeness**: All missing fields added
5. **Validation**: Zero failed validations post-migration

## Next Steps

1. Review and approve schema changes
2. Test migrations on development database
3. Create rollback procedures
4. Schedule production deployment
5. Monitor and validate results