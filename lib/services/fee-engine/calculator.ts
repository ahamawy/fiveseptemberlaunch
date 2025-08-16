// Core Fee Calculation Engine

import {
  FeeProfile,
  TransactionFeeContext,
  FeeCalculationResult,
  FeeLineItem,
  FeeComponent,
  FeeBasis,
  FeeComponentConfig,
  DealType
} from './types';

export class FeeCalculator {
  private profile: FeeProfile;

  constructor(profile: FeeProfile) {
    this.profile = profile;
  }

  /**
   * Calculate all fees for a transaction based on the fee profile
   */
  calculate(context: TransactionFeeContext): FeeCalculationResult {
    const components: FeeLineItem[] = [];
    const warnings: string[] = [];

    // Get applicable tier based on transaction amount
    const applicableTier = this.getApplicableTier(context.gross_capital);

    // Calculate each fee component
    for (const config of this.profile.config.components) {
      // Check if component applies to this deal type
      if (config.applies_to && !config.applies_to.includes(context.deal_type)) {
        continue;
      }

      const lineItem = this.calculateComponent(config, context, applicableTier);
      if (lineItem) {
        components.push(lineItem);
      }
    }

    // Calculate legacy tier-based fees if applicable
    if (this.profile.kind === 'LEGACY' && applicableTier) {
      // Management fee
      if (applicableTier.management_fee > 0) {
        components.push(this.createFeeLineItem(
          'MANAGEMENT',
          'GROSS_CAPITAL',
          context.gross_capital,
          applicableTier.management_fee,
          context.gross_capital * applicableTier.management_fee
        ));
      }

      // Performance fee (with hurdle rate check)
      if (applicableTier.performance_fee > 0 && context.profit) {
        const performanceFee = this.calculatePerformanceFee(
          context.profit,
          applicableTier.performance_fee,
          this.profile.config.hurdle_rate || 0,
          this.profile.config.catch_up || false
        );
        
        if (performanceFee > 0) {
          components.push(this.createFeeLineItem(
            'PERFORMANCE',
            'PROFIT',
            context.profit,
            applicableTier.performance_fee,
            performanceFee,
            'After hurdle rate'
          ));
        }
      }

      // Admin fee
      if (applicableTier.admin_fee) {
        components.push(this.createFeeLineItem(
          'ADMIN',
          'GROSS_CAPITAL',
          context.gross_capital,
          applicableTier.admin_fee,
          context.gross_capital * applicableTier.admin_fee
        ));
      }

      // Structuring fee
      if (applicableTier.structuring_fee) {
        components.push(this.createFeeLineItem(
          'STRUCTURING',
          'GROSS_CAPITAL',
          context.gross_capital,
          applicableTier.structuring_fee,
          context.gross_capital * applicableTier.structuring_fee
        ));
      }
    }

    // Calculate totals
    const total_fees = components.reduce((sum, item) => sum + item.calculated_amount, 0);
    const net_amount = context.gross_capital - total_fees;
    const effective_rate = context.gross_capital > 0 ? total_fees / context.gross_capital : 0;

    return {
      transaction_id: context.transaction_id,
      deal_id: context.deal_id,
      components,
      total_fees,
      net_amount,
      effective_rate,
      metadata: {
        profile_used: this.profile.name,
        calculation_date: new Date(),
        warnings: warnings.length > 0 ? warnings : undefined
      }
    };
  }

  /**
   * Calculate a specific fee component
   */
  private calculateComponent(
    config: FeeComponentConfig, 
    context: TransactionFeeContext,
    tier: any
  ): FeeLineItem | null {
    // Get basis amount
    const basisAmount = this.getBasisAmount(config.basis, context);
    if (basisAmount === 0) return null;

    // Calculate fee
    let calculatedAmount: number;
    if (config.is_percent) {
      calculatedAmount = basisAmount * config.rate;
    } else {
      calculatedAmount = config.fixed_amount || 0;
    }

    return this.createFeeLineItem(
      config.component,
      config.basis,
      basisAmount,
      config.rate,
      calculatedAmount
    );
  }

