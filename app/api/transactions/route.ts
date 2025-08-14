import { NextRequest, NextResponse } from 'next/server';
import { investorsService } from '@/lib/services';
import type { TransactionType, TransactionStatus } from '@/lib/db/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse query parameters
    const investorId = searchParams.get('investor_id');
    const type = searchParams.get('type') as TransactionType | undefined;
    const status = searchParams.get('status') as TransactionStatus | undefined;
    const limit = parseInt(searchParams.get('limit') || '50');
    
    // Use the service layer for consistency and caching
    const transactions = await investorsService.getTransactions(
      investorId ? parseInt(investorId) : undefined,
      {
        type,
        status,
        limit
      }
    );

    return NextResponse.json({
      success: true,
      data: transactions,
      count: transactions.length
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}