import { NextRequest, NextResponse } from "next/server";
import { FormulaManager } from "@/lib/services/formula-engine/formula-manager";
import { getServiceClient } from "@/lib/db/supabase/server-client";

const formulaManager = new FormulaManager();

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const dealId = parseInt(params.id);
    const template = await formulaManager.getDealFormula(dealId);
    return NextResponse.json({ success: true, data: template });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const dealId = parseInt(params.id);
    const { formulaTemplateId } = await request.json();
    if (!formulaTemplateId || Number.isNaN(Number(formulaTemplateId))) {
      return NextResponse.json(
        { success: false, error: "formulaTemplateId is required" },
        { status: 400 }
      );
    }

    const ok = await formulaManager.assignFormulaToDeal(
      dealId,
      Number(formulaTemplateId)
    );
    if (!ok) {
      return NextResponse.json(
        { success: false, error: "Failed to assign formula to deal" },
        { status: 500 }
      );
    }

    // Auto-sync: derive fee schedule config from assigned template + deal variables
    const sb = getServiceClient();
    // Load assigned template (optional; not strictly needed for config sync)
    const tpl = await formulaManager.getFormulaTemplate(
      Number(formulaTemplateId)
    );
    const vars = await formulaManager.getDealVariables(dealId);

    // Helper: safe number
    const num = (v: any) => (v == null || v === "" ? undefined : Number(v));

    // Extract commonly used variables per naming in definitions
    const PMSP = num(vars.PMSP);
    const ISP = num(vars.ISP);
    const MFR = num(vars.MFR); // management fee rate (percent as 0.x)
    const SFR = num(vars.SFR); // structuring fee rate (percent as 0.x)
    const AF = num(vars.AF); // admin fee flat amount
    const PFR = num(vars.PFR); // performance fee rate (percent as 0.x)

    // Compute premium rate from PMSP/ISP if available
    let premiumRate: number | undefined;
    if (PMSP != null && ISP != null && ISP !== 0) {
      const ratio = PMSP / ISP;
      if (ratio >= 0 && ratio <= 1) {
        premiumRate = 1 - ratio; // GC * (1 - PMSP/ISP)
      }
    }

    // Build precedence-ordered schedule config rows
    type CfgRow = {
      deal_id: number;
      component: string;
      basis: "GROSS" | "NET" | "NET_AFTER_PREMIUM";
      rate: number | null; // store rate or amount in the same field; flag via is_percent
      is_percent: boolean;
      precedence: number;
    };

    const configRows: CfgRow[] = [];

    // PREMIUM always precedence 1 when applicable
    if (premiumRate && premiumRate > 0) {
      configRows.push({
        deal_id: dealId,
        component: "PREMIUM",
        basis: "GROSS",
        rate: premiumRate,
        is_percent: true,
        precedence: 1,
      });
    }

    // STRUCTURING (2)
    if (SFR && SFR > 0) {
      configRows.push({
        deal_id: dealId,
        component: "STRUCTURING",
        basis: "GROSS",
        rate: SFR,
        is_percent: true,
        precedence: 2,
      });
    }

    // MANAGEMENT (3)
    if (MFR && MFR > 0) {
      configRows.push({
        deal_id: dealId,
        component: "MANAGEMENT",
        basis: "GROSS",
        rate: MFR,
        is_percent: true,
        precedence: 3,
      });
    }

    // ADMIN (4) - typically flat amount
    if (AF && AF > 0) {
      configRows.push({
        deal_id: dealId,
        component: "ADMIN",
        basis: "GROSS",
        rate: AF,
        is_percent: false,
        precedence: 4,
      });
    }

    // PERFORMANCE (5) - applied on net basis
    if (PFR && PFR > 0) {
      configRows.push({
        deal_id: dealId,
        component: "PERFORMANCE",
        basis: premiumRate ? "NET_AFTER_PREMIUM" : "NET",
        rate: PFR,
        is_percent: true,
        precedence: 5,
      });
    }

    // Replace fee_schedule_config for this deal
    await sb.from("fee_schedule_config").delete().eq("deal_id", dealId);
    if (configRows.length > 0) {
      await sb.from("fee_schedule_config").insert(
        configRows.map((r) => ({
          deal_id: r.deal_id,
          component: r.component,
          basis: r.basis,
          rate: r.rate,
          is_percent: r.is_percent,
          precedence: r.precedence,
        }))
      );
    }

    // Also materialize fees.fee_schedule as active rows (single version = 1)
    const today = new Date().toISOString().slice(0, 10);
    await sb
      .from("fee_schedule")
      .delete()
      .eq("scope_type", "DEAL")
      .eq("scope_id", dealId);
    if (configRows.length > 0) {
      await sb.from("fee_schedule").insert(
        configRows.map((r) => ({
          scope_type: "DEAL",
          scope_id: r.deal_id,
          component: r.component,
          basis: r.basis,
          rate_percent: r.is_percent ? r.rate : null,
          amount: r.is_percent ? null : r.rate,
          starts_on: today,
          ends_on: null,
          version: 1,
          is_active: true,
        }))
      );
    }

    const template = await formulaManager.getDealFormula(dealId);
    return NextResponse.json({ success: true, data: template });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
