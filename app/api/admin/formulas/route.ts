import { NextRequest, NextResponse } from 'next/server';
import { FormulaManager } from '@/lib/services/formula-engine/formula-manager';

const formulaManager = new FormulaManager();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') !== 'false';
    
    const templates = await formulaManager.getFormulaTemplates(activeOnly);
    
    return NextResponse.json({
      success: true,
      data: templates,
      count: templates.length
    });
  } catch (error) {
    console.error('Error fetching formula templates:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch formula templates' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.formula_code || !body.formula_name || !body.nc_formula) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const template = await formulaManager.createFormulaTemplate(body);
    
    return NextResponse.json({
      success: true,
      data: template
    });
  } catch (error) {
    console.error('Error creating formula template:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to create formula template' },
      { status: 500 }
    );
  }
}