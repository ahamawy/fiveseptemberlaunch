import { NextRequest, NextResponse } from 'next/server';
import { investorsService } from '@/lib/services';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const investorId = parseInt(params.id);
    
    if (isNaN(investorId)) {
      return NextResponse.json(
        { error: 'Invalid investor ID' },
        { status: 400 }
      );
    }

    const investor = await investorsService.getInvestorById(investorId);
    
    if (!investor) {
      return NextResponse.json(
        { error: 'Investor not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(investor);
  } catch (error) {
    console.error('Error fetching investor:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}