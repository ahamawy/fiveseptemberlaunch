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
    
    // Get fee calculator profiles
    const { data: profiles, error: profilesError } = await client
      .from('fee_calculator_profile')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (profilesError) {
      return NextResponse.json({ error: profilesError.message }, { status: 500 });
    }
    
    // Format the response data
    const formattedData = (profiles || []).map(p => ({
      id: p.id,
      name: p.name,
      kind: p.kind,
      config: p.config,
      created_at: p.created_at,
      has_premium: p.config?.calculate_premium || false
    }));
    
    return NextResponse.json({ success: true, data: formattedData });
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
    const { data: ins, error: insErr } = await client
      .from('fee_calculator_profile')
      .insert({ name: name || `Profile deal ${deal_id}`, kind, config: config || {} })
      .select('id')
      .single();
    if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });
    const profileId = ins?.id;

    // Ensure fee_schedule exists minimally
    const { data: sched, error: schedErr } = await client
      .from('fee_schedule_config')
      .select('schedule_id')
      .eq('deal_id', deal_id)
      .limit(1)
      .maybeSingle();
    if (schedErr) return NextResponse.json({ error: schedErr.message }, { status: 500 });

    let scheduleId = sched?.schedule_id;
    if (!scheduleId) {
      const { data: created, error: createErr } = await client
        .from('fee_schedule_config')
        .insert({ deal_id, component: 'STRUCTURING', rate: 0, is_percent: true, basis: 'GROSS' })
        .select('schedule_id')
        .single();
      if (createErr) return NextResponse.json({ error: createErr.message }, { status: 500 });
      scheduleId = created.schedule_id;
    }

    // Create/activate schedule_version
    if (set_active) {
      // Deactivate others
      await client
        .from('fee_schedule_version')
        .update({ is_active: false })
        .eq('schedule_id', scheduleId);

      const { error: verErr } = await client
        .from('fee_schedule_version')
        .insert({ schedule_id: scheduleId, version: 1, calculator_profile_id: profileId, is_active: true });
      if (verErr) return NextResponse.json({ error: verErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, profile_id: profileId, schedule_id: scheduleId });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Upsert failed' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, config, has_premium } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Profile ID required' }, { status: 400 });
    }
    
    const client = new SupabaseDirectClient(new SchemaConfig()).getClient();
    
    // Update profile
    const updateData: any = {};
    if (name) updateData.name = name;
    if (config) {
      updateData.config = config;
      if (has_premium !== undefined) {
        updateData.config.calculate_premium = has_premium;
      }
    }
    
    const { error } = await client
      .from('fee_calculator_profile')
      .update(updateData)
      .eq('id', id);
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Update failed' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Profile ID required' }, { status: 400 });
    }
    
    const client = new SupabaseDirectClient(new SchemaConfig()).getClient();
    
    // First deactivate any versions using this profile
    await client
      .from('fee_schedule_version')
      .update({ is_active: false })
      .eq('calculator_profile_id', Number(id));
    
    // Delete the profile
    const { error } = await client
      .from('fee_calculator_profile')
      .delete()
      .eq('id', Number(id));
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Delete failed' }, { status: 500 });
  }
}

