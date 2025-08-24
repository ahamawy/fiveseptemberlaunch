import { z } from 'zod';
import { 
  ApiResponseSchema,
  CurrencySchema,
  DealStatusSchema,
  DealTypeSchema,
  MOICSchema,
  IRRSchema,
  PaginationParamsSchema,
  FilterParamsSchema
} from './common';

/**
 * Deals API contract schemas
 */

// Company info schema
export const CompanyInfoSchema = z.object({
  company_id: z.number(),
  company_name: z.string(),
  company_sector: z.string().nullable(),
  company_description: z.string().nullable(),
  company_logo_url: z.string().nullable().optional(),
  company_background_url: z.string().nullable().optional(),
  company_website: z.string().nullable().optional(),
  company_founded: z.string().nullable().optional(),
});

// Deal valuation schema
export const DealValuationSchema = z.object({
  valuation_id: z.number().optional(),
  deal_id: z.number(),
  moic: MOICSchema,
  irr: IRRSchema,
  valuation_date: z.string(),
  nav: z.number().optional(),
  notes: z.string().nullable().optional(),
});

// Deal schema for list view
export const DealListItemSchema = z.object({
  deal_id: z.number(),
  deal_name: z.string(),
  deal_type: DealTypeSchema,
  deal_status: DealStatusSchema,
  deal_currency: CurrencySchema,
  target_raise: z.number().nullable(),
  total_raised: z.number().nullable(),
  deal_date: z.string().nullable(),
  exit_date: z.string().nullable(),
  underlying_company_id: z.number().nullable(),
  // Enriched fields
  company_name: z.string().optional(),
  company_sector: z.string().nullable().optional(),
  company_logo_url: z.string().nullable().optional(),
  moic: MOICSchema.optional(),
  irr: IRRSchema.optional(),
  investors_count: z.number().optional(),
  documents_count: z.number().optional(),
  transactions_count: z.number().optional(),
});

// Detailed deal schema
export const DealDetailSchema = DealListItemSchema.extend({
  // Additional detail fields
  description: z.string().nullable().optional(),
  investment_thesis: z.string().nullable().optional(),
  risk_factors: z.string().nullable().optional(),
  minimum_investment: z.number().nullable().optional(),
  management_fee: z.number().nullable().optional(),
  carry_percentage: z.number().nullable().optional(),
  // Related data
  company: CompanyInfoSchema.nullable().optional(),
  valuations: z.array(DealValuationSchema).optional(),
  // Investor-specific data
  investor_commitment: z.number().optional(),
  investor_called: z.number().optional(),
  investor_distributed: z.number().optional(),
  investor_current_value: z.number().optional(),
});

// Deals list response schema
export const DealsListResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(DealListItemSchema),
  metadata: z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    hasMore: z.boolean(),
    totalPages: z.number(),
    timestamp: z.string().optional(),
    correlationId: z.string().optional(),
  }).optional(),
});

// Deal detail response schema
export const DealDetailResponseSchema = ApiResponseSchema.extend({
  data: DealDetailSchema.optional(),
});

// Deal filters schema
export const DealFiltersSchema = FilterParamsSchema.extend({
  types: z.array(DealTypeSchema).optional(),
  statuses: z.array(DealStatusSchema).optional(),
  sectors: z.array(z.string()).optional(),
  minRaise: z.number().optional(),
  maxRaise: z.number().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  hasValuations: z.boolean().optional(),
});

// Deal metrics schema (for aggregations)
export const DealMetricsSchema = z.object({
  totalDeals: z.number(),
  totalRaised: z.number(),
  averageMOIC: MOICSchema,
  averageIRR: IRRSchema,
  byStatus: z.record(z.string(), z.number()),
  byType: z.record(z.string(), z.number()),
  bySector: z.record(z.string(), z.number()),
});

// Deal commitment schema (investor-specific)
export const DealCommitmentSchema = z.object({
  dealId: z.number(),
  dealName: z.string(),
  companyName: z.string(),
  commitment: z.number(),
  capitalCalled: z.number(),
  percentageCalled: z.number(),
  capitalDistributed: z.number(),
  currentValue: z.number(),
  moic: MOICSchema,
  irr: IRRSchema,
  status: DealStatusSchema,
  lastUpdated: z.string(),
});

// Type exports
export type CompanyInfo = z.infer<typeof CompanyInfoSchema>;
export type DealValuation = z.infer<typeof DealValuationSchema>;
export type DealListItem = z.infer<typeof DealListItemSchema>;
export type DealDetail = z.infer<typeof DealDetailSchema>;
export type DealsListResponse = z.infer<typeof DealsListResponseSchema>;
export type DealDetailResponse = z.infer<typeof DealDetailResponseSchema>;
export type DealFilters = z.infer<typeof DealFiltersSchema>;
export type DealMetrics = z.infer<typeof DealMetricsSchema>;
export type DealCommitment = z.infer<typeof DealCommitmentSchema>;