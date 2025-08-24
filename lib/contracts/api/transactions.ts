import { z } from 'zod';
import { 
  ApiResponseSchema,
  TransactionTypeSchema,
  CurrencySchema,
  PaginationParamsSchema,
  FilterParamsSchema
} from './common';

/**
 * Transactions API contract schemas
 */

// Transaction schema
export const TransactionSchema = z.object({
  transaction_id: z.number(),
  investor_id: z.number(),
  deal_id: z.number().nullable(),
  transaction_type: TransactionTypeSchema,
  transaction_date: z.string(),
  amount: z.number(),
  currency: CurrencySchema.optional(),
  gross_capital: z.number().nullable(),
  initial_net_capital: z.number().nullable(),
  fees: z.number().nullable(),
  description: z.string().nullable(),
  status: z.enum(['pending', 'completed', 'cancelled']).optional(),
  // Enriched fields
  deal_name: z.string().optional(),
  company_name: z.string().optional(),
  investor_name: z.string().optional(),
});

// Transaction summary schema
export const TransactionSummarySchema = z.object({
  totalCapitalCalls: z.number(),
  totalDistributions: z.number(),
  totalFees: z.number(),
  netCashFlow: z.number(),
  transactionCount: z.number(),
  firstTransactionDate: z.string().nullable(),
  lastTransactionDate: z.string().nullable(),
});

// Transaction list response schema
export const TransactionsListResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(TransactionSchema),
  summary: TransactionSummarySchema.optional(),
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

// Transaction detail response schema
export const TransactionDetailResponseSchema = ApiResponseSchema.extend({
  data: TransactionSchema.optional(),
});

// Transaction filters schema
export const TransactionFiltersSchema = FilterParamsSchema.extend({
  types: z.array(TransactionTypeSchema).optional(),
  dealIds: z.array(z.number()).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  minAmount: z.number().optional(),
  maxAmount: z.number().optional(),
  status: z.array(z.enum(['pending', 'completed', 'cancelled'])).optional(),
});

// Cash flow schema (for charts)
export const CashFlowSchema = z.object({
  date: z.string(),
  capitalCalls: z.number(),
  distributions: z.number(),
  fees: z.number(),
  netCashFlow: z.number(),
  cumulativeCashFlow: z.number(),
});

// Transaction metrics schema
export const TransactionMetricsSchema = z.object({
  byType: z.record(TransactionTypeSchema, z.object({
    count: z.number(),
    totalAmount: z.number(),
    averageAmount: z.number(),
  })),
  byDeal: z.record(z.string(), z.object({
    dealName: z.string(),
    count: z.number(),
    totalAmount: z.number(),
    netCashFlow: z.number(),
  })).optional(),
  monthlyFlow: z.array(CashFlowSchema).optional(),
  quarterlyFlow: z.array(CashFlowSchema).optional(),
});

// Bulk transaction upload schema
export const BulkTransactionUploadSchema = z.object({
  transactions: z.array(z.object({
    investor_identifier: z.string(), // Could be ID or email
    deal_identifier: z.string(), // Could be ID or name
    transaction_type: TransactionTypeSchema,
    transaction_date: z.string(),
    amount: z.number(),
    currency: CurrencySchema.optional(),
    description: z.string().optional(),
  })),
  validate_only: z.boolean().optional(), // If true, only validate without saving
});

// Transaction export schema
export const TransactionExportSchema = z.object({
  format: z.enum(['csv', 'xlsx', 'pdf']),
  filters: TransactionFiltersSchema.optional(),
  columns: z.array(z.string()).optional(), // Specific columns to export
  include_summary: z.boolean().optional(),
});

// Type exports
export type Transaction = z.infer<typeof TransactionSchema>;
export type TransactionSummary = z.infer<typeof TransactionSummarySchema>;
export type TransactionsListResponse = z.infer<typeof TransactionsListResponseSchema>;
export type TransactionDetailResponse = z.infer<typeof TransactionDetailResponseSchema>;
export type TransactionFilters = z.infer<typeof TransactionFiltersSchema>;
export type CashFlow = z.infer<typeof CashFlowSchema>;
export type TransactionMetrics = z.infer<typeof TransactionMetricsSchema>;
export type BulkTransactionUpload = z.infer<typeof BulkTransactionUploadSchema>;
export type TransactionExport = z.infer<typeof TransactionExportSchema>;