# AI Context Guide - Equitie Investor Portal

## 🎯 Purpose
This document provides comprehensive context for AI assistants working with this codebase.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                   │
├─────────────────────────────────────────────────────────────┤
│  Pages          │  Components      │  Middleware             │
│  /app/*         │  /components/*   │  middleware.ts          │
├─────────────────────────────────────────────────────────────┤
│                      Service Layer                           │
│                    /lib/services/*                           │
├─────────────────────────────────────────────────────────────┤
│                    Database Adapters                         │
│                      /lib/db/*                               │
├─────────────────────────────────────────────────────────────┤
│                   Supabase (PostgreSQL)                      │
│              Project: ikezqzljrupkzmyytgok                   │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Directory Structure

```
/app                    # Next.js 14 App Router
  /api                  # API endpoints
    /admin             # Admin-only endpoints
    /deals             # Deal management
    /investors         # Investor operations
    /transactions      # Transaction handling
  /admin               # Admin portal UI
  /investor-portal     # Investor portal UI
    /dashboard         # Main dashboard
    /portfolio         # Holdings view
    /transactions      # Transaction history
    /deals             # Investment opportunities
    /documents         # Document management
    /profile           # User profile

/components            # React components
  /ui                  # Reusable UI components
  /common              # Common components
  /dev                 # Development tools
  /admin               # Admin-specific components

/lib                   # Core libraries
  /services            # Business logic (9 services)
    base.service.ts    # Base class for all services
    deals.service.ts   # Deal operations
    investors.service.ts # Investor operations
    transactions.service.ts # Transaction handling
    documents.service.ts # Document management
    fees.service.ts    # Fee calculations
    formula-engine.service.ts # Formula engine
    institutional.service.ts # Institutional features
    mcp-bridge.service.ts # MCP integration
  
  /db                  # Database layer
    /supabase          # Supabase client & adapters
    /repos             # Repository pattern
    /types             # TypeScript types
  
  /infrastructure      # Infrastructure code
    /cache             # Caching strategies
    /monitoring        # Performance monitoring
    /jobs              # Background jobs

/DOCS                  # Documentation
/SCRIPTS               # Utility scripts
/tests                 # Test suites
  /e2e                 # Playwright E2E tests
```

## 🗄️ Database Schema

### Primary Tables (Clean Schema)
```sql
-- Single source of truth tables
transactions_clean    -- 354 records (all transaction types)
deals_clean          -- 29 deals with formula templates  
companies_clean      -- 98 companies
investors_clean      -- 202 investors
documents            -- Document storage
formula_templates    -- Fee calculation templates
```

### Key Relationships
```
investor -> transactions -> deals -> companies
         -> documents
         -> investor_units (commitments)
```

### Important Notes
- Use `*_clean` tables for all new code
- Primary keys: `investor_id`, `deal_id`, `company_id`, `transaction_id`
- Old dot-notation tables (e.g., `deals.deal`) exist as views for backwards compatibility

## 🔑 Environment Configuration

```env
# Required in .env.local
NEXT_PUBLIC_SUPABASE_URL=https://ikezqzljrupkzmyytgok.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from Supabase dashboard>
SUPABASE_SERVICE_ROLE_KEY=<from Supabase dashboard>

# Optional
NEXT_PUBLIC_USE_MOCK_DATA=false  # Use mock data instead of Supabase
OPENROUTER_API_KEY=<for AI features>
```

## 🚀 Development Workflow

### Starting the Application
```bash
npm install           # Install dependencies
npm run dev          # Start on http://localhost:3001
```

### Testing
```bash
SKIP_AUTH=true npm run test:e2e  # Run Playwright tests
node SCRIPTS/health-check.js     # Check API health
```

### Port Configuration
- **Default Port**: 3001 (avoids Docker conflicts)
- **Test Port**: 3001 with SKIP_AUTH=true
- **Middleware**: Automatically detects test environment

## 🔐 Authentication

### Development Mode
- Authentication bypassed automatically
- Default user: test-user (admin role)
- Investor ID: 1

### Test Environment
- Set `SKIP_AUTH=true` environment variable
- Middleware detects and bypasses auth
- Playwright tests configured with auth headers

### Production
- Full Supabase authentication
- Role-based access control (admin/investor)
- Protected routes via middleware

## 📊 Key Statistics

- **Total Records**: 683
- **Portfolio Value**: $20.9M
- **Investors**: 202
- **Deals**: 29
- **Transactions**: 354
- **Companies**: 98
- **Storage Reduction**: 61% after schema migration

## 🧮 Formula Engine

### Templates Available
- `standard` - Default template
- `impossible` - NC = GC × (PMSP/ISP)
- `reddit` - NC = GC with Other Fees
- `openai` - Complex NC with tiered management
- `figure` - NC = GC × (1 - SFR)
- `scout` - NC = GC with premium
- `spacex1` - NC = GC / (1 + SFR)
- `spacex2` - NC = GC × (PMSP/ISP)
- `newheights` - Minimal fees
- `egypt` - NC = GC with premium

### Admin UI
- Formula Manager: `/admin/formula-manager`
- Formula Validation: `/admin/formula-validation`

## 🛠️ MCP Tools

When using MCP tools with this project:

```typescript
// Project ID is always: ikezqzljrupkzmyytgok
mcp__supabase__list_tables({ 
  project_id: "ikezqzljrupkzmyytgok" 
})

mcp__supabase__execute_sql({ 
  project_id: "ikezqzljrupkzmyytgok",
  query: "SELECT * FROM deals_clean LIMIT 5"
})
```

## ⚠️ Common Pitfalls

1. **Port Issues**: Always use port 3001, not 3000
2. **Table Names**: Use `*_clean` tables, not dot-notation
3. **Authentication**: Set SKIP_AUTH=true for tests
4. **Imports**: Use `@/` for absolute imports
5. **Console Logs**: Minimize in production code

## 📝 Code Style Guidelines

### TypeScript
- Use explicit types, avoid `any`
- Interfaces for data structures
- Enums for fixed values
- Async/await over promises

### React
- Functional components with hooks
- Proper error boundaries
- Memoization where needed
- Client components marked with 'use client'

### API Routes
- Always return NextResponse.json()
- Handle errors with try/catch
- Use proper HTTP status codes
- Validate input data

### Services
- Extend BaseService class
- Implement caching strategies
- Use repository pattern for DB access
- Handle errors gracefully

## 🚦 Current Status

- ✅ All APIs operational
- ✅ Database connected
- ✅ Authentication working
- ✅ Formula engine integrated
- ✅ Tests configured
- ✅ Documentation updated

## 📚 Key Documentation

- **Main Guide**: [CLAUDE.md](./CLAUDE.md)
- **Quick Start**: [QUICK_START.md](./QUICK_START.md)
- **System Status**: [SYSTEM_STATUS.md](./SYSTEM_STATUS.md)
- **API Documentation**: [DOCS/API.md](./DOCS/API.md)
- **Schema Migration**: [SCHEMA_MIGRATION.md](./SCHEMA_MIGRATION.md)

## 💡 Tips for AI Assistants

1. **Always check the current branch and status before making changes**
2. **Use the service layer for business logic, not direct DB queries**
3. **Test changes with `SKIP_AUTH=true npm run test:e2e`**
4. **Refer to CLAUDE.md for specific implementation details**
5. **Check SYSTEM_STATUS.md for known issues**
6. **Use clean tables (`*_clean`) for all database operations**
7. **Port 3001 is the default, not 3000**

---
*This codebase is optimized for AI-assisted development with clear patterns and comprehensive documentation.*