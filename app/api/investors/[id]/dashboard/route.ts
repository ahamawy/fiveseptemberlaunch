import { NextRequest, NextResponse } from 'next/server';
import { getInvestorById } from '@/lib/mock-data/investors';
import { getDealsByInvestorId, getCommitmentsByInvestorId, getDealById, getCompanyById } from '@/lib/mock-data/deals';
import { getRecentTransactions } from '@/lib/mock-data/transactions';
import { calculatePerformanceMetrics, getPortfolioSummary } from '@/lib/mock-data/performance';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const investorId = parseInt(params.id);
    const investor = getInvestorById(investorId);
    
    if (!investor) {
      return NextResponse.json(
        { error: 'Investor not found' },
        { status: 404 }
      );
    }
    
    // Get portfolio summary
    const portfolioSummary = getPortfolioSummary(investorId);
    
    // Get performance metrics
    const performanceMetrics = calculatePerformanceMetrics(investorId);
    
    // Get recent activity
    const recentTransactions = getRecentTransactions(investorId, 10);
    const recentActivity = recentTransactions.map(transaction => {
      let description = transaction.description;
      
      if (transaction.dealId) {
        const deal = getDealById(transaction.dealId);
        if (deal) {
          const company = getCompanyById(deal.companyId);
          description = `${transaction.description} - ${company?.name || deal.name}`;
        }
      }
      
      return {
        id: transaction.publicId,
        type: transaction.type,
        description,
        amount: transaction.amount,
        date: transaction.occurredOn,
      };
    });
    
    // Get active deals count
    const activeDeals = getDealsByInvestorId(investorId).filter(
      deal => deal.stage === 'active' || deal.stage === 'closing'
    ).length;
    
    // Prepare dashboard data
    const dashboardData = {
      investor: {
        id: investor.id,
        name: investor.fullName,
        email: investor.primaryEmail,
        type: investor.type,
        kycStatus: investor.kycStatus,
      },
      portfolio: {
        totalValue: portfolioSummary.totalValue,
        totalCommitted: portfolioSummary.totalCommitted,
        totalDistributed: portfolioSummary.totalDistributed,
        unrealizedGain: portfolioSummary.unrealizedGain,
      },
      performance: {
        irr: performanceMetrics.irr,
        moic: performanceMetrics.moic,
        dpi: performanceMetrics.dpi,
        tvpi: performanceMetrics.tvpi,
      },
      recentActivity,
      activeDeals,
      summary: {
        totalDeals: portfolioSummary.totalDeals,
        totalCalled: performanceMetrics.totalCalled,
        realizedGain: performanceMetrics.realizedGain,
      },
    };
    
    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}