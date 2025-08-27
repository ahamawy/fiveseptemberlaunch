/**
 * Formula Engine Service
 * Handles all Net Capital and fee calculations based on deal formula templates
 */

import { getServiceClient } from '@/lib/db/supabase/server-client';

export interface FormulaInput {
  dealId: number;
  transactionId?: number;
  grossCapital: number;
  pmsp?: number;
  isp?: number;
  sfr?: number;
  eup?: number; // Exit Unit Price
  iup?: number; // Initial Unit Price
  timeHorizon?: number; // Years
  structuringFeeDiscountPercent?: number;
  managementFeeDiscountPercent?: number;
  performanceFeeDiscountPercent?: number;
  premiumFeeDiscountPercent?: number;
  otherFees?: number;
}

export interface FormulaOutput {
  netCapital: number;
  structuringFee: number;
  managementFee: number;
  performanceFee: number;
  premiumFee: number;
  adminFee: number;
  otherFees: number;
  totalFees: number;
  investorProceeds: number;
  calculationMethod: string;
  formulaUsed: string;
  calculationSteps: any;
}

export class FormulaEngineService {
  private supabase = getServiceClient();

  /**
   * Calculate Net Capital and all fees based on deal template
   */
  async calculateForDeal(input: FormulaInput): Promise<FormulaOutput> {
    // Get deal configuration
    const { data: deal } = await this.supabase
      .from('deals_clean')
      .select('*')
      .eq('deal_id', input.dealId)
      .single();

    if (!deal) {
      throw new Error(`Deal ${input.dealId} not found`);
    }

    // Get formula template
    const { data: template } = await this.supabase
      .from('formula_templates')
      .select('*')
      .eq('template_name', deal.formula_template)
      .single();

    if (!template) {
      throw new Error(`Template ${deal.formula_template} not found`);
    }

    // Calculate based on template
    const result = this.calculateByTemplate(
      template.template_name,
      deal,
      input
    );

    // Log calculation for audit
    await this.logCalculation(input, result, deal, template);

    return result;
  }

  /**
   * Calculate based on specific template
   */
  private calculateByTemplate(
    templateName: string,
    deal: any,
    input: FormulaInput
  ): FormulaOutput {
    const gc = input.grossCapital;
    let nc = gc; // Default
    let calculationSteps: any = {};

    // Calculate Net Capital based on template
    switch (templateName) {
      case 'standard':
        nc = gc;
        calculationSteps.nc = `GC = ${gc}`;
        break;

      case 'impossible':
      case 'spacex2':
        // NC = GC × (PMSP/ISP)
        if (input.pmsp && input.isp && input.isp > 0) {
          nc = gc * (input.pmsp / input.isp);
          calculationSteps.nc = `GC × (PMSP/ISP) = ${gc} × (${input.pmsp}/${input.isp}) = ${nc}`;
        }
        break;

      case 'reddit':
      case 'newheights':
      case 'scout':
      case 'egypt':
        // NC = GC (direct)
        nc = gc;
        calculationSteps.nc = `GC = ${gc}`;
        break;

      case 'openai':
        // NC = (GC × (1 - SFR)) × (PMSP/ISP)
        if (input.sfr !== undefined && input.pmsp && input.isp && input.isp > 0) {
          nc = (gc * (1 - input.sfr)) * (input.pmsp / input.isp);
          calculationSteps.nc = `(GC × (1 - SFR)) × (PMSP/ISP) = (${gc} × ${1 - input.sfr}) × (${input.pmsp}/${input.isp}) = ${nc}`;
        }
        break;

      case 'figure':
        // NC = GC × (1 - SFR)
        if (input.sfr !== undefined) {
          nc = gc * (1 - input.sfr);
          calculationSteps.nc = `GC × (1 - SFR) = ${gc} × ${1 - input.sfr} = ${nc}`;
        }
        break;

      case 'spacex1':
        // NC = GC / (1 + SFR)
        if (input.sfr !== undefined) {
          nc = gc / (1 + input.sfr);
          calculationSteps.nc = `GC / (1 + SFR) = ${gc} / ${1 + input.sfr} = ${nc}`;
        }
        break;
    }

    // Calculate fees
    const fees = this.calculateFees(deal, input, nc, gc, templateName);
    calculationSteps.fees = fees.steps;

    return {
      netCapital: nc,
      structuringFee: fees.structuringFee,
      managementFee: fees.managementFee,
      performanceFee: fees.performanceFee,
      premiumFee: fees.premiumFee,
      adminFee: fees.adminFee,
      otherFees: fees.otherFees,
      totalFees: fees.total,
      investorProceeds: nc - fees.total,
      calculationMethod: deal.nc_calculation_method,
      formulaUsed: templateName,
      calculationSteps
    };
  }

