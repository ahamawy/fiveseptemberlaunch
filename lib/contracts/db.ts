/**
 * Database type contracts
 * Re-exports Supabase generated types with additional helpers
 */

// Note: These would normally come from Supabase type generation
// For now, we define the core types we use

export interface DbInvestor {
  investor_id: number;
  full_name: string;
  email: string;
  public_id?: string;
  created_at: string;
  updated_at: string;
}

export interface DbDeal {
  deal_id: number;
  deal_name: string;
  deal_type: string;
  deal_status: string;
  deal_currency: string;
  target_raise?: number | null;
  total_raised?: number | null;
  deal_date?: string | null;
  exit_date?: string | null;
  underlying_company_id?: number | null;
  created_at: string;
  updated_at: string;
}

export interface DbCompany {
  company_id: number;
  company_name: string;
  company_sector?: string | null;
  company_description?: string | null;
  company_website?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbTransaction {
  transaction_id: number;
  investor_id: number;
  deal_id?: number | null;
  transaction_type: string;
  transaction_date: string;
  gross_capital?: number | null;
  initial_net_capital?: number | null;
  currency?: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbDealValuation {
  valuation_id?: number;
  deal_id: number;
  moic: string | number;
  irr?: string | number | null;
  valuation_date: string;
  nav?: number | null;
  created_at: string;
  updated_at: string;
}

export interface DbDocument {
  document_id: number;
  investor_id?: number | null;
  deal_id?: number | null;
  document_type: string;
  document_name: string;
  file_path?: string | null;
  file_url?: string | null;
  is_signed?: boolean;
  created_at: string;
  updated_at: string;
}

// Helper types for joins
export interface DbDealWithCompany extends DbDeal {
  company?: DbCompany;
}

export interface DbTransactionWithDeal extends DbTransaction {
  deal?: DbDeal;
  investor?: DbInvestor;
}

export interface DbDealWithValuations extends DbDeal {
  valuations?: DbDealValuation[];
}

// Table name constants (for dot-named tables)
export const DB_TABLES = {
  INVESTORS: 'investors.investor',
  DEALS: 'deals.deal',
  COMPANIES: 'companies.company',
  TRANSACTIONS: 'transactions.transaction.primary',
  TRANSACTIONS_SIMPLE: 'transactions',
  DEAL_VALUATIONS: 'deal_valuations',
  DOCUMENTS: 'documents',
} as const;

// Helper functions for type-safe field mapping
export function mapDbInvestorToApi(investor: DbInvestor) {
  return {
    id: investor.investor_id,
    name: investor.full_name,
    email: investor.email,
    publicId: investor.public_id,
    createdAt: investor.created_at,
    updatedAt: investor.updated_at,
  };
}

export function mapDbDealToApi(deal: DbDeal) {
  return {
    deal_id: deal.deal_id,
    deal_name: deal.deal_name,
    deal_type: deal.deal_type as any, // Will be validated by Zod
    deal_status: deal.deal_status as any,
    deal_currency: deal.deal_currency as any,
    target_raise: deal.target_raise,
    total_raised: deal.total_raised,
    deal_date: deal.deal_date,
    exit_date: deal.exit_date,
    underlying_company_id: deal.underlying_company_id,
  };
}

export function mapDbCompanyToApi(company: DbCompany) {
  return {
    company_id: company.company_id,
    company_name: company.company_name,
    company_sector: company.company_sector,
    company_description: company.company_description,
    company_website: company.company_website,
  };
}

export function mapDbTransactionToApi(transaction: DbTransaction) {
  return {
    transaction_id: transaction.transaction_id,
    investor_id: transaction.investor_id,
    deal_id: transaction.deal_id,
    transaction_type: transaction.transaction_type as any,
    transaction_date: transaction.transaction_date,
    amount: transaction.gross_capital || transaction.initial_net_capital || 0,
    gross_capital: transaction.gross_capital,
    initial_net_capital: transaction.initial_net_capital,
    currency: transaction.currency as any,
    description: transaction.description,
  };
}

export function mapDbValuationToApi(valuation: DbDealValuation) {
  return {
    valuation_id: valuation.valuation_id,
    deal_id: valuation.deal_id,
    moic: typeof valuation.moic === 'string' ? parseFloat(valuation.moic) : valuation.moic,
    irr: valuation.irr ? (typeof valuation.irr === 'string' ? parseFloat(valuation.irr) : valuation.irr) : null,
    valuation_date: valuation.valuation_date,
    nav: valuation.nav,
  };
}