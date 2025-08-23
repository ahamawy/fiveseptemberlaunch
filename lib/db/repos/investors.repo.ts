import { BaseRepo } from "./base.repo";
import { findCompanyAssetUrls } from "@/lib/utils/storage";

export class InvestorsRepo extends BaseRepo {
  async getDashboard(investorId: number) {
    // Skip analytics schema as it doesn't exist - use transactions directly
    let totalValue = 0;
    let totalCalled = 0;
    let totalDistributed = 0;
    let activeDeals = 0;

    // Use transactions aggregation (public.transactions)
    const { data: tx } = await this.db
      .from("transactions")
      .select(
        "deal_id, initial_net_capital, gross_capital, transaction_date, investor_id"
      )
      .eq("investor_id", investorId);
    if (Array.isArray(tx)) {
      const dealsSet = new Set<number>();
      for (const t of tx) {
        const amt =
          (t.initial_net_capital as number) ??
          (t.gross_capital as number) ??
          0;
        if (amt >= 0) totalCalled += amt;
        else totalDistributed += amt; // negative
        if (t.deal_id) dealsSet.add(t.deal_id);
      }
      activeDeals = dealsSet.size;
      totalValue = totalCalled + totalDistributed; // approx NAV
    }

    // Recent activity (last 5)
    const { data: recent } = await this.db
      .from("transactions")
      .select(
        "deal_id, transaction_date, initial_net_capital, gross_capital, transaction_type, investor_id"
      )
      .eq("investor_id", investorId)
      .order("transaction_date", { ascending: false })
      .limit(5);

    const recentActivity = (recent || []).map((t: any) => ({
      id: `${t.deal_id ?? "-"}-${t.transaction_date ?? "-"}`,
      type: t.transaction_type || "transaction",
      description: `Deal #${t.deal_id ?? "-"}`,
      amount:
        (t.initial_net_capital as number) ?? (t.gross_capital as number) ?? 0,
      date: t.transaction_date,
    }));

    const portfolioMOIC = totalCalled > 0 ? totalValue / totalCalled : 0;
    const portfolioIRR = 0; // placeholder (requires cashflow timing)

    return {
      summary: {
        totalCommitted: totalCalled,
        totalCalled,
        totalDistributed: Math.abs(totalDistributed),
        currentValue: totalValue,
        totalGains: totalValue - totalCalled,
        portfolioIRR,
        portfolioMOIC,
        activeDeals,
      },
      recentActivity,
    };
  }

