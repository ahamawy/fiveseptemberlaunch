// Fee Service - Main orchestration layer

import { SupabaseDirectClient } from '@/lib/db/supabase/client';
import { SchemaConfig } from '@/lib/db/schema-manager/config';
import { FeeCalculator } from './calculator';
import { CSVValidator } from './csv-validator';
import {
  FeeProfile,
  TransactionFeeContext,
  FeeCalculationResult,
  CSVImportRow,
  FeeImportResult,
  DealType,
  FeeConfiguration
} from './types';

export class FeeService {
  private client: SupabaseDirectClient;
  
  constructor() {
    this.client = new SupabaseDirectClient(new SchemaConfig());
  }
  
  /**
   * Get or create fee profile for a deal
   */
  async getOrCreateProfile(dealId: number): Promise<FeeProfile> {
    const supabase = this.client.getClient();
    
    // Check for existing profile
    const { data: existing } = await supabase
      .from('fee_schedule_version')
      .select(`
        *,
        fee_calculator_profile!inner(*)
      `)
      .eq('schedule_id', dealId)
      .eq('is_active', true)
      .single();
    
    if (existing?.fee_calculator_profile) {
      return this.mapToFeeProfile(existing.fee_calculator_profile);
    }
    
    // Create default profile based on deal type
    const dealType = await this.getDealType(dealId);
    const defaultConfig = this.getDefaultConfig(dealType);
    
    const { data: profile, error } = await supabase
      .from('fee_calculator_profile')
      .insert({
        name: `Deal ${dealId} Profile`,
        kind: 'MODERN',
        config: defaultConfig
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Create fee schedule version
    await supabase
      .from('fee_schedule_version')
      .insert({
        schedule_id: dealId,
        version: 1,
        calculator_profile_id: profile.id,
        is_active: true
      });
    
    return this.mapToFeeProfile(profile);
  }
  
  /**
   * Calculate fees for a transaction
   */
  async calculateTransactionFees(transactionId: number): Promise<FeeCalculationResult> {
    const supabase = this.client.getClient();
    
    // Get transaction details
    const { data: transaction, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('transaction_id', transactionId)
      .single();
    
    if (error || !transaction) {
      throw new Error(`Transaction ${transactionId} not found`);
    }
    
    // Get fee profile for deal
    const profile = await this.getOrCreateProfile(transaction.deal_id);
    
    // Build context
    const context: TransactionFeeContext = {
      transaction_id: transactionId,
      deal_id: transaction.deal_id,
      investor_id: transaction.investor_id,
      transaction_date: new Date(transaction.transaction_date),
      gross_capital: parseFloat(transaction.gross_capital),
      net_capital: transaction.initial_net_capital ? parseFloat(transaction.initial_net_capital) : undefined,
      units: transaction.units,
      unit_price: parseFloat(transaction.unit_price),
      deal_type: await this.getDealType(transaction.deal_id),
      // TODO: Get NAV and profit from portfolio analytics
      prior_nav: undefined,
      current_nav: undefined,
      profit: undefined
    };
    
    // Calculate fees
    const calculator = new FeeCalculator(profile);
    return calculator.calculate(context);
  }
  
  /**
   * Import fees from CSV
   */
  async importFromCSV(csvContent: string): Promise<FeeImportResult> {
    const validator = new CSVValidator();
    const validation = validator.validateCSV(csvContent);
    
    if (!validation.valid) {
      return {
        success: false,
        imported: 0,
        failed: validation.rows.length,
        errors: validation.errors,
        preview: []
      };
    }
    
    const supabase = this.client.getClient();
    const preview: FeeCalculationResult[] = [];
    let imported = 0;
    let failed = 0;
    
    // Process each row
    for (const row of validation.rows) {
      try {
        // Insert into legacy import table
        await supabase
          .from('fee_legacy_import')
          .insert({
            deal_id: row.deal_id,
            transaction_id: row.transaction_id,
            component: row.component,
            basis: row.basis,
            percent: row.percent,
            amount: row.amount,
            notes: row.notes,
            source_file: row.source_file
          });
        
        imported++;
        
        // Generate preview if transaction exists
        if (row.transaction_id) {
          try {
            const result = await this.calculateTransactionFees(row.transaction_id);
            preview.push(result);
          } catch (e) {
            // Transaction might not exist, skip preview
          }
        }
      } catch (e) {
        failed++;
      }
    }
    
    return {
      success: imported > 0,
      imported,
      failed,
      errors: validation.errors,
      preview
    };
  }
  
  /**
   * Apply imported fees to transactions
   */
  async applyImportedFees(dryRun: boolean = false): Promise<{
    success: boolean;
    applied: number;
    updated: number;
    totalDelta: number;
  }> {
    const supabase = this.client.getClient();
    
    // Get all imported fees
    const { data: imports, error } = await supabase
      .from('fee_legacy_import')
      .select('*');
    
    if (error || !imports) {
      throw new Error('Failed to fetch imported fees');
    }
    
    let applied = 0;
    let updated = 0;
    let totalDelta = 0;
    
    if (!dryRun) {
      for (const imp of imports) {
        if (!imp.transaction_id) continue;
        
        // Check if fee already exists
        const { data: existing } = await supabase
          .from('fee_application_record')
          .select('id, amount')
          .eq('transaction_id', imp.transaction_id)
          .eq('deal_id', imp.deal_id)
          .eq('component', imp.component)
          .single();
        
        if (existing) {
          // Update existing
          await supabase
            .from('fee_application_record')
            .update({
              amount: imp.amount,
              percent: imp.percent,
              notes: imp.notes,
              applied: true,
              updated_at: new Date().toISOString()
            })
            .eq('id', existing.id);
          
          updated++;
          totalDelta += (imp.amount || 0) - (existing.amount || 0);
        } else {
          // Insert new
          await supabase
            .from('fee_application_record')
            .insert({
              transaction_id: imp.transaction_id,
              deal_id: imp.deal_id,
              component: imp.component,
              amount: imp.amount,
              percent: imp.percent,
              notes: imp.notes,
              applied: true
            });
          
          applied++;
          totalDelta += imp.amount || 0;
        }
        
        // Update transaction fee fields
        await this.updateTransactionFees(imp.transaction_id);
      }
      
      // Clear import table
      await supabase
        .from('fee_legacy_import')
        .delete()
        .gte('id', 0);
    }
    
    return {
      success: true,
      applied,
      updated,
      totalDelta
    };
  }
  
  /**
   * Update transaction fee fields based on applied fees
   */
  private async updateTransactionFees(transactionId: number): Promise<void> {
    const supabase = this.client.getClient();
    
    // Get all fees for transaction
    const { data: fees } = await supabase
      .from('fee_application_record')
      .select('component, amount, percent')
      .eq('transaction_id', transactionId)
      .eq('applied', true);
    
    if (!fees) return;
    
    // Aggregate by component
    const feeMap: Record<string, { amount: number; percent: number }> = {};
    
    for (const fee of fees) {
      if (!feeMap[fee.component]) {
        feeMap[fee.component] = { amount: 0, percent: 0 };
      }
      feeMap[fee.component].amount += fee.amount || 0;
      feeMap[fee.component].percent = fee.percent || 0;
    }
    
    // Update transaction
    const updates: any = {};
    
    if (feeMap['MANAGEMENT']) {
      updates.management_fee_percent = feeMap['MANAGEMENT'].percent;
    }
    if (feeMap['PERFORMANCE']) {
      updates.performance_fee_percent = feeMap['PERFORMANCE'].percent;
    }
    if (feeMap['STRUCTURING']) {
      updates.structuring_fee_percent = feeMap['STRUCTURING'].percent;
    }
    if (feeMap['PREMIUM']) {
      updates.premium_fee_percent = feeMap['PREMIUM'].percent;
    }
    if (feeMap['ADMIN']) {
      updates.admin_fee = feeMap['ADMIN'].amount;
    }
    
    // Calculate total fees and net capital
    const totalFees = Object.values(feeMap).reduce((sum, f) => sum + f.amount, 0);
    
    // Get current gross capital
    const { data: tx } = await supabase
      .from('transactions')
      .select('gross_capital')
      .eq('transaction_id', transactionId)
      .single();
    
    if (tx) {
      updates.initial_net_capital = parseFloat(tx.gross_capital) - totalFees;
    }
    
    await supabase
      .from('transactions')
      .update(updates)
      .eq('transaction_id', transactionId);
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
   * Get default configuration for deal type
   */
  private getDefaultConfig(dealType: DealType): FeeConfiguration {
    const baseConfig: FeeConfiguration = {
      tiers: [],
      components: []
    };
    
    switch (dealType) {
      case 'PRIMARY':
        return {
          ...baseConfig,
          tiers: [
            {
              threshold: 0,
              management_fee: 0.02,
              performance_fee: 0.20,
              admin_fee: 0.005,
              structuring_fee: 0.015
            }
          ],
          hurdle_rate: 0.08,
          catch_up: true,
          high_water_mark: true
        };
        
      case 'SECONDARY':
        return {
          ...baseConfig,
          tiers: [
            {
              threshold: 0,
              management_fee: 0.015,
              performance_fee: 0.15,
              admin_fee: 0.005
            }
          ],
          hurdle_rate: 0.06
        };
        
      case 'ADVISORY':
        return {
          ...baseConfig,
          components: [
            {
              component: 'ADVISORY',
              basis: 'GROSS_CAPITAL',
              rate: 0.01,
              is_percent: true,
              precedence: 1,
              applies_to: ['ADVISORY']
            }
          ]
        };
        
      default:
        return baseConfig;
    }
  }
  
  /**
   * Map database profile to FeeProfile type
   */
  private mapToFeeProfile(dbProfile: any): FeeProfile {
    return {
      id: dbProfile.id,
      name: dbProfile.name,
      kind: dbProfile.kind,
      dealType: 'PRIMARY', // Would need to be determined from context
      config: dbProfile.config || this.getDefaultConfig('PRIMARY')
    };
  }
  
  /**
   * Batch calculate fees for multiple transactions
   */
  async batchCalculateFees(transactionIds: number[]): Promise<FeeCalculationResult[]> {
    const results: FeeCalculationResult[] = [];
    
    // Process in batches of 10
    const batchSize = 10;
    for (let i = 0; i < transactionIds.length; i += batchSize) {
      const batch = transactionIds.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(id => this.calculateTransactionFees(id).catch(e => null))
      );
      
      results.push(...batchResults.filter(r => r !== null) as FeeCalculationResult[]);
    }
    
    return results;
  }
}

// Export singleton instance
export const feeService = new FeeService();