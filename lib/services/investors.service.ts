/**
 * Investors Service
 * Handles all investor-related operations
 */

import { BaseService } from './base.service';
import type { 
  Investor,
  DashboardData,
  PortfolioData,
  Commitment,
  Transaction,
  InvestorType
} from '../db/types';

export interface InvestorProfile extends Investor {
  totalCommitted?: number;
  totalCalled?: number;
  activeDeals?: number;
  portfolioValue?: number;
}

export interface InvestorListOptions {
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'created_at' | 'country';
  sortOrder?: 'asc' | 'desc';
  search?: string;
  type?: InvestorType;
  kycStatus?: 'pending' | 'approved' | 'rejected' | 'expired';
}

export class InvestorsService extends BaseService {
  /**
   * Get current investor (from session/auth)
   */
  async getCurrentInvestor(): Promise<Investor | null> {
    const cacheKey = 'investor:current';
    const cached = this.getCached<Investor>(cacheKey);
    if (cached) return cached;

    try {
      this.log('getCurrentInvestor');
      await this.delay();

      const investor = await this.dataClient.getCurrentInvestor();
      
      if (investor) {
        this.setCache(cacheKey, investor);
      }
      
      return investor;
    } catch (error) {
      this.handleError(error, 'getCurrentInvestor');
    }
  }

  /**
   * Get investor by ID
   */
  async getInvestorById(id: number): Promise<InvestorProfile | null> {
    const cacheKey = `investor:${id}`;
    const cached = this.getCached<InvestorProfile>(cacheKey);
    if (cached) return cached;

    try {
      this.log('getInvestorById', { id });
      await this.delay();

      const investor = await this.dataClient.getInvestorById(id);
      if (!investor) return null;

      // Get additional metrics
      const [commitments, transactions] = await Promise.all([
        this.dataClient.getCommitments(id),
        this.dataClient.getTransactions({ investor_id: id })
      ]);

      const signedCommitments = commitments.filter(c => c.status === 'signed');
      const totalCommitted = signedCommitments.reduce((sum, c) => sum + c.amount, 0);
      
      const capitalCalls = transactions.filter(
        t => t.type === 'capital_call' && t.status === 'completed'
      );
      const totalCalled = capitalCalls.reduce((sum, t) => sum + t.amount, 0);

      const profile: InvestorProfile = {
        ...investor,
        totalCommitted,
        totalCalled,
        activeDeals: signedCommitments.length,
        portfolioValue: totalCommitted * 1.25 // Mock 25% appreciation
      };

      this.setCache(cacheKey, profile);
      return profile;
    } catch (error) {
      this.handleError(error, 'getInvestorById');
    }
  }

