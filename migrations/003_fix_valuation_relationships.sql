-- Fix Complex Company-Deal-Valuation Relationships
-- This migration properly handles many-to-many relationships and valuation tracking

-- ============================================
-- STEP 1: Company Valuation Tracking
-- ============================================

-- Track company share prices over time
CREATE TABLE IF NOT EXISTS portfolio.company_valuations (
  valuation_id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL,
  valuation_date DATE NOT NULL,
  share_price DECIMAL(20, 4) NOT NULL,
  total_shares_outstanding DECIMAL(20, 4),
  pre_money_valuation DECIMAL(20, 2),
  post_money_valuation DECIMAL(20, 2),
  valuation_method VARCHAR(50), -- 'market', 'dcf', 'comparable', 'cost', '409a'
  valuation_source VARCHAR(100), -- 'funding_round', 'quarterly_mark', 'exit', 'ipo'
  confidence_level DECIMAL(5, 2), -- 0-100% confidence in valuation
  notes TEXT,
  created_by VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(company_id, valuation_date)
);

-- Index for performance
CREATE INDEX idx_company_valuations_date ON portfolio.company_valuations(valuation_date DESC);
CREATE INDEX idx_company_valuations_company ON portfolio.company_valuations(company_id);

-- ============================================
-- STEP 2: Deal-Company Many-to-Many Relationship
-- ============================================

-- Tracks which companies each deal has invested in
CREATE TABLE IF NOT EXISTS portfolio.deal_company_positions (
  position_id SERIAL PRIMARY KEY,
  deal_id INTEGER NOT NULL,
  company_id INTEGER NOT NULL,
  -- Investment details
  shares_owned DECIMAL(20, 4) NOT NULL,
  share_class VARCHAR(50), -- 'common', 'preferred_a', 'preferred_b', etc.
  purchase_price_per_share DECIMAL(20, 4) NOT NULL,
  purchase_date DATE NOT NULL,
  cost_basis DECIMAL(20, 2) NOT NULL,
  -- Ownership tracking
  ownership_percentage DECIMAL(10, 6), -- As decimal (0.05 = 5%)
  diluted_ownership DECIMAL(10, 6), -- After all conversions
  -- Valuation
  current_share_price DECIMAL(20, 4),
  current_value DECIMAL(20, 2),
  unrealized_gain DECIMAL(20, 2),
  -- Rights and preferences
  liquidation_preference DECIMAL(10, 4), -- 1x, 1.5x, 2x
  participation_cap DECIMAL(10, 4), -- Cap on participation
  has_pro_rata_rights BOOLEAN DEFAULT FALSE,
  has_information_rights BOOLEAN DEFAULT FALSE,
  -- Metadata
  position_status VARCHAR(20) DEFAULT 'active', -- 'active', 'exited', 'written_off'
  exit_date DATE,
  exit_price_per_share DECIMAL(20, 4),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(deal_id, company_id, share_class)
);

-- Indexes for performance
CREATE INDEX idx_deal_company_positions_deal ON portfolio.deal_company_positions(deal_id);
CREATE INDEX idx_deal_company_positions_company ON portfolio.deal_company_positions(company_id);
CREATE INDEX idx_deal_company_positions_status ON portfolio.deal_company_positions(position_status);

-- ============================================
-- STEP 3: Token NAV Calculation Infrastructure
-- ============================================

-- Function to get latest company valuation
CREATE OR REPLACE FUNCTION portfolio.get_latest_company_valuation(p_company_id INTEGER)
RETURNS DECIMAL AS $$
DECLARE
  v_share_price DECIMAL;
