import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/db/supabase/server-client";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const sb = getServiceClient();
    
    // Get deal details
    const { data: deal, error: dealError } = await sb
      .from("deals.deal")
      .select("*")
      .eq("deal_id", id)
      .single();
      
    if (dealError)
      return NextResponse.json({ error: dealError.message }, { status: 404 });
    
    // Get company details if available
    let company = null;
    if (deal.underlying_company_id) {
      const { data: companyData } = await sb
        .from("companies.company")
        .select("company_id, company_name, company_sector")
        .eq("company_id", deal.underlying_company_id)
        .single();
      company = companyData;
    }
    
    // Get latest valuation if available
    let valuation = null;
    const { data: valuationData } = await sb
      .from("deal_valuations")
      .select("moic, irr, valuation_date")
      .eq("deal_id", id)
      .order("valuation_date", { ascending: false })
      .limit(1)
      .single();
    
    if (valuationData) {
      valuation = {
        moic: parseFloat(valuationData.moic) || 1.0,
        irr: valuationData.irr ? parseFloat(valuationData.irr) : null,
        date: valuationData.valuation_date
      };
    }
    
    // Format response with all details
    const response = {
      id: deal.deal_id,
      name: deal.deal_name,
      type: deal.deal_type,
      stage: deal.deal_status,
      currency: deal.deal_currency,
      target_raise: deal.target_raise,
      minimum_investment: deal.minimum_investment,
      opening_date: deal.deal_date,
      closing_date: deal.exit_date,
      description: deal.description,
      company_id: company?.company_id || deal.underlying_company_id,
      company_name: company?.company_name || null,
      company_sector: company?.company_sector || null,
      valuation,
      // Flatten for backward compatibility
      moic: valuation?.moic || 1.0,
      irr: valuation?.irr || null,
      created_at: deal.created_at,
      updated_at: deal.updated_at
    };
    
    return NextResponse.json(response);
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Internal error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const isDev = process.env.NODE_ENV === "development";
    const adminKey = process.env.ADMIN_API_KEY;
    if (!isDev && adminKey && request.headers.get("x-admin-key") !== adminKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const id = Number(params.id);
    const body = await request.json();

    const update: any = {};
    if (body?.name) update.deal_name = body.name;
    if (body?.status) update.deal_status = body.status;
    if (body?.currency) update.deal_currency = body.currency;
    if (body?.company_id) update.underlying_company_id = body.company_id;

    const sb = getServiceClient();
    const { data, error } = await sb
      .from("deals.deal")
      .update(update)
      .eq("deal_id", id)
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const isDev = process.env.NODE_ENV === "development";
    const adminKey = process.env.ADMIN_API_KEY;
    if (!isDev && adminKey && request.headers.get("x-admin-key") !== adminKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const id = Number(params.id);
    const sb = getServiceClient();
    const { error } = await sb.from("deals.deal").delete().eq("deal_id", id);
    if (error)
      return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Internal error" },
      { status: 500 }
    );
  }
}


