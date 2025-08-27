# EquiTie Formula Engine & Validation System

## Variable Glossary

### Core Variables
| Variable | Description | Source | Validation Rule |
|----------|-------------|--------|-----------------|
| **GC** | Gross Capital | Input | Must be > 0 |
| **NC** | Net Capital | Calculated | Varies by deal formula |
| **NCD** | Net Capital with Discount | Calculated | NC with premium discount applied |
| **NCP** | Partner Net Capital | Calculated | Partner's share of capital |
| **IUP** | Initial Unit Price | Input | Typically 1000, varies by deal |
| **EUP** | Exit Unit Price | Input | Must be >= IUP at exit |
| **ISP** | Investor Share Price | Input | Actual price paid by investor |
| **ESP** | Exit Share Price | Input | Price at exit for partner |
| **PMSP** | Pre-Money Share Price | Input | Valuation-based pricing |
| **T** | Time (Years Held) | Calculated | Exit Date - Investment Date |

### Fee Variables
| Variable | Description | Typical Range |
|----------|-------------|---------------|
| **MFR** | Management Fee Rate | 0-6% |
| **MFR1** | Management Fee Rate Year 1 | Variable |
| **MFR2** | Management Fee Rate Year 2+ | Variable |
| **SFR** | Structuring Fee Rate | 0-10.53% |
| **PFR** | Performance Fee Rate | 0-22.5% |
| **AF** | Admin Fee (Flat) | $0-450 |
| **OF** | Other Fees | Variable |
| **PMFR** | Partner Management Fee Rate | 0-6% |
| **PSFR** | Partner Structuring Fee Rate | 0-8% |
| **PPFR** | Partner Performance Fee Rate | 0-22.5% |
| **PAF** | Partner Admin Fee | Variable |

### Discount Variables
| Variable | Description | Range |
|----------|-------------|-------|
| **DMFR** | Discount on Management Fee | 0-1 (0=none, 1=100%) |
| **DMFR1** | Discount on MFR Year 1 | 0-1 |
| **DMFR2** | Discount on MFR Year 2+ | 0-1 |
| **DSFR** | Discount on Structuring Fee | 0-1 |
| **DPFR** | Discount on Performance Fee | 0-1 |
| **DAF** | Discount on Admin Fee | 0-1 |
| **DPMR** | Discount on Premium | 0-1 |
| **DPMFR** | Discount on Partner Management | 0-1 |
| **DPSFR** | Discount on Partner Structuring | 0-1 |
| **DPPFR** | Discount on Partner Performance | 0-1 |
| **DPAF** | Discount on Partner Admin | 0-1 |

## Deal-Specific Formula Templates

### Template 1: GROQ Standard
**Deals**: General template
**NC Formula**: `NC = GC - (SFR × GC) - Premium`

```javascript
// Investor Net Proceeds
INP = (NC × (EUP/IUP)) - (MFR × GC × T) - (SFR × GC) - AF - (PFR × ((NC × (EUP/IUP)) - NC))

// Investor Net Proceeds Post Discount
INP_D = (NC × (EUP/IUP)) - ((MFR × (1-DMFR)) × GC × T) - (SFR × (1-DSFR) × GC) - (AF × (1-DAF)) - (PFR × (1-DPFR)) × ((NC × (EUP/IUP)) - NC)
```

### Template 2: Reddit Special
**Deals**: Reddit
**NC Formula**: `NC = GC` (No structuring fee upfront)
**Special**: Introduces "Other Fees" (OF)

```javascript
// Premium calculation unique
Premium = GC - (GC × (PMSP/ISP))

// Investor Net Proceeds
INP = (NC × (EUP/IUP)) - (MFR × GC × T) - (SFR × GC) - Premium - AF - OF - (PFR × ((NC × (EUP/IUP)) - NC))
```

### Template 3: OpenAI Tiered
**Deals**: OpenAI
**NC Formula**: `NC = ((GC × (1 - SFR)) × (PMSP/ISP))`
**Special**: Two-tier management fee

