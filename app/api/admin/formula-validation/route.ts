import { NextRequest, NextResponse } from 'next/server';
import { formulaValidation } from '@/lib/services/formula-validation.service';

/**
 * GET /api/admin/formula-validation
 * Get validation statistics
 */
export async function GET() {
  try {
    const stats = await formulaValidation.getValidationStats();
    const discrepancies = await formulaValidation.getDiscrepancies();

    return NextResponse.json({
      success: true,
      data: {
        stats,
        discrepancies: discrepancies.slice(0, 10), // Top 10 discrepancies
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting validation stats:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get validation statistics' 
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/formula-validation
 * Run validation for all transactions
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { transactionId } = body;

    if (transactionId) {
      // Validate single transaction
      const result = await formulaValidation.recalculateTransaction(transactionId);
      return NextResponse.json({
        success: true,
        data: result
      });
    } else {
      // Validate all transactions
      const summary = await formulaValidation.validateAllTransactions();
      return NextResponse.json({
        success: true,
        data: summary
      });
    }
  } catch (error) {
    console.error('Error running validation:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to run validation' 
      },
      { status: 500 }
    );
  }
}