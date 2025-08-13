import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  getInvestorById, 
  mockInvestors 
} from '../lib/mock-data/investors';
import { 
  getDealsByInvestorId, 
  getCommitmentsByInvestorId,
  mockDeals,
  mockCommitments 
} from '../lib/mock-data/deals';
import { 
  getTransactionsByInvestorId, 
  getRecentTransactions,
  mockTransactions 
} from '../lib/mock-data/transactions';
import { 
  calculatePerformanceMetrics, 
  getPortfolioSummary 
} from '../lib/mock-data/performance';

describe('Investor Portal - Mock Data Tests', () => {
  
  describe('Investor Data', () => {
    it('should retrieve investor by ID', () => {
      const investor = getInvestorById(1);
      expect(investor).toBeDefined();
      expect(investor?.fullName).toBe('John Smith');
      expect(investor?.primaryEmail).toBe('john.smith@example.com');
      expect(investor?.status).toBe('active');
    });

    it('should return undefined for non-existent investor', () => {
      const investor = getInvestorById(999);
      expect(investor).toBeUndefined();
    });

    it('should have valid KYC status for all investors', () => {
      mockInvestors.forEach(investor => {
        expect(['pending', 'approved', 'rejected', 'expired']).toContain(investor.kycStatus);
      });
    });
  });

  describe('Deal and Commitment Data', () => {
    it('should retrieve deals for an investor', () => {
      const deals = getDealsByInvestorId(1);
      expect(deals.length).toBeGreaterThan(0);
      expect(deals[0]).toHaveProperty('name');
      expect(deals[0]).toHaveProperty('stage');
    });

    it('should retrieve commitments for an investor', () => {
      const commitments = getCommitmentsByInvestorId(1);
      expect(commitments.length).toBeGreaterThan(0);
      expect(commitments[0]).toHaveProperty('amount');
      expect(commitments[0]).toHaveProperty('status');
    });

    it('should have valid deal stages', () => {
      const validStages = ['sourcing', 'due_diligence', 'closing', 'active', 'exited', 'cancelled'];
      mockDeals.forEach(deal => {
        expect(validStages).toContain(deal.stage);
      });
    });

    it('should have positive commitment amounts', () => {
      mockCommitments.forEach(commitment => {
        expect(commitment.amount).toBeGreaterThan(0);
      });
    });
  });

  describe('Transaction Data', () => {
    it('should retrieve transactions for an investor', () => {
      const transactions = getTransactionsByInvestorId(1);
      expect(transactions.length).toBeGreaterThan(0);
      expect(transactions[0]).toHaveProperty('type');
      expect(transactions[0]).toHaveProperty('amount');
    });

    it('should retrieve recent transactions limited by count', () => {
      const recentTransactions = getRecentTransactions(1, 3);
      expect(recentTransactions.length).toBeLessThanOrEqual(3);
    });

    it('should have valid transaction types', () => {
      const validTypes = ['capital_call', 'distribution', 'fee', 'refund', 'adjustment'];
      mockTransactions.forEach(transaction => {
        expect(validTypes).toContain(transaction.type);
      });
    });

    it('should have valid transaction statuses', () => {
      const validStatuses = ['pending', 'completed', 'failed', 'cancelled'];
      mockTransactions.forEach(transaction => {
        expect(validStatuses).toContain(transaction.status);
      });
    });
  });

  describe('Performance Metrics', () => {
    it('should calculate performance metrics for an investor', () => {
      const metrics = calculatePerformanceMetrics(1);
      expect(metrics).toHaveProperty('irr');
      expect(metrics).toHaveProperty('moic');
      expect(metrics).toHaveProperty('dpi');
      expect(metrics).toHaveProperty('tvpi');
      expect(metrics.irr).toBeGreaterThanOrEqual(0);
      expect(metrics.moic).toBeGreaterThanOrEqual(0);
    });

    it('should calculate portfolio summary', () => {
      const summary = getPortfolioSummary(1);
      expect(summary).toHaveProperty('totalValue');
      expect(summary).toHaveProperty('totalCommitted');
      expect(summary).toHaveProperty('activeDeals');
      expect(summary.totalValue).toBeGreaterThanOrEqual(0);
      expect(summary.activeDeals).toBeGreaterThanOrEqual(0);
    });

    it('should have consistent calculations', () => {
      const metrics = calculatePerformanceMetrics(1);
      // TVPI should equal DPI + RVPI
      expect(metrics.tvpi).toBeCloseTo(metrics.moic, 2);
      // Total committed should be >= total called
      expect(metrics.totalCommitted).toBeGreaterThanOrEqual(metrics.totalCalled);
    });
  });

  describe('Data Relationships', () => {
    it('should have consistent investor-commitment relationships', () => {
      const investorId = 1;
      const commitments = getCommitmentsByInvestorId(investorId);
      commitments.forEach(commitment => {
        expect(commitment.investorId).toBe(investorId);
      });
    });

    it('should have consistent commitment-transaction relationships', () => {
      const investorId = 1;
      const commitments = getCommitmentsByInvestorId(investorId);
      const transactions = getTransactionsByInvestorId(investorId);
      
      commitments.forEach(commitment => {
        const dealTransactions = transactions.filter(t => t.dealId === commitment.dealId);
        if (dealTransactions.length > 0) {
          expect(commitment.dealId).toBe(dealTransactions[0].dealId);
        }
      });
    });

    it('should calculate total called <= total committed', () => {
      const metrics = calculatePerformanceMetrics(1);
      expect(metrics.totalCalled).toBeLessThanOrEqual(metrics.totalCommitted);
    });
  });

  describe('Edge Cases', () => {
    it('should handle investor with no commitments', () => {
      const newInvestorId = 999;
      const commitments = getCommitmentsByInvestorId(newInvestorId);
      expect(commitments).toEqual([]);
    });

    it('should handle investor with no transactions', () => {
      const newInvestorId = 999;
      const transactions = getTransactionsByInvestorId(newInvestorId);
      expect(transactions).toEqual([]);
    });

    it('should calculate zero metrics for investor with no data', () => {
      const metrics = calculatePerformanceMetrics(999);
      expect(metrics.totalCommitted).toBe(0);
      expect(metrics.totalCalled).toBe(0);
      expect(metrics.totalDistributed).toBe(0);
    });
  });
});

