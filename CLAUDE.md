# CLAUDE.md - Complete System Documentation

## 🎯 SYSTEM PURPOSE

EquiTie Investment Platform - A comprehensive system for:
1. **Tokenizing legacy deals** - Converting traditional investments into digital tokens
2. **Exit scenario modeling** - Simulating returns at different exit multiples
3. **Portfolio statements** - Generating accurate investor reports  
4. **AUM & fee tracking** - Monitoring company metrics and revenue

## 🚀 QUICK START

```bash
# Start development server
npm run dev                    # Runs on http://localhost:3001

# Verify system health
node SCRIPTS/health-check.js   # Check all endpoints

# Run tests
npm run test:e2e              # Playwright tests
```

## 🗄️ DATABASE ARCHITECTURE

### ⚠️ CRITICAL: Understanding Complex Relationships

**The system supports MANY-TO-MANY relationships between deals and companies:**
- **One company** can be invested in through **multiple deals** (e.g., SpaceX, Dastgyr)
- **One deal** can invest in **multiple companies** (e.g., New Heights has 40+, Egypt Vehicle has 4)
- **Share prices** track COMPANY valuations
- **Token prices** track DEAL valuations
- Company valuations cascade automatically to token NAV via triggers
- **NET CAPITAL IS THE ACTUAL INVESTED AMOUNT** - not calculated for legacy deals

### Schema Organization (Modular & Scalable)

```
core/           # Master data (companies, investors, deals, users)
transactions/   # Transaction processing & fee applications
portfolio/      # Token positions & valuations
formulas/       # Fee calculation engine
analytics/      # Aggregated metrics & KPIs
projections/    # Exit scenarios & modeling
documents/      # Document management
audit/          # Compliance & audit trail
```

### Primary Tables

#### Core Schema
- `core.companies` - Portfolio, partner, holding companies
- `core.investors` - Investor profiles & KYC
- `core.deals` - Deal configurations & formula mappings
- `core.users` - Platform users & permissions

#### Transactions Schema  
- `transactions.transactions` - All transaction types
- `transactions.fee_applications` - Fee calculations
- `transactions.payment_records` - Payment tracking

#### Portfolio Schema (Enhanced for Many-to-Many)
- `portfolio.deal_tokens` - Token configurations with NAV
- `portfolio.investor_token_positions` - Current holdings
- `portfolio.company_valuations` - Company share price history
- `portfolio.deal_company_positions` - Many-to-many deal/company positions
- `portfolio.nav_history` - NAV calculation audit trail
- `portfolio.position_snapshots` - Daily snapshots

### Key Relationships (Post-Migration)
```sql
-- Many-to-Many Relationships (FIXED)
portfolio.deal_company_positions → public.deals_clean (N:1)
portfolio.deal_company_positions → public.companies_clean (N:1)

-- Token NAV Calculation Flow (WITH CASCADE)
portfolio.company_valuations → [TRIGGER] → portfolio.deal_company_positions → portfolio.deal_tokens

-- Net Capital Entry Points
public.transactions_clean.net_capital_actual → Single source for legacy deals
portfolio.deal_company_positions.net_capital_invested → Position-level NC

-- Traditional Relationships
public.deals_clean → portfolio.deal_tokens (1:1)
public.investors_clean → portfolio.investor_token_positions (1:N)
portfolio.deal_tokens → portfolio.investor_token_positions (1:N)
```

## 🔧 CONFIGURATION

### Environment Variables (.env.local)
```env
# Supabase (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://ikezqzljrupkzmyytgok.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from dashboard>
SUPABASE_SERVICE_ROLE_KEY=<from dashboard>

# App Config
NODE_ENV=development
PORT=3001
```

### Supabase Project
- **Project ID**: `ikezqzljrupkzmyytgok`
- **URL**: `https://ikezqzljrupkzmyytgok.supabase.co`
- **Region**: US East
- **Status**: PRODUCTION

## 📦 KEY SERVICES

### Valuation Management (NEW)
```typescript
// Update company valuations and cascade to deals
import { valuationService } from '@/lib/services/valuation.service';

// Update a company's share price
await valuationService.updateCompanyValuation({
  companyId: 1,
  sharePrice: 1500,
  valuationDate: new Date(),
  valuationMethod: 'market'
});

// Get deal portfolio with all company positions
const portfolio = await valuationService.getDealPortfolio(dealId);

// Add new company position to deal
await valuationService.addDealPosition(
  dealId, companyId, shares, pricePerShare
);
```

