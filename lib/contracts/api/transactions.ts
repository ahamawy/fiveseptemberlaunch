import { z } from 'zod';

// Archived contract (snake_case)
const TransactionSnakeCaseSchema = z.object({
  transaction_id: z.number().optional(),
  deal_id: z.number().optional(),
  investor_id: z.number().optional(),
  deal_name: z.string().optional(),
  deal_currency: z.string().optional(),
  company_name: z.string().nullable().optional(),
  company_sector: z.string().nullable().optional(),
  transaction_date: z.string().optional(),
  transaction_type: z.string().optional(),
  amount: z.number().optional(),
  documents_count: z.number().int().optional(),
});

// Current enrichment (camelCase)
const TransactionCamelCaseSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  investor_id: z.number().optional(),
  deal_id: z.number().optional(),
  dealName: z.string().nullable().optional(),
  companyName: z.string().nullable().optional(),
  companySector: z.string().nullable().optional(),
  transaction_date: z.string().nullable().optional(),
  amount: z.number().nullable().optional(),
  currency: z.string().optional(),
  type: z.string().optional(),
  documentsCount: z.number().int().optional(),
});

export const TransactionSchema = z.union([
  TransactionSnakeCaseSchema,
  TransactionCamelCaseSchema,
]);

export type Transaction = z.infer<typeof TransactionSchema>;

