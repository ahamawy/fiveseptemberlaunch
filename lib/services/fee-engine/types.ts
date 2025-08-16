// Fee Engine Type Definitions

export type FeeComponent = 
  | 'MANAGEMENT' 
  | 'PERFORMANCE' 
  | 'STRUCTURING' 
  | 'ADMIN' 
  | 'PREMIUM'
  | 'ADVISORY'
  | 'PLACEMENT'
  | 'MONITORING';

export type FeeBasis = 
  | 'GROSS_CAPITAL'
  | 'NET_CAPITAL' 
  | 'COMMITTED_CAPITAL'
  | 'DEPLOYED_CAPITAL'
  | 'NAV'
  | 'PROFIT'
  | 'FIXED';

export type DealType = 
  | 'PRIMARY'
  | 'SECONDARY'
  | 'ADVISORY'
  | 'COINVEST'
  | 'FUND';

export interface FeeProfile {
  id: number;
  name: string;
  kind: 'LEGACY' | 'MODERN';
  dealType: DealType;
  config: FeeConfiguration;
}

export interface FeeConfiguration {
  tiers: FeeTier[];
  hurdle_rate?: number;
  catch_up?: boolean;
  high_water_mark?: boolean;
  crystallization?: 'QUARTERLY' | 'ANNUAL' | 'EXIT';
  components: FeeComponentConfig[];
}

export interface FeeTier {
  threshold: number;
  management_fee: number;
  performance_fee: number;
  admin_fee?: number;
  structuring_fee?: number;
}

export interface FeeComponentConfig {
  component: FeeComponent;
  basis: FeeBasis;
  rate: number; // Percentage as decimal (0.02 = 2%)
  is_percent: boolean;
  fixed_amount?: number;
  precedence: number;
  applies_to?: DealType[];
}

export interface TransactionFeeContext {
  transaction_id: number;
  deal_id: number;
  investor_id: number;
  transaction_date: Date;
  gross_capital: number;
  net_capital?: number;
  units: number;
  unit_price: number;
  deal_type: DealType;
  prior_nav?: number;
  current_nav?: number;
  profit?: number;
}

export interface FeeCalculationResult {
  transaction_id: number;
  deal_id: number;
  components: FeeLineItem[];
  total_fees: number;
  net_amount: number;
  effective_rate: number;
  metadata: {
    profile_used: string;
    calculation_date: Date;
    warnings?: string[];
  };
}

export interface FeeLineItem {
  component: FeeComponent;
  basis: FeeBasis;
  basis_amount: number;
  rate: number;
  calculated_amount: number;
  notes?: string;
}

export interface CSVImportRow {
  deal_id: number;
  transaction_id?: number;
  component: string;
  basis?: string;
  percent?: number;
  amount?: number;
  notes?: string;
  source_file?: string;
}

export interface FeeValidationError {
  row: number;
  field: string;
  value: any;
  error: string;
}

export interface FeeImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors: FeeValidationError[];
  preview: FeeCalculationResult[];
}