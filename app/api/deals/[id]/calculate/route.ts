import { NextRequest, NextResponse } from 'next/server';
import { FormulaManager } from '@/lib/services/formula-engine/formula-manager';

const formulaManager = new FormulaManager();

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const dealId = parseInt(params.id);
    const body = await request.json();
    const { investorId, transactionId } = body;
    
    // Perform calculation and audit
    const audit = await formulaManager.calculateAndAudit(
      dealId,
      investorId,
      transactionId
    );
    
    return NextResponse.json({
      success: true,
      data: audit.result_details,
      auditId: audit.id,
      calculatedAt: audit.calculated_at
    });
  } catch (error) {
    console.error('Error calculating deal economics:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to calculate deal economics' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const dealId = parseInt(params.id);
    const { searchParams } = new URL(request.url);
    const investorId = searchParams.get('investorId');
    
    // Get calculation history
    const history = await formulaManager.getCalculationHistory(
      dealId,
      investorId ? parseInt(investorId) : undefined
    );
    
    return NextResponse.json({
      success: true,
      data: history,
      count: history.length
    });
  } catch (error) {
    console.error('Error fetching calculation history:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch calculation history' },
      { status: 500 }
    );
  }
}