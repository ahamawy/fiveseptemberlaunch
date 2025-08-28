/**
 * Formula Validation Service
 * 
 * This service validates fee calculations across all transactions
 * and ensures consistency with the Fee Calculation Bible
 */

import { getServiceClient } from '@/lib/db/supabase/server-client';

export interface ValidationResult {
  transaction_id: number;
  deal_name: string;
  formula_template: string;
  gross_capital: number;
  stored_nc: number;
  calculated_nc: number;
  discrepancy: number;
  discrepancy_pct: number;
  validation_status: 'valid' | 'warning' | 'error';
  message?: string;
}

export interface ValidationSummary {
  total_transactions: number;
  validated_count: number;
  valid_count: number;
  warning_count: number;
  error_count: number;
  total_discrepancy: number;
  average_discrepancy_pct: number;
}

export class FormulaValidationService {
  private supabase = getServiceClient();

  /**
   * Validate all transactions and log results
   */
  async validateAllTransactions(): Promise<ValidationSummary> {
    console.log('🔍 Starting formula validation for all transactions...');

    // Get all primary transactions with deal info
    const { data: transactions, error } = await this.supabase
      .from('transactions_clean')
      .select(`
        *,
        deals_clean (
          deal_id,
          deal_name,
          formula_template,
          nc_calculation_method,
          fee_base_capital,
          eq_deal_structuring_fee_percent,
          eq_deal_annual_management_fee_percent,
          eq_performance_fee_percent
        )
      `)
      .eq('transaction_type', 'primary')
      .not('gross_capital', 'is', null)
      .not('initial_net_capital', 'is', null)
      .order('transaction_id');

    if (error) {
      console.error('❌ Error fetching transactions:', error);
      throw error;
    }

    console.log(`📊 Found ${transactions?.length || 0} transactions to validate`);

    const validationResults: ValidationResult[] = [];
    let validCount = 0;
    let warningCount = 0;
    let errorCount = 0;
    let totalDiscrepancy = 0;

    for (const tx of transactions || []) {
      const deal = tx.deals_clean;
      if (!deal) continue;

      // Calculate what NC should be based on the formula
      const calculated = await this.calculateNetCapital(tx, deal);
      
      // Compare with stored value
      const discrepancy = Math.abs((tx.initial_net_capital || 0) - calculated);
      const discrepancyPct = tx.gross_capital > 0 
        ? (discrepancy / tx.gross_capital) * 100 
        : 0;

      // Determine validation status
      let status: 'valid' | 'warning' | 'error' = 'valid';
      let message = '';

      if (discrepancyPct > 5) {
        status = 'error';
        message = `Large discrepancy detected (${discrepancyPct.toFixed(2)}%)`;
        errorCount++;
      } else if (discrepancyPct > 1) {
        status = 'warning';
        message = `Minor discrepancy detected (${discrepancyPct.toFixed(2)}%)`;
        warningCount++;
      } else {
        validCount++;
      }

      totalDiscrepancy += discrepancy;

      // Log to formula_calculation_log
      await this.logCalculation(tx, deal, calculated, discrepancy, status);

      validationResults.push({
        transaction_id: tx.transaction_id,
        deal_name: deal.deal_name,
        formula_template: deal.formula_template || 'standard',
        gross_capital: tx.gross_capital,
        stored_nc: tx.initial_net_capital,
        calculated_nc: calculated,
        discrepancy,
        discrepancy_pct: discrepancyPct,
        validation_status: status,
        message
      });
    }

    const summary: ValidationSummary = {
      total_transactions: transactions?.length || 0,
      validated_count: validationResults.length,
      valid_count: validCount,
      warning_count: warningCount,
      error_count: errorCount,
      total_discrepancy: totalDiscrepancy,
      average_discrepancy_pct: validationResults.length > 0
        ? validationResults.reduce((sum, r) => sum + r.discrepancy_pct, 0) / validationResults.length
        : 0
    };

    console.log('✅ Validation complete:', summary);
    return summary;
  }

  /**
   * Calculate net capital based on deal formula
   */
  private async calculateNetCapital(transaction: any, deal: any): Promise<number> {
    const grossCapital = transaction.gross_capital || 0;
    
    // Get the actual structuring fee percentage from the deal
    const structuringFeePercent = parseFloat(deal.eq_deal_structuring_fee_percent || '0') / 100;
    
    // Build variables for calculation
    const variables = {
      sfr: structuringFeePercent, // Use actual deal structuring fee, not default
      pmsp: transaction.pmsp || 0,
      isp: transaction.isp || 1,
      admin_fee: transaction.admin_fee || 0,
      other_fees: transaction.other_fees || 0
    };

    // Call the database function
    const { data, error } = await this.supabase.rpc('calculate_net_capital', {
      p_gross_capital: grossCapital,
      p_formula_method: deal.nc_calculation_method || 'standard',
      p_variables: variables
    });

    if (error) {
      console.error('Error calculating NC:', error);
      return grossCapital; // Fallback to gross capital
    }

    return data || grossCapital;
  }

