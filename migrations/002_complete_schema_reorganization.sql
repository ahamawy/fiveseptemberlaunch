-- Complete Schema Reorganization for Scalable Architecture
-- This migration creates a modular, scalable schema structure

-- ============================================
-- STEP 1: Create All Schemas
-- ============================================

CREATE SCHEMA IF NOT EXISTS core;        -- Core business entities
CREATE SCHEMA IF NOT EXISTS transactions; -- Transaction processing
CREATE SCHEMA IF NOT EXISTS portfolio;    -- Portfolio management (already exists)
CREATE SCHEMA IF NOT EXISTS formulas;     -- Formula engine
CREATE SCHEMA IF NOT EXISTS analytics;    -- Analytics & reporting (already exists)
CREATE SCHEMA IF NOT EXISTS projections;  -- Scenario modeling
CREATE SCHEMA IF NOT EXISTS documents;    -- Document management
CREATE SCHEMA IF NOT EXISTS audit;        -- Audit & compliance

-- ============================================
-- STEP 2: Move Existing Tables to Proper Schemas
-- ============================================

-- Core schema tables
ALTER TABLE companies_clean SET SCHEMA core;
ALTER TABLE investors_clean SET SCHEMA core;
ALTER TABLE deals_clean SET SCHEMA core;
ALTER TABLE user_profiles SET SCHEMA core;

-- Rename for consistency
ALTER TABLE core.companies_clean RENAME TO companies;
ALTER TABLE core.investors_clean RENAME TO investors;
ALTER TABLE core.deals_clean RENAME TO deals;
ALTER TABLE core.user_profiles RENAME TO users;

-- Transaction schema tables
ALTER TABLE transactions_clean SET SCHEMA transactions;
ALTER TABLE transactions.transactions_clean RENAME TO transactions;

-- Formula schema tables
ALTER TABLE formula_templates SET SCHEMA formulas;
ALTER TABLE formula_calculation_log SET SCHEMA formulas;
ALTER TABLE deal_formula_templates SET SCHEMA formulas;

-- Documents schema
ALTER TABLE documents SET SCHEMA documents;

-- Keep investor_units in portfolio schema for now
ALTER TABLE investor_units SET SCHEMA portfolio;

-- ============================================
-- STEP 3: Create Core Schema Tables
-- ============================================

