import 'dotenv/config';
import { SupabaseDirectClient } from '@/lib/db/supabase/client';
import { SchemaConfig } from '@/lib/db/schema-manager/config';
import { DealEquationExecutor } from '@/lib/services/fee-engine/deal-equation-executor';

async function getApiDeals(baseUrl: string): Promise<number[]> {
  const url = `${baseUrl.replace(/\/$/, '')}/api/deals?limit=1000`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch deals from ${url}`);
  const json: any = await res.json();
  const rows = Array.isArray(json?.data) ? json.data : (Array.isArray(json?.deals) ? json.deals : []);
  const ids = rows.map((d: any) => d.id ?? d.deal_id).filter((x: any) => typeof x === 'number');
  return Array.from(new Set(ids));
}

async function main() {
  const baseUrl = process.env.APP_BASE_URL || 'http://localhost:3001';
  const client = new SupabaseDirectClient(new SchemaConfig()).getClient();

  const apiDealIds = await getApiDeals(baseUrl);
  const { data: existing } = await client.from('fee_schedule_config').select('deal_id');
  const existingSet = new Set<number>((existing || []).map((r: any) => Number(r.deal_id)));
  const missing = apiDealIds.filter(id => !existingSet.has(id));
  console.log(`API returned ${apiDealIds.length} deals; ${existingSet.size} configured; ${missing.length} missing.`);

  if (missing.length === 0) return;

  const tpl = DealEquationExecutor.getEquationTemplates().STANDARD_PRIMARY_V1;
  const rules = tpl.rules as any;

  for (const dealId of missing) {
    const rows = [
      rules.premium && { deal_id: dealId, component: 'PREMIUM', basis: rules.premium.basis, precedence: rules.premium.precedence, is_percent: true, rate: rules.premium.rate },
      rules.structuring && { deal_id: dealId, component: 'STRUCTURING', basis: rules.structuring.basis, precedence: rules.structuring.precedence, is_percent: true, rate: rules.structuring.rate },
      rules.management && { deal_id: dealId, component: 'MANAGEMENT', basis: rules.management.basis, precedence: rules.management.precedence, is_percent: true, rate: rules.management.rate },
      rules.admin && { deal_id: dealId, component: 'ADMIN', basis: rules.admin.basis, precedence: rules.admin.precedence, is_percent: false, rate: rules.admin.fixed_amount },
    ].filter(Boolean).map(r => ({ ...(r as any), created_at: new Date().toISOString() }));

    const { error } = await client.from('fee_schedule_config').insert(rows);
    if (error) {
      console.error(`Failed to seed deal ${dealId} from API list:`, error.message || error);
    } else {
      console.log(`Seeded ${rows.length} rows for deal ${dealId}.`);
    }
  }
}

main().catch(err => {
  console.error('Migration from API failed:', err?.message || err);
  process.exit(1);
});


