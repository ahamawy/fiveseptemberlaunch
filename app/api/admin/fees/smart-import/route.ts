import { NextRequest, NextResponse } from 'next/server';
import { SupabaseDirectClient } from '@/lib/db/supabase/client';
import { SchemaConfig } from '@/lib/db/schema-manager/config';

// Smart CSV parser that handles various formats
function parseCSV(text: string): { headers: string[], rows: any[] } {
  const lines = text.trim().split(/\r?\n/).filter(l => l.trim());
  if (lines.length === 0) return { headers: [], rows: [] };
  
  // Parse headers
  const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
  
  // Parse rows
  const rows = lines.slice(1).map(line => {
    // Handle quoted values with commas
    const regex = /("([^"]*)"|'([^']*)'|([^,]+))/g;
    const values: string[] = [];
    let match;
    
    while ((match = regex.exec(line)) !== null) {
      values.push((match[2] || match[3] || match[4] || '').trim());
    }
    
    const row: Record<string, any> = {};
    headers.forEach((header, index) => {
      const value = values[index] || '';
      // Try to parse numbers
      const numValue = parseFloat(value.replace(/[$,]/g, ''));
      row[header] = isNaN(numValue) ? value : numValue;
    });
    
    return row;
  });
  
  return { headers, rows };
}

// Auto-detect column mappings based on similarity
function autoDetectMapping(headers: string[], knownMappings: any): Record<string, string> {
  const mapping: Record<string, string> = {};
  const commonPatterns = {
    investor: /investor|name|client/i,
    deal: /deal|investment|fund/i,
    amount: /amount|value|total|gross/i,
    management_fee: /management|mgmt|mgt/i,
    admin_fee: /admin|administration/i,
    performance_fee: /performance|carry|perf/i,
    structuring_fee: /structuring|struct/i,
    net: /net|transfer|final/i
  };
  
  headers.forEach(header => {
    for (const [field, pattern] of Object.entries(commonPatterns)) {
      if (pattern.test(header)) {
        mapping[header] = field;
        break;
      }
    }
  });
  
  return mapping;
}

// POST: Upload and create import session
export async function POST(request: NextRequest) {
  try {
    const client = new SupabaseDirectClient(new SchemaConfig()).getClient();
    
    // Get request data
    const contentType = request.headers.get('content-type') || '';
    let csvText = '';
    let mappingId: number | null = null;
    
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File;
      mappingId = formData.get('mapping_id') ? Number(formData.get('mapping_id')) : null;
      csvText = await file.text();
    } else if (contentType.includes('text/csv')) {
      csvText = await request.text();
    } else {
      const body = await request.json();
      csvText = body.csv;
      mappingId = body.mapping_id;
    }
    
    // Parse CSV
    const { headers, rows } = parseCSV(csvText);
    
    // Get saved mappings if provided
    let savedMapping = null;
    if (mappingId) {
      const { data } = await client
        .from('fee_import_mappings')
        .select('mapping')
        .eq('id', mappingId)
        .single();
      savedMapping = data?.mapping;
    }
    
    // Auto-detect or use saved mapping
    const mapping = savedMapping || autoDetectMapping(headers, null);
    
    // Create import session
    const { data: session, error } = await client
      .from('smart_import_sessions')
      .insert({
        filename: 'upload.csv',
        raw_data: { headers, rows },
        parsed_data: null,
        mapping_id: mappingId,
        status: 'mapping',
        rows_total: rows.length,
        rows_valid: 0
      })
      .select()
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      session_id: session.session_id,
      headers,
      rows: rows.slice(0, 5), // Preview first 5 rows
      suggested_mapping: mapping,
      total_rows: rows.length
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to upload' }, { status: 500 });
  }
}

// GET: Retrieve session data
export async function GET(request: NextRequest) {
  try {
    const client = new SupabaseDirectClient(new SchemaConfig()).getClient();
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }
    
    const { data: session, error } = await client
      .from('smart_import_sessions')
      .select('*')
      .eq('session_id', sessionId)
      .single();
    
    if (error || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    
    // If in preview status, calculate preview data
    if (session.status === 'preview' && session.parsed_data) {
      const previewData = await calculatePreview(client, session.parsed_data);
      return NextResponse.json({
        success: true,
        session,
        preview: previewData
      });
    }
    
    return NextResponse.json({ success: true, session });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to fetch session' }, { status: 500 });
  }
}