### Portfolio Management
```typescript
// Exit Scenario Modeling (now handles multiple companies)
import { exitScenarioService } from '@/lib/services/exit-scenario.service';
const scenario = await exitScenarioService.modelExitScenario({
  dealId: 1,
  exitMultiple: 3,
  exitYear: 5
});
// Returns companyExitValues[] with breakdown per company

// Portfolio Statements
import { portfolioStatementService } from '@/lib/services/portfolio-statement.service';
const statement = await portfolioStatementService.generateStatement(investorId);

// Company Analytics
import { companyAnalyticsService } from '@/lib/services/company-analytics.service';
const aum = await companyAnalyticsService.calculateAUM();
const fees = await companyAnalyticsService.calculateFeeRevenue();
```

### Formula Engine
```typescript
// Formula validation & calculation
import { formulaValidation } from '@/lib/services/formula-validation.service';
const results = await formulaValidation.validateAllTransactions();
```

## 🏗️ PROJECT STRUCTURE

```
/app
  /api              # API routes
    /admin          # Admin endpoints
    /deals          # Deal CRUD
    /investors      # Investor operations
    /portfolio      # Portfolio endpoints
  /admin            # Admin UI
  /investor-portal  # Investor UI

/lib
  /services         # Business logic
    exit-scenario.service.ts
    portfolio-statement.service.ts
    company-analytics.service.ts
    formula-validation.service.ts
  /db              # Database layer
    /supabase      # Supabase client
    /schema-manager # Schema config

/components        # React components
/migrations        # Database migrations
/docs             # Documentation
```

## 🔐 Supabase Access Pattern (Updated)

- Server-side only: use `lib/db/supabase/server-client.ts` (service-role key)
- Portfolio data is accessed via explicit schema scoping: `(client as any).schema('portfolio')`
- Do NOT create public shadow views or updatable rules for `portfolio.*`
- Join data across schemas using batched `IN (...)` queries and in-memory maps to avoid N+1
- Public tables like `companies_clean`, `deals_clean`, `investors_clean` are queried from `public`

Example (server-side):

```ts
const supabase = getServiceClient();
const p = (supabase as any).schema('portfolio');

// Positions from portfolio schema
const { data: positions } = await p
  .from('deal_company_positions')
  .select('deal_id, company_id, shares_owned, cost_basis')
  .eq('deal_id', dealId);

// Batch company names from public
const companyIds = [...new Set((positions || []).map(p => p.company_id))];
const { data: companies } = await supabase
  .from('companies_clean')
  .select('company_id, company_name')
  .in('company_id', companyIds);
```

## 🔍 MCP TOOLS (SUPABASE DIRECT ACCESS)

```typescript
// List tables in schema
mcp__supabase__list_tables({ 
  project_id: "ikezqzljrupkzmyytgok",
  schemas: ["portfolio", "analytics"] 
})

// Execute SQL
mcp__supabase__execute_sql({ 
  project_id: "ikezqzljrupkzmyytgok",
  query: "SELECT * FROM portfolio.investor_portfolio_summary"
})

// Apply migration
mcp__supabase__apply_migration({
  project_id: "ikezqzljrupkzmyytgok",
  name: "update_token_nav",
  query: "SELECT portfolio.update_token_nav();"
})
```

## 📊 FORMULA ENGINE

### Deal Formula Templates
- `standard` - Simple GC - fees = NC
- `impossible` - NC = GC × (PMSP/ISP)
- `reddit` - Includes other fees
- `spacex1` - NC = GC / (1 + SFR)
- `openai` - Tiered management fees

### Fee Calculations
```sql
-- Update all token NAVs
SELECT portfolio.update_token_nav();

-- Refresh investor positions  
SELECT portfolio.update_investor_positions();

-- Calculate investor MOIC
SELECT portfolio.calculate_investor_moic(investor_id, deal_id);

-- Calculate IRR
SELECT portfolio.calculate_irr(initial, final, years);
```

## 🌐 API ENDPOINTS

### Valuation APIs (NEW)
```bash
# Update company valuation
POST /api/valuations/company
{
  "companyId": 1,
  "sharePrice": 1500,
  "valuationMethod": "market",
  "valuationSource": "quarterly_mark"
}

# Get company valuation history
GET /api/valuations/company?companyId=1

# Get deal portfolio breakdown
GET /api/valuations/deal?dealId=1

# Calculate deal NAV
POST /api/valuations/deal
{ "dealId": 1 }

# Add company position to deal
POST /api/valuations/positions
{
  "dealId": 1,
  "companyId": 2,
  "shares": 100000,
  "pricePerShare": 1000
}

# Batch update valuations
POST /api/valuations/batch
{
  "valuations": [
    { "companyId": 1, "sharePrice": 1500 },
    { "companyId": 2, "sharePrice": 2000 }
  ]
}
```