  async getPortfolio(investorId: number) {
    // Skip analytics schema as it doesn't exist - go straight to transactions
    let perDeal: Array<{
      deal_id: number;
      net_capital: number;
      current_value: number;
    }> = [];

    // Always use transactions aggregation since mv_investment_snapshots doesn't exist
    if (perDeal.length === 0) {
      // Fallback: aggregate from transactions by deal
      const { data: tx } = await this.db
        .from("transactions")
        .select("deal_id, initial_net_capital, gross_capital, investor_id")
        .eq("investor_id", investorId);
      const map = new Map<number, { net: number; cur: number }>();
      (tx || []).forEach((t: any) => {
        const amt =
          (t.initial_net_capital as number) ?? (t.gross_capital as number) ?? 0;
        const d = t.deal_id as number;
        if (!d) return;
        const cur = map.get(d) || { net: 0, cur: 0 };
        if (amt >= 0) cur.net += amt; // treat positive as called
        cur.cur += amt; // NAV approx
        map.set(d, cur);
      });
      perDeal = Array.from(map.entries()).map(([deal_id, v]) => ({
        deal_id,
        net_capital: v.net,
        current_value: v.cur,
      }));
    }

    const dealIds = perDeal.map((d) => d.deal_id).filter(Boolean);
    // Note: "deals.deal" is a table name in the public schema, not a schema.table reference
    const { data: deals } = await this.db
      .from("deals.deal")
      .select(
        "deal_id, deal_name, deal_type, deal_status, deal_currency, underlying_company_id"
      )
      .in("deal_id", dealIds);
    const dealIdToDeal = new Map<number, any>();
    const companyIds = new Set<number>();
    (deals || []).forEach((d: any) => {
      dealIdToDeal.set(d.deal_id, d);
      if (d.underlying_company_id) companyIds.add(d.underlying_company_id);
    });
    // Note: "companies.company" is a table name in the public schema
    const { data: companies } = await this.db
      .from("companies.company")
      .select("company_id, company_name, company_sector")
      .in("company_id", Array.from(companyIds));
    const companyIdTo = new Map<
      number,
      { name: string; sector: string | null }
    >();
    (companies || []).forEach((c: any) =>
      companyIdTo.set(c.company_id, {
        name: c.company_name,
        sector: c.company_sector,
      })
    );

    // Resolve company asset URLs (logo/background)
    const companyIdToAssets = new Map<number, { logo_url: string | null; background_url: string | null }>();
    for (const cid of companyIds) {
      try {
        const comp = companies?.find((c: any) => c.company_id === cid);
        const assets = await findCompanyAssetUrls(this.db as any, cid as number, comp?.company_name);
        companyIdToAssets.set(cid, assets);
      } catch {}
    }

    // Get latest valuations for each deal
    const valuationsMap = new Map<number, { moic: number; irr: number | null }>();
    if (dealIds.length > 0) {
      const { data: valuations } = await this.db
        .from("deal_valuations")
        .select("deal_id, moic, irr, valuation_date")
        .in("deal_id", dealIds)
        .order("valuation_date", { ascending: false });
      
      // Keep only the latest valuation per deal
      (valuations || []).forEach((v: any) => {
        if (!valuationsMap.has(v.deal_id)) {
          valuationsMap.set(v.deal_id, {
            moic: parseFloat(v.moic) || 1.0,
            irr: v.irr ? parseFloat(v.irr) : null
          });
        }
      });
    }

    // Documents count per deal for this investor
    const docsByDeal = new Map<number, number>();
    try {
      const { data: docs } = await (this.db as any)
        .schema("documents")
        .from("document")
        .select("deal_id")
        .in("deal_id", dealIds)
        .eq("investor_id", investorId);
      (docs || []).forEach((d: any) => {
        const id = d.deal_id as number;
        if (!id) return;
        docsByDeal.set(id, (docsByDeal.get(id) || 0) + 1);
      });
    } catch {}

    const dealsOut = perDeal.map((row) => {
      const d = dealIdToDeal.get(row.deal_id) || {};
      const comp = d.underlying_company_id
        ? companyIdTo.get(d.underlying_company_id)
        : undefined;
      const called = Number(row.net_capital || 0);
      const cur = Number(row.current_value || 0);
      
      // Use valuation MOIC if available, otherwise calculate from current value
      const valuation = valuationsMap.get(row.deal_id);
      const moic = valuation ? valuation.moic : (called > 0 ? cur / called : 1.0);
      const irr = valuation?.irr || 0;
      
      // Apply MOIC to current value for proper valuation
      const currentValue = called * moic;
      
      return {
        dealId: row.deal_id,
        dealName: d.deal_name || `Deal #${row.deal_id}`,
        companyName: comp?.name || "",
        sector: comp?.sector || "",
        companyLogoUrl: d.underlying_company_id ? companyIdToAssets.get(d.underlying_company_id || 0)?.logo_url || null : null,
        dealType: (d.deal_type || "direct").toString().toLowerCase(),
        committed: called,
        called,
        distributed: 0,
        currentValue,
        irr,
        moic,
        status: (d.deal_status || "active").toString().toLowerCase(),
        currency: d.deal_currency || "USD",
        stage: d.deal_status || "active",
        documentsCount: docsByDeal.get(row.deal_id) || 0,
        // asset urls resolved at consumer via /api/companies if needed
      };
    });

    const totalValue = dealsOut.reduce((s, d) => s + d.currentValue, 0);
    const bySectorMap = new Map<string, { value: number; dealCount: number }>();
    const byTypeMap = new Map<string, { value: number; dealCount: number }>();
    dealsOut.forEach((d) => {
      const s = d.sector || "unknown";
      const t = d.dealType || "direct";
      bySectorMap.set(s, {
        value: (bySectorMap.get(s)?.value || 0) + d.currentValue,
        dealCount: (bySectorMap.get(s)?.dealCount || 0) + 1,
      });
      byTypeMap.set(t, {
        value: (byTypeMap.get(t)?.value || 0) + d.currentValue,
        dealCount: (byTypeMap.get(t)?.dealCount || 0) + 1,
      });
    });
    const toAlloc = (m: Map<string, { value: number; dealCount: number }>) =>
      Array.from(m.entries()).map(([k, v]) => ({
        sector: k,
        type: k,
        value: v.value,
        percentage: totalValue > 0 ? (v.value / totalValue) * 100 : 0,
        dealCount: v.dealCount,
      }));

    return {
      deals: dealsOut,
      allocation: {
        bySector: toAlloc(bySectorMap).map((a) => ({
          sector: a.sector,
          value: a.value,
          percentage: a.percentage,
          dealCount: a.dealCount,
        })),
        byType: toAlloc(byTypeMap).map((a) => ({
          type: a.type,
          value: a.value,
          percentage: a.percentage,
          dealCount: a.dealCount,
        })),
      },
      summary: {
        totalDeals: dealsOut.length,
        activeDeals: dealsOut.filter((d) => d.status === "active").length,
        exitedDeals: dealsOut.filter((d) => d.status === "exited").length,
        totalValue,
      },
    };
  }
}

export const investorsRepo = new InvestorsRepo();
