/**
 * Supabase Data Adapter
 * Implements IDataClient interface to connect to real Supabase database
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

export class SupabaseAdapter implements IDataClient {
  private client: SupabaseClient<Database>;

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
    }

    this.client = createClient<Database>(supabaseUrl, supabaseKey);
    console.log('✅ Supabase client initialized');
  }

  // ==========================================
  // DEALS
  // ==========================================

  async getDeals(filters?: DealFilters): Promise<Deal[]> {
    try {
      let query = this.client
        .from('deals')
        .select('*')
        .order('id', { ascending: false });

      // Apply filters - mapping to actual schema
      if (filters?.stage) {
        query = query.eq('status', filters.stage); // status maps to stage
      }
      if (filters?.type) {
        query = query.eq('deal_type', filters.type); // deal_type maps to type
      }
      if (filters?.company_id) {
        query = query.eq('underlying_company_id', filters.company_id); // underlying_company_id
      }
      if (filters?.search) {
        query = query.ilike('deal_name', `%${filters.search}%`); // deal_name maps to name
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }
      if (filters?.offset) {
        query = query.range(filters.offset, (filters.offset + (filters.limit || 50)) - 1);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching deals:', error);
        throw new Error(`Failed to fetch deals: ${error.message}`);
      }

      // Transform to match expected interface
      const transformedDeals = (data || []).map(deal => ({
        id: deal.id,
        public_id: `deal_${deal.id}`,
        company_id: deal.underlying_company_id,
        code: `DEAL_${deal.id}`,
        slug: (deal.deal_name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        name: deal.deal_name,
        type: deal.deal_type?.toLowerCase() || 'primary',
        stage: deal.deal_exited ? 'closed' : 'active',
        currency: 'USD',
        opening_date: deal.deal_date,
        closing_date: deal.deal_exited ? deal.deal_date : null,
        unit_price_init: deal.initial_unit_price,
        target_raise: 1000000, // Default as not in schema
        current_raise: 500000, // Default as not in schema
        minimum_investment: 10000, // Default as not in schema
        description: null,
        created_at: deal.deal_date || new Date().toISOString(),
        updated_at: deal.deal_date || new Date().toISOString()
      }));

      return transformedDeals;
    } catch (error) {
      console.error('Error in getDeals:', error);
      throw error;
    }
  }

  async getDealById(id: number): Promise<Deal | null> {
    try {
      const { data, error } = await this.client
        .from('deals')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        console.error('Error fetching deal by ID:', error);
        throw new Error(`Failed to fetch deal: ${error.message}`);
      }

      // Transform to match expected interface
      if (data) {
        return {
          id: data.id,
          public_id: `deal_${data.id}`,
          company_id: data.underlying_company_id,
          code: `DEAL_${data.id}`,
          slug: (data.deal_name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          name: data.deal_name,
          type: data.deal_type?.toLowerCase() || 'primary',
          stage: data.deal_exited ? 'closed' : 'active',
          currency: 'USD',
          opening_date: data.deal_date,
          closing_date: data.deal_exited ? data.deal_date : null,
          unit_price_init: data.initial_unit_price,
          target_raise: 1000000, // Default as not in schema
          current_raise: 500000, // Default as not in schema
          minimum_investment: 10000, // Default as not in schema
          description: null,
          created_at: data.deal_date || new Date().toISOString(),
          updated_at: data.deal_date || new Date().toISOString()
        };
      }

      return null;
    } catch (error) {
      console.error('Error in getDealById:', error);
      throw error;
    }
  }

  async getDealBySlug(slug: string): Promise<Deal | null> {
    try {
      const { data, error } = await this.client
        .from('deals')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        console.error('Error fetching deal by slug:', error);
        throw new Error(`Failed to fetch deal: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in getDealBySlug:', error);
      throw error;
    }
  }

  // ==========================================
  // INVESTORS
  // ==========================================

  async getInvestors(): Promise<Investor[]> {
    try {
      const { data, error } = await this.client
        .from('investors')
        .select('*')
        .order('id', { ascending: false });

      if (error) {
        console.error('Error fetching investors:', error);
        throw new Error(`Failed to fetch investors: ${error.message}`);
      }

      // Transform to match expected interface
      const transformedInvestors = (data || []).map(investor => ({
        id: investor.id,
        public_id: `inv_${investor.id}`,
        user_id: null,
        type: investor.investor_type?.toLowerCase() || 'individual',
        name: investor.full_name,
        email: investor.primary_email,
        phone: investor.phone,
        country: investor.country_of_residence,
        kyc_status: 'verified', // Default as not in schema
        accredited: true, // Assume accredited for now
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      return transformedInvestors;
    } catch (error) {
      console.error('Error in getInvestors:', error);
      throw error;
    }
  }

  async getInvestorById(id: number): Promise<Investor | null> {
    try {
      const { data, error } = await this.client
        .from('investors')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        console.error('Error fetching investor by ID:', error);
        throw new Error(`Failed to fetch investor: ${error.message}`);
      }

      // Transform to match expected interface
      if (data) {
        return {
          id: data.id,
          public_id: `inv_${data.id}`,
          user_id: null,
          type: data.investor_type?.toLowerCase() || 'individual',
          name: data.full_name,
          email: data.primary_email,
          phone: data.phone,
          country: data.country_of_residence,
          kyc_status: 'verified', // Default as not in schema
          accredited: true, // Assume accredited for now
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }

      return null;
    } catch (error) {
      console.error('Error in getInvestorById:', error);
      throw error;
    }
  }

  async getCurrentInvestor(): Promise<Investor | null> {
    // For now, return the first investor as current user
    // In production, this would use authentication context
    try {
      const { data, error } = await this.client
        .from('investors')
        .select('*')
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        console.error('Error fetching current investor:', error);
        throw new Error(`Failed to fetch current investor: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in getCurrentInvestor:', error);
      throw error;
    }
  }

  // ==========================================
  // COMPANIES
  // ==========================================

  async getCompanies(): Promise<Company[]> {
    try {
      const { data, error } = await this.client
        .from('companies.company')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching companies:', error);
        throw new Error(`Failed to fetch companies: ${error.message}`);
      }

      // Map database fields to our interface
      return (data || []).map(row => ({
        id: row.company_id,
        name: row.company_name,
        description: row.company_description,
        website: row.website_url,
        sector: row.industry,
        stage: row.company_stage,
        valuation: row.current_valuation
      }));
    } catch (error) {
      console.error('Error in getCompanies:', error);
      throw error;
    }
  }

  async getCompanyById(id: number): Promise<Company | null> {
    try {
      const { data, error } = await this.client
        .from('companies.company')
        .select('*')
        .eq('company_id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        console.error('Error fetching company by ID:', error);
        throw new Error(`Failed to fetch company: ${error.message}`);
      }

      // Map database fields to our interface
      return data ? {
        id: data.company_id,
        name: data.company_name,
        description: data.company_description,
        website: data.website_url,
        sector: data.industry,
        stage: data.company_stage,
        valuation: data.current_valuation
      } : null;
    } catch (error) {
      console.error('Error in getCompanyById:', error);
      throw error;
    }
  }

  // ==========================================
  // COMMITMENTS
  // ==========================================

  async getCommitments(investorId?: number): Promise<Commitment[]> {
    try {
      // Get commitments from investor_units table
      let query = this.client
        .from('investor_units')
        .select('*')
        .order('id', { ascending: false });

      if (investorId) {
        query = query.eq('investor_id', investorId);
      }

      const { data, error } = await query;

      if (error) {
        console.warn('Error fetching investor_units:', error);
        return [];
      }

      // Transform investor_units to Commitment format
      const commitments = (data || []).map((unit, index) => ({
        id: index + 1, // Use index as id since unit.id is UUID
        public_id: `comm_${unit.id}`,
        investor_id: unit.investor_id,
        deal_id: unit.deal_id,
        currency: 'USD',
        amount: parseFloat(unit.investment_amount || unit.net_capital || '0'),
        status: 'signed' as const,
        signed_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      return commitments;
    } catch (error) {
      console.warn('Error in getCommitments, returning empty array:', error);
      return []; // Return empty array instead of throwing
    }
  }

  async getCommitmentById(id: number): Promise<Commitment | null> {
    try {
      const { data, error } = await this.client
        .from('commitments')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        console.error('Error fetching commitment by ID:', error);
        throw new Error(`Failed to fetch commitment: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in getCommitmentById:', error);
      throw error;
    }
  }

  async getCommitmentsByDealId(dealId: number): Promise<Commitment[]> {
    try {
      const { data, error } = await this.client
        .from('investor_units')
        .select('*')
        .eq('deal_id', dealId)
        .order('id', { ascending: false });

      if (error) {
        console.warn('Error fetching commitments by deal ID:', error);
        return [];
      }

      // Transform investor_units to Commitment format
      const commitments = (data || []).map((unit, index) => ({
        id: index + 1,
        public_id: `comm_${unit.id}`,
        investor_id: unit.investor_id,
        deal_id: unit.deal_id,
        currency: 'USD',
        amount: parseFloat(unit.investment_amount || unit.net_capital || '0'),
        status: 'signed' as const,
        signed_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      return commitments;
    } catch (error) {
      console.error('Error in getCommitmentsByDealId:', error);
      throw error;
    }
  }

  // ==========================================
  // TRANSACTIONS
  // ==========================================

  async getTransactions(filters?: TransactionFilters): Promise<Transaction[]> {
    try {
      // Get from primary transactions table
      let query = this.client
        .from('transactions.transaction.primary')
        .select('*')
        .order('transaction_date', { ascending: false });

      // Apply filters
      if (filters?.investor_id) {
        query = query.eq('investor_id', filters.investor_id);
      }
      if (filters?.deal_id) {
        query = query.eq('deal_id', filters.deal_id);
      }
      if (filters?.type) {
        query = query.eq('type', filters.type);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.from_date) {
        query = query.gte('created_at', filters.from_date);
      }
      if (filters?.to_date) {
        query = query.lte('created_at', filters.to_date);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }
      if (filters?.offset) {
        query = query.range(filters.offset, (filters.offset + (filters.limit || 50)) - 1);
      }

      const { data, error } = await query;

      if (error) {
        console.warn('Error fetching transactions, returning empty array:', error);
        return []; // Return empty array for now
      }

      // Transform to match expected interface
      const transformedTransactions = (data || []).map(tx => ({
        id: tx.transaction_id,
        public_id: `tx_${tx.transaction_id}`,
        investor_id: tx.investor_id,
        deal_id: tx.deal_id,
        type: 'investment' as const, // Primary transactions are investments
        status: 'completed' as const,
        amount: parseFloat(tx.gross_capital || '0'),
        currency: 'USD',
        description: `Investment in Deal ${tx.deal_id}`,
        created_at: tx.transaction_date || new Date().toISOString(),
        updated_at: tx.transaction_date || new Date().toISOString()
      }));

      return transformedTransactions;
    } catch (error) {
      console.error('Error in getTransactions:', error);
      throw error;
    }
  }

  async getTransactionById(id: number): Promise<Transaction | null> {
    try {
      const { data, error } = await this.client
        .from('transactions.transaction.primary')
        .select('*')
        .eq('transaction_id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        console.error('Error fetching transaction by ID:', error);
        throw new Error(`Failed to fetch transaction: ${error.message}`);
      }

      // Transform to match expected interface
      if (data) {
        return {
          id: data.transaction_id,
          public_id: `tx_${data.transaction_id}`,
          investor_id: data.investor_id,
          deal_id: data.deal_id,
          type: 'investment' as const,
          status: 'completed' as const,
          amount: parseFloat(data.gross_capital || '0'),
          currency: 'USD',
          description: `Investment in Deal ${data.deal_id}`,
          created_at: data.transaction_date || new Date().toISOString(),
          updated_at: data.transaction_date || new Date().toISOString()
        };
      }
      return null;
    } catch (error) {
      console.error('Error in getTransactionById:', error);
      throw error;
    }
  }

  // ==========================================
  // DOCUMENTS
  // ==========================================

  async getDocuments(filters?: DocumentFilters): Promise<Document[]> {
    try {
      let query = this.client
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.deal_id) {
        query = query.eq('deal_id', filters.deal_id);
      }
      if (filters?.investor_id) {
        query = query.eq('investor_id', filters.investor_id);
      }
      if (filters?.type) {
        query = query.eq('type', filters.type);
      }
      if (filters?.is_signed !== undefined) {
        query = query.eq('is_signed', filters.is_signed);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }
      if (filters?.offset) {
        query = query.range(filters.offset, (filters.offset + (filters.limit || 50)) - 1);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching documents:', error);
        throw new Error(`Failed to fetch documents: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error in getDocuments:', error);
      throw error;
    }
  }

  async getDocumentById(id: number): Promise<Document | null> {
    try {
      const { data, error } = await this.client
        .from('documents')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        console.error('Error fetching document by ID:', error);
        throw new Error(`Failed to fetch document: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in getDocumentById:', error);
      throw error;
    }
  }

  // ==========================================
  // DASHBOARD & PORTFOLIO
  // ==========================================

  async getDashboardData(investorId: number): Promise<DashboardData> {
    try {
      // Get investor data
      const investor = await this.getInvestorById(investorId);
      if (!investor) {
        throw new Error(`Investor with ID ${investorId} not found`);
      }

      // Get commitments
      const commitments = await this.getCommitments(investorId);
      
      // Get transactions  
      const transactions = await this.getTransactions({ investor_id: investorId });

      // Calculate summary metrics
      const totalCommitted = commitments.reduce((sum, c) => sum + c.amount, 0);
      const totalCalled = transactions
        .filter(t => t.type === 'capital_call' && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0);
      const totalDistributed = transactions
        .filter(t => t.type === 'distribution' && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0);

      // Get recent activity (last 10 transactions)
      const recentActivity = transactions
        .slice(0, 10)
        .map(t => ({
          id: t.public_id,
          type: t.type,
          description: t.description || `${(t.type || 'transaction').replace('_', ' ')}`,
          amount: t.amount,
          date: t.created_at
        }));

      // Mock upcoming calls for now
      const upcomingCalls = commitments
        .filter(c => c.status === 'signed')
        .slice(0, 3)
        .map(c => ({
          dealName: `Deal ${c.deal_id}`,
          amount: c.amount * 0.25, // Assume 25% call
          date: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          currency: c.currency
        }));

      return {
        investor,
        summary: {
          totalCommitted,
          totalCalled,
          totalDistributed,
          currentValue: totalCalled - totalDistributed + (totalCommitted * 0.1), // Mock current value
          totalGains: totalDistributed - totalCalled,
          portfolioIRR: 15.2, // Mock IRR
          portfolioMOIC: 1.25, // Mock MOIC
          activeDeals: commitments.filter(c => c.status === 'signed').length
        },
        recentActivity,
        upcomingCalls
      };
    } catch (error) {
      console.error('Error in getDashboardData:', error);
      throw error;
    }
  }

  async getPortfolioData(investorId: number): Promise<PortfolioData> {
    try {
      // Get commitments for this investor
      const commitments = await this.getCommitments(investorId);
      
      // Get related deals and companies
      const holdings = await Promise.all(
        commitments.map(async (commitment) => {
          const [deal, company] = await Promise.all([
            this.getDealById(commitment.deal_id),
            commitment.deal_id ? this.getCompanyById(commitment.deal_id) : null // Simplified mapping
          ]);

          // Get transactions for this deal/investor combo
          const dealTransactions = await this.getTransactions({
            investor_id: investorId,
            deal_id: commitment.deal_id
          });

          const capitalCalled = dealTransactions
            .filter(t => t.type === 'capital_call' && t.status === 'completed')
            .reduce((sum, t) => sum + t.amount, 0);
          
          const capitalDistributed = dealTransactions
            .filter(t => t.type === 'distribution' && t.status === 'completed')
            .reduce((sum, t) => sum + t.amount, 0);

          return {
            deal: deal!,
            company: company || {
              id: 0,
              public_id: 'unknown',
              name: 'Unknown Company',
              type: 'startup' as const,
              sector: null,
              country: null,
              website: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            commitment,
            metrics: {
              capitalCalled,
              capitalDistributed,
              currentValue: capitalCalled * 1.15, // Mock 15% growth
              irr: Math.random() * 20 + 5, // Mock IRR 5-25%
              moic: capitalCalled > 0 ? (capitalCalled * 1.15) / capitalCalled : 1
            }
          };
        })
      );

      // Calculate summary
      const totalHoldings = holdings.length;
      const totalValue = holdings.reduce((sum, h) => sum + h.metrics.currentValue, 0);
      const totalInvested = holdings.reduce((sum, h) => sum + h.metrics.capitalCalled, 0);
      const totalGains = totalValue - totalInvested;
      const averageIRR = holdings.reduce((sum, h) => sum + (h.metrics.irr || 0), 0) / totalHoldings;
      const averageMOIC = holdings.reduce((sum, h) => sum + (h.metrics.moic || 0), 0) / totalHoldings;

      return {
        holdings,
        summary: {
          totalHoldings,
          totalValue,
          totalGains,
          averageIRR: averageIRR || 0,
          averageMOIC: averageMOIC || 0
        }
      };
    } catch (error) {
      console.error('Error in getPortfolioData:', error);
      throw error;
    }
  }
}