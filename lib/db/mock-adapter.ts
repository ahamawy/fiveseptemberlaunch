/**
 * Mock Data Adapter
 * Provides Supabase-like API using local mock data
 */

import type { IDataClient } from './client';
import type {
  Deal,
  Investor,
  Company,
  Commitment,
  Transaction,
  Document,
  DealFilters,
  TransactionFilters,
  DocumentFilters,
  DashboardData,
  PortfolioData,
  DealStage,
  DealType,
  CompanyType,
  InvestorType,
  DocumentType,
  TransactionType,
  TransactionStatus,
  CommitmentStatus
} from './types';

// Import existing mock data
import {
  mockDeals as existingDeals,
  mockCompanies as existingCompanies,
  mockCommitments as existingCommitments,
  getDealById as getMockDealById,
  getCompanyById as getMockCompanyById,
  getCommitmentsByInvestorId as getMockCommitmentsByInvestorId
} from '../mock-data/deals';
import {
  mockInvestors as existingInvestors,
  getInvestorById as getMockInvestorById
} from '../mock-data/investors';
import {
  mockTransactions as existingTransactions,
  getTransactionsByInvestorId as getMockTransactionsByInvestorId
} from '../mock-data/transactions';

// Convert existing mock data to match DB types
const convertCompany = (company: any): Company => ({
  id: company.id,
  public_id: company.publicId || `comp_${company.id}`,
  name: company.name,
  type: company.type as CompanyType,
  sector: company.sector,
  country: company.country,
  website: company.website,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
});

const convertDeal = (deal: any): Deal => ({
  id: deal.id,
  public_id: deal.publicId || `deal_${deal.id}`,
  company_id: deal.companyId,
  code: deal.code,
  slug: deal.slug,
  name: deal.name,
  type: deal.type as DealType,
  stage: deal.stage as DealStage,
  currency: deal.currency,
  opening_date: deal.openingDate,
  closing_date: deal.closingDate,
  unit_price_init: deal.unitPriceInit,
  target_raise: deal.targetRaise || null,
  current_raise: deal.currentRaise || null,
  minimum_investment: deal.minimumInvestment || null,
  description: deal.description || null,
  created_at: deal.createdAt || new Date().toISOString(),
  updated_at: deal.updatedAt || new Date().toISOString()
});

const convertInvestor = (investor: any): Investor => ({
  id: investor.id,
  public_id: investor.publicId || `inv_${investor.id}`,
  user_id: investor.userId || null,
  type: investor.type as InvestorType || 'individual',
  name: investor.name,
  email: investor.email,
  phone: investor.phone || null,
  country: investor.country || null,
  kyc_status: investor.kycStatus || 'approved',
  accredited: investor.accredited !== false,
  created_at: investor.createdAt || new Date().toISOString(),
  updated_at: investor.updatedAt || new Date().toISOString()
});

const convertCommitment = (commitment: any): Commitment => ({
  id: commitment.id,
  public_id: `comm_${commitment.id}`,
  investor_id: commitment.investorId,
  deal_id: commitment.dealId,
  currency: commitment.currency,
  amount: commitment.amount,
  status: commitment.status as CommitmentStatus,
  signed_date: commitment.status === 'signed' ? commitment.createdAt : null,
  created_at: commitment.createdAt || new Date().toISOString(),
  updated_at: new Date().toISOString()
});

const convertTransaction = (transaction: any): Transaction => ({
  id: transaction.id,
  public_id: transaction.publicId || `txn_${transaction.id}`,
  investor_id: transaction.investorId || null,
  deal_id: transaction.dealId || null,
  type: transaction.type as TransactionType,
  status: transaction.status as TransactionStatus,
  currency: transaction.currency,
  amount: transaction.amount,
  fee_amount: transaction.feeAmount || null,
  reference: transaction.reference || null,
  description: transaction.description || null,
  processed_at: transaction.processedAt || null,
  created_at: transaction.createdAt || new Date().toISOString(),
  updated_at: transaction.updatedAt || new Date().toISOString()
});

// Mock documents data
const mockDocuments: Document[] = [
  {
    id: 1,
    public_id: 'doc_1',
    type: 'termsheet',
    name: 'TechVision AI Series A Term Sheet',
    url: '/documents/termsheet-techvision.pdf',
    mime_type: 'application/pdf',
    size_bytes: 245000,
    deal_id: 1,
    investor_id: null,
    version: '1.0',
    is_signed: false,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 2,
    public_id: 'doc_2',
    type: 'subscription_agreement',
    name: 'Subscription Agreement - John Doe',
    url: '/documents/subscription-johndoe.pdf',
    mime_type: 'application/pdf',
    size_bytes: 512000,
    deal_id: 1,
    investor_id: 1,
    version: '1.0',
    is_signed: true,
    created_at: '2024-01-20T10:00:00Z',
    updated_at: '2024-01-20T10:00:00Z'
  }
];

