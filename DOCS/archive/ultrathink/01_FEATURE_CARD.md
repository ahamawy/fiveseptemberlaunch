# Feature Card: 15.1.1 Investor Portal Dashboard

## Quick Ship Code
```bash
# Load this folder into Claude Code and say:
"Ship feature 15.1.1 investor dashboard with Supabase integration"
```

## Feature Identity
- **Code**: 15.1.1 (investor-portal-dashboard)
- **Name**: Investor Portal Dashboard
- **Type**: Data Display
- **Priority**: P0 (Core)
- **Owner**: EQT Platform Team
- **Domain**: 15. Investor App
- **Section**: 15.1 investor-portal
- **Feature Path**: investor-app > investor-portal > investor-portal-dashboard

## Business Value
Provides investors with real-time portfolio insights, recent activity, and performance metrics in a single, branded view.

## User Story
As an investor, I want to see my portfolio overview, recent transactions, and key metrics immediately upon login so I can make informed investment decisions.

## Technical Spec

### Data Sources (Supabase)
```sql
-- Primary tables
investor_analytics      -- Pre-computed metrics
deals                   -- Active investments
deal_valuations        -- Performance data
transactions           -- Recent activity
```

### Service Layer (Already Exists)
```typescript
import { investorsService } from '@/lib/services';

const dashboard = await investorsService.getDashboardData(investorId);
```

### UI Components (Use These)
- `Card` with `variant="gradient"` for metrics
- `Card` with `variant="glass"` for data tables
- `Table` for transactions list
- `MetricCard` for KPIs

## Mock Data Structure
```typescript
{
  summary: {
    totalCommitted: 5000000,
    totalCalled: 3750000,
    currentValue: 6250000,
    portfolioIRR: 18.5,
    portfolioMOIC: 1.67,
    activeDeals: 8
  },
  recentActivity: [
    { type: 'capital_call', amount: 250000, date: '2024-01-15' },
    { type: 'distribution', amount: 500000, date: '2024-01-10' }
  ],
  portfolioTrend: [
    { month: 'Oct', value: 5800000 },
    { month: 'Nov', value: 6100000 },
    { month: 'Dec', value: 6250000 }
  ]
}
```

## Acceptance Criteria
- [ ] Dashboard loads at `/investor-portal/dashboard`
- [ ] Shows 6 key metrics in branded cards
- [ ] Displays recent transactions (last 5)
- [ ] Shows portfolio value trend chart
- [ ] Uses Equitie purple gradient (#C898FF)
- [ ] Responsive on mobile/tablet/desktop
- [ ] Data refreshes without page reload
- [ ] Loads in <500ms with mock data

## Quick Commands
```bash
# Development
npm run dev
open http://localhost:3000/investor-portal/dashboard

# Testing
npm run test:unit
npm run test:e2e

# Check API
curl http://localhost:3000/api/investors/1/dashboard
```

## Success Metrics
- Page load time < 500ms
- All metrics visible above fold
- Zero console errors
- Passes accessibility audit

## Notes for Claude Code
- Service layer handles mock/Supabase switching automatically
- Use existing Card components, don't create new ones
- Brand tokens are in `/BRANDING/brand.config.ts`
- No emojis in production code
- Use SVG icons from Heroicons/Lucide only