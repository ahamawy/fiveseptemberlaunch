/**
 * Database Client Abstraction
 * 
 * CRITICAL: Supabase is the SINGLE SOURCE OF TRUTH
 * Mock data should NEVER be used in production
 * All data operations MUST go through Supabase
 */

import { MockAdapter } from "./mock-adapter";
import { UnifiedSupabaseAdapter } from "./supabase-unified";
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
} from "./types";

// Runtime check for data source - always check at runtime
const checkUseMockData = () => {
  // Server-side: always use env variable
  if (typeof window === "undefined") {
    return process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";
  }

  // Client-side: check localStorage first, then env
  const localStorageSetting = localStorage.getItem("equitie-use-mock-data");
  if (localStorageSetting !== null) {
    return localStorageSetting !== "false";
  }

  // Fall back to environment variable
  return process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";
};

// Check if Supabase is properly configured
const checkSupabaseEnabled = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // On server prefer service role; on client require anon
  if (typeof window === "undefined") {
    const serviceKey =
      process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
    return !!(url && serviceKey && url !== "https://placeholder.supabase.co");
  }
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !!(url && anonKey && url !== "https://placeholder.supabase.co");
};

/**
 * Database Client Interface
 * All methods return promises to match Supabase's async nature
 */
export interface IDataClient {
  // Deals
  getDeals(filters?: DealFilters): Promise<Deal[]>;
  getDealById(id: number): Promise<Deal | null>;
  getDealBySlug(slug: string): Promise<Deal | null>;
  createDeal(input: {
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
  }): Promise<Deal>;

  // Investors
  getInvestors(): Promise<Investor[]>;
  getInvestorById(id: number): Promise<Investor | null>;
  getInvestorByPublicId(publicId: string): Promise<Investor | null>;
  getCurrentInvestor(): Promise<Investor | null>;

  // Companies
  getCompanies(): Promise<Company[]>;
  getCompanyById(id: number): Promise<Company | null>;

  // Commitments
  getCommitments(investorId?: number): Promise<Commitment[]>;
  getCommitmentById(id: number): Promise<Commitment | null>;
  getCommitmentsByDealId(dealId: number): Promise<Commitment[]>;

  // Transactions
  getTransactions(filters?: TransactionFilters): Promise<Transaction[]>;
  getTransactionById(id: number): Promise<Transaction | null>;

  // Documents
  getDocuments(filters?: DocumentFilters): Promise<Document[]>;
  getDocumentById(id: number): Promise<Document | null>;

  // Dashboard & Portfolio
  getDashboardData(investorId: number): Promise<DashboardData>;
  getPortfolioData(investorId: number): Promise<PortfolioData>;
}

/**
 * Database Client Factory
 * Returns appropriate client based on environment configuration
 */
class DataClientFactory {
  private static mockInstance: IDataClient | null = null;
  private static supabaseInstance: IDataClient | null = null;

  static getClient(): IDataClient {
    // PRODUCTION: Always use Supabase as the source of truth
    const supabaseEnabled = checkSupabaseEnabled();
    
    // In production, ALWAYS use Supabase
    if (process.env.NODE_ENV === 'production') {
      if (!supabaseEnabled) {
        throw new Error('CRITICAL: Supabase not configured in production. Supabase is the ONLY source of truth.');
      }
      if (!this.supabaseInstance) {
        console.log("🚀 Creating Supabase Adapter (PRODUCTION - Source of Truth)");
        this.supabaseInstance = new UnifiedSupabaseAdapter({ useViews: false });
      }
      return this.supabaseInstance;
    }

    // Development only: Allow mock data for testing
    const useMockData = checkUseMockData();
    
    // Use mock ONLY in development and if explicitly set
    if (useMockData && process.env.NODE_ENV === 'development') {
      if (!this.mockInstance) {
        console.warn("⚠️ Using Mock Data Adapter (DEVELOPMENT ONLY - Not for production)");
        this.mockInstance = new MockAdapter();
      }
      return this.mockInstance;
    } else {
      if (!supabaseEnabled) {
        throw new Error('Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and keys.');
      }
      if (!this.supabaseInstance) {
        console.log("🚀 Creating Supabase Adapter (Source of Truth)");
        this.supabaseInstance = new UnifiedSupabaseAdapter({ useViews: false });
      }
      return this.supabaseInstance;
    }
  }

  static resetClient(): void {
    // Clear both instances to force recreation
    this.mockInstance = null;
    this.supabaseInstance = null;
    console.log("🔄 Data clients reset");
  }

  static getCurrentMode(): "mock" | "supabase" {
    const useMockData = checkUseMockData();
    const supabaseEnabled = checkSupabaseEnabled();
    return useMockData || !supabaseEnabled ? "mock" : "supabase";
  }
}

// Export the client getter
export const getDataClient = () => DataClientFactory.getClient();

// Export a default client instance for convenience
export const dataClient = getDataClient();

// Helper function to check if using mock data
export const isUsingMockData = () =>
  checkUseMockData() || !checkSupabaseEnabled();

// Export factory methods for external use
export const resetDataClient = () => DataClientFactory.resetClient();
export const getCurrentDataMode = () => DataClientFactory.getCurrentMode();

// Helper function to simulate API delay in development
export const simulateDelay = async (ms: number = 0) => {
  if (process.env.NODE_ENV === "development" && checkUseMockData()) {
    const delay = parseInt(process.env.NEXT_PUBLIC_MOCK_DELAY_MS || "0");
    if (delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, ms || delay));
    }
  }
};
