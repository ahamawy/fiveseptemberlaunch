import { z } from "zod";

/**
 * Common schemas shared across API contracts
 */

// Base API response wrapper
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
  metadata: z
    .object({
      timestamp: z.string().datetime().optional(),
      correlationId: z.string().uuid().optional(),
      count: z.number().optional(),
      page: z.number().optional(),
      limit: z.number().optional(),
      total: z.number().optional(),
      hasMore: z.boolean().optional(),
      totalPages: z.number().optional(),
    })
    .optional(),
});

// Pagination parameters
export const PaginationParamsSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  cursor: z.string().optional(),
});

// Common filter parameters
export const FilterParamsSchema = z.object({
  search: z.string().optional(),
  sort: z.string().optional(),
  order: z.enum(["asc", "desc"]).default("desc"),
  filters: z.record(z.string()).optional(),
});

// Currency enum
export const CurrencySchema = z.enum([
  "USD",
  "EUR",
  "GBP",
  "JPY",
  "CHF",
  "CAD",
  "AUD",
  "SGD",
]);

// Deal status enum
export const DealStatusSchema = z.enum([
  "active",
  "closed",
  "exited",
  "pending",
  "cancelled",
  "written_off",
]);

// Deal type enum
export const DealTypeSchema = z.enum([
  "direct",
  "fund",
  "spv",
  "co-investment",
  "secondary",
]);

// Transaction type enum
export const TransactionTypeSchema = z.enum([
  "capital_call",
  "distribution",
  "commitment",
  "fee",
  "interest",
  "dividend",
  "return_of_capital",
]);

// Document type enum
export const DocumentTypeSchema = z.enum([
  "k1",
  "quarterly_report",
  "annual_report",
  "investor_letter",
  "financial_statement",
  "legal_document",
  "other",
]);

// Badge variant type
export const BadgeVariantSchema = z.enum([
  "default",
  "success",
  "warning",
  "error",
  "info",
  "primary",
  "secondary",
]);

// Common money amount schema
export const MoneyAmountSchema = z.object({
  amount: z.number(),
  currency: CurrencySchema,
  formatted: z.string().optional(),
});

// Common date range schema
export const DateRangeSchema = z.object({
  from: z.string().datetime(),
  to: z.string().datetime(),
});

// Common percentage schema (0-100)
export const PercentageSchema = z.number().min(0).max(100);

// Common MOIC schema
export const MOICSchema = z.number().min(0).max(100);

// Common IRR schema (can be negative)
export const IRRSchema = z.number().nullable();

// Type exports
export type ApiResponse<T = any> = z.infer<typeof ApiResponseSchema> & {
  data?: T;
};
export type PaginationParams = z.infer<typeof PaginationParamsSchema>;
export type FilterParams = z.infer<typeof FilterParamsSchema>;
export type Currency = z.infer<typeof CurrencySchema>;
export type DealStatus = z.infer<typeof DealStatusSchema>;
export type DealType = z.infer<typeof DealTypeSchema>;
export type TransactionType = z.infer<typeof TransactionTypeSchema>;
export type DocumentType = z.infer<typeof DocumentTypeSchema>;
export type BadgeVariant = z.infer<typeof BadgeVariantSchema>;
export type MoneyAmount = z.infer<typeof MoneyAmountSchema>;
export type DateRange = z.infer<typeof DateRangeSchema>;
export type Percentage = z.infer<typeof PercentageSchema>;
export type MOIC = z.infer<typeof MOICSchema>;
export type IRR = z.infer<typeof IRRSchema>;
