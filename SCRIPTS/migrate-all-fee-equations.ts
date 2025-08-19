import 'dotenv/config';
import { SupabaseDirectClient } from '@/lib/db/supabase/client';
import { SchemaConfig } from '@/lib/db/schema-manager/config';
import { DealEquationExecutor } from '@/lib/services/fee-engine/deal-equation-executor';

type TemplateRow = {
  deal_id: number;
  component: string;
  basis: 'GROSS' | 'NET' | 'NET_AFTER_PREMIUM';
  precedence: number;
  is_percent: boolean;
  rate: number;
  created_at?: string;
};

async function getDistinctDealIds(client: any): Promise<number[]> {
  const { data, error } = await client
    .from('transactions')
    .select('deal_id');
  if (error) throw error;
  const ids = new Set<number>();
  (data || []).forEach((row: any) => {
    const id = Number(row.deal_id);
    if (!isNaN(id)) ids.add(id);
  });
  return Array.from(ids.values());
}

async function getExistingConfigDealIds(client: any): Promise<Set<number>> {
  const { data, error } = await client
    .from('fee_schedule_config')
    .select('deal_id');
  if (error) throw error;
  return new Set<number>((data || []).map((r: any) => Number(r.deal_id)));
}

async function getBestTemplate(client: any): Promise<TemplateRow[] | null> {
  // Try to pick the deal_id with the most rows as a template
  const { data, error } = await client
    .from('fee_schedule_config')
    .select('*');
  if (error) return null;
  if (!data || data.length === 0) return null;
  const byDeal = new Map<number, TemplateRow[]>();
  for (const row of data) {
    const dealId = Number(row.deal_id);
    const list = byDeal.get(dealId) || [];
    list.push(row as TemplateRow);
    byDeal.set(dealId, list);
  }
  let best: { dealId: number; rows: TemplateRow[] } | null = null;
  for (const [dealId, rows] of byDeal) {
    if (!best || rows.length > best.rows.length) best = { dealId, rows };
  }
  return best ? best.rows : null;
}

function standardPrimaryTemplate(dealId: number): TemplateRow[] {
  const tpl = DealEquationExecutor.getEquationTemplates().STANDARD_PRIMARY_V1;
  const rules = tpl.rules as any;
  const rows: TemplateRow[] = [];
  if (rules.premium) rows.push({ deal_id: dealId, component: 'PREMIUM', basis: rules.premium.basis, precedence: rules.premium.precedence, is_percent: true, rate: rules.premium.rate });
  if (rules.structuring) rows.push({ deal_id: dealId, component: 'STRUCTURING', basis: rules.structuring.basis, precedence: rules.structuring.precedence, is_percent: true, rate: rules.structuring.rate });
  if (rules.management) rows.push({ deal_id: dealId, component: 'MANAGEMENT', basis: rules.management.basis, precedence: rules.management.precedence, is_percent: true, rate: rules.management.rate });
  if (rules.admin) rows.push({ deal_id: dealId, component: 'ADMIN', basis: rules.admin.basis, precedence: rules.admin.precedence, is_percent: false, rate: rules.admin.fixed_amount });
  return rows.map(r => ({ ...r, created_at: new Date().toISOString() }));
}

async function migrate() {
  const client = new SupabaseDirectClient(new SchemaConfig()).getClient();
  const allDeals = await getDistinctDealIds(client);
  const existing = await getExistingConfigDealIds(client);
  const missing = allDeals.filter(id => !existing.has(id));
  console.log(`Found ${allDeals.length} deals; ${existing.size} already configured; ${missing.length} missing.`);

  if (missing.length === 0) {
    console.log('No migration needed.');
    return;
  }

  const template = await getBestTemplate(client);
  console.log(`Using ${template ? 'existing template' : 'STANDARD_PRIMARY defaults'} to seed missing deals.`);

  let totalInserted = 0;
  for (const dealId of missing) {
    const rows: TemplateRow[] = template
      ? (template as TemplateRow[]).map(r => ({
          deal_id: dealId,
          component: r.component,
          basis: r.basis,
          precedence: r.precedence,
          is_percent: r.is_percent,
          rate: r.rate,
          created_at: new Date().toISOString()
        }))
      : standardPrimaryTemplate(dealId);

    const { error } = await client
      .from('fee_schedule_config')
      .insert(rows);

    if (error) {
      console.error(`Failed to insert schedule for deal ${dealId}:`, error.message || error);
      continue;
    }
    totalInserted += rows.length;
    console.log(`Seeded ${rows.length} rows for deal ${dealId}.`);
  }
  console.log(`Done. Inserted ${totalInserted} schedule rows across ${missing.length} deals.`);
}

migrate().catch(err => {
  console.error('Migration failed:', err?.message || err);
  process.exit(1);
});