  /**
   * Get all investors (admin function)
   */
  async getInvestors(options: InvestorListOptions = {}) {
    const cacheKey = `investors:${JSON.stringify(options)}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      this.log('getInvestors', options);
      await this.delay();

      let investors = await this.dataClient.getInvestors();

      // Filter by type
      if (options.type) {
        investors = investors.filter(i => i.type === options.type);
      }

      // Filter by KYC status
      if (options.kycStatus) {
        investors = investors.filter(i => i.kyc_status === options.kycStatus);
      }

      // Search
      if (options.search) {
        investors = this.searchFilter(investors, options.search, ['name', 'email']);
      }

      // Sort
      if (options.sortBy) {
        investors = this.sortBy(
          investors, 
          options.sortBy as keyof Investor, 
          options.sortOrder
        );
      }

      // Paginate
      const paginated = this.paginate(
        investors,
        options.page || 1,
        options.limit || 10
      );

      const result = this.formatResponse(paginated.data, {
        pagination: paginated.pagination
      });

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      this.handleError(error, 'getInvestors');
    }
  }

  /**
   * Get investor dashboard data
   */
  async getDashboardData(investorId?: number): Promise<DashboardData | null> {
    try {
      // Use provided ID or get current investor
      let id = investorId;
      if (!id) {
        const currentInvestor = await this.getCurrentInvestor();
        if (!currentInvestor) return null;
        id = currentInvestor.id;
      }

      const cacheKey = `dashboard:${id}`;
      const cached = this.getCached<DashboardData>(cacheKey);
      if (cached) return cached;

      this.log('getDashboardData', { investorId: id });
      await this.delay();

      const dashboardData = await this.dataClient.getDashboardData(id);

      this.setCache(cacheKey, dashboardData);
      return dashboardData;
    } catch (error) {
      this.handleError(error, 'getDashboardData');
    }
  }

  /**
   * Get investor portfolio data
   */
  async getPortfolioData(investorId?: number): Promise<PortfolioData | null> {
    try {
      // Use provided ID or get current investor
      let id = investorId;
      if (!id) {
        const currentInvestor = await this.getCurrentInvestor();
        if (!currentInvestor) return null;
        id = currentInvestor.id;
      }

      const cacheKey = `portfolio:${id}`;
      const cached = this.getCached<PortfolioData>(cacheKey);
      if (cached) return cached;

      this.log('getPortfolioData', { investorId: id });
      await this.delay();

      const portfolioData = await this.dataClient.getPortfolioData(id);

      this.setCache(cacheKey, portfolioData);
      return portfolioData;
    } catch (error) {
      this.handleError(error, 'getPortfolioData');
    }
  }

  /**
   * Get investor commitments
   */
  async getCommitments(investorId?: number): Promise<Commitment[]> {
    try {
      // Use provided ID or get current investor
      let id = investorId;
      if (!id) {
        const currentInvestor = await this.getCurrentInvestor();
        if (!currentInvestor) return [];
        id = currentInvestor.id;
      }

      const cacheKey = `commitments:${id}`;
      const cached = this.getCached<Commitment[]>(cacheKey);
      if (cached) return cached;

      this.log('getCommitments', { investorId: id });
      await this.delay();

      const commitments = await this.dataClient.getCommitments(id);

      this.setCache(cacheKey, commitments);
      return commitments;
    } catch (error) {
      this.handleError(error, 'getCommitments');
    }
  }

  /**
   * Get investor transactions
   */
  async getTransactions(investorId?: number, options: {
    type?: Transaction['type'];
    status?: Transaction['status'];
    limit?: number;
  } = {}): Promise<Transaction[]> {
    try {
      // Use provided ID or get current investor
      let id = investorId;
      if (!id) {
        const currentInvestor = await this.getCurrentInvestor();
        if (!currentInvestor) return [];
        id = currentInvestor.id;
      }

      const cacheKey = `transactions:${id}:${JSON.stringify(options)}`;
      const cached = this.getCached<Transaction[]>(cacheKey);
      if (cached) return cached;

      this.log('getTransactions', { investorId: id, options });
      await this.delay();

      const transactions = await this.dataClient.getTransactions({
        investor_id: id,
        type: options.type,
        status: options.status,
        limit: options.limit
      });

      this.setCache(cacheKey, transactions);
      return transactions;
    } catch (error) {
      this.handleError(error, 'getTransactions');
    }
  }

  /**
   * Update investor profile (mock - would integrate with auth)
   */
  async updateProfile(updates: Partial<Investor>): Promise<Investor | null> {
    try {
      const currentInvestor = await this.getCurrentInvestor();
      if (!currentInvestor) return null;

      this.log('updateProfile', updates);

      // In real implementation, this would update the database
      // For now, just return the updated investor
      const updated = {
        ...currentInvestor,
        ...updates,
        updated_at: new Date().toISOString()
      };

      // Clear cache
      this.clearCache();

      return updated;
    } catch (error) {
      this.handleError(error, 'updateProfile');
    }
  }

  /**
   * Get investor summary stats
   */
  async getSummaryStats(investorId?: number) {
    try {
      const dashboardData = await this.getDashboardData(investorId);
      if (!dashboardData) return null;

      return this.formatResponse({
        totalCommitted: dashboardData.summary.totalCommitted,
        totalCalled: dashboardData.summary.totalCalled,
        totalDistributed: dashboardData.summary.totalDistributed,
        currentValue: dashboardData.summary.currentValue,
        totalGains: dashboardData.summary.totalGains,
        irr: dashboardData.summary.portfolioIRR,
        moic: dashboardData.summary.portfolioMOIC,
        activeDeals: dashboardData.summary.activeDeals
      });
    } catch (error) {
      this.handleError(error, 'getSummaryStats');
    }
  }
}

// Export singleton instance
export const investorsService = new InvestorsService();