/**
 * Deals Service
 * Handles all deal-related operations
 */

import { BaseService } from "./base.service";
import type {
  Deal,
  Company,
  Commitment,
  DealFilters,
  DealStage,
  DealType,
} from "../db/types";

export interface DealWithCompany extends Deal {
  company?: Company;
}

export interface DealDetails extends DealWithCompany {
  commitments?: Commitment[];
  totalCommitted?: number;
  investorCount?: number;
  percentageRaised?: number;
}

export interface DealListOptions {
  page?: number;
  limit?: number;
  sortBy?: "name" | "opening_date" | "stage" | "current_raise";
  sortOrder?: "asc" | "desc";
  search?: string;
  stage?: DealStage;
  type?: DealType;
}

export class DealsService extends BaseService {
  /**
   * Get all deals with optional filters
   */
  async getDeals(options: DealListOptions = {}) {
    const cacheKey = `deals:${JSON.stringify(options)}`;
    const cached = this.getCached<Deal[]>(cacheKey);
    if (cached) return cached;

    try {
      this.log("getDeals", options);
      await this.delay();

      const filters: DealFilters = {
        stage: options.stage,
        type: options.type,
        search: options.search,
      };

      let deals = await this.dataClient.getDeals(filters);

      // Enrich with company data
      const dealsWithCompanies: DealWithCompany[] = await Promise.all(
        deals.map(async (deal) => {
          const company = deal.company_id
            ? await this.dataClient.getCompanyById(deal.company_id)
            : null;
          return {
            ...deal,
            company: company || undefined,
          };
        })
      );

      // Sort
      if (options.sortBy) {
        dealsWithCompanies.sort((a, b) => {
          const field = options.sortBy!;
          const aVal = a[field as keyof Deal];
          const bVal = b[field as keyof Deal];

          if (aVal === bVal) return 0;

          if (options.sortOrder === "desc") {
            return aVal! > bVal! ? -1 : 1;
          } else {
            return aVal! < bVal! ? -1 : 1;
          }
        });
      }

      // Paginate
      const paginated = this.paginate(
        dealsWithCompanies,
        options.page || 1,
        options.limit || 10
      );

      const result = this.formatResponse(paginated.data, {
        pagination: paginated.pagination,
      });

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      this.handleError(error, "getDeals");
    }
  }

  /**
   * Get a single deal by ID with full details
   */
  async getDealById(id: number): Promise<DealDetails | null> {
    const cacheKey = `deal:${id}`;
    const cached = this.getCached<DealDetails>(cacheKey);
    if (cached) return cached;

    try {
      this.log("getDealById", { id });
      await this.delay();

      const deal = await this.dataClient.getDealById(id);
      if (!deal) return null;

      // Get related data
      const [company, commitments] = await Promise.all([
        deal.company_id
          ? this.dataClient.getCompanyById(deal.company_id)
          : null,
        this.dataClient.getCommitmentsByDealId(id),
      ]);

      // Calculate aggregates
      const signedCommitments = commitments.filter(
        (c) => c.status === "signed"
      );
      const totalCommitted = signedCommitments.reduce(
        (sum, c) => sum + c.amount,
        0
      );
      const investorCount = new Set(signedCommitments.map((c) => c.investor_id))
        .size;
      const percentageRaised = deal.target_raise
        ? (totalCommitted / deal.target_raise) * 100
        : 0;

      const dealDetails: DealDetails = {
        ...deal,
        company: company || undefined,
        commitments,
        totalCommitted,
        investorCount,
        percentageRaised,
      };

      this.setCache(cacheKey, dealDetails);
      return dealDetails;
    } catch (error) {
      this.handleError(error, "getDealById");
    }
  }

  /**
   * Get a deal by slug
   */
  async getDealBySlug(slug: string): Promise<DealDetails | null> {
    const cacheKey = `deal:slug:${slug}`;
    const cached = this.getCached<DealDetails>(cacheKey);
    if (cached) return cached;

    try {
      this.log("getDealBySlug", { slug });
      await this.delay();

      const deal = await this.dataClient.getDealBySlug(slug);
      if (!deal) return null;

      // Get full details using getDealById
      const dealDetails = await this.getDealById(deal.id);

      this.setCache(cacheKey, dealDetails);
      return dealDetails;
    } catch (error) {
      this.handleError(error, "getDealBySlug");
    }
  }

  /**
   * Get deals for a specific investor
   */
  async getDealsByInvestor(investorId: number) {
    const cacheKey = `deals:investor:${investorId}`;
    const cached = this.getCached<DealWithCompany[]>(cacheKey);
    if (cached) return cached;

    try {
      this.log("getDealsByInvestor", { investorId });
      await this.delay();

      // Get investor's commitments
      const commitments = await this.dataClient.getCommitments(investorId);
      const dealIds = [...new Set(commitments.map((c) => c.deal_id))];

      // Get deals
      const deals = await Promise.all(
        dealIds.map((id) => this.getDealById(id))
      );

      const validDeals = deals.filter((d) => d !== null) as DealDetails[];

      this.setCache(cacheKey, validDeals);
      return this.formatResponse(validDeals);
    } catch (error) {
      this.handleError(error, "getDealsByInvestor");
    }
  }

