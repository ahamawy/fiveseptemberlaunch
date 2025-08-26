import { z } from 'zod';

export const RecentActivityItemSchema = z.object({
  id: z.string(),
  type: z.string(),
  description: z.string(),
  amount: z.number().optional(),
  date: z.string(),
});

export const PortfolioSummarySchema = z.object({
  totalValue: z.number(),
  totalCommitted: z.number(),
  totalDistributed: z.number(),
  unrealizedGain: z.number(),
});

export const PerformanceSchema = z.object({
  irr: z.number(),
  moic: z.number(),
  dpi: z.number(),
  tvpi: z.number(),
});

export const DashboardDataSchema = z.object({
  portfolio: PortfolioSummarySchema,
  performance: PerformanceSchema,
  recentActivity: z.array(RecentActivityItemSchema),
  activeDeals: z.number(),
});

export type DashboardData = z.infer<typeof DashboardDataSchema>;

