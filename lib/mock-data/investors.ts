export interface Investor {
  id: number;
  publicId: string;
  fullName: string;
  primaryEmail: string;
  type: 'individual' | 'institutional' | 'family_office' | 'fund';
  countryResidence: string;
  status: 'active' | 'blocked' | 'archived';
  kycStatus: 'pending' | 'approved' | 'rejected' | 'expired';
  createdAt: string;
  updatedAt: string;
}

export const mockInvestors: Investor[] = [
  {
    id: 1,
    publicId: 'inv_7f8a9b1c-2d3e-4f5a-6b7c-8d9e0f1a2b3c',
    fullName: 'John Smith',
    primaryEmail: 'john.smith@example.com',
    type: 'individual',
    countryResidence: 'USA',
    status: 'active',
    kycStatus: 'approved',
    createdAt: '2023-01-15T10:00:00Z',
    updatedAt: '2024-12-01T10:00:00Z',
  },
  {
    id: 2,
    publicId: 'inv_2a3b4c5d-6e7f-8a9b-0c1d-2e3f4a5b6c7d',
    fullName: 'Sarah Johnson',
    primaryEmail: 'sarah.johnson@example.com',
    type: 'individual',
    countryResidence: 'UK',
    status: 'active',
    kycStatus: 'approved',
    createdAt: '2023-02-20T10:00:00Z',
    updatedAt: '2024-11-15T10:00:00Z',
  },
  {
    id: 3,
    publicId: 'inv_8e9f0a1b-2c3d-4e5f-6a7b-8c9d0e1f2a3b',
    fullName: 'Apex Capital Partners',
    primaryEmail: 'contact@apexcapital.com',
    type: 'institutional',
    countryResidence: 'USA',
    status: 'active',
    kycStatus: 'approved',
    createdAt: '2022-11-01T10:00:00Z',
    updatedAt: '2024-12-10T10:00:00Z',
  },
  {
    id: 4,
    publicId: 'inv_4c5d6e7f-8a9b-0c1d-2e3f-4a5b6c7d8e9f',
    fullName: 'Michael Chen',
    primaryEmail: 'michael.chen@example.com',
    type: 'individual',
    countryResidence: 'Singapore',
    status: 'active',
    kycStatus: 'approved',
    createdAt: '2023-03-10T10:00:00Z',
    updatedAt: '2024-10-20T10:00:00Z',
  },
  {
    id: 5,
    publicId: 'inv_0a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d',
    fullName: 'The Richardson Family Office',
    primaryEmail: 'office@richardsonfamily.com',
    type: 'family_office',
    countryResidence: 'Canada',
    status: 'active',
    kycStatus: 'approved',
    createdAt: '2023-04-05T10:00:00Z',
    updatedAt: '2024-09-30T10:00:00Z',
  },
  {
    id: 6,
    publicId: 'inv_6e7f8a9b-0c1d-2e3f-4a5b-6c7d8e9f0a1b',
    fullName: 'Global Ventures Fund',
    primaryEmail: 'info@globalventures.com',
    type: 'fund',
    countryResidence: 'Switzerland',
    status: 'active',
    kycStatus: 'approved',
    createdAt: '2022-09-15T10:00:00Z',
    updatedAt: '2024-12-05T10:00:00Z',
  },
  {
    id: 7,
    publicId: 'inv_2c3d4e5f-6a7b-8c9d-0e1f-2a3b4c5d6e7f',
    fullName: 'Emma Wilson',
    primaryEmail: 'emma.wilson@example.com',
    type: 'individual',
    countryResidence: 'Australia',
    status: 'active',
    kycStatus: 'pending',
    createdAt: '2024-11-01T10:00:00Z',
    updatedAt: '2024-12-15T10:00:00Z',
  },
  {
    id: 8,
    publicId: 'inv_8a9b0c1d-2e3f-4a5b-6c7d-8e9f0a1b2c3d',
    fullName: 'Robert Martinez',
    primaryEmail: 'robert.martinez@example.com',
    type: 'individual',
    countryResidence: 'Spain',
    status: 'active',
    kycStatus: 'approved',
    createdAt: '2023-05-20T10:00:00Z',
    updatedAt: '2024-08-10T10:00:00Z',
  },
  {
    id: 9,
    publicId: 'inv_4e5f6a7b-8c9d-0e1f-2a3b-4c5d6e7f8a9b',
    fullName: 'Tech Innovation Fund',
    primaryEmail: 'invest@techinnovation.com',
    type: 'fund',
    countryResidence: 'USA',
    status: 'active',
    kycStatus: 'approved',
    createdAt: '2023-06-01T10:00:00Z',
    updatedAt: '2024-11-25T10:00:00Z',
  },
  {
    id: 10,
    publicId: 'inv_0c1d2e3f-4a5b-6c7d-8e9f-0a1b2c3d4e5f',
    fullName: 'Lisa Anderson',
    primaryEmail: 'lisa.anderson@example.com',
    type: 'individual',
    countryResidence: 'Germany',
    status: 'active',
    kycStatus: 'approved',
    createdAt: '2023-07-15T10:00:00Z',
    updatedAt: '2024-12-20T10:00:00Z',
  },
];

export function getInvestorById(id: number): Investor | undefined {
  return mockInvestors.find(investor => investor.id === id);
}

export function getInvestorByPublicId(publicId: string): Investor | undefined {
  return mockInvestors.find(investor => investor.publicId === publicId);
}