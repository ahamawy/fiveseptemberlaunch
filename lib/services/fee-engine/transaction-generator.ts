// Transaction Generator - Create and update transactions with fees

import { SupabaseDirectClient } from '@/lib/db/supabase/client';
import { SchemaConfig } from '@/lib/db/schema-manager/config';
import { FeeCalculator } from './calculator';
import { feeService } from './fee-service';
import { FeeCalculationResult, TransactionFeeContext, DealType } from './types';

export interface TransactionInput {
  deal_id: number;
  investor_id: number;
  transaction_date: Date;
  units: number;
  unit_price: number;
  gross_capital?: number;
  transaction_type?: 'SUBSCRIPTION' | 'REDEMPTION' | 'TRANSFER';
  notes?: string;
}

export interface TransactionOutput {
  transaction_id: number;
  deal_id: number;
  investor_id: number;
  gross_capital: number;
  total_fees: number;
  net_capital: number;
  fee_breakdown: FeeCalculationResult;
}

export class TransactionGenerator {
  private client: SupabaseDirectClient;
  
  constructor() {
    this.client = new SupabaseDirectClient(new SchemaConfig());
  }
  
  /**
   * Create a new transaction with fee calculations
   */
  async createTransaction(input: TransactionInput): Promise<TransactionOutput> {
    const supabase = this.client.getClient();
    
    // Calculate gross capital if not provided
    const grossCapital = input.gross_capital || (input.units * input.unit_price);
    
    // Get fee profile for the deal
    const profile = await feeService.getOrCreateProfile(input.deal_id);
    
    // Build fee context (before transaction exists)
    const context: TransactionFeeContext = {
      transaction_id: 0, // Will be updated after creation
      deal_id: input.deal_id,
      investor_id: input.investor_id,
      transaction_date: input.transaction_date,
      gross_capital: grossCapital,
      units: input.units,
      unit_price: input.unit_price,
      deal_type: await this.getDealType(input.deal_id)
    };
    
    // Calculate fees
    const calculator = new FeeCalculator(profile);
    const feeResult = calculator.calculate(context);
    
    // Extract fee percentages and amounts
    const feeComponents = this.extractFeeComponents(feeResult);
    
    // Create transaction with calculated fees
    const { data: transaction, error } = await supabase
      .from('transactions')
      .insert({
        deal_id: input.deal_id,
        investor_id: input.investor_id,
        transaction_date: input.transaction_date.toISOString().split('T')[0],
        units: input.units,
        unit_price: input.unit_price,
        gross_capital: grossCapital,
        initial_net_capital: feeResult.net_amount,
        management_fee_percent: feeComponents.management_percent,
        performance_fee_percent: feeComponents.performance_percent,
        structuring_fee_percent: feeComponents.structuring_percent,
        premium_fee_percent: feeComponents.premium_percent,
        admin_fee: feeComponents.admin_amount,
        nominee: false,
        term_sheet: input.notes
      })
      .select()
      .single();
    
    if (error || !transaction) {
      throw new Error(`Failed to create transaction: ${error?.message}`);
    }
    
    // Update fee result with actual transaction ID
    feeResult.transaction_id = transaction.transaction_id;
    
    // Store fee application records
    await this.storeFeeRecords(transaction.transaction_id, feeResult);
    
    return {
      transaction_id: transaction.transaction_id,
      deal_id: transaction.deal_id,
      investor_id: transaction.investor_id,
      gross_capital: grossCapital,
      total_fees: feeResult.total_fees,
      net_capital: feeResult.net_amount,
      fee_breakdown: feeResult
    };
  }
  
