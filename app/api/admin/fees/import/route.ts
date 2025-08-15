import { NextRequest, NextResponse } from 'next/server';
import { SupabaseDirectClient } from '@/lib/db/supabase/client';
import { SchemaConfig } from '@/lib/db/schema-manager/config';

function parseCsv(text: string) {
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length === 0) return [] as any[];
  const header = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map((line) => {
    const cells = line.split(',');
    const row: Record<string, any> = {};
    header.forEach((h, i) => { row[h] = cells[i]?.trim(); });
    return row;
  });
}

export async function GET() {
  try {
    const client = new SupabaseDirectClient(new SchemaConfig()).getClient();
    const { data, error } = await (client as any).schema('analytics').from('v_fee_import_preview').select('*');
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true, data: data || [] });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to fetch preview' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    const client = new SupabaseDirectClient(new SchemaConfig()).getClient();

    let rows: any[] = [];
    if (contentType.includes('text/csv')) {
      const text = await request.text();
      rows = parseCsv(text).map((r) => ({
        deal_id: r.deal_id ? Number(r.deal_id) : null,
        transaction_id: r.transaction_id ? Number(r.transaction_id) : null,
        component: r.component,
        basis: r.basis || null,
        percent: r.percent ? Number(r.percent) : null,
        amount: r.amount ? Number(r.amount) : null,
        notes: r.notes || null,
        source_file: r.source_file || 'upload.csv'
      }));
    } else {
      const body = await request.json();
      rows = Array.isArray(body) ? body : (body?.rows || []);
    }

    if (!rows.length) {
      return NextResponse.json({ error: 'No rows provided' }, { status: 400 });
    }

    const { data, error } = await (client as any).schema('fees').from('legacy_import').insert(rows);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true, inserted: rows.length });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to import' }, { status: 500 });
  }
}
