// Enhanced Fee Service - Schema-Accurate Implementation
// Orchestrates fee calculations using exact Supabase schema

import { SupabaseDirectClient } from '@/lib/db/supabase/client';
import { SchemaConfig } from '@/lib/db/schema-manager/config';
import { 
  EnhancedFeeCalculator, 
  FeeCalculationResult,
  DiscountInput,
  FeeScheduleRow,
  FeeApplication
} from './enhanced-calculator';

export interface FeeProfile {
  id: number;
  name: string;
  kind: 'LEGACY' | 'MODERN';
  config: any;
  created_at: Date;
  updated_at: Date;
}

export interface ScheduleVersion {
  id: number;
  schedule_id: number;
  version: number;
  calculator_profile_id?: number;
  effective_at: Date;
  is_active: boolean;
}

export interface ImportPreview {
  deal_id: number;
  transaction_id?: number;
  investor_name?: string;
  gross_capital: number;
  fees: FeeApplication[];
  transferPreDiscount: number;
  totalDiscounts: number;
  transferPostDiscount: number;
  units: number;
  validation: {
    valid: boolean;
    errors: string[];
  };
}

export interface ImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors: string[];
  preview: ImportPreview[];
}

export class EnhancedFeeService {
  private client: SupabaseDirectClient;
  private calculator: EnhancedFeeCalculator;
  
  constructor() {
    this.client = new SupabaseDirectClient(new SchemaConfig());
    this.calculator = new EnhancedFeeCalculator();
  }
  
