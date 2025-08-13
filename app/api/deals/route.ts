import { NextRequest, NextResponse } from 'next/server';
import { dealsService } from '@/lib/services';
import type { DealStage, DealType } from '@/lib/db/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || undefined;
    const stage = searchParams.get('stage') as DealStage | undefined;
    const type = searchParams.get('type') as DealType | undefined;
    const sortBy = searchParams.get('sortBy') as any;
    const sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc' | undefined;

    const result = await dealsService.getDeals({
      page,
      limit,
      search,
      stage,
      type,
      sortBy,
      sortOrder
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching deals:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}