import { NextRequest, NextResponse } from 'next/server';
import { investorsService } from '@/lib/services';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const investorId = parseInt(params.id);
    
    // Get commitments from investor service (which uses investor_units)
    const result = await investorsService.getInvestorCommitments(investorId);
    
    if (!result) {
      return NextResponse.json({
        commitments: [],
        summary: {
          totalCommitments: 0,
          activeCommitments: 0,
          totalCommitted: 0,
          totalCalled: 0,
          totalDistributed: 0,
          totalRemaining: 0,
          averageCallPercentage: 0
        },
        upcomingCalls: []
      });
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching commitments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch commitments' },
      { status: 500 }
    );
  }
}