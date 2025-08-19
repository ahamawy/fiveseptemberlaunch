import { NextResponse } from 'next/server';
import { SupabaseDirectClient } from '@/lib/db/supabase/client';
import { SchemaConfig } from '@/lib/db/schema-manager/config';
import { enhancedFeeCalculator } from '@/lib/services/fee-engine/enhanced-calculator';

export async function GET(
  _req: Request,
  { params }: { params: { dealId: string } }
) {
  const dealId = parseInt(params.dealId, 10);
  if (isNaN(dealId)) {
    return NextResponse.json({ error: 'Invalid dealId' }, { status: 400 });
  }

  const client = new SupabaseDirectClient(new SchemaConfig()).getClient();

  try {
    // Load schedule from public config
    const { data: schedule } = await client
      .from('fee_schedule_config')
      .select('*')
      .eq('deal_id', dealId)
      .order('precedence', { ascending: true });

    // Find latest transaction for this deal
    const { data: latestTx } = await client
      .from('transactions')
      .select('transaction_id, gross_capital, unit_price, units, createdAt')
      .eq('deal_id', dealId)
      .order('createdAt', { ascending: false })
      .limit(1)
      .maybeSingle();

    let calculation: any = null;
    let stored: any[] = [];

    if (latestTx?.transaction_id) {
      try {
        // Calculate fees for the transaction
        const result = await enhancedFeeCalculator.calculate(
          dealId,
          latestTx.gross_capital,
          latestTx.unit_price
        );
        
        calculation = {
          grossCapital: result.state.grossAmount,
          transferPreDiscount: result.transferPreDiscount,
          totalDiscounts: result.totalDiscounts,
          transferPostDiscount: result.transferPostDiscount,
          netCapital: result.state.netAmount,
          units: result.units,
          validation: result.validation,
          state: {
            appliedFees: result.state.appliedFees
          }
        };
      } catch (calcErr) {
        console.error('Calculation error:', calcErr);
      }
      
      // Pull any stored records
      const { data: storedRows } = await client
        .from('fee_application_record')
        .select('component, amount, percent, applied, notes')
        .eq('transaction_id', latestTx.transaction_id);
      stored = storedRows || [];
    }

    return NextResponse.json({
      dealId,
      schedule: schedule || [],
      latestTransaction: latestTx ? {
        transaction_id: latestTx.transaction_id,
        gross_capital: latestTx.gross_capital,
        unit_price: latestTx.unit_price,
        units: latestTx.units,
        created_at: latestTx.createdAt
      } : null,
      calculation,
      stored
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Unexpected error' }, { status: 500 });
  }
}


