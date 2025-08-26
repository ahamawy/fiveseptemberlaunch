import type { TransactionType, TransactionStatus } from "@/lib/db/types";
import { BaseRepo } from "./base.repo";

export interface TxListFilters {
  investor_id?: number;
  type?: TransactionType;
  status?: TransactionStatus;
  limit?: number;
}

export class TransactionsRepo extends BaseRepo {
  async listEnriched(filters: TxListFilters = {}) {
    const limit = Math.min(500, Math.max(1, filters.limit ?? 50));
    let query = this.db
      .from("transactions_clean")
      .select("*")
      .order("transaction_date", { ascending: false })
      .limit(limit);
    if (filters.investor_id)
      query = query.eq("investor_id", filters.investor_id);
    if (filters.type) query = query.eq("transaction_type", filters.type);
    if (filters.status) query = query.eq("status", filters.status);
    const { data, error } = await query;
    if (error) throw error;

    const rows = Array.isArray(data) ? data : [];
    const dealIds = Array.from(
      new Set(rows.map((r: any) => r.deal_id).filter(Boolean))
    );
    const investorIds = Array.from(
      new Set(rows.map((r: any) => r.investor_id).filter(Boolean))
    );

    const { data: deals } = await this.db
      .from("deals_clean")
      .select("deal_id, deal_name, underlying_company_id")
      .in("deal_id", dealIds);
    const dealIdToDeal = new Map<number, any>();
    const companyIds = new Set<number>();
    (deals || []).forEach((d: any) => {
      dealIdToDeal.set(d.deal_id, d);
      if (d.underlying_company_id) companyIds.add(d.underlying_company_id);
    });

    const { data: companies } = await this.db
      .from("companies_clean")
      .select("company_id, company_name")
      .in("company_id", Array.from(companyIds));
    const companyIdToName = new Map<number, string>();
    (companies || []).forEach((c: any) =>
      companyIdToName.set(c.company_id, c.company_name)
    );

    const { data: investors } = await this.db
      .from("investors_clean")
      .select("investor_id, full_name")
      .in("investor_id", investorIds);
    const investorIdToName = new Map<number, string>();
    (investors || []).forEach((i: any) =>
      investorIdToName.set(i.investor_id, i.full_name)
    );

    return rows.map((t: any) => {
      const deal = t.deal_id ? dealIdToDeal.get(t.deal_id) : null;
      const companyName = deal?.underlying_company_id
        ? companyIdToName.get(deal.underlying_company_id) || null
        : null;
      const investorName = t.investor_id
        ? investorIdToName.get(t.investor_id) || null
        : null;
      const occurred_on =
        t.transaction_date || t.created_at || t.processed_at || null;
      const normalizedAmount =
        t.transfer_post_discount ??
        t.net_capital ??
        t.gross_capital ??
        t.amount ??
        null;
      const currency = t.currency || "USD";
      const rawType = t.transaction_type || t.type || null;
      const inferredType =
        rawType ||
        (typeof normalizedAmount === "number"
          ? normalizedAmount < 0
            ? "distribution"
            : "capital_call"
          : "transaction");
      return {
        ...t,
        dealName: deal?.deal_name || null,
        companyName,
        investorName,
        transaction_date: occurred_on,
        amount: normalizedAmount,
        currency,
        type: inferredType,
      };
    });
  }
}

export const transactionsRepo = new TransactionsRepo();



