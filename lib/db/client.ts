/**
 * Database Client Abstraction
 * Switches between mock data and Supabase based on environment configuration
 */

import { MockAdapter } from './mock-adapter';
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
  PortfolioData
} from './types';

// Check if we should use mock data
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';
const ENABLE_SUPABASE = process.env.NEXT_PUBLIC_ENABLE_SUPABASE === 'true';

/**
 * Database Client Interface
 * All methods return promises to match Supabase's async nature
 */
export interface IDataClient {
  // Deals
  getDeals(filters?: DealFilters): Promise<Deal[]>;
  getDealById(id: number): Promise<Deal | null>;
  getDealBySlug(slug: string): Promise<Deal | null>;
  
  // Investors
  getInvestors(): Promise<Investor[]>;
  getInvestorById(id: number): Promise<Investor | null>;
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
 * Supabase Client Implementation (Future)
 * Will be implemented when Supabase is enabled
 */
class SupabaseClient implements IDataClient {
  constructor() {
    console.warn('Supabase client initialized but not yet implemented');
  }

  async getDeals(filters?: DealFilters): Promise<Deal[]> {
    // TODO: Implement Supabase query
    throw new Error('Supabase not yet implemented. Set NEXT_PUBLIC_USE_MOCK_DATA=true');
  }

  async getDealById(id: number): Promise<Deal | null> {
    throw new Error('Supabase not yet implemented');
  }

  async getDealBySlug(slug: string): Promise<Deal | null> {
    throw new Error('Supabase not yet implemented');
  }

  async getInvestors(): Promise<Investor[]> {
    throw new Error('Supabase not yet implemented');
  }

  async getInvestorById(id: number): Promise<Investor | null> {
    throw new Error('Supabase not yet implemented');
  }

  async getCurrentInvestor(): Promise<Investor | null> {
    throw new Error('Supabase not yet implemented');
  }

  async getCompanies(): Promise<Company[]> {
    throw new Error('Supabase not yet implemented');
  }

  async getCompanyById(id: number): Promise<Company | null> {
    throw new Error('Supabase not yet implemented');
  }

  async getCommitments(investorId?: number): Promise<Commitment[]> {
    throw new Error('Supabase not yet implemented');
  }

  async getCommitmentById(id: number): Promise<Commitment | null> {
    throw new Error('Supabase not yet implemented');
  }

  async getCommitmentsByDealId(dealId: number): Promise<Commitment[]> {
    throw new Error('Supabase not yet implemented');
  }

  async getTransactions(filters?: TransactionFilters): Promise<Transaction[]> {
    throw new Error('Supabase not yet implemented');
  }

  async getTransactionById(id: number): Promise<Transaction | null> {
    throw new Error('Supabase not yet implemented');
  }

  async getDocuments(filters?: DocumentFilters): Promise<Document[]> {
    throw new Error('Supabase not yet implemented');
  }

  async getDocumentById(id: number): Promise<Document | null> {
    throw new Error('Supabase not yet implemented');
  }

  async getDashboardData(investorId: number): Promise<DashboardData> {
    throw new Error('Supabase not yet implemented');
  }

  async getPortfolioData(investorId: number): Promise<PortfolioData> {
    throw new Error('Supabase not yet implemented');
  }
}

/**
 * Database Client Factory
 * Returns appropriate client based on environment configuration
 */
class DataClientFactory {
  private static instance: IDataClient | null = null;

  static getClient(): IDataClient {
    if (!this.instance) {
      if (USE_MOCK_DATA || !ENABLE_SUPABASE) {
        console.log('🔧 Using Mock Data Adapter');
        this.instance = new MockAdapter();
      } else {
        console.log('🔧 Using Supabase Client');
        this.instance = new SupabaseClient();
      }
    }
    return this.instance;
  }

  static resetClient(): void {
    this.instance = null;
  }
}

// Export the client getter
export const getDataClient = () => DataClientFactory.getClient();

// Export a default client instance for convenience
export const dataClient = getDataClient();

// Helper function to check if using mock data
export const isUsingMockData = () => USE_MOCK_DATA || !ENABLE_SUPABASE;

// Helper function to simulate API delay in development
export const simulateDelay = async (ms: number = 0) => {
  if (process.env.NODE_ENV === 'development' && USE_MOCK_DATA) {
    const delay = parseInt(process.env.NEXT_PUBLIC_MOCK_DELAY_MS || '0');
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, ms || delay));
    }
  }
};