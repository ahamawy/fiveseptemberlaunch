# Supabase Database Synchronization Questions - REVISED WITH ANSWERS

Based on analysis of EQUITIELOGIC documentation, here are the questions with answers found in your documentation:

## 1. Database Schema & Table Structure

### Core Schema Questions

**Q1: Companies Table Discrepancy**

- Which is the source of truth: `companies_clean` (public) or `core.companies`?

**ANSWER FROM DOCS**: According to ENTITY_RELATIONSHIPS.md, `companies_clean` in the public schema is the authoritative source. The document explicitly states that clean tables use explicit primary key names (company_id) and serve as the single source of truth. Legacy views maintain backward compatibility.

**REMAINING QUESTION**: Should we create a mapping view for `portfolio.deal_company_positions` to properly join with `companies_clean`?



ANSWER: Deals have many to many with companies so some deals like new heights have more than 40 companies or like egy vehicle has 4  companies and then companies like dastgyr and spacex have more than one deal so that has to be core funcctionality between fks

---

**Q2: Investors Table Confusion**

- Frontend uses numeric IDs but database has UUIDs in many tables. Which is authoritative?

**ANSWER FROM DOCS**: `investors_clean` with numeric `investor_id` is authoritative (per ENTITY_RELATIONSHIPS.md). The document shows investor_id as the primary key, not UUID.

**ACTION NEEDED**: Migrate UUID-based investor tables to use numeric investor_id to match `investors_clean`.

---

**Q3: Deals Table Relationships**

- How should we handle many-to-many relationships between deals and companies?

**ANSWER FROM DOCS**: ENTITY_RELATIONSHIPS.md shows that `deals_clean` can have 3 different company relationships:

- `underlying_company_id` (portfolio company being invested in)
- `holding_entity` (SPV/holding company)
- `partner_company_id` (co-investor)

The `portfolio.deal_company_positions` table correctly implements the many-to-many relationship for tracking multiple company positions per deal.

---

### Transaction Schema Questions

**Q4: Transaction Types & Flow**

**ANSWER FROM DOCS**: Per ENTITY_RELATIONSHIPS.md, valid transaction types are:

- `primary`: Direct investment transactions
- `secondary`: Secondary market transactions
- `advisory`: Advisory fee transactions
- `subnominee`: Nominee structure transactions

EWT (EquiTie Wholesale Transaction) flows track partner-sourced deals where EquiTie buys wholesale and resells to investors with margin.

---

**Q5: Fee Applications**

**ANSWER FROM DOCS**: According to FEE_CALCULATION_BIBLE.md:

- Fee calculations should be stored in `transactions_clean` with discount fields
- `core.transaction_fees` tracks individual fee line items
- Formula engine is for PROJECTIONS only, not historical transactions (as stated in CLAUDE.md)
- Partner fee splits use `core.partner_fee_splits` table

---

## 2. Business Logic & Calculations

### NAV & Valuation Questions

**Q6: Token NAV Calculation**

**ANSWER FROM DOCS**: Per FORMULA_ENGINE.md and portfolio schema:

- NAV should use weighted average based on `portfolio.deal_company_positions`
- Formula: NAV = Σ(company_position_value × weight) / total_tokens
- The `nav_calculation_method` field should be 'weighted_portfolio'

---

**Q7: Company Valuations**

**ANSWER FROM DOCS**: Based on the portfolio schema:

- Valuations update via `portfolio.company_valuations` table
- Triggers: quarterly marks, funding rounds, exit events
- Share price and pre/post money valuations are related: `post_money = share_price × total_shares`
- Updates cascade through `portfolio.update_token_nav()` function

---

### Fee Calculation Questions

**Q8: Formula Templates**

**ANSWER FROM DOCS**: FORMULA_ENGINE.md provides complete mapping:

