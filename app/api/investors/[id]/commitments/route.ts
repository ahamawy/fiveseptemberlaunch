import { NextRequest, NextResponse } from 'next/server';
import { getInvestorById } from '@/lib/mock-data/investors';
import { getCommitmentsByInvestorId, getDealById, getCompanyById } from '@/lib/mock-data/deals';
import { getTransactionsByDealId } from '@/lib/mock-data/transactions';

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
    
    // Get all commitments for the investor
    const commitments = getCommitmentsByInvestorId(investorId);
    
    // Enrich commitment data with deal and transaction information
    const enrichedCommitments = commitments.map(commitment => {
      const deal = getDealById(commitment.dealId);
      const company = deal ? getCompanyById(deal.companyId) : null;
      const transactions = getTransactionsByDealId(commitment.dealId);
      
      // Calculate capital called and distributed for this investor's commitment
      const investorTransactions = transactions.filter(t => t.investorId === investorId);
      
      const capitalCalled = investorTransactions
        .filter(t => t.type === 'capital_call' && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const capitalDistributed = investorTransactions
        .filter(t => t.type === 'distribution' && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const capitalRemaining = commitment.amount - capitalCalled;
      const percentageCalled = commitment.amount > 0 ? (capitalCalled / commitment.amount) * 100 : 0;
      
      // Calculate next capital call (mock)
      const nextCallAmount = capitalRemaining > 0 ? Math.min(capitalRemaining, commitment.amount * 0.25) : 0;
      const nextCallDate = capitalRemaining > 0 
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        : null;
      
      return {
        id: commitment.id,
        dealId: commitment.dealId,
        dealName: deal?.name || `Deal ${commitment.dealId}`,
        dealCode: deal?.code || '',
        dealStage: deal?.stage || 'unknown',
        companyName: company?.name || 'Unknown Company',
        companySector: company?.sector || 'Unknown',
        currency: commitment.currency,
        committedAmount: commitment.amount,
        capitalCalled,
        capitalDistributed,
        capitalRemaining,
        percentageCalled,
        nextCallAmount,
        nextCallDate,
        status: commitment.status,
        createdAt: commitment.createdAt,
        dealOpeningDate: deal?.openingDate || null,
        dealClosingDate: deal?.closingDate || null,
        minimumInvestment: deal?.minimumInvestment || 0,
      };
    });
    
    // Calculate summary statistics
    const summary = {
      totalCommitments: enrichedCommitments.length,
      activeCommitments: enrichedCommitments.filter(c => c.status === 'signed').length,
      totalCommitted: enrichedCommitments
        .filter(c => c.status === 'signed')
        .reduce((sum, c) => sum + c.committedAmount, 0),
      totalCalled: enrichedCommitments.reduce((sum, c) => sum + c.capitalCalled, 0),
      totalDistributed: enrichedCommitments.reduce((sum, c) => sum + c.capitalDistributed, 0),
      totalRemaining: enrichedCommitments.reduce((sum, c) => sum + c.capitalRemaining, 0),
      averageCallPercentage: enrichedCommitments.length > 0
        ? enrichedCommitments.reduce((sum, c) => sum + c.percentageCalled, 0) / enrichedCommitments.length
        : 0,
    };
    
    const commitmentsData = {
      commitments: enrichedCommitments,
      summary,
      upcomingCalls: enrichedCommitments
        .filter(c => c.nextCallAmount > 0)
        .map(c => ({
          dealName: c.dealName,
          amount: c.nextCallAmount,
          date: c.nextCallDate,
          currency: c.currency,
        }))
        .sort((a, b) => (a.date || '').localeCompare(b.date || '')),
    };
    
    return NextResponse.json(commitmentsData);
  } catch (error) {
    console.error('Error fetching commitments data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}