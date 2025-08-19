import { NextResponse } from "next/server";
import { SupabaseDirectClient } from "@/lib/db/supabase/client";
import { SchemaConfig } from "@/lib/db/schema-manager/config";

export async function POST() {
  const client = new SupabaseDirectClient(new SchemaConfig()).getClient();

  const outcome = {
    basisStandardized: 0,
    scheduleDuplicatesRemoved: 0,
    applicationDuplicatesRemoved: 0,
  };

  try {
    // 1) Standardize basis values in fee_schedule_config
    const { data: schedRows } = await client
      .from("fee_schedule_config")
      .select("schedule_id, basis");

    if (Array.isArray(schedRows)) {
      for (const row of schedRows) {
        const raw = String(row.basis || "").toUpperCase();
        let normalized: "GROSS" | "NET" | "NET_AFTER_PREMIUM" | null = null;
        if (raw === "GROSS_CAPITAL" || raw === "GROSS" || raw === "FIXED")
          normalized = "GROSS";
        else if (raw === "NET_AFTER_PREMIUM") normalized = "NET_AFTER_PREMIUM";
        else if (raw === "VALUATION" || raw === "NET") normalized = "NET";
        else normalized = "NET";

        if (normalized && normalized !== row.basis) {
          const { error } = await client
            .from("fee_schedule_config")
            .update({ basis: normalized })
            .eq("schedule_id", row.schedule_id);
          if (!error) outcome.basisStandardized++;
        }
      }
    }

    // 2) Remove duplicate configurations in fee_schedule_config
    const { data: allSched } = await client
      .from("fee_schedule_config")
      .select("*");
    if (Array.isArray(allSched)) {
      const byKey = new Map<string, any[]>();
      for (const r of allSched) {
        const key = `${r.deal_id}::${r.component}`;
        const list = byKey.get(key) || [];
        list.push(r);
        byKey.set(key, list);
      }

      for (const [, list] of byKey) {
        if (list.length <= 1) continue;
        list.sort((a, b) => {
          const pa = Number(a.precedence ?? 999);
          const pb = Number(b.precedence ?? 999);
          if (pa !== pb) return pa - pb;
          const da = a.created_at ? new Date(a.created_at).getTime() : 0;
          const db = b.created_at ? new Date(b.created_at).getTime() : 0;
          return db - da;
        });
        const keep = list[0];
        const remove = list.slice(1);
        for (const rem of remove) {
          const { error } = await client
            .from("fee_schedule_config")
            .delete()
            .eq("schedule_id", rem.schedule_id);
          if (!error) outcome.scheduleDuplicatesRemoved++;
        }
      }
    }

    // 3) Remove duplicate fee applications in fee_application_record
    const { data: allApps } = await client
      .from("fee_application_record")
      .select("id, transaction_id, component, created_at");
    if (Array.isArray(allApps)) {
      const byKey = new Map<string, any[]>();
      for (const r of allApps) {
        const key = `${r.transaction_id || "NULL"}::${r.component}`;
        const list = byKey.get(key) || [];
        list.push(r);
        byKey.set(key, list);
      }
      for (const [, list] of byKey) {
        if (list.length <= 1) continue;
        list.sort((a, b) => {
          const da = a.created_at ? new Date(a.created_at).getTime() : 0;
          const db = b.created_at ? new Date(b.created_at).getTime() : 0;
          return db - da; // newest first
        });
        const remove = list.slice(1);
        for (const rem of remove) {
          const { error } = await client
            .from("fee_application_record")
            .delete()
            .eq("id", rem.id);
          if (!error) outcome.applicationDuplicatesRemoved++;
        }
      }
    }

    return NextResponse.json({ success: true, outcome });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Unexpected error", outcome },
      { status: 500 }
    );
  }
}
