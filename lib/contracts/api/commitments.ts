import { z } from 'zod';
import {
  ApiResponseSchema,
  CurrencySchema,
  DealStatusSchema,
  MOICSchema,
  IRRSchema,
} from './common';

/**
 * Commitments API contract schemas
 */

// Individual commitment schema
export const CommitmentSchema = z.object({
  dealId: z.number(),
  dealName: z.string(),
  companyName: z.string().nullable(),
  companyLogoUrl: z.string().nullable().optional(),
  sector: z.string().nullable(),
  dealType: z.string(),
  dealStatus: DealStatusSchema,
  commitment: z.number(),
  capitalCalled: z.number(),
  percentageCalled: z.number(),
  capitalDistributed: z.number(),
  capitalRemaining: z.number(),
  currentValue: z.number(),
  moic: MOICSchema,
  irr: IRRSchema,
  currency: CurrencySchema,
  lastCallDate: z.string().nullable().optional(),
  nextCallDate: z.string().nullable().optional(),
  documentsCount: z.number().optional(),
});

// Commitments summary schema
export const CommitmentsSummarySchema = z.object({
  totalCommitments: z.number(),
  activeCommitments: z.number(),
  totalCommitted: z.number(),
  totalCalled: z.number(),
  totalDistributed: z.number(),
  totalRemaining: z.number(),
  averageCallPercentage: z.number(),
  weightedMOIC: MOICSchema,
  weightedIRR: IRRSchema,
});

// Upcoming capital call schema
export const UpcomingCallSchema = z.object({
  dealId: z.number(),
  dealName: z.string(),
  companyName: z.string().nullable(),
  callDate: z.string(),
  estimatedAmount: z.number(),
  currency: CurrencySchema,
  callNumber: z.number().optional(),
  purpose: z.string().nullable().optional(),
});

// Commitments response schema
export const CommitmentsResponseSchema = z.object({
  commitments: z.array(CommitmentSchema),
  summary: CommitmentsSummarySchema,
  upcomingCalls: z.array(UpcomingCallSchema),
});

// Commitments API response schema
export const CommitmentsApiResponseSchema = ApiResponseSchema.extend({
  data: CommitmentsResponseSchema.optional(),
});

// Type exports
export type Commitment = z.infer<typeof CommitmentSchema>;
export type CommitmentsSummary = z.infer<typeof CommitmentsSummarySchema>;
export type UpcomingCall = z.infer<typeof UpcomingCallSchema>;
export type CommitmentsResponse = z.infer<typeof CommitmentsResponseSchema>;
export type CommitmentsApiResponse = z.infer<typeof CommitmentsApiResponseSchema>;