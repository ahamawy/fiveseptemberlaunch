import { NextRequest, NextResponse } from 'next/server';
import { SupabaseDirectClient } from '@/lib/db/supabase/client';
import { SchemaConfig } from '@/lib/db/schema-manager/config';

export async function POST(req: NextRequest) {
  try {
    // Parse optional dry_run parameter from request body or query params
    const url = new URL(req.url);
    const dryRun = url.searchParams.get('dry_run') === 'true';
    
    // Also check request body if provided
    let bodyDryRun = false;
    try {
      const body = await req.json();
      bodyDryRun = body.dry_run === true;
    } catch {
      // No body or invalid JSON, use query param
    }
    
    const isDryRun = dryRun || bodyDryRun;
    
    const client = new SupabaseDirectClient(new SchemaConfig()).getClient();
    
    // Since we're using public schema tables, implement the apply logic here
    const { data: imports, error: importsError } = await client
      .from('fee_legacy_import')
      .select('*');
      
    if (importsError) {
      return NextResponse.json({ success: false, error: importsError.message }, { status: 500 });
    }
    
    let inserted = 0;
    let updated = 0;
    let totalDelta = 0;
    
    if (!isDryRun && imports && imports.length > 0) {
      // Process each import
      for (const imp of imports) {
        // Check if fee already exists
        const { data: existing } = await client
          .from('fee_application_record')
          .select('id, amount')
          .eq('deal_id', imp.deal_id)
          .eq('transaction_id', imp.transaction_id)
          .eq('component', imp.component)
          .single();
        
        if (existing) {
          // Update existing
          await client
            .from('fee_application_record')
            .update({
              amount: imp.amount,
              percent: imp.percent,
              notes: imp.notes,
              updated_at: new Date().toISOString()
            })
            .eq('id', existing.id);
          updated++;
          totalDelta += (imp.amount || 0) - (existing.amount || 0);
        } else if (imp.transaction_id) {
          // Insert new
          await client
            .from('fee_application_record')
            .insert({
              transaction_id: imp.transaction_id,
              deal_id: imp.deal_id,
              component: imp.component,
              amount: imp.amount,
              percent: imp.percent,
              notes: imp.notes
            });
          inserted++;
          totalDelta += imp.amount || 0;
        }
      }
      
      // Clear import table after applying
      await client
        .from('fee_legacy_import')
        .delete()
        .gte('id', 0);
    }
    
    const data = {
      inserted,
      updated,
      total_delta: totalDelta,
      dry_run: isDryRun
    };
    
    return NextResponse.json({ 
      success: true, 
      data,
      dry_run: isDryRun,
      message: isDryRun 
        ? `Dry run complete: Would insert ${data?.inserted || 0}, update ${data?.updated || 0}`
        : `Applied: inserted ${data?.inserted || 0}, updated ${data?.updated || 0}`
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Apply failed' }, { status: 500 });
  }
}

