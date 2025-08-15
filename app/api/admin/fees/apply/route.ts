import { NextResponse } from 'next/server';
import { SupabaseDirectClient } from '@/lib/db/supabase/client';
import { SchemaConfig } from '@/lib/db/schema-manager/config';

export async function POST() {
  try {
    const client = new SupabaseDirectClient(new SchemaConfig()).getClient();
    const { data, error } = await client.rpc('apply_legacy_import', { p_dry_run: false });
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true, data });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Apply failed' }, { status: 500 });
  }
}
