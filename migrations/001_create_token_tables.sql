-- Token tracking for deal tokenization
-- Enables portfolio management, fee analytics, and investor statements

-- Token representation of deal positions
CREATE TABLE IF NOT EXISTS deal_tokens (
  token_id SERIAL PRIMARY KEY,
  deal_id INTEGER NOT NULL REFERENCES deals_clean(deal_id),
  token_symbol VARCHAR(10) NOT NULL,
  total_supply DECIMAL(20, 4) NOT NULL,
  tokens_outstanding DECIMAL(20, 4) NOT NULL,
  nav_per_token DECIMAL(20, 4) NOT NULL DEFAULT 1.0,
  last_nav_update TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(deal_id),
  UNIQUE(token_symbol)
);

-- Investor token holdings (positions)
CREATE TABLE IF NOT EXISTS investor_token_positions (
  position_id SERIAL PRIMARY KEY,
  investor_id INTEGER NOT NULL,
  deal_id INTEGER NOT NULL REFERENCES deals_clean(deal_id),
  token_amount DECIMAL(20, 4) NOT NULL,
  cost_basis DECIMAL(20, 2) NOT NULL, -- Total invested amount
  average_price DECIMAL(20, 4) NOT NULL, -- Average token acquisition price
  current_value DECIMAL(20, 2),
  unrealized_gain_loss DECIMAL(20, 2),
  last_updated TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(investor_id, deal_id),
  FOREIGN KEY (deal_id) REFERENCES deal_tokens(deal_id)
);

-- Token transaction history
CREATE TABLE IF NOT EXISTS token_transactions (
  transaction_id SERIAL PRIMARY KEY,
  investor_id INTEGER NOT NULL,
  deal_id INTEGER NOT NULL REFERENCES deals_clean(deal_id),
  transaction_type VARCHAR(20) NOT NULL, -- 'mint', 'transfer', 'burn'
  token_amount DECIMAL(20, 4) NOT NULL,
  token_price DECIMAL(20, 4) NOT NULL,
  total_value DECIMAL(20, 2) NOT NULL,
  from_investor_id INTEGER,
  to_investor_id INTEGER,
  transaction_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Exit scenario projections
CREATE TABLE IF NOT EXISTS exit_scenarios (
  scenario_id SERIAL PRIMARY KEY,
  deal_id INTEGER NOT NULL REFERENCES deals_clean(deal_id),
  scenario_name VARCHAR(100) NOT NULL,
  exit_multiple DECIMAL(5, 2) NOT NULL, -- 2x, 3x, 5x, etc.
  exit_year INTEGER NOT NULL,
  gross_exit_value DECIMAL(20, 2) NOT NULL,
  total_fees DECIMAL(20, 2) NOT NULL,
  net_exit_value DECIMAL(20, 2) NOT NULL,
  irr DECIMAL(10, 4),
  moic DECIMAL(10, 4),
  created_at TIMESTAMP DEFAULT NOW(),
  created_by VARCHAR(100)
);

-- Fee projections for scenarios
CREATE TABLE IF NOT EXISTS scenario_fee_projections (
  projection_id SERIAL PRIMARY KEY,
  scenario_id INTEGER NOT NULL REFERENCES exit_scenarios(scenario_id),
  fee_type VARCHAR(50) NOT NULL, -- 'management', 'performance', 'structuring', 'admin'
  fee_amount DECIMAL(20, 2) NOT NULL,
  fee_percentage DECIMAL(10, 4),
  calculation_basis VARCHAR(20), -- 'gross_capital', 'net_capital', 'profit'
  notes TEXT
);

-- Company AUM tracking
CREATE TABLE IF NOT EXISTS aum_snapshots (
  snapshot_id SERIAL PRIMARY KEY,
  snapshot_date DATE NOT NULL,
  total_aum DECIMAL(20, 2) NOT NULL,
  deal_count INTEGER NOT NULL,
  investor_count INTEGER NOT NULL,
  total_invested DECIMAL(20, 2) NOT NULL,
  total_current_value DECIMAL(20, 2) NOT NULL,
  unrealized_gain_loss DECIMAL(20, 2),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(snapshot_date)
);

-- Fee revenue tracking
CREATE TABLE IF NOT EXISTS fee_revenue (
  revenue_id SERIAL PRIMARY KEY,
  deal_id INTEGER REFERENCES deals_clean(deal_id),
  investor_id INTEGER,
  fee_type VARCHAR(50) NOT NULL,
  fee_amount DECIMAL(20, 2) NOT NULL,
  fee_status VARCHAR(20) NOT NULL, -- 'earned', 'projected', 'collected'
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  collection_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_token_positions_investor ON investor_token_positions(investor_id);
CREATE INDEX idx_token_positions_deal ON investor_token_positions(deal_id);
CREATE INDEX idx_token_transactions_date ON token_transactions(transaction_date);
CREATE INDEX idx_exit_scenarios_deal ON exit_scenarios(deal_id);
CREATE INDEX idx_fee_revenue_period ON fee_revenue(period_start, period_end);
CREATE INDEX idx_fee_revenue_status ON fee_revenue(fee_status);

-- Add comments for documentation
COMMENT ON TABLE deal_tokens IS 'Token representation of deal positions for portfolio management';
COMMENT ON TABLE investor_token_positions IS 'Current token holdings per investor per deal';
COMMENT ON TABLE exit_scenarios IS 'Projected exit scenarios for modeling returns and fees';
COMMENT ON TABLE aum_snapshots IS 'Daily snapshots of assets under management';
COMMENT ON TABLE fee_revenue IS 'Actual and projected fee revenue tracking';

-- Initialize tokens for existing deals
INSERT INTO deal_tokens (deal_id, token_symbol, total_supply, tokens_outstanding, nav_per_token)
SELECT 
  deal_id,
  UPPER(LEFT(REGEXP_REPLACE(deal_name, '[^a-zA-Z0-9]', '', 'g'), 6)) || deal_id::TEXT AS token_symbol,
  COALESCE(SUM(t.gross_capital), 0) AS total_supply,
  COALESCE(SUM(t.gross_capital), 0) AS tokens_outstanding,
  1.0 AS nav_per_token
FROM deals_clean d
LEFT JOIN transactions_clean t ON d.deal_id = t.deal_id AND t.transaction_type = 'primary'
GROUP BY d.deal_id, d.deal_name
ON CONFLICT (deal_id) DO NOTHING;

-- Initialize investor positions from existing transactions
INSERT INTO investor_token_positions (investor_id, deal_id, token_amount, cost_basis, average_price, current_value)
SELECT 
  investor_id,
  deal_id,
  SUM(gross_capital) AS token_amount, -- 1:1 initially
  SUM(gross_capital) AS cost_basis,
  1.0 AS average_price,
  SUM(gross_capital) AS current_value
FROM transactions_clean
WHERE transaction_type = 'primary'
GROUP BY investor_id, deal_id
ON CONFLICT (investor_id, deal_id) DO NOTHING;