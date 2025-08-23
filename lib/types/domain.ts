export interface ValuationInfo {
  moic: number;
  irr: number | null;
}

export interface CompanySummary {
  company_id: number;
  company_name: string | null;
  company_sector?: string | null;
  company_logo_url?: string | null;
  company_background_url?: string | null;
}

export interface DealSummary extends CompanySummary {
  id: number;
  name: string;
  stage: string | null;
  type: string | null;
  currency: string | null;
  target_raise?: number | null;
  minimum_investment?: number | null;
  opening_date?: string | null;
  closing_date?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  valuation?: ValuationInfo;
  documents_count?: number;
  investor_count?: number;
  tx_count?: number;
}

export interface TransactionItem extends CompanySummary {
  transaction_id: number;
  investor_id: number | string;
  deal_id: number;
  deal_name: string | null;
  company_name: string | null;
  amount: number;
  currency: string | null;
  type: string | null;
  occurred_on: string;
}

export interface PortfolioHolding extends CompanySummary {
  dealId: number;
  dealName: string;
  status: string;
  dealType: string;
  currency: string;
  committed: number;
  called: number;
  distributed: number;
  currentValue: number;
  irr: number;
  moic: number;
  documentsCount?: number;
}


