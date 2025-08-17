/**
 * Supabase Schema Knowledge Base
 * Complete documentation of the EQUITIE database schema
 * Used by AI agents to understand data relationships and generate intelligent insights
 */

export interface TableSchema {
  name: string;
  schema: string;
  description: string;
  columns: {
    name: string;
    type: string;
    nullable: boolean;
    description: string;
    example?: any;
  }[];
  relationships?: {
    column: string;
    references: string;
    type: 'one-to-one' | 'one-to-many' | 'many-to-many';
  }[];
  businessRules?: string[];
  sampleQueries?: string[];
}

export const SUPABASE_SCHEMA: { [key: string]: TableSchema } = {
  // ==========================================
  // CORE BUSINESS ENTITIES
  // ==========================================
  
  'companies.company': {
    name: 'company',
    schema: 'companies',
    description: 'Company profiles with valuations and metadata',
    columns: [
      { name: 'company_id', type: 'uuid', nullable: false, description: 'Primary key' },
      { name: 'company_name', type: 'text', nullable: false, description: 'Legal company name' },
      { name: 'company_type', type: 'text', nullable: true, description: 'startup, growth, mature' },
      { name: 'sector', type: 'text', nullable: true, description: 'Industry sector' },
      { name: 'country', type: 'text', nullable: true, description: 'Headquarters country' },
      { name: 'website', type: 'text', nullable: true, description: 'Company website URL' },
      { name: 'valuation', type: 'numeric', nullable: true, description: 'Latest valuation in USD' },
      { name: 'created_at', type: 'timestamptz', nullable: false, description: 'Record creation time' }
    ],
    relationships: [
      { column: 'company_id', references: 'deals.deal.underlying_company_id', type: 'one-to-many' }
    ],
    businessRules: [
      'Company names must be unique',
      'Valuation updates trigger historical record in valuations table',
      'Sector must match predefined list'
    ]
  },

  'deals.deal': {
    name: 'deal',
    schema: 'deals',
    description: 'Investment opportunities (primary, secondary, advisory)',
    columns: [
      { name: 'deal_id', type: 'uuid', nullable: false, description: 'Primary key' },
      { name: 'deal_code', type: 'text', nullable: false, description: 'Unique deal code (e.g., GRQAI)' },
      { name: 'deal_name', type: 'text', nullable: false, description: 'Deal display name' },
      { name: 'deal_type', type: 'text', nullable: true, description: 'primary, secondary, advisory' },
      { name: 'deal_status', type: 'text', nullable: true, description: 'ACTIVE, CLOSED, EXITED' },
      { name: 'underlying_company_id', type: 'uuid', nullable: true, description: 'Link to company' },
      { name: 'target_raise', type: 'numeric', nullable: true, description: 'Target amount to raise' },
      { name: 'minimum_investment', type: 'numeric', nullable: true, description: 'Minimum ticket size' },
      { name: 'opening_date', type: 'date', nullable: true, description: 'Deal open date' },
      { name: 'closing_date', type: 'date', nullable: true, description: 'Deal close date' },
      { name: 'created_at', type: 'timestamptz', nullable: false, description: 'Record creation time' }
    ],
    relationships: [
      { column: 'underlying_company_id', references: 'companies.company.company_id', type: 'one-to-one' },
      { column: 'deal_id', references: 'transactions.transaction.primary.deal_id', type: 'one-to-many' }
    ],
    businessRules: [
      'Deal codes must be unique and uppercase',
      'Closing date must be after opening date',
      'Active deals cannot have past closing dates'
    ],
    sampleQueries: [
      "SELECT * FROM deals.deal WHERE deal_status = 'ACTIVE'",
      "SELECT d.*, c.company_name FROM deals.deal d JOIN companies.company c ON d.underlying_company_id = c.company_id"
    ]
  },

  'investors.investor': {
    name: 'investor',
    schema: 'investors',
    description: 'Investor profiles with KYC status',
    columns: [
      { name: 'investor_id', type: 'uuid', nullable: false, description: 'Primary key' },
      { name: 'full_name', type: 'text', nullable: false, description: 'Investor full name' },
      { name: 'primary_email', type: 'text', nullable: false, description: 'Primary contact email' },
      { name: 'investor_type', type: 'text', nullable: true, description: 'individual, institutional, family_office, fund' },
      { name: 'kyc_status', type: 'text', nullable: true, description: 'pending, verified, expired' },
      { name: 'commitment_amount', type: 'numeric', nullable: true, description: 'Total committed across all deals' },
      { name: 'paid_amount', type: 'numeric', nullable: true, description: 'Total paid to date' },
      { name: 'ownership_percentage', type: 'numeric', nullable: true, description: 'Overall ownership %' },
      { name: 'created_at', type: 'timestamptz', nullable: false, description: 'Record creation time' }
    ],
    relationships: [
      { column: 'investor_id', references: 'transactions.transaction.primary.investor_id', type: 'one-to-many' },
      { column: 'investor_id', references: 'investor_units.investor_id', type: 'one-to-many' }
    ],
    businessRules: [
      'Email must be unique',
      'KYC must be verified before transactions',
      'Institutional investors require additional documentation'
    ]
  },

  // ==========================================
  // TRANSACTION TABLES
  // ==========================================

  'transactions.transaction.primary': {
    name: 'transaction.primary',
    schema: 'transactions',
    description: 'Primary investment transactions',
    columns: [
      { name: 'transaction_id', type: 'uuid', nullable: false, description: 'Primary key' },
      { name: 'investor_id', type: 'uuid', nullable: true, description: 'Link to investor' },
      { name: 'deal_id', type: 'uuid', nullable: true, description: 'Link to deal' },
      { name: 'transaction_type', type: 'text', nullable: true, description: 'capital_call, distribution, fee' },
      { name: 'amount', type: 'numeric', nullable: false, description: 'Transaction amount' },
      { name: 'currency', type: 'text', nullable: true, description: 'USD, EUR, GBP' },
      { name: 'status', type: 'text', nullable: true, description: 'pending, completed, failed' },
      { name: 'transaction_date', type: 'date', nullable: true, description: 'Effective date' },
      { name: 'created_at', type: 'timestamptz', nullable: false, description: 'Record creation time' }
    ],
    businessRules: [
      'Capital calls cannot exceed commitment',
      'Distributions require positive NAV',
      'Fees calculated based on fee profile'
    ]
  },

  'investor_units': {
    name: 'investor_units',
    schema: 'public',
    description: 'Unit ownership tracking',
    columns: [
      { name: 'unit_id', type: 'uuid', nullable: false, description: 'Primary key' },
      { name: 'investor_id', type: 'uuid', nullable: false, description: 'Link to investor' },
      { name: 'deal_id', type: 'uuid', nullable: false, description: 'Link to deal' },
      { name: 'units_owned', type: 'numeric', nullable: false, description: 'Number of units' },
      { name: 'unit_price', type: 'numeric', nullable: true, description: 'Price per unit' },
      { name: 'acquisition_date', type: 'date', nullable: true, description: 'Purchase date' },
      { name: 'created_at', type: 'timestamptz', nullable: false, description: 'Record creation time' }
    ]
  },

  // ==========================================
  // ANALYTICS & METRICS
  // ==========================================

  'portfolio_analytics': {
    name: 'portfolio_analytics',
    schema: 'public',
    description: 'Platform-wide portfolio analytics',
    columns: [
      { name: 'analytics_id', type: 'uuid', nullable: false, description: 'Primary key' },
      { name: 'period', type: 'text', nullable: false, description: 'Time period (Q1 2024, etc)' },
      { name: 'total_aum', type: 'numeric', nullable: true, description: 'Assets under management' },
      { name: 'total_investors', type: 'integer', nullable: true, description: 'Active investor count' },
      { name: 'average_irr', type: 'numeric', nullable: true, description: 'Portfolio IRR' },
      { name: 'average_moic', type: 'numeric', nullable: true, description: 'Portfolio MOIC' },
      { name: 'created_at', type: 'timestamptz', nullable: false, description: 'Record creation time' }
    ]
  },

  'investor_analytics': {
    name: 'investor_analytics',
    schema: 'public',
    description: 'Per-investor performance metrics',
    columns: [
      { name: 'investor_id', type: 'uuid', nullable: false, description: 'Link to investor' },
      { name: 'total_invested', type: 'numeric', nullable: true, description: 'Total capital deployed' },
      { name: 'current_value', type: 'numeric', nullable: true, description: 'Current portfolio value' },
      { name: 'realized_gains', type: 'numeric', nullable: true, description: 'Realized P&L' },
      { name: 'unrealized_gains', type: 'numeric', nullable: true, description: 'Unrealized P&L' },
      { name: 'portfolio_irr', type: 'numeric', nullable: true, description: 'Personal IRR' },
      { name: 'portfolio_moic', type: 'numeric', nullable: true, description: 'Personal MOIC' },
      { name: 'last_updated', type: 'timestamptz', nullable: true, description: 'Last calculation time' }
    ]
  },

  // ==========================================
  // DOCUMENT MANAGEMENT
  // ==========================================

  'documents': {
    name: 'documents',
    schema: 'public',
    description: 'Document storage and metadata',
    columns: [
      { name: 'document_id', type: 'uuid', nullable: false, description: 'Primary key' },
      { name: 'document_type', type: 'text', nullable: true, description: 'termsheet, agreement, report' },
      { name: 'document_name', type: 'text', nullable: false, description: 'File name' },
      { name: 'url', type: 'text', nullable: true, description: 'Storage URL' },
      { name: 'investor_id', type: 'uuid', nullable: true, description: 'Link to investor' },
      { name: 'deal_id', type: 'uuid', nullable: true, description: 'Link to deal' },
      { name: 'is_signed', type: 'boolean', nullable: true, description: 'Signature status' },
      { name: 'created_at', type: 'timestamptz', nullable: false, description: 'Upload time' }
    ]
  },

  // ==========================================
  // AUDIT & COMPLIANCE
  // ==========================================

  'audit_trail': {
    name: 'audit_trail',
    schema: 'public',
    description: 'Complete audit logging',
    columns: [
      { name: 'audit_id', type: 'uuid', nullable: false, description: 'Primary key' },
      { name: 'table_name', type: 'text', nullable: false, description: 'Affected table' },
      { name: 'record_id', type: 'uuid', nullable: true, description: 'Affected record' },
      { name: 'action', type: 'text', nullable: false, description: 'INSERT, UPDATE, DELETE' },
      { name: 'user_id', type: 'uuid', nullable: true, description: 'User who made change' },
      { name: 'old_values', type: 'jsonb', nullable: true, description: 'Previous values' },
      { name: 'new_values', type: 'jsonb', nullable: true, description: 'New values' },
      { name: 'created_at', type: 'timestamptz', nullable: false, description: 'Action time' }
    ]
  }
};

