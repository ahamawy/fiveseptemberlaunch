import { NextRequest, NextResponse } from 'next/server';
import { SupabaseDirectClient } from '@/lib/db/supabase/client';
import { SchemaConfig } from '@/lib/db/schema-manager/config';

export async function GET(request: NextRequest) {
  try {
    const client = new SupabaseDirectClient(new SchemaConfig()).getClient();
    
    // Get all deals with investor counts and capital
    const { data: deals, error } = await client
      .from('investor_units')
      .select('deal_id')
      .then(async (result: any) => {
        if (result.error) throw result.error;
        
        // Get unique deal IDs
        const dealIds = [...new Set(result.data?.map((r: any) => r.deal_id) || [])];
        
        // Get deal details for each
        const dealDetails = await Promise.all(
          dealIds.map(async (dealId: number) => {
            // Get investor count and total capital
            const { data: stats } = await client
              .from('investor_units')
              .select('investor_id, net_capital')
              .eq('deal_id', dealId);
            
            const investorCount = new Set(stats?.map((s: any) => s.investor_id) || []).size;
            const totalCapital = stats?.reduce((sum: number, s: any) => sum + (s.net_capital || 0), 0) || 0;
            
            // Try to get deal name from companies or use default
            let dealName = `Deal ${dealId}`;
            
            // Map specific deal IDs to names (based on your data)
            const dealNames: Record<number, string> = {
              27: 'EWT 1',
              28: 'Groq AI Investment',
              29: 'New Heights 3',
              4: 'SpaceX Series',
              7: 'Figure AI Series B',
              10: 'OpenAI Partnership',
              15: 'Reddit IPO',
              16: 'Figure AI Series C'
            };
            
            dealName = dealNames[dealId] || dealName;
            
            return {
              id: dealId,
              name: dealName,
              investor_count: investorCount,
              total_capital: totalCapital
            };
          })
        );
        
        return dealDetails.filter(d => d.total_capital > 0);
      });
    
    return NextResponse.json({
      success: true,
      deals: deals || []
    });
    
  } catch (e: any) {
    return NextResponse.json({ 
      error: e?.message || 'Failed to fetch deals' 
    }, { status: 500 });
  }
}