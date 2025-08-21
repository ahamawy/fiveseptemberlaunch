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
      // Query deals schema explicitly to avoid public-only constraint
      let query = (this.client as any)
        .schema('deals')
        .from('deal')
        .select('*')
        .order('deal_id', { ascending: false });

      // Apply filters
      if (filters?.stage) {
        query = query.eq('deal_status', filters.stage);
      }
      if (filters?.search) {
        query = query.ilike('deal_name', `%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching deals:', error);
        return [];
      }

      // Map database fields to TypeScript fields
      return (data || []).map(this.mapDealFromDb);
    } catch (error) {
      console.error('Error in getDeals:', error);
      return [];
    }
  }

  async getDealById(id: number): Promise<Deal | null> {
    try {
      const { data, error } = await (this.client as any)
        .schema('deals')
        .from('deal')
        .select('*')
        .eq('deal_id', id)
        .single();

      if (error) {
        console.error('Error fetching deal:', error);
        return null;
      }

      return data ? this.mapDealFromDb(data) : null;
    } catch (error) {
      console.error('Error in getDealById:', error);
      return null;
    }
  }

  async getDealBySlug(slug: string): Promise<Deal | null> {
    try {
      // First try to find by slug if column exists, otherwise by name
      const { data, error } = await (this.client as any)
        .schema('deals')
        .from('deal')
        .select('*')
        .ilike('deal_name', slug.replace(/-/g, ' '))
        .single();

      if (error) {
        console.error('Error fetching deal by slug:', error);
        return null;
      }

      return data ? this.mapDealFromDb(data) : null;
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
      const tableName = 'investors.investor';
      const { data, error } = await this.client.from(tableName)
        .select('*')
        .order('investor_id');

      if (error) {
        console.error('Error fetching investors:', error);
        return [];
      }

      return (data || []).map(this.mapInvestorFromDb);
    } catch (error) {
      console.error('Error in getInvestors:', error);
      return [];
    }
  }

  async getInvestorById(id: number): Promise<Investor | null> {
    try {
      const tableName = 'investors.investor';
      const { data, error } = await this.client.from(tableName)
        .select('*')
        .eq('investor_id', id)
        .single();

      if (error) {
        console.error('Error fetching investor:', error);
        return null;
      }

      return data ? this.mapInvestorFromDb(data) : null;
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
      const { data, error } = await (this.client as any)
        .schema('companies')
        .from('company')
        .select('*')
        .order('company_id');

      if (error) {
        console.error('Error fetching companies:', error);
        return [];
      }

      return (data || []).map(this.mapCompanyFromDb);
    } catch (error) {
      console.error('Error in getCompanies:', error);
      return [];
    }
  }

  async getCompanyById(id: number): Promise<Company | null> {
    try {
      const { data, error } = await (this.client as any)
        .schema('companies')
        .from('company')
        .select('*')
        .eq('company_id', id)
        .single();

      if (error) {
        console.error('Error fetching company:', error);
        return null;
      }

      return data ? this.mapCompanyFromDb(data) : null;
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
      const tableName = 'transactions.transaction.primary';
      let query = this.client.from(tableName)
        .select('*')
        .order('transaction_date', { ascending: false });

      if (filters?.investor_id) {
        query = query.eq('investor_id', filters.investor_id);
      }
      if (filters?.deal_id) {
        query = query.eq('deal_id', filters.deal_id);
      }
      if (filters?.type) {
        query = query.eq('transaction_type', filters.type);
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

      return (data || []).map(this.mapTransactionFromDb);
    } catch (error) {
      console.error('Error in getTransactions:', error);
      return [];
    }
  }

  async getTransactionById(id: number): Promise<Transaction | null> {
    try {
      const tableName = 'transactions.transaction.primary';
      const { data, error } = await this.client
        .from(tableName)
        .select('*')
        .eq('transaction_id', id)
        .single();

      if (error) {
        console.error('Error fetching transaction:', error);
        return null;
      }

      return data ? this.mapTransactionFromDb(data) : null;
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
      // Note: v_documents view doesn't exist, using documents table directly
      const tableName = 'documents';
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
      const tableName = 'documents';
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
      // Get investor details
      const investor = await this.getInvestorById(investorId);
      if (!investor) {
        return this.getEmptyDashboard();
      }

      // Get investor units for portfolio data
      const units = await this.getInvestorUnits(investorId);
      
      // Get transactions for the investor
      const transactions = await this.getTransactions({ investor_id: investorId });
      
      // Calculate summary metrics
      const totalCommitted = units.reduce((sum: number, u: any) => 
        sum + parseFloat(u.investment_amount || '0'), 0);
      
      const totalCalled = units.reduce((sum: number, u: any) => 
        sum + parseFloat(u.net_capital || '0'), 0);
      
      const totalDistributed = units.reduce((sum: number, u: any) => 
        sum + parseFloat(u.realized_gain_loss || '0'), 0);
      
      const currentValue = units.reduce((sum: number, u: any) => 
        sum + parseFloat(u.current_value || '0'), 0);
      
      const totalGains = units.reduce((sum: number, u: any) => 
        sum + parseFloat(u.unrealized_gain_loss || '0') + parseFloat(u.realized_gain_loss || '0'), 0);
      
      // Count active deals
      const activeDeals = units.filter((u: any) => u.status === 'Active').length;
      
      // Calculate portfolio IRR and MOIC
      const portfolioMOIC = totalCalled > 0 ? currentValue / totalCalled : 0;
      const portfolioIRR = this.calculatePortfolioIRR(units);
      
      // Get recent activity (last 5 transactions)
      const recentActivity = transactions.slice(0, 5).map((t: any) => ({
        id: t.id.toString(),
        type: t.type,
        description: `${t.type} - Deal #${t.deal_id}`,
        amount: t.amount,
        date: t.transaction_date
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
          activeDeals
        },
        recentActivity,
        upcomingCalls
      };
    } catch (error) {
      console.error('Error in getDashboardData:', error);
      return this.getEmptyDashboard();
    }
  }
  
  private calculatePortfolioIRR(units: any[]): number {
    // Simplified portfolio IRR calculation
    if (units.length === 0) return 0;
    
    let totalWeightedIRR = 0;
    let totalWeight = 0;
    
    for (const unit of units) {
      const investmentAmount = parseFloat(unit.net_capital || '0');
      const currentValue = parseFloat(unit.current_value || '0');
      const purchaseDate = new Date(unit.purchase_date);
      const now = new Date();
      const years = (now.getTime() - purchaseDate.getTime()) / (365 * 24 * 60 * 60 * 1000);
      
      if (years > 0 && investmentAmount > 0) {
        const totalReturn = currentValue / investmentAmount;
        const irr = (Math.pow(totalReturn, 1 / years) - 1) * 100;
        totalWeightedIRR += irr * investmentAmount;
        totalWeight += investmentAmount;
      }
    }
    
    return totalWeight > 0 ? Math.round((totalWeightedIRR / totalWeight) * 10) / 10 : 0;
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
  // INVESTOR UNITS & PORTFOLIO
  // ==========================================

  async getInvestorUnits(investorId: number): Promise<any[]> {
    try {
      const { data, error } = await this.client
        .from('investor_units')
        .select('*')
        .eq('investor_id', investorId)
        .order('purchase_date', { ascending: false });

      if (error) {
        console.error('Error fetching investor units:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getInvestorUnits:', error);
      return [];
    }
  }

  async getInvestmentSnapshots(investorId: number): Promise<any[]> {
    try {
      const { data, error } = await this.client
        .from('investment_snapshots')
        .select('*')
        .eq('investor_id', investorId)
        .order('snapshot_date', { ascending: false });

      if (error) {
        console.error('Error fetching investment snapshots:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getInvestmentSnapshots:', error);
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

  private mapDealFromDb(dbDeal: any): Deal {
    return {
      id: dbDeal.deal_id,
      name: dbDeal.deal_name,
      slug: dbDeal.deal_name?.toLowerCase().replace(/\s+/g, '-') || '',
      company_id: dbDeal.underlying_company_id,
      type: dbDeal.deal_type || 'primary',
      stage: dbDeal.deal_status || 'active',
      opening_date: dbDeal.deal_date,
      closing_date: dbDeal.exit_date,
      target_raise: dbDeal.gross_capital,
      current_raise: dbDeal.initial_net_capital || 0,
      minimum_investment: 50000, // Default value
      currency: dbDeal.deal_currency || 'USD',
      description: null,
      highlights: [],
      documents: [],
      created_at: dbDeal.created_at || new Date().toISOString(),
      updated_at: dbDeal.updated_at || new Date().toISOString()
    };
  }

  private mapInvestorFromDb(dbInvestor: any): Investor {
    return {
      id: dbInvestor.investor_id,
      public_id: dbInvestor.public_id || '',
      user_id: dbInvestor.user_id,
      type: dbInvestor.investor_type || 'individual',
      name: dbInvestor.full_name,
      email: dbInvestor.primary_email,
      phone: dbInvestor.primary_phone,
      country: dbInvestor.country_of_residence,
      kyc_status: dbInvestor.kyc_status || 'pending',
      accredited: dbInvestor.is_accredited || false,
      created_at: dbInvestor.created_at,
      updated_at: dbInvestor.updated_at
    };
  }

  private mapCompanyFromDb(dbCompany: any): Company {
    return {
      id: dbCompany.company_id,
      name: dbCompany.company_name,
      description: dbCompany.company_description,
      industry: dbCompany.company_sector,
      founded: dbCompany.founding_year?.toString(),
      website: dbCompany.company_website,
      logo: dbCompany.company_logo_url,
      valuation: dbCompany.latest_valuation_mil ? dbCompany.latest_valuation_mil * 1000000 : null,
      employees: dbCompany.employee_count,
      headquarters: dbCompany.headquarters_location,
      created_at: dbCompany.created_at,
      updated_at: dbCompany.updated_at
    };
  }

  private mapTransactionFromDb(dbTx: any): Transaction {
    return {
      id: dbTx.transaction_id,
      investor_id: dbTx.investor_id,
      deal_id: dbTx.deal_id,
      type: dbTx.transaction_type || 'investment',
      amount: dbTx.gross_capital || dbTx.amount,
      currency: dbTx.currency || 'USD',
      transaction_date: dbTx.transaction_date,
      status: dbTx.status || 'completed',
      created_at: dbTx.created_at,
      updated_at: dbTx.updated_at
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