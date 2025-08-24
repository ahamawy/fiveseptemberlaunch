# EQUITIE Master Context

## Database Schema

### Core Tables

```sql
-- Investors
investors.investor (investor_id, full_name, primary_email, investor_type, kyc_status)

-- Deals
deals.deal (deal_id, deal_name, deal_type, deal_status, underlying_company_id)

-- Companies
companies.company (company_id, company_name, valuation_usd, sector)

-- Transactions
transactions.transaction.primary (transaction_id, investor_id, deal_id, amount_usd, transaction_date)
```

### Fee Tables

```sql
-- Fee Schedule
fees.fee_schedule (
  schedule_id, deal_id, component, rate, is_percent,
  basis [GROSS|NET|NET_AFTER_PREMIUM], precedence, effective_at
)

-- Applied Fees
fees.fee_application (
  id, transaction_id, deal_id, component, amount [negative for discounts],
  percent, applied, notes
)

-- Calculator Profiles
fees.calculator_profile (profile_id, profile_name, config_json)
```

### Analytics Views

```sql
analytics.v_deals           -- Deal summaries with metrics
analytics.v_investors        -- Investor profiles with KYC
analytics.v_positions_units  -- Unit positions
analytics.v_unit_prices      -- Current unit pricing
analytics.v_fee_profiles     -- Fee configurations
```

## ARCHON Fee Engine

### Precedence Algorithm

```typescript
// 1. PREMIUM always first (precedence = 1)
// 2. Apply fees in precedence order
// 3. Calculate basis for each fee

function calculateFees(schedule: FeeSchedule[], gross: number) {
  let net = gross;
  let premium = 0;

  // Sort by precedence
  schedule.sort((a, b) => a.precedence - b.precedence);

  for (const fee of schedule) {
    const basis =
      fee.basis === "GROSS" ? gross : fee.basis === "NET" ? net : net - premium;

    const amount = fee.is_percent ? (basis * fee.rate) / 100 : fee.rate;

    if (fee.component === "PREMIUM") {
      premium = amount;
    }

    net -= amount;
  }

  return { gross, net, premium, transfer: net };
}
```

### Discount Handling

```typescript
// Discounts stored as NEGATIVE amounts
const discounts = [
  { component: "STRUCTURING_DISCOUNT", amount: -500 }, // $500 discount
  { component: "ADMIN_DISCOUNT", amount: -100 }, // $100 discount
];
```

### Partner Fees

```typescript
// Partner fees prefixed with PARTNER_ are excluded from investor analytics
const partnerFees = ["PARTNER_CARRY", "PARTNER_PROMOTE", "PARTNER_SETUP"];
```

## Service Layer

### DealsService

```typescript
import { dealsService } from "@/lib/services";

await dealsService.getDeals({ stage: "active" });
await dealsService.getDealById(dealId);
await dealsService.getDealMetrics(dealId);
await dealsService.getActiveDeals();
```

### InvestorsService

```typescript
import { investorsService } from "@/lib/services";

await investorsService.getDashboardData(investorId);
await investorsService.getPortfolioData(investorId);
await investorsService.getTransactions(investorId);
await investorsService.getCommitments(investorId);
```

### FeeService

```typescript
import { enhancedFeeService } from "@/lib/services/fee-engine/enhanced-service";

// Preview calculation
const calc = await enhancedFeeService.previewFees(
  dealId,
  grossCapital,
  unitPrice,
  { discounts: [{ component: "STRUCTURING_DISCOUNT", percent: 0.5 }] }
);

// Apply to transaction
await enhancedFeeService.applyTransactionFees(transactionId, calc);

// Import CSV
await enhancedFeeService.importFeeSchedule(csvData);
```

## API Endpoints

### Public APIs

```
GET  /api/deals                               # List deals
GET  /api/deals/[dealId]                     # Single deal
GET  /api/investors/[id]/dashboard           # Dashboard metrics
GET  /api/investors/[id]/portfolio           # Portfolio holdings
GET  /api/investors/[id]/transactions        # Transaction history
GET  /api/transactions                       # All transactions
GET  /api/documents                          # Documents list
```

### Admin APIs

```
POST /api/admin/chat                         # AI chat interface
POST /api/admin/fees/apply                   # Apply fees
POST /api/admin/fees/import                  # Import CSV
POST /api/admin/fees/profiles                # Manage profiles
POST /api/admin/ingest/upload                # Upload documents
POST /api/admin/ingest/parse                 # Parse with AI
```

## CSV Import Formats

### Investor List

```csv
Investor Name,Email,Gross Capital,Structuring Discount %,Management Discount %
John Doe,john@example.com,100000,50,0
Jane Smith,jane@example.com,75000,0,100
```

### Fee Schedule

```csv
Component,Rate,Basis,Precedence
PREMIUM,3.77358,GROSS,1
STRUCTURING,4.0,GROSS,2
MANAGEMENT,2.0,GROSS,3
ADMIN,450,FIXED,4
```

### Transactions

```csv
Transaction ID,Investor,Deal,Amount,Date,Type
1,John Doe,GRQAI,100000,2025-07-01,commitment
2,Jane Smith,GRQAI,75000,2025-07-01,commitment
```

