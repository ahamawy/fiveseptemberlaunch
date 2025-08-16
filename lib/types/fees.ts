/**
 * Fee Calculation Types for Legacy Deal Engine
 */

// Fee component types matching database enum
export type FeeComponentType = 
  | 'STRUCTURING'
  | 'MANAGEMENT'
  | 'PERFORMANCE'
  | 'ADMIN'
  | 'PREMIUM'
  | 'OTHER';

// Calculation basis types
export type FeeBasisType = 
  | 'GROSS'
  | 'NET'
  | 'PER_INVESTOR'
  | 'FIXED';

// Calculation methods
export type FeeCalculationMethod = 
  | 'PCT_OF_GROSS'
  | 'PCT_OF_NET'
  | 'FIXED'
  | 'VALUATION_DELTA';

// Profile kinds
export type ProfileKind = 'LEGACY' | 'MODERN';

// Deal valuations
export interface DealValuations {
  pre_money_purchase: number;
  pre_money_sell: number;
  post_money_current: number;
}

// Fee configuration for a single component
export interface FeeConfig {
  method: FeeCalculationMethod;
  rate?: number;
  amount?: number;
  basis: FeeBasisType;
  allow_discounts?: boolean;
  annual?: boolean;
  years?: number;
  description?: string;
}

// Partner configuration
export interface PartnerConfig {
  name: string;
  management_fee_percent: number;
  performance_fee_percent: number;
  subscription_fee_percent: number;
  admin_fee: number;
}

// Deal details
export interface DealDetails {
  transaction_date: string;
  underlying_company: string;
  funding_round: string;
  holding_entity: string;
  unit_price: number;
  initial_gross_capital: number;
  initial_net_capital: number;
}

// Calculation rules
export interface CalculationRules {
  premium_calculation: string;
  net_capital: string;
  units: string;
  transfer_pre_discount: string;
  transfer_post_discount: string;
  rounding: {
    amounts: number;
    units: number;
    method: 'FLOOR' | 'ROUND' | 'CEIL';
  };
}

// Validation totals
export interface ValidationTotals {
  gross_capital: number;
  net_capital: number;
  units: number;
  transfer_pre_discount: number;
  total_discounts: number;
  transfer_post_discount: number;
}

// Complete fee profile configuration
export interface FeeProfile {
  deal_id: number;
  name: string;
  kind: ProfileKind;
  valuations?: DealValuations;
  fees: {
    ordering: FeeComponentType[];
    premium?: FeeConfig;
    structuring?: FeeConfig;
    management?: FeeConfig;
    admin?: FeeConfig;
    performance?: FeeConfig;
    [key: string]: FeeConfig | FeeComponentType[] | undefined;
  };
  partner?: PartnerConfig;
  deal_details?: DealDetails;
  calculation_rules?: CalculationRules;
  validation?: {
    expected_totals: ValidationTotals;
  };
}

// Database profile record
export interface FeeProfileRecord {
  id: number;
  name: string;
  kind: ProfileKind;
  config: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Fee schedule record
export interface FeeSchedule {
  schedule_id: number;
  deal_id: number;
  component: FeeComponentType;
  rate: number;
  is_percent: boolean;
  basis: string;
  precedence?: number;
  effective_at: string;
  created_at: string;
  updated_at: string;
}

// Schedule version
export interface ScheduleVersion {
  id: number;
  schedule_id: number;
  version: number;
  calculator_profile_id?: number;
  is_active: boolean;
  effective_at: string;
  created_at: string;
  updated_at: string;
}

// Fee application (applied fees)
export interface FeeApplication {
  id: number;
  transaction_id: number;
  deal_id?: number;
  component: FeeComponentType;
  amount?: number;
  percent?: number;
  applied: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Legacy import record
export interface LegacyImport {
  id?: number;
  deal_id: number;
  transaction_id?: number;
  component: string;
  basis?: string;
  percent?: number;
  amount?: number;
  notes?: string;
  source_file?: string;
  imported_at?: string;
}

// Import preview row
export interface ImportPreviewRow {
  deal_id: number;
  transaction_id: number | null;
  component: string;
  basis: string | null;
  percent: number | null;
  amount: number | null;
  existing_amount: number;
  delta_amount: number;
}

// Investor import data
export interface InvestorImportData {
  investor_name: string;
  gross_capital: number;
  structuring_discount_percent?: number;
  management_discount_percent?: number;
  admin_discount_percent?: number;
}

// Calculated investor fees
export interface CalculatedInvestorFees {
  investor_name: string;
  gross_capital: number;
  premium_amount: number;
  net_capital: number;
  units: number;
  structuring_fee: number;
  management_fee: number;
  admin_fee: number;
  structuring_discount: number;
  management_discount: number;
  admin_discount: number;
  transfer_pre_discount: number;
  transfer_post_discount: number;
}

// Apply result
export interface ApplyResult {
  inserted: number;
  updated: number;
  total_delta: number;
  dry_run: boolean;
}

// API response types
export interface ProfilesResponse {
  success: boolean;
  data?: Array<{
    schedule_id: number;
    version: number;
    is_active: boolean;
    profile_id: number;
    name: string;
    kind: ProfileKind;
    deal_id: number;
    schedule?: Array<{
      component: FeeComponentType;
      rate: number;
      basis: string;
      precedence?: number;
    }>;
  }>;
  error?: string;
}

export interface ImportResponse {
  success: boolean;
  data?: ImportPreviewRow[];
  inserted?: number;
  error?: string;
}

export interface ApplyResponse {
  success: boolean;
  data?: ApplyResult;
  dry_run?: boolean;
  message?: string;
  error?: string;
}