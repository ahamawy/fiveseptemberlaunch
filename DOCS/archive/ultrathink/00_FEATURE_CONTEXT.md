# Feature 15.1.1: Investor Portal Dashboard

## Quick Start
Load this folder into Claude Code and say: "Implement feature 15.1.1 investor dashboard using Supabase"

## Feature Overview
The investor portal dashboard provides a comprehensive view of an investor's portfolio, recent activity, and key performance metrics.

## What Already Exists (Use These!)
- **Service Layer**: `lib/services/investors.service.ts` - getDashboardData()
- **Components**: `components/ui/Card.tsx` - gradient and glass variants
- **Dashboard Page**: `app/investor-portal/dashboard/page.tsx`
- **API Routes**: `app/api/investors/[id]/dashboard/route.ts`

## Supabase Tables Available
```sql
-- Primary tables for this feature
investor_analytics (
  investor_id, 
  total_invested, 
  current_portfolio_value,
  portfolio_irr,
  number_of_investments
)

deals (
  deal_id,
  deal_name, 
  deal_type,
  moic,
  irr,
  status
)

deal_valuations (
  deal_id,
  valuation_date,
  total_value,
  moic,
  irr
)

transactions (
  Recent activity data - already mapped in service
)
```

## Implementation Pattern
```typescript
// The service layer already handles Supabase connection
import { investorsService } from '@/lib/services';

// In your page or API route
const dashboardData = await investorsService.getDashboardData(investorId);
```

## Success Criteria
- [ ] Dashboard loads at `/investor-portal/dashboard`
- [ ] Shows portfolio value from `investor_analytics`
- [ ] Displays recent deals from `deals` table
- [ ] Uses existing Card components with Equitie branding
- [ ] Data comes from Supabase (not mock)

## Quick Commands
```bash
# Start development
npm run dev

# Test the dashboard
open http://localhost:3000/investor-portal/dashboard

# Check API response
curl http://localhost:3000/api/investors/1/dashboard
```