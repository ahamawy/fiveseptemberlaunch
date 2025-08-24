/**
 * Query Examples for Feature 15.1.1
 * Shows how to access Supabase data through the service layer
 */

// 1. SERVICE LAYER (RECOMMENDED - Use This!)
// The service layer handles caching, error handling, and mock/Supabase switching

import { investorsService, dealsService, documentsService } from '@/lib/services';

// Get dashboard data for an investor
const dashboardExample = async (investorId: number) => {
  const result = await investorsService.getDashboardData(investorId);
  // Returns: { success, data: { summary, recentActivity, portfolioTrend, topDeals } }
  
  if (result.success) {
    console.log('Portfolio Value:', result.data.summary.currentValue);
    console.log('IRR:', result.data.summary.portfolioIRR);
  }
};

// Get active deals
const dealsExample = async () => {
  const result = await dealsService.getActiveDeals();
  // Returns: { success, data: Deal[], pagination }
  
  result.data.forEach(deal => {
    console.log(deal.name, deal.moic, deal.irr);
  });
};

// Get investor transactions
const transactionsExample = async (investorId: number) => {
  const transactions = await investorsService.getTransactions(investorId, {
    type: 'capital_call',
    status: 'completed',
    limit: 10
  });
  // Returns: Transaction[]
};

// 2. DIRECT SUPABASE ADAPTER (Lower Level)
// Only use if you need custom queries not in services

import { dataClient } from '@/lib/db/client';

// Custom dashboard query
const customDashboardQuery = async (investorId: number) => {
  // The adapter implements these methods:
  const [investor, commitments, transactions] = await Promise.all([
    dataClient.getInvestorById(investorId),
    dataClient.getCommitments(investorId),
    dataClient.getTransactions({ investor_id: investorId, limit: 5 })
  ]);
  
  return {
    investor,
    totalCommitted: commitments.reduce((sum, c) => sum + c.amount, 0),
    recentActivity: transactions
  };
};

// 3. RAW SUPABASE QUERIES (From SupabaseAdapter)
// These are the actual queries used internally

const supabaseQueries = {
  // Get investor with analytics
  getInvestor: `
    SELECT 
      i.*,
      ia.total_invested,
      ia.current_portfolio_value,
      ia.portfolio_irr,
      ia.portfolio_moic
    FROM investors i
    LEFT JOIN investor_analytics ia ON i.id = ia.investor_id
    WHERE i.id = $1
  `,
  
  // Get deals with valuations
  getDealsWithPerformance: `
    SELECT 
      d.*,
      dv.total_value as current_value,
      dv.moic,
      dv.irr
    FROM deals d
    LEFT JOIN LATERAL (
      SELECT * FROM deal_valuations 
      WHERE deal_id = d.id 
      ORDER BY valuation_date DESC 
      LIMIT 1
    ) dv ON true
    WHERE d.status = 'active'
  `,
  
  // Get investor commitments with deal details
  getCommitmentsWithDeals: `
    SELECT 
      c.*,
      d.name as deal_name,
      d.stage as deal_stage,
      d.type as deal_type
    FROM commitments c
    JOIN deals d ON c.deal_id = d.id
    WHERE c.investor_id = $1
    ORDER BY c.created_at DESC
  `,
  
  // Get recent transactions
  getRecentTransactions: `
    SELECT 
      t.*,
      d.name as deal_name
    FROM transactions t
    LEFT JOIN deals d ON t.deal_id = d.id
    WHERE t.investor_id = $1
    ORDER BY t.transaction_date DESC
    LIMIT $2
  `
};

// 4. USAGE IN API ROUTES
// Always use services in API routes for consistency

// app/api/investors/[id]/dashboard/route.ts
export async function GET(request: Request, { params }) {
  const result = await investorsService.getDashboardData(params.id);
  
  // Transform to UI shape
  const uiData = {
    portfolio: {
      totalValue: result.data.summary.currentValue,
      totalCommitted: result.data.summary.totalCommitted
    },
    performance: {
      irr: result.data.summary.portfolioIRR,
      moic: result.data.summary.portfolioMOIC
    },
    recentActivity: result.data.recentActivity
  };
  
  return Response.json(uiData);
}

// 5. USAGE IN REACT COMPONENTS
// Use in pages or components

// app/investor-portal/dashboard/page.tsx
const DashboardPage = async ({ params }) => {
  const dashboard = await investorsService.getDashboardData(params.id);
  
  return (
    <div>
      <MetricCard 
        label="Portfolio Value"
        value={dashboard.data.summary.currentValue}
      />
      <MetricCard 
        label="IRR"
        value={dashboard.data.summary.portfolioIRR}
      />
    </div>
  );
};

// 6. MOCK VS SUPABASE SWITCHING
// Controlled by environment variables:
// NEXT_PUBLIC_USE_MOCK_DATA=false  (use Supabase)
// NEXT_PUBLIC_ENABLE_SUPABASE=true (enable Supabase adapter)

// The service layer automatically handles this:
// - If mock mode: uses mock-adapter.ts with sample data
// - If Supabase mode: uses supabase-adapter.ts with real queries

export {
  dashboardExample,
  dealsExample,
  transactionsExample,
  customDashboardQuery,
  supabaseQueries
};