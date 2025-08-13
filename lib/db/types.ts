/**
 * Database Types
 * Generated from DB schema for type safety
 * These types match the Supabase database schema
 */

// ==========================================
// REFERENCE TYPES
// ==========================================

export type DealStage = 'sourcing' | 'due_diligence' | 'closing' | 'active' | 'exited' | 'cancelled';
export type DealType = 'primary' | 'secondary' | 'direct' | 'fund';
export type CompanyType = 'startup' | 'growth' | 'mature';
export type InvestorType = 'individual' | 'institutional' | 'family_office' | 'fund';
export type DocumentType = 'termsheet' | 'allocation_sheet' | 'operating_agreement' | 'side_letter' | 'subscription_agreement';
export type TransactionType = 'capital_call' | 'distribution' | 'fee' | 'refund' | 'transfer';
export type TransactionStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
export type CommitmentStatus = 'draft' | 'signed' | 'cancelled';

// ==========================================
// CORE ENTITIES
// ==========================================

export interface Company {
  id: number;
  public_id: string;
  name: string;
  type: CompanyType;
  sector: string | null;
  country: string | null;
  website: string | null;
  created_at: string;
  updated_at: string;
}

export interface Deal {
  id: number;
  public_id: string;
  company_id: number | null;
  code: string;
  slug: string;
  name: string;
  type: DealType;
  stage: DealStage;
  currency: string;
  opening_date: string | null;
  closing_date: string | null;
  unit_price_init: number | null;
  target_raise: number | null;
  current_raise: number | null;
  minimum_investment: number | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Investor {
  id: number;
  public_id: string;
  user_id: string | null;
  type: InvestorType;
  name: string;
  email: string;
  phone: string | null;
  country: string | null;
  kyc_status: 'pending' | 'approved' | 'rejected' | 'expired';
  accredited: boolean;
  created_at: string;
  updated_at: string;
}

export interface Commitment {
  id: number;
  public_id: string;
  investor_id: number;
  deal_id: number;
  currency: string;
  amount: number;
  status: CommitmentStatus;
  signed_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: number;
  public_id: string;
  investor_id: number | null;
  deal_id: number | null;
  type: TransactionType;
  status: TransactionStatus;
  currency: string;
  amount: number;
  fee_amount: number | null;
  reference: string | null;
  description: string | null;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: number;
  public_id: string;
  type: DocumentType;
  name: string;
  url: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  deal_id: number | null;
  investor_id: number | null;
  version: string | null;
  is_signed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Portfolio {
  investor_id: number;
  deal_id: number;
  commitment_amount: number;
  capital_called: number;
  capital_distributed: number;
  current_value: number;
  irr: number | null;
  moic: number | null;
  last_valuation_date: string | null;
}

export interface Performance {
  investor_id: number;
  period: string;
  total_committed: number;
  total_called: number;
  total_distributed: number;
  total_value: number;
  realized_gains: number;
  unrealized_gains: number;
  portfolio_irr: number;
  portfolio_moic: number;
}

// ==========================================
// API RESPONSE TYPES
// ==========================================

export interface DashboardData {
  investor: Investor;
  summary: {
    totalCommitted: number;
    totalCalled: number;
    totalDistributed: number;
    currentValue: number;
    totalGains: number;
    portfolioIRR: number;
    portfolioMOIC: number;
    activeDeals: number;
  };
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    amount?: number;
    date: string;
  }>;
  upcomingCalls: Array<{
    dealName: string;
    amount: number;
    date: string;
    currency: string;
  }>;
}

export interface PortfolioData {
  holdings: Array<{
    deal: Deal;
    company: Company;
    commitment: Commitment;
    metrics: {
      capitalCalled: number;
      capitalDistributed: number;
      currentValue: number;
      irr: number | null;
      moic: number | null;
    };
  }>;
  summary: {
    totalHoldings: number;
    totalValue: number;
    totalGains: number;
    averageIRR: number;
    averageMOIC: number;
  };
}

// ==========================================
// QUERY FILTERS
// ==========================================

export interface DealFilters {
  stage?: DealStage;
  type?: DealType;
  company_id?: number;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface TransactionFilters {
  investor_id?: number;
  deal_id?: number;
  type?: TransactionType;
  status?: TransactionStatus;
  from_date?: string;
  to_date?: string;
  limit?: number;
  offset?: number;
}

export interface DocumentFilters {
  deal_id?: number;
  investor_id?: number;
  type?: DocumentType;
  is_signed?: boolean;
  limit?: number;
  offset?: number;
}

// ==========================================
// SUPABASE HELPERS
// ==========================================

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

// Simplified Database type for Supabase client
export interface Database {
  public: {
    Tables: {
      companies: { Row: Company };
      deals: { Row: Deal };
      investors: { Row: Investor };
      commitments: { Row: Commitment };
      transactions: { Row: Transaction };
      documents: { Row: Document };
    };
    Enums: {
      deal_stage: DealStage;
      deal_type: DealType;
      company_type: CompanyType;
      investor_type: InvestorType;
      document_type: DocumentType;
      transaction_type: TransactionType;
      transaction_status: TransactionStatus;
      commitment_status: CommitmentStatus;
    };
  };
}