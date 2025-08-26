# EquiTie Fee Calculation Bible

## Executive Summary

This document serves as the definitive guide for all fee calculations in the EquiTie platform. It provides exact formulas, calculation sequences, edge cases, and implementation requirements to ensure consistent and accurate fee application across all investment transactions.

## Fee Philosophy

EquiTie operates on a multi-layered fee model that aligns interests between:
- **Investors**: Seeking returns on capital
- **EquiTie**: Platform operator earning fees for services
- **Partners**: Co-investors sharing risks and rewards
- **Advisors**: Earning success-based compensation

## Fee Types & Timing Matrix

| Fee Type | When Charged | Calculation Base | Typical Range | Who Pays | Who Receives |
|----------|--------------|------------------|---------------|----------|--------------|
| Structuring | At Investment | Gross Capital | 2.5% - 10% | Investor | EquiTie/Partner |
| Premium | At Investment | Valuation Uplift | Variable | Investor | EquiTie |
| Management | Annual | AUM | 1% - 2% | Investor | EquiTie/Partner |
| Performance | At Exit | Profits | 20% - 30% | Investor | EquiTie/Partner |
| Admin | At Transaction | Flat/Fixed | $350 - $450 | Investor | EquiTie/Partner |

## Master Fee Calculation Sequence

### Phase 1: Initial Investment (T=0)

```python
# Step 1: Start with investor commitment
gross_capital = investor_commitment

# Step 2: Calculate structuring fee
structuring_fee_rate = deal.eq_structuring_fee_percent / 100
structuring_discount = investor.structuring_discount_percent / 100
effective_structuring_rate = structuring_fee_rate * (1 - structuring_discount)
structuring_fee_amount = gross_capital * effective_structuring_rate

# Step 3: Calculate premium (if applicable)
if deal.has_premium:
    # Method 1: Valuation-based
    premium_rate = (deal.pre_money_sell_valuation / deal.pre_money_purchase_valuation) - 1
    # Method 2: Unit price-based
    premium_rate = (deal.exit_unit_price / deal.initial_unit_price) - 1
    
    premium_discount = investor.premium_discount_percent / 100
    effective_premium_rate = premium_rate * (1 - premium_discount)
    premium_amount = gross_capital * effective_premium_rate
else:
    premium_amount = 0

# Step 4: Apply admin fee
admin_fee = deal.eq_admin_fee  # Flat fee
admin_discount = investor.admin_discount_percent / 100
effective_admin_fee = admin_fee * (1 - admin_discount)

# Step 5: Calculate net capital
initial_net_capital = gross_capital - structuring_fee_amount - premium_amount - effective_admin_fee

# Step 6: Calculate units purchased
units_purchased = initial_net_capital / deal.initial_unit_price

# Step 7: Record initial position
investor_position = {
    'gross_capital': gross_capital,
    'total_fees_paid': structuring_fee_amount + premium_amount + effective_admin_fee,
    'net_capital': initial_net_capital,
    'units': units_purchased,
    'cost_basis': initial_net_capital
}
```

### Phase 2: Holding Period (Annual)

```python
# Annual management fee calculation
for year in holding_period:
    # Determine AUM base
    if year == 1:
        aum = initial_net_capital
    else:
        aum = current_market_value
    
    # Apply tiered management fees
    if year <= deal.tier_1_period:
        mgmt_rate = deal.eq_management_fee_1_percent / 100
    else:
        mgmt_rate = deal.eq_management_fee_2_percent / 100
    
    # Apply discount
    mgmt_discount = investor.management_discount_percent / 100
    effective_mgmt_rate = mgmt_rate * (1 - mgmt_discount)
    
    # Calculate fee
    annual_mgmt_fee = aum * effective_mgmt_rate
    
    # Deduct from position
    investor_position['total_fees_paid'] += annual_mgmt_fee
    investor_position['current_value'] -= annual_mgmt_fee
```

### Phase 3: Exit/Distribution

