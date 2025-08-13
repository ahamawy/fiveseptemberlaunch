import { NextRequest, NextResponse } from 'next/server';
import { getInvestorById } from '@/lib/mock-data/investors';
import { getTransactionsByInvestorId } from '@/lib/mock-data/transactions';
import { getDealById, getCompanyById } from '@/lib/mock-data/deals';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const investorId = parseInt(params.id);
    const investor = getInvestorById(investorId);
    
    if (!investor) {
      return NextResponse.json(
        { error: 'Investor not found' },
        { status: 404 }
      );
    }
    
    // Get query parameters for filtering and pagination
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const dealId = searchParams.get('dealId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    // Get all transactions for the investor
    let transactions = getTransactionsByInvestorId(investorId);
    
    // Apply filters
    if (type) {
      transactions = transactions.filter(t => t.type === type);
    }
    if (status) {
      transactions = transactions.filter(t => t.status === status);
    }
    if (dealId) {
      transactions = transactions.filter(t => t.dealId === parseInt(dealId));
    }
    if (startDate) {
      transactions = transactions.filter(t => t.occurredOn >= startDate);
    }
    if (endDate) {
      transactions = transactions.filter(t => t.occurredOn <= endDate);
    }
    
    // Sort by date (most recent first)
    transactions.sort((a, b) => 
      new Date(b.occurredOn).getTime() - new Date(a.occurredOn).getTime()
    );
    
    // Calculate pagination
    const totalCount = transactions.length;
    const totalPages = Math.ceil(totalCount / limit);
    const offset = (page - 1) * limit;
    const paginatedTransactions = transactions.slice(offset, offset + limit);
    
    // Enrich transaction data
    const enrichedTransactions = paginatedTransactions.map(transaction => {
      let dealName = null;
      let companyName = null;
      let dealCode = null;
      
      if (transaction.dealId) {
        const deal = getDealById(transaction.dealId);
        if (deal) {
          dealName = deal.name;
          dealCode = deal.code;
          const company = getCompanyById(deal.companyId);
          companyName = company?.name || null;
        }
      }
      
      return {
        id: transaction.id,
        publicId: transaction.publicId,
        dealId: transaction.dealId,
        dealName,
        dealCode,
        companyName,
        occurredOn: transaction.occurredOn,
        currency: transaction.currency,
        amount: transaction.amount,
        type: transaction.type,
        status: transaction.status,
        description: transaction.description,
        reference: transaction.reference,
        createdAt: transaction.createdAt,
      };
    });
    
    // Calculate summary statistics
    const allTransactions = getTransactionsByInvestorId(investorId);
    const summary = {
      totalCapitalCalls: allTransactions
        .filter(t => t.type === 'capital_call' && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0),
      totalDistributions: allTransactions
        .filter(t => t.type === 'distribution' && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0),
      totalFees: allTransactions
        .filter(t => t.type === 'fee' && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0),
      pendingTransactions: allTransactions
        .filter(t => t.status === 'pending')
        .length,
      completedTransactions: allTransactions
        .filter(t => t.status === 'completed')
        .length,
    };
    
    const transactionsData = {
      transactions: enrichedTransactions,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      summary,
      filters: {
        type: type || null,
        status: status || null,
        dealId: dealId ? parseInt(dealId) : null,
        startDate: startDate || null,
        endDate: endDate || null,
      },
    };
    
    return NextResponse.json(transactionsData);
  } catch (error) {
    console.error('Error fetching transactions data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}