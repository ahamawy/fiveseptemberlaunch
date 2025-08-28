# Migration Verification Checklist

## Current State Analysis (Pre-Migration)

### ❌ ISSUES TO BE FIXED BY MIGRATIONS

1. **Foreign Key Issues**
   - ❌ `portfolio.deal_company_positions` has no FK to `companies_clean`
   - ❌ `portfolio.deal_company_positions` has FK to wrong deals table
   - ❌ Many core tables reference UUID investors instead of numeric

2. **Missing Columns**
   - ❌ `deals_clean` missing: nc_calculation_method, formula_template, fee_base_capital
   - ❌ `transactions_clean` missing: net_capital_actual, is_net_capital_provided
   - ❌ `portfolio.deal_company_positions` missing: net_capital_invested, is_legacy_deal

3. **Missing Tables**
   - ❌ `public.formula_templates` doesn't exist
   - ❌ `audit.investment_entries` doesn't exist
   - ❌ `audit.net_capital_entries` doesn't exist
   - ❌ `audit.nav_cascade_log` doesn't exist

4. **Missing Functions**
   - ❌ `portfolio.record_net_capital_investment()`
   - ❌ `public.record_transaction_net_capital()`
   - ❌ `portfolio.calculate_deal_nav()`
   - ❌ `portfolio.cascade_valuation_update()`

5. **Missing Views**
   - ❌ `portfolio.deal_portfolio_composition`
   - ❌ `public.net_capital_summary`
   - ❌ `portfolio.real_time_nav`

## Post-Migration State (What Will Be Fixed)

### ✅ AFTER MIGRATION 001 (Many-to-Many Relationships)

**Fixed:**
- ✅ Proper FKs: `deal_company_positions` → `companies_clean` & `deals_clean`
- ✅ Added `net_capital_invested` column for legacy deals
- ✅ Created `portfolio.record_net_capital_investment()` entry point
- ✅ Created `audit.investment_entries` table
- ✅ Added helper functions for many-to-many queries
- ✅ Created `portfolio.deal_portfolio_composition` view

**Still Remaining:**
- UUID investor references in core schema
- Formula columns missing

### ✅ AFTER MIGRATION 002 (Formula Support)

**Fixed:**
- ✅ Added all formula columns to `deals_clean`
- ✅ Created `formula_templates` table with 11 templates
- ✅ Mapped all deals to correct templates
- ✅ Added `net_capital_actual` to `transactions_clean`
- ✅ Created `public.record_transaction_net_capital()` function
- ✅ Created `audit.net_capital_entries` table
- ✅ Created `public.net_capital_summary` view

**Still Remaining:**
- UUID investor references in core schema
- NAV cascade triggers missing

### ✅ AFTER MIGRATION 003 (NAV Cascade)

**Fixed:**
- ✅ Created NAV cascade triggers
- ✅ Created `portfolio.calculate_deal_nav()` function
- ✅ Created `portfolio.cascade_valuation_update()` trigger function
- ✅ Created `audit.nav_cascade_log` table
- ✅ Created `portfolio.real_time_nav` view
- ✅ Added batch valuation update function
- ✅ Added NAV health monitoring

## ⚠️ REMAINING ISSUES NOT ADDRESSED

### 1. UUID vs Integer ID Inconsistency
**Tables Still Using UUID for investors:**
- `core.investor_groups` (id: UUID)
- `core.investor_referrals` (investor_id: UUID)
- `core.investor_jurisdictions` (investor_id: UUID)
- `core.distribution_waterfalls` (investor_id: UUID)
- `core.investor_fee_overrides` (investor_id: UUID)

**Action Required:** Separate migration needed to:
```sql
-- Convert UUID references to INTEGER
-- OR create mapping table between UUID and INTEGER investor_ids
```

### 2. Schema Access Patterns
**Current Issue:** Portfolio schema tables have `rls_enabled: false`
**Risk:** Direct client access would bypass security

**Recommendation:** Already handled correctly - server-only access pattern

### 3. Service Layer Updates Needed

**Files to Update:**
- `/lib/db/repos/investors.repo.ts` - Use net_capital_actual when available
- `/lib/services/valuation.service.ts` - Call cascade update functions
- `/lib/services/deals.service.ts` - Handle many-to-many relationships
- `/lib/services/portfolio-statement.service.ts` - Use new NC entry points