```python
# Exit calculation
def calculate_exit_proceeds(investor_position, exit_price):
    # Step 1: Calculate gross proceeds
    gross_proceeds = investor_position['units'] * exit_price
    
    # Step 2: Calculate profit
    profit = gross_proceeds - investor_position['cost_basis']
    
    # Step 3: Apply performance fee (only on gains)
    if profit > 0:
        perf_rate = deal.eq_performance_fee_percent / 100
        perf_discount = investor.performance_discount_percent / 100
        effective_perf_rate = perf_rate * (1 - perf_discount)
        performance_fee = profit * effective_perf_rate
    else:
        performance_fee = 0
    
    # Step 4: Calculate net proceeds
    net_proceeds = gross_proceeds - performance_fee
    
    # Step 5: Calculate returns
    total_return = net_proceeds - investor_position['gross_capital']
    moic = net_proceeds / investor_position['gross_capital']
    
    # Step 6: Calculate IRR
    years_held = (exit_date - investment_date).days / 365.25
    irr = ((net_proceeds / investor_position['gross_capital']) ** (1/years_held)) - 1
    
    return {
        'gross_proceeds': gross_proceeds,
        'performance_fee': performance_fee,
        'net_proceeds': net_proceeds,
        'total_return': total_return,
        'moic': moic,
        'irr': irr * 100  # As percentage
    }
```

## Partnership Deal Fee Splitting

When deals involve partners, fees are split between EquiTie and the partner:

```python
def calculate_partnership_fees(deal, investor):
    # Structuring fee split
    total_struct_rate = deal.eq_structuring_fee_percent + deal.partner_structuring_fee_percent
    eq_struct_amount = gross_capital * (deal.eq_structuring_fee_percent / 100)
    partner_struct_amount = gross_capital * (deal.partner_structuring_fee_percent / 100)
    
    # Management fee split
    total_mgmt_rate = deal.eq_management_fee_percent + deal.partner_management_fee_percent
    eq_mgmt_amount = aum * (deal.eq_management_fee_percent / 100)
    partner_mgmt_amount = aum * (deal.partner_management_fee_percent / 100)
    
    # Performance fee split
    total_perf_rate = deal.eq_performance_fee_percent + deal.partner_performance_fee_percent
    eq_perf_amount = profit * (deal.eq_performance_fee_percent / 100)
    partner_perf_amount = profit * (deal.partner_performance_fee_percent / 100)
    
    return {
        'equitie_fees': eq_struct_amount + eq_mgmt_amount + eq_perf_amount,
        'partner_fees': partner_struct_amount + partner_mgmt_amount + partner_perf_amount
    }
```

## Discount Framework

### Discount Application Rules

1. **Discount Range**: 0% to 100%
   - 0% = No discount (pay full fee)
   - 50% = Half price
   - 100% = Fee waived

2. **Discount Formula**:
   ```
   Effective Fee = Base Fee × (1 - Discount Rate)
   ```

3. **Discount Sources**:
   - **Volume Discounts**: Based on investment size
   - **Relationship Discounts**: Long-term investors
   - **Promotional Discounts**: Limited time offers
   - **Side Letter Discounts**: Negotiated terms

### Discount Hierarchy

```python
def apply_discounts(base_fee, discounts):
    # Discounts are multiplicative, not additive
    effective_discount = 1.0
    
    for discount in discounts:
        effective_discount *= (1 - discount['rate'])
    
    final_discount = 1 - effective_discount
    discounted_fee = base_fee * (1 - final_discount)
    
    return discounted_fee
```

## Special Scenarios

### 1. Advisory Deals

```python
def calculate_advisory_deal_fees(deal, investor):
    # Advisory deals typically have reduced investor fees
    # EquiTie earns through advisory shares instead
    
    if deal.deal_type == 'advisory':
        # Minimal or zero investor fees
        structuring_fee = 0
        management_fee = 0
        
        # EquiTie earns advisory shares
        equitie_units = deal.advisory_shares_earned
        equitie_value = equitie_units * current_unit_price
        
    return investor_fees, equitie_value
```