  /**
   * Create or update fee schedule with proper precedence
   */
  async createFeeSchedule(
    dealId: number,
    components: Array<{
      component: string;
      rate: number;
      is_percent: boolean;
      basis: 'GROSS' | 'NET' | 'NET_AFTER_PREMIUM';
      precedence?: number;
    }>
  ): Promise<FeeScheduleRow[]> {
    const supabase = this.client.getClient();
    
    // Ensure PREMIUM is always first
    const sortedComponents = components.sort((a, b) => {
      if (a.component === 'PREMIUM') return -1;
      if (b.component === 'PREMIUM') return 1;
      return (a.precedence || 99) - (b.precedence || 99);
    });
    
    // Assign precedence if not provided
    const schedule = sortedComponents.map((comp, idx) => ({
      deal_id: dealId,
      component: comp.component,
      rate: comp.rate,
      is_percent: comp.is_percent,
      basis: comp.basis,
      precedence: comp.precedence || idx + 1,
      effective_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    
    // Insert schedule
    const { data, error } = await supabase
      .from('fees.fee_schedule')
      .insert(schedule)
      .select();
    
    if (error) {
      throw new Error(`Failed to create fee schedule: ${error.message}`);
    }
    
    // Create initial version
    if (data && data.length > 0) {
      await this.createScheduleVersion(data[0].schedule_id, true);
    }
    
    return data || [];
  }
  
  /**
   * Create a new version of fee schedule
   */
  async createScheduleVersion(
    scheduleId: number,
    activate: boolean = false
  ): Promise<ScheduleVersion> {
    const supabase = this.client.getClient();
    
    // Get current version
    const { data: current } = await supabase
      .from('fees.schedule_version')
      .select('version')
      .eq('schedule_id', scheduleId)
      .order('version', { ascending: false })
      .limit(1)
      .single();
    
    const newVersion = (current?.version || 0) + 1;
    
    // Deactivate all versions if activating this one
    if (activate) {
      await supabase
        .from('fees.schedule_version')
        .update({ is_active: false })
        .eq('schedule_id', scheduleId);
    }
    
    // Create new version
    const { data, error } = await supabase
      .from('fees.schedule_version')
      .insert({
        schedule_id: scheduleId,
        version: newVersion,
        effective_at: new Date().toISOString(),
        is_active: activate
      })
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to create schedule version: ${error.message}`);
    }
    
    return data;
  }
  
  /**
   * Import fees from CSV with preview
   */
  async importFromCSV(csvContent: string): Promise<ImportResult> {
    const lines = csvContent.trim().split('\n');
    const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
    
    const preview: ImportPreview[] = [];
    const errors: string[] = [];
    let imported = 0;
    let failed = 0;
    
    // Parse CSV rows
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row: any = {};
      
      headers.forEach((header, idx) => {
        row[header] = values[idx];
      });
      
      try {
        // Validate required fields
        if (!row.deal_id || !row.gross_capital) {
          errors.push(`Row ${i}: Missing required fields`);
          failed++;
          continue;
        }
        
        const dealId = parseInt(row.deal_id);
        const grossCapital = parseFloat(row.gross_capital);
        const unitPrice = parseFloat(row.unit_price || '1000');
        
        // Build discounts from CSV
        const discounts: DiscountInput[] = [];
        
        if (row.structuring_discount_percent) {
          discounts.push({
            component: 'STRUCTURING_DISCOUNT',
            percent: parseFloat(row.structuring_discount_percent) / 100
          });
        }
        
        if (row.management_discount_percent) {
          discounts.push({
            component: 'MANAGEMENT_DISCOUNT',
            percent: parseFloat(row.management_discount_percent) / 100
          });
        }
        
        if (row.admin_discount_percent) {
          discounts.push({
            component: 'ADMIN_DISCOUNT',
            percent: parseFloat(row.admin_discount_percent) / 100
          });
        }
        
        // Calculate fees
        const calculation = await this.calculator.preview(
          dealId,
          grossCapital,
          unitPrice,
          { discounts }
        );
        
        // Create preview entry
        preview.push({
          deal_id: dealId,
          transaction_id: row.transaction_id ? parseInt(row.transaction_id) : undefined,
          investor_name: row.investor_name,
          gross_capital: grossCapital,
          fees: calculation.state.appliedFees,
          transferPreDiscount: calculation.transferPreDiscount,
          totalDiscounts: calculation.totalDiscounts,
          transferPostDiscount: calculation.transferPostDiscount,
          units: calculation.units,
          validation: {
            valid: calculation.validation.valid,
            errors: calculation.validation.errors
          }
        });
        
        imported++;
      } catch (e: any) {
        errors.push(`Row ${i}: ${e.message}`);
        failed++;
      }
    }
    
    return {
      success: failed === 0,
      imported,
      failed,
      errors,
      preview
    };
  }
  
  /**
   * Apply imported fees to database
   */
  async applyImport(preview: ImportPreview[]): Promise<{
    success: boolean;
    applied: number;
    failed: number;
    errors: string[];
  }> {
    const supabase = this.client.getClient();
    let applied = 0;
    let failed = 0;
    const errors: string[] = [];
    
    for (const item of preview) {
      try {
        if (!item.validation.valid) {
          errors.push(`Invalid calculation for deal ${item.deal_id}: ${item.validation.errors.join(', ')}`);
          failed++;
          continue;
        }
        
        // If transaction exists, apply to it
        if (item.transaction_id) {
          // Store fees including discounts (negative amounts)
          const records = item.fees.map(fee => ({
            transaction_id: item.transaction_id,
            deal_id: item.deal_id,
            component: fee.component,
            amount: fee.amount,  // Can be positive or negative
            percent: fee.percent,
            applied: true,
            notes: fee.notes,
            created_at: new Date().toISOString()
          }));
          
          const { error } = await supabase
            .from('fees.fee_application')
            .insert(records);
          
          if (error) throw error;
          
          // Update transaction with calculated net capital
          await supabase
            .from('transactions_clean')
            .update({
              initial_net_capital: item.gross_capital - item.transferPostDiscount
            })
            .eq('transaction_id', item.transaction_id);
        } else {
          // Store in legacy_import for future application
          const imports = item.fees.map(fee => ({
            deal_id: item.deal_id,
            component: fee.component,
            basis: fee.basis,
            percent: fee.percent ? fee.percent * 100 : null,  // Store as percentage
            amount: fee.amount,
            notes: fee.notes,
            source_file: 'csv_import',
            imported_at: new Date().toISOString()
          }));
          
          const { error } = await supabase
            .from('fees.legacy_import')
            .insert(imports);
          
          if (error) throw error;
        }
        
        applied++;
      } catch (e: any) {
        errors.push(`Failed to apply for ${item.investor_name || `deal ${item.deal_id}`}: ${e.message}`);
        failed++;
      }
    }
    
    return {
      success: failed === 0,
      applied,
      failed,
      errors
    };
  }
  
  /**
   * Create default fee schedule for deal type
   */
  async createDefaultSchedule(dealId: number, dealType: string): Promise<FeeScheduleRow[]> {
    const components = this.getDefaultComponents(dealType);
    return this.createFeeSchedule(dealId, components);
  }
  
  /**
   * Get default fee components by deal type
   */
  private getDefaultComponents(dealType: string): Array<{
    component: string;
    rate: number;
    is_percent: boolean;
    basis: 'GROSS' | 'NET' | 'NET_AFTER_PREMIUM';
    precedence: number;
  }> {
    switch (dealType.toUpperCase()) {
      case 'PRIMARY':
        return [
          { component: 'PREMIUM', rate: 0.0377, is_percent: true, basis: 'GROSS', precedence: 1 },
          { component: 'STRUCTURING', rate: 0.04, is_percent: true, basis: 'NET', precedence: 2 },
          { component: 'MANAGEMENT', rate: 0.02, is_percent: true, basis: 'NET_AFTER_PREMIUM', precedence: 3 },
          { component: 'ADMIN', rate: 450, is_percent: false, basis: 'NET_AFTER_PREMIUM', precedence: 4 },
          { component: 'PERFORMANCE', rate: 0.20, is_percent: true, basis: 'NET_AFTER_PREMIUM', precedence: 5 }
        ];
        
      case 'SECONDARY':
        return [
          { component: 'PREMIUM', rate: 0.03, is_percent: true, basis: 'GROSS', precedence: 1 },
          { component: 'STRUCTURING', rate: 0.03, is_percent: true, basis: 'NET', precedence: 2 },
          { component: 'MANAGEMENT', rate: 0.015, is_percent: true, basis: 'NET_AFTER_PREMIUM', precedence: 3 },
          { component: 'ADMIN', rate: 350, is_percent: false, basis: 'NET_AFTER_PREMIUM', precedence: 4 }
        ];
        
      case 'ADVISORY':
        return [
          { component: 'ADVISORY', rate: 0.01, is_percent: true, basis: 'GROSS', precedence: 1 }
        ];
        
      default:
        return [
          { component: 'MANAGEMENT', rate: 0.02, is_percent: true, basis: 'GROSS', precedence: 1 }
        ];
    }
  }
  
  /**
   * Calculate fees for a transaction
   */
  async calculateTransactionFees(transactionId: number): Promise<FeeCalculationResult> {
    return this.calculator.calculateForTransaction(transactionId);
  }
  
  /**
   * Apply calculated fees to transaction
   */
  async applyTransactionFees(
    transactionId: number,
    calculation: FeeCalculationResult
  ): Promise<void> {
    await this.calculator.persistCalculation(transactionId, calculation);
  }
  
  /**
   * Get fee schedule for deal
   */
  async getFeeSchedule(dealId: number): Promise<FeeScheduleRow[]> {
    return this.calculator.loadActiveFeeSchedule(dealId);
  }
  
  /**
   * Preview fee calculation
   */
  async previewFees(
    dealId: number,
    grossCapital: number,
    unitPrice: number = 1000,
    options: {
      discounts?: DiscountInput[];
      annualFees?: Array<{ component: string; years: number }>;
    } = {}
  ): Promise<FeeCalculationResult> {
    return this.calculator.preview(dealId, grossCapital, unitPrice, options);
  }
  
  /**
   * Get partner fees (excluded from investor analytics)
   */
  async getPartnerFees(dealId: number): Promise<FeeApplication[]> {
    const supabase = this.client.getClient();
    
    const { data, error } = await supabase
      .from('fees.fee_application')
      .select('*')
      .eq('deal_id', dealId)
      .like('component', 'PARTNER_%');
    
    if (error) {
      throw new Error(`Failed to get partner fees: ${error.message}`);
    }
    
    return data || [];
  }
  
  /**
   * Get investor transfer amount (excluding partner fees)
   */
  async getInvestorTransferAmount(transactionId: number): Promise<number> {
    const supabase = this.client.getClient();
    
    const { data, error } = await supabase
      .from('fees.fee_application')
      .select('amount')
      .eq('transaction_id', transactionId)
      .not('component', 'like', 'PARTNER_%');
    
    if (error) {
      throw new Error(`Failed to get investor transfer: ${error.message}`);
    }
    
    // Sum all fees (positive and negative)
    const total = (data || []).reduce((sum, fee) => sum + fee.amount, 0);
    return Math.round(total * 100) / 100;
  }
  
  /**
   * Validate fee schedule configuration
   */
  async validateSchedule(dealId: number): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    try {
      const schedule = await this.calculator.loadActiveFeeSchedule(dealId);
      
      if (schedule.length === 0) {
        errors.push('No active fee schedule found');
        return { valid: false, errors, warnings };
      }
      
      // Check for PREMIUM as first
      if (schedule[0].component !== 'PREMIUM') {
        warnings.push(`First fee is ${schedule[0].component}, expected PREMIUM`);
      }
      
      // Check for duplicate precedence
      const precedences = schedule.map(s => s.precedence);
      const uniquePrecedences = new Set(precedences);
      if (precedences.length !== uniquePrecedences.size) {
        errors.push('Duplicate precedence values found');
      }
      
      // Check basis validity
      for (const fee of schedule) {
        if (!['GROSS', 'NET', 'NET_AFTER_PREMIUM'].includes(fee.basis)) {
          errors.push(`Invalid basis for ${fee.component}: ${fee.basis}`);
        }
      }
      
      // Check rate ranges
      for (const fee of schedule) {
        if (fee.is_percent && (fee.rate < 0 || fee.rate > 1)) {
          warnings.push(`${fee.component} rate ${fee.rate} seems unusual (expected 0-1)`);
        }
      }
      
    } catch (e: any) {
      errors.push(`Failed to load schedule: ${e.message}`);
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  /**
   * Generate comprehensive fee report
   */
  async generateFeeReport(dealId: number): Promise<{
    schedule: FeeScheduleRow[];
    applications: FeeApplication[];
    summary: {
      totalFees: number;
      totalDiscounts: number;
      netTransfers: number;
      transactionCount: number;
    };
  }> {
    const supabase = this.client.getClient();
    
    // Get schedule
    const schedule = await this.calculator.loadActiveFeeSchedule(dealId);
    
    // Get all applications
    const { data: applications } = await supabase
      .from('fees.fee_application')
      .select('*')
      .eq('deal_id', dealId)
      .order('created_at', { ascending: false });
    
    // Calculate summary
    const fees = (applications || []).filter(a => a.amount > 0);
    const discounts = (applications || []).filter(a => a.amount < 0);
    
    const totalFees = fees.reduce((sum, f) => sum + f.amount, 0);
    const totalDiscounts = Math.abs(discounts.reduce((sum, d) => sum + d.amount, 0));
    const netTransfers = totalFees - totalDiscounts;
    
    // Count unique transactions
    const transactionIds = new Set(applications?.map(a => a.transaction_id).filter(Boolean));
    
    return {
      schedule,
      applications: applications || [],
      summary: {
        totalFees: Math.round(totalFees * 100) / 100,
        totalDiscounts: Math.round(totalDiscounts * 100) / 100,
        netTransfers: Math.round(netTransfers * 100) / 100,
        transactionCount: transactionIds.size
      }
    };
  }
}

// Export singleton instance
export const enhancedFeeService = new EnhancedFeeService();