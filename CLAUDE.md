# Claude Code Project Context

## Project Overview

Equitie investment portal - Next.js web dashboard with ARCHON Fee Engine for complex fee calculations.

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **UI**: React + TypeScript + Tailwind CSS
- **Database**: Supabase (40+ tables)
- **AI**: OpenRouter GPT-5 integration
- **Testing**: Playwright + Vitest

## ⚠️ CRITICAL: NO EMOJIS

- **NEVER** use emoji characters anywhere in code or UI
- **ALWAYS** use SVG icons from Heroicons or Lucide React
- Icons must be monochrome using `currentColor`
- Icon sizes: `w-4 h-4` (small), `w-5 h-5` (medium), `w-6 h-6` (large)

## Branding System

```typescript
import { BRAND_CONFIG, COMPONENT_STYLES } from "@/BRANDING/brand.config";
import { formatCurrency, getGlassStyles } from "@/lib/theme-utils";

// Primary: #C898FF | Background: #040210
const primaryColor = BRAND_CONFIG.colors.primary.hero;
const cardStyle = COMPONENT_STYLES.card.gradient;
```

## Service Layer Pattern

```typescript
import { dealsService, investorsService } from "@/lib/services";

// In components or API routes
const deals = await dealsService.getActiveDeals();
const dashboard = await investorsService.getDashboardData();
```

## ARCHON Fee Engine

### Core Components

- **Calculator**: `lib/services/fee-engine/enhanced-calculator.ts`
- **Service**: `lib/services/fee-engine/enhanced-service.ts`

### Fee Rules

1. **Precedence**: PREMIUM (1) → others by order
2. **Basis**: GROSS | NET | NET_AFTER_PREMIUM
3. **Discounts**: Stored as negative amounts
4. **Partner Fees**: Prefixed with `PARTNER_`

### Usage

```typescript
import { enhancedFeeService } from "@/lib/services/fee-engine/enhanced-service";

const calculation = await enhancedFeeService.previewFees(
  dealId,
  grossCapital,
  unitPrice,
  { discounts: [{ component: "STRUCTURING_DISCOUNT", percent: 0.5 }] }
);
```

### Chat Commands

- `"Calculate fees for deal X with $Y"`
- `"Import CSV"` → Upload to /admin/chat
- `"Apply fees"` → Save to database

## Database Schema (Key Tables)

### Core

- `investors.investor` - Investor profiles
- `deals.deal` - Investment opportunities
- `companies.company` - Company profiles
- `transactions.transaction.primary` - Investments

### Fees

- `fees.fee_schedule` - Fee configurations
- `fees.fee_application` - Applied fees
- `fees.calculator_profile` - Calculation profiles

### Analytics

- `investor_analytics` - Per-investor metrics
- `portfolio_analytics` - Platform metrics
- `deal_valuations` - Deal performance

## API Endpoints

```
GET  /api/deals
GET  /api/investors/[id]/dashboard
GET  /api/investors/[id]/portfolio
GET  /api/transactions
POST /api/admin/fees/apply
POST /api/admin/chat
```

## Configuration

```env
NEXT_PUBLIC_SUPABASE_URL=https://ikezqzljrupkzmyytgok.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
NEXT_PUBLIC_USE_MOCK_DATA=false
OPENROUTER_API_KEY=your-key
```

## Quick Commands

```bash
npm run dev              # Start dev server
npx playwright test      # Run tests
npm run build           # Production build
```

## File Structure (high-level)

```
/app                    # Pages and API routes
/lib/services           # Service layer
/lib/db                 # Database adapters
/components/ui          # UI components
/BRANDING               # Brand tokens & tokens/
/FEATURES               # Canonical per-feature docs (READMEs & docs/)
```

## Recent Updates (2025-08-17)

### AI Ingestion System

- Full context aggregator with EQUITIE docs
- Column mapper for CSV heuristics
- AI agent service with GPT-5 integration
- CSV format documentation

### ARCHON Integration

- Enhanced calculator with precedence
- Fee schedule management
- CSV import with validation
- Partner fee exclusion

### Admin Chat

- `/admin/chat` - Unified interface
- Document processing (PDF/CSV)
- Real-time fee calculations
- Supabase operations

## Testing

```bash
npx playwright test investor-portal.spec.ts   # Portal tests
npx playwright test fee-engine.spec.ts        # Fee tests
npx playwright test --ui                      # Interactive
```

## Feature Implementation

1. Find feature in `FEATURES/FEATURE_TREE.md`
2. Use service layer pattern
3. Apply brand tokens
4. Test with Playwright

## Governance

- Canonical docs per feature live in `FEATURES/<feature>/README.md`
- Supporting docs (ARCHON, bot context) defer to canonical feature pages

## Environment Tips

- Keep `.env.local` minimal and mirror `./.env.example`
