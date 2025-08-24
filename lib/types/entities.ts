/**
 * Core Entity Type Definitions
 * 
 * Centralized TypeScript interfaces for all core business entities.
 * These types ensure type safety across the application.
 * 
 * @module EntityTypes
 */

// ==========================================
// INVESTOR TYPES
// ==========================================

export interface Investor {
  id: number;
  publicId?: string;
  name: string;
  email: string;
  type: 'individual' | 'institutional' | 'family_office' | 'fund';
  status: 'active' | 'inactive' | 'pending';
  totalCommitted: number;
  totalDeployed: number;
  portfolioValue: number;
  joinedDate: string;
  lastActive?: string;
  metadata?: Record<string, unknown>;
}

export interface InvestorUnit {
  id: number;
  investorId: number;
  dealId: number;
  units: number;
  purchasePrice: number;
  purchaseDate: string;
  currentValue: number;
  status: 'active' | 'exited' | 'pending';
}

// ==========================================
// DEAL TYPES
// ==========================================

export interface Deal {
  id: number;
  slug: string;
  name: string;
  companyId: number;
  companyName?: string;
  status: 'active' | 'closed' | 'exited' | 'pending';
  targetRaise: number;
  minInvestment: number;
  maxInvestment?: number;
  currentRaise: number;
  startDate: string;
  closeDate?: string;
  irr?: number;
  moic?: number;
  description?: string;
  documents?: Document[];
  metadata?: Record<string, unknown>;
}

export interface DealValuation {
  id: number;
  dealId: number;
  valuationDate: string;
  nav: number;
  irr: number;
  moic: number;
  notes?: string;
}

// ==========================================
// COMPANY TYPES
// ==========================================

export interface Company {
  id: number;
  name: string;
  industry: string;
  sector?: string;
  founded?: string;
  headquarters?: string;
  website?: string;
  description?: string;
  logoUrl?: string;
  status: 'portfolio' | 'exited' | 'prospect';
  metadata?: Record<string, unknown>;
}

// ==========================================
// TRANSACTION TYPES
// ==========================================

export interface Transaction {
  id: number;
  investorId: number;
  dealId: number;
  type: 'capital_call' | 'distribution' | 'commitment' | 'fee' | 'other';
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed' | 'cancelled';
  description?: string;
  reference?: string;
  metadata?: Record<string, unknown>;
}

export interface TransactionSummary {
  totalCommitted: number;
  totalCalled: number;
  totalDistributed: number;
  netCashFlow: number;
  unrealizedValue: number;
  totalValue: number;
}

// ==========================================
// COMMITMENT TYPES
// ==========================================

export interface Commitment {
  id: number;
  investorId: number;
  dealId: number;
  amount: number;
  commitmentDate: string;
  status: 'active' | 'fulfilled' | 'cancelled';
  calledAmount: number;
  remainingCommitment: number;
  lastCallDate?: string;
  notes?: string;
}

// ==========================================
// DOCUMENT TYPES
// ==========================================

export interface Document {
  id: number;
  name: string;
  type: 'report' | 'agreement' | 'presentation' | 'financial' | 'legal' | 'other';
  url: string;
  uploadedAt: string;
  size?: number;
  dealId?: number;
  investorId?: number;
  access: 'public' | 'private' | 'restricted';
  metadata?: Record<string, unknown>;
}

// ==========================================
// PORTFOLIO TYPES
// ==========================================

export interface PortfolioHolding {
  dealId: number;
  dealName: string;
  companyName: string;
  committed: number;
  called: number;
  distributed: number;
  currentValue: number;
  irr: number;
  moic: number;
  status: 'active' | 'exited';
  lastValuation?: string;
}

export interface PortfolioSummary {
  totalHoldings: number;
  totalValue: number;
  totalGains: number;
  totalCommitted: number;
  totalCalled: number;
  totalDistributed: number;
  portfolioIRR: number;
  portfolioMOIC: number;
  activeDeals: number;
  exitedDeals: number;
}

