import { NextRequest, NextResponse } from 'next/server';
import { buildLegacyProfileFromMapping, stageLegacyImport } from '@/lib/services/ingest.service';
import { SupabaseDirectClient } from '@/lib/db/supabase/client';
import { SchemaConfig } from '@/lib/db/schema-manager/config';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const deal_id: number = Number(body?.deal_id);
    const mapping = body?.mapping;
    const create_profile: boolean = !!body?.create_profile;
    const doc_text: string | undefined = body?.doc_text;

    if (!deal_id) {
      return NextResponse.json({ error: 'deal_id is required' }, { status: 400 });
    }

    let usedMapping = mapping;
    if (!usedMapping && doc_text) {
      // Lazy import parser to avoid circular imports if any
      const { parseDocumentWithAI } = await import('@/lib/services/ingest.service');
      usedMapping = await parseDocumentWithAI(doc_text);
    }
    if (!usedMapping) {
      return NextResponse.json({ error: 'mapping or doc_text is required' }, { status: 400 });
    }

    // Optionally create profile
    let profile_id: number | undefined;
    let schedule_id: number | undefined;
    if (create_profile) {
      const profile = buildLegacyProfileFromMapping(usedMapping);
      const client = new SupabaseDirectClient(new SchemaConfig()).getClient();
      const { data: ins, error: insErr } = await (client as any)
        .from('calculator_profile')
        .insert({ name: `Profile deal ${deal_id}`,'kind':'LEGACY', config: profile })
        .select('id')
        .single();
      if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });
      profile_id = ins?.id;

      const { data: sched, error: schedErr } = await (client as any)
        .from('fee_schedule')
        .select('schedule_id')
        .eq('deal_id', deal_id)
        .maybeSingle();
      if (schedErr) return NextResponse.json({ error: schedErr.message }, { status: 500 });
      schedule_id = sched?.schedule_id;
      if (!schedule_id) {
        const { data: created, error: createErr } = await (client as any)
            .from('fee_schedule')
          .insert({ deal_id, component: 'STRUCTURING', rate: 0, is_percent: true, basis: 'GROSS' })
          .select('schedule_id')
          .single();
        if (createErr) return NextResponse.json({ error: createErr.message }, { status: 500 });
        schedule_id = created?.schedule_id;
      }
      // Activate new version
      await (client as any)
        .from('schedule_version')
        .update({ is_active: false })
        .eq('schedule_id', schedule_id);
      const { error: verErr } = await (client as any)
        .from('schedule_version')
        .insert({ schedule_id, version: 1, calculator_profile_id: profile_id, is_active: true });
      if (verErr) return NextResponse.json({ error: verErr.message }, { status: 500 });
    }

    // Stage rows
    const staged = await stageLegacyImport(deal_id, usedMapping);
    return NextResponse.json({ success: true, staged, profile_id, schedule_id });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Apply failed' }, { status: 500 });
  }
}


