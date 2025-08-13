/**
 * Database Enums
 * All enumerated types used in the database schema
 */

export const DatabaseEnums = {
  // Company types
  'company_type': ['startup', 'growth', 'mature', 'holding', 'spv'],

  // Deal types
  'deal_type': ['primary', 'secondary', 'direct', 'fund', 'advisory'],

  // Deal stages
  'deal_stage': ['sourcing', 'due_diligence', 'closing', 'active', 'exited', 'cancelled'],

  // Deal categories
  'deal_category': ['INVESTMENT', 'ADVISORY', 'SPECIAL'],

  // Investor types
  'investor_type': ['individual', 'institutional', 'family_office', 'fund', 'corporate'],

  // Investor status
  'investor_status': ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING'],

  // KYC status
  'kyc_status': ['pending', 'verified', 'rejected', 'expired'],

  // Transaction types
  'transaction_type': ['capital_call', 'distribution', 'fee', 'refund', 'transfer', 'investment'],

  // Transaction status
  'transaction_status': ['pending', 'completed', 'cancelled', 'processing', 'failed'],

  // Document types
  'document_type': [
    'termsheet',
    'allocation_sheet',
    'operating_agreement',
    'side_letter',
    'subscription_agreement',
    'nda',
    'pitch_deck',
    'financial_statement',
    'legal_opinion',
    'valuation_report'
  ],

  // Document status
  'document_status': ['draft', 'pending', 'sent', 'signed', 'countersigned', 'completed', 'expired'],

  // Document categories
  'document_category': [
    'legal',
    'financial',
    'marketing',
    'compliance',
    'operational',
    'confidential'
  ],

  // Legal document status
  'legal_status': ['pending', 'sent', 'signed', 'countersigned', 'completed', 'expired'],

  // Commitment status
  'commitment_status': ['draft', 'signed', 'cancelled'],

  // User roles
  'user_role': ['viewer', 'investor', 'admin', 'super_admin', 'analyst', 'manager'],

  // Notification types
  'notification_type': ['info', 'success', 'warning', 'error'],

  // Notification categories
  'notification_category': ['investor', 'transaction', 'campaign', 'system', 'deal'],

  // Asset types
  'asset_type': [
    'logo',
    'hero_image',
    'gallery',
    'screenshot',
    'team_photo',
    'office_image',
    'video',
    'document',
    'background'
  ],

  // Company stages
  'company_stage': ['seed', 'series-a', 'series-b', 'series-c', 'growth', 'pre-ipo', 'public'],

  // Deal recommendation types
  'recommendation_type': ['auto', 'advisor', 'peer_activity'],

  // Deal recommendation status
  'recommendation_status': ['active', 'viewed', 'dismissed', 'invested'],

  // Data quality severity
  'severity': ['info', 'warning', 'error', 'critical'],

  // Data quality status
  'quality_status': ['open', 'investigating', 'resolved', 'ignored'],

  // Sync job types
  'sync_job_type': ['deals', 'transactions', 'investors', 'companies', 'analytics'],

  // Sync job status
  'sync_job_status': ['pending', 'running', 'completed', 'failed'],

  // News sentiment
  'sentiment': ['positive', 'neutral', 'negative'],

  // Currency codes
  'currency': ['USD', 'GBP', 'EUR', 'CHF', 'JPY', 'CAD', 'AUD'],

  // Growth prospect status
  'prospect_status': ['new', 'contacted', 'qualified', 'converted', 'rejected'],

  // Entity types (for audit/activity tracking)
  'entity_type': ['deal', 'investor', 'company', 'transaction', 'document', 'user'],

  // Action types (for audit trail)
  'action_type': ['create', 'update', 'delete', 'view', 'download', 'approve', 'reject'],

  // Event types (for portfolio events)
  'event_type': [
    'capital_call',
    'distribution',
    'valuation_update',
    'exit',
    'investment',
    'fee_payment',
    'document_signed',
    'kyc_update',
    'status_change'
  ]
};