### 2. Secondary Transactions

```python
def calculate_secondary_transaction(seller, buyer, units, price):
    # Seller calculation
    seller_proceeds = units * price
    seller_gain = seller_proceeds - (seller.cost_basis * (units / seller.total_units))
    
    if seller_gain > 0:
        seller_perf_fee = seller_gain * performance_rate
        seller_net = seller_proceeds - seller_perf_fee
    else:
        seller_net = seller_proceeds
    
    # Buyer calculation
    buyer_gross = units * price
    buyer_struct_fee = buyer_gross * structuring_rate
    buyer_admin_fee = flat_admin_fee
    buyer_net_capital = buyer_gross - buyer_struct_fee - buyer_admin_fee
    
    return {
        'seller_net_proceeds': seller_net,
        'buyer_net_investment': buyer_net_capital
    }
```

### 3. Nominee Structures

```python
def calculate_nominee_transaction(nominee, beneficial_owner, amount):
    # Fees are typically charged to the beneficial owner
    # Nominee acts as pass-through
    
    if transaction.nominee == True:
        fee_payer = beneficial_owner
        units_holder = nominee
        beneficial_holder = beneficial_owner
        
        # All fees calculated based on beneficial owner's rates
        fees = calculate_standard_fees(beneficial_owner, amount)
        
    return fees, units_holder, beneficial_holder
```

## Edge Cases & Validation

### 1. Negative Returns

```python
def handle_negative_returns(investment, exit_value):
    if exit_value < investment:
        # No performance fee on losses
        performance_fee = 0
        
        # Management fees still apply
        management_fee = calculate_management_fee(aum)
        
        # No clawback unless specified in agreements
        net_proceeds = exit_value - management_fee
        
    return net_proceeds
```

### 2. Partial Exits

```python
def calculate_partial_exit(position, exit_units, exit_price):
    # Pro-rata calculation
    exit_percentage = exit_units / position.total_units
    
    # Allocate cost basis
    exit_cost_basis = position.cost_basis * exit_percentage
    
    # Calculate proceeds
    gross_proceeds = exit_units * exit_price
    profit = gross_proceeds - exit_cost_basis
    
    if profit > 0:
        performance_fee = profit * performance_rate
    else:
        performance_fee = 0
    
    net_proceeds = gross_proceeds - performance_fee
    
    # Update remaining position
    position.total_units -= exit_units
    position.cost_basis -= exit_cost_basis
    
    return net_proceeds, position
```

### 3. Currency Conversion

```python
def apply_fx_conversion(amount, from_currency, to_currency, date):
    # Lock exchange rate at transaction
    fx_rate = get_fx_rate(from_currency, to_currency, date)
    
    # Apply conversion
    converted_amount = amount * fx_rate
    
    # Store rate for audit
    transaction.fx_rate_applied = fx_rate
    transaction.fx_date_locked = date
    
    return converted_amount
```

## Fee Calculation Validation Rules

### Pre-Transaction Validations

1. **Investor Eligibility**:
   ```python
   assert investor.kyc_status == 'verified'
   assert investor.accreditation_status == 'qualified'
   assert deal.status == 'raising'
   ```

2. **Amount Validations**:
   ```python
   assert gross_capital >= deal.minimum_investment
   assert gross_capital <= deal.maximum_investment
   assert gross_capital <= investor.investment_limit
   ```

3. **Fee Rate Validations**:
   ```python
   assert 0 <= structuring_rate <= 0.25  # Max 25%
   assert 0 <= management_rate <= 0.05   # Max 5%
   assert 0 <= performance_rate <= 0.50  # Max 50%
   assert 0 <= discount_rate <= 1.0      # Max 100%
   ```

### Post-Transaction Validations

