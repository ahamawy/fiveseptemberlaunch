/**
 * Portfolio Data Contracts
 * Defines TypeScript interfaces for portfolio-related data structures
 */

export interface PortfolioDeal {
  dealId: number;
  dealName: string;
  companyName: string;
  companyId?: number;
  sector: string;
  dealType: string;
  committed: number;
  called: number;
  distributed: number;
  currentValue: number;
  irr: number;
  moic: number;
  status: "active" | "exited" | "written_off";
  currency: string;
  stage: string;
  documentsCount?: number;
  logoUrl?: string;
}

export interface PortfolioAllocation {
  bySector: Array<{
    sector: string;
    value: number;
    percentage: number;
    dealCount: number;
  }>;
  byType: Array<{
    type: string;
    value: number;
    percentage: number;
    dealCount: number;
  }>;
  byStage?: Array<{
    stage: string;
    value: number;
    percentage: number;
    dealCount: number;
  }>;
}

export interface PortfolioSummary {
  totalDeals: number;
  activeDeals: number;
  exitedDeals: number;
  totalValue: number;
  totalCommitted: number;
  totalCalled: number;
  totalDistributed: number;
  totalGains?: number;
  portfolioIRR?: number;
  portfolioMOIC?: number;
}

export interface HistoricalPerformance {
  date: string;
  nav: number;
  irr: number;
  moic: number;
}

export interface PortfolioData {
  deals: PortfolioDeal[];
  allocation: PortfolioAllocation;
  summary: PortfolioSummary;
  historicalPerformance?: HistoricalPerformance[];
}

/**
 * Maps raw database rows to PortfolioDeal
 */
export function mapToPortfolioDeal(
  row: any,
  company?: { company_id: number; company_name: string; company_sector?: string | null },
  valuation?: { moic: number; irr: number | null }
): PortfolioDeal {
  const called = Number(row.net_capital || row.called || 0);
  const moic = valuation?.moic || (row.moic ? Number(row.moic) : (called > 0 ? Number(row.current_value || 0) / called : 1.0));
  const currentValue = called * moic;

  return {
    dealId: Number(row.deal_id || row.dealId),
    dealName: row.deal_name || row.dealName || `Deal #${row.deal_id || row.dealId}`,
    companyName: company?.company_name || row.companyName || "",
    companyId: company?.company_id || row.company_id,
    sector: company?.company_sector || row.sector || "unknown",
    dealType: (row.deal_type || row.dealType || "direct").toString().toLowerCase(),
    committed: called,
    called,
    distributed: Number(row.distributed || 0),
    currentValue,
    irr: valuation?.irr || Number(row.irr || 0),
    moic,
    status: (row.deal_status || row.status || "active").toString().toLowerCase() as PortfolioDeal["status"],
    currency: row.deal_currency || row.currency || "USD",
    stage: row.deal_status || row.stage || "active",
    documentsCount: row.documentsCount || 0,
    logoUrl: row.logo_url,
  };
}

/**
 * Calculates portfolio allocation from deals
 */
export function calculateAllocation(deals: PortfolioDeal[]): PortfolioAllocation {
  const bySectorMap = new Map<string, { value: number; dealCount: number }>();
  const byTypeMap = new Map<string, { value: number; dealCount: number }>();
  const byStageMap = new Map<string, { value: number; dealCount: number }>();

  const totalValue = deals.reduce((sum, deal) => sum + deal.currentValue, 0);

  deals.forEach((deal) => {
    const sector = deal.sector || "unknown";
    const type = deal.dealType || "direct";
    const stage = deal.stage || "active";

    bySectorMap.set(sector, {
      value: (bySectorMap.get(sector)?.value || 0) + deal.currentValue,
      dealCount: (bySectorMap.get(sector)?.dealCount || 0) + 1,
    });

    byTypeMap.set(type, {
      value: (byTypeMap.get(type)?.value || 0) + deal.currentValue,
      dealCount: (byTypeMap.get(type)?.dealCount || 0) + 1,
    });

    byStageMap.set(stage, {
      value: (byStageMap.get(stage)?.value || 0) + deal.currentValue,
      dealCount: (byStageMap.get(stage)?.dealCount || 0) + 1,
    });
  });

  const bySector = Array.from(bySectorMap.entries()).map(([sector, data]) => ({
    sector,
    value: data.value,
    percentage: totalValue > 0 ? (data.value / totalValue) * 100 : 0,
    dealCount: data.dealCount,
  }));

  const byType = Array.from(byTypeMap.entries()).map(([type, data]) => ({
    type,
    value: data.value,
    percentage: totalValue > 0 ? (data.value / totalValue) * 100 : 0,
    dealCount: data.dealCount,
  }));

  const byStage = Array.from(byStageMap.entries()).map(([stage, data]) => ({
    stage,
    value: data.value,
    percentage: totalValue > 0 ? (data.value / totalValue) * 100 : 0,
    dealCount: data.dealCount,
  }));

  return {
    bySector: bySector.sort((a, b) => b.value - a.value),
    byType: byType.sort((a, b) => b.value - a.value),
    byStage: byStage.sort((a, b) => b.value - a.value),
  };
}

/**
 * Calculates portfolio summary from deals
 */
export function calculateSummary(deals: PortfolioDeal[]): PortfolioSummary {
  const totalDeals = deals.length;
  const activeDeals = deals.filter(d => d.status === "active").length;
  const exitedDeals = deals.filter(d => d.status === "exited").length;
  
  const totalValue = deals.reduce((sum, d) => sum + d.currentValue, 0);
  const totalCommitted = deals.reduce((sum, d) => sum + d.committed, 0);
  const totalCalled = deals.reduce((sum, d) => sum + d.called, 0);
  const totalDistributed = deals.reduce((sum, d) => sum + d.distributed, 0);
  const totalGains = totalValue - totalCalled;
  
  const portfolioMOIC = totalCalled > 0 ? totalValue / totalCalled : 0;
  
  // Simple weighted average IRR (should be calculated with cashflow timing)
  const weightedIRR = deals.reduce((sum, d) => sum + (d.irr * d.currentValue), 0);
  const portfolioIRR = totalValue > 0 ? weightedIRR / totalValue : 0;

  return {
    totalDeals,
    activeDeals,
    exitedDeals,
    totalValue,
    totalCommitted,
    totalCalled,
    totalDistributed,
    totalGains,
    portfolioIRR,
    portfolioMOIC,
  };
}