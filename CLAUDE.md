# CLAUDE.md - Your Guide to This Codebase

## Quick Start

```bash
npm run dev                    # Start app on http://localhost:3000
node SCRIPTS/health-check.js  # Verify all endpoints work
```

## Supabase Setup

**Project ID**: `ikezqzljrupkzmyytgok`  
**URL**: `https://ikezqzljrupkzmyytgok.supabase.co`

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
  query: "SELECT * FROM investors.investor LIMIT 5"
})

// Get logs for debugging
mcp__supabase__get_logs({
  project_id: "ikezqzljrupkzmyytgok", 
  service: "api"
})
```

## Database Structure (UPDATED - Clean Schema)

### Main Tables - Single Source of Truth
- `transactions_clean` - ALL transactions (primary, secondary, advisory, subnominee)
- `deals_clean` - ALL deals 
- `companies_clean` - ALL companies
- `investors_clean` - ALL investors

### Backward Compatibility (Views)
The old dot-notation names still work as views:
- `investors.investor` → Points to `investors_clean`
- `deals.deal` → Points to `deals_clean`
- `companies.company` → Points to `companies_clean`
- `transactions.transaction.primary` → Points to `transactions_clean` (primary type only)

### How to Query
```typescript
// RECOMMENDED: Use clean tables directly
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
```

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

1. NO emoji in code files
2. Use clean table names for new code (`transactions_clean`, `deals_clean`, etc.)
3. Old dot-notation names work via views for backward compatibility
4. Always handle errors properly
5. Use TypeScript types from `/lib/types`
6. Single source of truth: Each ID comes from ONE table only

## Need Help?

- Health not passing? Check `.env.local` has all keys
- Database errors? Verify table names (dots matter!)
- Import errors? Use `@/` for absolute imports

---
*Keep it simple. Ship features. Don't over-engineer.*