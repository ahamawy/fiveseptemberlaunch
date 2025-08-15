/**
 * Unified Supabase Data Adapter
 * Consolidates both simple and complex adapter functionality
 * Configurable to use either database views or direct tables
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { IDataClient } from './client';
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
  Database
} from './types';

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
    const supabaseKey = options?.anonKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
    }

    this.client = createClient<Database>(supabaseUrl, supabaseKey);
    this.useViews = options?.useViews ?? true; // Default to using views for simplicity
    
    console.log(`✅ Unified Supabase client initialized (mode: ${this.useViews ? 'views' : 'tables'})`);
  }

  // ==========================================
  // DEALS
  // ==========================================

  async getDeals(filters?: DealFilters): Promise<Deal[]> {
    try {
      let query = (this.useViews ? (this.client as any).schema('analytics').from('v_deals') : this.client.from('deals'))
        .select('*')
        .order('id', { ascending: false });

      // Apply filters
      if (filters?.stage) {
        const columnName = this.useViews ? 'stage' : 'deal_stage';
        query = query.eq(columnName, filters.stage);
      }
      // status/investor filters not in DealFilters; keep stage/search only
      if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching deals:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getDeals:', error);
      return [];
    }
  }

  async getDealById(id: number): Promise<Deal | null> {
    try {
      const { data, error } = await (this.useViews ? (this.client as any).schema('analytics').from('v_deals') : this.client.from('deals'))
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching deal:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getDealById:', error);
      return null;
    }
  }

  async getDealBySlug(slug: string): Promise<Deal | null> {
    try {
      const { data, error } = await (this.useViews ? (this.client as any).schema('analytics').from('v_deals') : this.client.from('deals'))
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) {
        console.error('Error fetching deal by slug:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getDealBySlug:', error);
      return null;
    }
  }

  // ==========================================
  // INVESTORS
  // ==========================================

  async getInvestors(): Promise<Investor[]> {
    try {
      const { data, error } = await (this.useViews ? (this.client as any).schema('analytics').from('v_investors') : this.client.from('investors'))
        .select('*')
        .order('id');

      if (error) {
        console.error('Error fetching investors:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getInvestors:', error);
      return [];
    }
  }

  async getInvestorById(id: number): Promise<Investor | null> {
    try {
      const { data, error } = await (this.useViews ? (this.client as any).schema('analytics').from('v_investors') : this.client.from('investors'))
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching investor:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getInvestorById:', error);
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
      const { data, error } = await (this.useViews ? (this.client as any).schema('analytics').from('v_companies') : this.client.from('companies'))
        .select('*')
        .order('id');

      if (error) {
        console.error('Error fetching companies:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getCompanies:', error);
      return [];
    }
  }

  async getCompanyById(id: number): Promise<Company | null> {
    try {
      const { data, error } = await (this.useViews ? (this.client as any).schema('analytics').from('v_companies') : this.client.from('companies'))
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching company:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getCompanyById:', error);
      return null;
    }
  }

  // ==========================================
  // COMMITMENTS
  // ==========================================

  async getCommitments(investorId?: number): Promise<Commitment[]> {
    try {
      const tableName = this.useViews ? 'commitments_view' : 'commitments';
      let query = this.client
        .from(tableName)
        .select('*')
        .order('commitment_date', { ascending: false });

      if (investorId) {
        query = query.eq('investor_id', investorId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching commitments:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getCommitments:', error);
      return [];
    }
  }

  async getCommitmentById(id: number): Promise<Commitment | null> {
    try {
      const tableName = this.useViews ? 'commitments_view' : 'commitments';
      const { data, error } = await this.client
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching commitment:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getCommitmentById:', error);
      return null;
    }
  }

  async getCommitmentsByDealId(dealId: number): Promise<Commitment[]> {
    try {
      const tableName = this.useViews ? 'commitments_view' : 'commitments';
      const { data, error } = await this.client
        .from(tableName)
        .select('*')
        .eq('deal_id', dealId)
        .order('commitment_date', { ascending: false });

      if (error) {
        console.error('Error fetching commitments by deal:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getCommitmentsByDealId:', error);
      return [];
    }
  }

  // ==========================================
  // TRANSACTIONS
  // ==========================================

  async getTransactions(filters?: TransactionFilters): Promise<Transaction[]> {
    try {
      let query = (this.useViews ? (this.client as any).schema('analytics').from('v_transactions') : this.client.from('transactions'))
        .select('*')
        .order('transaction_date', { ascending: false });

      if (filters?.investor_id) {
        query = query.eq('investor_id', filters.investor_id);
      }
      if (filters?.deal_id) {
        query = query.eq('deal_id', filters.deal_id);
      }
      if (filters?.type) {
        query = query.eq('type', filters.type);
      }
      if (filters?.from_date) {
        query = query.gte('transaction_date', filters.from_date);
      }
      if (filters?.to_date) {
        query = query.lte('transaction_date', filters.to_date);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching transactions:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getTransactions:', error);
      return [];
    }
  }

  async getTransactionById(id: number): Promise<Transaction | null> {
    try {
      const tableName = this.useViews ? 'transactions_view' : 'transactions';
      const { data, error } = await this.client
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching transaction:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getTransactionById:', error);
      return null;
    }
  }

  // ==========================================
  // DOCUMENTS
  // ==========================================

  async getDocuments(filters?: DocumentFilters): Promise<Document[]> {
    try {
      const tableName = this.useViews ? 'documents_view' : 'documents';
      let query = this.client
        .from(tableName)
        .select('*')
        .order('uploaded_date', { ascending: false });

      if (filters?.investor_id) {
        query = query.eq('investor_id', filters.investor_id);
      }
      if (filters?.deal_id) {
        query = query.eq('deal_id', filters.deal_id);
      }
      if (filters?.type) {
        query = query.eq('type', filters.type);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching documents:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getDocuments:', error);
      return [];
    }
  }

  async getDocumentById(id: number): Promise<Document | null> {
    try {
      const tableName = this.useViews ? 'documents_view' : 'documents';
      const { data, error } = await this.client
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching document:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getDocumentById:', error);
      return null;
    }
  }

  // ==========================================
  // DASHBOARD & PORTFOLIO
  // ==========================================

  async getDashboardData(investorId: number): Promise<DashboardData> {
    try {
      // For views mode, use pre-aggregated view
      if (this.useViews) {
        const { data, error } = await this.client
          .from('dashboard_view')
          .select('*')
          .eq('investor_id', investorId)
          .single();

        if (error || !data) {
          console.error('Error fetching dashboard data:', error);
          return this.getEmptyDashboard();
        }

        return data as unknown as DashboardData;
      }

      // Fallback: return empty dashboard shape
      return this.getEmptyDashboard();
    } catch (error) {
      console.error('Error in getDashboardData:', error);
      return this.getEmptyDashboard();
    }
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
          averageMOIC: 0
        }
      };
    } catch (error) {
      console.error('Error in getPortfolioData:', error);
      return {
        holdings: [],
        summary: {
          totalHoldings: 0,
          totalValue: 0,
          totalGains: 0,
          averageIRR: 0,
          averageMOIC: 0
        }
      };
    }
  }

  // ==========================================
  // HELPER METHODS
  // ==========================================

  private getEmptyDashboard(): DashboardData {
    return {
      investor: {
        id: 0,
        public_id: '',
        user_id: null,
        type: 'individual',
        name: '',
        email: '',
        phone: null,
        country: null,
        kyc_status: 'pending',
        accredited: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      summary: {
        totalCommitted: 0,
        totalCalled: 0,
        totalDistributed: 0,
        currentValue: 0,
        totalGains: 0,
        portfolioIRR: 0,
        portfolioMOIC: 0,
        activeDeals: 0
      },
      recentActivity: [],
      upcomingCalls: []
    };
  }

  private calculateIRR(transactions: Transaction[]): number {
    // Simplified IRR calculation - in production, use proper XIRR formula
    if (transactions.length === 0) return 0;
    
    const totalInflows = transactions
      .filter(t => t.type === 'distribution')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalOutflows = transactions
      .filter(t => t.type === 'capital_call')
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