-- User roles and permissions
CREATE TABLE IF NOT EXISTS core.role_permissions (
  role_id SERIAL PRIMARY KEY,
  role_name VARCHAR(50) UNIQUE NOT NULL,
  permissions JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Deal relationships
CREATE TABLE IF NOT EXISTS core.deal_relationships (
  relationship_id SERIAL PRIMARY KEY,
  parent_deal_id INTEGER REFERENCES core.deals(deal_id),
  child_deal_id INTEGER REFERENCES core.deals(deal_id),
  relationship_type VARCHAR(50), -- 'follow_on', 'related', 'syndicate'
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- STEP 4: Create Transaction Schema Tables
-- ============================================

-- Fee applications tracking
CREATE TABLE IF NOT EXISTS transactions.fee_applications (
  application_id SERIAL PRIMARY KEY,
  transaction_id INTEGER REFERENCES transactions.transactions(transaction_id),
  fee_type VARCHAR(50) NOT NULL,
  fee_amount DECIMAL(20, 2) NOT NULL,
  fee_rate DECIMAL(10, 4),
  calculation_basis VARCHAR(50),
  applied_at TIMESTAMP DEFAULT NOW(),
  formula_version VARCHAR(20)
);

-- Payment records
CREATE TABLE IF NOT EXISTS transactions.payment_records (
  payment_id SERIAL PRIMARY KEY,
  transaction_id INTEGER,
  investor_id INTEGER,
  payment_type VARCHAR(50),
  amount DECIMAL(20, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  payment_date DATE NOT NULL,
  payment_method VARCHAR(50),
  reference_number VARCHAR(100),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- STEP 5: Enhance Portfolio Schema
-- ============================================

-- Daily position snapshots for historical tracking
CREATE TABLE IF NOT EXISTS portfolio.position_snapshots (
  snapshot_id SERIAL PRIMARY KEY,
  snapshot_date DATE NOT NULL,
  investor_id INTEGER NOT NULL,
  deal_id INTEGER NOT NULL,
  token_amount DECIMAL(20, 4) NOT NULL,
  nav_per_token DECIMAL(20, 4) NOT NULL,
  position_value DECIMAL(20, 2) NOT NULL,
  cost_basis DECIMAL(20, 2) NOT NULL,
  unrealized_gain DECIMAL(20, 2),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(snapshot_date, investor_id, deal_id)
);

-- Valuation history
CREATE TABLE IF NOT EXISTS portfolio.valuations (
  valuation_id SERIAL PRIMARY KEY,
  deal_id INTEGER NOT NULL,
  valuation_date DATE NOT NULL,
  valuation_method VARCHAR(50), -- 'market', 'dcf', 'comparable', 'cost'
  gross_valuation DECIMAL(20, 2) NOT NULL,
  net_valuation DECIMAL(20, 2) NOT NULL,
  valuation_multiple DECIMAL(10, 4),
  notes TEXT,
  created_by VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(deal_id, valuation_date)
);

-- ============================================
-- STEP 6: Enhance Formulas Schema
-- ============================================

-- Formula variables registry
CREATE TABLE IF NOT EXISTS formulas.formula_variables (
  variable_id SERIAL PRIMARY KEY,
  variable_name VARCHAR(50) UNIQUE NOT NULL,
  variable_type VARCHAR(20), -- 'decimal', 'percentage', 'date', 'text'
  description TEXT,
  default_value TEXT,
  validation_rules JSONB
);

-- Formula versions for audit
CREATE TABLE IF NOT EXISTS formulas.formula_versions (
  version_id SERIAL PRIMARY KEY,
  template_id UUID REFERENCES formulas.formula_templates(id),
  version_number VARCHAR(20) NOT NULL,
  formula_definition JSONB NOT NULL,
  valid_from DATE NOT NULL,
  valid_to DATE,
  created_by VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- STEP 7: Enhance Analytics Schema
-- ============================================

-- Investor performance metrics
CREATE TABLE IF NOT EXISTS analytics.investor_metrics (
  metric_id SERIAL PRIMARY KEY,
  investor_id INTEGER NOT NULL,
  metric_date DATE NOT NULL,
  total_invested DECIMAL(20, 2),
  current_value DECIMAL(20, 2),
  realized_gains DECIMAL(20, 2),
  unrealized_gains DECIMAL(20, 2),
  total_fees_paid DECIMAL(20, 2),
  weighted_avg_irr DECIMAL(10, 4),
  portfolio_moic DECIMAL(10, 4),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(investor_id, metric_date)
);

-- Deal performance metrics
CREATE TABLE IF NOT EXISTS analytics.deal_performance (
  performance_id SERIAL PRIMARY KEY,
  deal_id INTEGER NOT NULL,
  metric_date DATE NOT NULL,
  total_raised DECIMAL(20, 2),
  current_valuation DECIMAL(20, 2),
  gross_moic DECIMAL(10, 4),
  net_moic DECIMAL(10, 4),
  gross_irr DECIMAL(10, 4),
  net_irr DECIMAL(10, 4),
  total_fees_collected DECIMAL(20, 2),
  investor_count INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(deal_id, metric_date)
);

-- Company KPIs
CREATE TABLE IF NOT EXISTS analytics.company_kpis (
  kpi_id SERIAL PRIMARY KEY,
  kpi_date DATE NOT NULL,
  total_aum DECIMAL(20, 2),
  total_investors INTEGER,
  total_deals INTEGER,
  active_deals INTEGER,
  ytd_revenue DECIMAL(20, 2),
  ytd_new_investors INTEGER,
  ytd_new_capital DECIMAL(20, 2),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(kpi_date)
);

-- ============================================
-- STEP 8: Create Projections Schema Tables
-- ============================================

-- Sensitivity analysis
CREATE TABLE IF NOT EXISTS projections.sensitivity_analysis (
  analysis_id SERIAL PRIMARY KEY,
  scenario_id INTEGER REFERENCES portfolio.exit_scenarios(scenario_id),
  variable_name VARCHAR(50),
  base_value DECIMAL(20, 4),
  test_value DECIMAL(20, 4),
  impact_on_returns DECIMAL(20, 2),
  impact_percentage DECIMAL(10, 4),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Return projections
CREATE TABLE IF NOT EXISTS projections.return_projections (
  projection_id SERIAL PRIMARY KEY,
  investor_id INTEGER,
  deal_id INTEGER,
  projection_date DATE NOT NULL,
  scenario_name VARCHAR(100),
  projected_exit_date DATE,
  projected_gross_return DECIMAL(20, 2),
  projected_fees DECIMAL(20, 2),
  projected_net_return DECIMAL(20, 2),
  projected_irr DECIMAL(10, 4),
  projected_moic DECIMAL(10, 4),
  confidence_level DECIMAL(5, 2), -- 0-100%
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- STEP 9: Enhance Documents Schema
-- ============================================

-- Document versions
CREATE TABLE IF NOT EXISTS documents.document_versions (
  version_id SERIAL PRIMARY KEY,
  document_id UUID REFERENCES documents.documents(id),
  version_number INTEGER NOT NULL,
  file_hash VARCHAR(64),
  file_size_bytes BIGINT,
  uploaded_by VARCHAR(100),
  uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Document access log
CREATE TABLE IF NOT EXISTS documents.access_log (
  access_id SERIAL PRIMARY KEY,
  document_id UUID,
  accessed_by VARCHAR(100),
  access_type VARCHAR(20), -- 'view', 'download', 'edit'
  ip_address INET,
  user_agent TEXT,
  accessed_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- STEP 10: Create Audit Schema Tables
-- ============================================

-- Data change tracking
CREATE TABLE IF NOT EXISTS audit.data_changes (
  change_id BIGSERIAL PRIMARY KEY,
  table_schema VARCHAR(50) NOT NULL,
  table_name VARCHAR(50) NOT NULL,
  record_id TEXT NOT NULL,
  operation VARCHAR(10) NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
  old_values JSONB,
  new_values JSONB,
  changed_by VARCHAR(100),
  changed_at TIMESTAMP DEFAULT NOW()
);

-- User activity log
CREATE TABLE IF NOT EXISTS audit.user_actions (
  action_id BIGSERIAL PRIMARY KEY,
  user_id UUID,
  action_type VARCHAR(100),
  action_details JSONB,
  ip_address INET,
  user_agent TEXT,
  session_id VARCHAR(100),
  performed_at TIMESTAMP DEFAULT NOW()
);

-- System events
CREATE TABLE IF NOT EXISTS audit.system_events (
  event_id BIGSERIAL PRIMARY KEY,
  event_type VARCHAR(100),
  event_source VARCHAR(100),
  event_data JSONB,
  severity VARCHAR(20), -- 'info', 'warning', 'error', 'critical'
  occurred_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- STEP 11: Create Cross-Schema Views
-- ============================================

-- Comprehensive investor view
CREATE OR REPLACE VIEW portfolio.investor_dashboard AS
SELECT 
  i.investor_id,
  i.full_name,
  COALESCE(p.deal_count, 0) as total_deals,
  COALESCE(p.total_invested, 0) as total_invested,
  COALESCE(p.current_value, 0) as current_portfolio_value,
  COALESCE(p.total_unrealized_gain, 0) as unrealized_gains,
  COALESCE(m.realized_gains, 0) as realized_gains,
  COALESCE(p.avg_moic, 0) as average_moic,
  COALESCE(p.avg_irr, 0) as average_irr
FROM core.investors i
LEFT JOIN portfolio.investor_portfolio_summary p ON i.investor_id = p.investor_id
LEFT JOIN (
  SELECT investor_id, MAX(realized_gains) as realized_gains
  FROM analytics.investor_metrics
  WHERE metric_date = CURRENT_DATE
  GROUP BY investor_id
) m ON i.investor_id = m.investor_id;

-- Deal overview
CREATE OR REPLACE VIEW analytics.deal_overview AS
SELECT 
  d.deal_id,
  d.deal_name,
  c.company_name,
  d.deal_status,
  COUNT(DISTINCT t.investor_id) as investor_count,
  SUM(t.gross_capital) as total_raised,
  dt.nav_per_token * dt.total_supply as current_valuation,
  CASE 
    WHEN SUM(t.gross_capital) > 0 THEN 
      (dt.nav_per_token * dt.total_supply) / SUM(t.gross_capital)
    ELSE 0 
  END as current_moic
FROM core.deals d
LEFT JOIN core.companies c ON d.underlying_company_id = c.company_id
LEFT JOIN transactions.transactions t ON d.deal_id = t.deal_id
LEFT JOIN portfolio.deal_tokens dt ON d.deal_id = dt.deal_id
GROUP BY d.deal_id, d.deal_name, c.company_name, d.deal_status, dt.nav_per_token, dt.total_supply;

-- ============================================
-- STEP 12: Create Indexes for Performance
-- ============================================

-- Core schema indexes
CREATE INDEX idx_deals_status ON core.deals(deal_status);
CREATE INDEX idx_deals_date ON core.deals(deal_date);
CREATE INDEX idx_investors_type ON core.investors(investor_type);

-- Transaction schema indexes
CREATE INDEX idx_transactions_date ON transactions.transactions(transaction_date);
CREATE INDEX idx_transactions_investor_deal ON transactions.transactions(investor_id, deal_id);
CREATE INDEX idx_fee_applications_transaction ON transactions.fee_applications(transaction_id);

-- Portfolio schema indexes (some already exist)
CREATE INDEX IF NOT EXISTS idx_position_snapshots_date ON portfolio.position_snapshots(snapshot_date);
CREATE INDEX IF NOT EXISTS idx_valuations_deal_date ON portfolio.valuations(deal_id, valuation_date);

-- Analytics schema indexes
CREATE INDEX idx_investor_metrics_date ON analytics.investor_metrics(metric_date);
CREATE INDEX idx_deal_performance_date ON analytics.deal_performance(metric_date);

-- Audit schema indexes
CREATE INDEX idx_audit_changes_timestamp ON audit.data_changes(changed_at);
CREATE INDEX idx_audit_changes_table ON audit.data_changes(table_schema, table_name);

-- ============================================
-- STEP 13: Set Up Permissions
-- ============================================

-- Grant usage on all schemas
GRANT USAGE ON SCHEMA core TO anon, authenticated;
GRANT USAGE ON SCHEMA transactions TO anon, authenticated;
GRANT USAGE ON SCHEMA portfolio TO anon, authenticated;
GRANT USAGE ON SCHEMA formulas TO anon, authenticated;
GRANT USAGE ON SCHEMA analytics TO anon, authenticated;
GRANT USAGE ON SCHEMA projections TO anon, authenticated;
GRANT USAGE ON SCHEMA documents TO anon, authenticated;
GRANT USAGE ON SCHEMA audit TO authenticated; -- More restricted

-- Grant appropriate permissions per schema
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA core TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA core TO anon;

GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA transactions TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA transactions TO anon;

GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA portfolio TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA portfolio TO anon;

GRANT SELECT ON ALL TABLES IN SCHEMA analytics TO anon, authenticated;
GRANT INSERT ON ALL TABLES IN SCHEMA analytics TO authenticated;

-- Audit is append-only
GRANT INSERT ON ALL TABLES IN SCHEMA audit TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA audit TO authenticated;

-- ============================================
-- STEP 14: Create Helper Functions
-- ============================================

-- Function to get schema size
CREATE OR REPLACE FUNCTION analytics.get_schema_sizes()
RETURNS TABLE(
  schema_name TEXT,
  size_pretty TEXT,
  table_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    n.nspname::TEXT as schema_name,
    pg_size_pretty(SUM(pg_total_relation_size(c.oid))) as size_pretty,
    COUNT(DISTINCT c.oid)::BIGINT as table_count
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname IN ('core', 'transactions', 'portfolio', 'formulas', 'analytics', 'projections', 'documents', 'audit')
  GROUP BY n.nspname
  ORDER BY SUM(pg_total_relation_size(c.oid)) DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- STEP 15: Update Foreign Key References
-- ============================================

-- Update foreign keys to reference new schema locations
ALTER TABLE portfolio.deal_tokens 
  DROP CONSTRAINT IF EXISTS deal_tokens_deal_id_fkey,
  ADD CONSTRAINT deal_tokens_deal_id_fkey 
  FOREIGN KEY (deal_id) REFERENCES core.deals(deal_id);

ALTER TABLE portfolio.investor_token_positions
  DROP CONSTRAINT IF EXISTS investor_token_positions_deal_id_fkey,
  ADD CONSTRAINT investor_token_positions_deal_id_fkey 
  FOREIGN KEY (deal_id) REFERENCES core.deals(deal_id);

ALTER TABLE transactions.transactions
  DROP CONSTRAINT IF EXISTS fk_transactions_deal,
  ADD CONSTRAINT fk_transactions_deal 
  FOREIGN KEY (deal_id) REFERENCES core.deals(deal_id);

ALTER TABLE transactions.transactions
  DROP CONSTRAINT IF EXISTS fk_transactions_investor,
  ADD CONSTRAINT fk_transactions_investor 
  FOREIGN KEY (investor_id) REFERENCES core.investors(investor_id);

-- ============================================
-- DONE: Schema reorganization complete
-- ============================================

-- Return summary of new structure
SELECT 
  'Schema reorganization complete' as status,
  COUNT(DISTINCT nspname) as schema_count,
  COUNT(*) as total_tables
FROM pg_tables
WHERE schemaname IN ('core', 'transactions', 'portfolio', 'formulas', 'analytics', 'projections', 'documents', 'audit');