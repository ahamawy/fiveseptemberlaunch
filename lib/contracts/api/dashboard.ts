import { z } from 'zod';
import { ApiResponseSchema, MOICSchema, IRRSchema, PercentageSchema } from './common';

/**
 * Dashboard API contract schemas
 */

// Portfolio summary schema
export const PortfolioSummarySchema = z.object({
  totalValue: z.number(),
  totalCommitted: z.number(),
  totalDistributed: z.number(),
  unrealizedGain: z.number(),
  totalCalled: z.number().optional(),
  totalGains: z.number().optional(),
  portfolioIRR: IRRSchema.optional(),
  portfolioMOIC: MOICSchema.optional(),
  activeDeals: z.number().optional(),
});

// Performance metrics schema
export const PerformanceMetricsSchema = z.object({
  irr: IRRSchema,
  moic: MOICSchema,
  dpi: z.number(), // Distributions to Paid-In
  tvpi: z.number(), // Total Value to Paid-In
  rvpi: z.number().optional(), // Residual Value to Paid-In
});

// Recent activity item schema
export const RecentActivityItemSchema = z.object({
  id: z.string(),
  type: z.string(),
  description: z.string(),
  amount: z.number(),
  date: z.string().nullable(),
  dealId: z.number().optional(),
  dealName: z.string().optional(),
  icon: z.string().optional(),
});

// Dashboard data schema
export const DashboardDataSchema = z.object({
  portfolio: PortfolioSummarySchema,
  performance: PerformanceMetricsSchema,
  recentActivity: z.array(RecentActivityItemSchema),
  activeDeals: z.number(),
  summary: PortfolioSummarySchema.optional(), // Legacy support
});

// Dashboard API response schema
export const DashboardResponseSchema = ApiResponseSchema.extend({
  data: DashboardDataSchema.optional(),
});

// Dashboard metrics for charts
export const DashboardMetricsSchema = z.object({
  performanceOverTime: z.array(z.object({
    date: z.string(),
    value: z.number(),
    irr: IRRSchema,
    moic: MOICSchema,
  })).optional(),
  allocationBySector: z.array(z.object({
    sector: z.string(),
    value: z.number(),
    percentage: PercentageSchema,
    dealCount: z.number(),
  })).optional(),
  allocationByType: z.array(z.object({
    type: z.string(),
    value: z.number(),
    percentage: PercentageSchema,
    dealCount: z.number(),
  })).optional(),
  cashFlowTimeline: z.array(z.object({
    date: z.string(),
    capitalCalls: z.number(),
    distributions: z.number(),
    netCashFlow: z.number(),
  })).optional(),
});

// Extended dashboard with metrics
export const ExtendedDashboardSchema = DashboardDataSchema.extend({
  metrics: DashboardMetricsSchema.optional(),
});

// Type exports
export type PortfolioSummary = z.infer<typeof PortfolioSummarySchema>;
export type PerformanceMetrics = z.infer<typeof PerformanceMetricsSchema>;
export type RecentActivityItem = z.infer<typeof RecentActivityItemSchema>;
export type DashboardData = z.infer<typeof DashboardDataSchema>;
export type DashboardResponse = z.infer<typeof DashboardResponseSchema>;
export type DashboardMetrics = z.infer<typeof DashboardMetricsSchema>;
export type ExtendedDashboard = z.infer<typeof ExtendedDashboardSchema>;