  /**
   * Get the basis amount for fee calculation
   */
  private getBasisAmount(basis: FeeBasis, context: TransactionFeeContext): number {
    switch (basis) {
      case 'GROSS_CAPITAL':
        return context.gross_capital;
      case 'NET_CAPITAL':
        return context.net_capital || context.gross_capital;
      case 'COMMITTED_CAPITAL':
        return context.gross_capital; // Simplified - would need commitment data
      case 'DEPLOYED_CAPITAL':
        return context.gross_capital; // Simplified - would need deployment data
      case 'NAV':
        return context.current_nav || 0;
      case 'PROFIT':
        return Math.max(0, context.profit || 0);
      case 'FIXED':
        return 1; // Multiplier for fixed amounts
      default:
        return 0;
    }
  }

  /**
   * Get applicable fee tier based on transaction amount
   */
  private getApplicableTier(amount: number): any {
    if (!this.profile.config.tiers || this.profile.config.tiers.length === 0) {
      return null;
    }

    // Sort tiers by threshold descending
    const sortedTiers = [...this.profile.config.tiers].sort((a, b) => b.threshold - a.threshold);
    
    // Find the first tier where amount exceeds threshold
    for (const tier of sortedTiers) {
      if (amount >= tier.threshold) {
        return tier;
      }
    }

    // Return lowest tier if no match
    return sortedTiers[sortedTiers.length - 1];
  }

  /**
   * Calculate performance fee with hurdle rate and catch-up
   */
  private calculatePerformanceFee(
    profit: number,
    performanceRate: number,
    hurdleRate: number,
    catchUp: boolean
  ): number {
    if (profit <= 0) return 0;

    // If no hurdle rate, simple calculation
    if (hurdleRate === 0) {
      return profit * performanceRate;
    }

    // Calculate hurdle amount (simplified - would need time-based calculation)
    const hurdleAmount = profit * hurdleRate;
    const excessProfit = profit - hurdleAmount;

    if (excessProfit <= 0) {
      return 0; // Profit doesn't exceed hurdle
    }

    if (catchUp) {
      // With catch-up: manager gets higher % until caught up, then normal rate
      // Simplified implementation
      const catchUpAmount = hurdleAmount * performanceRate;
      const remainingProfit = excessProfit - catchUpAmount;
      
      if (remainingProfit > 0) {
        return catchUpAmount + (remainingProfit * performanceRate);
      } else {
        return excessProfit; // Take all excess as catch-up
      }
    } else {
      // Without catch-up: only charge on excess over hurdle
      return excessProfit * performanceRate;
    }
  }

  /**
   * Create a fee line item
   */
  private createFeeLineItem(
    component: FeeComponent,
    basis: FeeBasis,
    basisAmount: number,
    rate: number,
    calculatedAmount: number,
    notes?: string
  ): FeeLineItem {
    return {
      component,
      basis,
      basis_amount: basisAmount,
      rate,
      calculated_amount: calculatedAmount,
      notes
    };
  }

  /**
   * Validate fee profile configuration
   */
  static validateProfile(profile: FeeProfile): string[] {
    const errors: string[] = [];

    if (!profile.name) {
      errors.push('Profile name is required');
    }

    if (!profile.config) {
      errors.push('Profile configuration is required');
    }

    if (profile.config.tiers && profile.config.tiers.length > 0) {
      // Check for duplicate thresholds
      const thresholds = profile.config.tiers.map(t => t.threshold);
      const uniqueThresholds = new Set(thresholds);
      if (thresholds.length !== uniqueThresholds.size) {
        errors.push('Duplicate tier thresholds found');
      }

      // Validate rates
      for (const tier of profile.config.tiers) {
        if (tier.management_fee < 0 || tier.management_fee > 1) {
          errors.push('Management fee must be between 0 and 1');
        }
        if (tier.performance_fee < 0 || tier.performance_fee > 1) {
          errors.push('Performance fee must be between 0 and 1');
        }
      }
    }

    return errors;
  }
}