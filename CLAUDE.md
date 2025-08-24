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

## Database Structure

### Main Tables (with dots in names!)
- `investors.investor` - Investor profiles
- `deals.deal` - Investment opportunities  
- `companies.company` - Company data
- `transactions.transaction.primary` - Transaction records

### How to Query
```typescript
// In API routes, use the service layer:
import { dealsService } from "@/lib/services";
const deals = await dealsService.getActiveDeals();

// Or direct Supabase:
import { getServiceClient } from "@/lib/db/supabase/server-client";
const sb = getServiceClient();
const { data } = await sb.from("deals.deal").select("*");
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
2. Use dot-named tables exactly as shown
3. Always handle errors properly
4. Use TypeScript types from `/lib/types`

## Need Help?

- Health not passing? Check `.env.local` has all keys
- Database errors? Verify table names (dots matter!)
- Import errors? Use `@/` for absolute imports

---
*Keep it simple. Ship features. Don't over-engineer.*