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
      const tableName = this.useViews ? 'deals_view' : 'deals';
      let query = this.client
        .from(tableName)
        .select('*')
        .order('id', { ascending: false });

      // Apply filters
      if (filters?.stage) {
        const columnName = this.useViews ? 'stage' : 'deal_stage';
        query = query.eq(columnName, filters.stage);
      }
      if (filters?.status) {
        const columnName = this.useViews ? 'status' : 'deal_status';
        query = query.eq(columnName, filters.status);
      }
      if (filters?.investorId) {
        query = query.eq('investor_id', filters.investorId);
      }
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
      const tableName = this.useViews ? 'deals_view' : 'deals';
      const { data, error } = await this.client
        .from(tableName)
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
      const tableName = this.useViews ? 'deals_view' : 'deals';
      const { data, error } = await this.client
        .from(tableName)
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
      const tableName = this.useViews ? 'investors_view' : 'investors';
      const { data, error } = await this.client
        .from(tableName)
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
      const tableName = this.useViews ? 'investors_view' : 'investors';
      const { data, error } = await this.client
        .from(tableName)
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
      // Try views first, fall back to direct table if view doesn't exist
      let tableName = this.useViews ? 'companies_view' : 'companies';
      let { data, error } = await this.client
        .from(tableName)
        .select('*')
        .order('id');

      // If view doesn't exist, try direct table
      if (error && error.code === '42P01' && this.useViews) {
        console.log('View not found, falling back to direct table: companies');
        tableName = 'companies';
        const result = await this.client
          .from(tableName)
          .select('*')
          .order('id');
        data = result.data;
        error = result.error;
      }

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
      let tableName = this.useViews ? 'companies_view' : 'companies';
      let { data, error } = await this.client
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single();

      // If view doesn't exist, try direct table
      if (error && error.code === '42P01' && this.useViews) {
        console.log('View not found, falling back to direct table: companies');
        tableName = 'companies';
        const result = await this.client
          .from(tableName)
          .select('*')
          .eq('id', id)
          .single();
        data = result.data;
        error = result.error;
      }

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
      const tableName = this.useViews ? 'transactions_view' : 'transactions';
      let query = this.client
        .from(tableName)
        .select('*')
        .order('transaction_date', { ascending: false });

      if (filters?.investorId) {
        query = query.eq('investor_id', filters.investorId);
      }
      if (filters?.dealId) {
        query = query.eq('deal_id', filters.dealId);
      }
      if (filters?.type) {
        query = query.eq('type', filters.type);
      }
      if (filters?.startDate) {
        query = query.gte('transaction_date', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte('transaction_date', filters.endDate);
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

      if (filters?.investorId) {
        query = query.eq('investor_id', filters.investorId);
      }
      if (filters?.dealId) {
        query = query.eq('deal_id', filters.dealId);
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

        return data;
      }

      // For tables mode, aggregate manually
      const [investor, commitments, transactions] = await Promise.all([
        this.getInvestorById(investorId),
        this.getCommitments(investorId),
        this.getTransactions({ investorId })
      ]);

      if (!investor) {
        return this.getEmptyDashboard();
      }

      const totalCommitted = commitments.reduce((sum, c) => sum + c.amount, 0);
      const totalDeployed = commitments.reduce((sum, c) => sum + c.deployed_amount, 0);
      const totalValue = commitments.reduce((sum, c) => sum + c.current_value, 0);
      const totalReturns = totalValue - totalDeployed;

      return {
        investorId,
        investorName: investor.name,
        totalCommitted,
        totalDeployed,
        totalValue,
        totalReturns,
        irr: this.calculateIRR(transactions),
        multiple: totalDeployed > 0 ? totalValue / totalDeployed : 0,
        activeDeals: commitments.length,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error in getDashboardData:', error);
      return this.getEmptyDashboard();
    }
  }

  async getPortfolioData(investorId: number): Promise<PortfolioData> {
    try {
      const commitments = await this.getCommitments(investorId);
      
      const holdings = await Promise.all(
        commitments.map(async (commitment) => {
          const deal = await this.getDealById(commitment.deal_id);
          const company = deal ? await this.getCompanyById(deal.company_id) : null;

          return {
            dealId: commitment.deal_id,
            dealName: deal?.name || 'Unknown Deal',
            companyName: company?.name || 'Unknown Company',
            investmentDate: commitment.commitment_date,
            investedAmount: commitment.deployed_amount,
            currentValue: commitment.current_value,
            ownership: commitment.ownership_percentage || 0,
            status: deal?.status || 'active'
          };
        })
      );

      const totalInvested = holdings.reduce((sum, h) => sum + h.investedAmount, 0);
      const totalValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);

      return {
        investorId,
        holdings,
        totalInvested,
        totalValue,
        totalReturn: totalValue - totalInvested,
        returnPercentage: totalInvested > 0 ? ((totalValue - totalInvested) / totalInvested) * 100 : 0
      };
    } catch (error) {
      console.error('Error in getPortfolioData:', error);
      return {
        investorId,
        holdings: [],
        totalInvested: 0,
        totalValue: 0,
        totalReturn: 0,
        returnPercentage: 0
      };
    }
  }

  // ==========================================
  // HELPER METHODS
  // ==========================================

  private getEmptyDashboard(): DashboardData {
    return {
      investorId: 0,
      investorName: '',
      totalCommitted: 0,
      totalDeployed: 0,
      totalValue: 0,
      totalReturns: 0,
      irr: 0,
      multiple: 0,
      activeDeals: 0,
      lastUpdated: new Date().toISOString()
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