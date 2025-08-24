import { NextRequest, NextResponse } from "next/server";
import { dealsService } from "@/lib/services";
import { getServiceClient } from "@/lib/db/supabase/server-client";
import { findCompanyAssetUrls } from "@/lib/utils/storage";
import { mapDealRowToDealSummary } from "@/lib/utils/data-contracts";
import type { DealStage, DealType } from "@/lib/db/types";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, parseInt(searchParams.get("limit") || "10"));
    const search = searchParams.get("search");
    const stage = searchParams.get("stage");

    // Server-only read ensures cross-schema access works regardless of anon exposure
    const sb = getServiceClient();
    
    // Query from deals.deal table (in public schema)
    let query = sb.from("deals.deal").select("*");
    if (search) query = query.ilike("deal_name", `%${search}%`);
    if (stage) query = query.eq("deal_status", stage);
    query = query
      .order("deal_id", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    const { data, error } = await query;
    if (error) throw error;

    // Get latest valuations for each deal
    const dealIds = (data || []).map((d: any) => d.deal_id);
    let valuationsMap = new Map<number, { moic: number; irr: number | null }>();
    
    if (dealIds.length > 0) {
      // Get latest valuation for each deal
      const { data: valuations } = await sb
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

    const mapped = (data || []).map((d: any) =>
      mapDealRowToDealSummary(d, undefined, valuationsMap.get(d.deal_id) || undefined)
    );

    // Enrich with company name
    const companyIds = Array.from(
      new Set(mapped.map((m: any) => m.company_id).filter(Boolean))
    );
    let companyIdToName = new Map<number, string>();
    let companyIdToDesc = new Map<number, string | null>();
    let companyIdToAssets = new Map<
      number,
      { logo_url: string | null; background_url: string | null }
    >();
    if (companyIds.length > 0) {
      const { data: companies } = await sb
        .from("companies.company")
        .select("company_id, company_name, company_description")
        .in("company_id", companyIds);
      (companies || []).forEach((c: any) => {
        companyIdToName.set(c.company_id, c.company_name);
        companyIdToDesc.set(c.company_id, c.company_description ?? null);
      });
      // Fetch storage assets per company
      for (const cid of companyIds) {
        const companyName = companyIdToName.get(cid as number);
        const assets = await findCompanyAssetUrls(sb as any, cid as number, companyName);
        companyIdToAssets.set(cid as number, assets);
      }
    }
    // Add investor_count and tx_count from transactions
    const mappedDealIds = mapped.map((m: any) => m.id).filter(Boolean);
    let investorCountMap = new Map<number, number>();
    let txCountMap = new Map<number, number>();
    let docsCountMap = new Map<number, number>();
    if (mappedDealIds.length > 0) {
      const { data: tx } = await sb
        .from("transactions")
        .select("deal_id, investor_id, transaction_id")
        .in("deal_id", mappedDealIds);
      const investorsByDeal = new Map<number, Set<number>>();
      (tx || []).forEach((t: any) => {
        const d = t.deal_id as number;
        txCountMap.set(d, (txCountMap.get(d) || 0) + 1);
        if (!investorsByDeal.has(d)) investorsByDeal.set(d, new Set());
        if (t.investor_id) investorsByDeal.get(d)!.add(t.investor_id);
      });
      investorsByDeal.forEach((set, d) => investorCountMap.set(d, set.size));

      // Documents count per deal (all investors)
      const { data: docs } = await (sb as any)
        .schema('documents')
        .from('document')
        .select('deal_id')
        .in('deal_id', mappedDealIds);
      (docs || []).forEach((d: any) => {
        const id = d.deal_id as number;
        if (!id) return;
        docsCountMap.set(id, (docsCountMap.get(id) || 0) + 1);
      });
    }

    const enriched = mapped.map((m: any) => ({
      ...m,
      // Flatten valuation to top level for backwards compatibility
      moic: m.valuation?.moic ?? 1.0,
      irr: m.valuation?.irr ?? null,
      company_name: m.company_id
        ? companyIdToName.get(m.company_id) || null
        : null,
      company_description: m.company_id
        ? companyIdToDesc.get(m.company_id) || null
        : null,
      company_logo_url: m.company_id
        ? companyIdToAssets.get(m.company_id)?.logo_url || null
        : null,
      company_background_url: m.company_id
        ? companyIdToAssets.get(m.company_id)?.background_url || null
        : null,
      investor_count: investorCountMap.get(m.id) || 0,
      tx_count: txCountMap.get(m.id) || 0,
      documents_count: docsCountMap.get(m.id) || 0,
      display: `${m.name} — ${
        m.company_id
          ? companyIdToName.get(m.company_id) || `Company #${m.company_id}`
          : "No Company"
      }`,
    }));

    return NextResponse.json({
      success: true,
      data: enriched,
      metadata: {
        pagination: {
          page,
          limit,
          total: enriched.length,
          totalPages: enriched.length === 0 ? 0 : page,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching deals:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Create a new deal (server-only, secured)
 */
export async function POST(request: NextRequest) {
  try {
    // Basic admin guard: allow in development, otherwise require ADMIN_API_KEY header
    const isDev = process.env.NODE_ENV === "development";
    const adminKey = process.env.ADMIN_API_KEY;
    if (!isDev && adminKey && request.headers.get("x-admin-key") !== adminKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const name: string | undefined = body?.name || body?.deal_name;
    const currency: string = body?.currency || body?.deal_currency || "USD";
    const status: string = body?.status || body?.deal_status || "ACTIVE";
    const companyId: number | null =
      body?.company_id ?? body?.underlying_company_id ?? null;

    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    const sb = getServiceClient();

    const insertPayload: any = {
      deal_name: name,
      deal_status: status,
      deal_currency: currency,
      deal_date: new Date().toISOString().slice(0, 10),
    };
    if (companyId) insertPayload.underlying_company_id = companyId;
    // Note: deal_type omitted to avoid enum mismatches across environments

    const { data, error } = await sb
      .from("deals.deal")
      .insert(insertPayload)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal error" },
      { status: 500 }
    );
  }
}
