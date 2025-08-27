import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const csvContent = await request.text();
    
    // Parse CSV content
    const lines = csvContent.split('\n').filter(line => line.trim());
    const headers = lines[0]?.split(',').map(h => h.trim().toLowerCase());
    
    if (!headers || headers.length === 0) {
      return NextResponse.json({
        success: false,
        errors: ['No CSV headers found'],
        preview: []
      });
    }
    
    const rows = [];
    const errors = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row: any = {};
      
      headers.forEach((header, index) => {
        const value = values[index];
        
        // Map headers to expected fields
        switch(header) {
          case 'transaction_id':
          case 'transactionid':
            row.transaction_id = value ? parseInt(value) : null;
            break;
          case 'deal_id':
          case 'dealid':
            row.deal_id = value ? parseInt(value) : null;
            break;
          case 'gross_capital':
          case 'grosscapital':
          case 'amount':
            row.gross_capital = value ? parseFloat(value) : null;
            break;
          case 'component':
          case 'fee_type':
          case 'type':
            row.component = value;
            break;
          case 'percent':
          case 'percentage':
            row.percent = value ? parseFloat(value) : null;
            break;
          case 'notes':
          case 'note':
          case 'description':
            row.notes = value;
            break;
        }
      });
      
      // Validate required fields
      if (!row.deal_id) {
        errors.push(`Row ${i}: Missing deal_id`);
      }
      if (!row.component) {
        errors.push(`Row ${i}: Missing component/fee type`);
      }
      
      rows.push(row);
    }
    
    if (errors.length > 0) {
      return NextResponse.json({
        success: false,
        errors,
        preview: []
      });
    }
    
    // Create preview data with validation status
    const preview = rows.map(row => ({
      ...row,
      status: 'valid' as 'valid' | 'warning',
      calculated_amount: row.amount || (row.percent ? 0 : undefined),
      message: undefined as string | undefined
    }));
    
    // Check for warnings
    for (const item of preview) {
      if (!item.transaction_id) {
        item.status = 'warning';
        item.message = 'No transaction ID - will create template';
      }
      
      if (item.percent && item.amount) {
        item.status = 'warning';
        item.message = 'Both percent and amount provided - amount will be used';
      }
    }
    
    return NextResponse.json({
      success: true,
      preview,
      errors: []
    });
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Validation failed',
      preview: []
    }, { status: 500 });
  }
}