  /**
   * Calculate all fees
   */
  private calculateFees(
    deal: any,
    input: FormulaInput,
    nc: number,
    gc: number,
    templateName: string
  ): any {
    const steps: any = {};
    
    // Determine fee base (GC or NC)
    const feeBase = deal.fee_base_capital === 'NC' ? nc : gc;
    
    // Structuring Fee
    const structuringPercent = parseFloat(deal.eq_deal_structuring_fee_percent || 0);
    const structuringDiscount = input.structuringFeeDiscountPercent || 0;
    const structuringFee = feeBase * (structuringPercent / 100) * (1 - structuringDiscount / 100);
    steps.structuring = `${feeBase} × ${structuringPercent}% × ${1 - structuringDiscount/100} = ${structuringFee}`;

    // Management Fee
    let managementFee = 0;
    const timeHorizon = input.timeHorizon || 1;
    
    if (deal.management_fee_tier_1_percent && deal.management_fee_tier_2_percent) {
      // Tiered management fee (OpenAI, SpaceX1)
      const tier1Period = deal.tier_1_period || 1;
      const mfr1 = parseFloat(deal.management_fee_tier_1_percent);
      const mfr2 = parseFloat(deal.management_fee_tier_2_percent);
      const mgmtDiscount = input.managementFeeDiscountPercent || 0;
      
      if (timeHorizon <= tier1Period) {
        managementFee = feeBase * (mfr1 / 100) * timeHorizon * (1 - mgmtDiscount / 100);
      } else {
        managementFee = feeBase * (
          (mfr1 / 100) * tier1Period +
          (mfr2 / 100) * (timeHorizon - tier1Period)
        ) * (1 - mgmtDiscount / 100);
      }
      steps.management = `Tiered: ${managementFee}`;
    } else {
      // Simple management fee
      const mgmtPercent = parseFloat(deal.eq_deal_annual_management_fee_percent || 0);
      const mgmtDiscount = input.managementFeeDiscountPercent || 0;
      managementFee = feeBase * (mgmtPercent / 100) * timeHorizon * (1 - mgmtDiscount / 100);
      steps.management = `${feeBase} × ${mgmtPercent}% × ${timeHorizon}y × ${1 - mgmtDiscount/100} = ${managementFee}`;
    }

    // Performance Fee (on gains)
    const perfPercent = parseFloat(deal.eq_performance_fee_percent || 0);
    const perfDiscount = input.performanceFeeDiscountPercent || 0;
    const eup = input.eup || 1;
    const iup = input.iup || 1;
    const gains = Math.max(0, (nc * (eup / iup)) - nc);
    const performanceFee = gains * (perfPercent / 100) * (1 - perfDiscount / 100);
    steps.performance = `${gains} × ${perfPercent}% × ${1 - perfDiscount/100} = ${performanceFee}`;

    // Premium Fee
    const premiumPercent = parseFloat(deal.eq_deal_premium_fee_percent || 0);
    const premiumDiscount = input.premiumFeeDiscountPercent || 0;
    const premiumFee = feeBase * (premiumPercent / 100) * (1 - premiumDiscount / 100);
    steps.premium = `${feeBase} × ${premiumPercent}% × ${1 - premiumDiscount/100} = ${premiumFee}`;

    // Admin Fee (fixed)
    const adminFee = parseFloat(deal.eq_admin_fee || 0);
    steps.admin = `Fixed: ${adminFee}`;

    // Other Fees (Reddit specific)
    const otherFees = deal.other_fees_allowed ? (input.otherFees || 0) : 0;
    steps.other = `${otherFees}`;

    const total = structuringFee + managementFee + performanceFee + premiumFee + adminFee + otherFees;

    return {
      structuringFee,
      managementFee,
      performanceFee,
      premiumFee,
      adminFee,
      otherFees,
      total,
      steps
    };
  }