  /**
   * Log calculation to audit trail
   */
  private async logCalculation(
    transaction: any,
    deal: any,
    calculatedNc: number,
    discrepancy: number,
    status: 'valid' | 'warning' | 'error'
  ): Promise<void> {
    const inputVariables = {
      GC: transaction.gross_capital,
      sfr: parseFloat(deal.eq_deal_structuring_fee_percent || '0') / 100,
      pmsp: transaction.pmsp || 0,
      isp: transaction.isp || 1,
      admin_fee: transaction.admin_fee || 0,
      management_fee: transaction.management_fee_amount || 0,
      structuring_fee: transaction.structuring_fee_amount || 0,
      premium: transaction.premium_amount || 0,
      other_fees: transaction.other_fees || 0
    };

    const outputResults = {
      stored_nc: transaction.initial_net_capital,
      calculated_nc: calculatedNc,
      discrepancy: discrepancy,
      discrepancy_pct: transaction.gross_capital > 0 
        ? (discrepancy / transaction.gross_capital) * 100 
        : 0,
      total_fees: (transaction.admin_fee || 0) + 
                  (transaction.management_fee_amount || 0) + 
                  (transaction.structuring_fee_amount || 0) + 
                  (transaction.premium_amount || 0) + 
                  (transaction.other_fees || 0),
      units: transaction.units
    };

    const calculationSteps = [
      {
        step: 1,
        operation: 'get_gross_capital',
        value: transaction.gross_capital
      },
      {
        step: 2,
        operation: 'apply_formula',
        formula: deal.nc_calculation_method,
        result: calculatedNc
      },
      {
        step: 3,
        operation: 'compare_stored',
        stored: transaction.initial_net_capital,
        calculated: calculatedNc,
        discrepancy: discrepancy
      }
    ];

    const { error } = await this.supabase
      .from('formula_calculation_log')
      .insert({
        transaction_id: transaction.transaction_id,
        deal_id: deal.deal_id,
        investor_id: transaction.investor_id,
        formula_template: deal.formula_template || 'standard',
        nc_calculation_method: deal.nc_calculation_method || 'standard',
        fee_base_capital: deal.fee_base_capital || 'GC',
        input_variables: inputVariables,
        calculation_steps: calculationSteps,
        output_results: outputResults,
        validation_status: status,
        validation_messages: status !== 'valid' 
          ? [`Discrepancy: ${discrepancy.toFixed(2)} (${(discrepancy / transaction.gross_capital * 100).toFixed(2)}%)`]
          : null,
        discrepancy_amount: discrepancy,
        calculation_version: '2.0.0'
      });

    if (error) {
      console.error('Error logging calculation:', error);
    }
  }

  /**
   * Get validation summary statistics
   */
  async getValidationStats(): Promise<any> {
    const { data, error } = await this.supabase
      .from('formula_calculation_log')
      .select(`
        validation_status,
        count
      `)
      .select();

    if (error) {
      console.error('Error getting validation stats:', error);
      return null;
    }

    const stats = {
      total: 0,
      valid: 0,
      warning: 0,
      error: 0
    };

    data?.forEach(row => {
      stats.total++;
      if (row.validation_status === 'valid') stats.valid++;
      else if (row.validation_status === 'warning') stats.warning++;
      else if (row.validation_status === 'error') stats.error++;
    });

    return stats;
  }

  /**
   * Get transactions with discrepancies
   */
  async getDiscrepancies(threshold: number = 1): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('formula_calculation_log')
      .select(`
        *,
        transactions_clean (
          transaction_id,
          gross_capital,
          initial_net_capital,
          transaction_date
        ),
        deals_clean (
          deal_name,
          formula_template
        )
      `)
      .gt('discrepancy_amount', threshold)
      .order('discrepancy_amount', { ascending: false });

    if (error) {
      console.error('Error getting discrepancies:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Recalculate and update a specific transaction
   */
  async recalculateTransaction(transactionId: number): Promise<ValidationResult | null> {
    const { data: tx, error } = await this.supabase
      .from('transactions_clean')
      .select(`
        *,
        deals_clean (*)
      `)
      .eq('transaction_id', transactionId)
      .single();

    if (error || !tx) {
      console.error('Error fetching transaction:', error);
      return null;
    }

    const deal = tx.deals_clean;
    const calculated = await this.calculateNetCapital(tx, deal);
    
    // Update the transaction with calculated values
    const { error: updateError } = await this.supabase
      .from('transactions_clean')
      .update({
        net_capital_calculated: calculated,
        total_fees_calculated: tx.gross_capital - calculated,
        formula_version: '2.0.0',
        last_calculated_at: new Date().toISOString()
      })
      .eq('transaction_id', transactionId);

    if (updateError) {
      console.error('Error updating transaction:', updateError);
    }

    const discrepancy = Math.abs((tx.initial_net_capital || 0) - calculated);
    const discrepancyPct = tx.gross_capital > 0 
      ? (discrepancy / tx.gross_capital) * 100 
      : 0;

    return {
      transaction_id: transactionId,
      deal_name: deal.deal_name,
      formula_template: deal.formula_template || 'standard',
      gross_capital: tx.gross_capital,
      stored_nc: tx.initial_net_capital,
      calculated_nc: calculated,
      discrepancy,
      discrepancy_pct: discrepancyPct,
      validation_status: discrepancyPct > 5 ? 'error' : discrepancyPct > 1 ? 'warning' : 'valid'
    };
  }
}

// Export singleton instance
export const formulaValidation = new FormulaValidationService();