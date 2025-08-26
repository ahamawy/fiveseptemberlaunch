import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/db/supabase/server-client";

export async function POST(req: NextRequest) {
  try {
    if (process.env.NODE_ENV !== "development") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const sb = getServiceClient();

    // Seed companies
    const { data: companies, error: companiesErr } = await sb
      .from("companies_clean")
      .select("company_id")
      .limit(1);
    if (companiesErr) throw companiesErr;

    let companyId: number | null =
      companies && companies.length > 0
        ? (companies[0] as any).company_id
        : null;
    if (!companyId) {
      const { data: inserted, error: insertCompanyErr } = await sb
        .from("companies_clean")
        .insert({
          company_name: "Acme Corp",
          company_website: "https://acme.example",
          company_sector: "Technology",
        })
        .select("company_id")
        .single();
      if (insertCompanyErr) throw insertCompanyErr;
      companyId = (inserted as any)?.company_id ?? null;
    }

    // Seed deals
    const { data: deals, error: dealsErr } = await sb
      .from("deals_clean")
      .select("deal_id")
      .limit(1);
    if (dealsErr) throw dealsErr;

    if (!deals || deals.length === 0) {
      const { error: insertDealErr } = await sb.from("deals_clean").insert({
        deal_name: "Sample Growth Round",
        deal_status: "ACTIVE",
        deal_type: "INVESTMENT",
        deal_currency: "USD",
        underlying_company_id: companyId,
        deal_date: new Date().toISOString().slice(0, 10),
      });
      if (insertDealErr) throw insertDealErr;
    }

    // Seed investors
    const { data: investors, error: investorsErr } = await sb
      .from("investors_clean")
      .select("investor_id")
      .limit(1);
    if (investorsErr) throw investorsErr;

    if (!investors || investors.length === 0) {
      const { error: insertInvestorErr } = await sb
        .from("investors_clean")
        .insert({
          full_name: "John Doe",
          primary_email: "john.doe@example.com",
          investor_type: "INDIVIDUAL",
          kyc_status: "pending",
        });
      if (insertInvestorErr) throw insertInvestorErr;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Seed error", error);
    return NextResponse.json(
      { error: "Seed failed", details: error?.message || String(error) },
      { status: 500 }
    );
  }
}
