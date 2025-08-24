# 🚀 Equitie Architecture - Quick Reference

## Current Status ✅

### What's Working
- **MCP Docker**: Custom server running on port 3101
- **Database**: Connected to Supabase (project: ikezqzljrupkzmyytgok)
- **Portal Navigation**: Seamless switching between Admin/Investor
- **RLS**: Enabled on `documents` and `user_profiles` tables
- **Migrations**: Tracked in `schema_migrations` table

### Quick Test Commands
```bash
# Check MCP servers
curl http://localhost:3101  # Custom Equitie MCP ✅ RUNNING

# Check database via MCP in IDE
# Open Command Palette → Search "MCP" → Execute queries
```

---

## 🎯 Key Fixes Applied

### 1. Database Connection Fixed
**Problem**: 401 errors on `investors.investor` table  
**Solution**: Added both key formats to `.env.local`:
```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
SUPABASE_SERVICE_KEY=eyJhbG...  # Same key, different name
```

### 2. MCP Power Enabled
**Problem**: No direct database access from IDE  
**Solution**: 
- Created `.vscode/settings.json` with MCP servers
- Built TypeScript bridge at `lib/services/mcp-bridge.service.ts`
- Added API endpoints at `/api/mcp/*`

### 3. Portal Journey Restored
**Problem**: Lost navigation between Admin/Investor  
**Solution**: Created `PortalSwitcher` component in both layouts

### 4. Docker Services Created
**Problem**: No containerization  
**Solution**: `docker-compose.yml` with:
- MCP servers (ports 3100-3101)
- PostgreSQL option
- Redis cache option

---

## 📁 File Structure

```
/
├── .vscode/settings.json         # MCP IDE configuration
├── .env                          # Docker environment
├── .env.local                    # Next.js environment
├── docker-compose.yml            # Container orchestration
│
├── /components/
│   └── PortalSwitcher.tsx        # Unified navigation
│
├── /lib/
│   ├── /middleware/
│   │   └── portal-auth.ts        # Authentication & roles
│   ├── /services/
│   │   └── mcp-bridge.service.ts # MCP TypeScript bridge
│   └── /mcp/
│       └── equitie-server.mjs    # Custom MCP server
│
├── /app/api/mcp/
│   ├── status/route.ts           # Health check
│   ├── tables/route.ts           # List tables
│   ├── query/route.ts            # Execute SQL
│   └── migrations/route.ts       # Manage migrations
│
└── /DB/migrations/
    └── 07_rls_policies.sql        # Row-level security
```

---

## 🔧 Common Tasks

### Start Everything
```bash
# 1. Start Next.js
npm run dev

# 2. Start MCP servers
docker-compose up -d mcp-equitie

# 3. Check status
curl http://localhost:3101
```

### Direct Database Query (via MCP)
```typescript
import { mcpBridge } from '@/lib/services/mcp-bridge.service';

// Execute query
const result = await mcpBridge.executeSQL(
  'SELECT COUNT(*) FROM "investors.investor"'
);

// Get table info
const tables = await mcpBridge.listTables(['public']);
```

### Apply Migrations
```bash
# Check status
npm run db:migrate:status

# Apply new migrations
npm run db:migrate:up
```

---

## 🗄️ Database Tables

### Dot-Named Tables (the dot IS part of the name)
- `investors.investor` - 202 rows, 16 foreign keys point here ✅
- `deals.deal` - Investment opportunities
- `companies.company` - Company profiles
- `transactions.transaction.primary` - Investments
- `transactions.transaction.secondary` - Secondary trades

### Regular Tables
- `documents` - RLS enabled ✅
- `user_profiles` - RLS enabled ✅
- `schema_migrations` - Tracks migrations ✅

---

## 🔐 Security Model

### RLS Policies Active
```sql
-- Documents: 4 policies
documents_select         -- Investors see their docs
documents_insert_admin   -- Only admins create
documents_update_admin   -- Only admins update  
documents_delete_admin   -- Only admins delete

-- User Profiles: 2 policies
profiles_select_own      -- Users see own profile
profiles_update_own      -- Users update own profile
```

### Helper Functions
```sql
public.get_user_role()     -- Returns: 'admin'|'investor'|'anon'
public.is_admin()          -- Returns: true/false
public.get_investor_id()   -- Returns: investor ID or null
```

---

## 🚨 Important Notes

1. **Canonical Table**: Always use `investors.investor` (not `investors`)
2. **Service Key**: Must be in `.env.local` for server operations
3. **MCP in IDE**: Restart Cursor after config changes
4. **Docker Env**: Uses `.env` file (not `.env.local`)

---

## 📊 System Architecture

```
┌─────────────────────────────────────┐
│         Cursor IDE + MCP            │
│    (Direct database queries)        │
├─────────────────────────────────────┤
│           Browser                   │
│      PortalSwitcher Component       │
├──────────┬──────────────────────────┤
│ Investor │        Admin             │
│  Portal  │       Portal             │
├──────────┴──────────────────────────┤
│         Next.js + Middleware        │
├─────────────────────────────────────┤
│    Service Layer + MCP Bridge       │
├─────────────────────────────────────┤
│           Supabase                  │
│    (RLS enabled on key tables)      │
└─────────────────────────────────────┘

Docker Services:
┌──────────┐ ┌──────────┐
│MCP Custom│ │PostgreSQL│
│Port 3101 │ │Port 5432 │
└──────────┘ └──────────┘
```

---

## ✅ Verification Checklist

- [x] MCP server running: `curl http://localhost:3101`
- [x] Database connected: 200 response from API
- [x] Portal switcher visible in UI
- [x] RLS policies applied (documents, user_profiles)
- [x] Docker containers running: `docker ps | grep mcp`
- [x] Migrations tracked: `schema_migrations` table exists

---

## 🆘 Troubleshooting

### MCP Not Working in IDE?
1. Check `.vscode/settings.json` exists
2. Restart Cursor IDE
3. Open Command Palette → Search "MCP"

### 401 Database Errors?
1. Check both keys in `.env.local`:
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_SERVICE_KEY`
2. Keys should be identical

### Docker Containers Restarting?
1. Check logs: `docker logs equitie-mcp-custom`
2. Ensure `.env` file exists (not just `.env.local`)
3. Verify `lib/mcp/equitie-server.mjs` exists

---

*Last Updated: 2025-08-24*