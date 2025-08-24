/**
 * Investors Service
 * Handles all investor-related operations
 */

import { BaseService } from "./base.service";
import type {
  Commitment as EntityCommitment,
  InvestorUnit,
  PortfolioHolding,
} from "../types";
import type {
  Investor,
  DashboardData,
  PortfolioData,
  Transaction,
  Deal,
  Company,
  Commitment as DbCommitment,
} from "../db/types";

type InvestorType = "individual" | "institutional" | "family_office" | "fund";

export interface InvestorProfile extends Investor {
  activeDeals?: number;
}

export interface InvestorListOptions {
  page?: number;
  limit?: number;
  sortBy?: "name" | "created_at" | "country";
  sortOrder?: "asc" | "desc";
  search?: string;
  type?: InvestorType;
  kycStatus?: "pending" | "approved" | "rejected" | "expired";
}

export class InvestorsService extends BaseService {
  /**
   * Get current investor (from session/auth)
   */
  async getCurrentInvestor(): Promise<Investor | null> {
    const cacheKey = "investor:current";
    const cached = this.getCached<Investor>(cacheKey);
    if (cached) return cached;

    try {
      this.log("getCurrentInvestor");
      await this.delay();

      const investor = await this.dataClient.getCurrentInvestor();

      if (investor) {
        this.setCache(cacheKey, investor);
      }

      return investor;
    } catch (error) {
      this.handleError(error, "getCurrentInvestor");
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
      this.log("getInvestorById", { id });
      await this.delay();

      const investor = await this.dataClient.getInvestorById(id);
      if (!investor) return null;

      // Get additional metrics
      const [commitments, transactions] = await Promise.all([
        this.dataClient.getCommitments(id),
        this.dataClient.getTransactions({ investor_id: id }),
      ]);

      const signedCommitments = commitments.filter(
        (c) => c.status === "signed"
      );
      const totalCommitted = signedCommitments.reduce(
        (sum, c) => sum + c.amount,
        0
      );

      const capitalCalls = transactions.filter(
        (t) => t.type === "capital_call" && t.status === "completed"
      );
      const totalCalled = capitalCalls.reduce((sum, t) => sum + t.amount, 0);

      const profile: InvestorProfile = {
        ...investor,
        activeDeals: signedCommitments.length,
      };

      this.setCache(cacheKey, profile);
      return profile;
    } catch (error) {
      this.handleError(error, "getInvestorById");
    }
  }

