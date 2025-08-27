# Next Session Priority: Formula Calculation Engine Implementation

## Session Date: Next Session
## Priority: CRITICAL ⚠️
## Focus: Implement and validate formula calculations across all deals

---

## 🎯 PRIMARY OBJECTIVE

**Execute the EQUITIELOGIC/SYNC_TO_SUPABASE.sql migration and implement the formula calculation engine to ensure all fee calculations match the Fee Calculation Bible.**

---

## 📋 SESSION CHECKLIST

### Part 1: Database Migration (30 min)
- [ ] Run `EQUITIELOGIC/SYNC_TO_SUPABASE.sql` via MCP tools
- [ ] Verify all types created successfully
- [ ] Confirm formula_calculation_log table exists
- [ ] Validate all deals have formula_template assigned
- [ ] Check discount columns added to transactions_clean

### Part 2: Formula Engine Implementation (45 min)
- [ ] Implement calculate_net_capital() function in Supabase
- [ ] Create validate_fee_calculations() function
- [ ] Add triggers for automatic calculation updates
- [ ] Create portfolio_performance materialized view
- [ ] Test calculations for each formula template:
  - [ ] Standard
  - [ ] Impossible (premium_based)
  - [ ] Reddit (direct + other_fees)
  - [ ] OpenAI (complex + tiered)
  - [ ] Figure (structured)
  - [ ] SpaceX1 (inverse + NC basis)
  - [ ] SpaceX2 (premium_based)
  - [ ] NewHeights (direct minimal)
  - [ ] Egypt (direct + premium)

### Part 3: Validation & Testing (30 min)
- [ ] Run validation for all historical transactions
- [ ] Compare calculated vs stored values
- [ ] Log discrepancies > 1% to formula_calculation_log
- [ ] Generate validation report
- [ ] Update equitielogic_sync_status table

### Part 4: Service Layer Updates (15 min)
- [ ] Update `lib/services/formula-engine.service.ts`
- [ ] Ensure service uses new calculation functions
- [ ] Add caching for formula results
- [ ] Test API endpoints return correct calculations

---

## 🚨 CRITICAL ISSUES TO ADDRESS

1. **Missing Formula Calculation Log**: This table is REQUIRED for audit trail
2. **NC Calculation Variations**: 6 different methods must be properly implemented
3. **Fee Base Capital**: Some deals use NC instead of GC for fee calculations
4. **Tiered Management Fees**: OpenAI and SpaceX1 have year-based tiers
5. **Other Fees**: Reddit deal has unique "other_fees" requirement

---

## 📊 SUCCESS METRICS

- ✅ 100% of deals have formula_template assigned
- ✅ 100% of transactions have net_capital_calculated
- ✅ < 1% discrepancy between calculated and stored values
- ✅ All validation queries return "PASS" status
- ✅ Formula calculation log capturing all calculations

---

## 🔧 KEY SQL TO RUN

```sql
-- First: Run the main sync script
\i /Users/ahmedelhamawy/Desktop/15.1.1 investor-portal-dashboard/EQUITIELOGIC/SYNC_TO_SUPABASE.sql

-- Then: Validate the migration
SELECT * FROM validate_fee_calculations();

-- Finally: Check sync health
WITH sync_metrics AS (
    SELECT 
        'Deals with Templates' as metric,
        COUNT(*) FILTER (WHERE formula_template IS NOT NULL)::FLOAT / COUNT(*) * 100 as percentage
    FROM deals_clean
    UNION ALL
    SELECT 
        'Transactions with NC',
        COUNT(*) FILTER (WHERE initial_net_capital IS NOT NULL)::FLOAT / COUNT(*) * 100
    FROM transactions_clean
)
SELECT metric, ROUND(percentage, 2) as sync_percentage FROM sync_metrics;
```

---

## 📚 REFERENCE DOCUMENTS

1. **EQUITIELOGIC/FEE_CALCULATION_BIBLE.md** - Exact formulas for each deal type
2. **EQUITIELOGIC/FORMULA_ENGINE_SCHEMA_MAPPING.md** - Variable to field mappings
3. **EQUITIELOGIC/SUPABASE_GAPS_ANALYSIS.md** - What was missing (now addressed)
4. **FEATURES/FEATURE_TREE_V2.md** - System architecture context

---

## 🎯 WHY THIS IS THE TOP PRIORITY

1. **Revenue Accuracy**: Incorrect fee calculations = incorrect revenue
2. **Investor Trust**: Wrong calculations damage credibility
3. **Audit Requirements**: Need complete calculation trail for compliance
4. **System Foundation**: All other features depend on accurate calculations
5. **Data Integrity**: Supabase must be the single source of truth

---

## 💡 QUICK WINS

If time permits after core implementation:
1. Create dashboard showing calculation accuracy metrics
2. Add automated daily validation job
3. Create Excel export of calculation audit trail
4. Build fee comparison tool (old vs new calculations)

---

## 📝 NOTES FOR NEXT SESSION

- Start with database migration FIRST
- Test each formula template individually
- Document any discrepancies found
- Keep formula_calculation_log verbose for debugging
- Consider creating a rollback script before starting

---

**Remember: Supabase is the SINGLE SOURCE OF TRUTH. All calculations must happen in Supabase, not in application code.**