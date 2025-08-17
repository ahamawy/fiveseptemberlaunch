# ARCHON/EQUITIE Python Calculation Engine Integration

## ✅ Complete Integration Overview

The ARCHON/EQUITIE Fee Engine now includes a comprehensive Python-based calculation engine system that generates deal-specific engines based on complexity. This enables handling various deal types with custom logic while maintaining consistency and auditability.

## 🏗️ Architecture

### Three-Layer System

1. **TypeScript Layer** (Frontend/API)
   - UI components for fee management
   - API endpoints for engine operations
   - Database persistence via Supabase

2. **Python Engine Layer** (Calculation Logic)
   - Base calculation engine with invariants
   - Deal complexity analyzer
   - Custom engine generator
   - Deal-specific implementations

3. **AI Agent Layer** (Context & Automation)
   - Context documents per deal
   - Zero-shot prompts
   - Calculation instructions

## 📁 File Structure

```
lib/services/fee-engine/
├── python-engines/
│   ├── base/
│   │   ├── __init__.py              # Module exports
│   │   ├── base_engine.py           # Core calculation logic
│   │   └── types.py                 # Type definitions
│   ├── generators/
│   │   ├── complexity_analyzer.py   # Analyzes deal complexity
│   │   └── engine_generator.py      # Generates custom engines
│   ├── engines/
│   │   ├── deal_28_groq_engine.py   # Groq deal implementation
│   │   └── DEAL_28_GROQ_CONTEXT.md  # AI agent context
│   ├── requirements.txt             # Python dependencies
│   └── README.md                    # Documentation
├── enhanced-calculator.ts           # TypeScript calculator
└── enhanced-service.ts              # Service layer
```

## 🚀 Key Features Implemented

### 1. Base Calculation Engine
- **Deterministic calculations** with precedence ordering
- **Invariant validation** ensuring data integrity
- **Audit trail** for every calculation step
- **Discount handling** as negative amounts
- **Basis calculations** (GROSS, NET, NET_AFTER_PREMIUM)

### 2. Deal Complexity Analyzer
- **Automatic classification** of deal complexity
- **Feature detection** (premium, performance, waterfalls)
- **Engine recommendation** based on complexity
- **Optimization hints** for performance

### 3. Engine Generator
- **Automatic code generation** for new deals
- **Test generation** with comprehensive coverage
- **Context generation** for AI agents
- **Template-based** with customization

### 4. Groq Deal Engine (Example)
- **Valuation-based premium** calculation
- **Standard fee structure** with discounts
- **Batch processing** for multiple investors
- **Summary reporting** with totals

### 5. Python-TypeScript Bridge
- **REST API endpoint** at `/api/admin/fees/python-engine`
- **Actions**: analyze, generate, calculate, validate, test
- **Child process execution** with error handling
- **JSON serialization** for data exchange

## 💡 Usage Examples

### TypeScript Integration
```typescript
// Calculate fees using Python engine
const response = await fetch('/api/admin/fees/python-engine', {
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

const result = await response.json();
console.log(`Transfer: $${result.result.transfer_post_discount}`);
```

### Direct Python Usage
```python
from engines.deal_28_groq_engine import GroqDealEngine
from decimal import Decimal

engine = GroqDealEngine()
result = engine.calculate_for_investor(
    investor_name="John Doe",
    gross_capital=Decimal('100000'),
    structuring_discount_percent=Decimal('50')
)

print(f"Transfer: ${result.transfer_post_discount:,.2f}")
print(f"Units: {result.units}")
```

### AI Agent Prompts
```
"Calculate Groq deal fees for $100,000 with 50% structuring discount"
"Generate Python engine for deal 29 with performance fees"
"Analyze complexity of SpaceX partnership deal"
"Validate fee calculations match expected totals"
```

## 🔄 Workflow

### Creating a New Deal Engine

1. **Define Deal Configuration**
   ```python
   config = DealConfiguration(
       deal_id=29,
       deal_name="New Deal",
       deal_type=DealType.PRIMARY,
       fee_schedule=schedule
   )
   ```

2. **Analyze Complexity**
   ```python
   analyzer = DealComplexityAnalyzer()
   analysis = analyzer.analyze(config)
   ```

3. **Generate Engine**
   ```python
   generator = DealEngineGenerator()
   metadata = generator.generate(config)
   ```

4. **Test Engine**
   ```bash
   python3 engines/test_deal_29.py
   ```

5. **Use in Production**
   ```typescript
   const result = await calculateFees(29, grossCapital);
   ```

## 🎯 Benefits

### For Development
- **Modular architecture** - Easy to extend and maintain
- **Type safety** - Full typing in both Python and TypeScript
- **Testable** - Comprehensive test coverage
- **Documented** - Context files for every engine

### For Business
- **Per-deal customization** - Handle any complexity
- **Audit trail** - Complete calculation history
- **Performance** - Optimized for each deal type
- **Scalability** - Batch processing capabilities

### For AI Agents
- **Clear context** - Detailed documentation per deal
- **Zero-shot prompts** - Ready-to-use commands
- **Invariant checking** - Automatic validation
- **Step-by-step logic** - Understandable flow

## 📊 Deal Complexity Levels

1. **SIMPLE** - Basic fees, no special logic
2. **STANDARD** - Standard fees with discounts (e.g., Groq)
3. **COMPLEX** - Multi-tier, waterfalls (e.g., SpaceX)
4. **ADVANCED** - Hurdles, catch-up, carry
5. **CUSTOM** - Requires custom engine

## 🔍 Validation & Testing

### Invariants Checked
- ✅ Precedence order respected
- ✅ Premium calculated first
- ✅ Net = Gross - Premium
- ✅ Discounts stored as negative
- ✅ Transfer amounts reconcile
- ✅ Units are integers
- ✅ Amounts rounded to 2 decimals

### Test Coverage
- Unit tests for base engine
- Integration tests for generators
- Deal-specific tests for each engine
- Validation against historical data

## 🚧 Future Enhancements

### Planned Features
1. **Performance fee waterfalls** with hurdle rates
2. **Multi-currency support** with FX handling
3. **Time-based crystallization** (quarterly, annual)
4. **Partner fee splits** with exclusions
5. **Real-time calculation API** with caching
6. **Excel import/export** for batch processing
7. **GraphQL API** for flexible queries
8. **Machine learning** for fee optimization

### Next Deals to Implement
- Deal 26: SpaceX (Partnership structure)
- Deal 27: Dagenham FC (Takeover)
- Deal 29+: Future deals as needed

## 📝 Documentation

### Key Files
- `ARCHON_FEE_ENGINE_CONTEXT.md` - Complete system context
- `LEGACY_DEAL_ENGINE_DOCS.md` - Legacy system reference
- `python-engines/README.md` - Python engine documentation
- `engines/DEAL_*_CONTEXT.md` - Per-deal context files

### For Developers
- Follow precedence ordering strictly
- Always use Decimal for calculations
- Store discounts as negative amounts
- Validate invariants after calculation
- Generate context for AI agents

## ✨ Summary

The Python calculation engine integration provides EQUITIE with a powerful, flexible, and maintainable system for handling complex fee calculations. Each deal gets its own optimized engine while maintaining consistency through the base engine framework. The system is ready for production use and can easily scale to handle new deal types and complexities.

**Status**: ✅ FULLY OPERATIONAL
**Deals Implemented**: Groq (28)
**API Endpoint**: `/api/admin/fees/python-engine`
**Python Version**: 3.8+
**TypeScript Integration**: Complete