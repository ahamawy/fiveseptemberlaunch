import { NextRequest, NextResponse } from 'next/server';
import { SupabaseDirectClient } from '@/lib/db/supabase/client';
import { SchemaConfig } from '@/lib/db/schema-manager/config';

function parseCsv(text: string) {
  const lines = text.trim().split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length === 0) return [] as any[];
  const header = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map((line) => {
    const cells = line.split(',');
    const row: Record<string, any> = {};
    header.forEach((h, i) => { 
      const value = cells[i]?.trim();
      row[h] = value === '' ? null : value;
    });
    return row;
  });
}

export async function GET() {
  try {
    const client = new SupabaseDirectClient(new SchemaConfig()).getClient();
    
    // Get data from legacy_import table and calculate preview
    const { data: imports, error: importsError } = await client
      .from('fee_legacy_import')
      .select('*')
      .order('deal_id', { ascending: true })
      .order('transaction_id', { ascending: true });
      
    if (importsError) {
      return NextResponse.json({ error: importsError.message }, { status: 500 });
    }
    
    // Get existing fee applications for comparison
    const { data: existing, error: existingError } = await client
      .from('fee_application_record')
      .select('deal_id, transaction_id, component, amount');
      
    if (existingError) {
      return NextResponse.json({ error: existingError.message }, { status: 500 });
    }
    
    // Create a map of existing fees
    const existingMap: Record<string, number> = {};
    (existing || []).forEach(e => {
      const key = `${e.deal_id}-${e.transaction_id}-${e.component}`;
      existingMap[key] = e.amount || 0;
    });
    
    // Calculate preview data
    const previewData = (imports || []).map(imp => {
      const key = `${imp.deal_id}-${imp.transaction_id}-${imp.component}`;
      const existingAmount = existingMap[key] || 0;
      const deltaAmount = (imp.amount || 0) - existingAmount;
      
      return {
        deal_id: imp.deal_id,
        transaction_id: imp.transaction_id,
        component: imp.component,
        basis: imp.basis,
        percent: imp.percent,
        amount: imp.amount,
        existing_amount: existingAmount,
        delta_amount: deltaAmount
      };
    });
    
    return NextResponse.json({ success: true, data: previewData });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to fetch preview' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    const client = new SupabaseDirectClient(new SchemaConfig()).getClient();

    let rows: any[] = [];
    if (contentType.includes('text/csv') || contentType.includes('csv')) {
      const text = await request.text();
      console.log('Received CSV text:', text);
      const parsed = parseCsv(text);
      console.log('Parsed rows:', parsed);
      rows = parsed.map((r) => ({
        deal_id: r.deal_id ? Number(r.deal_id) : null,
        transaction_id: r.transaction_id ? Number(r.transaction_id) : null,
        component: r.component,
        basis: r.basis || null,
        percent: r.percent ? Number(r.percent) : null,
        amount: r.amount ? Number(r.amount) : null,
        notes: r.notes || null,
        source_file: r.source_file || 'upload.csv'
      }));
      console.log('Mapped rows:', rows);
    } else {
      const body = await request.json();
      rows = Array.isArray(body) ? body : (body?.rows || []);
    }

    if (!rows.length || rows.every(r => !r.deal_id)) {
      return NextResponse.json({ error: 'No valid rows provided' }, { status: 400 });
    }

    const { data, error } = await (client as any)
      .from('fee_legacy_import')
      .insert(rows);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true, inserted: rows.length });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to import' }, { status: 500 });
  }
}

