import { NextRequest, NextResponse } from 'next/server';
import { CSVValidator } from '@/lib/services/fee-engine/csv-validator';
import { feeService } from '@/lib/services/fee-engine/fee-service';

export async function POST(request: NextRequest) {
  try {
    const csvContent = await request.text();
    const validator = new CSVValidator();
    const validation = validator.validateCSV(csvContent);
    
    if (!validation.valid) {
      return NextResponse.json({
        success: false,
        errors: validation.errors,
        preview: []
      });
    }
    
    // Create preview data with validation status
    const preview = validation.rows.map(row => ({
      ...row,
      status: 'valid' as const,
      calculated_amount: row.amount || (row.percent ? 0 : undefined), // Will be calculated on apply
      message: undefined as string | undefined
    }));
    
    // Check for warnings
    for (const item of preview) {
      // Warn if no transaction ID
      if (!item.transaction_id) {
        item.status = 'warning';
        item.message = 'No transaction ID - will create template';
      }
      
      // Warn if both percent and amount are provided
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