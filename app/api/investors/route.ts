import { NextRequest, NextResponse } from "next/server";
import { investorsService } from "@/lib/services";
import { getServiceClient } from "@/lib/db/supabase/server-client";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search") || undefined;
    const type = (searchParams.get("type") as any) || undefined;

    const result = await investorsService.getInvestors({
      page,
      limit,
      search,
      type,
    });
    const dataArray: any[] = Array.isArray((result as any)?.data)
      ? (result as any).data
      : (result as any)?.data?.data || [];
    // If a search term is provided and no rows came back, perform a direct Supabase search by name/email
    if (search && (!dataArray || dataArray.length === 0)) {
      const sb = getServiceClient();
      const term = `%${search}%`;
      const { data: searchRows } = await sb
        .from("investors.investor")
        .select(
          "investor_id, full_name, primary_email, investor_type, created_at"
        )
        .or(`full_name.ilike.${term},primary_email.ilike.${term}`)
        .order("investor_id")
        .limit(limit);
      if (Array.isArray(searchRows) && searchRows.length > 0) {
        const mapped = searchRows.map((i: any) => ({
          id: i.investor_id,
          name: i.full_name,
          email: i.primary_email,
          type: i.investor_type,
          created_at: i.created_at,
        }));
        return NextResponse.json({
          success: true,
          data: mapped,
          metadata: {
            pagination: { page, limit, total: mapped.length, totalPages: 1 },
          },
        });
      }
    }
    if (!dataArray || dataArray.length === 0) {
      const sb = getServiceClient();
      const { data: tx } = await sb
        .from("transactions.transaction.primary")
        .select("investor_id, deal_id")
        .not("investor_id", "is", null)
        .limit(limit);
      if (Array.isArray(tx)) {
        const ids = Array.from(
          new Set(tx.map((t: any) => t.investor_id))
        ).slice(0, limit);
        const txCount = new Map<number, number>();
        const dealsByInvestor = new Map<number, Set<number>>();
        (tx || []).forEach((t: any) => {
          const inv = t.investor_id as number;
          txCount.set(inv, (txCount.get(inv) || 0) + 1);
          if (!dealsByInvestor.has(inv)) dealsByInvestor.set(inv, new Set());
          if (t.deal_id) dealsByInvestor.get(inv)!.add(t.deal_id);
        });
        const fallback = ids.map((id) => ({
          id,
          name: null,
          email: null,
          type: null,
          kyc_status: null,
          created_at: null,
          tx_count: txCount.get(id) || 0,
          deal_count: dealsByInvestor.get(id)?.size || 0,
        }));
        return NextResponse.json({
          success: true,
          data: fallback,
          metadata: {
            pagination: { page, limit, total: fallback.length, totalPages: 1 },
          },
        });
      }
    }
    // Enrich normal result with counts
    const ids = dataArray
      .map((i: any) => i.id ?? i.investor_id)
      .filter(Boolean);
    if (ids.length > 0) {
      const sb = getServiceClient();
      const { data: tx } = await sb
        .from("transactions.transaction.primary")
        .select("investor_id, deal_id")
        .in("investor_id", ids);
      const txCount = new Map<number, number>();
      const dealsByInvestor = new Map<number, Set<number>>();
      (tx || []).forEach((t: any) => {
        const inv = t.investor_id as number;
        txCount.set(inv, (txCount.get(inv) || 0) + 1);
        if (!dealsByInvestor.has(inv)) dealsByInvestor.set(inv, new Set());
        if (t.deal_id) dealsByInvestor.get(inv)!.add(t.deal_id);
      });
      const enriched = dataArray.map((i: any) => ({
        ...i,
        id: i.id ?? i.investor_id,
        tx_count: txCount.get(i.id ?? i.investor_id) || 0,
        deal_count: dealsByInvestor.get(i.id ?? i.investor_id)?.size || 0,
      }));
      const shaped = Array.isArray((result as any)?.data)
        ? { ...(result as any), data: enriched }
        : {
            ...(result as any),
            data: { ...(result as any).data, data: enriched },
          };
      return NextResponse.json(shaped);
    }
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