BEGIN
  SELECT share_price INTO v_share_price
  FROM portfolio.company_valuations
  WHERE company_id = p_company_id
  ORDER BY valuation_date DESC
  LIMIT 1;
  
  RETURN COALESCE(v_share_price, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to calculate deal's total value from all company positions
CREATE OR REPLACE FUNCTION portfolio.calculate_deal_portfolio_value(p_deal_id INTEGER)
RETURNS DECIMAL AS $$
DECLARE
  v_total_value DECIMAL;
BEGIN
  SELECT SUM(
    shares_owned * portfolio.get_latest_company_valuation(company_id)
  ) INTO v_total_value
  FROM portfolio.deal_company_positions
  WHERE deal_id = p_deal_id
  AND position_status = 'active';
  
  RETURN COALESCE(v_total_value, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to calculate token NAV based on underlying company values
CREATE OR REPLACE FUNCTION portfolio.calculate_token_nav(p_deal_id INTEGER)
RETURNS DECIMAL AS $$
DECLARE
  v_portfolio_value DECIMAL;
  v_total_supply DECIMAL;
  v_nav_per_token DECIMAL;
BEGIN
  -- Get total portfolio value
  v_portfolio_value := portfolio.calculate_deal_portfolio_value(p_deal_id);
  
  -- Get total token supply
  SELECT total_supply INTO v_total_supply
  FROM portfolio.deal_tokens
  WHERE deal_id = p_deal_id;
  
  -- Calculate NAV per token
  IF v_total_supply > 0 THEN
    v_nav_per_token := v_portfolio_value / v_total_supply;
  ELSE
    v_nav_per_token := 0;
  END IF;
  
  -- Update the deal_tokens table with new NAV
  UPDATE portfolio.deal_tokens
  SET nav_per_token = v_nav_per_token,
      last_nav_update = NOW()
  WHERE deal_id = p_deal_id;
  
  RETURN v_nav_per_token;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- STEP 4: Valuation History & Audit
-- ============================================

-- Track all NAV changes for audit
CREATE TABLE IF NOT EXISTS portfolio.nav_history (
  history_id SERIAL PRIMARY KEY,
  deal_id INTEGER NOT NULL,
  calculation_date DATE NOT NULL,
  nav_per_token DECIMAL(20, 4) NOT NULL,
  total_portfolio_value DECIMAL(20, 2),
  total_token_supply DECIMAL(20, 4),
  calculation_method VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(deal_id, calculation_date)
);

-- Track company position changes
CREATE TABLE IF NOT EXISTS portfolio.position_changes (
  change_id SERIAL PRIMARY KEY,
  position_id INTEGER REFERENCES portfolio.deal_company_positions(position_id),
  change_type VARCHAR(50), -- 'purchase', 'sale', 'dilution', 'revaluation'
  change_date DATE NOT NULL,
  shares_before DECIMAL(20, 4),
  shares_after DECIMAL(20, 4),
  price_per_share DECIMAL(20, 4),
  total_value DECIMAL(20, 2),
  notes TEXT,
  created_by VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- STEP 5: Update Deal Tokens Table
-- ============================================

-- Add fields to track NAV calculation
ALTER TABLE portfolio.deal_tokens 
ADD COLUMN IF NOT EXISTS last_nav_update TIMESTAMP,
ADD COLUMN IF NOT EXISTS nav_calculation_method VARCHAR(50) DEFAULT 'weighted_portfolio',
ADD COLUMN IF NOT EXISTS base_currency VARCHAR(3) DEFAULT 'USD';

-- ============================================
-- STEP 6: Create Valuation Views
-- ============================================

-- View to show current portfolio composition for each deal
CREATE OR REPLACE VIEW portfolio.deal_portfolio_view AS
SELECT 
  dcp.deal_id,
  d.deal_name,
  dcp.company_id,
  c.company_name,
  dcp.shares_owned,
  dcp.ownership_percentage,
  dcp.cost_basis,
  cv.share_price as current_share_price,
  dcp.shares_owned * cv.share_price as current_value,
  (dcp.shares_owned * cv.share_price) - dcp.cost_basis as unrealized_gain,
  CASE 
    WHEN dcp.cost_basis > 0 THEN 
      (dcp.shares_owned * cv.share_price) / dcp.cost_basis 
    ELSE 0 
  END as position_moic,
  cv.valuation_date as last_valuation_date
FROM portfolio.deal_company_positions dcp
JOIN core.deals d ON dcp.deal_id = d.deal_id
JOIN core.companies c ON dcp.company_id = c.company_id
LEFT JOIN LATERAL (
  SELECT share_price, valuation_date
  FROM portfolio.company_valuations
  WHERE company_id = dcp.company_id
  ORDER BY valuation_date DESC
  LIMIT 1
) cv ON true
WHERE dcp.position_status = 'active';

-- View to show deal-level metrics
CREATE OR REPLACE VIEW portfolio.deal_valuation_summary AS
SELECT 
  dt.deal_id,
  d.deal_name,
  dt.total_supply as total_tokens,
  COUNT(DISTINCT dcp.company_id) as portfolio_companies,
  SUM(dcp.cost_basis) as total_invested,
  portfolio.calculate_deal_portfolio_value(dt.deal_id) as current_portfolio_value,
  dt.nav_per_token,
  CASE 
    WHEN SUM(dcp.cost_basis) > 0 THEN 
      portfolio.calculate_deal_portfolio_value(dt.deal_id) / SUM(dcp.cost_basis)
    ELSE 0 
  END as portfolio_moic,
  MAX(cv.valuation_date) as last_valuation_update
FROM portfolio.deal_tokens dt
JOIN core.deals d ON dt.deal_id = d.deal_id
LEFT JOIN portfolio.deal_company_positions dcp ON dt.deal_id = dcp.deal_id
LEFT JOIN portfolio.company_valuations cv ON dcp.company_id = cv.company_id
GROUP BY dt.deal_id, d.deal_name, dt.total_supply, dt.nav_per_token;

-- ============================================
-- STEP 7: Migration of Existing Data
-- ============================================

-- Migrate existing single company relationships to many-to-many
-- This assumes current deals have one underlying company
INSERT INTO portfolio.deal_company_positions (
  deal_id,
  company_id,
  shares_owned,
  purchase_price_per_share,
  purchase_date,
  cost_basis,
  ownership_percentage,
  position_status
)
SELECT DISTINCT
  d.deal_id,
  d.underlying_company_id,
  COALESCE(d.equity_invested, 0), -- Using equity_invested as proxy for shares
  COALESCE(d.granted_share_price, 1000), -- Default share price if not set
  d.deal_date,
  COALESCE(
    (SELECT SUM(gross_capital) FROM transactions.transactions t WHERE t.deal_id = d.deal_id),
    0
  ),
  COALESCE(d.ownership_percentage, 0),
  CASE 
    WHEN d.deal_status = 'EXITED' THEN 'exited'
    ELSE 'active'
  END
FROM core.deals d
WHERE d.underlying_company_id IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM portfolio.deal_company_positions dcp 
  WHERE dcp.deal_id = d.deal_id 
  AND dcp.company_id = d.underlying_company_id
);

-- Create initial company valuations from deal data
INSERT INTO portfolio.company_valuations (
  company_id,
  valuation_date,
  share_price,
  valuation_method,
  valuation_source,
  created_by
)
SELECT DISTINCT
  d.underlying_company_id,
  d.deal_date,
  COALESCE(d.granted_share_price, 1000),
  'funding_round',
  'deal_close',
  'migration'
FROM core.deals d
WHERE d.underlying_company_id IS NOT NULL
AND d.granted_share_price IS NOT NULL
ON CONFLICT (company_id, valuation_date) DO NOTHING;

-- ============================================
-- STEP 8: Triggers for Automatic Updates
-- ============================================

-- Trigger to update position values when company valuations change
CREATE OR REPLACE FUNCTION portfolio.update_position_values()
RETURNS TRIGGER AS $$
BEGIN
  -- Update all positions for this company
  UPDATE portfolio.deal_company_positions
  SET 
    current_share_price = NEW.share_price,
    current_value = shares_owned * NEW.share_price,
    unrealized_gain = (shares_owned * NEW.share_price) - cost_basis,
    updated_at = NOW()
  WHERE company_id = NEW.company_id
  AND position_status = 'active';
  
  -- Recalculate NAV for all affected deals
  PERFORM portfolio.calculate_token_nav(deal_id)
  FROM portfolio.deal_company_positions
  WHERE company_id = NEW.company_id
  AND position_status = 'active';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_position_values
AFTER INSERT OR UPDATE ON portfolio.company_valuations
FOR EACH ROW
EXECUTE FUNCTION portfolio.update_position_values();

-- ============================================
-- STEP 9: Helper Functions
-- ============================================

-- Function to add a new company position to a deal
CREATE OR REPLACE FUNCTION portfolio.add_deal_position(
  p_deal_id INTEGER,
  p_company_id INTEGER,
  p_shares DECIMAL,
  p_price_per_share DECIMAL,
  p_purchase_date DATE
)
RETURNS portfolio.deal_company_positions AS $$
DECLARE
  v_position portfolio.deal_company_positions;
BEGIN
  INSERT INTO portfolio.deal_company_positions (
    deal_id,
    company_id,
    shares_owned,
    purchase_price_per_share,
    purchase_date,
    cost_basis,
    position_status
  ) VALUES (
    p_deal_id,
    p_company_id,
    p_shares,
    p_price_per_share,
    p_purchase_date,
    p_shares * p_price_per_share,
    'active'
  )
  RETURNING * INTO v_position;
  
  -- Trigger NAV recalculation
  PERFORM portfolio.calculate_token_nav(p_deal_id);
  
  RETURN v_position;
END;
$$ LANGUAGE plpgsql;

-- Function to update company valuation and cascade changes
CREATE OR REPLACE FUNCTION portfolio.update_company_valuation(
  p_company_id INTEGER,
  p_share_price DECIMAL,
  p_valuation_date DATE DEFAULT CURRENT_DATE,
  p_method VARCHAR DEFAULT 'market',
  p_source VARCHAR DEFAULT 'manual'
)
RETURNS portfolio.company_valuations AS $$
DECLARE
  v_valuation portfolio.company_valuations;
BEGIN
  INSERT INTO portfolio.company_valuations (
    company_id,
    valuation_date,
    share_price,
    valuation_method,
    valuation_source,
    created_by
  ) VALUES (
    p_company_id,
    p_valuation_date,
    p_share_price,
    p_method,
    p_source,
    current_user
  )
  ON CONFLICT (company_id, valuation_date) 
  DO UPDATE SET 
    share_price = EXCLUDED.share_price,
    valuation_method = EXCLUDED.valuation_method,
    valuation_source = EXCLUDED.valuation_source,
    created_at = NOW()
  RETURNING * INTO v_valuation;
  
  RETURN v_valuation;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- STEP 10: Permissions
-- ============================================

GRANT SELECT ON ALL TABLES IN SCHEMA portfolio TO anon, authenticated;
GRANT INSERT, UPDATE ON portfolio.company_valuations TO authenticated;
GRANT INSERT, UPDATE ON portfolio.deal_company_positions TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA portfolio TO authenticated;

-- ============================================
-- DONE: Complex relationships properly modeled
-- ============================================

-- Return summary
SELECT 
  'Valuation relationships fixed' as status,
  COUNT(DISTINCT deal_id) as deals_with_positions,
  COUNT(DISTINCT company_id) as companies_tracked,
  COUNT(*) as total_positions
FROM portfolio.deal_company_positions;