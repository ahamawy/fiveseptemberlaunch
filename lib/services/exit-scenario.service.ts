import { getServiceClient } from '@/lib/db/supabase/server-client';
import { getPortfolioClient } from '@/lib/db/supabase/schema';
import {
  getActivePositionsByDeal,
  getInvestorPositionsForDeal,
  saveExitScenario,
  saveScenarioFeeProjections
} from '@/lib/db/repositories/portfolio.repo';
import { getCompaniesByIds, getInvestorsByIds } from '@/lib/db/repositories/public.repo';

export interface ExitScenarioInput {
  dealId: number;
  exitMultiple: number; // 2x, 3x, 5x, 10x
  exitYear?: number; // Years from now
  scenarioName?: string;
}

export interface InvestorReturn {
  investorId: number;
  investorName: string;
  invested: number;
  grossReturn: number;
  totalFees: number;
  netReturn: number;
  irr: number;
  moic: number;
}

export interface CompanyExitValue {
  companyId: number;
  companyName: string;
  sharesOwned: number;
  entrySharePrice: number;
  exitSharePrice: number;
  costBasis: number;
  exitValue: number;
  gain: number;
  companyMoic: number;
}

export interface ExitScenarioResult {
  dealId: number;
  dealName: string;
  exitMultiple: number;
  exitYear: number;
  totalInvested: number;
  grossExitValue: number;
  grossProfit: number;
  companyExitValues: CompanyExitValue[]; // New: breakdown by company
  fees: {
    structuringFee: number;
    managementFees: number;
    performanceFee: number;
    adminFees: number;
    totalFees: number;
  };
  netExitValue: number;
  investorReturns: InvestorReturn[];
  equitieTake: {
    totalFeesEarned: number;
    carryAmount: number;
    managementFeesTotal: number;
    effectiveFeeRate: number; // As % of gross exit value
  };
  metrics: {
    grossIrr: number;
    netIrr: number;
    grossMoic: number;
    netMoic: number;
  };
}

export class ExitScenarioService {
  private supabase = getServiceClient();
  private p = getPortfolioClient(this.supabase);

  /**
   * Model an exit scenario for a deal with multiple company positions
   */
  async modelExitScenario(input: ExitScenarioInput): Promise<ExitScenarioResult> {
    const { dealId, exitMultiple, exitYear = 5, scenarioName = `${exitMultiple}x Exit` } = input;

    // Get deal details with formula configuration
    const { data: deal, error: dealError } = await this.supabase
      .from('deals_clean')
      .select('*')
      .eq('deal_id', dealId)
      .single();

    if (dealError || !deal) {
      throw new Error(`Deal ${dealId} not found`);
    }

    // Get all company positions for this deal
    const companyPositions = await getActivePositionsByDeal(this.p, dealId);

    // Batch company names
    type CompanyPosRow = { company_id: number; shares_owned: number; purchase_price_per_share: number; cost_basis: number; position_status?: string };
    const posRows: CompanyPosRow[] = (companyPositions || []) as CompanyPosRow[];
    const companyIds = [...new Set(posRows.map((p) => p.company_id))];
    const companyMapRaw = await getCompaniesByIds(this.supabase, companyIds);
    const companyMap = new Map<number, string>();
    for (const [id, c] of companyMapRaw.entries()) companyMap.set(id, c.company_name);

    // Calculate exit values for each company position
    const companyExitValues: CompanyExitValue[] = [];
    let totalInvested = 0;
    let grossExitValue = 0;

    for (const position of posRows) {
      const costBasis = Number(position.cost_basis);
      const exitValue = costBasis * exitMultiple;
      const gain = exitValue - costBasis;
      
      totalInvested += costBasis;
      grossExitValue += exitValue;

      companyExitValues.push({
        companyId: position.company_id,
        companyName: companyMap.get(position.company_id) || 'Unknown',
        sharesOwned: Number(position.shares_owned),
        entrySharePrice: Number(position.purchase_price_per_share),
        exitSharePrice: Number(position.purchase_price_per_share) * exitMultiple,
        costBasis,
        exitValue,
        gain,
        companyMoic: exitMultiple
      });
    }

    const grossProfit = grossExitValue - totalInvested;

    // Get all investor positions for this deal
    const positions = await getInvestorPositionsForDeal(this.p, dealId);

    // Calculate fees based on deal configuration
    const fees = await this.calculateExitFees(deal, totalInvested, grossExitValue, exitYear);
    const netExitValue = grossExitValue - fees.totalFees;

    // Calculate returns for each investor
    const investorReturns = await this.calculateInvestorReturns(
      positions || [],
      exitMultiple,
      fees,
      exitYear
    );

    // Calculate overall metrics
    const metrics = this.calculateMetrics(
      totalInvested,
      grossExitValue,
      netExitValue,
      exitYear
    );

    // Save scenario to database
    const savedScenario = await saveExitScenario(this.p, {
      deal_id: dealId,
      scenario_name: scenarioName,
      exit_multiple: exitMultiple,
      exit_year: exitYear,
      gross_exit_value: grossExitValue,
      total_fees: fees.totalFees,
      net_exit_value: netExitValue,
      irr: metrics.netIrr,
      moic: metrics.netMoic
    });

    // Save fee breakdown
    if (savedScenario) {
      await saveScenarioFeeProjections(this.p, savedScenario.scenario_id, fees);
    }

    return {
      dealId,
      dealName: deal.deal_name,
      exitMultiple,
      exitYear,
      totalInvested,
      grossExitValue,
      grossProfit,
      companyExitValues, // Include company breakdown
      fees,
      netExitValue,
      investorReturns,
      equitieTake: {
        totalFeesEarned: fees.totalFees,
        carryAmount: fees.performanceFee,
        managementFeesTotal: fees.managementFees,
        effectiveFeeRate: (fees.totalFees / grossExitValue) * 100
      },
      metrics
    };
  }