- Impossible Foods → 'impossible' template
- Reddit → 'reddit' template
- OpenAI → 'openai' template (tiered management fees)
- Figure AI → 'figure' template
- Scout AI → 'scout' template
- SpaceX 1 → 'spacex1' template (NC-based fees)
- SpaceX 2 → 'spacex2' template
- New Heights → 'newheights' template (minimal fees)
- Egypt Growth → 'egypt' template

Legacy deals: Net capital is INPUT, not calculated (per CLAUDE.md critical rules).

---

**Q9: Discount & Override Logic**

**ANSWER FROM DOCS**: Per FEE_CALCULATION_BIBLE.md:

- Precedence: side letters > term sheets > standard fees
- Discounts stored in `transactions_clean` columns (e.g., `structuring_fee_discount_percent`)
- Range: 0-100 (stored as percentage, not decimal)
- Approvals tracked via `core.investor_fee_overrides.approved_by`

---

## 3. Data Migration & Consistency

### Historical Data Questions

**Q10: Legacy Deal Migration**

**ANSWER FROM DOCS**: Per SUPABASE_GAPS_ANALYSIS.md and CLAUDE.md:

- Legacy deals where only NC is known should NOT reverse-engineer GC
- Mark these with `nc_calculation_method = 'direct'`
- Use `formula_template = 'legacy'` for identification
- Critical rule: "Legacy deal net capital is INPUT, not calculated"

---

**Q11: Document Linking**

**ANSWER FROM DOCS**: From ENTITY_RELATIONSHIPS.md:

- Use `core.document_registry` as central repository
- Link via `document_relationships` table with entity_type and entity_id
- Confidence threshold: HIGH/MEDIUM/LOW (per `match_confidence` field)
- Auto-match only at HIGH confidence (>90%)

---

### Data Integrity Questions

**Q12: Missing Relationships**

**ANSWER FROM DOCS**:

- Enforce strict referential integrity per ENTITY_RELATIONSHIPS.md "Data Integrity Rules"
- All foreign keys must reference existing records
- Use cascading rules to prevent orphaned records
- Missing FKs identified in SUPABASE_GAPS_ANALYSIS.md need immediate addition

---

**Q13: Null Values & Defaults**

**ANSWER FROM DOCS**: Per FEE_CALCULATION_BIBLE.md typical ranges:

- Management Fee: 1-2% (default 2%)
- Structuring Fee: 2.5-10% (default 5%)
- Performance Fee: 20-30% (default 20%)
- Admin Fee: $350-450 (default $350)
- Missing investor info: Required fields cannot be null

---

## 4. API & Service Layer

### Endpoint Consistency Questions

**Q14: API Response Formats**

**PARTIAL ANSWER**: The dashboard mapping in route.ts shows the correct transformation. The UI expects:

```typescript
{
  portfolio: { totalValue, totalCommitted, totalDistributed, unrealizedGain },
  performance: { irr, moic, dpi, tvpi },
  recentActivity: Array,
  activeDeals: number
}
```

**REMAINING QUESTION**: Should we standardize all APIs to use this wrapper format with `data` property?

---

**Q15: Service Layer Architecture**

**ANSWER FROM DOCS**: Per CLAUDE.md:

- Services should use repository pattern (as shown in existing code)
- Cross-schema queries: Use batched IN(...) queries to avoid N+1
- Caching: 60 second cache with 300 second stale-while-revalidate
- Server-side only access for portfolio schema

---

## 5. Real-time & Performance

### Optimization Questions

**Q16: View vs Direct Queries**

**ANSWER FROM DOCS**: Per CLAUDE.md and portfolio schema:

- Use materialized views for complex calculations
- Refresh via `SELECT portfolio.refresh_portfolio_summary()`
- Daily snapshots in `portfolio.position_snapshots`
- Large portfolios: Use pagination with limit/offset

---

**Q17: Real-time Updates**

**PARTIAL ANSWER**:

- NAV needs updates when company valuations change
- Transactions should trigger immediate recalculation

**REMAINING QUESTION**: Use Supabase realtime subscriptions or webhook-based updates?