1. **Balance Checks**:
   ```python
   assert net_capital == gross_capital - total_fees
   assert units_purchased == net_capital / unit_price
   assert sum(all_investor_units) == deal.total_units_issued
   ```

2. **Fee Allocation**:
   ```python
   assert equitie_fees + partner_fees == total_fees
   assert sum(investor_fees) == deal.total_fees_collected
   ```

## Implementation Requirements

### Database Constraints

```sql
-- Ensure fees are non-negative
ALTER TABLE transactions_clean
ADD CONSTRAINT check_positive_fees CHECK (
    structuring_fee_amount >= 0 AND
    management_fee_amount >= 0 AND
    performance_fee_amount >= 0 AND
    admin_fee >= 0
);

-- Ensure discounts are valid percentages
ALTER TABLE transactions_clean
ADD CONSTRAINT check_discount_range CHECK (
    structuring_fee_discount_percent BETWEEN 0 AND 1 AND
    management_fee_discount_percent BETWEEN 0 AND 1 AND
    performance_fee_discount_percent BETWEEN 0 AND 1
);

-- Ensure net capital calculation
ALTER TABLE transactions_clean
ADD CONSTRAINT check_net_capital CHECK (
    initial_net_capital = gross_capital - 
    (structuring_fee_amount + premium_amount + admin_fee)
);
```

### Audit Trail Requirements

Every fee calculation must maintain:

1. **Input Snapshot**:
   ```json
   {
     "timestamp": "2024-11-26T10:30:00Z",
     "gross_capital": 100000,
     "fee_rates": {
       "structuring": 0.025,
       "management": 0.02,
       "performance": 0.20
     },
     "discounts": {
       "structuring": 0.10,
       "management": 0,
       "performance": 0
     }
   }
   ```

2. **Calculation Steps**:
   ```json
   {
     "steps": [
       {"step": 1, "operation": "structuring_fee", "result": 2250},
       {"step": 2, "operation": "premium", "result": 0},
       {"step": 3, "operation": "admin_fee", "result": 350},
       {"step": 4, "operation": "net_capital", "result": 97400}
     ]
   }
   ```

3. **Final Results**:
   ```json
   {
     "gross_capital": 100000,
     "total_fees": 2600,
     "net_capital": 97400,
     "units_purchased": 97.4,
     "effective_price": 1000
   }
   ```

## Testing Scenarios

### Scenario 1: Standard Investment

```python
# Input
investor_commitment = 100000
structuring_rate = 0.025
management_rate = 0.02
performance_rate = 0.20
exit_multiple = 2.0

# Expected Output
net_capital = 97500  # After 2.5% structuring
units = 97.5
exit_proceeds = 195000
performance_fee = 19500  # 20% of 97500 gain
net_proceeds = 175500
moic = 1.755
```

### Scenario 2: Discounted Partnership Deal

```python
# Input
investor_commitment = 500000
eq_structuring = 0.015
partner_structuring = 0.01
structuring_discount = 0.20  # 20% discount
exit_multiple = 1.5

# Expected Output
total_structuring_rate = 0.025
effective_rate = 0.02  # After 20% discount
structuring_fee = 10000
net_capital = 490000
# ... continue calculation
```

## Appendices

### A. Fee Rate Reference Table

| Deal Type | Structuring | Management | Performance | Admin |
|-----------|-------------|------------|-------------|-------|
| Primary | 2.5% - 5% | 2% | 20% | $350 |
| Secondary | 5% - 10% | 2% | 20% | $350 |
| Advisory | 0% | 0% | 0% | $0 |
| Partnership | 1.5% + 1% | 1% + 1% | 10% + 10% | $350 |
| SPV | 2.5% | 2% | 20% | $450 |

### B. Regulatory Limits

- Maximum total fees: 35% of gross capital
- Maximum annual management fee: 5%
- Maximum performance fee: 50% of gains
- Minimum disclosure requirements: All fees itemized

### C. Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2024-11-26 | Initial fee calculation bible |
| 1.1 | TBD | Add new fee types |