import { NextResponse } from "next/server";
import { SupabaseDirectClient } from "@/lib/db/supabase/client";
import { SchemaConfig } from "@/lib/db/schema-manager/config";

type ScheduleConfigRow = {
  schedule_id: number;
  deal_id: number;
  component: string;
  basis: string;
  rate: string | number;
  is_percent: boolean;
  precedence: number;
  created_at?: string;
};

function normalizeBasis(basis: string): "GROSS" | "NET" | "UNITS" | "FLAT" {
  const raw = String(basis || "").toUpperCase();
  if (raw === "GROSS" || raw === "GROSS_CAPITAL" || raw === "FIXED")
    return "GROSS";
  if (raw === "NET" || raw === "VALUATION" || raw === "NET_AFTER_PREMIUM")
    return "NET";
  return "NET";
}

async function deriveForDeal(client: any, dealId: number) {
  // 1) Load public config ordered by precedence
  const { data: config, error: cfgErr } = await client
    .from("fee_schedule_config")
    .select(
      "schedule_id, deal_id, component, basis, rate, is_percent, precedence, created_at"
    )
    .eq("deal_id", dealId)
    .order("precedence", { ascending: true });
  if (cfgErr) throw cfgErr;

  const rows: ScheduleConfigRow[] = Array.isArray(config)
    ? (config as any)
    : [];
  if (rows.length === 0) {
    return { dealId, inserted: 0, replaced: 0 };
  }

  // 2) Replace existing fees.fee_schedule scope rows for this deal
  const { error: delErr } = await client
    .from("fee_schedule")
    .delete()
    .eq("scope_type", "DEAL")
    .eq("scope_id", dealId);
  if (delErr) throw delErr;

  // 3) Transform and insert
  const today = new Date().toISOString().slice(0, 10);
  const insertRows = rows.map((r) => {
    const rateNum = Number(r.rate ?? 0);
    const isPercent = Boolean(r.is_percent);
    return {
      scope_type: "DEAL",
      scope_id: r.deal_id,
      component: String(r.component || "").toUpperCase(),
      basis: normalizeBasis(r.basis),
      rate_percent: isPercent ? rateNum : null,
      amount: isPercent ? null : rateNum,
      starts_on: today,
      ends_on: null,
      version: 1,
      is_active: true,
    };
  });

  const { data: inserted, error: insErr } = await client
    .from("fee_schedule")
    .insert(insertRows)
    .select("id");
  if (insErr) throw insErr;

  return { dealId, inserted: inserted?.length || 0, replaced: rows.length };
}

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = new SupabaseDirectClient(new SchemaConfig()).getClient();
    const param = params.id;

    if (param.toLowerCase() === "all") {
      // Derive for all deals present in public config
      const { data: deals, error } = await supabase
        .from("fee_schedule_config")
        .select("deal_id")
        .order("deal_id", { ascending: true });
      if (error) throw error;

      const unique = Array.from(
        new Set((deals || []).map((d: any) => Number(d.deal_id)))
      ).filter((n) => Number.isFinite(n));

      const results: Array<{
        dealId: number;
        inserted: number;
        replaced: number;
      }> = [];
      for (const id of unique) {
        const r = await deriveForDeal(supabase, id);
        results.push(r);
      }
      const totalInserted = results.reduce((s, r) => s + r.inserted, 0);
      return NextResponse.json({
        mode: "all",
        totalDeals: results.length,
        totalInserted,
        results,
      });
    }

    const dealId = parseInt(param, 10);
    if (Number.isNaN(dealId)) {
      return NextResponse.json({ error: "Invalid dealId" }, { status: 400 });
    }

    const result = await deriveForDeal(supabase, dealId);
    return NextResponse.json({ mode: "single", ...result });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}

