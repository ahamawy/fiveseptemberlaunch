import { NextRequest, NextResponse } from 'next/server';
import { SupabaseDirectClient } from '@/lib/db/supabase/client';
import { SchemaConfig } from '@/lib/db/schema-manager/config';

export async function GET(
  request: NextRequest,
  { params }: { params: { dealId: string } }
) {
  try {
    const client = new SupabaseDirectClient(new SchemaConfig()).getClient();
    const dealId = parseInt(params.dealId);
    
    // Get all investors in this deal
    const { data: investors, error } = await client
      .from('investor_units')
      .select('investor_id, units_purchased, net_capital, current_value')
      .eq('deal_id', dealId);
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Get investor names if available
    const investorDetails = await Promise.all(
      (investors || []).map(async (inv: any) => {
        // Try to get investor name
        const { data: investorInfo } = await client
          .from('investors_clean')
          .select('full_name, primary_email')
          .eq('investor_id', inv.investor_id)
          .single();
        
        return {
          ...inv,
          investor_name: investorInfo?.full_name || investorInfo?.primary_email || `Investor ${inv.investor_id}`
        };
      })
    );
    
    // Get existing fees for this deal
    const { data: existingFees } = await client
      .from('fee_application_record')
      .select('*')
      .eq('deal_id', dealId);
    
    return NextResponse.json({
      success: true,
      deal_id: dealId,
      investors: investorDetails,
      existing_fees: existingFees || [],
      total_capital: investorDetails.reduce((sum: number, inv: any) => sum + (inv.net_capital || 0), 0),
      total_current_value: investorDetails.reduce((sum: number, inv: any) => sum + (inv.current_value || 0), 0)
    });
    
  } catch (e: any) {
    return NextResponse.json({ 
      error: e?.message || 'Failed to fetch deal details' 
    }, { status: 500 });
  }
}