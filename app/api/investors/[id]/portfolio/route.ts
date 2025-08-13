import { NextRequest, NextResponse } from 'next/server';
import { getInvestorById } from '@/lib/mock-data/investors';
import { getDealPerformance, getHistoricalPerformance } from '@/lib/mock-data/performance';
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
    
    // Get deal-level performance
    const dealPerformance = getDealPerformance(investorId);
    
    // Enrich with deal and company information
    const enrichedDealPerformance = dealPerformance.map(perf => {
      const deal = getDealById(perf.dealId);
      const company = deal ? getCompanyById(deal.companyId) : null;
      
      return {
        ...perf,
        dealName: deal?.name || `Deal ${perf.dealId}`,
        companyName: company?.name || 'Unknown Company',
        dealType: deal?.type || 'unknown',
        sector: deal?.sector || company?.sector || 'Unknown',
        stage: deal?.stage || 'unknown',
        currency: deal?.currency || 'USD',
      };
    });
    
    // Get historical performance
    const historicalPerformance = getHistoricalPerformance(investorId);
    
    // Calculate portfolio allocation by sector
    const sectorAllocation = enrichedDealPerformance.reduce((acc, deal) => {
      const sector = deal.sector;
      if (!acc[sector]) {
        acc[sector] = {
          sector,
          value: 0,
          percentage: 0,
          dealCount: 0,
        };
      }
      acc[sector].value += deal.currentValue;
      acc[sector].dealCount += 1;
      return acc;
    }, {} as Record<string, any>);
    
    const totalValue = Object.values(sectorAllocation).reduce(
      (sum: number, item: any) => sum + item.value,
      0
    );
    
    Object.values(sectorAllocation).forEach((item: any) => {
      item.percentage = totalValue > 0 ? (item.value / totalValue) * 100 : 0;
    });
    
    // Calculate portfolio allocation by deal type
    const typeAllocation = enrichedDealPerformance.reduce((acc, deal) => {
      const type = deal.dealType;
      if (!acc[type]) {
        acc[type] = {
          type,
          value: 0,
          percentage: 0,
          dealCount: 0,
        };
      }
      acc[type].value += deal.currentValue;
      acc[type].dealCount += 1;
      return acc;
    }, {} as Record<string, any>);
    
    Object.values(typeAllocation).forEach((item: any) => {
      item.percentage = totalValue > 0 ? (item.value / totalValue) * 100 : 0;
    });
    
    const portfolioData = {
      deals: enrichedDealPerformance,
      historicalPerformance,
      allocation: {
        bySector: Object.values(sectorAllocation),
        byType: Object.values(typeAllocation),
      },
      summary: {
        totalDeals: enrichedDealPerformance.length,
        activeDeals: enrichedDealPerformance.filter(d => d.status === 'active').length,
        exitedDeals: enrichedDealPerformance.filter(d => d.status === 'exited').length,
        totalValue,
      },
    };
    
    return NextResponse.json(portfolioData);
  } catch (error) {
    console.error('Error fetching portfolio data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}