---

## 6. Security & Compliance

### Access Control Questions

**Q18: RLS (Row Level Security)**

**ANSWER FROM DOCS**: Per table analysis:

- Many core tables have `rls_enabled: true`
- Portfolio tables have `rls_enabled: false` (server-only access)
- Admin vs investor: Use JWT claims for role-based access
- Partners see only their deals via `core.deal_partnerships`

---

**Q19: Audit Trail**

**ANSWER FROM DOCS**: Per FORMULA_ENGINE.md:

- Use `formula_calculation_log` table for all calculations
- Audit schema exists for compliance
- Retention: Not specified (needs business decision)
- Include: transaction changes, fee overrides, valuation updates

---

## 7. Specific Implementation Questions

### Critical Bugs to Fix

**Q20: Critical Bugs**

**ANSWERS/FIXES NEEDED**:

1. **Dashboard API shape**: The mapping in route.ts is correct - keep it
2. **Company valuation cascade**: Call `portfolio.update_token_nav()` after updates
3. **Transaction fee base**: Check `deal.fee_base_capital` field ('GC' or 'NC')
4. **Document confidence**: Only auto-link when `match_confidence = 'HIGH'`

---

### Missing Features

**Q21: Missing Features**

**IMPLEMENTATION GUIDANCE FROM DOCS**:

1. **Exit scenarios**: Use `portfolio.exit_scenarios` with formula templates
2. **Portfolio statements**: Follow calculation sequence in FEE_CALCULATION_BIBLE.md
3. **AUM calculation**: Sum all `portfolio.deal_tokens.nav_per_token × tokens_outstanding`
4. **Investor groups**: Tables exist (`core.investor_groups`, `core.investor_group_members`)

---

## 8. Migration Strategy

### Deployment Questions

**Q22: Migration Approach**

**ANSWER FROM DOCS** (SUPABASE_GAPS_ANALYSIS.md):

- Phase 1: Add new columns to existing tables (don't break existing)
- Phase 2: Populate data using mapping queries
- Phase 3: Create validation queries
- Rollback: Keep original columns unchanged

---

**Q23: Testing & Validation**

**ANSWER FROM DOCS**:

- Test cases for each formula template in FORMULA_ENGINE.md
- Validation: < 1% discrepancy threshold
- Use `formula_calculation_log` for audit trail
- Run parallel calculations before switching

---

## REMAINING QUESTIONS FOR YOU TO ANSWER:

1. **Standardization Decision**: Should all APIs use the same response wrapper format (`{data: ..., meta: ...}`)?
2. **Real-time Strategy**: Supabase realtime subscriptions or webhook-based updates for NAV changes?
3. **Retention Policy**: How long to keep audit logs? (recommend 7 years for financial compliance)
4. **Default Values**: Confirm these defaults are correct:

   - Management Fee: 2%
   - Structuring Fee: 5%
   - Performance Fee: 20%
   - Admin Fee: $350
5. **Migration Timing**: When to schedule production deployment?
6. **Rollback Window**: How long to keep parallel systems running?
7. **View Creation**: Should we create these helper views?

   - `portfolio.deal_company_values` (joined view)
   - `public.investor_dashboard_summary` (cached)
   - `public.deal_token_nav` (real-time NAV)

## IMMEDIATE ACTION ITEMS:

Based on the documentation analysis, these need immediate attention:

1. **Add missing columns to deals_clean** (from SUPABASE_GAPS_ANALYSIS.md):

   - `nc_calculation_method`
   - `formula_template`
   - `fee_base_capital`
   - `premium_calculation_method`
2. **Fix ID type inconsistencies**:

   - Migrate UUID-based investor references to numeric
3. **Create formula_templates table** as specified
4. **Fix portfolio.deal_company_positions joins** to use companies_clean
5. **Implement cascade NAV updates** when company valuations change

The documentation provides most answers. The remaining questions above need your business decisions to proceed with implementation.
