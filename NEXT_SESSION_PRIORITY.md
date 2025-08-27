# Next Session Priority: Formula Calculation Engine Implementation

## Session Date: Next Session
## Priority: CRITICAL ⚠️
## Focus: Implement and validate formula calculations across all deals

---

## 🎯 PRIMARY OBJECTIVE

**Ensure 100% accuracy in fee calculations by implementing the Formula Calculation Engine**

The Formula Engine is CRITICAL because:
- 683 transactions worth $20.9M need validation
- Fee calculations directly impact investor returns
- Audit trail required for compliance
- Current calculations may have discrepancies

---

## 📋 IMMEDIATE ACTIONS (First 30 Minutes)

### 1. Execute Database Migration
```bash
# Run the SYNC_TO_SUPABASE.sql script in Supabase
mcp__supabase__apply_migration({
  project_id: "ikezqzljrupkzmyytgok",
  name: "formula_engine_sync",
  query: <contents of EQUITIELOGIC/SYNC_TO_SUPABASE.sql>
})
```

### 2. Verify Migration Success
```sql
-- Check all components are created
SELECT 
    (SELECT COUNT(*) FROM pg_type WHERE typname = 'nc_calculation_method') as nc_enum,
    (SELECT COUNT(*) FROM pg_type WHERE typname = 'premium_calculation_method') as premium_enum,
    (SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'formula_calculation_log')) as log_table,
    (SELECT COUNT(*) FROM deals_clean WHERE formula_template IS NOT NULL) as mapped_deals;
```

### 3. Test Calculation Functions
```sql
-- Test NC calculation for each method
SELECT 
    calculate_net_capital(100000, 'standard', '{"sfr": 0.025}'::jsonb) as standard,
    calculate_net_capital(100000, 'direct', '{}'::jsonb) as direct,
    calculate_net_capital(100000, 'inverse', '{"sfr": 0.025}'::jsonb) as inverse,
    calculate_net_capital(100000, 'structured', '{"sfr": 0.025}'::jsonb) as structured,
    calculate_net_capital(100000, 'premium_based', '{"pmsp": 120, "isp": 100}'::jsonb) as premium,
    calculate_net_capital(100000, 'complex', '{"sfr": 0.025, "pmsp": 120, "isp": 100}'::jsonb) as complex;
```

---

## 🔧 MAIN IMPLEMENTATION TASKS

### Phase 1: Validate Historical Transactions (Hours 1-2)
```typescript
// Create validation service
class FormulaValidationService {
  async validateAllTransactions() {
    // 1. Get all transactions with their deals
    const transactions = await sb.from('transactions_clean')
      .select('*, deals_clean(*)')
      .order('transaction_date', { ascending: false });
    
    // 2. For each transaction, recalculate NC
    for (const tx of transactions) {
      const calculated = await this.calculateNetCapital(tx);
      const discrepancy = Math.abs(calculated - tx.initial_net_capital);
      
      // 3. Log to formula_calculation_log
      await this.logCalculation(tx, calculated, discrepancy);
      
      // 4. Flag if discrepancy > 1%
      if (discrepancy / tx.gross_capital > 0.01) {
        console.warn(`Discrepancy found: Transaction ${tx.transaction_id}`);
      }
    }
  }
}
```

### Phase 2: Implement Real-time Calculator (Hours 2-3)
```typescript
// Update transaction service
async calculateFees(transaction: Transaction) {
  const deal = await this.getDeal(transaction.deal_id);
  
  // Apply formula template
  const ncMethod = deal.nc_calculation_method || 'standard';
  const variables = {
    sfr: transaction.sfr || 0,
    pmsp: transaction.pmsp || 0,
    isp: transaction.isp || 1,
    // ... other variables
  };
  
  // Calculate NC
  const netCapital = await sb.rpc('calculate_net_capital', {
    p_gross_capital: transaction.gross_capital,
    p_formula_method: ncMethod,
    p_variables: variables
  });
  
  // Calculate all fees
  const fees = this.calculateAllFees(transaction, deal, netCapital);
  
  // Log calculation
  await this.logToAuditTrail(transaction, fees);
  
  return { netCapital, fees };
}
```

