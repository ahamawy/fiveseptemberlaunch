import { NextRequest, NextResponse } from 'next/server';
import { FormulaManager } from '@/lib/services/formula-engine/formula-manager';

const formulaManager = new FormulaManager();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const template = await formulaManager.getFormulaTemplate(parseInt(params.id));
    
    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Formula template not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: template
    });
  } catch (error) {
    console.error('Error fetching formula template:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const template = await formulaManager.updateFormulaTemplate(
      parseInt(params.id),
      body
    );
    
    return NextResponse.json({
      success: true,
      data: template
    });
  } catch (error) {
    console.error('Error updating formula template:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = await formulaManager.deleteFormulaTemplate(parseInt(params.id));
    
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete formula template' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Formula template deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting formula template:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}