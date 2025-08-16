import { NextRequest, NextResponse } from 'next/server';
import { investorsService } from '@/lib/services';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const investorId = parseInt(params.id);
    
    // Get portfolio holdings from investor_units
    const holdings = await investorsService.getPortfolioHoldings(investorId);
    
    if (!holdings?.data) {
      return NextResponse.json({
        deals: [],
        historicalPerformance: [],
        allocation: { bySector: [], byType: [] },
        summary: {
          totalDeals: 0,
          activeDeals: 0,
          exitedDeals: 0,
          totalValue: 0
        }
      });
    }

    const deals = holdings.data;

    // Calculate portfolio allocation by sector
    const sectorAllocation = deals.reduce((acc: any, deal: any) => {
      const sector = deal.sector;
      if (!acc[sector]) {
        acc[sector] = {
          sector,
          value: 0,
          percentage: 0,
          dealCount: 0
        };
      }
      acc[sector].value += deal.currentValue;
      acc[sector].dealCount += 1;
      return acc;
    }, {});

    // Calculate portfolio allocation by type
    const typeAllocation = deals.reduce((acc: any, deal: any) => {
      const type = deal.dealType;
      if (!acc[type]) {
        acc[type] = {
          type,
          value: 0,
          percentage: 0,
          dealCount: 0
        };
      }
      acc[type].value += deal.currentValue;
      acc[type].dealCount += 1;
      return acc;
    }, {});

    // Convert to arrays and calculate percentages
    const totalValue = deals.reduce((sum: number, d: any) => sum + d.currentValue, 0);
    
    const bySector = Object.values(sectorAllocation).map((s: any) => ({
      ...s,
      percentage: totalValue > 0 ? (s.value / totalValue) * 100 : 0
    }));

    const byType = Object.values(typeAllocation).map((t: any) => ({
      ...t,
      percentage: totalValue > 0 ? (t.value / totalValue) * 100 : 0
    }));

    // Generate historical performance (mock for now, could use investment_snapshots)
    const historicalPerformance = generateHistoricalPerformance(totalValue);

    // Calculate summary
    const summary = {
      totalDeals: deals.length,
      activeDeals: deals.filter((d: any) => d.status === 'active').length,
      exitedDeals: deals.filter((d: any) => d.status === 'exited').length,
      totalValue
    };

    return NextResponse.json({
      deals,
      historicalPerformance,
      allocation: {
        bySector,
        byType
      },
      summary
    });
  } catch (error) {
    console.error('Error fetching portfolio data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolio data' },
      { status: 500 }
    );
  }
}

function generateHistoricalPerformance(currentValue: number) {
  // Generate 12 months of historical data
  const months = 12;
  const data = [];
  const baseValue = currentValue * 0.85; // Start at 85% of current value
  
  for (let i = 0; i < months; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() - (months - i - 1));
    
    const progress = i / (months - 1);
    const value = baseValue + (currentValue - baseValue) * progress;
    const moic = value / baseValue;
    const irr = 10 + progress * 7; // IRR from 10% to 17%
    
    data.push({
      date: date.toISOString().split('T')[0],
      nav: Math.round(value),
      irr: Math.round(irr * 10) / 10,
      moic: Math.round(moic * 100) / 100
    });
  }
  
  return data;
}