```javascript
// Management fee changes after year 1
MgmtFee = (MFR1 × GC) + (MFR2 × GC × (T - 1))

// Investor Net Proceeds
INP = (NC × (EUP/IUP)) - (MFR1 × GC) - (MFR2 × GC × (T - 1)) - AF - (PFR × ((NC × (EUP/IUP)) - NC))
```

### Template 4: Figure AI
**Deals**: Figure AI 1, Figure AI 2
**NC Formula**: `NC = GC × (1 - SFR)`

```javascript
// Premium included
Premium = GC - (GC × (PMSP/ISP))

// Investor Net Proceeds
INP = (NC × (EUP/IUP)) - (MFR × GC × T) - (SFR × GC) - Premium - AF - (PFR × ((NC × (EUP/IUP)) - NC))
```

### Template 5: Scout AI
**Deals**: Scout AI
**NC Formula**: `NC = GC` (No upfront deduction)

```javascript
// Same as Figure AI but NC = GC
INP = (NC × (EUP/IUP)) - (MFR × GC × T) - (SFR × GC) - Premium - AF - (PFR × ((NC × (EUP/IUP)) - NC))
```

### Template 6: Impossible Foods
**Deals**: Impossible Foods
**NC Formula**: `NC = GC × (PMSP/ISP)`
**Special**: Variable unit price (19-21), suggest using 21 with discount

```javascript
// No GC-NC split traditionally
INP = (NC × (EUP/IUP)) - (MFR × GC × T) - (SFR × GC) - AF - (PFR × ((NC × (EUP/IUP)) - NC))
```

### Template 7: SpaceX v1
**Deals**: SpaceX 1
**NC Formula**: `NC = GC / (1 + SFR)`
**Special**: Tiered management fee (2 years at MFR1, then MFR2)

```javascript
// Management fee calculation
MgmtFee = (MFR1 × NC × MIN(T, 2)) + (MFR2 × NC × MAX(T-2, 0))

// Structuring fee from NC not GC
INP = (NC × (EUP/IUP)) - MgmtFee - (SFR × NC) - AF - (PFR × ((NC × (EUP/IUP)) - NC))
```

### Template 8: SpaceX v2
**Deals**: SpaceX 2
**NC Formula**: `NC = GC × (PMSP/ISP)`

```javascript
// Standard formula with premium built into NC
INP = (NC × (EUP/IUP)) - (MFR × GC × T) - (SFR × GC) - AF - (PFR × ((NC × (EUP/IUP)) - NC))
```

### Template 9: New Heights
**Deals**: New Heights 1, New Heights 2
**NC Formula**: `NC = GC`
**Special**: Zero structuring, management, and premium fees

```javascript
// Simplified - only admin and performance fees
INP = (NC × (EUP/IUP)) - AF - (PFR × ((NC × (EUP/IUP)) - NC))
```

### Template 10: Egypt Growth Vehicle
**Deals**: Egypt Growth Vehicle
**NC Formula**: `NC = GC`

```javascript
// Standard with all fees
INP = (NC × (EUP/IUP)) - (MFR × GC × T) - (SFR × GC) - Premium - AF - (PFR × ((NC × (EUP/IUP)) - NC))
```

## Deal Configuration Matrix

