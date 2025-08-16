import { NextRequest, NextResponse } from 'next/server';
import { SupabaseDirectClient } from '@/lib/db/supabase/client';
import { SchemaConfig } from '@/lib/db/schema-manager/config';

export async function POST(
  request: NextRequest,
  { params }: { params: { dealId: string } }
) {
  try {
    const client = new SupabaseDirectClient(new SchemaConfig()).getClient();
    const dealId = parseInt(params.dealId);
    const body = await request.json();
    const { fee_template, investor_fees } = body;
    
    let appliedCount = 0;
    const errors: any[] = [];
    
    // Process each investor's fees
    for (const investorFee of investor_fees) {
      try {
        // Apply each fee component
        for (const fee of investorFee.fees) {
          if (fee.amount && fee.amount > 0) {
            // Insert into staging table
            await client.from('fee_legacy_import').insert({
              deal_id: dealId,
              transaction_id: null,
              component: fee.component,
              basis: fee.basis,
              percent: fee.percent || null,
              amount: fee.amount,
              notes: `Deal ${dealId} - Investor ${investorFee.investor_id}`,
              source_file: 'deal_editor'
            });
            
            // Insert into application table
            await client.from('fee_application_record').insert({
              deal_id: dealId,
              transaction_id: null,
              component: fee.component,
              amount: fee.amount,
              percent: fee.percent || null,
              applied: true,
              notes: `Applied via deal editor - Investor ${investorFee.investor_id}`
            });
          }
        }
        
        appliedCount++;
      } catch (e: any) {
        errors.push({
          investor_id: investorFee.investor_id,
          error: e.message
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      applied_count: appliedCount,
      errors: errors.length > 0 ? errors : undefined,
      total_fees_applied: investor_fees.reduce((sum: number, inv: any) => sum + inv.total_fees, 0)
    });
    
  } catch (e: any) {
    return NextResponse.json({ 
      error: e?.message || 'Failed to apply fees' 
    }, { status: 500 });
  }
}