import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const DealDTO = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  stage: z.string(),
  company: z.object({ id: z.number().int(), name: z.string().optional() }).optional(),
  identifiers: z.object({
    code: z.string().optional(),
    slug: z.string().optional(),
    aliases: z.array(z.string()).default([])
  }).default({ aliases: [] }),
});

describe('1.1.1.1.1 deals-data-crud-read-by-id DTO', () => {
  it('valid payload', () => {
    const ok = DealDTO.safeParse({ id: 1, name: 'Alpha', stage: 'live', identifiers: { aliases: [] } });
    expect(ok.success).toBe(true);
  });

  it('rejects missing name', () => {
    const bad = DealDTO.safeParse({ id: 1, stage: 'live' });
    expect(bad.success).toBe(false);
  });
});
