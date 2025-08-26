/**
 * Unified Supabase Data Adapter
 * Consolidates both simple and complex adapter functionality
 * Configurable to use either database views or direct tables
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { createLogger } from "@/lib/utils/improved-logger";
import type { IDataClient } from "./client";

const logger = createLogger("SupabaseAdapter");
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

// Database types for raw Supabase data
interface DbInvestorUnit {
  id: number;
  investor_id: number;
  deal_id: number;
  investment_amount?: string;
  net_capital?: string;
  realized_gain_loss?: string;
  unrealized_gain_loss?: string;
  current_value?: string;
  status?: string;
  purchase_date?: string;
}

interface DbTransaction {
  id: number;
  type: string;
  deal_id: number;
  amount: number;
  transaction_date: string;
  investor_id: number;
}

interface DbDeal {
  id: number;
  name: string;
  slug: string;
  company_id: number;
  status: string;
  target_raise: number;
  min_investment: number;
  current_raise: number;
  start_date: string;
  close_date?: string;
  irr?: number;
  moic?: number;
  description?: string;
}

interface DbInvestor {
  id: number;
  public_id?: string;
  full_name: string;
  primary_email: string;
  investor_type: string;
  commitment_amount: number;
  paid_amount: number;
  created_at: string;
  kyc_status?: string;
}

interface DbCompany {
  id: number;
  name: string;
  industry: string;
  sector?: string;
  founded?: string;
  headquarters?: string;
  website?: string;
  description?: string;
  logo_url?: string;
  status?: string;
}

interface UpcomingCall {
  id: number;
  dealName: string;
  amount: number;
  dueDate: string;
  status: string;
}

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
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        "Missing Supabase configuration. Please set NEXT_PUBLIC_SUPABASE_URL and (NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY)"
      );
    }

    // Debug: Log which key format is being used (first 20 chars only for security)
    const keyPreview = supabaseKey.substring(0, 20) + "...";
    logger.info(`Using Supabase key: ${keyPreview}`);

    this.client = createClient<Database>(supabaseUrl, supabaseKey);
    this.useViews = options?.useViews ?? false; // Default to using clean tables for better performance

    logger.info(
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
      // Use clean table for better performance
      let query = this.client
        .from("deals_clean")
        .select("*")
        .order("deal_id", { ascending: false });

      // Apply filters
      if (filters?.stage) {
        query = query.eq("stage", filters.stage);
      }
      if (filters?.search) {
        query = query.ilike("name", `%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) {
        logger.error("Error fetching deals:", error);
        return [];
      }

      // Map database fields to TypeScript fields
      return (data || []).map(this.mapDealFromDb);
    } catch (error) {
      logger.error("Error in getDeals:", error);
      return [];
    }
  }

  async getDealById(id: number): Promise<Deal | null> {
    try {
      const { data, error } = await this.client
        .from("deals_clean")
        .select("*")
        .eq("deal_id", id)
        .single();

      if (error) {
        logger.error("Error fetching deal:", error);
        return null;
      }

      return data ? this.mapDealFromDb(data) : null;
    } catch (error) {
      logger.error("Error in getDealById:", error);
      return null;
    }
  }

  async getDealBySlug(slug: string): Promise<Deal | null> {
    try {
      const { data, error } = await this.client
        .from("deals_clean")
        .select("*")
        .eq("slug", slug)
        .single();

      if (error) {
        logger.error("Error fetching deal by slug:", error);
        return null;
      }

      return data ? this.mapDealFromDb(data) : null;
    } catch (error) {
      logger.error("Error in getDealBySlug:", error);
      return null;
    }
  }

  async createDeal(input: {
    name: string;
    company_id?: number | null;
    stage: Deal["stage"];
    type: Deal["type"];
    currency: string;
    opening_date?: string | null;
    closing_date?: string | null;
    target_raise?: number | null;
    current_raise?: number | null;
    minimum_investment?: number | null;
    slug: string;
  }): Promise<Deal> {
    const now = new Date().toISOString();
    const toInsert = {
      name: input.name,
      slug: input.slug,
      company_id: input.company_id ?? null,
      type: input.type,
      stage: input.stage,
      currency: input.currency,
      opening_date: input.opening_date ?? null,
      closing_date: input.closing_date ?? null,
      target_raise: input.target_raise ?? null,
      current_raise: input.current_raise ?? 0,
      minimum_investment: input.minimum_investment ?? null,
      description: null,
      created_at: now,
      updated_at: now,
      code: `DEAL-${Math.floor(Date.now() / 1000)}`,
      public_id: `deal_${Math.floor(Date.now() / 1000)}`,
      unit_price_init: null,
    } as any;

    const { data, error } = await this.client
      .from("deals_clean")
      .insert(toInsert)
      .select("*")
      .single();

    if (error) {
      logger.error("Error creating deal:", error);
      throw new Error(error.message || "Failed to create deal");
    }

    return this.mapDealFromDb(data as any);
  }

  // ==========================================
  // INVESTORS
  // ==========================================

  async getInvestors(): Promise<Investor[]> {
    try {
      const { data, error } = await this.client
        .from("investors_clean")
        .select("*")
        .order("investor_id");

      if (error) {
        logger.error("Error fetching investors:", error);
        return [];
      }

      return (data || []).map(this.mapInvestorFromDb);
    } catch (error) {
      logger.error("Error in getInvestors:", error);
      return [];
    }
  }

  async getInvestorById(id: number): Promise<Investor | null> {
    try {
      const { data, error } = await this.client
        .from("investors_clean")
        .select("*")
        .eq("investor_id", id)
        .single();

      if (error) {
        logger.error("Error fetching investor:", error);
        return null;
      }

      return data ? this.mapInvestorFromDb(data) : null;
    } catch (error) {
      logger.error("Error in getInvestorById:", error);
      return null;
    }
  }

  async getInvestorByPublicId(publicId: string): Promise<Investor | null> {
    try {
      const { data, error } = await this.client
        .from("investors_clean")
        .select("*")
        .eq("public_id", publicId)
        .single();

      if (error) {
        logger.error("Error fetching investor by public_id:", error);
        return null;
      }

      return data ? this.mapInvestorFromDb(data) : null;
    } catch (error) {
      logger.error("Error in getInvestorByPublicId:", error);
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
        .from("companies_clean")
        .select("*")
        .order("company_id");

      if (error) {
        logger.error("Error fetching companies:", error);
        return [];
      }

      return (data || []).map(this.mapCompanyFromDb);
    } catch (error) {
      logger.error("Error in getCompanies:", error);
      return [];
    }
  }

  async getCompanyById(id: number): Promise<Company | null> {
    try {
      const { data, error } = await this.client
        .from("companies_clean")
        .select("*")
        .eq("company_id", id)
        .single();

      if (error) {
        logger.error("Error fetching company:", error);
        return null;
      }

      return data ? this.mapCompanyFromDb(data) : null;
    } catch (error) {
      logger.error("Error in getCompanyById:", error);
      return null;
    }
  }

  // ==========================================
  // COMMITMENTS
  // ==========================================

  async getCommitments(investorId?: number): Promise<Commitment[]> {
    try {
      const tableName = "investor_units";
      let query = this.client
        .from(tableName)
        .select("*")
        .order("id", { ascending: false });

      if (investorId) {
        query = query.eq("investor_id", investorId);
      }

      const { data, error } = await query;

      if (error) {
        logger.error("Error fetching commitments:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      logger.error("Error in getCommitments:", error);
      return [];
    }
  }

  async getCommitmentById(id: number): Promise<Commitment | null> {
    try {
      const tableName = "investor_units";
      const { data, error } = await this.client
        .from(tableName)
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        logger.error("Error fetching commitment:", error);
        return null;
      }

      return data;
    } catch (error) {
      logger.error("Error in getCommitmentById:", error);
      return null;
    }
  }

  async getCommitmentsByDealId(dealId: number): Promise<Commitment[]> {
    try {
      const tableName = "investor_units";
      const { data, error } = await this.client
        .from(tableName)
        .select("*")
        .eq("deal_id", dealId)
        .order("commitment_date", { ascending: false });

      if (error) {
        logger.error("Error fetching commitments by deal:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      logger.error("Error in getCommitmentsByDealId:", error);
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
        : "transactions_clean";
      let query = this.client
        .from(tableName)
        .select("*")
        .order("transaction_date", {
          ascending: false,
        });

      if (filters?.investor_id) {
        query = query.eq("investor_id", filters.investor_id);
      }
      if (filters?.deal_id) {
        query = query.eq("deal_id", filters.deal_id);
      }
      if (filters?.type) {
        query = query.eq("transaction_type", filters.type);
      }
      if (filters?.from_date) {
        query = query.gte("transaction_date", filters.from_date);
      }
      if (filters?.to_date) {
        query = query.lte("transaction_date", filters.to_date);
      }

      const { data, error } = await query;

      if (error) {
        logger.error("Error fetching transactions:", error);
        return [];
      }

      return (data || []).map(this.mapTransactionFromDb);
    } catch (error) {
      logger.error("Error in getTransactions:", error);
      return [];
    }
  }

  async getTransactionById(id: number): Promise<Transaction | null> {
    try {
      const tableName = this.useViews
        ? "transactions.transaction.primary"
        : "transactions_clean";
      const { data, error } = await this.client
        .from(tableName)
        .select("*")
        .eq(this.useViews ? "transaction_id" : "id", id)
        .single();

      if (error) {
        logger.error("Error fetching transaction:", error);
        return null;
      }

      return data ? this.mapTransactionFromDb(data) : null;
    } catch (error) {
      logger.error("Error in getTransactionById:", error);
      return null;
    }
  }

  // ==========================================
  // DOCUMENTS
  // ==========================================

  async getDocuments(filters?: DocumentFilters): Promise<Document[]> {
    try {
      const tableName = "documents";
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
        logger.error("Error fetching documents:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      logger.error("Error in getDocuments:", error);
      return [];
    }
  }

  async getDocumentById(id: number): Promise<Document | null> {
    try {
      const tableName = "documents";
      const { data, error } = await this.client
        .from(tableName)
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        logger.error("Error fetching document:", error);
        return null;
      }

      return data;
    } catch (error) {
      logger.error("Error in getDocumentById:", error);
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
        (sum: number, u: DbInvestorUnit) =>
          sum + parseFloat(u.investment_amount || "0"),
        0
      );

      const totalCalled = units.reduce(
        (sum: number, u: DbInvestorUnit) =>
          sum + parseFloat(u.net_capital || "0"),
        0
      );

      const totalDistributed = units.reduce(
        (sum: number, u: DbInvestorUnit) =>
          sum + parseFloat(u.realized_gain_loss || "0"),
        0
      );

      const currentValue = units.reduce(
        (sum: number, u: DbInvestorUnit) =>
          sum + parseFloat(u.current_value || "0"),
        0
      );

      const totalGains = units.reduce(
        (sum: number, u: DbInvestorUnit) =>
          sum +
          parseFloat(u.unrealized_gain_loss || "0") +
          parseFloat(u.realized_gain_loss || "0"),
        0
      );

      // Count active deals
      const activeDeals = units.filter(
        (u: DbInvestorUnit) => u.status === "Active"
      ).length;

      // Calculate portfolio IRR and MOIC
      const portfolioMOIC = totalCalled > 0 ? currentValue / totalCalled : 0;
      const portfolioIRR = this.calculatePortfolioIRR(units);

      // Get recent activity (last 5 transactions)
      const recentActivity = transactions.slice(0, 5).map((t: Transaction) => ({
        id: t.id.toString(),
        type: t.type,
        description: `${t.type} - Deal #${t.deal_id}`,
        amount: t.amount,
        date: t.created_at,
      }));

      // Upcoming calls (mock for now)
      const upcomingCalls: DashboardData["upcomingCalls"] = [];

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
      logger.error("Error in getDashboardData:", error);
      return this.getEmptyDashboard();
    }
  }

  private calculatePortfolioIRR(units: DbInvestorUnit[]): number {
    // Simplified portfolio IRR calculation
    if (units.length === 0) return 0;

    let totalWeightedIRR = 0;
    let totalWeight = 0;

    for (const unit of units) {
      const investmentAmount = parseFloat(unit.net_capital || "0");
      const currentValue = parseFloat(unit.current_value || "0");
      const purchaseDate = unit.purchase_date
        ? new Date(unit.purchase_date)
        : new Date();
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
      logger.error("Error in getPortfolioData:", error);
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

  async getInvestorUnits(investorId: number): Promise<DbInvestorUnit[]> {
    try {
      const { data, error } = await this.client
        .from("investor_units")
        .select("*")
        .eq("investor_id", investorId)
        .order("purchase_date", { ascending: false });

      if (error) {
        logger.error("Error fetching investor units:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      logger.error("Error in getInvestorUnits:", error);
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
        logger.error("Error fetching investment snapshots:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      logger.error("Error in getInvestmentSnapshots:", error);
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
    const dealId = dbDeal.deal_id ?? dbDeal.id;
    const dealName = dbDeal.deal_name ?? dbDeal.name;
    return {
      public_id: `deal_${dealId}`,
      id: dealId,
      code: `DEAL-${dealId}`,
      name: dealName,
      slug:
        dbDeal.slug || dealName?.toLowerCase().replace(/\s+/g, "-") || "",
      company_id: dbDeal.underlying_company_id ?? dbDeal.company_id,
      type: dbDeal.deal_type ?? dbDeal.type ?? "primary",
      stage: dbDeal.deal_status ?? dbDeal.stage ?? "active",
      opening_date:
        dbDeal.deal_date ?? dbDeal.opening_date ?? dbDeal.start_date ?? null,
      closing_date:
        dbDeal.exit_date ?? dbDeal.closing_date ?? dbDeal.close_date ?? null,
      unit_price_init: dbDeal.initial_unit_price ?? null,
      target_raise: dbDeal.gross_capital ?? dbDeal.target_raise ?? null,
      current_raise: dbDeal.gross_capital ?? dbDeal.current_raise ?? null,
      minimum_investment:
        dbDeal.minimum_investment ??
        dbDeal.min_investment ??
        null,
      currency: dbDeal.deal_currency ?? dbDeal.currency ?? "USD",
      description: null,
      created_at: dbDeal.created_at || new Date().toISOString(),
      updated_at: dbDeal.updated_at || new Date().toISOString(),
    };
  }

  private mapInvestorFromDb(dbInvestor: any): Investor {
    const investorId = dbInvestor.investor_id ?? dbInvestor.id;
    return {
      id: investorId,
      public_id: dbInvestor.public_id || "",
      user_id: null,
      type:
        (dbInvestor as any).type ||
        (dbInvestor as any).investor_type ||
        "individual",
      name: dbInvestor.full_name,
      email: dbInvestor.primary_email,
      phone: null,
      country:
        (dbInvestor as any).country_residence ||
        (dbInvestor as any).country ||
        null,
      kyc_status:
        (dbInvestor as any).status ||
        (dbInvestor as any).kyc_status ||
        "pending",
      accredited: false,
      created_at: dbInvestor.created_at as any,
      updated_at: (dbInvestor as any).updated_at || new Date().toISOString(),
    };
  }

  private mapCompanyFromDb(dbCompany: any): Company {
    const companyId = dbCompany.company_id ?? dbCompany.id;
    return {
      id: companyId,
      name: dbCompany.name,
      type: (dbCompany as any).type || null,
      sector: (dbCompany as any).sector || null,
      country: (dbCompany as any).country || null,
      website: (dbCompany as any).website || null,
      created_at: (dbCompany as any).created_at || new Date().toISOString(),
      updated_at: (dbCompany as any).updated_at || new Date().toISOString(),
    } as any;
  }

  private mapTransactionFromDb(dbTx: DbTransaction): Transaction {
    return {
      id: (dbTx as any).transaction_id ?? dbTx.id,
      public_id:
        (dbTx as any).public_id ||
        `txn_${(dbTx as any).transaction_id ?? dbTx.id}`,
      investor_id: dbTx.investor_id,
      deal_id: dbTx.deal_id,
      type: (dbTx as any).transaction_type || dbTx.type,
      amount: (dbTx as any).gross_capital ?? dbTx.amount,
      currency: (dbTx as any).currency || "USD",
      status: (dbTx as any).status || "completed",
      fee_amount: null,
      reference: null,
      description: null,
      processed_at: null,
      created_at:
        (dbTx as any).created_at ||
        (dbTx as any).transaction_date ||
        new Date().toISOString(),
      updated_at:
        (dbTx as any).updated_at ||
        (dbTx as any).transaction_date ||
        new Date().toISOString(),
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
