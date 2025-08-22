/**
 * Unified Supabase Data Adapter
 * Consolidates both simple and complex adapter functionality
 * Configurable to use either database views or direct tables
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { IDataClient } from "./client";
import type {
  Deal,
  Investor,
  Company,
  Commitment,
  Transaction,
  Document,
  DealFilters,
  TransactionFilters,
  DocumentFilters,
  DashboardData,
  PortfolioData,
  Database,
} from "./types";

export interface SupabaseAdapterOptions {
  useViews?: boolean; // Use database views (simple) or direct tables (complex)
  url?: string;
  anonKey?: string;
}

export class UnifiedSupabaseAdapter implements IDataClient {
  private client: SupabaseClient<Database>;
  private useViews: boolean;

  constructor(options?: SupabaseAdapterOptions) {
    const supabaseUrl = options?.url || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      options?.anonKey ||
      (typeof window === "undefined"
        ? process.env.SUPABASE_SERVICE_KEY ||
          process.env.SUPABASE_SERVICE_ROLE_KEY
        : undefined) ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        "Missing Supabase configuration. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
      );
    }

    this.client = createClient<Database>(supabaseUrl, supabaseKey);
    this.useViews = options?.useViews ?? true; // Default to using views for simplicity

    console.log(
      `✅ Unified Supabase client initialized (mode: ${
        this.useViews ? "views" : "tables"
      })`
    );
  }

  // ==========================================
  // DEALS
  // ==========================================

  async getDeals(filters?: DealFilters): Promise<Deal[]> {
    try {
      // Use legacy-friendly field names available in existing datasets
      let query = this.client
        .from("deals.deal")
        .select("*")
        .order("id", { ascending: false });

      // Apply filters
      if (filters?.stage) {
        query = query.eq("stage", filters.stage);
      }
      if (filters?.search) {
        query = query.ilike("name", `%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching deals:", error);
        return [];
      }

      // Map database fields to TypeScript fields
      return (data || []).map(this.mapDealFromDb);
    } catch (error) {
      console.error("Error in getDeals:", error);
      return [];
    }
  }

  async getDealById(id: number): Promise<Deal | null> {
    try {
      const { data, error } = await this.client
        .from("deals.deal")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching deal:", error);
        return null;
      }

      return data ? this.mapDealFromDb(data) : null;
    } catch (error) {
      console.error("Error in getDealById:", error);
      return null;
    }
  }

  async getDealBySlug(slug: string): Promise<Deal | null> {
    try {
      const { data, error } = await this.client
        .from("deals.deal")
        .select("*")
        .eq("slug", slug)
        .single();

      if (error) {
        console.error("Error fetching deal by slug:", error);
        return null;
      }

      return data ? this.mapDealFromDb(data) : null;
    } catch (error) {
      console.error("Error in getDealBySlug:", error);
      return null;
    }
  }

  // ==========================================
  // INVESTORS
  // ==========================================

  async getInvestors(): Promise<Investor[]> {
    try {
      const { data, error } = await this.client
        .from("investors.investor")
        .select("*")
        .order("id");

      if (error) {
        console.error("Error fetching investors:", error);
        return [];
      }

      return (data || []).map(this.mapInvestorFromDb);
    } catch (error) {
      console.error("Error in getInvestors:", error);
      return [];
    }
  }

  async getInvestorById(id: number): Promise<Investor | null> {
    try {
      const { data, error } = await this.client
        .from("investors.investor")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching investor:", error);
        return null;
      }

      return data ? this.mapInvestorFromDb(data) : null;
    } catch (error) {
      console.error("Error in getInvestorById:", error);
      return null;
    }
  }

  async getInvestorByPublicId(publicId: string): Promise<Investor | null> {
    try {
      const { data, error } = await this.client
        .from("investors.investor")
        .select("*")
        .eq("public_id", publicId)
        .single();

      if (error) {
        console.error("Error fetching investor by public_id:", error);
        return null;
      }

      return data ? this.mapInvestorFromDb(data) : null;
    } catch (error) {
      console.error("Error in getInvestorByPublicId:", error);
      return null;
    }
  }

  async getCurrentInvestor(): Promise<Investor | null> {
    // In production, this would get the authenticated user's investor profile
    // For now, return investor with ID 1 as default
    return this.getInvestorById(1);
  }

  // ==========================================
  // COMPANIES
  // ==========================================

  async getCompanies(): Promise<Company[]> {
    try {
      const { data, error } = await this.client
        .from("companies.company")
        .select("*")
        .order("id");

      if (error) {
        console.error("Error fetching companies:", error);
        return [];
      }

      return (data || []).map(this.mapCompanyFromDb);
    } catch (error) {
      console.error("Error in getCompanies:", error);
      return [];
    }
  }

  async getCompanyById(id: number): Promise<Company | null> {
    try {
      const { data, error } = await this.client
        .from("companies.company")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching company:", error);
        return null;
      }

      return data ? this.mapCompanyFromDb(data) : null;
    } catch (error) {
      console.error("Error in getCompanyById:", error);
      return null;
    }
  }

  // ==========================================
  // COMMITMENTS
  // ==========================================

  async getCommitments(investorId?: number): Promise<Commitment[]> {
    try {
      const tableName = this.useViews
        ? "investors.commitment"
        : "investors.commitment";
      let query = this.client
        .from(tableName)
        .select("*")
        .order("id", { ascending: false });

      if (investorId) {
        query = query.eq("investor_id", investorId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching commitments:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error in getCommitments:", error);
      return [];
    }
  }

  async getCommitmentById(id: number): Promise<Commitment | null> {
    try {
      const tableName = this.useViews
        ? "investors.commitment"
        : "investors.commitment";
      const { data, error } = await this.client
        .from(tableName)
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching commitment:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error in getCommitmentById:", error);
      return null;
    }
  }

  async getCommitmentsByDealId(dealId: number): Promise<Commitment[]> {
    try {
      const tableName = this.useViews
        ? "investors.commitment"
        : "investors.commitment";
      const { data, error } = await this.client
        .from(tableName)
        .select("*")
        .eq("deal_id", dealId)
        .order("commitment_date", { ascending: false });

      if (error) {
        console.error("Error fetching commitments by deal:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error in getCommitmentsByDealId:", error);
      return [];
    }
  }

  // ==========================================
  // TRANSACTIONS
  // ==========================================

  async getTransactions(filters?: TransactionFilters): Promise<Transaction[]> {
    try {
      const tableName = this.useViews
        ? "transactions.transaction.primary"
        : "transactions.transaction";
      let query = this.client
        .from(tableName)
        .select("*")
        .order(this.useViews ? "transaction_date" : "occurred_on", {
          ascending: false,
        });

      if (filters?.investor_id) {
        query = query.eq("investor_id", filters.investor_id);
      }
      if (filters?.deal_id) {
        query = query.eq("deal_id", filters.deal_id);
      }
      if (filters?.type) {
        query = query.eq(
          this.useViews ? "transaction_type" : "type",
          filters.type
        );
      }
      if (filters?.from_date) {
        query = query.gte(
          this.useViews ? "transaction_date" : "occurred_on",
          filters.from_date
        );
      }
      if (filters?.to_date) {
        query = query.lte(
          this.useViews ? "transaction_date" : "occurred_on",
          filters.to_date
        );
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching transactions:", error);
        return [];
      }

      return (data || []).map(this.mapTransactionFromDb);
    } catch (error) {
      console.error("Error in getTransactions:", error);
      return [];
    }
  }

  async getTransactionById(id: number): Promise<Transaction | null> {
    try {
      const tableName = this.useViews
        ? "transactions.transaction.primary"
        : "transactions.transaction";
      const { data, error } = await this.client
        .from(tableName)
        .select("*")
        .eq(this.useViews ? "transaction_id" : "id", id)
        .single();

      if (error) {
        console.error("Error fetching transaction:", error);
        return null;
      }

      return data ? this.mapTransactionFromDb(data) : null;
    } catch (error) {
      console.error("Error in getTransactionById:", error);
      return null;
    }
  }

  // ==========================================
  // DOCUMENTS
  // ==========================================

  async getDocuments(filters?: DocumentFilters): Promise<Document[]> {
    try {
      const tableName = "documents.document";
      let query = this.client
        .from(tableName)
        .select("*")
        .order("created_at", { ascending: false });

      if (filters?.investor_id) {
        query = query.eq("investor_id", filters.investor_id);
      }
      if (filters?.deal_id) {
        query = query.eq("deal_id", filters.deal_id);
      }
      if (filters?.type) {
        query = query.eq("type", filters.type);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching documents:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error in getDocuments:", error);
      return [];
    }
  }

  async getDocumentById(id: number): Promise<Document | null> {
    try {
      const tableName = "documents.document";
      const { data, error } = await this.client
        .from(tableName)
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching document:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error in getDocumentById:", error);
      return null;
    }
  }

  // ==========================================
  // DASHBOARD & PORTFOLIO
  // ==========================================

  async getDashboardData(investorId: number): Promise<DashboardData> {
    try {
      // Get investor details
      const investor = await this.getInvestorById(investorId);
      if (!investor) {
        return this.getEmptyDashboard();
      }

      // Get investor units for portfolio data
      const units = await this.getInvestorUnits(investorId);

      // Get transactions for the investor
      const transactions = await this.getTransactions({
        investor_id: investorId,
      });

      // Calculate summary metrics
      const totalCommitted = units.reduce(
        (sum: number, u: any) => sum + parseFloat(u.investment_amount || "0"),
        0
      );

      const totalCalled = units.reduce(
        (sum: number, u: any) => sum + parseFloat(u.net_capital || "0"),
        0
      );

      const totalDistributed = units.reduce(
        (sum: number, u: any) => sum + parseFloat(u.realized_gain_loss || "0"),
        0
      );

      const currentValue = units.reduce(
        (sum: number, u: any) => sum + parseFloat(u.current_value || "0"),
        0
      );

      const totalGains = units.reduce(
        (sum: number, u: any) =>
          sum +
          parseFloat(u.unrealized_gain_loss || "0") +
          parseFloat(u.realized_gain_loss || "0"),
        0
      );

      // Count active deals
      const activeDeals = units.filter(
        (u: any) => u.status === "Active"
      ).length;

      // Calculate portfolio IRR and MOIC
      const portfolioMOIC = totalCalled > 0 ? currentValue / totalCalled : 0;
      const portfolioIRR = this.calculatePortfolioIRR(units);

      // Get recent activity (last 5 transactions)
      const recentActivity = transactions.slice(0, 5).map((t: any) => ({
        id: t.id.toString(),
        type: t.type,
        description: `${t.type} - Deal #${t.deal_id}`,
        amount: t.amount,
        date: t.transaction_date,
      }));

      // Upcoming calls (mock for now)
      const upcomingCalls: any[] = [];

      return {
        investor,
        summary: {
          totalCommitted,
          totalCalled,
          totalDistributed,
          currentValue,
          totalGains,
          portfolioIRR,
          portfolioMOIC,
          activeDeals,
        },
        recentActivity,
        upcomingCalls,
      };
    } catch (error) {
      console.error("Error in getDashboardData:", error);
      return this.getEmptyDashboard();
    }
  }

  private calculatePortfolioIRR(units: any[]): number {
    // Simplified portfolio IRR calculation
    if (units.length === 0) return 0;

    let totalWeightedIRR = 0;
    let totalWeight = 0;

    for (const unit of units) {
      const investmentAmount = parseFloat(unit.net_capital || "0");
      const currentValue = parseFloat(unit.current_value || "0");
      const purchaseDate = new Date(unit.purchase_date);
      const now = new Date();
      const years =
        (now.getTime() - purchaseDate.getTime()) / (365 * 24 * 60 * 60 * 1000);

      if (years > 0 && investmentAmount > 0) {
        const totalReturn = currentValue / investmentAmount;
        const irr = (Math.pow(totalReturn, 1 / years) - 1) * 100;
        totalWeightedIRR += irr * investmentAmount;
        totalWeight += investmentAmount;
      }
    }

    return totalWeight > 0
      ? Math.round((totalWeightedIRR / totalWeight) * 10) / 10
      : 0;
  }

  async getPortfolioData(investorId: number): Promise<PortfolioData> {
    try {
      // For now, return an empty portfolio in tables mode to satisfy types
      return {
        holdings: [],
        summary: {
          totalHoldings: 0,
          totalValue: 0,
          totalGains: 0,
          averageIRR: 0,
          averageMOIC: 0,
        },
      };
    } catch (error) {
      console.error("Error in getPortfolioData:", error);
      return {
        holdings: [],
        summary: {
          totalHoldings: 0,
          totalValue: 0,
          totalGains: 0,
          averageIRR: 0,
          averageMOIC: 0,
        },
      };
    }
  }

  // ==========================================
  // INVESTOR UNITS & PORTFOLIO
  // ==========================================

  async getInvestorUnits(investorId: number): Promise<any[]> {
    try {
      const { data, error } = await this.client
        .from("investor_units")
        .select("*")
        .eq("investor_id", investorId)
        .order("purchase_date", { ascending: false });

      if (error) {
        console.error("Error fetching investor units:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error in getInvestorUnits:", error);
      return [];
    }
  }

  async getInvestmentSnapshots(investorId: number): Promise<any[]> {
    try {
      const { data, error } = await this.client
        .from("investment_snapshots")
        .select("*")
        .eq("investor_id", investorId)
        .order("snapshot_date", { ascending: false });

      if (error) {
        console.error("Error fetching investment snapshots:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error in getInvestmentSnapshots:", error);
      return [];
    }
  }

  // ==========================================
  // HELPER METHODS
  // ==========================================

  private getEmptyDashboard(): DashboardData {
    return {
      investor: {
        id: 0,
        public_id: "",
        user_id: null,
        type: "individual",
        name: "",
        email: "",
        phone: null,
        country: null,
        kyc_status: "pending",
        accredited: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      summary: {
        totalCommitted: 0,
        totalCalled: 0,
        totalDistributed: 0,
        currentValue: 0,
        totalGains: 0,
        portfolioIRR: 0,
        portfolioMOIC: 0,
        activeDeals: 0,
      },
      recentActivity: [],
      upcomingCalls: [],
    };
  }

  private mapDealFromDb(dbDeal: any): Deal {
    return {
      id: dbDeal.id,
      name: dbDeal.name,
      slug:
        dbDeal.slug || dbDeal.name?.toLowerCase().replace(/\s+/g, "-") || "",
      company_id: dbDeal.company_id,
      type: dbDeal.type || "primary",
      stage: dbDeal.stage || "active",
      opening_date: dbDeal.opening_date,
      closing_date: dbDeal.closing_date,
      target_raise: undefined as any,
      current_raise: undefined as any,
      minimum_investment: 50000,
      currency: dbDeal.currency || "USD",
      description: null,
      created_at: dbDeal.created_at || new Date().toISOString(),
      updated_at: dbDeal.updated_at || new Date().toISOString(),
    };
  }

  private mapInvestorFromDb(dbInvestor: any): Investor {
    return {
      id: dbInvestor.id,
      public_id: dbInvestor.public_id || "",
      user_id: null,
      type: dbInvestor.type || "individual",
      name: dbInvestor.full_name,
      email: dbInvestor.primary_email,
      phone: null,
      country: dbInvestor.country_residence,
      kyc_status: dbInvestor.status || "pending",
      accredited: false,
      created_at: dbInvestor.created_at,
      updated_at: dbInvestor.updated_at,
    };
  }

  private mapCompanyFromDb(dbCompany: any): Company {
    return {
      id: dbCompany.id,
      name: dbCompany.name,
      type: dbCompany.type || null,
      sector: dbCompany.sector,
      country: dbCompany.country,
      website: dbCompany.website,
      created_at: dbCompany.created_at,
      updated_at: dbCompany.updated_at,
    } as any;
  }

  private mapTransactionFromDb(dbTx: any): Transaction {
    return {
      id: dbTx.transaction_id,
      public_id: dbTx.public_id,
      investor_id: dbTx.investor_id,
      deal_id: dbTx.deal_id,
      type: dbTx.transaction_type || "investment",
      amount: dbTx.gross_capital || dbTx.amount,
      currency: dbTx.currency || "USD",
      status: dbTx.status || "completed",
      fee_amount: null,
      reference: null,
      description: null,
      processed_at: null,
      created_at: dbTx.created_at,
      updated_at: dbTx.updated_at,
    };
  }

  private calculateIRR(transactions: Transaction[]): number {
    // Simplified IRR calculation - in production, use proper XIRR formula
    if (transactions.length === 0) return 0;

    const totalInflows = transactions
      .filter((t) => t.type === "distribution")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalOutflows = transactions
      .filter((t) => t.type === "capital_call")
      .reduce((sum, t) => sum + t.amount, 0);

    if (totalOutflows === 0) return 0;

    // Simplified return calculation
    const simpleReturn = ((totalInflows - totalOutflows) / totalOutflows) * 100;
    return Math.round(simpleReturn * 100) / 100;
  }
}

// Export for backward compatibility
export const SupabaseAdapter = UnifiedSupabaseAdapter;
export const SimpleSupabaseAdapter = UnifiedSupabaseAdapter;
