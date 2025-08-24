import { NextRequest, NextResponse } from 'next/server';
import { FormulaManager } from '@/lib/services/formula-engine/formula-manager';

const formulaManager = new FormulaManager();

export async function POST(request: NextRequest) {
  try {
    const { formula, variables } = await request.json();
    
    if (!formula) {
      return NextResponse.json(
        { success: false, error: 'Formula is required' },
        { status: 400 }
      );
    }
    
    if (!variables || typeof variables !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Variables must be an object' },
        { status: 400 }
      );
    }
    
    const result = await formulaManager.testFormula(formula, variables);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error testing formula:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to test formula' },
      { status: 500 }
    );
  }
}