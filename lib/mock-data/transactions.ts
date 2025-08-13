export interface Transaction {
  id: number;
  publicId: string;
  dealId: number | null;
  investorId: number;
  occurredOn: string;
  currency: string;
  amount: number;
  type: 'capital_call' | 'distribution' | 'fee' | 'refund' | 'adjustment';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description: string;
  reference: string;
  createdAt: string;
}

export const mockTransactions: Transaction[] = [
  // Investor 1 transactions
  {
    id: 1,
    publicId: 'txn_a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    dealId: 1,
    investorId: 1,
    occurredOn: '2024-02-01',
    currency: 'USD',
    amount: 125000,
    type: 'capital_call',
    status: 'completed',
    description: 'First capital call - TechVision AI Series A',
    reference: 'CC-TVA-2024-001',
    createdAt: '2024-02-01T10:00:00Z',
  },
  {
    id: 2,
    publicId: 'txn_b2c3d4e5-f6a7-8901-bcde-f23456789012',
    dealId: 1,
    investorId: 1,
    occurredOn: '2024-04-01',
    currency: 'USD',
    amount: 125000,
    type: 'capital_call',
    status: 'completed',
    description: 'Second capital call - TechVision AI Series A',
    reference: 'CC-TVA-2024-002',
    createdAt: '2024-04-01T10:00:00Z',
  },
  {
    id: 3,
    publicId: 'txn_c3d4e5f6-a7b8-9012-cdef-345678901234',
    dealId: 3,
    investorId: 1,
    occurredOn: '2024-03-15',
    currency: 'GBP',
    amount: 150000,
    type: 'capital_call',
    status: 'completed',
    description: 'Capital call - HealthTech Plus Secondary',
    reference: 'CC-HTP-2024-001',
    createdAt: '2024-03-15T10:00:00Z',
  },
  {
    id: 4,
    publicId: 'txn_d4e5f6a7-b8c9-0123-defa-456789012345',
    dealId: 6,
    investorId: 1,
    occurredOn: '2024-06-30',
    currency: 'USD',
    amount: 200000,
    type: 'distribution',
    status: 'completed',
    description: 'Exit distribution - TechVision AI Seed Round',
    reference: 'DIST-TVA-2024-001',
    createdAt: '2024-06-30T10:00:00Z',
  },
  {
    id: 5,
    publicId: 'txn_e5f6a7b8-c9d0-1234-efab-567890123456',
    dealId: 1,
    investorId: 1,
    occurredOn: '2024-10-01',
    currency: 'USD',
    amount: 2500,
    type: 'fee',
    status: 'completed',
    description: 'Management fee Q3 2024',
    reference: 'FEE-Q3-2024-001',
    createdAt: '2024-10-01T10:00:00Z',
  },
  // Investor 2 transactions
  {
    id: 6,
    publicId: 'txn_f6a7b8c9-d0e1-2345-fabc-678901234567',
    dealId: 2,
    investorId: 2,
    occurredOn: '2024-02-20',
    currency: 'EUR',
    amount: 250000,
    type: 'capital_call',
    status: 'completed',
    description: 'First capital call - GreenEnergy Solutions Series B',
    reference: 'CC-GES-2024-001',
    createdAt: '2024-02-20T10:00:00Z',
  },
  {
    id: 7,
    publicId: 'txn_a7b8c9d0-e1f2-3456-abcd-789012345678',
    dealId: 2,
    investorId: 2,
    occurredOn: '2024-05-20',
    currency: 'EUR',
    amount: 250000,
    type: 'capital_call',
    status: 'pending',
    description: 'Second capital call - GreenEnergy Solutions Series B',
    reference: 'CC-GES-2024-002',
    createdAt: '2024-05-20T10:00:00Z',
  },
  // Investor 3 transactions
  {
    id: 8,
    publicId: 'txn_b8c9d0e1-f2a3-4567-bcde-890123456789',
    dealId: 1,
    investorId: 3,
    occurredOn: '2024-02-01',
    currency: 'USD',
    amount: 500000,
    type: 'capital_call',
    status: 'completed',
    description: 'First capital call - TechVision AI Series A',
    reference: 'CC-TVA-2024-003',
    createdAt: '2024-02-01T10:00:00Z',
  },
  {
    id: 9,
    publicId: 'txn_c9d0e1f2-a3b4-5678-cdef-901234567890',
    dealId: 1,
    investorId: 3,
    occurredOn: '2024-04-01',
    currency: 'USD',
    amount: 500000,
    type: 'capital_call',
    status: 'completed',
    description: 'Second capital call - TechVision AI Series A',
    reference: 'CC-TVA-2024-004',
    createdAt: '2024-04-01T10:00:00Z',
  },
  {
    id: 10,
    publicId: 'txn_d0e1f2a3-b4c5-6789-defa-012345678901',
    dealId: 1,
    investorId: 3,
    occurredOn: '2024-11-01',
    currency: 'USD',
    amount: 50000,
    type: 'distribution',
    status: 'completed',
    description: 'Interim distribution - TechVision AI Series A',
    reference: 'DIST-TVA-2024-002',
    createdAt: '2024-11-01T10:00:00Z',
  },
  // More transactions for variety
  {
    id: 11,
    publicId: 'txn_e1f2a3b4-c5d6-7890-efab-123456789012',
    dealId: null,
    investorId: 1,
    occurredOn: '2024-12-01',
    currency: 'USD',
    amount: 5000,
    type: 'fee',
    status: 'completed',
    description: 'Annual administration fee',
    reference: 'FEE-ANNUAL-2024',
    createdAt: '2024-12-01T10:00:00Z',
  },
  {
    id: 12,
    publicId: 'txn_f2a3b4c5-d6e7-8901-fabc-234567890123',
    dealId: 5,
    investorId: 4,
    occurredOn: '2024-05-15',
    currency: 'CHF',
    amount: 50000,
    type: 'capital_call',
    status: 'completed',
    description: 'First capital call - BioPharm Innovations Seed',
    reference: 'CC-BPI-2024-001',
    createdAt: '2024-05-15T10:00:00Z',
  },
  {
    id: 13,
    publicId: 'txn_a3b4c5d6-e7f8-9012-abcd-345678901234',
    dealId: 5,
    investorId: 4,
    occurredOn: '2024-07-15',
    currency: 'CHF',
    amount: 50000,
    type: 'capital_call',
    status: 'pending',
    description: 'Second capital call - BioPharm Innovations Seed',
    reference: 'CC-BPI-2024-002',
    createdAt: '2024-07-15T10:00:00Z',
  },
  {
    id: 14,
    publicId: 'txn_b4c5d6e7-f8a9-0123-bcde-456789012345',
    dealId: 2,
    investorId: 5,
    occurredOn: '2024-02-25',
    currency: 'EUR',
    amount: 375000,
    type: 'capital_call',
    status: 'completed',
    description: 'First capital call - GreenEnergy Solutions Series B',
    reference: 'CC-GES-2024-005',
    createdAt: '2024-02-25T10:00:00Z',
  },
  {
    id: 15,
    publicId: 'txn_c5d6e7f8-a9b0-1234-cdef-567890123456',
    dealId: 2,
    investorId: 5,
    occurredOn: '2024-05-25',
    currency: 'EUR',
    amount: 375000,
    type: 'capital_call',
    status: 'pending',
    description: 'Second capital call - GreenEnergy Solutions Series B',
    reference: 'CC-GES-2024-006',
    createdAt: '2024-05-25T10:00:00Z',
  },
];

export function getTransactionsByInvestorId(investorId: number): Transaction[] {
  return mockTransactions.filter(transaction => transaction.investorId === investorId);
}

export function getTransactionsByDealId(dealId: number): Transaction[] {
  return mockTransactions.filter(transaction => transaction.dealId === dealId);
}

export function getRecentTransactions(investorId: number, limit: number = 5): Transaction[] {
  return getTransactionsByInvestorId(investorId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}