// CSV column mapping patterns
export const CSV_MAPPINGS = {
  investors: {
    commonPatterns: [
      { csvColumn: /^(investor[\s_]?)?name$/i, dbColumn: 'full_name' },
      { csvColumn: /^e[\s-]?mail$/i, dbColumn: 'primary_email' },
      { csvColumn: /^type$/i, dbColumn: 'investor_type' },
      { csvColumn: /^commit(ment|ted)?$/i, dbColumn: 'commitment_amount' },
      { csvColumn: /^paid$/i, dbColumn: 'paid_amount' },
      { csvColumn: /^ownership[\s_]?%?$/i, dbColumn: 'ownership_percentage' }
    ]
  },
  deals: {
    commonPatterns: [
      { csvColumn: /^deal[\s_]?(name|title)$/i, dbColumn: 'deal_name' },
      { csvColumn: /^code$/i, dbColumn: 'deal_code' },
      { csvColumn: /^company$/i, dbColumn: 'underlying_company_id' },
      { csvColumn: /^target$/i, dbColumn: 'target_raise' },
      { csvColumn: /^minimum$/i, dbColumn: 'minimum_investment' }
    ]
  },
  transactions: {
    commonPatterns: [
      { csvColumn: /^amount$/i, dbColumn: 'amount' },
      { csvColumn: /^date$/i, dbColumn: 'transaction_date' },
      { csvColumn: /^type$/i, dbColumn: 'transaction_type' },
      { csvColumn: /^investor$/i, dbColumn: 'investor_id' },
      { csvColumn: /^deal$/i, dbColumn: 'deal_id' }
    ]
  }
};

