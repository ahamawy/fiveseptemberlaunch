import { NextResponse } from 'next/server';
import { SupabaseDirectClient } from '@/lib/db/supabase/client';
import { SchemaConfig } from '@/lib/db/schema-manager/config';
import { formulaEngine } from '@/lib/services/formula-engine.service';

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
        // Calculate fees using the formula engine
        const result = await formulaEngine.calculateForDeal({
          dealId,
          transactionId: latestTx.transaction_id,
          grossCapital: latestTx.gross_capital
        });
        
        calculation = {
          grossCapital: latestTx.gross_capital,
          transferPreDiscount: result.totalFees,
          totalDiscounts: 0, // Discounts are applied within formula engine
          transferPostDiscount: result.totalFees,
          netCapital: result.netCapital,
          units: latestTx.units,
          validation: {
            valid: true,
            formulaUsed: result.formulaUsed,
            calculationMethod: result.calculationMethod
          },
          state: {
            appliedFees: [
              { type: 'structuring', amount: result.structuringFee },
              { type: 'management', amount: result.managementFee },
              { type: 'performance', amount: result.performanceFee },
              { type: 'premium', amount: result.premiumFee },
              { type: 'admin', amount: result.adminFee },
              { type: 'other', amount: result.otherFees }
            ]
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