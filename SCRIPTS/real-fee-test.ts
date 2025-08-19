import 'dotenv/config';
import { enhancedFeeCalculator } from '@/lib/services/fee-engine/enhanced-calculator';
import { SupabaseDirectClient } from '@/lib/db/supabase/client';
import { SchemaConfig } from '@/lib/db/schema-manager/config';

async function main() {
  const config = new SchemaConfig();
  const node = config.validateNodeVersion();
  if (!node.ok) {
    console.warn(`Warning: Node ${node.version} < ${node.required}. Supabase JS prefers Node >= 20.`);
  }

  const client = new SupabaseDirectClient(config).getClient();

  // Fetch recent real transactions
  const { data: txs, error: txErr } = await client
    .from('transactions.transaction.primary')
    .select('transaction_id, deal_id, unit_price, gross_capital')
    .order('transaction_id', { ascending: false })
    .limit(3);

  if (txErr) throw txErr;
  if (!txs || txs.length === 0) {
    console.log('No transactions found');
    return;
  }

  console.log(`Found ${txs.length} recent transactions.`);

  for (const tx of txs) {
    const txId = (tx as any).transaction_id as number;
    const dealId = (tx as any).deal_id as number;
    const unitPrice = parseFloat((tx as any).unit_price);
    const grossCapital = parseFloat((tx as any).gross_capital);

    console.log(`\n=== Transaction ${txId} (deal ${dealId}) ===`);
    console.log(`Gross: ${grossCapital}, Unit Price: ${unitPrice}`);

    try {
      // Calculate from transaction context
      const calc = await enhancedFeeCalculator.calculateForTransaction(txId);
      console.log('Calculated:', {
        pre: calc.transferPreDiscount,
        discounts: calc.totalDiscounts,
        post: calc.transferPostDiscount,
        units: calc.units,
        valid: calc.validation.valid
      });

      // Persist fee application records
      await enhancedFeeCalculator.persistCalculation(txId, calc);
      console.log('Persisted fee application records.');

      // Verify stored rows
      const { data: stored, error: storeErr } = await client
        .from('fee_application_record')
        .select('component, amount, percent, notes')
        .eq('transaction_id', txId);

      if (storeErr) throw storeErr;
      console.log(`Stored ${stored?.length || 0} fee_application_record rows.`);
      if (stored && stored.length > 0) {
        console.log(stored.map((r: any) => ({ component: r.component, amount: r.amount, percent: r.percent })).slice(0, 5));
      }
    } catch (err: any) {
      console.error('Error processing transaction', txId, err?.message || err);
    }
  }
}

main().catch(err => {
  console.error('Fatal error:', err?.message || err);
  process.exit(1);
});