  /**
   * Log calculation for audit trail
   */
  private async logCalculation(
    input: FormulaInput,
    output: FormulaOutput,
    deal: any,
    template: any
  ) {
    try {
      await this.supabase.from('formula_calculation_log').insert({
        transaction_id: input.transactionId,
        deal_id: input.dealId,
        formula_template_id: template.id,
        calculation_type: 'net_capital',
        input_values: input,
        output_values: output,
        calculation_steps: output.calculationSteps,
        calculated_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to log calculation:', error);
    }
  }

  /**
   * Validate all transactions for a deal
   */
  async validateDealTransactions(dealId: number) {
    const { data: transactions } = await this.supabase
      .from('transactions_clean')
      .select('*')
      .eq('deal_id', dealId)
      .eq('transaction_type', 'primary');

    const validationResults = [];
    
    for (const transaction of transactions || []) {
      const input: FormulaInput = {
        dealId,
        transactionId: transaction.transaction_id,
        grossCapital: parseFloat(transaction.gross_capital),
        pmsp: transaction.pmsp ? parseFloat(transaction.pmsp) : undefined,
        isp: transaction.isp ? parseFloat(transaction.isp) : undefined,
        sfr: transaction.sfr ? parseFloat(transaction.sfr) : undefined,
        structuringFeeDiscountPercent: transaction.structuring_fee_discount_percent,
        managementFeeDiscountPercent: transaction.management_fee_discount_percent,
        performanceFeeDiscountPercent: transaction.performance_fee_discount_percent,
        premiumFeeDiscountPercent: transaction.premium_fee_discount_percent,
        otherFees: transaction.other_fees
      };

      const calculated = await this.calculateForDeal(input);
      const stored = parseFloat(transaction.initial_net_capital);
      const difference = Math.abs(calculated.netCapital - stored);
      const percentDiff = (difference / stored) * 100;

      validationResults.push({
        transactionId: transaction.transaction_id,
        grossCapital: input.grossCapital,
        storedNC: stored,
        calculatedNC: calculated.netCapital,
        difference,
        percentDiff,
        status: percentDiff < 1 ? 'PASS' : percentDiff < 5 ? 'WARN' : 'FAIL',
        formula: calculated.formulaUsed,
        calculationSteps: calculated.calculationSteps
      });
    }

    return validationResults;
  }

  /**
   * Recalculate and update all NC values for a deal
   */
  async recalculateDeal(dealId: number) {
    const validationResults = await this.validateDealTransactions(dealId);
    const updates = [];

    for (const result of validationResults) {
      if (result.status === 'FAIL' || result.status === 'WARN') {
        updates.push({
          transaction_id: result.transactionId,
          initial_net_capital: result.calculatedNC
        });
      }
    }

    // Batch update transactions
    for (const update of updates) {
      await this.supabase
        .from('transactions_clean')
        .update({ initial_net_capital: update.initial_net_capital })
        .eq('transaction_id', update.transaction_id);
    }

    return {
      dealId,
      totalTransactions: validationResults.length,
      updated: updates.length,
      results: validationResults
    };
  }
}

export const formulaEngine = new FormulaEngineService();