// Business logic rules
export const BUSINESS_RULES = {
  investors: [
    'Emails must be unique across the platform',
    'KYC verification required before first transaction',
    'Commitment cannot be less than paid amount',
    'Institutional investors need company registration documents'
  ],
  deals: [
    'Deal codes are 3-6 uppercase letters',
    'Minimum investment typically $100k for primary deals',
    'Secondary deals require existing investor approval',
    'Advisory deals have different fee structures'
  ],
  transactions: [
    'Capital calls cannot exceed remaining commitment',
    'Distributions only for deals with positive NAV',
    'Management fees calculated quarterly',
    'Performance fees (carry) only after hurdle rate'
  ]
};

// Common queries for dashboard
export const DASHBOARD_QUERIES = {
  investorSummary: `
    SELECT 
      i.full_name,
      i.commitment_amount,
      i.paid_amount,
      ia.current_value,
      ia.portfolio_irr,
      ia.portfolio_moic
    FROM investors.investor i
    LEFT JOIN investor_analytics ia ON i.investor_id = ia.investor_id
    WHERE i.investor_id = $1
  `,
  
  recentTransactions: `
    SELECT 
      t.transaction_date,
      t.transaction_type,
      t.amount,
      d.deal_name
    FROM transactions.transaction.primary t
    LEFT JOIN deals.deal d ON t.deal_id = d.deal_id
    WHERE t.investor_id = $1
    ORDER BY t.transaction_date DESC
    LIMIT 10
  `,
  
  portfolioHoldings: `
    SELECT 
      d.deal_name,
      c.company_name,
      iu.units_owned,
      iu.unit_price,
      (iu.units_owned * iu.unit_price) as current_value
    FROM investor_units iu
    JOIN deals.deal d ON iu.deal_id = d.deal_id
    LEFT JOIN companies.company c ON d.underlying_company_id = c.company_id
    WHERE iu.investor_id = $1
  `
};

// Export complete schema context for AI
export function getSchemaContext(): string {
  return `
EQUITIE uses a PostgreSQL database via Supabase with the following structure:

CORE TABLES:
- companies.company: Company profiles and valuations
- deals.deal: Investment opportunities (primary/secondary/advisory)
- investors.investor: Investor profiles with KYC status
- transactions.transaction.primary: Money movements
- investor_units: Unit ownership tracking
- documents: Document management

KEY RELATIONSHIPS:
- Investors have many transactions
- Deals belong to companies
- Investors own units in deals
- Documents link to investors and deals

BUSINESS RULES:
${Object.entries(BUSINESS_RULES).map(([k, v]) => `${k}: ${v.join(', ')}`).join('\n')}

COMMON CSV MAPPINGS:
- "Investor Name" → investors.investor.full_name
- "Email" → investors.investor.primary_email
- "Commitment" → investors.investor.commitment_amount
- "Deal Code" → deals.deal.deal_code

When analyzing CSV data:
1. Map columns to database fields using pattern matching
2. Validate data types and constraints
3. Check for foreign key relationships
4. Suggest SQL for import
5. Identify data quality issues
`;
}