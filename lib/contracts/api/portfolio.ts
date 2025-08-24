import { z } from 'zod';
import { 
  ApiResponseSchema, 
  CurrencySchema, 
  DealStatusSchema, 
  DealTypeSchema,
  MOICSchema,
  IRRSchema,
  PercentageSchema 
} from './common';

/**
 * Portfolio API contract schemas
 */

// Portfolio deal schema
export const PortfolioDealSchema = z.object({
  dealId: z.number(),
  dealName: z.string(),
  companyName: z.string(),
  companyId: z.number().optional(),
  sector: z.string().nullable(),
  companyLogoUrl: z.string().nullable().optional(),
  companyBackgroundUrl: z.string().nullable().optional(),
  dealType: DealTypeSchema,
  committed: z.number(),
  called: z.number(),
  distributed: z.number(),
  currentValue: z.number(),
  irr: IRRSchema,
  moic: MOICSchema,
  status: DealStatusSchema,
  currency: CurrencySchema,
  stage: z.string().optional(),
  documentsCount: z.number().optional(),
  investorsCount: z.number().optional(),
  valuationCount: z.number().optional(),
  lastValuationDate: z.string().nullable().optional(),
  percentageOfPortfolio: PercentageSchema.optional(),
});

// Allocation by sector schema
export const AllocationBySectorSchema = z.object({
  sector: z.string(),
  value: z.number(),
  percentage: PercentageSchema,
  dealCount: z.number(),
});

// Allocation by type schema
export const AllocationByTypeSchema = z.object({
  type: z.string(),
  value: z.number(),
  percentage: PercentageSchema,
  dealCount: z.number(),
});

// Portfolio allocation schema
export const PortfolioAllocationSchema = z.object({
  bySector: z.array(AllocationBySectorSchema),
  byType: z.array(AllocationByTypeSchema),
  byStage: z.array(z.object({
    stage: z.string(),
    value: z.number(),
    percentage: PercentageSchema,
    dealCount: z.number(),
  })).optional(),
  byCurrency: z.array(z.object({
    currency: CurrencySchema,
    value: z.number(),
    percentage: PercentageSchema,
    dealCount: z.number(),
  })).optional(),
});

// Portfolio summary schema
export const PortfolioSummarySchema = z.object({
  totalDeals: z.number(),
  activeDeals: z.number(),
  exitedDeals: z.number(),
  totalValue: z.number(),
  totalCommitted: z.number(),
  totalCalled: z.number(),
  totalDistributed: z.number(),
  portfolioIRR: IRRSchema,
  portfolioMOIC: MOICSchema,
  averageHoldingPeriod: z.number().optional(), // in months
});

// Portfolio performance metrics
export const PortfolioPerformanceSchema = z.object({
  topPerformers: z.array(PortfolioDealSchema).optional(),
  bottomPerformers: z.array(PortfolioDealSchema).optional(),
  recentExits: z.array(PortfolioDealSchema).optional(),
  upcomingExits: z.array(PortfolioDealSchema).optional(),
});

// Complete portfolio data schema
export const PortfolioDataSchema = z.object({
  deals: z.array(PortfolioDealSchema),
  allocation: PortfolioAllocationSchema,
  summary: PortfolioSummarySchema,
  performance: PortfolioPerformanceSchema.optional(),
});

// Portfolio API response schema
export const PortfolioResponseSchema = ApiResponseSchema.extend({
  data: PortfolioDataSchema.optional(),
});

// Portfolio filters schema
export const PortfolioFiltersSchema = z.object({
  sectors: z.array(z.string()).optional(),
  types: z.array(DealTypeSchema).optional(),
  statuses: z.array(DealStatusSchema).optional(),
  minValue: z.number().optional(),
  maxValue: z.number().optional(),
  minMOIC: MOICSchema.optional(),
  maxMOIC: MOICSchema.optional(),
  search: z.string().optional(),
});

// Type exports
export type PortfolioDeal = z.infer<typeof PortfolioDealSchema>;
export type AllocationBySector = z.infer<typeof AllocationBySectorSchema>;
export type AllocationByType = z.infer<typeof AllocationByTypeSchema>;
export type PortfolioAllocation = z.infer<typeof PortfolioAllocationSchema>;
export type PortfolioSummary = z.infer<typeof PortfolioSummarySchema>;
export type PortfolioPerformance = z.infer<typeof PortfolioPerformanceSchema>;
export type PortfolioData = z.infer<typeof PortfolioDataSchema>;
export type PortfolioResponse = z.infer<typeof PortfolioResponseSchema>;
export type PortfolioFilters = z.infer<typeof PortfolioFiltersSchema>;