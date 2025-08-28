import { NextRequest, NextResponse } from 'next/server';
import { exitScenarioService } from '@/lib/services/exit-scenario.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    if (!body.dealId || !body.exitMultiple) {
      return NextResponse.json(
        { error: 'Missing required fields: dealId and exitMultiple' },
        { status: 400 }
      );
    }

    // Model the exit scenario
    const scenario = await exitScenarioService.modelExitScenario({
      dealId: body.dealId,
      exitMultiple: body.exitMultiple,
      exitYear: body.exitYear || 5,
      scenarioName: body.scenarioName
    });

    return NextResponse.json({
      success: true,
      data: scenario
    });
  } catch (error: any) {
    console.error('Error modeling exit scenario:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to model exit scenario' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dealId = searchParams.get('dealId');

    if (!dealId) {
      return NextResponse.json(
        { error: 'Deal ID is required' },
        { status: 400 }
      );
    }

    // Get all scenarios for the deal
    const scenarios = await exitScenarioService.getDealScenarios(
      parseInt(dealId)
    );

    return NextResponse.json({
      success: true,
      data: scenarios
    });
  } catch (error: any) {
    console.error('Error fetching scenarios:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch scenarios' },
      { status: 500 }
    );
  }
}