export interface PortfolioData {
  holdings: PortfolioHolding[];
  summary: PortfolioSummary;
  historicalPerformance?: HistoricalPerformance[];
}

export interface HistoricalPerformance {
  date: string;
  nav: number;
  irr: number;
  moic: number;
}

// ==========================================
// DASHBOARD TYPES
// ==========================================

export interface DashboardMetrics {
  totalValue: number;
  totalCommitted: number;
  totalDeployed: number;
  totalDistributed: number;
  unrealizedGains: number;
  realizedGains: number;
  portfolioIRR: number;
  portfolioMOIC: number;
  activeDeals: number;
}

export interface ActivityItem {
  id: string;
  type: 'capital_call' | 'distribution' | 'document' | 'valuation' | 'news';
  title: string;
  description: string;
  date: string;
  amount?: number;
  dealName?: string;
  status?: string;
}

export interface UpcomingCall {
  id: number;
  dealName: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'overdue' | 'paid';
}

export interface DashboardData {
  metrics: DashboardMetrics;
  recentActivity: ActivityItem[];
  upcomingCalls: UpcomingCall[];
  portfolioTrend?: HistoricalPerformance[];
}

// ==========================================
// FEE TYPES
// ==========================================

export interface FeeSchedule {
  id: number;
  name: string;
  type: 'management' | 'performance' | 'structuring' | 'advisory' | 'other';
  rate: number;
  basis: 'gross' | 'net' | 'net_after_premium';
  frequency: 'annual' | 'quarterly' | 'monthly' | 'one_time';
  status: 'active' | 'inactive';
}

export interface FeeApplication {
  id: number;
  dealId: number;
  feeScheduleId: number;
  amount: number;
  appliedDate: string;
  status: 'pending' | 'applied' | 'waived';
  notes?: string;
}

// ==========================================
// FILTER TYPES
// ==========================================

export interface DealFilters {
  status?: Deal['status'];
  companyId?: number;
  minIrr?: number;
  maxIrr?: number;
  fromDate?: string;
  toDate?: string;
}

export interface TransactionFilters {
  investorId?: number;
  dealId?: number;
  type?: Transaction['type'];
  status?: Transaction['status'];
  fromDate?: string;
  toDate?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface DocumentFilters {
  type?: Document['type'];
  dealId?: number;
  investorId?: number;
  access?: Document['access'];
  fromDate?: string;
  toDate?: string;
}

// ==========================================
// API RESPONSE TYPES
// ==========================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    timestamp?: string;
    correlationId?: string;
    responseTime?: number;
    [key: string]: unknown;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ==========================================
// FORMULA TYPES
// ==========================================

export interface FormulaTemplate {
  id: number;
  name: string;
  description?: string;
  formula: string;
  variables: string[];
  status: 'active' | 'draft' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface FormulaAssignment {
  id: number;
  dealId: number;
  formulaTemplateId: number;
  effectiveDate: string;
  status: 'active' | 'inactive';
}

export interface CalculationResult {
  dealId: number;
  investorId: number;
  result: number;
  formula: string;
  variables: Record<string, number>;
  calculatedAt: string;
}

// ==========================================
// TYPE GUARDS
// ==========================================

export function isInvestor(obj: unknown): obj is Investor {
  return typeof obj === 'object' && obj !== null && 'id' in obj && 'name' in obj && 'email' in obj;
}

export function isDeal(obj: unknown): obj is Deal {
  return typeof obj === 'object' && obj !== null && 'id' in obj && 'slug' in obj && 'companyId' in obj;
}

export function isTransaction(obj: unknown): obj is Transaction {
  return typeof obj === 'object' && obj !== null && 'id' in obj && 'investorId' in obj && 'type' in obj;
}

export function isApiResponse<T>(obj: unknown): obj is ApiResponse<T> {
  return typeof obj === 'object' && obj !== null && 'success' in obj;
}