import { NextRequest, NextResponse } from 'next/server';
import { investorsService, transactionsService } from '@/lib/services';
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { deal_id, investor_id, units, unit_price, transaction_date, status } = body || {};

    if (!deal_id || !investor_id || !units || !unit_price) {
      return NextResponse.json({ error: 'deal_id, investor_id, units, unit_price are required' }, { status: 400 });
    }

    const created = await transactionsService.createPrimaryTx({
      deal_id: Number(deal_id),
      investor_id: Number(investor_id),
      units: Number(units),
      unit_price: Number(unit_price),
      transaction_date,
      status
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}