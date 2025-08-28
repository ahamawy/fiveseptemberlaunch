# CLAUDE.md - Your Guide to This Codebase

## Quick Start

```bash
npm run dev                    # Start app on http://localhost:3001
node SCRIPTS/health-check.js   # Verify all endpoints work
npm run test:e2e               # Run Playwright tests (uses port 3001)
```

**Note:** Default port changed from 3000 to 3001 to avoid Docker conflicts.

## 🚨 STOP! READ THIS FIRST - WHAT'S ALREADY DONE

### ✅ Schema Migration - COMPLETE (2025-08-28)
All formula engine fields are ALREADY in production Supabase:
- `deals_clean` has: nc_calculation_method, formula_template, fee_base_capital, premium_calculation_method, management_fee_tier_1/2_percent, tier_1_period, other_fees_allowed, discount fields
- `transactions_clean` has: other_fees, other_fees_description, all discount fields
- `formula_templates` table exists with 10 templates
- `formula_calculation_log` table exists for audit trail

### ✅ Formula Templates - POPULATED
All deals now have formula_template mapped based on deal name matching

### ✅ MCP Tools - CONFIGURED
Use the MCP tools directly (they work!):
- `mcp__supabase__list_tables` - Check schema
- `mcp__supabase__execute_sql` - Run queries  
- `mcp__supabase__apply_migration` - Apply DDL changes

## 🎯 SUPABASE: THE SINGLE SOURCE OF TRUTH

**CRITICAL**: Supabase is the ONLY authoritative data source. All data operations MUST go through Supabase.

### Primary Configuration
**Project ID**: `ikezqzljrupkzmyytgok`  
**URL**: `https://ikezqzljrupkzmyytgok.supabase.co`  
**Status**: PRODUCTION - PRIMARY DATA SOURCE  
**Mock Data**: DISABLED - Never use mock data in production

### Required Environment Variables (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=https://ikezqzljrupkzmyytgok.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<get from Supabase dashboard>
SUPABASE_SERVICE_ROLE_KEY=<get from Supabase dashboard>
```

## MCP Tools Available

You have access to Supabase MCP tools. Use them like this:

```typescript
// List all tables
mcp__supabase__list_tables({ project_id: "ikezqzljrupkzmyytgok" })

// Execute SQL
mcp__supabase__execute_sql({ 
  project_id: "ikezqzljrupkzmyytgok",
  query: "SELECT * FROM investors_clean LIMIT 5"
})

// Get logs for debugging
mcp__supabase__get_logs({
  project_id: "ikezqzljrupkzmyytgok", 
  service: "api"
})
```

## Database Structure (Supabase Production Schema)

### SUPABASE TABLES - THE ONLY SOURCE OF TRUTH
- `transactions_clean` - ALL transactions (primary, secondary, advisory, subnominee)
- `deals_clean` - ALL deals with formula templates
- `companies_clean` - ALL companies
- `investors_clean` - ALL investors
- `documents` - Document storage
- `investor_units` - Investor commitments/units
- `formula_templates` - Deal-specific calculation templates
- `formula_calculation_log` - Audit trail for all calculations

### Important: Column Name Changes
Clean tables use specific primary key names:
- `investor_id` (not `id`)
- `deal_id` (not `id`) 
- `company_id` (not `id`)
- `transaction_id` (not `id`)

### New Formula Engine Fields (Added 2024-11-26)
**deals_clean**:
- `nc_calculation_method` - How Net Capital is calculated (enum)
- `formula_template` - Links to formula template (varchar)
- `fee_base_capital` - 'GC' or 'NC' for fee calculations
- `premium_calculation_method` - How premium is calculated (enum)
- `management_fee_tier_1_percent` - First tier management fee
- `management_fee_tier_2_percent` - Second tier management fee
- `tier_1_period` - Years for first tier
- `other_fees_allowed` - Boolean for Reddit-style deals
- `discount_partner_*_fee_percent` - Partner fee discounts

**transactions_clean**:
- `other_fees` - Additional fees (Reddit-specific)
- `other_fees_description` - Description of other fees

### Backward Compatibility (Views)
The old dot-notation names still work as views:
- `investors.investor` → Points to `investors_clean`
- `deals.deal` → Points to `deals_clean`
- `companies.company` → Points to `companies_clean`
- `transactions.transaction.primary` → Points to `transactions_clean` (primary type only)

### How to Query - ALWAYS USE SUPABASE
```typescript
// MANDATORY: All queries MUST go through Supabase
import { getServiceClient } from "@/lib/db/supabase/server-client";
const sb = getServiceClient();
const { data } = await sb.from("deals_clean").select("*");

