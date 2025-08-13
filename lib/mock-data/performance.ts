import { getCommitmentsByInvestorId } from './deals';
import { getTransactionsByInvestorId } from './transactions';

export interface PerformanceMetrics {
  irr: number;  // Internal Rate of Return (%)
  moic: number; // Multiple on Invested Capital
  dpi: number;  // Distributions to Paid-In
  tvpi: number; // Total Value to Paid-In
  totalCommitted: number;
  totalCalled: number;
  totalDistributed: number;
  unrealizedValue: number;
  realizedGain: number;
  unrealizedGain: number;
}

export interface PortfolioSummary {
  totalValue: number;
  totalCommitted: number;
  totalDistributed: number;
  unrealizedGain: number;
  activeDeals: number;
  totalDeals: number;
}

export function calculatePerformanceMetrics(investorId: number): PerformanceMetrics {
  const commitments = getCommitmentsByInvestorId(investorId);
  const transactions = getTransactionsByInvestorId(investorId);
  
  // Calculate total committed
  const totalCommitted = commitments
    .filter(c => c.status === 'signed')
    .reduce((sum, c) => sum + c.amount, 0);
  
  // Calculate total called (capital calls)
  const totalCalled = transactions
    .filter(t => t.type === 'capital_call' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);
  
  // Calculate total distributed
  const totalDistributed = transactions
    .filter(t => t.type === 'distribution' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);
  
  // Mock unrealized value (typically would come from NAV calculations)
  const unrealizedValue = totalCalled * 1.35; // Assuming 35% unrealized gain
  
  // Calculate realized gain
  const realizedGain = totalDistributed - (totalCalled * (totalDistributed / (totalDistributed + unrealizedValue)));
  
  // Calculate unrealized gain
  const unrealizedGain = unrealizedValue - (totalCalled * (unrealizedValue / (totalDistributed + unrealizedValue)));
  
  // Calculate performance metrics
  const irr = 18.5; // Mock IRR - typically calculated using XIRR formula
  const dpi = totalCalled > 0 ? totalDistributed / totalCalled : 0;
  const rvpi = totalCalled > 0 ? unrealizedValue / totalCalled : 0; // Residual Value to Paid-In
  const tvpi = dpi + rvpi;
  const moic = tvpi; // MOIC equals TVPI in this context
  
  return {
    irr,
    moic,
    dpi,
    tvpi,
    totalCommitted,
    totalCalled,
    totalDistributed,
    unrealizedValue,
    realizedGain,
    unrealizedGain,
  };
}

export function getPortfolioSummary(investorId: number): PortfolioSummary {
  const metrics = calculatePerformanceMetrics(investorId);
  const commitments = getCommitmentsByInvestorId(investorId);
  
  const activeDeals = commitments
    .filter(c => c.status === 'signed')
    .length;
  
  const totalDeals = commitments.length;
  
  const totalValue = metrics.totalDistributed + metrics.unrealizedValue;
  
  return {
    totalValue,
    totalCommitted: metrics.totalCommitted,
    totalDistributed: metrics.totalDistributed,
    unrealizedGain: metrics.unrealizedGain,
    activeDeals,
    totalDeals,
  };
}

export interface HistoricalPerformance {
  date: string;
  nav: number;
  irr: number;
  moic: number;
}

export function getHistoricalPerformance(investorId: number): HistoricalPerformance[] {
  // Mock historical performance data
  const baseNav = 1000000;
  const months = 12;
  const data: HistoricalPerformance[] = [];
  
  for (let i = 0; i < months; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() - (months - i - 1));
    
    // Simulate growth with some volatility
    const growthFactor = 1 + (i * 0.015) + (Math.random() * 0.02 - 0.01);
    const nav = baseNav * growthFactor;
    const irr = 12 + (i * 0.5) + (Math.random() * 2 - 1);
    const moic = 1 + (i * 0.03) + (Math.random() * 0.02 - 0.01);
    
    data.push({
      date: date.toISOString().split('T')[0],
      nav: Math.round(nav),
      irr: Math.round(irr * 10) / 10,
      moic: Math.round(moic * 100) / 100,
    });
  }
  
  return data;
}

export interface DealPerformance {
  dealId: number;
  dealName: string;
  committed: number;
  called: number;
  distributed: number;
  currentValue: number;
  irr: number;
  moic: number;
  status: 'active' | 'exited' | 'written_off';
}

export function getDealPerformance(investorId: number): DealPerformance[] {
  const commitments = getCommitmentsByInvestorId(investorId);
  const transactions = getTransactionsByInvestorId(investorId);
  
  return commitments.map(commitment => {
    const dealTransactions = transactions.filter(t => t.dealId === commitment.dealId);
    
    const called = dealTransactions
      .filter(t => t.type === 'capital_call' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const distributed = dealTransactions
      .filter(t => t.type === 'distribution' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
    
    // Mock current value calculation
    const currentValue = called * (1.2 + Math.random() * 0.4);
    
    // Mock IRR and MOIC per deal
    const irr = 10 + Math.random() * 20;
    const moic = called > 0 ? (distributed + currentValue) / called : 0;
    
    // Determine status based on distributions
    let status: DealPerformance['status'] = 'active';
    if (distributed > called * 1.5) {
      status = 'exited';
    }
    
    return {
      dealId: commitment.dealId,
      dealName: `Deal ${commitment.dealId}`, // Would be replaced with actual deal name
      committed: commitment.amount,
      called,
      distributed,
      currentValue,
      irr: Math.round(irr * 10) / 10,
      moic: Math.round(moic * 100) / 100,
      status,
    };
  });
}