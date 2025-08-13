/**
 * Analytics and Reporting Tables
 * Portfolio analytics, investor analytics, metrics, and performance tracking
 */

export const AnalyticsTables = {
  'portfolio_analytics': {
    name: 'portfolio_analytics',
    schema: 'public',
    columns: {
      id: 'integer NOT NULL DEFAULT nextval(portfolio_analytics_id_seq)',
      calculation_date: 'date NOT NULL DEFAULT CURRENT_DATE',
      total_aum: 'numeric DEFAULT 0',
      total_portfolio_value: 'numeric DEFAULT 0',
      active_deals_count: 'integer DEFAULT 0',
      total_investors_count: 'integer DEFAULT 0',
      average_moic: 'numeric DEFAULT 0',
      total_realized_gains: 'numeric DEFAULT 0',
      total_unrealized_gains: 'numeric DEFAULT 0',
      irr_portfolio: 'numeric DEFAULT 0',
      success_rate_percentage: 'numeric DEFAULT 0',
      geographic_diversification_score: 'numeric DEFAULT 0',
      sector_diversification_score: 'numeric DEFAULT 0',
      created_at: 'timestamp with time zone DEFAULT now()',
      updated_at: 'timestamp with time zone DEFAULT now()'
    },
    primaryKey: 'id',
    foreignKeys: []
  },

  'investor_analytics': {
    name: 'investor_analytics',
    schema: 'public',
    columns: {
      id: 'integer NOT NULL DEFAULT nextval(investor_analytics_id_seq)',
      investor_id: 'integer NOT NULL',
      calculation_date: 'date NOT NULL DEFAULT CURRENT_DATE',
      total_committed: 'numeric DEFAULT 0',
      total_invested: 'numeric DEFAULT 0',
      current_portfolio_value: 'numeric DEFAULT 0',
      realized_returns: 'numeric DEFAULT 0',
      unrealized_returns: 'numeric DEFAULT 0',
      portfolio_irr: 'numeric DEFAULT 0',
      number_of_investments: 'integer DEFAULT 0',
      average_investment_size: 'numeric DEFAULT 0',
      investment_diversification_score: 'numeric DEFAULT 0',
      risk_profile_score: 'numeric DEFAULT 0',
      created_at: 'timestamp with time zone DEFAULT now()',
      updated_at: 'timestamp with time zone DEFAULT now()'
    },
    primaryKey: 'id',
    foreignKeys: [
      { column: 'investor_id', references: 'investors.investor(id)' }
    ]
  },

  'real_time_metrics': {
    name: 'real_time_metrics',
    schema: 'public',
    columns: {
      id: 'bigint NOT NULL DEFAULT nextval(real_time_metrics_id_seq)',
      metric_type: 'text NOT NULL UNIQUE',
      current_value: 'numeric',
      previous_value: 'numeric',
      change_amount: 'numeric',
      change_percentage: 'numeric',
      last_updated: 'timestamp with time zone DEFAULT now()',
      calculation_metadata: 'jsonb DEFAULT {}'
    },
    primaryKey: 'id',
    foreignKeys: []
  },

  'historical_metrics': {
    name: 'historical_metrics',
    schema: 'public',
    columns: {
      id: 'integer NOT NULL DEFAULT nextval(historical_metrics_id_seq)',
      year: 'integer NOT NULL',
      month: 'integer',
      total_aum: 'numeric',
      portfolio_value: 'numeric',
      growth_rate: 'numeric',
      created_at: 'timestamp with time zone DEFAULT now()'
    },
    primaryKey: 'id',
    foreignKeys: []
  },

  'deal_valuations': {
    name: 'deal_valuations',
    schema: 'public',
    columns: {
      id: 'integer NOT NULL DEFAULT nextval(deal_valuations_id_seq)',
      deal_id: 'integer NOT NULL',
      valuation_date: 'date NOT NULL',
      units_held: 'numeric',
      unit_value: 'numeric',
      total_value: 'numeric',
      moic: 'numeric',
      irr: 'numeric',
      data_source: 'character varying',
      notes: 'text',
      created_at: 'timestamp with time zone DEFAULT now()',
      updated_at: 'timestamp with time zone DEFAULT now()'
    },
    primaryKey: 'id',
    foreignKeys: [
      { column: 'deal_id', references: 'deals.deal(deal_id)' }
    ]
  },

  'deal_recommendations': {
    name: 'deal_recommendations',
    schema: 'public',
    columns: {
      id: 'integer NOT NULL DEFAULT nextval(deal_recommendations_id_seq)',
      investor_id: 'integer NOT NULL',
      deal_id: 'integer NOT NULL',
      score: 'numeric NOT NULL CHECK (score >= 0 AND score <= 100)',
      match_reasons: 'ARRAY',
      recommendation_type: 'text CHECK (auto|advisor|peer_activity)',
      status: 'text DEFAULT active CHECK (active|viewed|dismissed|invested)',
      created_at: 'timestamp with time zone DEFAULT now()',
      viewed_at: 'timestamp with time zone',
      dismissed_at: 'timestamp with time zone'
    },
    primaryKey: 'id',
    foreignKeys: [
      { column: 'investor_id', references: 'investors.investor(id)' },
      { column: 'deal_id', references: 'deals.deal(deal_id)' }
    ],
    constraints: [
      { name: 'score_range_check', check: 'score >= 0 AND score <= 100' },
      { name: 'recommendation_type_check', check: "recommendation_type IN ('auto', 'advisor', 'peer_activity')" },
      { name: 'status_check', check: "status IN ('active', 'viewed', 'dismissed', 'invested')" }
    ]
  },

  'investor_activity': {
    name: 'investor_activity',
    schema: 'public',
    columns: {
      id: 'integer NOT NULL DEFAULT nextval(investor_activity_id_seq)',
      investor_id: 'integer NOT NULL',
      action: 'text NOT NULL',
      entity_type: 'text NOT NULL',
      entity_id: 'integer',
      metadata: 'jsonb DEFAULT {}',
      timestamp: 'timestamp with time zone DEFAULT now()'
    },
    primaryKey: 'id',
    foreignKeys: [
      { column: 'investor_id', references: 'investors.investor(id)' }
    ]
  },

  'investor_patterns': {
    name: 'investor_patterns',
    schema: 'public',
    columns: {
      id: 'integer NOT NULL DEFAULT nextval(investor_patterns_id_seq)',
      pattern_name: 'character varying NOT NULL',
      pattern_description: 'text',
      success_rate: 'numeric',
      total_attempts: 'integer DEFAULT 0',
      successful_attempts: 'integer DEFAULT 0',
      pattern_query: 'text',
      discovery_date: 'timestamp with time zone DEFAULT now()',
      last_used: 'timestamp with time zone',
      is_active: 'boolean DEFAULT true'
    },
    primaryKey: 'id',
    foreignKeys: []
  }
};