import "dotenv/config";
import { SupabaseDirectClient } from "@/lib/db/supabase/client";
import { SchemaConfig } from "@/lib/db/schema-manager/config";
import fs from "fs";
import path from "path";

async function main() {
  const config = new SchemaConfig();
  const client = new SupabaseDirectClient(config).getClient();

  const investorId = parseInt(process.env.SNAPSHOT_INVESTOR_ID || "1", 10);

  const { data: analytics } = await client
    .from("portfolio_analytics")
    .select("total_aum, total_portfolio_value, average_moic, irr_portfolio, active_deals_count, calculation_date")
    .order("calculation_date", { ascending: false })
    .limit(1)
    .single();

  const { data: dashboardRes } = await client
    .from("transactions")
    .select("investor_id")
    .eq("investor_id", investorId)
    .limit(1);

  const snapshot = {
    investorId,
    analytics: analytics || null,
    timestamp: new Date().toISOString(),
  };

  const outDir = path.resolve(process.cwd(), "test-results");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `db-baseline.json`);
  fs.writeFileSync(outPath, JSON.stringify(snapshot, null, 2));
  console.log("Wrote baseline:", outPath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