  /**
   * Get active deals (for dashboard)
   */
  async getActiveDeals() {
    return this.getDeals({
      stage: "active",
      sortBy: "opening_date",
      sortOrder: "desc",
      limit: 6,
    });
  }

  /**
   * Get featured deals
   */
  async getFeaturedDeals() {
    const result = await this.getDeals({
      limit: 3,
      sortBy: "current_raise",
      sortOrder: "desc",
    });

    // Filter to only show deals in active or closing stage
    if (result && "data" in result && Array.isArray(result.data)) {
      result.data = result.data.filter(
        (d: any) => d.stage === "active" || d.stage === "closing"
      );
    }

    return result;
  }

  /**
   * Calculate deal metrics
   */
  async getDealMetrics(dealId: number) {
    const cacheKey = `deal:metrics:${dealId}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      this.log("getDealMetrics", { dealId });

      const deal = await this.getDealById(dealId);
      if (!deal) return null;

      const metrics = {
        dealId,
        name: deal.name,
        stage: deal.stage,
        targetRaise: deal.target_raise || 0,
        currentRaise: deal.current_raise || 0,
        totalCommitted: deal.totalCommitted || 0,
        investorCount: deal.investorCount || 0,
        percentageRaised: deal.percentageRaised || 0,
        daysRemaining: this.calculateDaysRemaining(deal.closing_date),
        minimumInvestment: deal.minimum_investment || 0,
        currency: deal.currency,
      };

      const result = this.formatResponse(metrics);
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      this.handleError(error, "getDealMetrics");
    }
  }

  /**
   * Search deals
   */
  async searchDeals(query: string) {
    return this.getDeals({
      search: query,
      limit: 20,
    });
  }

  /**
   * Create a new deal with fee equation
   */
  async createDeal(input: {
    name: string;
    company_id?: number;
    stage: DealStage;
    type: DealType;
    currency: string;
    opening_date?: string;
    closing_date?: string;
    target_raise?: number;
    minimum_investment?: number;
    fee_structure_type?: string;
  }) {
    try {
      this.log("createDeal", input);

      // Create the deal via data layer (no mocks)
      const deal = await this.dataClient.createDeal({
        name: input.name,
        company_id: input.company_id ?? null,
        stage: input.stage,
        type: input.type,
        currency: input.currency,
        opening_date: input.opening_date ?? null,
        closing_date: input.closing_date ?? null,
        target_raise: input.target_raise ?? null,
        current_raise: 0,
        minimum_investment: input.minimum_investment ?? null,
        slug: this.generateSlug(input.name),
      });

      // Formula template is set on the deal directly in deals_clean table
      this.log("Deal created", {
        deal_id: deal.id,
        formula_template: "standard", // Default template
      });

      // Clear cache
      this.clearCache();

      return deal;
    } catch (error) {
      this.handleError(error, "createDeal");
    }
  }

  /**
   * Update deal fee equation
   */
  async updateDealEquation(dealId: number, equationType: string) {
    try {
      // Update formula_template field in deals_clean table
      const { error } = await this.dataClient.supabase
        .from("deals_clean")
        .update({ formula_template: equationType })
        .eq("deal_id", dealId);

      if (error) throw error;

      this.log("Deal formula template updated", {
        deal_id: dealId,
        formula_template: equationType,
      });

      // Clear cache
      this.clearCache();

      return { deal_id: dealId, formula_template: equationType };
    } catch (error) {
      this.handleError(error, "updateDealEquation");
    }
  }

  /**
   * Get default equation type for deal type
   */
  private getDefaultEquationType(dealType: DealType): string {
    const mapping: Record<DealType, string> = {
      primary: "STANDARD_PRIMARY_V1",
      secondary: "SECONDARY_MARKET_V1",
      direct: "STANDARD_PRIMARY_V1",
      fund: "CARRY_FUND_V1",
    };

    return mapping[dealType] || "STANDARD_PRIMARY_V1";
  }

  /**
   * Generate URL-friendly slug from name
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  /**
   * Helper: Calculate days remaining
   */
  private calculateDaysRemaining(closingDate: string | null): number | null {
    if (!closingDate) return null;

    const closing = new Date(closingDate);
    const now = new Date();
    const diff = closing.getTime() - now.getTime();

    if (diff < 0) return 0;

    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
}

// Export singleton instance
export const dealsService = new DealsService();
