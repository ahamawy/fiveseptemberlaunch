import { NextRequest, NextResponse } from 'next/server';
import { dataClient } from '@/lib/db/client';
import type { TransactionType, TransactionStatus } from '@/lib/db/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse query parameters
    const investorId = searchParams.get('investor_id');
    const dealId = searchParams.get('deal_id');
    const type = searchParams.get('type') as TransactionType | undefined;
    const status = searchParams.get('status') as TransactionStatus | undefined;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const transactions = await dataClient.getTransactions({
      investor_id: investorId ? parseInt(investorId) : undefined,
      deal_id: dealId ? parseInt(dealId) : undefined,
      type,
      status,
      limit,
      offset
    });

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