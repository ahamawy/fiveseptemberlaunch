import { NextRequest, NextResponse } from 'next/server';
import { SupabaseDirectClient } from '@/lib/db/supabase/client';
import { SchemaConfig } from '@/lib/db/schema-manager/config';

// Bespoke parser for your specific fee structure
interface FeeRow {
  investor_name?: string;
  investor_id?: number;
  deal_id: number;
  deal_name?: string;
  gross_capital?: number;
  management_fee?: number;
  admin_fee?: number;
  performance_fee?: number;
  structuring_fee?: number;
  premium?: number;
  discount_percent?: number;
  net_transfer?: number;
}

interface FeeCalculation {
  investor_id: number;
  deal_id: number;
  gross_capital: number;
  fees: {
    management: number;
    admin: number;
    performance: number;
    structuring: number;
    premium: number;
  };
  discount_percent: number;
  discount_amount: number;
  net_transfer: number;
}

// Parse CSV with flexible column detection
function parseFeesCSV(text: string): FeeRow[] {
  const lines = text.trim().split(/\r?\n/).filter(l => l.trim());
  if (lines.length === 0) return [];
  
  // Parse headers - handle various formats
  const headerLine = lines[0];
  const headers = headerLine.split(',').map(h => 
    h.trim().toLowerCase().replace(/['"]/g, '').replace(/\s+/g, '_')
  );
  
  // Map common variations to standard fields
  const fieldMap: Record<string, string> = {
    'investor': 'investor_name',
    'investor_name': 'investor_name',
    'name': 'investor_name',
    'investor_id': 'investor_id',
    'deal': 'deal_id',
    'deal_id': 'deal_id',
    'investment': 'deal_id',
    'gross': 'gross_capital',
    'gross_amount': 'gross_capital',
    'gross_capital': 'gross_capital',
    'management_fee': 'management_fee',
    'mgmt_fee': 'management_fee',
    'management': 'management_fee',
    'admin_fee': 'admin_fee',
    'admin': 'admin_fee',
    'performance_fee': 'performance_fee',
    'performance': 'performance_fee',
    'carry': 'performance_fee',
    'structuring_fee': 'structuring_fee',
    'structuring': 'structuring_fee',
    'struct_fee': 'structuring_fee',
    'premium': 'premium',
    'premium_fee': 'premium',
    'discount': 'discount_percent',
    'discount_%': 'discount_percent',
    'discount_percent': 'discount_percent',
    'net': 'net_transfer',
    'net_amount': 'net_transfer',
    'net_transfer': 'net_transfer',
    'transfer': 'net_transfer'
  };
  
  // Parse data rows
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim().replace(/['"]/g, ''));
    const row: FeeRow = { deal_id: 0 };
    
    headers.forEach((header, idx) => {
      const field = fieldMap[header] || header;
      let value: any = values[idx] || '';
      
      // Clean and parse numeric values
      if (field.includes('fee') || field.includes('capital') || field.includes('transfer') || 
          field === 'premium' || field === 'gross_capital' || field === 'net_transfer') {
        value = parseFloat(value.replace(/[$,]/g, '')) || 0;
      } else if (field === 'discount_percent') {
        value = parseFloat(value.replace(/%/g, '')) || 0;
      } else if (field === 'deal_id' || field === 'investor_id') {
        value = parseInt(value) || (field === 'deal_id' ? 28 : 0); // Default to Groq deal
      }
      
      (row as any)[field] = value;
    });
    
    return row;
  });
}

// Calculate fees based on your specific business rules
async function calculateFees(
  client: any, 
  row: FeeRow,
  profileId?: number
): Promise<FeeCalculation> {
  // Get or create investor ID
  let investorId = row.investor_id;
  if (!investorId && row.investor_name) {
    // Try to match investor by name
    const { data } = await client
      .from('investors_clean')
      .select('investor_id')
      .or(`full_name.ilike.%${row.investor_name}%,primary_email.ilike.%${row.investor_name}%`)
      .limit(1)
      .single();
    
    investorId = data?.investor_id || 0;
  }
  
  // Get fee profile for the deal
  let feeConfig: any = {
    management_fee: 0.02,
    admin_fee: 0.005,
    performance_fee: 0.20,
    structuring_fee: 0.01,
    premium_from_valuations: false,
    premium_percent: 0.04
  };
  
  if (profileId) {
    const { data: profile } = await client
      .from('fees.calculator_profile')
      .select('config')
      .eq('id', profileId)
      .single();
    
    if (profile?.config) {
      feeConfig = { ...feeConfig, ...profile.config };
    }
  }
  
  // Calculate base amounts
  const grossCapital = row.gross_capital || 0;
  
  // Calculate fees
  const fees = {
    management: row.management_fee ?? (grossCapital * feeConfig.management_fee),
    admin: row.admin_fee ?? (grossCapital * feeConfig.admin_fee),
    performance: row.performance_fee ?? 0, // Usually 0 for initial capital calls
    structuring: row.structuring_fee ?? (grossCapital * feeConfig.structuring_fee),
    premium: row.premium ?? (grossCapital * feeConfig.premium_percent)
  };
  
  // Calculate discount
  const totalFees = Object.values(fees).reduce((sum, fee) => sum + fee, 0);
  const discountPercent = row.discount_percent || 0;
  const discountAmount = totalFees * (discountPercent / 100);
  
  // Calculate net transfer
  const netTransfer = row.net_transfer || (grossCapital - totalFees + discountAmount);
  
  return {
    investor_id: investorId || 0,
    deal_id: row.deal_id,
    gross_capital: grossCapital,
    fees,
    discount_percent: discountPercent,
    discount_amount: discountAmount,
    net_transfer: netTransfer
  };
}

// POST: Process bespoke fee import
export async function POST(request: NextRequest) {
  try {
    const client = new SupabaseDirectClient(new SchemaConfig()).getClient();
    const contentType = request.headers.get('content-type') || '';
    
    let csvText = '';
    let profileId: number | null = null;
    let applyDirectly = false;
    
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File;
      csvText = await file.text();
      profileId = formData.get('profile_id') ? Number(formData.get('profile_id')) : null;
      applyDirectly = formData.get('apply_directly') === 'true';
    } else if (contentType.includes('text/csv')) {
      csvText = await request.text();
    } else {
      const body = await request.json();
      csvText = body.csv;
      profileId = body.profile_id;
      applyDirectly = body.apply_directly || false;
    }
    
    // Parse CSV
    const rows = parseFeesCSV(csvText);
    
    // Process each row
    const results: FeeCalculation[] = [];
    const errors: any[] = [];
    
    for (const row of rows) {
      try {
        const calculation = await calculateFees(client, row, profileId ?? undefined);
        results.push(calculation);
        
        if (applyDirectly) {
          // Apply to staging table
          const feeComponents = [
            { component: 'management_fee', amount: calculation.fees.management },
            { component: 'admin_fee', amount: calculation.fees.admin },
            { component: 'performance_fee', amount: calculation.fees.performance },
            { component: 'structuring_fee', amount: calculation.fees.structuring },
            { component: 'premium', amount: calculation.fees.premium }
          ].filter(c => c.amount > 0);
          
          for (const comp of feeComponents) {
            await client.from('fee_legacy_import').insert({
              deal_id: calculation.deal_id,
              transaction_id: null,
              component: comp.component,
              basis: 'capital',
              percent: null,
              amount: comp.amount,
              notes: `Investor ${calculation.investor_id} - Deal ${calculation.deal_id}`,
              source_file: 'bespoke_import.csv'
            });
          }
          
          // Also insert into fee_application_record if requested
          if (applyDirectly) {
            for (const comp of feeComponents) {
              await client.from('fee_application_record').insert({
                deal_id: calculation.deal_id,
                transaction_id: null,
                component: comp.component,
                amount: comp.amount,
                percent: null,
                applied: true,
                notes: `Bespoke import - Investor ${calculation.investor_id}`
              });
            }
          }
        }
      } catch (e: any) {
        errors.push({
          row: rows.indexOf(row),
          error: e.message,
          data: row
        });
      }
    }
    
    // Calculate totals
    const totals = {
      total_rows: rows.length,
      successful: results.length,
      errors: errors.length,
      total_gross: results.reduce((sum, r) => sum + r.gross_capital, 0),
      total_fees: results.reduce((sum, r) => 
        sum + Object.values(r.fees).reduce((s, f) => s + f, 0), 0
      ),
      total_net: results.reduce((sum, r) => sum + r.net_transfer, 0)
    };
    
    return NextResponse.json({
      success: true,
      totals,
      results: results.slice(0, 100), // Limit for response size
      errors,
      applied: applyDirectly
    });
    
  } catch (e: any) {
    return NextResponse.json({ 
      error: e?.message || 'Failed to process import' 
    }, { status: 500 });
  }
}

// GET: Get fee profiles and deal information
export async function GET(request: NextRequest) {
  try {
    const client = new SupabaseDirectClient(new SchemaConfig()).getClient();
    const { searchParams } = new URL(request.url);
    const dealId = searchParams.get('deal_id');
    
    // Get fee profiles
    const { data: profiles } = await client
      .from('fees.calculator_profile')
      .select('id, name, kind, config')
      .order('name');
    
    // Get deal-specific data if requested
    let dealData = null;
    if (dealId) {
      // Get investors in this deal
      const { data: investors } = await client
        .from('investor_units')
        .select('investor_id, units_purchased, net_capital')
        .eq('deal_id', dealId);
      
      // Get any existing fees for this deal
      const { data: existingFees } = await client
        .from('fee_application_record')
        .select('component, amount')
        .eq('deal_id', dealId);
      
      dealData = {
        deal_id: dealId,
        investors: investors || [],
        existing_fees: existingFees || [],
        total_capital: investors?.reduce((sum: number, i: any) => sum + i.net_capital, 0) || 0
      };
    }
    
    return NextResponse.json({
      success: true,
      profiles: profiles || [],
      deal_data: dealData
    });
    
  } catch (e: any) {
    return NextResponse.json({ 
      error: e?.message || 'Failed to fetch data' 
    }, { status: 500 });
  }
}