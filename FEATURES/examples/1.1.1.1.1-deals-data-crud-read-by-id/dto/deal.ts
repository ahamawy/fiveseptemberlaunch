/**
 * Deal DTO (Data Transfer Object)
 * Validates and shapes the response for GET /deals/:dealId
 */

import { z } from 'zod';

// DTO Schema matching the feature specification
export const DealDTO = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  stage: z.string(),
  company: z.object({ 
    id: z.number().int(), 
    name: z.string().optional() 
  }).optional(),
  identifiers: z.object({
    code: z.string().optional(),
    slug: z.string().optional(),
    aliases: z.array(z.string()).default([])
  }).default({ aliases: [] }),
});

export type DealDTOType = z.infer<typeof DealDTO>;

/**
 * Transform internal deal data to DTO format
 */
export function transformToDealDTO(deal: any): DealDTOType {
  return {
    id: deal.id,
    name: deal.name,
    stage: deal.stage || deal.deal_stage || 'unknown',
    company: deal.company ? {
      id: deal.company.id,
      name: deal.company.name
    } : undefined,
    identifiers: {
      code: deal.code || deal.deal_code,
      slug: deal.slug || deal.deal_slug,
      aliases: deal.aliases || []
    }
  };
}

/**
 * Validate and parse deal data
 */
export function validateDealDTO(data: unknown): DealDTOType {
  return DealDTO.parse(data);
}