// PATCH: Update mapping and validate
export async function PATCH(request: NextRequest) {
  try {
    const client = new SupabaseDirectClient(new SchemaConfig()).getClient();
    const body = await request.json();
    const { session_id, mapping, save_mapping } = body;
    
    // Get session
    const { data: session } = await client
      .from('smart_import_sessions')
      .select('raw_data')
      .eq('session_id', session_id)
      .single();
    
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    
    // Save mapping template if requested
    if (save_mapping && save_mapping.name) {
      await client
        .from('fee_import_mappings')
        .insert({
          name: save_mapping.name,
          description: save_mapping.description,
          mapping,
          sample_headers: session.raw_data.headers
        });
    }
    
    // Parse data with mapping
    const parsedData = parseWithMapping(session.raw_data, mapping);
    
    // Validate parsed data
    const validation = validateParsedData(parsedData);
    
    // Update session
    await client
      .from('smart_import_sessions')
      .update({
        parsed_data: parsedData,
        validation_results: validation,
        status: 'preview',
        rows_valid: validation.valid_count
      })
      .eq('session_id', session_id);
    
    return NextResponse.json({
      success: true,
      parsed_rows: parsedData.length,
      validation
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to update mapping' }, { status: 500 });
  }
}

// Helper: Parse data with mapping
function parseWithMapping(rawData: any, mapping: Record<string, string>): any[] {
  const { headers, rows } = rawData;
  
  return rows.map((row: any) => {
    const parsed: any = {};
    
    // Map each field
    Object.entries(mapping).forEach(([csvColumn, dbField]) => {
      if (row[csvColumn] !== undefined) {
        parsed[dbField] = row[csvColumn];
      }
    });
    
    // Calculate derived fields
    if (parsed.gross && parsed.management_fee !== undefined) {
      parsed.net = parsed.gross - (parsed.management_fee || 0) - 
                   (parsed.admin_fee || 0) - (parsed.performance_fee || 0) - 
                   (parsed.structuring_fee || 0);
    }
    
    return parsed;
  });
}

// Helper: Validate parsed data
function validateParsedData(data: any[]): any {
  const errors: any[] = [];
  const warnings: any[] = [];
  let validCount = 0;
  
  data.forEach((row, index) => {
    const rowErrors: string[] = [];
    const rowWarnings: string[] = [];
    
    // Required fields
    if (!row.investor && !row.investor_id) {
      rowErrors.push('Missing investor identifier');
    }
    if (!row.deal && !row.deal_id) {
      rowErrors.push('Missing deal identifier');
    }
    if (!row.amount && !row.gross && !row.net) {
      rowErrors.push('Missing amount');
    }
    
    // Warnings
    if (row.net && row.gross && Math.abs(row.net - row.gross) < 0.01) {
      rowWarnings.push('Net equals gross - no fees applied?');
    }
    
    if (rowErrors.length > 0) {
      errors.push({ row: index + 1, errors: rowErrors });
    } else {
      validCount++;
    }
    
    if (rowWarnings.length > 0) {
      warnings.push({ row: index + 1, warnings: rowWarnings });
    }
  });
  
  return {
    valid: errors.length === 0,
    valid_count: validCount,
    total_count: data.length,
    errors,
    warnings
  };
}

// Helper: Calculate preview with fee calculations
async function calculatePreview(client: any, parsedData: any[]): Promise<any> {
  const preview: any[] = [];
  
  for (const row of parsedData) {
    // Try to match investor
    let investorId = row.investor_id;
    if (!investorId && row.investor) {
      const { data } = await client
        .from('investors.investor')
        .select('investor_id')
        .ilike('full_name', `%${row.investor}%`)
        .limit(1)
        .single();
      investorId = data?.investor_id;
    }
    
    // Try to match deal
    let dealId = row.deal_id;
    if (!dealId && row.deal) {
      const { data } = await client
        .from('deals')
        .select('id')
        .ilike('name', `%${row.deal}%`)
        .limit(1)
        .single();
      dealId = data?.id;
    }
    
    preview.push({
      ...row,
      investor_id: investorId,
      deal_id: dealId,
      matched: !!(investorId && dealId),
      fees_total: (row.management_fee || 0) + (row.admin_fee || 0) + 
                  (row.performance_fee || 0) + (row.structuring_fee || 0)
    });
  }
  
  return preview;
}