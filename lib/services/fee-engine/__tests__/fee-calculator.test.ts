// Fee Calculator Test Suite

import { FeeCalculator } from '../calculator';
import { 
  FeeProfile, 
  TransactionFeeContext, 
  FeeCalculationResult,
  DealType 
} from '../types';

describe('FeeCalculator', () => {
  // Test profile with tiered fees
  const testProfile: FeeProfile = {
    id: 1,
    name: 'Test Profile',
    kind: 'LEGACY',
    dealType: 'PRIMARY',
    config: {
      tiers: [
        {
          threshold: 0,
          management_fee: 0.02,
          performance_fee: 0.20,
          admin_fee: 0.005,
          structuring_fee: 0.015
        },
        {
          threshold: 1000000,
          management_fee: 0.015,
          performance_fee: 0.15,
          admin_fee: 0.003,
          structuring_fee: 0.01
        }
      ],
      hurdle_rate: 0.08,
      catch_up: true,
      high_water_mark: true,
      components: []
    }
  };

  // Test transaction context
  const baseContext: TransactionFeeContext = {
    transaction_id: 1001,
    deal_id: 101,
    investor_id: 10,
    transaction_date: new Date('2024-01-01'),
    gross_capital: 500000,
    units: 500,
    unit_price: 1000,
    deal_type: 'PRIMARY'
  };

  describe('Basic Fee Calculations', () => {
    it('should calculate management fee correctly', () => {
      const calculator = new FeeCalculator(testProfile);
      const result = calculator.calculate(baseContext);

      // Should use first tier (0.02 = 2%)
      const managementFee = result.components.find(c => c.component === 'MANAGEMENT');
      expect(managementFee).toBeDefined();
      expect(managementFee?.rate).toBe(0.02);
      expect(managementFee?.calculated_amount).toBe(10000); // 500000 * 0.02
    });

    it('should calculate admin fee correctly', () => {
      const calculator = new FeeCalculator(testProfile);
      const result = calculator.calculate(baseContext);

      const adminFee = result.components.find(c => c.component === 'ADMIN');
      expect(adminFee).toBeDefined();
      expect(adminFee?.rate).toBe(0.005);
      expect(adminFee?.calculated_amount).toBe(2500); // 500000 * 0.005
    });

    it('should calculate structuring fee correctly', () => {
      const calculator = new FeeCalculator(testProfile);
      const result = calculator.calculate(baseContext);

      const structuringFee = result.components.find(c => c.component === 'STRUCTURING');
      expect(structuringFee).toBeDefined();
      expect(structuringFee?.rate).toBe(0.015);
      expect(structuringFee?.calculated_amount).toBe(7500); // 500000 * 0.015
    });

    it('should calculate total fees and net amount', () => {
      const calculator = new FeeCalculator(testProfile);
      const result = calculator.calculate(baseContext);

      // Total: Management (10000) + Admin (2500) + Structuring (7500) = 20000
      expect(result.total_fees).toBe(20000);
      expect(result.net_amount).toBe(480000); // 500000 - 20000
      expect(result.effective_rate).toBeCloseTo(0.04); // 20000 / 500000
    });
  });

  describe('Tiered Fee Structure', () => {
    it('should apply higher tier for large transactions', () => {
      const largeContext = {
        ...baseContext,
        gross_capital: 1500000
      };

      const calculator = new FeeCalculator(testProfile);
      const result = calculator.calculate(largeContext);

      // Should use second tier (0.015 = 1.5%)
      const managementFee = result.components.find(c => c.component === 'MANAGEMENT');
      expect(managementFee?.rate).toBe(0.015);
      expect(managementFee?.calculated_amount).toBe(22500); // 1500000 * 0.015
    });

    it('should select correct tier based on threshold', () => {
      const calculator = new FeeCalculator(testProfile);
      
      // Just below threshold
      const result1 = calculator.calculate({
        ...baseContext,
        gross_capital: 999999
      });
      const mgmtFee1 = result1.components.find(c => c.component === 'MANAGEMENT');
      expect(mgmtFee1?.rate).toBe(0.02);

      // At threshold
      const result2 = calculator.calculate({
        ...baseContext,
        gross_capital: 1000000
      });
      const mgmtFee2 = result2.components.find(c => c.component === 'MANAGEMENT');
      expect(mgmtFee2?.rate).toBe(0.015);
    });
  });

  describe('Performance Fee with Hurdle Rate', () => {
    it('should not charge performance fee below hurdle', () => {
      const contextWithProfit = {
        ...baseContext,
        profit: 30000 // 6% return, below 8% hurdle
      };

      const calculator = new FeeCalculator(testProfile);
      const result = calculator.calculate(contextWithProfit);

      const performanceFee = result.components.find(c => c.component === 'PERFORMANCE');
      expect(performanceFee).toBeUndefined();
    });

    it('should charge performance fee above hurdle', () => {
      const contextWithProfit = {
        ...baseContext,
        profit: 50000 // 10% return, above 8% hurdle
      };

      const calculator = new FeeCalculator(testProfile);
      const result = calculator.calculate(contextWithProfit);

      const performanceFee = result.components.find(c => c.component === 'PERFORMANCE');
      expect(performanceFee).toBeDefined();
      // With catch-up, calculation is complex but fee should exist
      expect(performanceFee?.calculated_amount).toBeGreaterThan(0);
    });

    it('should handle catch-up provision correctly', () => {
      const profileWithCatchUp = { ...testProfile };
      profileWithCatchUp.config.catch_up = true;

      const profileNoCatchUp = { 
        ...testProfile,
        config: { ...testProfile.config, catch_up: false }
      };

      const contextWithProfit = {
        ...baseContext,
        profit: 50000
      };

      const calcWithCatchUp = new FeeCalculator(profileWithCatchUp);
      const calcNoCatchUp = new FeeCalculator(profileNoCatchUp);

      const resultWithCatchUp = calcWithCatchUp.calculate(contextWithProfit);
      const resultNoCatchUp = calcNoCatchUp.calculate(contextWithProfit);

      const perfFeeWithCatchUp = resultWithCatchUp.components.find(c => c.component === 'PERFORMANCE');
      const perfFeeNoCatchUp = resultNoCatchUp.components.find(c => c.component === 'PERFORMANCE');

      // With catch-up should generally result in higher fees
      expect(perfFeeWithCatchUp?.calculated_amount).toBeGreaterThanOrEqual(
        perfFeeNoCatchUp?.calculated_amount || 0
      );
    });
  });

  describe('Modern Configuration with Components', () => {
    it('should process component-based fees', () => {
      const modernProfile: FeeProfile = {
        id: 2,
        name: 'Modern Profile',
        kind: 'MODERN',
        dealType: 'PRIMARY',
        config: {
          tiers: [],
          components: [
            {
              component: 'MANAGEMENT',
              basis: 'GROSS_CAPITAL',
              rate: 0.025,
              is_percent: true,
              precedence: 1,
              applies_to: ['PRIMARY']
            },
            {
              component: 'ADVISORY',
              basis: 'FIXED',
              rate: 0,
              is_percent: false,
              fixed_amount: 5000,
              precedence: 2,
              applies_to: ['PRIMARY', 'SECONDARY']
            }
          ]
        }
      };

      const calculator = new FeeCalculator(modernProfile);
      const result = calculator.calculate(baseContext);

      const managementFee = result.components.find(c => c.component === 'MANAGEMENT');
      const advisoryFee = result.components.find(c => c.component === 'ADVISORY');

      expect(managementFee?.calculated_amount).toBe(12500); // 500000 * 0.025
      expect(advisoryFee?.calculated_amount).toBe(5000); // Fixed amount
    });

    it('should filter components by deal type', () => {
      const modernProfile: FeeProfile = {
        id: 2,
        name: 'Modern Profile',
        kind: 'MODERN',
        dealType: 'SECONDARY',
        config: {
          tiers: [],
          components: [
            {
              component: 'MANAGEMENT',
              basis: 'GROSS_CAPITAL',
              rate: 0.02,
              is_percent: true,
              precedence: 1,
              applies_to: ['PRIMARY'] // Only for PRIMARY
            },
            {
              component: 'ADVISORY',
              basis: 'GROSS_CAPITAL',
              rate: 0.01,
              is_percent: true,
              precedence: 2,
              applies_to: ['SECONDARY'] // Only for SECONDARY
            }
          ]
        }
      };

      const calculator = new FeeCalculator(modernProfile);
      
      // Test with SECONDARY deal type
      const secondaryContext = {
        ...baseContext,
        deal_type: 'SECONDARY' as DealType
      };
      const result = calculator.calculate(secondaryContext);

      const managementFee = result.components.find(c => c.component === 'MANAGEMENT');
      const advisoryFee = result.components.find(c => c.component === 'ADVISORY');

      expect(managementFee).toBeUndefined(); // Should not apply to SECONDARY
      expect(advisoryFee).toBeDefined(); // Should apply to SECONDARY
      expect(advisoryFee?.calculated_amount).toBe(5000); // 500000 * 0.01
    });
  });

  describe('Profile Validation', () => {
    it('should validate profile configuration', () => {
      const invalidProfile: FeeProfile = {
        id: 3,
        name: '',
        kind: 'LEGACY',
        dealType: 'PRIMARY',
        config: {
          tiers: [
            {
              threshold: 0,
              management_fee: 1.5, // Invalid: > 1
              performance_fee: -0.1, // Invalid: < 0
              admin_fee: 0.005
            }
          ],
          components: []
        }
      };

      const errors = FeeCalculator.validateProfile(invalidProfile);
      
      expect(errors).toContain('Profile name is required');
      expect(errors).toContain('Management fee must be between 0 and 1');
      expect(errors).toContain('Performance fee must be between 0 and 1');
    });

    it('should detect duplicate tier thresholds', () => {
      const profileWithDuplicates: FeeProfile = {
        id: 4,
        name: 'Duplicate Test',
        kind: 'LEGACY',
        dealType: 'PRIMARY',
        config: {
          tiers: [
            { threshold: 0, management_fee: 0.02, performance_fee: 0.20 },
            { threshold: 1000000, management_fee: 0.015, performance_fee: 0.15 },
            { threshold: 1000000, management_fee: 0.01, performance_fee: 0.10 } // Duplicate
          ],
          components: []
        }
      };

      const errors = FeeCalculator.validateProfile(profileWithDuplicates);
      expect(errors).toContain('Duplicate tier thresholds found');
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero gross capital', () => {
      const zeroContext = {
        ...baseContext,
        gross_capital: 0
      };

      const calculator = new FeeCalculator(testProfile);
      const result = calculator.calculate(zeroContext);

      expect(result.total_fees).toBe(0);
      expect(result.net_amount).toBe(0);
      expect(result.effective_rate).toBe(0);
    });

    it('should handle missing optional fields', () => {
      const minimalContext: TransactionFeeContext = {
        transaction_id: 1,
        deal_id: 1,
        investor_id: 1,
        transaction_date: new Date(),
        gross_capital: 100000,
        units: 100,
        unit_price: 1000,
        deal_type: 'PRIMARY'
        // No net_capital, prior_nav, current_nav, profit
      };

      const calculator = new FeeCalculator(testProfile);
      const result = calculator.calculate(minimalContext);

      expect(result).toBeDefined();
      expect(result.total_fees).toBeGreaterThan(0);
      // Should not have performance fee without profit
      const performanceFee = result.components.find(c => c.component === 'PERFORMANCE');
      expect(performanceFee).toBeUndefined();
    });

    it('should handle empty tier configuration', () => {
      const emptyProfile: FeeProfile = {
        id: 5,
        name: 'Empty Profile',
        kind: 'LEGACY',
        dealType: 'PRIMARY',
        config: {
          tiers: [],
          components: []
        }
      };

      const calculator = new FeeCalculator(emptyProfile);
      const result = calculator.calculate(baseContext);

      expect(result.components).toEqual([]);
      expect(result.total_fees).toBe(0);
      expect(result.net_amount).toBe(baseContext.gross_capital);
    });
  });
});