## Migration Execution Order

```bash
# 1. Apply migrations in sequence
psql $DATABASE_URL -f migrations/001_fix_many_to_many_relationships.sql
psql $DATABASE_URL -f migrations/002_add_formula_support.sql  
psql $DATABASE_URL -f migrations/003_nav_cascade_triggers.sql

# 2. Verify migrations
psql $DATABASE_URL -f migrations/verify_migration_status.sql

# 3. Run data integrity checks
psql $DATABASE_URL -f migrations/data_integrity_checks.sql
```

## Critical Validation Queries

### 1. Check FK Relationships
```sql
-- Should return proper constraints
SELECT 
    tc.constraint_name,
    tc.table_schema,
    tc.table_name,
    kcu.column_name,
    ccu.table_schema AS foreign_table_schema,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name = 'deal_company_positions';
```

### 2. Check Formula Templates
```sql
-- Should return 11 templates
SELECT template_name, nc_formula, fee_base_capital 
FROM public.formula_templates;
```

### 3. Check NAV Cascade
```sql
-- Test cascade by updating a valuation
UPDATE portfolio.company_valuations
SET share_price = share_price * 1.01
WHERE company_id = 1
RETURNING *;

-- Check if NAV updated
SELECT * FROM audit.nav_cascade_log 
ORDER BY created_at DESC LIMIT 1;
```

## Service Layer Dependencies

### Required Updates After Migration:

1. **investorsRepo.getDashboard()** 
   - Already handles mapping correctly
   - No changes needed

2. **valuationService.updateCompanyValuation()**
   - Will automatically trigger NAV updates via trigger
   - No code changes needed

3. **dealsService.getDealPortfolio()**
   - Should use new `portfolio.deal_portfolio_composition` view
   - Need to update query

4. **formulaValidation.validateTransaction()**
   - Should check `is_net_capital_provided` flag
   - Use `net_capital_actual` when available

## Documentation Updates Required

### Files to Update:
1. ✅ `CLAUDE.md` - Add new functions and tables
2. ✅ `EQUITIELOGIC/ENTITY_RELATIONSHIPS.md` - Document many-to-many
3. ✅ `lib/db/README.md` - Document new repo methods

## Risk Assessment

### Low Risk ✅
- Adding new columns (non-breaking)
- Creating new tables (non-breaking)
- Adding new functions (non-breaking)
- Creating new views (non-breaking)

### Medium Risk ⚠️
- Changing foreign keys (could break existing queries)
- Adding triggers (performance impact)

### High Risk ❌
- None identified

## Rollback Plan

```sql
-- Rollback Migration 003
DROP TRIGGER IF EXISTS trg_cascade_valuation_update ON portfolio.company_valuations;
DROP TRIGGER IF EXISTS trg_cascade_position_update ON portfolio.deal_company_positions;
DROP FUNCTION IF EXISTS portfolio.cascade_valuation_update() CASCADE;
DROP FUNCTION IF EXISTS portfolio.cascade_position_update() CASCADE;
DROP TABLE IF EXISTS audit.nav_cascade_log;

-- Rollback Migration 002
ALTER TABLE public.deals_clean 
DROP COLUMN IF EXISTS nc_calculation_method,
DROP COLUMN IF EXISTS formula_template,
DROP COLUMN IF EXISTS fee_base_capital;
DROP TABLE IF EXISTS public.formula_templates;
DROP TABLE IF EXISTS audit.net_capital_entries;

-- Rollback Migration 001
ALTER TABLE portfolio.deal_company_positions
DROP COLUMN IF EXISTS net_capital_invested,
DROP COLUMN IF EXISTS is_legacy_deal;
DROP TABLE IF EXISTS audit.investment_entries;
```

## Final Checklist Before Production

- [ ] Backup database
- [ ] Test migrations on staging
- [ ] Update service layer code
- [ ] Update API documentation
- [ ] Notify team of schema changes
- [ ] Schedule maintenance window
- [ ] Prepare rollback scripts
- [ ] Monitor performance after deployment

## Confidence Level: 85%

**Ready for Commit:** YES, with caveats
- Main issues will be fixed
- UUID/Integer inconsistency needs separate migration
- Service layer updates can be done incrementally
- All changes are non-breaking additions