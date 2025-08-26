import { z } from 'zod';

export const CommitmentItemSchema = z.object({
  dealId: z.number(),
  dealName: z.string(),
  companyName: z.string().nullable().optional(),
  companyLogoUrl: z.string().url().nullable().optional(),
  sector: z.string().nullable().optional(),
  dealType: z.string(),
  dealStatus: z.string(),
  commitment: z.number(),
  capitalCalled: z.number(),
  percentageCalled: z.number(),
  capitalDistributed: z.number(),
  capitalRemaining: z.number(),
  currentValue: z.number(),
  moic: z.number(),
  irr: z.number(),
  currency: z.string(),
  lastCallDate: z.string().nullable().optional(),
  nextCallDate: z.string().nullable().optional(),
  documentsCount: z.number().int(),
});

export const CommitmentsSummarySchema = z.object({
  totalCommitments: z.number().int(),
  activeCommitments: z.number().int(),
  totalCommitted: z.number(),
  totalCalled: z.number(),
  totalDistributed: z.number(),
  totalRemaining: z.number(),
  averageCallPercentage: z.number(),
  weightedMOIC: z.number(),
  weightedIRR: z.number(),
});

export const UpcomingCallSchema = z.object({
  dealId: z.number(),
  dealName: z.string(),
  amount: z.number(),
  dueDate: z.string(),
}).partial();

export const CommitmentsResponseSchema = z.object({
  commitments: z.array(CommitmentItemSchema),
  summary: CommitmentsSummarySchema,
  upcomingCalls: z.array(UpcomingCallSchema),
});

export type CommitmentsResponse = z.infer<typeof CommitmentsResponseSchema>;