| Deal | NC Formula | MFR | SFR | Premium | Admin | Performance | Special Features |
|------|------------|-----|-----|---------|-------|-------------|------------------|
| **GROQ** | Standard | ✓ | ✓ | - | ✓ | ✓ | Base template |
| **Reddit** | GC | 6% | 0% | ✓ | 0 | 20% | Other Fees (OF) |
| **OpenAI** | Complex | Tiered | 2% | Via NC | 350 | 22.5% | MFR1/MFR2 split |
| **Figure AI** | GC×(1-SFR) | 2% | 8% | ✓ | 450 | 10% | Premium calc |
| **Scout AI** | GC | 2% | 0% | ✓ | 450 | 20% | NC = GC |
| **Impossible Foods** | GC×(PMSP/ISP) | 0% | 10.53% | Built-in | 335 | 10% | Variable unit price |
| **SpaceX 1** | GC/(1+SFR) | Tiered | 6.5% | 4% | 0 | 22.5% | MFR from NC |
| **SpaceX 2** | GC×(PMSP/ISP) | Standard | Standard | Built-in | Standard | Standard | Premium in NC |
| **New Heights** | GC | 0% | 0% | 0% | 450 | 20% | Minimal fees |
| **Egypt Growth** | GC | 0% | 0% | - | 350 | 5% | Standard structure |

## Validation Rules

### 1. Net Capital Consistency
```javascript
function validateNetCapital(deal, transaction) {
  switch(deal.template) {
    case 'STANDARD':
      assert(NC == GC - (SFR * GC) - Premium);
      break;
    case 'REDDIT':
    case 'SCOUT':
    case 'NEW_HEIGHTS':
      assert(NC == GC);
      break;
    case 'OPENAI':
      assert(NC == (GC * (1 - SFR)) * (PMSP/ISP));
      break;
    case 'FIGURE':
      assert(NC == GC * (1 - SFR));
      break;
    case 'IMPOSSIBLE':
    case 'SPACEX2':
      assert(NC == GC * (PMSP/ISP));
      break;
    case 'SPACEX1':
      assert(NC == GC / (1 + SFR));
      break;
  }
}
```

### 2. Fee Application Order
```javascript
const feeOrder = [
  'structuring',  // Applied to GC or NC based on template
  'premium',      // May be built into NC or separate
  'admin',        // Flat fee
  'management',   // Annual, may be tiered
  'performance'   // Only on gains at exit
];
```

### 3. Discount Application
```javascript
function applyDiscount(baseFee, discountRate) {
  // Discounts reduce the fee, not increase it
  return baseFee * (1 - discountRate);
}
```

### 4. Partner Fee Validation
```javascript
function validatePartnerFees(deal) {
  // Partner fees should not exceed 100% when combined with EquiTie fees
  assert((PMFR + MFR) <= 1.0);
  assert((PSFR + SFR) <= 1.0);
  assert((PPFR + PFR) <= 1.0);
}
```

## Edge Cases by Deal Type

### Reddit
- No upfront structuring fee
- Introduces "Other Fees" category
- Premium calculated differently

### OpenAI
- Complex NC formula with premium built in
- Two-tier management fee structure
- Year-based fee changes

### SpaceX 1
- Structuring fee applied to NC, not GC
- Management fee from NC, not GC
- Tiered management structure

### Impossible Foods
- Unit price range (19-21)
- No traditional GC-NC split
- Premium built into NC calculation

### New Heights
- Minimal fee structure
- Only admin and performance fees
- NC = GC (no deductions)

## Implementation Checklist

- [ ] Parse all formula variations
- [ ] Map deals to templates
- [ ] Validate against Master Sheet data
- [ ] Check for missing variables in Supabase
- [ ] Implement tiered fee logic
- [ ] Handle premium calculations (3 methods)
- [ ] Support discount framework
- [ ] Calculate partner splits
- [ ] Generate audit trail

## Schema Linkage and QA
- Templates select and behavior: `deals_clean.formula_template`, `deals_clean.nc_calculation_method`, `deals_clean.premium_calculation_method`, `deals_clean.fee_base_capital`
- Tiering: `management_fee_tier_1_percent`, `management_fee_tier_2_percent`, `tier_1_period`
- Other fees: `transactions_clean.other_fees`, `transactions_clean.other_fees_description`
- Audit trail: `formula_calculation_log` inputs/steps/outputs
- See also: `BRANDING/FORMULA_ENGINE_SCHEMA_MAPPING.md`, `BRANDING/DOCS_QA_CHECKLIST.md`