### Phase 3: Create Validation Dashboard (Hours 3-4)
```typescript
// Create /admin/formula-validation page
export default function FormulaValidationPage() {
  // Show validation status for all deals
  const validationResults = await getValidationResults();
  
  return (
    <Dashboard>
      <MetricCard title="Validation Coverage" value="683/683" />
      <MetricCard title="Accuracy Rate" value="98.5%" />
      <MetricCard title="Total Discrepancy" value="$12,450" />
      
      <ValidationTable results={validationResults} />
      <DiscrepancyChart data={discrepancies} />
    </Dashboard>
  );
}
```

---

## 📊 SUCCESS METRICS

### Must Achieve:
- [ ] 100% of deals mapped to formula templates
- [ ] All 683 transactions validated
- [ ] < 1% discrepancy rate
- [ ] Complete audit trail in formula_calculation_log
- [ ] All 6 NC calculation methods tested

### Nice to Have:
- [ ] Real-time calculation API endpoint
- [ ] Validation dashboard deployed
- [ ] Performance < 100ms per calculation
- [ ] Automated daily validation job

---

## 🚨 CRITICAL VALIDATIONS

### Deal Template Mapping
```sql
-- Ensure all deals have templates
SELECT deal_name, formula_template, nc_calculation_method
FROM deals_clean
WHERE formula_template IS NULL;
```

### Fee Calculation Accuracy
```sql
-- Check fee totals match
SELECT 
    transaction_id,
    gross_capital,
    initial_net_capital,
    (admin_fee + management_fee_amount + structuring_fee_amount + premium_amount) as total_fees,
    (gross_capital - initial_net_capital) as implied_fees,
    ABS((gross_capital - initial_net_capital) - 
        (admin_fee + management_fee_amount + structuring_fee_amount + premium_amount)) as discrepancy
FROM transactions_clean
WHERE ABS((gross_capital - initial_net_capital) - 
          (admin_fee + management_fee_amount + structuring_fee_amount + premium_amount)) > 1;
```

### MOIC/IRR Calculations
```sql
-- Validate return metrics
SELECT 
    deal_name,
    COUNT(*) as tx_count,
    SUM(gross_capital) as total_invested,
    AVG(moic_realized) as avg_moic,
    AVG(irr_realized) as avg_irr
FROM transactions_clean t
JOIN deals_clean d ON t.deal_id = d.deal_id
WHERE exit_date IS NOT NULL
GROUP BY deal_name;
```

---

## 🎯 END OF SESSION DELIVERABLES

1. **Migration Complete**: All schema changes applied
2. **Functions Working**: All 6 NC methods calculate correctly  
3. **Validation Report**: All 683 transactions validated
4. **Audit Trail**: Complete log of all calculations
5. **Documentation**: Updated with calculation examples

---

## 💡 QUICK REFERENCE

### Formula Templates
- `impossible`: NC = GC × (PMSP/ISP)
- `reddit`: NC = GC, allows other_fees
- `openai`: NC = (GC × (1-SFR)) × (PMSP/ISP), tiered mgmt
- `figure`: NC = GC × (1-SFR)
- `scout`: NC = GC with premium
- `spacex1`: NC = GC / (1+SFR), fees on NC
- `spacex2`: NC = GC × (PMSP/ISP)
- `newheights`: NC = GC, minimal fees
- `egypt`: NC = GC with premium

### Key Tables
- `deals_clean`: Formula configuration
- `transactions_clean`: Transaction data & fees
- `formula_calculation_log`: Audit trail
- `portfolio_performance`: Materialized view

---

## 🔥 IF TIME PERMITS

- Implement automatic recalculation triggers
- Create formula template editor UI
- Build investor fee report generator
- Add GraphQL API for formula calculations
- Create Playwright tests for validation

---

**Remember**: The Formula Engine is the foundation for accurate fee calculations. Every transaction depends on this being correct. Take time to validate thoroughly!