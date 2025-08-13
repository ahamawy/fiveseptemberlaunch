/**
 * Audit and Compliance Tables
 * Audit trail, data quality, user activity tracking, and portfolio events
 */

export const AuditTables = {
  'audit_trail': {
    name: 'audit_trail',
    schema: 'public',
    columns: {
      id: 'uuid NOT NULL DEFAULT gen_random_uuid()',
      table_name: 'text NOT NULL',
      record_id: 'text NOT NULL',
      action: 'text NOT NULL',
      old_values: 'jsonb',
      new_values: 'jsonb',
      changed_fields: 'ARRAY',
      changed_by: 'uuid',
      changed_at: 'timestamp with time zone DEFAULT now()',
      ip_address: 'inet',
      user_agent: 'text',
      session_id: 'text',
      business_context: 'jsonb'
    },
    primaryKey: 'id',
    foreignKeys: [
      { column: 'changed_by', references: 'auth.users(id)' }
    ]
  },

  'data_quality_log': {
    name: 'data_quality_log',
    schema: 'public',
    columns: {
      id: 'uuid NOT NULL DEFAULT gen_random_uuid()',
      check_type: 'text NOT NULL',
      table_name: 'text NOT NULL',
      check_name: 'text NOT NULL',
      issues_found: 'integer DEFAULT 0',
      total_records: 'integer DEFAULT 0',
      validation_results: 'jsonb DEFAULT {}',
      severity: 'text DEFAULT info',
      checked_at: 'timestamp with time zone DEFAULT now()',
      resolved_at: 'timestamp with time zone',
      resolved_by: 'uuid',
      status: 'text DEFAULT open'
    },
    primaryKey: 'id',
    foreignKeys: [
      { column: 'resolved_by', references: 'auth.users(id)' }
    ]
  },

  'user_activity_log': {
    name: 'user_activity_log',
    schema: 'public',
    columns: {
      id: 'uuid NOT NULL DEFAULT gen_random_uuid()',
      user_id: 'uuid',
      activity_type: 'text NOT NULL',
      resource_type: 'text',
      resource_id: 'text',
      details: 'jsonb DEFAULT {}',
      timestamp: 'timestamp with time zone DEFAULT now()',
      ip_address: 'inet',
      user_agent: 'text',
      session_duration: 'interval',
      success: 'boolean DEFAULT true',
      error_message: 'text'
    },
    primaryKey: 'id',
    foreignKeys: [
      { column: 'user_id', references: 'auth.users(id)' }
    ]
  },

  'portfolio_events': {
    name: 'portfolio_events',
    schema: 'public',
    columns: {
      id: 'bigint NOT NULL DEFAULT nextval(portfolio_events_id_seq)',
      event_type: 'text NOT NULL',
      entity_type: 'text NOT NULL',
      entity_id: 'bigint NOT NULL',
      event_data: 'jsonb NOT NULL DEFAULT {}',
      old_values: 'jsonb',
      new_values: 'jsonb',
      created_at: 'timestamp with time zone DEFAULT now()',
      created_by: 'uuid',
      processed: 'boolean DEFAULT false',
      processed_at: 'timestamp with time zone'
    },
    primaryKey: 'id',
    foreignKeys: [
      { column: 'created_by', references: 'auth.users(id)' }
    ]
  },

  'user_profiles': {
    name: 'user_profiles',
    schema: 'public',
    columns: {
      id: 'uuid NOT NULL',
      email: 'text NOT NULL',
      role: 'USER-DEFINED NOT NULL DEFAULT viewer',
      full_name: 'text',
      company_id: 'integer',
      investor_id: 'integer',
      permissions: 'jsonb DEFAULT {}',
      created_at: 'timestamp with time zone DEFAULT now()',
      updated_at: 'timestamp with time zone DEFAULT now()',
      last_login: 'timestamp with time zone',
      is_active: 'boolean DEFAULT true',
      metadata: 'jsonb DEFAULT {}',
      user_id: 'uuid UNIQUE'
    },
    primaryKey: 'id',
    foreignKeys: [
      { column: 'company_id', references: 'companies.company(company_id)' },
      { column: 'investor_id', references: 'investors.investor(id)' },
      { column: 'id', references: 'auth.users(id)' }
    ]
  }
};