# Claude Code Project Context

## 🚀 LATEST UPDATES (Session 2025-08-24)

### Architecture Complete ✅
1. **MCP Integration**: Full IDE database access via MCP servers (port 3101)
2. **Portal Navigation**: Seamless switching with `PortalSwitcher` component
3. **Database as Truth**: Migration tracking via `schema_migrations` table
4. **RLS Enabled**: Security policies on `documents` and `user_profiles`
5. **Docker Services**: MCP containers running (`docker ps | grep mcp`)

### Quick Health Check
```bash
curl http://localhost:3101          # MCP server ✅
npm run dev                          # Next.js on port 3001
```

## Project Overview

Equitie investment portal - Next.js dashboard with ARCHON Fee Engine.

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Database**: Supabase (project: ikezqzljrupkzmyytgok)
- **Testing**: Playwright + Vitest
- **MCP**: Docker containers for database tools
- **Auth**: Supabase Auth with RLS

## ⚠️ CRITICAL: NO EMOJIS IN CODE

- **NEVER** use emoji characters in code or UI
- **ALWAYS** use SVG icons from Heroicons or Lucide React
- Icons must be monochrome using `currentColor`

## Database Tables (IMPORTANT)

### Dot-Named Tables (the dot IS part of the name)
- `investors.investor` - 202 rows, 16 FKs point here ✅
- `deals.deal` - Investment opportunities
- `companies.company` - Company profiles
- `transactions.transaction.primary` - Investments

### Regular Tables
- `documents` - RLS enabled
- `user_profiles` - RLS enabled
- `schema_migrations` - Tracks migrations

## Service Layer Pattern

```typescript
import { mcpBridge } from "@/lib/services/mcp-bridge.service";
import { dealsService, investorsService } from "@/lib/services";

// Direct database query via MCP
const result = await mcpBridge.executeSQL('SELECT * FROM "investors.investor"');

// Service layer methods
const deals = await dealsService.getActiveDeals();
```

## MCP Bridge API

```text
GET  /api/mcp/status       # Health check
GET  /api/mcp/tables       # List database tables
POST /api/mcp/query        # Execute SQL (admin only)
GET  /api/mcp/migrations   # Migration status
```

## Configuration

### Required Environment Variables (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=https://ikezqzljrupkzmyytgok.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
SUPABASE_SERVICE_KEY=your-service-key  # Same as above
DATABASE_URL=postgresql://connection-string
```

### Docker Environment (.env)
```env
SUPABASE_SERVICE_ROLE_KEY=your-service-key
OPENROUTER_API_KEY=your-openrouter-key
```

## Quick Commands

```bash
# Development
npm run dev                    # Start Next.js
docker-compose up -d mcp-equitie  # Start MCP servers

# Testing
npx playwright test            # Run all tests
npx playwright test investor-portal.spec.ts  # Portal tests

# Database
npm run db:migrate:up          # Apply migrations
npm run db:migrate:status      # Check status

# Git
git push -u origin feat/guardrails-and-tests  # Push branch
```

## File Structure

```
/
├── .vscode/settings.json      # MCP IDE config
├── docker-compose.yml         # Container setup
├── middleware.ts              # Auth middleware
│
├── /components/
│   └── PortalSwitcher.tsx     # Navigation
│
├── /lib/
│   ├── /middleware/
│   │   └── portal-auth.ts     # Authentication
│   ├── /services/
│   │   └── mcp-bridge.service.ts  # MCP bridge
│   └── /mcp/
│       └── equitie-server.mjs # Custom MCP server
│
└── /app/api/mcp/              # MCP API endpoints
```

## RLS Helper Functions

```sql
public.get_user_role()     -- Returns: 'admin'|'investor'|'anon'
public.is_admin()          -- Returns: true/false
public.get_investor_id()   -- Returns: investor ID or null
```

## Testing Checklist

- [ ] MCP server running: `curl http://localhost:3101`
- [ ] Database connected: API returns 200
- [ ] Portal switcher visible in UI
- [ ] RLS policies working on documents table
- [ ] Migrations tracked in schema_migrations

## Documentation

- **Quick Guide**: `/DOCS/QUICK_ARCHITECTURE_GUIDE.md`
- **Full Details**: `/DOCS/ARCHITECTURE_IMPROVEMENTS.md`

## Important Notes

1. Always use `investors.investor` (not `investors`)
2. Service key must be in `.env.local` for server operations
3. Restart Cursor IDE after MCP config changes
4. Docker uses `.env` file (not `.env.local`)

---
*Last Updated: 2025-08-24*