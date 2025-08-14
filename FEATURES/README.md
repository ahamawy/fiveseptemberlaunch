# EquiTie Platform Features

## Overview
This directory contains the complete feature tree and implementation examples for the EquiTie platform. All features follow a hierarchical numbering system for easy navigation and implementation.

## Feature Numbering Convention
```
domain.section.subsection.component.subcomponent
```

Example: `15.1.1` = Investor App > Investor Portal > Dashboard

## Current Implementation Status

### ✅ Implemented
- **15.1.1 investor-portal-dashboard** - Investor Portal Dashboard
  - Full Supabase integration
  - Service layer with caching
  - API shape mapping
  - Mock/real data switching

### 🚀 Ready to Ship
All features can now be rapidly implemented using:
- Established service patterns
- ultrathink/ context files  
- Supabase integration
- Brand token system

## Quick Start

### To implement a new feature:

1. **Find your feature code** in `FEATURE_TREE.md`
2. **Create feature folder**: `FEATURES/[feature-code]-[feature-name]/`
3. **Copy template structure**:
   ```
   FEATURES/15.1.2-investor-portal-onboarding-kyc/
   ├── dto/           # Data validation with Zod
   ├── repo/          # Repository pattern
   ├── routes/        # API route handlers
   ├── services/      # Business logic
   └── FEATURE.md     # Feature specification
   ```
4. **Use existing patterns**:
   - Service layer: `lib/services/`
   - Database: `lib/db/supabase-adapter.ts`
   - UI components: `components/ui/`
   - Brand tokens: `BRANDING/`

## Feature Tree Structure

### Top-Level Domains
1. **Deals** - Deal management and lifecycle
2. **Investors** - Investor profiles and management
3. **Transactions** - Financial transactions
4. **Companies** - Company data and enrichment
5. **Documents** - Document management
6. **Valuations** - Portfolio valuations
7. **Fees** - Fee calculations and management
8. **Secondaries** - Secondary market
9. **Authentication** - Auth and security
10. **AI** - AI/ML features
11. **Calculation Engine** - Financial calculations
12. **API Infrastructure** - Core API services
13. **UI Library** - Component library
14. **Admin** - Admin portal
15. **Investor App** - Investor-facing application ✅
16. **Communications** - Notifications and messaging
17. **Integrations** - Third-party integrations
18. **Accounting** - Financial accounting
19. **Monitoring & Testing** - Observability
20. **Tax & Reporting** - Tax and compliance
21. **News** - News and sentiment
22. **Mobile** - Mobile app features
23. **Database** - Database infrastructure

## Examples

### Example 1: Deals CRUD
```
1.1.1.1.1 deals-data-crud-read-by-id
```
- Domain: 1 (Deals)
- Section: 1.1 (deals-data)
- Subsection: 1.1.1 (deals-data-crud)
- Component: 1.1.1.1 (deals-data-crud-read)
- Feature: 1.1.1.1.1 (read-by-id)

### Example 2: Investor Dashboard
```
15.1.1 investor-portal-dashboard
```
- Domain: 15 (Investor App)
- Section: 15.1 (investor-portal)
- Feature: 15.1.1 (dashboard)

## Service Layer Pattern

All features use the established service layer pattern:

```typescript
// Import service
import { investorsService } from '@/lib/services';

// Use in component/route
const data = await investorsService.getDashboardData(investorId);
```

## Database Access

Features connect to Supabase through the adapter:

```typescript
// Automatic switching based on env
// NEXT_PUBLIC_USE_MOCK_DATA=false -> Supabase
// NEXT_PUBLIC_USE_MOCK_DATA=true -> Mock data

import { dataClient } from '@/lib/db/client';
const deals = await dataClient.getDeals();
```

## API Routes Pattern

All API routes follow consistent patterns:

```typescript
// app/api/[resource]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { [resource]Service } from '@/lib/services';

export async function GET(request: NextRequest) {
  const result = await [resource]Service.getData();
  return NextResponse.json(result);
}
```

## UI Components

Use existing branded components:

```typescript
import { Card, Button, Table } from '@/components/ui';
import { BRAND_CONFIG } from '@/BRANDING/brand.config';

<Card variant="gradient" glow>
  <CardTitle gradient>Portfolio Value</CardTitle>
  <CardContent>{formatCurrency(value)}</CardContent>
</Card>
```

## Environment Configuration

```env
# Supabase (Production)
NEXT_PUBLIC_SUPABASE_URL=https://ikezqzljrupkzmyytgok.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_USE_MOCK_DATA=false
NEXT_PUBLIC_ENABLE_SUPABASE=true

# Mock Data (Development)
NEXT_PUBLIC_USE_MOCK_DATA=true
NEXT_PUBLIC_ENABLE_SUPABASE=false
```

## Quick Commands

```bash
# Start development
npm run dev

# Run tests
npm run test

# Check specific feature
curl http://localhost:3001/api/[endpoint]

# View dashboard
open http://localhost:3001/investor-portal/dashboard
```

## Contributing

1. Pick a feature from `FEATURE_TREE.md`
2. Create feature folder with proper code
3. Follow existing patterns
4. Use service layer
5. Test with mock data first
6. Switch to Supabase
7. Create PR with feature code in title

## Resources

- **Feature Tree**: `FEATURE_TREE.md` - Complete feature list
- **ultrathink/**: Context files for Claude Code
- **BRANDING/**: Brand tokens and guidelines
- **lib/services/**: Service layer implementations
- **lib/db/**: Database adapters
- **components/ui/**: UI component library

## Support

For questions about features:
1. Check `FEATURE_TREE.md` for feature details
2. Review existing examples in `FEATURES/examples/`
3. Use ultrathink/ context with Claude Code
4. Reference service patterns in `lib/services/`