export class MockAdapter implements IDataClient {
  private deals: Deal[];
  private companies: Company[];
  private investors: Investor[];
  private commitments: Commitment[];
  private transactions: Transaction[];
  private documents: Document[];

  constructor() {
    // Convert existing mock data
    this.companies = existingCompanies.map(convertCompany);
    this.deals = existingDeals.map(convertDeal);
    this.investors = existingInvestors.map(convertInvestor);
    this.commitments = existingCommitments.map(convertCommitment);
    this.transactions = existingTransactions.map(convertTransaction);
    this.documents = mockDocuments;
  }

  async getDeals(filters?: DealFilters): Promise<Deal[]> {
    let results = [...this.deals];

    if (filters) {
      if (filters.stage) {
        results = results.filter(d => d.stage === filters.stage);
      }
      if (filters.type) {
        results = results.filter(d => d.type === filters.type);
      }
      if (filters.company_id) {
        results = results.filter(d => d.company_id === filters.company_id);
      }
      if (filters.search) {
        const search = filters.search.toLowerCase();
        results = results.filter(d =>
          d.name.toLowerCase().includes(search) ||
          d.code.toLowerCase().includes(search) ||
          d.slug.toLowerCase().includes(search)
        );
      }
      if (filters.offset) {
        results = results.slice(filters.offset);
      }
      if (filters.limit) {
        results = results.slice(0, filters.limit);
      }
    }

    return Promise.resolve(results);
  }

  async getDealById(id: number): Promise<Deal | null> {
    const deal = this.deals.find(d => d.id === id);
    return Promise.resolve(deal || null);
  }

  async getDealBySlug(slug: string): Promise<Deal | null> {
    const deal = this.deals.find(d => d.slug === slug);
    return Promise.resolve(deal || null);
  }

  async getInvestors(): Promise<Investor[]> {
    return Promise.resolve([...this.investors]);
  }

  async getInvestorById(id: number): Promise<Investor | null> {
    const investor = this.investors.find(i => i.id === id);
    return Promise.resolve(investor || null);
  }

  async getCurrentInvestor(): Promise<Investor | null> {
    // Use mock user ID from environment or default to 1
    const mockUserId = parseInt(process.env.NEXT_PUBLIC_MOCK_USER_ID || '1');
    return this.getInvestorById(mockUserId);
  }

  async getCompanies(): Promise<Company[]> {
    return Promise.resolve([...this.companies]);
  }

  async getCompanyById(id: number): Promise<Company | null> {
    const company = this.companies.find(c => c.id === id);
    return Promise.resolve(company || null);
  }

  async getCommitments(investorId?: number): Promise<Commitment[]> {
    let results = [...this.commitments];
    if (investorId) {
      results = results.filter(c => c.investor_id === investorId);
    }
    return Promise.resolve(results);
  }

  async getCommitmentById(id: number): Promise<Commitment | null> {
    const commitment = this.commitments.find(c => c.id === id);
    return Promise.resolve(commitment || null);
  }

  async getCommitmentsByDealId(dealId: number): Promise<Commitment[]> {
    const results = this.commitments.filter(c => c.deal_id === dealId);
    return Promise.resolve(results);
  }

  async getTransactions(filters?: TransactionFilters): Promise<Transaction[]> {
    let results = [...this.transactions];

    if (filters) {
      if (filters.investor_id) {
        results = results.filter(t => t.investor_id === filters.investor_id);
      }
      if (filters.deal_id) {
        results = results.filter(t => t.deal_id === filters.deal_id);
      }
      if (filters.type) {
        results = results.filter(t => t.type === filters.type);
      }
      if (filters.status) {
        results = results.filter(t => t.status === filters.status);
      }
      if (filters.from_date) {
        results = results.filter(t => t.created_at >= filters.from_date!);
      }
      if (filters.to_date) {
        results = results.filter(t => t.created_at <= filters.to_date!);
      }
      if (filters.offset) {
        results = results.slice(filters.offset);
      }
      if (filters.limit) {
        results = results.slice(0, filters.limit);
      }
    }

    return Promise.resolve(results);
  }

  async getTransactionById(id: number): Promise<Transaction | null> {
    const transaction = this.transactions.find(t => t.id === id);
    return Promise.resolve(transaction || null);
  }

