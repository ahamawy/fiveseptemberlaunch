/**
 * Database Table Relationships
 * Defines all foreign key relationships between tables
 */

export const TableRelationships = {
  'deals_clean': [
    { from: 'underlying_company_id', to: 'companies_clean.company_id', type: 'many-to-one' },
    { from: 'holding_entity', to: 'companies_clean.company_id', type: 'many-to-one' }
  ],

  'transactions_clean': [
    { from: 'deal_id', to: 'deals_clean.deal_id', type: 'many-to-one' },
    { from: 'investor_id', to: 'investors_clean.id', type: 'many-to-one' }
  ],

  'transactions.transaction.secondary': [
    { from: 'transaction', to: 'transactions_clean.transaction_id', type: 'many-to-one' },
    { from: 'buyer_name', to: 'investors_clean.id', type: 'many-to-one' },
    { from: 'seller_name', to: 'investors_clean.id', type: 'many-to-one' },
    { from: 'deal_name_link', to: 'deals_clean.deal_id', type: 'many-to-one' },
    { from: 'subnominee_seller', to: 'transactions.transaction.subnominee.subnominee_id', type: 'many-to-one' }
  ],

  'transactions.transaction.subnominee': [
    { from: 'transaction', to: 'transactions_clean.transaction_id', type: 'many-to-one' },
    { from: 'sub_nominee_investor_link', to: 'investors_clean.id', type: 'many-to-one' }
  ],

  'transactions.transaction.advisory': [
    { from: 'holding_entity', to: 'companies_clean.company_id', type: 'many-to-one' },
    { from: 'deal_link', to: 'deals_clean.deal_id', type: 'many-to-one' }
  ],

  'documents': [
    { from: 'investor_id', to: 'investors_clean.id', type: 'many-to-one' },
    { from: 'deal_id', to: 'deals_clean.deal_id', type: 'many-to-one' },
    { from: 'company_id', to: 'companies_clean.company_id', type: 'many-to-one' },
    { from: 'transaction_id', to: 'transactions_clean.transaction_id', type: 'many-to-one' }
  ],

  'transaction_documents': [
    { from: 'transaction_id', to: 'transactions_clean.transaction_id', type: 'many-to-one' },
    { from: 'document_id', to: 'documents.id', type: 'many-to-one' }
  ],

  'legal_document_status': [
    { from: 'transaction_id', to: 'transactions_clean.transaction_id', type: 'many-to-one' },
    { from: 'investor_id', to: 'investors_clean.id', type: 'many-to-one' },
    { from: 'deal_id', to: 'deals_clean.deal_id', type: 'many-to-one' },
    { from: 'document_id', to: 'documents.id', type: 'many-to-one' }
  ],

  'deal_valuations': [
    { from: 'deal_id', to: 'deals_clean.deal_id', type: 'many-to-one' }
  ],

  'deal_recommendations': [
    { from: 'investor_id', to: 'investors_clean.id', type: 'many-to-one' },
    { from: 'deal_id', to: 'deals_clean.deal_id', type: 'many-to-one' }
  ],

  'investor_analytics': [
    { from: 'investor_id', to: 'investors_clean.id', type: 'many-to-one' }
  ],

  'investor_activity': [
    { from: 'investor_id', to: 'investors_clean.id', type: 'many-to-one' }
  ],

  'investment_snapshots': [
    { from: 'investor_id', to: 'investors_clean.id', type: 'many-to-one' },
    { from: 'deal_id', to: 'deals_clean.deal_id', type: 'many-to-one' },
    { from: 'company_id', to: 'companies_clean.company_id', type: 'many-to-one' }
  ],

  'valuations.valuation': [
    { from: 'company_id', to: 'companies_clean.company_id', type: 'many-to-one' }
  ],

  'company_002_assets': [
    { from: 'company_id', to: 'companies_clean.company_id', type: 'many-to-one' }
  ],

  'company_milestones': [
    { from: 'company_id', to: 'companies.id', type: 'many-to-one' }
  ],

  'company_news': [
    { from: 'company_id', to: 'companies.id', type: 'many-to-one' }
  ],

  'company_stories': [
    { from: 'company_id', to: 'companies.id', type: 'many-to-one' }
  ],

  'company_tags': [
    { from: 'company_id', to: 'companies.id', type: 'many-to-one' }
  ],

  'company_enrichment': [
    { from: 'company_id', to: 'companies_clean.company_id', type: 'many-to-one' }
  ],

  'docsend_views': [
    { from: 'deal_id', to: 'deals_clean.deal_id', type: 'many-to-one' },
    { from: 'investor_id', to: 'investors_clean.id', type: 'many-to-one' }
  ],

  'growth_prospects': [
    { from: 'matched_investor_id', to: 'investors_clean.id', type: 'many-to-one' }
  ],

  'spvs': [
    { from: 'company_id', to: 'companies_clean.company_id', type: 'many-to-one' },
    { from: 'linked_deal_id', to: 'deals_clean.deal_id', type: 'many-to-one' }
  ],

  'user_profiles': [
    { from: 'company_id', to: 'companies_clean.company_id', type: 'many-to-one' },
    { from: 'investor_id', to: 'investors_clean.id', type: 'many-to-one' },
    { from: 'id', to: 'auth.users.id', type: 'one-to-one' }
  ],

  'audit_trail': [
    { from: 'changed_by', to: 'auth.users.id', type: 'many-to-one' }
  ],

  'data_quality_log': [
    { from: 'resolved_by', to: 'auth.users.id', type: 'many-to-one' }
  ],

  'user_activity_log': [
    { from: 'user_id', to: 'auth.users.id', type: 'many-to-one' }
  ],

  'portfolio_events': [
    { from: 'created_by', to: 'auth.users.id', type: 'many-to-one' }
  ]
};