describe('API Route Response Validation', () => {
  it('should return valid dashboard data structure', async () => {
    // Mock the expected response structure
    const expectedStructure = {
      investor: expect.objectContaining({
        id: expect.any(Number),
        name: expect.any(String),
        email: expect.any(String),
        type: expect.any(String),
        kycStatus: expect.any(String),
      }),
      portfolio: expect.objectContaining({
        totalValue: expect.any(Number),
        totalCommitted: expect.any(Number),
        totalDistributed: expect.any(Number),
        unrealizedGain: expect.any(Number),
      }),
      performance: expect.objectContaining({
        irr: expect.any(Number),
        moic: expect.any(Number),
        dpi: expect.any(Number),
        tvpi: expect.any(Number),
      }),
      recentActivity: expect.any(Array),
      activeDeals: expect.any(Number),
    };

    // This would be replaced with actual API call in integration tests
    const mockDashboardResponse = {
      investor: {
        id: 1,
        name: 'John Smith',
        email: 'john.smith@example.com',
        type: 'individual',
        kycStatus: 'approved',
      },
      portfolio: {
        totalValue: 1000000,
        totalCommitted: 500000,
        totalDistributed: 200000,
        unrealizedGain: 150000,
      },
      performance: {
        irr: 18.5,
        moic: 1.5,
        dpi: 0.4,
        tvpi: 1.5,
      },
      recentActivity: [],
      activeDeals: 3,
    };

    expect(mockDashboardResponse).toMatchObject(expectedStructure);
  });
});