  /**
   * Update existing transaction with recalculated fees
   */
  async updateTransactionFees(transactionId: number): Promise<TransactionOutput> {
    const supabase = this.client.getClient();
    
    // Get existing transaction
    const { data: transaction, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('transaction_id', transactionId)
      .single();
    
    if (error || !transaction) {
      throw new Error(`Transaction ${transactionId} not found`);
    }
    
    // Recalculate fees
    const feeResult = await feeService.calculateTransactionFees(transactionId);
    
    // Extract fee components
    const feeComponents = this.extractFeeComponents(feeResult);
    
    // Update transaction
    await supabase
      .from('transactions')
      .update({
        initial_net_capital: feeResult.net_amount,
        management_fee_percent: feeComponents.management_percent,
        performance_fee_percent: feeComponents.performance_percent,
        structuring_fee_percent: feeComponents.structuring_percent,
        premium_fee_percent: feeComponents.premium_percent,
        admin_fee: feeComponents.admin_amount
      })
      .eq('transaction_id', transactionId);
    
    // Update fee records
    await this.storeFeeRecords(transactionId, feeResult);
    
    return {
      transaction_id: transactionId,
      deal_id: transaction.deal_id,
      investor_id: transaction.investor_id,
      gross_capital: parseFloat(transaction.gross_capital),
      total_fees: feeResult.total_fees,
      net_capital: feeResult.net_amount,
      fee_breakdown: feeResult
    };
  }
  
  /**
   * Bulk create transactions from CSV or data array
   */
  async bulkCreateTransactions(
    inputs: TransactionInput[],
    options: { 
      validateOnly?: boolean; 
      stopOnError?: boolean;
    } = {}
  ): Promise<{
    success: boolean;
    created: number;
    failed: number;
    results: (TransactionOutput | { error: string })[];
  }> {
    const results: (TransactionOutput | { error: string })[] = [];
    let created = 0;
    let failed = 0;
    
    for (const input of inputs) {
      try {
        if (options.validateOnly) {
          // Just validate without creating
          const grossCapital = input.gross_capital || (input.units * input.unit_price);
          const profile = await feeService.getOrCreateProfile(input.deal_id);
          const context: TransactionFeeContext = {
            transaction_id: 0,
            deal_id: input.deal_id,
            investor_id: input.investor_id,
            transaction_date: input.transaction_date,
            gross_capital: grossCapital,
            units: input.units,
            unit_price: input.unit_price,
            deal_type: await this.getDealType(input.deal_id)
          };
          
          const calculator = new FeeCalculator(profile);
          const feeResult = calculator.calculate(context);
          
          results.push({
            transaction_id: 0,
            deal_id: input.deal_id,
            investor_id: input.investor_id,
            gross_capital: grossCapital,
            total_fees: feeResult.total_fees,
            net_capital: feeResult.net_amount,
            fee_breakdown: feeResult
          });
        } else {
          // Actually create transaction
          const output = await this.createTransaction(input);
          results.push(output);
          created++;
        }
      } catch (e: any) {
        results.push({ error: e.message });
        failed++;
        
        if (options.stopOnError) {
          break;
        }
      }
    }
    
    return {
      success: failed === 0,
      created,
      failed,
      results
    };
  }
  
  /**
   * Extract fee components from calculation result
   */
  private extractFeeComponents(result: FeeCalculationResult): {
    management_percent: number;
    performance_percent: number;
    structuring_percent: number;
    premium_percent: number;
    admin_amount: number;
  } {
    const components = {
      management_percent: 0,
      performance_percent: 0,
      structuring_percent: 0,
      premium_percent: 0,
      admin_amount: 0
    };
    
    for (const item of result.components) {
      switch (item.component) {
        case 'MANAGEMENT':
          components.management_percent = item.rate * 100; // Convert to percentage
          break;
        case 'PERFORMANCE':
          components.performance_percent = item.rate * 100;
          break;
        case 'STRUCTURING':
          components.structuring_percent = item.rate * 100;
          break;
        case 'PREMIUM':
          components.premium_percent = item.rate * 100;
          break;
        case 'ADMIN':
          components.admin_amount = item.calculated_amount;
          break;
      }
    }
    
    return components;
  }
  
  /**
   * Store fee application records
   */
  private async storeFeeRecords(
    transactionId: number, 
    feeResult: FeeCalculationResult
  ): Promise<void> {
    const supabase = this.client.getClient();
    
    // Delete existing records
    await supabase
      .from('fee_application_record')
      .delete()
      .eq('transaction_id', transactionId);
    
    // Insert new records
    const records = feeResult.components.map(item => ({
      transaction_id: transactionId,
      deal_id: feeResult.deal_id,
      component: item.component,
      amount: item.calculated_amount,
      percent: item.rate * 100,
      applied: true,
      notes: item.notes || `Calculated using ${feeResult.metadata.profile_used}`
    }));
    
    if (records.length > 0) {
      await supabase
        .from('fee_application_record')
        .insert(records);
    }
  }
  
  /**
   * Get deal type
   */
  private async getDealType(dealId: number): Promise<DealType> {
    const supabase = this.client.getClient();
    
    const { data: deal } = await supabase
      .from('deals_clean')
      .select('deal_category')
      .eq('deal_id', dealId)
      .single();
    
    if (deal?.deal_category) {
      const category = deal.deal_category.toUpperCase();
      if (category.includes('SECONDARY')) return 'SECONDARY';
      if (category.includes('ADVISORY')) return 'ADVISORY';
      if (category.includes('COINVEST')) return 'COINVEST';
      if (category.includes('FUND')) return 'FUND';
    }
    
    return 'PRIMARY';
  }
  
  /**
   * Generate transaction preview without creating
   */
  async previewTransaction(input: TransactionInput): Promise<TransactionOutput> {
    const grossCapital = input.gross_capital || (input.units * input.unit_price);
    const profile = await feeService.getOrCreateProfile(input.deal_id);
    
    const context: TransactionFeeContext = {
      transaction_id: 0,
      deal_id: input.deal_id,
      investor_id: input.investor_id,
      transaction_date: input.transaction_date,
      gross_capital: grossCapital,
      units: input.units,
      unit_price: input.unit_price,
      deal_type: await this.getDealType(input.deal_id)
    };
    
    const calculator = new FeeCalculator(profile);
    const feeResult = calculator.calculate(context);
    
    return {
      transaction_id: 0,
      deal_id: input.deal_id,
      investor_id: input.investor_id,
      gross_capital: grossCapital,
      total_fees: feeResult.total_fees,
      net_capital: feeResult.net_amount,
      fee_breakdown: feeResult
    };
  }
}

// Export singleton instance
export const transactionGenerator = new TransactionGenerator();