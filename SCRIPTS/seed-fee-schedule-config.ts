import 'dotenv/config';
import { SupabaseDirectClient } from '@/lib/db/supabase/client';
import { SchemaConfig } from '@/lib/db/schema-manager/config';
import { DealEquationExecutor } from '@/lib/services/fee-engine/deal-equation-executor';

type Rule = {
  basis: 'GROSS' | 'NET' | 'NET_AFTER_PREMIUM';
  rate?: number;
  fixed_amount?: number;
  precedence: number;
};

async function buildDefaultRows(dealId: number) {
  const templates = DealEquationExecutor.getEquationTemplates();
  const tpl = templates.STANDARD_PRIMARY_V1;
  const rules = tpl.rules as Record<string, Rule>;
  const rows = Object.entries(rules).map(([component, rule]) => ({
    deal_id: dealId,
    component: component.toUpperCase(),
    basis: rule.basis,
    precedence: rule.precedence,
    is_percent: typeof rule.rate === 'number',
    rate: (typeof rule.rate === 'number' ? rule.rate : (rule.fixed_amount || 0)),
    created_at: new Date().toISOString(),
  }));
  return rows;
}

async function main() {
  const args = process.argv.slice(2).map(n => parseInt(n, 10)).filter(n => !isNaN(n));
  const targetDeals = args.length > 0 ? args : [27, 29];

  const client = new SupabaseDirectClient(new SchemaConfig()).getClient();

  // Use an existing deal as reference if it has config (e.g., 28)
  const { data: refRows } = await client
    .from('fee_schedule_config')
    .select('*')
    .eq('deal_id', 28)
    .order('precedence', { ascending: true });

  for (const dealId of targetDeals) {
    const { data: existing, error: existErr } = await client
      .from('fee_schedule_config')
      .select('deal_id')
      .eq('deal_id', dealId)
      .limit(1);

    if (existErr) {
      console.error(`Failed to check existing config for deal ${dealId}:`, existErr.message || existErr);
      continue;
    }
    if (existing && existing.length > 0) {
      console.log(`Deal ${dealId}: schedule already exists, skipping.`);
      continue;
    }

    let rows: any[] = [];
    if (refRows && refRows.length > 0) {
      rows = refRows.map(r => ({
        deal_id: dealId,
        component: r.component,
        basis: r.basis,
        precedence: r.precedence,
        is_percent: r.is_percent,
        rate: r.rate,
        created_at: new Date().toISOString(),
      }));
    } else {
      rows = await buildDefaultRows(dealId);
    }

    const { error: insErr } = await client
      .from('fee_schedule_config')
      .insert(rows);

    if (insErr) {
      console.error(`Failed to seed schedule for deal ${dealId}:`, insErr.message || insErr);
    } else {
      console.log(`Seeded ${rows.length} schedule rows for deal ${dealId}.`);
    }
  }
}

main().catch(err => {
  console.error('Fatal error:', err?.message || err);
  process.exit(1);
});


