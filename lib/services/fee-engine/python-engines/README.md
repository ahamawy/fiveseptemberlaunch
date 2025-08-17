# ARCHON/EQUITIE Python Calculation Engines

## Overview
This directory contains Python-based calculation engines for the ARCHON/EQUITIE Fee Engine system. Each deal can have its own custom calculation engine that handles the specific complexity and requirements of that deal's fee structure.

## Architecture

```
python-engines/
├── base/                   # Base classes and types
│   ├── __init__.py
│   ├── base_engine.py     # BaseCalculationEngine class
│   └── types.py           # Type definitions
├── generators/            # Engine generators
│   ├── complexity_analyzer.py  # Analyzes deal complexity
│   └── engine_generator.py     # Generates custom engines
├── engines/               # Generated engines (per deal)
│   ├── deal_28_groq_engine.py  # Groq deal engine
│   └── DEAL_28_GROQ_CONTEXT.md # Agent context
├── templates/             # Engine templates
├── executors/            # Runtime execution
├── validators/           # Validation framework
└── outputs/              # Generated outputs
```

## Setup Instructions

### 1. Install Python Dependencies
```bash
cd lib/services/fee-engine/python-engines
pip install -r requirements.txt
```

### 2. Verify Installation
```bash
python3 -c "from base.base_engine import BaseCalculationEngine; print('✅ Python engines ready')"
```

### 3. Test Groq Engine
```bash
cd engines
python3 deal_28_groq_engine.py
```

## Usage

### From TypeScript (via API)

```typescript
// Analyze deal complexity
const response = await fetch('/api/admin/fees/python-engine', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'analyze',
    dealId: 28,
    dealName: 'Groq AI Investment',
    dealType: 'FACILITATED_DIRECT'
  })
});

// Calculate fees
const calcResponse = await fetch('/api/admin/fees/python-engine', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'calculate',
    dealId: 28,
    data: {
      grossCapital: 100000,
      unitPrice: 1000,
      discounts: [
        { component: 'STRUCTURING_DISCOUNT', percent: 50 }
      ]
    }
  })
});
```

### Direct Python Usage

```python
# Import engine
from engines.deal_28_groq_engine import GroqDealEngine

# Initialize
engine = GroqDealEngine()

# Calculate for single investor
result = engine.calculate_for_investor(
    investor_name="John Doe",
    gross_capital=Decimal('100000'),
    structuring_discount_percent=Decimal('50'),
    admin_discount_percent=Decimal('100')
)

# Print results
print(f"Transfer Amount: ${result.transfer_post_discount:,.2f}")
print(f"Units: {result.units}")
```

## Creating New Engines

### Automatic Generation
```python
from generators.engine_generator import DealEngineGenerator
from base.types import DealConfiguration, DealType, FeeSchedule

# Define deal configuration
config = DealConfiguration(
    deal_id=29,
    deal_name="New Deal",
    deal_type=DealType.PRIMARY,
    fee_schedule=FeeSchedule(...)
)

# Generate engine
generator = DealEngineGenerator()
metadata = generator.generate(config)
```

### Manual Creation
1. Extend `BaseCalculationEngine`
2. Override necessary methods
3. Add deal-specific logic
4. Create tests
5. Generate context documentation

## Key Concepts

### Precedence Ordering
Fees are applied in strict precedence order (lower = earlier):
1. PREMIUM (always precedence 1)
2. STRUCTURING
3. MANAGEMENT
4. ADMIN
5. PERFORMANCE

### Basis Calculations
- **GROSS**: Original investment amount
- **NET**: Gross minus premium
- **NET_AFTER_PREMIUM**: For subsequent calculations
- **FIXED**: Fixed amount regardless of investment

### Discounts
- Stored as NEGATIVE amounts in database
- Applied to specific fee components
- Cannot exceed base fee amount

### Invariants
1. Premium must be first (precedence = 1)
2. Net = Gross - Premium
3. Discounts are negative
4. Units are integers (no fractions)
5. All amounts rounded to 2 decimal places

## Available Engines

### Deal 28 - Groq AI Investment
- **Type**: Valuation-based premium
- **Complexity**: STANDARD
- **Features**: Dynamic premium calculation
- **File**: `engines/deal_28_groq_engine.py`

### Deal 26 - SpaceX Round 2
- **Type**: Partnership structure
- **Complexity**: COMPLEX
- **Status**: Pending implementation

## Testing

### Run All Tests
```bash
pytest -v
```

### Run Specific Engine Tests
```bash
python3 engines/test_deal_28_groq.py
```

### Validate Calculations
```python
from engines.deal_28_groq_engine import GroqDealEngine

engine = GroqDealEngine()
result = engine.calculate(
    gross_capital=Decimal('1453750'),
    unit_price=Decimal('1000')
)

# Expected totals
assert result.net_capital == Decimal('1398892')
assert result.units == 1399
assert result.transfer_post_discount == Decimal('1515000')
```

## AI Agent Integration

Each engine generates context files for AI agents:
- `DEAL_[ID]_CONTEXT.md` - Complete context and examples
- Zero-shot prompts for common operations
- Calculation steps and invariants
- Database integration examples

## Troubleshooting

### Import Errors
```bash
# Add to Python path
export PYTHONPATH="${PYTHONPATH}:$(pwd)"
```

### Decimal Precision
Always use `Decimal` for monetary calculations:
```python
from decimal import Decimal
amount = Decimal('100000')  # Not float(100000)
```

### Rounding Issues
All monetary amounts rounded to 2 decimal places:
```python
rounded = amount.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
```

## Performance Optimization

### Caching
- Fee schedules cached per deal
- Reuse engines for batch processing

### Batch Processing
```python
# Process multiple investors efficiently
results = engine.calculate_batch(investors)
summary = engine.generate_summary_report(results)
```

### Parallel Execution
For large batches, consider using multiprocessing:
```python
from multiprocessing import Pool

with Pool() as pool:
    results = pool.map(engine.calculate_for_investor, investors)
```

## Support

For issues or questions:
1. Check context files in `engines/` directory
2. Review test cases for examples
3. Refer to `ARCHON_FEE_ENGINE_CONTEXT.md`
4. Contact development team

## License
Proprietary - EQUITIE Internal Use Only