import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/db/supabase/server-client";

export async function GET(_request: NextRequest) {
  try {
    const sb = getServiceClient();

    // Counts
    const [{ count: dealsCount }, { count: investorsCount }, { count: txCount }] = await Promise.all([
      sb.from("deals_clean").select("deal_id", { count: "exact", head: true }),
      sb
        .from("investors_clean")
        .select("investor_id", { count: "exact", head: true }),
      sb
        .from("transactions_clean")
        .select("transaction_id", { count: "exact", head: true }),
    ]);

    // Capital by deal (simple sense check from transactions)
    const { data: tx } = await sb
      .from("transactions_clean")
      .select("deal_id, net_capital, gross_capital");

    const capitalByDeal: Record<string, { gross: number; net: number }> = {};
    let totalGross = 0;
    let totalNet = 0;
    (tx || []).forEach((t: any) => {
      const d = String(t.deal_id);
      if (!capitalByDeal[d]) capitalByDeal[d] = { gross: 0, net: 0 };
      const g = Number(t.gross_capital || 0);
      const n = Number(t.net_capital || 0);
      capitalByDeal[d].gross += g;
      capitalByDeal[d].net += n;
      totalGross += g;
      totalNet += n;
    });

    // AUM & returns (preferred from investor_units if available)
    let aum = 0;
    let sumNet = 0;
    let moic = 0;
    try {
      const { data: units } = await sb
        .from("investor_units")
        .select("current_value, net_capital");
      if (Array.isArray(units) && units.length > 0) {
        units.forEach((u: any) => {
          aum += Number(u.current_value || 0);
          sumNet += Number(u.net_capital || 0);
        });
        moic = sumNet > 0 ? aum / sumNet : 0;
      } else {
        // Fallback: approximate AUM as total net capital
        aum = totalNet;
        sumNet = totalNet;
        moic = sumNet > 0 ? aum / sumNet : 0;
      }
    } catch {
      aum = totalNet;
      sumNet = totalNet;
      moic = sumNet > 0 ? aum / sumNet : 0;
    }

    // Attach deal names
    const dealIds = Object.keys(capitalByDeal).map((k) => Number(k)).filter(Boolean);
    let dealsNameMap = new Map<number, { name: string; currency: string | null }>();
    if (dealIds.length > 0) {
      const { data: deals } = await sb
        .from("deals_clean")
        .select("deal_id, deal_name, deal_currency")
        .in("deal_id", dealIds);
      (deals || []).forEach((d: any) => {
        dealsNameMap.set(d.deal_id, {
          name: d.deal_name,
          currency: d.deal_currency || null,
        });
      });
    }

    const capitalByDealList = Object.entries(capitalByDeal).map(([id, sums]) => ({
      deal_id: Number(id),
      deal_name: dealsNameMap.get(Number(id))?.name || null,
      currency: dealsNameMap.get(Number(id))?.currency || null,
      gross_capital: sums.gross,
      net_capital: sums.net,
    }));

    return NextResponse.json({
      success: true,
      data: {
        totals: {
          deals: dealsCount || 0,
          investors: investorsCount || 0,
          transactions: txCount || 0,
          total_gross_capital: totalGross,
          total_net_capital: totalNet,
          aum,
          moic,
        },
        capital_by_deal: capitalByDealList,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}





