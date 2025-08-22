import { NextRequest, NextResponse } from "next/server";
import { investorsService } from "@/lib/services";
import { getServiceClient } from "@/lib/db/supabase/server-client";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const investorId = parseInt(params.id);

    // Get query parameters for filtering and pagination
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const type = searchParams.get("type") as any;
    const status = searchParams.get("status") as any;
    const dealId = searchParams.get("dealId");
    const fromDate = searchParams.get("startDate") || undefined;
    const toDate = searchParams.get("endDate") || undefined;

    // Get transactions using the service
    const result = await investorsService.getTransactions(investorId, {
      page,
      limit,
      type,
      status,
      deal_id: dealId ? parseInt(dealId) : undefined,
      from_date: fromDate,
      to_date: toDate,
    });

    // Normalize data array
    const rows: any[] = Array.isArray((result as any)?.data)
      ? (result as any).data
      : Array.isArray(result)
      ? (result as any)
      : [];

    // Enrich with deal and company names
    const sb = getServiceClient();
    const dealIds = Array.from(
      new Set(rows.map((r: any) => r.deal_id).filter(Boolean))
    );
    const { data: deals } = await (sb as any)
      .schema("deals")
      .from("deal")
      .select("deal_id, deal_name, underlying_company_id")
      .in("deal_id", dealIds);
    const dealIdToDeal = new Map<number, any>();
    const companyIds = new Set<number>();
    (deals || []).forEach((d: any) => {
      dealIdToDeal.set(d.deal_id, d);
      if (d.underlying_company_id) companyIds.add(d.underlying_company_id);
    });
    const { data: companies } = await (sb as any)
      .schema("companies")
      .from("company")
      .select("company_id, company_name")
      .in("company_id", Array.from(companyIds));
    const companyIdToName = new Map<number, string>();
    (companies || []).forEach((c: any) =>
      companyIdToName.set(c.company_id, c.company_name)
    );

    const enriched = rows.map((t: any) => {
      const deal = t.deal_id ? dealIdToDeal.get(t.deal_id) : null;
      const companyName = deal?.underlying_company_id
        ? companyIdToName.get(deal.underlying_company_id) || null
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
        transaction_date: occurred_on,
        amount: normalizedAmount,
        currency,
        type: inferredType,
      };
    });

    const out = Array.isArray((result as any)?.data)
      ? { ...(result as any), data: enriched }
      : enriched;

    return NextResponse.json(out);
  } catch (error) {
    console.error("Error fetching transactions data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
