import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { SupabaseDirectClient } from '@/lib/db/supabase/client';
import { SchemaConfig } from '@/lib/db/schema-manager/config';

const ProfileSchema = z.object({
  deal_id: z.number().int().positive(),
  name: z.string().optional(),
  kind: z.enum(['LEGACY','MODERN']),
  config: z.record(z.any()).optional(),
  set_active: z.boolean().optional().default(true)
});

export async function GET() {
  try {
    const client = new SupabaseDirectClient(new SchemaConfig()).getClient();
    const { data: versions, error } = await (client as any)
      .rpc('execute_sql', { query: `
      SELECT sv.schedule_id, sv.version, sv.is_active, cp.id AS profile_id, cp.name, cp.kind, fs.deal_id,
             jsonb_agg(jsonb_build_object('component', fs.component, 'rate', fs.rate, 'basis', fs.basis, 'precedence', fs.precedence)) FILTER (WHERE fs.schedule_id IS NOT NULL) AS schedule
      FROM fees.schedule_version sv
      LEFT JOIN fees.calculator_profile cp ON cp.id = sv.calculator_profile_id
      LEFT JOIN fees.fee_schedule fs ON fs.schedule_id = sv.schedule_id
      GROUP BY sv.schedule_id, sv.version, sv.is_active, cp.id, cp.name, cp.kind, fs.deal_id
      ORDER BY fs.deal_id, sv.is_active DESC, sv.version DESC
    ` });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, data: versions });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to load profiles' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.message }, { status: 400 });
    }
    const { deal_id, name, kind, config, set_active } = parsed.data;
    const direct = new SupabaseDirectClient(new SchemaConfig());
    const client = direct.getClient();

    // Upsert calculator_profile
    const { data: ins, error: insErr } = await (client as any)
      .from('fees.calculator_profile')
      .insert({ name: name || `Profile deal ${deal_id}`, kind, config: config || {} })
      .select('id')
      .single();
    if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });
    const profileId = ins?.id;

    // Ensure fee_schedule exists minimally
    const { data: sched, error: schedErr } = await (client as any)
      .from('fees.fee_schedule')
      .select('schedule_id')
      .eq('deal_id', deal_id)
      .limit(1)
      .maybeSingle();
    if (schedErr) return NextResponse.json({ error: schedErr.message }, { status: 500 });

    let scheduleId = sched?.schedule_id;
    if (!scheduleId) {
      const { data: created, error: createErr } = await (client as any)
        .from('fees.fee_schedule')
        .insert({ deal_id, component: 'STRUCTURING', rate: 0, is_percent: true, basis: 'GROSS' })
        .select('schedule_id')
        .single();
      if (createErr) return NextResponse.json({ error: createErr.message }, { status: 500 });
      scheduleId = created.schedule_id;
    }

    // Create/activate schedule_version
    if (set_active) {
      // Deactivate others
      await (client as any)
        .from('fees.schedule_version')
        .update({ is_active: false })
        .eq('schedule_id', scheduleId);

      const { error: verErr } = await (client as any)
        .from('fees.schedule_version')
        .insert({ schedule_id: scheduleId, version: 1, calculator_profile_id: profileId, is_active: true });
      if (verErr) return NextResponse.json({ error: verErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, profile_id: profileId, schedule_id: scheduleId });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Upsert failed' }, { status: 500 });
  }
}
