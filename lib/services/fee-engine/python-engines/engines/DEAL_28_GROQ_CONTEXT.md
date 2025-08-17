# Deal 28 - Groq AI Investment
## ARCHON/EQUITIE Fee Engine Context

### Deal Overview
- **Deal ID**: 28
- **Deal Name**: Groq AI Investment
- **Deal Type**: FACILITATED_DIRECT
- **Date**: July 2025
- **Complexity**: STANDARD with Valuation-Based Premium

### Valuation Parameters
- **Purchase Valuation**: $5,300,000,000 (Pre-money)
- **Sell Valuation**: $5,500,000,000 (Pre-money)
- **Valuation Delta**: $200,000,000
- **Premium Rate**: 3.77358% (calculated as delta/purchase)

### Fee Schedule (Applied in Precedence Order)
1. **PREMIUM** (Precedence: 1)
   - Rate: 3.77358% on GROSS
   - Basis: GROSS capital
   - Notes: Valuation-based, always applied first

2. **STRUCTURING** (Precedence: 2)
   - Rate: 4% on GROSS
   - Basis: GROSS capital
   - Discountable: Yes

3. **MANAGEMENT** (Precedence: 3)
   - Rate: 2% on GROSS (annual)
   - Basis: GROSS capital
   - Can be multiplied for multiple years
   - Discountable: Yes

4. **ADMIN** (Precedence: 4)
   - Amount: $450 fixed
   - Basis: FIXED
   - Per investor fee
   - Discountable: Yes

### Calculation Formula
```
1. Premium = Gross Capital × 3.77358%
2. Net Capital = Gross Capital - Premium
3. Structuring Fee = Gross Capital × 4%
4. Management Fee = Gross Capital × 2% × Years
5. Admin Fee = $450
6. Transfer Pre-Discount = Sum of all fees
7. Apply Discounts (as negative amounts)
8. Transfer Post-Discount = Transfer Pre-Discount - Total Discounts
9. Units = floor(Net Capital / $1000)
```

### Key Invariants
- Premium MUST be calculated first (precedence = 1)
- Net Capital = Gross Capital - Premium
- Discounts are stored as NEGATIVE amounts
- Units are always integers (floor division)
- All monetary amounts rounded to 2 decimal places

### Example Calculations

#### Investor 1: John Doe
- Gross Capital: $100,000
- Discounts: 50% Structuring, 100% Admin
```python
Premium: $100,000 × 3.77358% = $3,773.58
Net Capital: $100,000 - $3,773.58 = $96,226.42
Structuring: $100,000 × 4% = $4,000
  Discount: -$2,000 (50%)
Management: $100,000 × 2% = $2,000
Admin: $450
  Discount: -$450 (100%)
Transfer: $3,773.58 + $4,000 + $2,000 + $450 - $2,000 - $450 = $7,773.58
Units: floor($96,226.42 / $1,000) = 96
```

#### Expected Totals (Full Import)
- Total Gross Capital: $1,453,750
- Total Net Capital: $1,398,892
- Total Units: 1,399
- Transfer Pre-Discount: $1,552,225
- Total Discounts: $37,225
- Transfer Post-Discount: $1,515,000

### Python Engine Usage
```python
from deal_28_groq_engine import GroqDealEngine

# Initialize engine
engine = GroqDealEngine()

# Calculate for single investor
result = engine.calculate_for_investor(
    investor_name="John Doe",
    gross_capital=Decimal('100000'),
    structuring_discount_percent=Decimal('50'),
    management_discount_percent=Decimal('0'),
    admin_discount_percent=Decimal('100'),
    management_years=1
)

print(f"Transfer: ${result.transfer_post_discount:,.2f}")
print(f"Units: {result.units}")
```

### Batch Processing
```python
investors = [
    {
        'name': 'John Doe',
        'gross_capital': 100000,
        'structuring_discount': 50,
        'admin_discount': 100
    },
    # ... more investors
]

results = engine.calculate_batch(investors)
summary = engine.generate_summary_report(results)
```

### Zero-Shot Prompts for AI Agents
- "Calculate Groq deal fees for $100,000 investment with 50% structuring discount"
- "What is the premium rate for the Groq deal based on valuations?"
- "Generate fee breakdown for deal 28 with standard discounts"
- "Validate that Groq deal calculations match expected totals"
- "Apply 3 years of management fees to Groq investment"

### Database Integration
```sql
-- Insert fee schedule
INSERT INTO fees.fee_schedule (deal_id, component, rate, is_percent, basis, precedence)
VALUES 
  (28, 'PREMIUM', 0.0377358, true, 'GROSS', 1),
  (28, 'STRUCTURING', 0.04, true, 'GROSS', 2),
  (28, 'MANAGEMENT', 0.02, true, 'GROSS', 3),
  (28, 'ADMIN', 450, false, 'FIXED', 4);

-- Apply discounts (negative amounts)
INSERT INTO fees.fee_application (transaction_id, deal_id, component, amount)
VALUES
  (123, 28, 'STRUCTURING', 4000),
  (123, 28, 'STRUCTURING_DISCOUNT', -2000);  -- 50% discount
```

### Validation Checklist
- [ ] Premium rate = 3.77358% (from valuations)
- [ ] All fees applied in precedence order
- [ ] Discounts stored as negative amounts
- [ ] Net capital = Gross - Premium
- [ ] Units = floor(Net / 1000)
- [ ] Transfer amounts reconcile
- [ ] No fractional units

### Special Considerations
1. **Valuation-Based Premium**: The premium is calculated from the difference between sell and purchase valuations, not a fixed rate
2. **Annual Management**: Management fee can be multiplied for multi-year holdings
3. **Fixed Admin Fee**: $450 per investor regardless of investment size
4. **Discount Application**: Discounts apply to specific fee components, not the total

### Files Generated
- **Engine**: `deal_28_groq_engine.py`
- **Tests**: `test_deal_28_groq.py`
- **Context**: `DEAL_28_GROQ_CONTEXT.md`

### Notes for Agents
This is a STANDARD complexity deal with a special valuation-based premium calculation. The engine handles all standard fee types with proper precedence ordering and discount application. Always ensure the premium is calculated first and that all discounts are stored as negative amounts in the database.