  /**
   * Calculate all fees for an exit scenario
   */
  private async calculateExitFees(
    deal: any,
    totalInvested: number,
    grossExitValue: number,
    years: number
  ) {
    // Structuring fee (one-time, already paid but affects net capital)
    const structuringFeeRate = Number(deal.eq_deal_structuring_fee_percent || 0) / 100;
    const structuringFee = totalInvested * structuringFeeRate;

    // Management fees (annual, accumulated over holding period)
    const mgmtFeeRate = Number(
      deal.management_fee_tier_1_percent || 
      deal.eq_deal_annual_management_fee_percent || 
      0
    ) / 100;
    const managementFees = totalInvested * mgmtFeeRate * years;

    // Admin fees (annual)
    const adminFeePerYear = Number(deal.eq_admin_fee || 0);
    const adminFees = adminFeePerYear * years;

    // Performance fee / Carried interest (on profit)
    const carryRate = Number(deal.eq_performance_fee_percent || 20) / 100;
    const grossProfit = grossExitValue - totalInvested;
    const performanceFee = grossProfit > 0 ? grossProfit * carryRate : 0;

    const totalFees = structuringFee + managementFees + adminFees + performanceFee;

    return {
      structuringFee,
      managementFees,
      performanceFee,
      adminFees,
      totalFees
    };
  }

  /**
   * Calculate returns for each investor
   */
  private async calculateInvestorReturns(
    positions: any[],
    exitMultiple: number,
    fees: any,
    years: number
  ): Promise<InvestorReturn[]> {
    const results: InvestorReturn[] = [];

    const totalInvested = (positions || []).reduce((sum, p) => sum + Number(p.cost_basis), 0);
    const investorIds = [...new Set((positions || []).map(p => p.investor_id))];
    const investorMapRaw = await getInvestorsByIds(this.supabase, investorIds);
    const investorMap = new Map<number, string>();
    for (const [id, inv] of investorMapRaw.entries()) investorMap.set(id, inv.full_name);

    for (const position of positions || []) {
      const invested = Number(position.cost_basis);
      const grossReturn = invested * exitMultiple;
      
      const shareOfTotal = totalInvested > 0 ? invested / totalInvested : 0;
      const allocatedFees = fees.totalFees * shareOfTotal;
      
      const netReturn = grossReturn - allocatedFees;
      const irr = this.calculateIRR(invested, netReturn, years);
      const moic = invested > 0 ? netReturn / invested : 0;

      results.push({
        investorId: position.investor_id,
        investorName: investorMap.get(position.investor_id) || 'Unknown',
        invested,
        grossReturn,
        totalFees: allocatedFees,
        netReturn,
        irr,
        moic
      });
    }
    
    return results;
  }

  /**
   * Calculate IRR using simplified formula
   */
  private calculateIRR(initialInvestment: number, finalValue: number, years: number): number {
    if (initialInvestment <= 0 || years <= 0) return 0;
    
    // IRR = (FV/PV)^(1/n) - 1
    const irr = Math.pow(finalValue / initialInvestment, 1 / years) - 1;
    return irr * 100; // Return as percentage
  }

  /**
   * Calculate overall metrics for the scenario
   */
  private calculateMetrics(
    totalInvested: number,
    grossExitValue: number,
    netExitValue: number,
    years: number
  ) {
    return {
      grossIrr: this.calculateIRR(totalInvested, grossExitValue, years),
      netIrr: this.calculateIRR(totalInvested, netExitValue, years),
      grossMoic: grossExitValue / totalInvested,
      netMoic: netExitValue / totalInvested
    };
  }

  /**
   * Save scenario to database
   */
  // Deprecated: scenario persistence now handled by repository
  private async saveScenario(_scenario: any) {
    throw new Error('Use saveExitScenario repository function');
  }

  /**
   * Save fee projections for a scenario
   */
  // Deprecated: fee projections now handled by repository
  private async saveFeeProjections(_scenarioId: number, _fees: any) {
    throw new Error('Use saveScenarioFeeProjections repository function');
  }

  /**
   * Get all scenarios for a deal
   */
  async getDealScenarios(dealId: number) {
    const { data, error } = await this.supabase
      .from('exit_scenarios')
      .select(`
        *,
        scenario_fee_projections (*)
      `)
      .eq('deal_id', dealId)
      .order('exit_multiple', { ascending: true });

    if (error) {
      throw new Error(`Error fetching scenarios: ${error.message}`);
    }

    return data;
  }

  /**
   * Generate standard scenarios (2x, 3x, 5x, 10x)
   */
  async generateStandardScenarios(dealId: number) {
    const multiples = [2, 3, 5, 10];
    const scenarios = [];

    for (const multiple of multiples) {
      const scenario = await this.modelExitScenario({
        dealId,
        exitMultiple: multiple,
        exitYear: 5,
        scenarioName: `${multiple}x Exit (5 years)`
      });
      scenarios.push(scenario);
    }

    return scenarios;
  }
}

export const exitScenarioService = new ExitScenarioService();