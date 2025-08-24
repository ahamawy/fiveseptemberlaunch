import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/db/supabase/server-client';
import { mapDealRowToDealSummary } from '@/lib/utils/data-contracts';

export async function GET(request: NextRequest) {
  try {
    const supabase = getServiceClient();
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(100, parseInt(searchParams.get('limit') || '20'));
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0'));
    const status = searchParams.get('status'); // 'active' | 'exited' | undefined
    
    // Build query with actual columns from deals.deal table
    let query = supabase
      .from('deals.deal')
      .select(`
        deal_id,
        deal_name,
        deal_type,
        deal_currency,
        underlying_company_id,
        deal_date,
        initial_unit_price,
        gross_capital,
        deal_exited
      `)
      .order('deal_id', { ascending: false })
      .range(offset, offset + limit - 1);
    
    // Add exited filter if status provided
    if (status === 'active') {
      query = query.eq('deal_exited', false);
    } else if (status === 'exited') {
      query = query.eq('deal_exited', true);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    // Map to domain types with available fields
    const mapped = (data || []).map((row: any) => {
      // Since we don't have all fields, create a simplified mapping
      const dealId = Number(row.deal_id);
      return {
        id: dealId,
        name: row.deal_name || `Deal #${dealId}`,
        stage: row.deal_exited ? 'Exited' : 'Active',
        type: row.deal_type,
        currency: row.deal_currency || 'USD',
        target_raise: row.gross_capital ? Number(row.gross_capital) : null,
        minimum_investment: row.initial_unit_price ? Number(row.initial_unit_price) : null,
        opening_date: row.deal_date,
        closing_date: null, // Not available in this table
        created_at: row.deal_date,
        updated_at: row.deal_date,
        company_id: Number(row.underlying_company_id) || 0,
        company_name: null, // Would need a join to get this
        company_sector: null
      };
    });
    
    return NextResponse.json({ 
      success: true, 
      data: mapped,
      pagination: {
        limit,
        offset,
        total: mapped.length
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch deals' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getServiceClient();
    const body = await request.json();
    
    const { data, error } = await supabase
      .from('deals.deal')
      .insert(body)
      .select()
      .single();
    
    if (error) throw error;
    
    // Map to domain type
    const mapped = mapDealRowToDealSummary(data);
    
    return NextResponse.json({ 
      success: true, 
      data: mapped
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create deal' },
      { status: 500 }
    );
  }
}