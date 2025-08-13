/**
 * Support Tables
 * SPVs, notifications, company assets, milestones, and other supporting data
 */

export const SupportTables = {
  'spvs': {
    name: 'spvs',
    schema: 'public',
    columns: {
      spv_name: 'text NOT NULL UNIQUE',
      legal_name: 'text',
      formation_date: 'date',
      jurisdiction: 'text',
      entity_type: 'text',
      linked_deal_id: 'integer',
      created_at: 'timestamp with time zone DEFAULT now()',
      updated_at: 'timestamp with time zone DEFAULT now()',
      company_id: 'integer'
    },
    primaryKey: 'spv_name',
    foreignKeys: [
      { column: 'company_id', references: 'companies.company(company_id)' },
      { column: 'linked_deal_id', references: 'deals.deal(deal_id)' }
    ]
  },

  'notifications': {
    name: 'notifications',
    schema: 'public',
    columns: {
      id: 'uuid NOT NULL DEFAULT gen_random_uuid()',
      title: 'character varying NOT NULL',
      message: 'text NOT NULL',
      type: 'character varying DEFAULT info CHECK (info|success|warning|error)',
      category: 'character varying DEFAULT system CHECK (investor|transaction|campaign|system|deal)',
      read: 'boolean DEFAULT false',
      created_at: 'timestamp with time zone DEFAULT now()',
      user_id: 'text NOT NULL',
      metadata: 'jsonb DEFAULT {}',
      expires_at: 'timestamp with time zone',
      priority: 'integer DEFAULT 1'
    },
    primaryKey: 'id',
    constraints: [
      { name: 'type_check', check: "type IN ('info', 'success', 'warning', 'error')" },
      { name: 'category_check', check: "category IN ('investor', 'transaction', 'campaign', 'system', 'deal')" }
    ]
  },

  'company_002_assets': {
    name: 'company_002_assets',
    schema: 'public',
    columns: {
      id: 'uuid NOT NULL DEFAULT gen_random_uuid()',
      company_id: 'integer',
      asset_type: 'text CHECK (logo|hero_image|gallery|screenshot|team_photo|office_image|video|document|background)',
      asset_name: 'text NOT NULL',
      bucket_name: 'text DEFAULT company-assets',
      file_path: 'text NOT NULL',
      file_url: 'text',
      mime_type: 'text',
      file_size: 'bigint',
      metadata: 'jsonb',
      order_index: 'integer DEFAULT 0',
      is_primary: 'boolean DEFAULT false',
      created_at: 'timestamp with time zone DEFAULT now()',
      updated_at: 'timestamp with time zone DEFAULT now()'
    },
    primaryKey: 'id',
    foreignKeys: [
      { column: 'company_id', references: 'companies.company(company_id)' }
    ],
    constraints: [
      { name: 'asset_type_check', check: "asset_type IN ('logo', 'hero_image', 'gallery', 'screenshot', 'team_photo', 'office_image', 'video', 'document', 'background')" }
    ]
  },

  'company_milestones': {
    name: 'company_milestones',
    schema: 'public',
    columns: {
      id: 'uuid NOT NULL DEFAULT gen_random_uuid()',
      company_id: 'uuid',
      title: 'text NOT NULL',
      description: 'text',
      date: 'date',
      order_index: 'integer DEFAULT 0',
      created_at: 'timestamp with time zone DEFAULT now()',
      updated_at: 'timestamp with time zone DEFAULT now()'
    },
    primaryKey: 'id',
    foreignKeys: [
      { column: 'company_id', references: 'companies(id)' }
    ]
  },

  'company_news': {
    name: 'company_news',
    schema: 'public',
    columns: {
      id: 'uuid NOT NULL DEFAULT gen_random_uuid()',
      company_id: 'uuid',
      title: 'text NOT NULL',
      summary: 'text',
      url: 'text',
      source: 'text',
      published_date: 'timestamp with time zone',
      sentiment: 'text CHECK (positive|neutral|negative)',
      created_at: 'timestamp with time zone DEFAULT now()',
      updated_at: 'timestamp with time zone DEFAULT now()'
    },
    primaryKey: 'id',
    foreignKeys: [
      { column: 'company_id', references: 'companies(id)' }
    ],
    constraints: [
      { name: 'sentiment_check', check: "sentiment IN ('positive', 'neutral', 'negative')" }
    ]
  },

  'company_stories': {
    name: 'company_stories',
    schema: 'public',
    columns: {
      id: 'uuid NOT NULL DEFAULT gen_random_uuid()',
      company_id: 'uuid',
      founding_story: 'text',
      mission_statement: 'text',
      unique_value_proposition: 'text',
      market_position: 'text',
      competitive_differentiation: 'text',
      growth_trajectory: 'text',
      future_vision: 'text',
      created_at: 'timestamp with time zone DEFAULT now()',
      updated_at: 'timestamp with time zone DEFAULT now()'
    },
    primaryKey: 'id',
    foreignKeys: [
      { column: 'company_id', references: 'companies(id)' }
    ]
  },

  'company_tags': {
    name: 'company_tags',
    schema: 'public',
    columns: {
      id: 'uuid NOT NULL DEFAULT gen_random_uuid()',
      company_id: 'uuid',
      tag: 'text NOT NULL',
      created_at: 'timestamp with time zone DEFAULT now()'
    },
    primaryKey: 'id',
    foreignKeys: [
      { column: 'company_id', references: 'companies(id)' }
    ]
  },

  'sheets_sync_jobs': {
    name: 'sheets_sync_jobs',
    schema: 'public',
    columns: {
      id: 'character varying NOT NULL',
      type: 'character varying NOT NULL CHECK (deals|transactions|investors|companies|analytics)',
      status: 'character varying NOT NULL DEFAULT pending CHECK (pending|running|completed|failed)',
      sheet_id: 'character varying NOT NULL',
      worksheet_name: 'character varying NOT NULL',
      data_range: 'character varying',
      bidirectional: 'boolean DEFAULT false',
      auto_refresh: 'boolean DEFAULT false',
      refresh_interval: 'integer',
      last_sync: 'timestamp with time zone',
      next_sync: 'timestamp with time zone',
      records_processed: 'integer DEFAULT 0',
      error_message: 'text',
      created_at: 'timestamp with time zone DEFAULT now()',
      updated_at: 'timestamp with time zone DEFAULT now()'
    },
    primaryKey: 'id',
    constraints: [
      { name: 'type_check', check: "type IN ('deals', 'transactions', 'investors', 'companies', 'analytics')" },
      { name: 'status_check', check: "status IN ('pending', 'running', 'completed', 'failed')" }
    ]
  },

  'finance_glossary': {
    name: 'finance_glossary',
    schema: 'public',
    columns: {
      term: 'text NOT NULL',
      type: 'text',
      formula: 'text',
      definition: 'text'
    },
    primaryKey: 'term'
  }
};