// For transactions, filter by type if needed:
const { data } = await sb.from("transactions_clean")
  .select("*")
  .eq("transaction_type", "primary");

// LEGACY: Old names still work via views
const { data } = await sb.from("deals.deal").select("*"); // Works but uses view
```

## Project Structure

```
/app                  # Next.js pages and API routes
  /api               # API endpoints
  /admin             # Admin portal pages  
  /investor-portal   # Investor portal pages

/lib
  /services          # Business logic services
  /db                # Database adapters and types
  
/components          # React components

/SCRIPTS            # Utility scripts (health check, etc)
```

## Key Services

- `dealsService` - Deal operations
- `investorsService` - Investor data
- `transactionsService` - Transaction handling
- `documentsService` - Document management
- `feesService` - Fee calculations

## Testing & Health

```bash
# Check if everything works
node SCRIPTS/health-check.js

# Run tests
npm test
npm run test:e2e

# Test formula engine
open http://localhost:3001/admin/formula-validation
```

## Formula Templates

Deals now use formula templates for fee calculations:
- `standard` - Default template
- `impossible` - NC = GC × (PMSP/ISP)
- `reddit` - NC = GC with Other Fees
- `openai` - Complex NC with tiered management
- `figure` - NC = GC × (1 - SFR)
- `scout` - NC = GC with premium
- `spacex1` - NC = GC / (1 + SFR), fees on NC
- `spacex2` - NC = GC × (PMSP/ISP)
- `newheights` - Minimal fees (admin + performance)
- `egypt` - NC = GC with premium

## Common Tasks

### Add a new API endpoint
1. Create route in `/app/api/your-endpoint/route.ts`
2. Use services from `/lib/services`
3. Return NextResponse.json()

### Query the database
1. Import the service you need
2. Call the method
3. Handle errors with try/catch

### Debug issues
1. Check browser console
2. Check terminal for server errors
3. Use MCP tools to check database directly

## Important Rules

1. **SUPABASE IS THE ONLY SOURCE OF TRUTH** - No exceptions
2. NO emoji in code files
3. Use clean table names for new code (`transactions_clean`, `deals_clean`, etc.)
4. Old dot-notation names work via views for backward compatibility
5. Always handle errors properly
6. Use TypeScript types from `/lib/types`
7. Single source of truth: Supabase tables only
8. SupabaseAdapter uses `useViews: false` by default for performance
9. All repos MUST query Supabase directly - no mock data
10. Service layer MUST use Supabase client, never mock adapter

## Testing Configuration

### Playwright E2E Tests
- Tests run on port 3001 with auth bypass
- Middleware detects test environment via SKIP_AUTH=true
- Test config in `playwright.config.ts`
- Run with: `SKIP_AUTH=true npm run test:e2e`

## Current Status (2025-08-27)

- ✅ All APIs operational (Supabase-powered)
- ✅ Supabase as single source of truth
- ✅ Authentication bypass for tests working
- ✅ Formula engine integrated with Supabase
- ✅ 683 total records in Supabase
- ✅ $20.9M portfolio value in Supabase
- ✅ Mock data DISABLED - Production only

## Need Help?

- Health not passing? Check `.env.local` has all keys
- Database errors? Verify table names (dots matter!)
- Import errors? Use `@/` for absolute imports
- Tests redirecting to login? Ensure SKIP_AUTH=true is set

---
*Keep it simple. Ship features. Don't over-engineer.*