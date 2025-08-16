import { NextRequest, NextResponse } from 'next/server';
import { feeService } from '@/lib/services/fee-engine/fee-service';
import { transactionGenerator } from '@/lib/services/fee-engine/transaction-generator';
import { SupabaseDirectClient } from '@/lib/db/supabase/client';
import { SchemaConfig } from '@/lib/db/schema-manager/config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { preview, dry_run } = body;
    
    if (!preview || !Array.isArray(preview)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid preview data'
      }, { status: 400 });
    }
    
    const client = new SupabaseDirectClient(new SchemaConfig()).getClient();
    
    let applied = 0;
    let updated = 0;
    let failed = 0;
    const results: any[] = [];
    
    if (!dry_run) {
      for (const item of preview) {
        try {
          if (item.transaction_id) {
            // Update existing transaction
            await transactionGenerator.updateTransactionFees(item.transaction_id);
            
            // Store fee record
            await client
              .from('fee_application_record')
              .upsert({
                transaction_id: item.transaction_id,
                deal_id: item.deal_id,
                component: item.component,
                amount: item.amount,
                percent: item.percent,
                applied: true,
                notes: item.notes || 'Imported from CSV'
              });
            
            updated++;
          } else {
            // Create fee template for deal (no transaction yet)
            await client
              .from('fee_application_record')
              .insert({
                deal_id: item.deal_id,
                component: item.component,
                amount: item.amount,
                percent: item.percent,
                applied: false,
                notes: item.notes || 'Template from CSV import'
              });
            
            applied++;
          }
          
          results.push({
            ...item,
            status: 'success'
          });
        } catch (error: any) {
          failed++;
          results.push({
            ...item,
            status: 'error',
            error: error.message
          });
        }
      }
    } else {
      // Dry run - just simulate
      applied = preview.filter(p => !p.transaction_id).length;
      updated = preview.filter(p => p.transaction_id).length;
    }
    
    return NextResponse.json({
      success: true,
      applied,
      updated,
      failed,
      dry_run,
      results: dry_run ? [] : results
    });
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to apply fees'
    }, { status: 500 });
  }
}