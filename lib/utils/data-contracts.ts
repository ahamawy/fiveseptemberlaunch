import type { DealSummary, ValuationInfo } from "@/lib/types/domain";

export function toStringOrNull(value: any): string | null {
  if (value === undefined || value === null) return null;
  return String(value);
}

export function toNumberOrNull(value: any): number | null {
  if (value === undefined || value === null) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function normalizeCurrency(value: any): string | null {
  const s = toStringOrNull(value);
  if (!s) return null;
  return s.toUpperCase();
}

export function mapDealRowToDealSummary(
  row: any,
  company?: { company_id: number; company_name: string | null; company_sector?: string | null },
  valuation?: ValuationInfo,
  extras?: Partial<DealSummary>
): DealSummary {
  const dealId = Number(row.deal_id);
  const summary: DealSummary = {
    id: dealId,
    name: toStringOrNull(row.deal_name) || `Deal #${dealId}`,
    stage: toStringOrNull(row.deal_status),
    type: toStringOrNull(row.deal_type),
    currency: normalizeCurrency(row.deal_currency),
    target_raise: toNumberOrNull(row.target_raise),
    minimum_investment: toNumberOrNull(row.minimum_investment),
    opening_date: toStringOrNull(row.deal_date),
    closing_date: toStringOrNull(row.exit_date),
    created_at: toStringOrNull(row.created_at),
    updated_at: toStringOrNull(row.updated_at),
    valuation: valuation || undefined,
    company_id: company?.company_id ?? Number(row.underlying_company_id) ?? 0,
    company_name: company?.company_name ?? null,
    company_sector: company?.company_sector ?? null,
  };
  return { ...summary, ...(extras || {}) };
}


