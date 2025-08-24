-- Feature 15.1.1: Investor Portal Dashboard
-- Minimum required tables and columns for dashboard functionality

-- Core Tables Used by Dashboard

-- 1. investors table
-- Required columns: id, name, email, type, created_at
CREATE TABLE IF NOT EXISTS investors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  type VARCHAR(50), -- 'individual', 'institutional'
  kyc_status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. deals table  
-- Required columns: id, name, stage, type, moic, irr, status
CREATE TABLE IF NOT EXISTS deals (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  stage VARCHAR(50), -- 'seed', 'series_a', 'series_b', etc
  type VARCHAR(50), -- 'primary', 'secondary'
  status VARCHAR(50) DEFAULT 'active',
  target_raise DECIMAL(15,2),
  minimum_investment DECIMAL(15,2),
  moic DECIMAL(5,2), -- Multiple on Invested Capital
  irr DECIMAL(5,2), -- Internal Rate of Return
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. commitments table
-- Links investors to deals with commitment amounts
CREATE TABLE IF NOT EXISTS commitments (
  id SERIAL PRIMARY KEY,
  investor_id INT REFERENCES investors(id),
  deal_id INT REFERENCES deals(id),
  amount DECIMAL(15,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'signed', 'funded'
  signed_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. transactions table
-- Records all money movements
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  investor_id INT REFERENCES investors(id),
  deal_id INT REFERENCES deals(id),
  type VARCHAR(50) NOT NULL, -- 'capital_call', 'distribution', 'management_fee'
  amount DECIMAL(15,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'completed', 'failed'
  transaction_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. investor_analytics view/table
-- Pre-computed metrics for dashboard performance
CREATE TABLE IF NOT EXISTS investor_analytics (
  investor_id INT PRIMARY KEY REFERENCES investors(id),
  total_invested DECIMAL(15,2) DEFAULT 0,
  current_portfolio_value DECIMAL(15,2) DEFAULT 0,
  portfolio_irr DECIMAL(5,2) DEFAULT 0,
  portfolio_moic DECIMAL(5,2) DEFAULT 0,
  number_of_investments INT DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- 6. deal_valuations table
-- Track deal performance over time
CREATE TABLE IF NOT EXISTS deal_valuations (
  id SERIAL PRIMARY KEY,
  deal_id INT REFERENCES deals(id),
  valuation_date DATE NOT NULL,
  total_value DECIMAL(15,2) NOT NULL,
  moic DECIMAL(5,2),
  irr DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_commitments_investor ON commitments(investor_id);
CREATE INDEX idx_commitments_deal ON commitments(deal_id);
CREATE INDEX idx_transactions_investor ON transactions(investor_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date DESC);
CREATE INDEX idx_deal_valuations_deal ON deal_valuations(deal_id);

-- Sample query for dashboard summary
/*
SELECT 
  ia.total_invested,
  ia.current_portfolio_value,
  ia.portfolio_irr,
  ia.portfolio_moic,
  ia.number_of_investments,
  (
    SELECT COUNT(*) 
    FROM commitments 
    WHERE investor_id = $1 AND status = 'signed'
  ) as active_deals,
  (
    SELECT SUM(amount) 
    FROM transactions 
    WHERE investor_id = $1 AND type = 'capital_call' AND status = 'completed'
  ) as total_called,
  (
    SELECT SUM(amount) 
    FROM transactions 
    WHERE investor_id = $1 AND type = 'distribution' AND status = 'completed'
  ) as total_distributed
FROM investor_analytics ia
WHERE ia.investor_id = $1;
*/