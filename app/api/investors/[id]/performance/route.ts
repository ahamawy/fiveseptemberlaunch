import { NextRequest, NextResponse } from 'next/server';
import { getInvestorById } from '@/lib/mock-data/investors';
import { 
  calculatePerformanceMetrics, 
  getHistoricalPerformance, 
  getDealPerformance 
} from '@/lib/mock-data/performance';
import { getDealById, getCompanyById } from '@/lib/mock-data/deals';

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
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || '12m'; // 3m, 6m, 12m, ytd, all
    const groupBy = searchParams.get('groupBy') || 'month'; // day, week, month, quarter, year
    
    // Calculate current performance metrics
    const currentMetrics = calculatePerformanceMetrics(investorId);
    
    // Get historical performance based on period
    let historicalData = getHistoricalPerformance(investorId);
    
    // Filter historical data based on period
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case '3m':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case '6m':
        startDate.setMonth(now.getMonth() - 6);
        break;
      case '12m':
        startDate.setMonth(now.getMonth() - 12);
        break;
      case 'ytd':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'all':
        startDate = new Date(2020, 0, 1); // Mock start date
        break;
      default:
        startDate.setMonth(now.getMonth() - 12);
    }
    
    historicalData = historicalData.filter(
      data => new Date(data.date) >= startDate
    );
    
    // Get deal-level performance
    const dealPerformance = getDealPerformance(investorId);
    
    // Enrich deal performance with additional data
    const enrichedDealPerformance = dealPerformance.map(perf => {
      const deal = getDealById(perf.dealId);
      const company = deal ? getCompanyById(deal.companyId) : null;
      
      return {
        ...perf,
        dealName: deal?.name || `Deal ${perf.dealId}`,
        companyName: company?.name || 'Unknown Company',
        sector: deal?.sector || company?.sector || 'Unknown',
        dealType: deal?.type || 'unknown',
      };
    });
    
    // Calculate performance by deal type
    const performanceByType = enrichedDealPerformance.reduce((acc, deal) => {
      const type = deal.dealType;
      if (!acc[type]) {
        acc[type] = {
          type,
          totalCommitted: 0,
          totalCalled: 0,
          totalDistributed: 0,
          currentValue: 0,
          averageIrr: 0,
          averageMoic: 0,
          dealCount: 0,
        };
      }
      acc[type].totalCommitted += deal.committed;
      acc[type].totalCalled += deal.called;
      acc[type].totalDistributed += deal.distributed;
      acc[type].currentValue += deal.currentValue;
      acc[type].averageIrr += deal.irr;
      acc[type].averageMoic += deal.moic;
      acc[type].dealCount += 1;
      return acc;
    }, {} as Record<string, any>);
    
    // Calculate averages
    Object.values(performanceByType).forEach((item: any) => {
      item.averageIrr = item.dealCount > 0 ? item.averageIrr / item.dealCount : 0;
      item.averageMoic = item.dealCount > 0 ? item.averageMoic / item.dealCount : 0;
    });
    
    // Calculate performance by sector
    const performanceBySector = enrichedDealPerformance.reduce((acc, deal) => {
      const sector = deal.sector;
      if (!acc[sector]) {
        acc[sector] = {
          sector,
          totalCommitted: 0,
          totalCalled: 0,
          totalDistributed: 0,
          currentValue: 0,
          averageIrr: 0,
          averageMoic: 0,
          dealCount: 0,
        };
      }
      acc[sector].totalCommitted += deal.committed;
      acc[sector].totalCalled += deal.called;
      acc[sector].totalDistributed += deal.distributed;
      acc[sector].currentValue += deal.currentValue;
      acc[sector].averageIrr += deal.irr;
      acc[sector].averageMoic += deal.moic;
      acc[sector].dealCount += 1;
      return acc;
    }, {} as Record<string, any>);
    
    // Calculate averages
    Object.values(performanceBySector).forEach((item: any) => {
      item.averageIrr = item.dealCount > 0 ? item.averageIrr / item.dealCount : 0;
      item.averageMoic = item.dealCount > 0 ? item.averageMoic / item.dealCount : 0;
    });
    
    // Calculate benchmarks (mock data)
    const benchmarks = {
      industryAverage: {
        irr: 15.2,
        moic: 1.8,
        dpi: 0.6,
        tvpi: 1.5,
      },
      topQuartile: {
        irr: 22.5,
        moic: 2.5,
        dpi: 0.9,
        tvpi: 2.2,
      },
    };
    
    const performanceData = {
      current: {
        irr: currentMetrics.irr,
        moic: currentMetrics.moic,
        dpi: currentMetrics.dpi,
        tvpi: currentMetrics.tvpi,
        totalCommitted: currentMetrics.totalCommitted,
        totalCalled: currentMetrics.totalCalled,
        totalDistributed: currentMetrics.totalDistributed,
        unrealizedValue: currentMetrics.unrealizedValue,
        realizedGain: currentMetrics.realizedGain,
        unrealizedGain: currentMetrics.unrealizedGain,
      },
      historical: historicalData,
      byDeal: enrichedDealPerformance,
      byType: Object.values(performanceByType),
      bySector: Object.values(performanceBySector),
      benchmarks,
      period,
      comparison: {
        vsIndustry: {
          irr: currentMetrics.irr - benchmarks.industryAverage.irr,
          moic: currentMetrics.moic - benchmarks.industryAverage.moic,
          dpi: currentMetrics.dpi - benchmarks.industryAverage.dpi,
          tvpi: currentMetrics.tvpi - benchmarks.industryAverage.tvpi,
        },
        vsTopQuartile: {
          irr: currentMetrics.irr - benchmarks.topQuartile.irr,
          moic: currentMetrics.moic - benchmarks.topQuartile.moic,
          dpi: currentMetrics.dpi - benchmarks.topQuartile.dpi,
          tvpi: currentMetrics.tvpi - benchmarks.topQuartile.tvpi,
        },
      },
    };
    
    return NextResponse.json(performanceData);
  } catch (error) {
    console.error('Error fetching performance data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}