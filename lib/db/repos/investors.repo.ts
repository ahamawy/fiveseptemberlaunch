import { BaseRepo } from "./base.repo";
import { findCompanyAssetUrls } from "@/lib/utils/storage";

export class InvestorsRepo extends BaseRepo {
  async getDashboard(investorId: number) {
    // Get real portfolio values from the database analytics table
    const { data: analytics } = await this.db
      .from("portfolio_analytics")
      .select(
        "total_aum, total_portfolio_value, active_deals_count, average_moic, irr_portfolio"
      )
      .order("calculation_date", { ascending: false })
      .limit(1)
      .single();

    // Get investor-specific transaction summary from the proper table
    const { data: txSummary } = await this.db
      .from("transactions_clean")
      .select("gross_capital, initial_net_capital")
      .eq("investor_id", investorId);

    let totalCalled = 0;
    let totalDistributed = 0;

    if (Array.isArray(txSummary)) {
      totalCalled = txSummary.reduce(
        (sum, t) => sum + parseFloat(t.gross_capital || "0"),
        0
      );
      totalDistributed = 0; // Will be calculated from actual distributions when available
    }

    // Use real database values, not frontend calculations
    const totalValue = analytics?.total_portfolio_value || totalCalled;
    const activeDeals = analytics?.active_deals_count || 0;
    const portfolioMOIC = analytics?.average_moic || 1.0;
    const portfolioIRR = analytics?.irr_portfolio || 0;

    // Recent activity (last 5)
    const { data: recent } = await this.db
      .from("transactions_clean")
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
    // Prefer analytics snapshot for portfolio-level metrics
    const { data: analytics } = await this.db
      .from("portfolio_analytics")
      .select(
        "total_portfolio_value, average_moic, irr_portfolio, active_deals_count"
      )
      .order("calculation_date", { ascending: false })
      .limit(1)
      .single();

    let perDeal: Array<{
      deal_id: number;
      net_capital: number;
      current_value: number;
    }> = [];

    // Always use transactions aggregation since mv_investment_snapshots doesn't exist
    if (perDeal.length === 0) {
      // Fallback: aggregate from transactions by deal
      const { data: tx } = await this.db
        .from("transactions_clean")
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
    // Note: "deals_clean" is a table name in the public schema, not a schema.table reference
    const { data: deals } = await this.db
      .from("deals_clean")
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
    // Note: "companies_clean" is a table name in the public schema
    const { data: companies } = await this.db
      .from("companies_clean")
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

    // Resolve company asset URLs (logo/background) in parallel
    const companyIdToAssets = new Map<
      number,
      { logo_url: string | null; background_url: string | null }
    >();

    // Batch fetch all asset URLs in parallel
    const assetPromises = Array.from(companyIds).map(async (cid) => {
      try {
        const comp = companies?.find((c: any) => c.company_id === cid);
        const assets = await findCompanyAssetUrls(
          this.db as any,
          cid as number,
          comp?.company_name
        );
        return { cid, assets };
      } catch {
        return { cid, assets: { logo_url: null, background_url: null } };
      }
    });

    const assetResults = await Promise.all(assetPromises);
    assetResults.forEach(({ cid, assets }) => {
      companyIdToAssets.set(cid, assets);
    });

    // Get latest valuations for each deal
    const valuationsMap = new Map<
      number,
      { moic: number; irr: number | null }
    >();
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
            irr: v.irr ? parseFloat(v.irr) : null,
          });
        }
      });
    }

    // Documents count per deal for this investor
    const docsByDeal = new Map<number, number>();
    try {
      const { data: docs } = await this.db
        .from("documents")
        .select("deal_id")
        .in("deal_id", dealIds)
        .eq("investor_id", investorId);
      (docs || []).forEach((d: any) => {
        const id = d.deal_id as number;
        if (!id) return;
        docsByDeal.set(id, (docsByDeal.get(id) || 0) + 1);
      });
    } catch {}

    // Get investor count per deal
    const investorsByDeal = new Map<number, number>();
    try {
      const { data: investors } = await this.db
        .from("transactions_clean")
        .select("deal_id, investor_id")
        .in("deal_id", dealIds);

      const dealInvestorMap = new Map<number, Set<number>>();
      (investors || []).forEach((t: any) => {
        if (!t.deal_id) return;
        if (!dealInvestorMap.has(t.deal_id)) {
          dealInvestorMap.set(t.deal_id, new Set());
        }
        dealInvestorMap.get(t.deal_id)!.add(t.investor_id);
      });

      dealInvestorMap.forEach((investorSet, dealId) => {
        investorsByDeal.set(dealId, investorSet.size);
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
      const moic = valuation ? valuation.moic : called > 0 ? cur / called : 1.0;
      const irr = valuation?.irr || 0;

      // Apply MOIC to current value for proper valuation
      const currentValue = called * moic;

      // Normalize enums to API contract
      const rawType = (d.deal_type || "direct").toString().toLowerCase();
      const normalizedType =
        rawType === "partnership"
          ? "fund"
          : rawType === "facilitated_direct"
          ? "direct"
          : rawType;

      const rawCurrency = (d.deal_currency || "USD").toString().toUpperCase();
      const allowedCurrencies = new Set([
        "USD",
        "EUR",
        "GBP",
        "JPY",
        "CHF",
        "CAD",
        "AUD",
        "SGD",
      ]);
      const normalizedCurrency = allowedCurrencies.has(rawCurrency)
        ? rawCurrency
        : "USD";

      return {
        dealId: row.deal_id,
        dealName: d.deal_name || `Deal #${row.deal_id}`,
        companyName: comp?.name || "",
        sector: comp?.sector || "",
        companyLogoUrl: d.underlying_company_id
          ? companyIdToAssets.get(d.underlying_company_id || 0)?.logo_url ||
            null
          : null,
        dealType: normalizedType,
        committed: called, // TODO: replace with committed once available from DB view
        called,
        distributed: 0, // TODO: replace with actual distributions when available from DB view
        currentValue,
        irr,
        moic,
        status: (d.deal_status || "active").toString().toLowerCase(),
        currency: normalizedCurrency,
        stage: d.deal_status || "active",
        documentsCount: docsByDeal.get(row.deal_id) || 0,
        investorsCount: investorsByDeal.get(row.deal_id) || 1, // At least this investor
        valuationCount: valuationsMap.has(row.deal_id) ? 1 : 0, // Simplified for now
        // asset urls resolved at consumer via /api/companies if needed
      };
    });

    const totalValueCalculated = dealsOut.reduce(
      (s, d) => s + d.currentValue,
      0
    );
    const totalValue = analytics?.total_portfolio_value ?? totalValueCalculated;
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

    // Aggregate summary fields (to be replaced by DB views when available)
    const totalCalled = dealsOut.reduce((s, d) => s + (d.called || 0), 0);
    const totalCommitted = dealsOut.reduce((s, d) => s + (d.committed || 0), 0);
    const totalDistributed = dealsOut.reduce(
      (s, d) => s + (d.distributed || 0),
      0
    );
    const portfolioMOIC =
      analytics?.average_moic ??
      (totalCalled > 0 ? totalValue / totalCalled : 1.0);
    const portfolioIRR = analytics?.irr_portfolio ?? 0;

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
        totalCommitted,
        totalCalled,
        totalDistributed,
        portfolioIRR,
        portfolioMOIC,
      },
    };
  }
}

export const investorsRepo = new InvestorsRepo();
