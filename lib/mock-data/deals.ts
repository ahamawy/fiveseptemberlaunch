export interface Deal {
  id: number;
  publicId: string;
  companyId: number;
  code: string;
  slug: string;
  name: string;
  type: 'primary' | 'secondary' | 'direct' | 'fund';
  stage: 'sourcing' | 'due_diligence' | 'closing' | 'active' | 'exited' | 'cancelled';
  currency: string;
  openingDate: string;
  closingDate: string | null;
  unitPriceInit: number;
  targetRaise: number;
  currentRaise: number;
  minimumInvestment: number;
  sector: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: number;
  publicId: string;
  name: string;
  type: 'startup' | 'growth' | 'mature';
  sector: string;
  country: string;
  website: string;
  valuation: number;
}

export const mockCompanies: Company[] = [
  {
    id: 1,
    publicId: 'comp_1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
    name: 'TechVision AI',
    type: 'startup',
    sector: 'Artificial Intelligence',
    country: 'USA',
    website: 'https://techvision.ai',
    valuation: 50000000,
  },
  {
    id: 2,
    publicId: 'comp_7e8f9a0b-1c2d-3e4f-5a6b-7c8d9e0f1a2b',
    name: 'GreenEnergy Solutions',
    type: 'growth',
    sector: 'Clean Energy',
    country: 'Germany',
    website: 'https://greenenergy.com',
    valuation: 150000000,
  },
  {
    id: 3,
    publicId: 'comp_3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f',
    name: 'HealthTech Plus',
    type: 'growth',
    sector: 'Healthcare',
    country: 'UK',
    website: 'https://healthtechplus.com',
    valuation: 200000000,
  },
  {
    id: 4,
    publicId: 'comp_9a0b1c2d-3e4f-5a6b-7c8d-9e0f1a2b3c4d',
    name: 'FinanceFlow',
    type: 'mature',
    sector: 'Fintech',
    country: 'Singapore',
    website: 'https://financeflow.sg',
    valuation: 500000000,
  },
  {
    id: 5,
    publicId: 'comp_5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b',
    name: 'BioPharm Innovations',
    type: 'startup',
    sector: 'Biotechnology',
    country: 'Switzerland',
    website: 'https://biopharm-innovations.ch',
    valuation: 75000000,
  },
];

export const mockDeals: Deal[] = [
  {
    id: 1,
    publicId: 'deal_a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    companyId: 1,
    code: 'TVA-2024-A',
    slug: 'techvision-ai-series-a',
    name: 'TechVision AI Series A',
    type: 'primary',
    stage: 'active',
    currency: 'USD',
    openingDate: '2024-01-15',
    closingDate: '2024-03-15',
    unitPriceInit: 100,
    targetRaise: 10000000,
    currentRaise: 8500000,
    minimumInvestment: 50000,
    sector: 'Artificial Intelligence',
    description: 'Series A funding round for AI-powered computer vision platform',
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-12-15T10:00:00Z',
  },
  {
    id: 2,
    publicId: 'deal_b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
    companyId: 2,
    code: 'GES-2024-B',
    slug: 'greenenergy-solutions-series-b',
    name: 'GreenEnergy Solutions Series B',
    type: 'primary',
    stage: 'closing',
    currency: 'EUR',
    openingDate: '2024-02-01',
    closingDate: null,
    unitPriceInit: 250,
    targetRaise: 25000000,
    currentRaise: 22000000,
    minimumInvestment: 100000,
    sector: 'Clean Energy',
    description: 'Series B funding for expansion of renewable energy infrastructure',
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-12-20T10:00:00Z',
  },
  {
    id: 3,
    publicId: 'deal_c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f',
    companyId: 3,
    code: 'HTP-2024-SEC',
    slug: 'healthtech-plus-secondary',
    name: 'HealthTech Plus Secondary Offering',
    type: 'secondary',
    stage: 'active',
    currency: 'GBP',
    openingDate: '2024-03-01',
    closingDate: '2024-04-30',
    unitPriceInit: 175,
    targetRaise: 15000000,
    currentRaise: 12000000,
    minimumInvestment: 75000,
    sector: 'Healthcare',
    description: 'Secondary market opportunity in leading healthcare technology company',
    createdAt: '2024-02-15T10:00:00Z',
    updatedAt: '2024-12-18T10:00:00Z',
  },
  {
    id: 4,
    publicId: 'deal_d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a',
    companyId: 4,
    code: 'FF-2024-DIR',
    slug: 'financeflow-direct',
    name: 'FinanceFlow Direct Investment',
    type: 'direct',
    stage: 'due_diligence',
    currency: 'USD',
    openingDate: '2024-04-01',
    closingDate: null,
    unitPriceInit: 500,
    targetRaise: 50000000,
    currentRaise: 0,
    minimumInvestment: 250000,
    sector: 'Fintech',
    description: 'Direct investment opportunity in established fintech leader',
    createdAt: '2024-03-15T10:00:00Z',
    updatedAt: '2024-12-22T10:00:00Z',
  },
  {
    id: 5,
    publicId: 'deal_e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b',
    companyId: 5,
    code: 'BPI-2024-SEED',
    slug: 'biopharm-innovations-seed',
    name: 'BioPharm Innovations Seed Round',
    type: 'primary',
    stage: 'active',
    currency: 'CHF',
    openingDate: '2024-05-01',
    closingDate: '2024-06-30',
    unitPriceInit: 50,
    targetRaise: 5000000,
    currentRaise: 3500000,
    minimumInvestment: 25000,
    sector: 'Biotechnology',
    description: 'Seed funding for breakthrough pharmaceutical research platform',
    createdAt: '2024-04-15T10:00:00Z',
    updatedAt: '2024-12-10T10:00:00Z',
  },
  {
    id: 6,
    publicId: 'deal_f6a7b8c9-d0e1-2f3a-4b5c-6d7e8f9a0b1c',
    companyId: 1,
    code: 'TVA-2023-SEED',
    slug: 'techvision-ai-seed',
    name: 'TechVision AI Seed Round',
    type: 'primary',
    stage: 'exited',
    currency: 'USD',
    openingDate: '2023-01-15',
    closingDate: '2023-03-15',
    unitPriceInit: 25,
    targetRaise: 2000000,
    currentRaise: 2000000,
    minimumInvestment: 10000,
    sector: 'Artificial Intelligence',
    description: 'Successfully exited seed round with 4x return',
    createdAt: '2023-01-01T10:00:00Z',
    updatedAt: '2024-06-30T10:00:00Z',
  },
];