  async getDocuments(filters?: DocumentFilters): Promise<Document[]> {
    let results = [...this.documents];

    if (filters) {
      if (filters.deal_id) {
        results = results.filter(d => d.deal_id === filters.deal_id);
      }
      if (filters.investor_id) {
        results = results.filter(d => d.investor_id === filters.investor_id);
      }
      if (filters.type) {
        results = results.filter(d => d.type === filters.type);
      }
      if (filters.is_signed !== undefined) {
        results = results.filter(d => d.is_signed === filters.is_signed);
      }
      if (filters.offset) {
        results = results.slice(filters.offset);
      }
      if (filters.limit) {
        results = results.slice(0, filters.limit);
      }
    }

    return Promise.resolve(results);
  }

  async getDocumentById(id: number): Promise<Document | null> {
    const document = this.documents.find(d => d.id === id);
    return Promise.resolve(document || null);
  }

  async getDashboardData(investorId: number): Promise<DashboardData> {
    const investor = await this.getInvestorById(investorId);
    if (!investor) {
      throw new Error(`Investor ${investorId} not found`);
    }

    const commitments = await this.getCommitments(investorId);
    const transactions = await this.getTransactions({ investor_id: investorId });

    const signedCommitments = commitments.filter(c => c.status === 'signed');
    const totalCommitted = signedCommitments.reduce((sum, c) => sum + c.amount, 0);

    const capitalCalls = transactions.filter(t => t.type === 'capital_call' && t.status === 'completed');
    const totalCalled = capitalCalls.reduce((sum, t) => sum + t.amount, 0);

    const distributions = transactions.filter(t => t.type === 'distribution' && t.status === 'completed');
    const totalDistributed = distributions.reduce((sum, t) => sum + t.amount, 0);

    const currentValue = totalCommitted * 1.25; // Mock 25% appreciation
    const totalGains = currentValue + totalDistributed - totalCalled;

    const recentActivity = transactions
      .slice(0, 5)
      .map(t => ({
        id: t.public_id,
        type: t.type,
        description: t.description || `${t.type} processed`,
        amount: t.amount,
        date: t.created_at
      }));

    const upcomingCalls = signedCommitments
      .filter(c => {
        const called = capitalCalls
          .filter(t => t.deal_id === c.deal_id)
          .reduce((sum, t) => sum + t.amount, 0);
        return called < c.amount;
      })
      .map(c => {
        const deal = this.deals.find(d => d.id === c.deal_id);
        return {
          dealName: deal?.name || 'Unknown Deal',
          amount: c.amount * 0.25, // Mock 25% call
          date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          currency: c.currency
        };
      });

    return Promise.resolve({
      investor,
      summary: {
        totalCommitted,
        totalCalled,
        totalDistributed,
        currentValue,
        totalGains,
        portfolioIRR: 18.5,
        portfolioMOIC: 1.45,
        activeDeals: signedCommitments.length
      },
      recentActivity,
      upcomingCalls
    });
  }

  async getPortfolioData(investorId: number): Promise<PortfolioData> {
    const commitments = await this.getCommitments(investorId);
    const signedCommitments = commitments.filter(c => c.status === 'signed');

    const holdings = await Promise.all(
      signedCommitments.map(async (commitment) => {
        const deal = await this.getDealById(commitment.deal_id);
        const company = deal?.company_id ? await this.getCompanyById(deal.company_id) : null;
        const transactions = await this.getTransactions({
          investor_id: investorId,
          deal_id: commitment.deal_id
        });

        const capitalCalled = transactions
          .filter(t => t.type === 'capital_call' && t.status === 'completed')
          .reduce((sum, t) => sum + t.amount, 0);

        const capitalDistributed = transactions
          .filter(t => t.type === 'distribution' && t.status === 'completed')
          .reduce((sum, t) => sum + t.amount, 0);

        const currentValue = capitalCalled * 1.35; // Mock 35% appreciation
        const irr = 15 + Math.random() * 10; // Mock IRR 15-25%
        const moic = currentValue / (capitalCalled || 1);

        return {
          deal: deal!,
          company: company!,
          commitment,
          metrics: {
            capitalCalled,
            capitalDistributed,
            currentValue,
            irr,
            moic
          }
        };
      })
    );

    const totalValue = holdings.reduce((sum, h) => sum + h.metrics.currentValue, 0);
    const totalCalled = holdings.reduce((sum, h) => sum + h.metrics.capitalCalled, 0);
    const totalDistributed = holdings.reduce((sum, h) => sum + h.metrics.capitalDistributed, 0);
    const totalGains = totalValue + totalDistributed - totalCalled;
    const averageIRR = holdings.reduce((sum, h) => sum + (h.metrics.irr || 0), 0) / holdings.length;
    const averageMOIC = totalValue / (totalCalled || 1);

    return Promise.resolve({
      holdings,
      summary: {
        totalHoldings: holdings.length,
        totalValue,
        totalGains,
        averageIRR,
        averageMOIC
      }
    });
  }
}
