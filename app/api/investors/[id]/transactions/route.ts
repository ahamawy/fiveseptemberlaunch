import { NextRequest, NextResponse } from 'next/server';
import { investorsService } from '@/lib/services';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const investorId = parseInt(params.id);
    
    // Get query parameters for filtering and pagination
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type') as any;
    const status = searchParams.get('status') as any;
    const dealId = searchParams.get('dealId');
    const fromDate = searchParams.get('startDate') || undefined;
    const toDate = searchParams.get('endDate') || undefined;
    
    // Get transactions using the service
    const result = await investorsService.getTransactions(investorId, {
      page,
      limit,
      type,
      status,
      deal_id: dealId ? parseInt(dealId) : undefined,
      from_date: fromDate,
      to_date: toDate,
    });
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to fetch transactions' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Error fetching transactions data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}