export interface Commitment {
  id: number;
  investorId: number;
  dealId: number;
  currency: string;
  amount: number;
  status: 'draft' | 'signed' | 'cancelled';
  createdAt: string;
}

export const mockCommitments: Commitment[] = [
  { id: 1, investorId: 1, dealId: 1, currency: 'USD', amount: 250000, status: 'signed', createdAt: '2024-01-20T10:00:00Z' },
  { id: 2, investorId: 1, dealId: 3, currency: 'GBP', amount: 150000, status: 'signed', createdAt: '2024-03-10T10:00:00Z' },
  { id: 3, investorId: 1, dealId: 6, currency: 'USD', amount: 50000, status: 'signed', createdAt: '2023-01-20T10:00:00Z' },
  { id: 4, investorId: 2, dealId: 2, currency: 'EUR', amount: 500000, status: 'signed', createdAt: '2024-02-15T10:00:00Z' },
  { id: 5, investorId: 3, dealId: 1, currency: 'USD', amount: 1000000, status: 'signed', createdAt: '2024-01-25T10:00:00Z' },
  { id: 6, investorId: 3, dealId: 4, currency: 'USD', amount: 2000000, status: 'draft', createdAt: '2024-04-05T10:00:00Z' },
  { id: 7, investorId: 4, dealId: 5, currency: 'CHF', amount: 100000, status: 'signed', createdAt: '2024-05-10T10:00:00Z' },
  { id: 8, investorId: 5, dealId: 2, currency: 'EUR', amount: 750000, status: 'signed', createdAt: '2024-02-20T10:00:00Z' },
  { id: 9, investorId: 6, dealId: 1, currency: 'USD', amount: 2000000, status: 'signed', createdAt: '2024-01-30T10:00:00Z' },
  { id: 10, investorId: 6, dealId: 3, currency: 'GBP', amount: 1500000, status: 'signed', createdAt: '2024-03-15T10:00:00Z' },
];

export function getDealById(id: number): Deal | undefined {
  return mockDeals.find(deal => deal.id === id);
}

export function getCompanyById(id: number): Company | undefined {
  return mockCompanies.find(company => company.id === id);
}

export function getCommitmentsByInvestorId(investorId: number): Commitment[] {
  return mockCommitments.filter(commitment => commitment.investorId === investorId);
}

export function getDealsByInvestorId(investorId: number): Deal[] {
  const commitments = getCommitmentsByInvestorId(investorId);
  const dealIds = commitments.map(c => c.dealId);
  return mockDeals.filter(deal => dealIds.includes(deal.id));
}