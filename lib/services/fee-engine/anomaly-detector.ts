/**
 * Fee Anomaly Detection Service
 * Monitors fee calculations for errors and inconsistencies
 */

import { SupabaseDirectClient } from '@/lib/db/supabase/client';
import { SchemaConfig } from '@/lib/db/schema-manager/config';

export interface FeeAnomaly {
  transaction_id: number;
  deal_id: number;
  component: string;
  amount: number;
  precedence?: number;
  basis?: string;
  precedence_error?: string;
  basis_error?: string;
  sign_error?: string;
  transfer_error?: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  anomaly_count: number;
}

export interface FeeValidation {
  transaction_id: number;
  deal_id: number;
  gross_capital: number;
  net_capital: number;
  premium_amount?: number;
  total_fees: number;
  total_discounts: number;
  expected_net: number;
  transfer_post_discount: number;
  net_validation: 'OK' | 'NET_MISMATCH';
  units_validation: 'OK' | 'UNITS_MISMATCH';
  net_residual: number;
}

export interface DiscountValidation {
  transaction_id: number;
  deal_id: number;
  base_component: string;
  base_amount: number;
  discount_component: string;
  discount_amount: number;
  discount_percent: number;
  validation_status: 'OK' | 'EXCESS_DISCOUNT';
  discount_level: 'HIGH_DISCOUNT' | 'MEDIUM_DISCOUNT' | 'NORMAL';
}

export interface FeeHealthSummary {
  total_transactions: number;
  total_deals: number;
  high_severity_issues: number;
  medium_severity_issues: number;
  net_mismatches: number;
  unit_mismatches: number;
  excess_discounts: number;
  high_discounts: number;
  health_score: number;
  checked_at: Date;
}

export class FeeAnomalyDetector {
  private client: SupabaseDirectClient;
  
  constructor() {
    this.client = new SupabaseDirectClient(new SchemaConfig());
  }
  
  /**
   * Get all anomalies for a deal or transaction
   */
  async getAnomalies(params: {
    dealId?: number;
    transactionId?: number;
    severity?: 'HIGH' | 'MEDIUM' | 'LOW';
  } = {}): Promise<FeeAnomaly[]> {
    const supabase = this.client.getClient();
    
    let query = supabase
      .from('analytics.v_fee_anomalies')
      .select('*');
    
    if (params.dealId) {
      query = query.eq('deal_id', params.dealId);
    }
    
    if (params.transactionId) {
      query = query.eq('transaction_id', params.transactionId);
    }
    
    if (params.severity) {
      query = query.eq('severity', params.severity);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw new Error(`Failed to get anomalies: ${error.message}`);
    }
    
    return data || [];
  }
  
  /**
   * Validate fee calculations for transactions
   */
  async validateCalculations(params: {
    dealId?: number;
    transactionId?: number;
  } = {}): Promise<FeeValidation[]> {
    const supabase = this.client.getClient();
    
    let query = supabase
      .from('analytics.v_fee_validation')
      .select('*');
    
    if (params.dealId) {
      query = query.eq('deal_id', params.dealId);
    }
    
    if (params.transactionId) {
      query = query.eq('transaction_id', params.transactionId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw new Error(`Failed to validate calculations: ${error.message}`);
    }
    
    return data || [];
  }
  
  /**
   * Validate discount applications
   */
  async validateDiscounts(params: {
    dealId?: number;
    transactionId?: number;
    minDiscountPercent?: number;
  } = {}): Promise<DiscountValidation[]> {
    const supabase = this.client.getClient();
    
    let query = supabase
      .from('analytics.v_discount_validation')
      .select('*');
    
    if (params.dealId) {
      query = query.eq('deal_id', params.dealId);
    }
    
    if (params.transactionId) {
      query = query.eq('transaction_id', params.transactionId);
    }
    
    if (params.minDiscountPercent) {
      query = query.gte('discount_percent', params.minDiscountPercent);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw new Error(`Failed to validate discounts: ${error.message}`);
    }
    
    return data || [];
  }
  
  /**
   * Get overall health summary
   */
  async getHealthSummary(): Promise<FeeHealthSummary> {
    const supabase = this.client.getClient();
    
    const { data, error } = await supabase
      .from('analytics.v_fee_health_summary')
      .select('*')
      .single();
    
    if (error) {
      throw new Error(`Failed to get health summary: ${error.message}`);
    }
    
    return data;
  }
  
  /**
   * Check specific invariants
   */
  async checkInvariants(transactionId: number): Promise<{
    valid: boolean;
    violations: string[];
  }> {
    const violations: string[] = [];
    
    // Get anomalies
    const anomalies = await this.getAnomalies({ transactionId });
    
    // Check for high severity issues
    const highSeverity = anomalies.filter(a => a.severity === 'HIGH');
    if (highSeverity.length > 0) {
      highSeverity.forEach(a => {
        if (a.precedence_error) violations.push(a.precedence_error);
        if (a.sign_error) violations.push(a.sign_error);
      });
    }
    
    // Validate calculations
    const validations = await this.validateCalculations({ transactionId });
    validations.forEach(v => {
      if (v.net_validation !== 'OK') {
        violations.push(`NET_MISMATCH: Expected ${v.expected_net}, got ${v.net_capital}`);
      }
      if (v.units_validation !== 'OK') {
        violations.push(`UNITS_MISMATCH`);
      }
      if (v.net_residual > 0.01) {
        violations.push(`HIGH_RESIDUAL: ${v.net_residual}`);
      }
    });
    
    // Check discounts
    const discounts = await this.validateDiscounts({ transactionId });
    discounts.forEach(d => {
      if (d.validation_status !== 'OK') {
        violations.push(`${d.validation_status}: ${d.discount_component}`);
      }
    });
    
    return {
      valid: violations.length === 0,
      violations
    };
  }
  
  /**
   * Generate anomaly report
   */
  async generateReport(dealId?: number): Promise<{
    summary: FeeHealthSummary;
    anomalies: FeeAnomaly[];
    validationErrors: FeeValidation[];
    discountIssues: DiscountValidation[];
    recommendations: string[];
  }> {
    // Get health summary
    const summary = await this.getHealthSummary();
    
    // Get issues
    const anomalies = await this.getAnomalies(
      dealId ? { dealId, severity: 'HIGH' } : { severity: 'HIGH' }
    );
    
    const validationErrors = (await this.validateCalculations(dealId ? { dealId } : {}))
      .filter(v => v.net_validation !== 'OK' || v.units_validation !== 'OK');
    
    const discountIssues = (await this.validateDiscounts(dealId ? { dealId } : {}))
      .filter(d => d.validation_status !== 'OK' || d.discount_level === 'HIGH_DISCOUNT');
    
    // Generate recommendations
    const recommendations: string[] = [];
    
    if (summary.high_severity_issues > 0) {
      recommendations.push('URGENT: Fix high severity issues immediately');
    }
    
    if (summary.net_mismatches > 0) {
      recommendations.push('Review net capital calculations');
    }
    
    if (summary.excess_discounts > 0) {
      recommendations.push('Review discounts that exceed base fees');
    }
    
    if (summary.health_score < 50) {
      recommendations.push('System health is poor - immediate attention required');
    } else if (summary.health_score < 75) {
      recommendations.push('System health needs improvement');
    }
    
    return {
      summary,
      anomalies,
      validationErrors,
      discountIssues,
      recommendations
    };
  }
}

// Export singleton instance
export const anomalyDetector = new FeeAnomalyDetector();