### Portfolio Exit Scenarios (NEW)
```bash
# Model exit scenario for a deal (multi-company portfolios supported)
POST /api/portfolio/exit-scenarios
{
  "dealId": 1,
  "exitMultiple": 3,
  "exitYear": 5
}

# List scenarios for a deal
GET /api/portfolio/exit-scenarios?dealId=1
```

## 🆕 NEW FUNCTIONS & ENTRY POINTS (Post-Migration)

### Net Capital Entry Points
```sql
-- Record NC at transaction level (for legacy deals)
SELECT public.record_transaction_net_capital(
  p_transaction_id => 123,
  p_net_capital => 100000,
  p_is_legacy => true,
  p_notes => 'Legacy deal - NC provided'
);

-- Record NC at position level (many-to-many)
SELECT portfolio.record_net_capital_investment(
  p_deal_id => 1,
  p_company_id => 5,
  p_net_capital => 500000,
  p_shares => 1000,
  p_is_legacy => true
);
```

### NAV Management
```sql
-- Manually trigger NAV update for a deal
SELECT portfolio.update_token_nav(deal_id => 1);

-- Check NAV health across all deals
SELECT * FROM portfolio.check_nav_health();

-- Batch update company valuations (triggers cascade)
SELECT * FROM portfolio.batch_update_valuations('[
  {"company_id": 1, "share_price": 1500},
  {"company_id": 2, "share_price": 2000}
]'::jsonb);
```

### Many-to-Many Helpers
```sql
-- Get all companies for a deal
SELECT * FROM portfolio.get_deal_companies(1);

-- Get all deals for a company
SELECT * FROM portfolio.get_company_deals(5);

-- View complete portfolio composition
SELECT * FROM portfolio.deal_portfolio_composition;
```

## ✅ CURRENT STATUS (2025-01-28)

### What's Working
- ✅ Many-to-many company/deal relationships established
- ✅ Company valuation tracking system deployed
- ✅ Token NAV calculation with portfolio weighting
- ✅ Exit scenario modeling with multi-company support
- ✅ Valuation service with cascade updates
- ✅ API endpoints for all valuation operations
- ✅ Portfolio & analytics schemas established
- ✅ Company analytics service complete

### Next Steps
1. Update Portfolio Statement Service for new structure
2. Test with real data
3. Build admin UI for valuation management
4. Generate first investor statements
5. Deploy AUM dashboard with accurate NAV

## 🚨 CRITICAL RULES

1. **Supabase is the ONLY source of truth** - No mock data
2. **Legacy deal net capital is INPUT, not calculated** - Use `net_capital_actual` field
3. **Formula engine is for PROJECTIONS, not history**
4. **Use explicit schema scoping** for `portfolio.*` on server `(client as any).schema('portfolio')`
5. **All queries through Supabase client** - Clean tables are authoritative
6. **Many-to-many is CORE** - Deals have multiple companies, companies have multiple deals
7. **NAV cascades automatically** - Company valuation changes trigger NAV updates
8. **Test all calculations against FEE_CALCULATION_BIBLE.md**

## 🔧 COMMON TASKS

### Generate Exit Scenarios
```typescript
const scenarios = await exitScenarioService.generateStandardScenarios(dealId);
// Creates 2x, 3x, 5x, 10x scenarios
```

### Create Investor Statement
```typescript
const statement = await portfolioStatementService.generateStatement(
  investorId,
  new Date()
);
```

### Calculate Company AUM
```typescript
const metrics = await companyAnalyticsService.calculateAUM();
console.log(`Total AUM: $${metrics.totalAUM}`);
```

### Update Token Valuations
```sql
-- Run via MCP tool
SELECT portfolio.update_token_nav();
SELECT portfolio.refresh_portfolio_summary();
```

## 🐛 DEBUGGING

### Health Check Failed?
1. Check `.env.local` has all keys
2. Verify Supabase project is running
3. Check Docker containers: `docker ps`

### MCP Tools Not Working?
- Use direct SQL via Supabase dashboard
- Check MCP bridge service: `lsof -i:3100`

### Formula Calculations Wrong?
1. Check formula template mapping
2. Verify input variables (pmsp, isp, sfr)
3. Review calculation log table

## 📚 REFERENCES

- **Schema Architecture**: `/docs/SCHEMA_ARCHITECTURE.md`
- **Fee Calculations**: `/EQUITIELOGIC/FEE_CALCULATION_BIBLE.md`
- **Migration Files**: `/migrations/`
- **Test Data**: `/SCRIPTS/test-data.sql`

---
*Last Updated: 2025-08-28*
*Version: 2.0.0 - Portfolio Management System*