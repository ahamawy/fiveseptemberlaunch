import { z } from 'zod';

export const DealItemSchema = z.object({
  dealId: z.number(),
  dealName: z.string(),
  companyName: z.string().nullable().optional(),
  sector: z.string().nullable().optional(),
  companyLogoUrl: z.string().url().nullable().optional(),
  dealType: z.string(),
  committed: z.number(),
  called: z.number(),
  distributed: z.number(),
  currentValue: z.number(),
  irr: z.number().nullable().optional(),
  moic: z.number(),
  status: z.string(),
  currency: z.string(),
  stage: z.string().nullable().optional(),
  documentsCount: z.number().int(),
  investorsCount: z.number().int(),
  valuationCount: z.number().int(),
});

export const AllocationItemSchema = z.object({
  sector: z.string().optional(),
  type: z.string().optional(),
  value: z.number(),
  percentage: z.number(),
  dealCount: z.number().int(),
});

export const PortfolioAllocationSchema = z.object({
  bySector: z.array(AllocationItemSchema),
  byType: z.array(AllocationItemSchema),
});

export const PortfolioSummarySchema = z.object({
  totalDeals: z.number().int(),
  activeDeals: z.number().int(),
  exitedDeals: z.number().int(),
  totalValue: z.number(),
});

export const PortfolioDataSchema = z.object({
  deals: z.array(DealItemSchema),
  allocation: PortfolioAllocationSchema,
  summary: PortfolioSummarySchema,
  historicalPerformance: z
    .array(z.object({ date: z.string(), nav: z.number() }))
    .optional(),
});

export type PortfolioData = z.infer<typeof PortfolioDataSchema>;