## Chat Commands

### Fee Calculations

```
"Calculate fees for deal 1 with $1M investment"
"Apply 50% structuring discount"
"Show fee schedule for deal 1"
"Generate fee report"
"Validate fee configuration"
```

### Data Import

```
"Import investor CSV" → Upload file
"Parse this document" → Upload PDF/Excel
"Extract fee schedule" → From uploaded doc
"Apply fees to all transactions"
```

### Database Operations

```
"Create fee profile for deal X"
"List all active deals"
"Show investor 123 portfolio"
"Get transaction history"
```

## Configuration

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://ikezqzljrupkzmyytgok.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_KEY=eyJhbGci...
SUPABASE_DB_URL=postgresql://postgres:password@db.<ref>.supabase.co:5432/postgres  # Drizzle introspect

# Data Mode
NEXT_PUBLIC_USE_MOCK_DATA=false
NEXT_PUBLIC_ENABLE_SUPABASE=true

# AI
OPENROUTER_API_KEY=sk-or-v1...
```

### Config Module

```typescript
import { config } from "@/lib/config";

config.getDataMode(); // 'mock' | 'supabase' | 'mcp'
config.hasSupabase(); // boolean
config.getDiagnostics(); // full status
```

## Database Sync Policy

- Use Drizzle Kit to introspect types from Supabase using `SUPABASE_DB_URL`:
  ```bash
  npm run db:drizzle:introspect
  ```
- Keep schema changes in SQL migrations under `DB/migrations/`.
- Runtime DB access remains via Supabase client (RLS); use Drizzle’s node-postgres client only for admin/server scripts.

## MCP Execution via Docker

- All MCP-related tooling must run in Docker for reproducible, modular execution. Example:

```bash
docker run --rm \
  --env-file ./.env.local \
  -v "$PWD":/workspace \
  -w /workspace \
  your-mcp-image:latest
```

## Brand Tokens

### Colors

```typescript
const colors = {
  primary: "#C898FF", // Equitie Purple
  background: "#040210", // Deep background
  surface: "#0A0515", // Card surface
  text: "#FFFFFF", // Primary text
  muted: "#8B87A0", // Secondary text
};
```

### Components

```typescript
import { BRAND_CONFIG, COMPONENT_STYLES } from "@/BRANDING/brand.config";

const card = COMPONENT_STYLES.card.gradient; // Gradient card
const glass = COMPONENT_STYLES.card.glass; // Glass morphism
const button = COMPONENT_STYLES.button.primary; // Primary button
```

### Utilities

```typescript
import {
  formatCurrency,
  formatPercentage,
  getStatusColor,
} from "@/lib/theme-utils";

formatCurrency(1000000); // "$1,000,000"
formatPercentage(0.152); // "15.2%"
getStatusColor(5.2); // Success color for positive
```

## File Structure

```
/app
  /api                 # API routes
  /admin              # Admin pages
  /investor-portal    # Investor pages
/lib
  /services           # Service layer
  /db                 # Database adapters
  /services/fee-engine # ARCHON engine
/components/ui        # UI components
/BRANDING            # Brand configuration
/ultrathink          # Feature context
/DOCS                # Documentation
```

## Testing

### Playwright Tests

```bash
npx playwright test                    # All tests
npx playwright test investor-portal    # Portal only
npx playwright test fee-engine        # Fees only
npx playwright test --ui              # Interactive
```

### Test Patterns

```typescript
// Portal test
test("dashboard loads metrics", async ({ page }) => {
  await page.goto("/investor-portal/dashboard");
  await expect(page.locator('[data-testid="total-value"]')).toBeVisible();
});

// API test
test("fee calculation", async () => {
  const calc = await enhancedFeeService.previewFees(1, 100000, 1000);
  expect(calc.netAmount).toBeLessThan(100000);
});
```

## Quick Commands

```bash
npm run dev           # Start dev (port 3000)
npm run build        # Production build
npm run test         # Run all tests
npm run lint         # Check code quality
```

## Supabase Project

- **ID**: ikezqzljrupkzmyytgok
- **Name**: EquiTieOSH
- **URL**: https://ikezqzljrupkzmyytgok.supabase.co
- **Region**: us-east-1

## Key Patterns

### Service Layer

Always use services, never direct DB access:

```typescript
// ✅ Good
const deals = await dealsService.getActiveDeals();

// ❌ Bad
const deals = await supabase.from("deals").select();
```

### Error Handling

```typescript
try {
  const result = await service.method();
  return { success: true, data: result };
} catch (error) {
  return { success: false, error: error.message };
}
```

### Type Safety

```typescript
import type { Deal, Investor, Transaction } from "@/lib/db/types";

function processDeal(deal: Deal): void {
  // Type-safe operations
}
```

## Recent Updates

### 2025-08-17

- AI ingestion with full context loading
- Column mapper for CSV intelligence
- Enhanced fee service with GPT-5
- Documentation consolidation

### 2025-08-16

- ARCHON Fee Engine integration
- Admin chat interface
- Fee profile management
- CSV import system

### 2025-08-15

- Supabase migration complete
- Service layer implementation
- Mock/production switching
- Test suite passing
