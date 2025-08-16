import { NextRequest, NextResponse } from 'next/server';
import { SupabaseDirectClient } from '@/lib/db/supabase/client';
import { SchemaConfig } from '@/lib/db/schema-manager/config';

export async function POST(
  request: NextRequest,
  { params }: { params: { session_id: string } }
) {
  try {
    const client = new SupabaseDirectClient(new SchemaConfig()).getClient();
    const { session_id } = params;
    const body = await request.json();
    const { apply_to_staging = true, apply_to_final = false } = body;
    
    // Get session with parsed data
    const { data: session, error: sessionError } = await client
      .from('smart_import_sessions')
      .select('*')
      .eq('session_id', session_id)
      .single();
    
    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    
    if (session.status !== 'preview' || !session.parsed_data) {
      return NextResponse.json({ error: 'Session not ready for apply' }, { status: 400 });
    }
    
    const parsedData = session.parsed_data;
    let appliedCount = 0;
    const results: any[] = [];
    
    // Process each row
    for (const row of parsedData) {
      try {
        // Stage 1: Import to staging table
        if (apply_to_staging) {
          const stagingData = {
            deal_id: row.deal_id,
            transaction_id: row.transaction_id || null,
            component: 'composite', // Will be split into components
            basis: 'capital',
            percent: null,
            amount: row.fees_total || 0,
            notes: `Smart import from ${session.filename}`,
            source_file: session.filename
          };
          
          // Insert individual fee components
          const components = [
            { type: 'management_fee', amount: row.management_fee },
            { type: 'admin_fee', amount: row.admin_fee },
            { type: 'performance_fee', amount: row.performance_fee },
            { type: 'structuring_fee', amount: row.structuring_fee }
          ].filter(c => c.amount && c.amount > 0);
          
          for (const component of components) {
            await client
              .from('fee_legacy_import')
              .insert({
                ...stagingData,
                component: component.type,
                amount: component.amount
              });
          }
        }
        
        // Stage 2: Apply to final table
        if (apply_to_final) {
          const components = [
            { type: 'management_fee', amount: row.management_fee },
            { type: 'admin_fee', amount: row.admin_fee },
            { type: 'performance_fee', amount: row.performance_fee },
            { type: 'structuring_fee', amount: row.structuring_fee }
          ].filter(c => c.amount && c.amount > 0);
          
          for (const component of components) {
            await client
              .from('fee_application_record')
              .insert({
                deal_id: row.deal_id,
                transaction_id: row.transaction_id || null,
                component: component.type,
                amount: component.amount,
                percent: null,
                applied: true,
                notes: `Applied via smart import ${session_id}`
              });
          }
        }
        
        appliedCount++;
        results.push({
          row_index: parsedData.indexOf(row),
          status: 'success',
          deal_id: row.deal_id,
          investor_id: row.investor_id
        });
        
      } catch (e: any) {
        results.push({
          row_index: parsedData.indexOf(row),
          status: 'error',
          error: e.message
        });
      }
    }
    
    // Update session status
    await client
      .from('smart_import_sessions')
      .update({
        status: 'applied',
        rows_applied: appliedCount,
        applied_at: new Date().toISOString()
      })
      .eq('session_id', session_id);
    
    return NextResponse.json({
      success: true,
      applied_count: appliedCount,
      total_rows: parsedData.length,
      results: results.slice(0, 100) // Limit results for response size
    });
    
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to apply import' }, { status: 500 });
  }
}