  /**
   * Get investor by public_id (external-safe identifier)
   */
  async getInvestorByPublicId(
    publicId: string
  ): Promise<InvestorProfile | null> {
    const cacheKey = `investor:public:${publicId}`;
    const cached = this.getCached<InvestorProfile>(cacheKey);
    if (cached) return cached;

    try {
      this.log("getInvestorByPublicId", { publicId });
      await this.delay();

      const adapter = this.dataClient;
      const investor = await adapter.getInvestorByPublicId(publicId);
      if (!investor) return null;

      // Compute basic metrics similar to getInvestorById
      const [commitments, transactions] = await Promise.all([
        this.dataClient.getCommitments(investor.id),
        this.dataClient.getTransactions({ investor_id: investor.id }),
      ]);

      const signedCommitments = commitments.filter(
        (c) => c.status === "signed"
      );
      const totalCommitted = signedCommitments.reduce(
        (sum, c) => sum + c.amount,
        0
      );
      const capitalCalls = transactions.filter(
        (t) => t.type === "capital_call" && t.status === "completed"
      );
      const totalCalled = capitalCalls.reduce((sum, t) => sum + t.amount, 0);

      const profile: InvestorProfile = {
        ...investor,
        activeDeals: signedCommitments.length,
      };

      this.setCache(cacheKey, profile);
      return profile;
    } catch (error) {
      this.handleError(error, "getInvestorByPublicId");
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
      this.log("getInvestors", options);
      await this.delay();

      let investors = await this.dataClient.getInvestors();

      // Filter by type
      if (options.type) {
        investors = investors.filter((i) => i.type === options.type);
      }

      // Filter by KYC status
      if (options.kycStatus) {
        investors = investors.filter((i) => i.kyc_status === options.kycStatus);
      }

      // Search
      if (options.search) {
        investors = this.searchFilter(investors, options.search, [
          "name",
          "email",
        ]);
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
        pagination: paginated.pagination,
      });

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      this.handleError(error, "getInvestors");
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

      this.log("getDashboardData", { investorId: id });
      await this.delay();

      const dashboardData = await this.dataClient.getDashboardData(id);

      this.setCache(cacheKey, dashboardData);
      return dashboardData;
    } catch (error) {
      this.handleError(error, "getDashboardData");
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

      this.log("getPortfolioData", { investorId: id });
      await this.delay();

      const portfolioData = await this.dataClient.getPortfolioData(id);

      this.setCache(cacheKey, portfolioData);
      return portfolioData;
    } catch (error) {
      this.handleError(error, "getPortfolioData");
    }
  }

  /**
   * Get investor commitments
   */
  async getCommitments(investorId?: number): Promise<DbCommitment[]> {
    try {
      // Use provided ID or get current investor
      let id = investorId;
      if (!id) {
        const currentInvestor = await this.getCurrentInvestor();
        if (!currentInvestor) return [];
        id = currentInvestor.id;
      }

      const cacheKey = `commitments:${id}`;
      const cached = this.getCached<DbCommitment[]>(cacheKey);
      if (cached) return cached;

      this.log("getCommitments", { investorId: id });
      await this.delay();

      const commitments = await this.dataClient.getCommitments(id);

      this.setCache(cacheKey, commitments);
      return commitments;
    } catch (error) {
      this.handleError(error, "getCommitments");
    }
  }

  /**
   * Get investor transactions
   */
  async getTransactions(
    investorId?: number,
    options: {
      type?: Transaction["type"];
      status?: Transaction["status"];
      limit?: number;
      page?: number;
      deal_id?: number;
      from_date?: string;
      to_date?: string;
    } = {}
  ) {
    try {
      // Use provided ID or get current investor
      let id = investorId;
      if (!id) {
        const currentInvestor = await this.getCurrentInvestor();
        if (!currentInvestor) return this.formatResponse([]);
        id = currentInvestor.id;
      }

      const cacheKey = `transactions:${id}:${JSON.stringify(options)}`;
      const cached = this.getCached<Transaction[]>(cacheKey);
      if (cached) return this.formatResponse(cached);

      this.log("getTransactions", { investorId: id, options });
      await this.delay();

      const transactions = await this.dataClient.getTransactions({
        investor_id: id,
        type: options.type,
        status: options.status,
        limit: options.limit,
      });

      this.setCache(cacheKey, transactions);
      return this.formatResponse(transactions);
    } catch (error) {
      this.handleError(error, "getTransactions");
      return this.formatResponse([]);
    }
  }

  /**
   * Update investor profile (mock - would integrate with auth)
   */
  async updateProfile(updates: Partial<Investor>): Promise<Investor | null> {
    try {
      const currentInvestor = await this.getCurrentInvestor();
      if (!currentInvestor) return null;

      this.log("updateProfile", updates);

      // In real implementation, this would update the database
      // For now, just return the updated investor
      const updated = {
        ...currentInvestor,
        ...updates,
        updated_at: new Date().toISOString(),
      };

      // Clear cache
      this.clearCache();

      return updated;
    } catch (error) {
      this.handleError(error, "updateProfile");
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
        activeDeals: dashboardData.summary.activeDeals,
      });
    } catch (error) {
      this.handleError(error, "getSummaryStats");
    }
  }

  /**
   * Get investor portfolio holdings from investor_units table
   */
  async getPortfolioHoldings(investorId?: number) {
    const cacheKey = `portfolio:${investorId || "current"}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const id = investorId || (await this.getCurrentInvestor())?.id || 1;

      // Get investor units from Supabase
      const adapter = this.dataClient as any;
      const units = await adapter.getInvestorUnits(id);

      // Get deals to enrich the data
      const dealIds: number[] = Array.from(
        new Set<number>(
          units.map((u: InvestorUnit & { deal_id: number }) => u.deal_id)
        )
      );
      const deals = await Promise.all(
        dealIds.map((dealId) => this.dataClient.getDealById(dealId))
      );

      // Fetch related companies (the Deal type doesn't include company details by default)
      const companyIds = [
        ...new Set(
          deals
            .filter((d): d is Deal => d !== null)
            .filter((d) => !!d.company_id)
            .map((d) => d.company_id as number)
        ),
      ];
      const companies = await Promise.all(
        companyIds.map((cid: number) => this.dataClient.getCompanyById(cid))
      );
      const companyMap: Record<number, any> = {};
      companies.forEach((c) => {
        if (c?.id) companyMap[c.id] = c;
      });

      // Map units to portfolio format
      const holdings = units.map((unit: any) => {
        const deal = deals.find((d) => d?.id === unit.deal_id);
        const company = deal?.company_id
          ? companyMap[deal.company_id]
          : undefined;

        return {
          dealId: unit.deal_id,
          dealName: deal?.name || `Deal ${unit.deal_id}`,
          companyName: company?.name || "Unknown Company",
          sector: company?.industry || "Unknown",
          dealType: deal?.type || "primary",
          committed: parseFloat(unit.investment_amount),
          called: parseFloat(unit.net_capital),
          distributed: parseFloat(unit.realized_gain_loss || "0"),
          currentValue: parseFloat(unit.current_value),
          irr: this.calculateIRR(unit),
          moic:
            parseFloat(unit.current_value) /
            parseFloat(unit.net_capital || "1"),
          status: unit.status === "Active" ? "active" : "exited",
          currency: deal?.currency || "USD",
          stage: deal?.stage || "active",
          unrealizedGain: parseFloat(unit.unrealized_gain_loss || "0"),
          purchaseDate: unit.purchase_date,
          units: parseFloat(unit.units_purchased),
          unitPrice: parseFloat(unit.unit_price_at_purchase),
          currentUnitPrice: parseFloat(unit.current_unit_price),
        };
      });

      const result = this.formatResponse(holdings);
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      this.handleError(error, "getPortfolioHoldings");
    }
  }

  /**
   * Calculate IRR for a holding
   */
  private calculateIRR(unit: any): number {
    // Simplified IRR calculation
    const investmentAmount = parseFloat(unit.net_capital || "0");
    const currentValue = parseFloat(unit.current_value || "0");
    const purchaseDate = new Date(unit.purchase_date);
    const now = new Date();
    const years =
      (now.getTime() - purchaseDate.getTime()) / (365 * 24 * 60 * 60 * 1000);

    if (years <= 0 || investmentAmount <= 0) return 0;

    const totalReturn = currentValue / investmentAmount;
    const irr = (Math.pow(totalReturn, 1 / years) - 1) * 100;

    return Math.round(irr * 10) / 10; // Round to 1 decimal
  }

  /**
   * Get investor commitments (from investor_units)
   */
  async getInvestorCommitments(investorId?: number) {
    const cacheKey = `commitments:${investorId || "current"}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const holdings = (await this.getPortfolioHoldings(investorId)) as any;
      if (!holdings?.data) return this.formatResponse([]);

      // Transform holdings to commitments format
      const commitments = holdings.data.map((holding: any, index: number) => ({
        id: index + 1,
        dealId: holding.dealId,
        dealName: holding.dealName,
        dealCode: `DEAL-${holding.dealId}`,
        dealStage: holding.stage,
        companyName: holding.companyName,
        companySector: holding.sector,
        currency: holding.currency,
        committedAmount: holding.committed,
        capitalCalled: holding.called,
        capitalDistributed: holding.distributed,
        capitalRemaining: holding.committed - holding.called,
        percentageCalled: (holding.called / holding.committed) * 100,
        nextCallAmount: 0,
        nextCallDate: null,
        status: holding.status === "active" ? "signed" : "completed",
        dealOpeningDate: holding.purchaseDate,
        dealClosingDate: null,
        createdAt: holding.purchaseDate,
      }));

      // Calculate summary
      const summary = {
        totalCommitments: commitments.length,
        activeCommitments: commitments.filter((c: any) => c.status === "signed")
          .length,
        totalCommitted: commitments.reduce(
          (sum: number, c: any) => sum + c.committedAmount,
          0
        ),
        totalCalled: commitments.reduce(
          (sum: number, c: any) => sum + c.capitalCalled,
          0
        ),
        totalDistributed: commitments.reduce(
          (sum: number, c: any) => sum + c.capitalDistributed,
          0
        ),
        totalRemaining: commitments.reduce(
          (sum: number, c: any) => sum + c.capitalRemaining,
          0
        ),
        averageCallPercentage:
          commitments.length > 0
            ? commitments.reduce(
                (sum: number, c: any) => sum + c.percentageCalled,
                0
              ) / commitments.length
            : 0,
      };

      const result = {
        commitments,
        summary,
        upcomingCalls: [],
      };

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      this.handleError(error, "getInvestorCommitments");
    }
  }
}

// Export singleton instance
export const investorsService = new InvestorsService();
