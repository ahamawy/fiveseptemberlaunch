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

## Formula System (Database‑Driven)

### Admin UI

- `/admin/formulas` — unified management (templates, assignments, testing)
- `/admin/formula-manager` — visual formula editor

### Core Endpoints

```text
GET  /api/admin/formulas
GET  /api/admin/formulas/[id]
POST /api/admin/formulas
PUT  /api/admin/formulas/[id]
DELETE /api/admin/formulas/[id]
POST /api/admin/formulas/test

GET  /api/deals/[id]/formula          # fetch active assignment
POST /api/deals/[id]/formula          # assign template { formulaTemplateId }
POST /api/deals/[id]/calculate        # perform calculation + audit
GET  /api/deals/[id]/calculate        # fetch calculation history
```

### Assignment Source of Truth

- `public.deal_formula_assignments` is the canonical linkage between deals and formula templates. We do not write to non‑public `core.deals` from the app.

### Supabase Schema Usage

- Use explicit schemas for reads:
  - Deals: `schema('deals').from('deal')`
  - Companies: `schema('companies').from('company')`
- Public tables are accessed via default schema (e.g., `deal_formula_templates`, `deal_formula_assignments`).

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

### Formula System

- `public.deal_formula_templates` — reusable formulas (NC, proceeds, flags)
- `public.deal_formula_assignments` — deal→formula linkage with effective_date
- `public.deal_variable_values` — variables by deal/investor/date
- `public.calculation_audit_log` — audited calculation results

### Analytics

- `investor_analytics` - Per-investor metrics
- `portfolio_analytics` - Platform metrics
- `deal_valuations` - Deal performance

## API Endpoints

```text
GET  /api/deals
POST /api/deals                 # server-only (admin guard)
PUT  /api/deals/[id]            # server-only (admin guard)
DELETE /api/deals/[id]          # server-only (admin guard)
GET  /api/deals/[id]/formula
POST /api/deals/[id]/formula
POST /api/deals/[id]/calculate
GET  /api/deals/[id]/calculate
GET  /api/investors/[id]             # id or public_id
GET  /api/investors/[id]/dashboard
GET  /api/investors/[id]/portfolio
GET  /api/transactions
POST /api/transactions           # server-only (admin guard)
GET  /api/companies
POST /api/companies              # server-only (admin guard)
GET  /api/companies/[id]
PUT  /api/companies/[id]         # server-only (admin guard)
DELETE /api/companies/[id]       # server-only (admin guard)
GET  /api/documents
POST /api/documents              # server-only (admin guard)
POST /api/admin/fees/apply
POST /api/admin/chat
GET  /api/admin/formulas
POST /api/admin/formulas
POST /api/admin/formulas/test
```

## Configuration

```env
NEXT_PUBLIC_SUPABASE_URL=https://ikezqzljrupkzmyytgok.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
NEXT_PUBLIC_USE_MOCK_DATA=false
SUPABASE_SERVICE_ROLE_KEY=your-service-role-jwt     # server-only writes
ADMIN_API_KEY=your-admin-api-key                    # required in prod for write endpoints
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

## Recent Updates (2025-08-22)

### Platform & Tooling

- Upgraded to Next.js 14.2.5; removed deprecated `experimental.appDir` from `next.config.js`
- Node.js 20+ required (see `engines` in `package.json`)
- Standardized Supabase cross-schema queries to use `.schema('<schema>').from('<table>')`
- Ensured all server routes use the service-role client (`lib/db/supabase/server-client.ts`)

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

### Formula System

- Database‑driven templates + assignments
- New admin UI `/admin/formulas` with inline assignment table
- New API: `/api/deals/[id]/formula`, `/api/deals/[id]/calculate`

Important: Admin and formula endpoints require `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`. Missing or invalid keys will surface as "Invalid API key" or permission errors.

### Investors

- GET `/api/investors/[id]` now accepts numeric ID or `public_id` (string)

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
