import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/db/supabase/server-client";
import { findCompanyAssetUrls } from "@/lib/utils/storage";

export async function GET() {
  try {
    const sb = getServiceClient();
    const { data, error } = await sb
      .from("companies.company")
      .select("*")
      .order("company_id");
    if (error)
      return NextResponse.json({ error: error.message }, { status: 400 });
    // Enrich with counts from deals
    const companyIds = Array.from(
      new Set((data || []).map((c: any) => c.company_id).filter(Boolean))
    );
    let countsMap = new Map<number, number>();
    if (companyIds.length > 0) {
      const { data: deals } = await sb
        .from("deals.deal")
        .select("underlying_company_id")
        .in("underlying_company_id", companyIds);
      (deals || []).forEach((d: any) => {
        const cid = d.underlying_company_id as number;
        countsMap.set(cid, (countsMap.get(cid) || 0) + 1);
      });
    }
    // Enrich with asset URLs from storage bucket `company-assets/{company_name_slug}`
    const enriched = await Promise.all(
      (data || []).map(async (c: any) => {
        const assets = await findCompanyAssetUrls(sb as any, c.company_id, c.company_name);
        return {
          ...c,
          deal_count: countsMap.get(c.company_id) || 0,
          ...assets,
        };
      })
    );
    return NextResponse.json({ data: enriched });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Internal error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const isDev = process.env.NODE_ENV === "development";
    const adminKey = process.env.ADMIN_API_KEY;
    if (!isDev && adminKey && request.headers.get("x-admin-key") !== adminKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const name: string | undefined = body?.name || body?.company_name;
    if (!name)
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    const sb = getServiceClient();
    const { data, error } = await sb
      .from("companies.company")
      .insert({
        company_name: name,
        company_type: body?.company_type || "PORTFOLIO",
        company_website: body?.website || body?.company_website || null,
        company_sector: body?.sector || body?.company_sector || null,
      })
      .select("*")
      .single();
    if (error)
      return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true, data });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Internal error" },
      { status: 500 }
    );
  }
}
