-- Migration: Fix Many-to-Many Deal-Company Relationships
-- Purpose: Properly handle deals with multiple companies (e.g., New Heights with 40+ companies)
--          and companies in multiple deals (e.g., SpaceX, Dastgyr)
-- Author: System Sync
-- Date: 2025-01-28

BEGIN;

-- ============================================
-- 1. ENSURE PROPER FOREIGN KEY RELATIONSHIPS
-- ============================================

-- First, ensure companies_clean exists and has proper structure
ALTER TABLE IF EXISTS public.companies_clean 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Ensure deals_clean has proper structure
ALTER TABLE IF EXISTS public.deals_clean
ADD COLUMN IF NOT EXISTS deal_status VARCHAR(50) DEFAULT 'active';

-- ============================================
-- 2. CREATE ENHANCED DEAL-COMPANY JUNCTION TABLE
-- ============================================

-- Drop existing constraints if they exist (safely)
ALTER TABLE IF EXISTS portfolio.deal_company_positions
DROP CONSTRAINT IF EXISTS deal_company_positions_deal_id_fkey,
DROP CONSTRAINT IF EXISTS deal_company_positions_company_id_fkey;

-- Add proper foreign keys to companies_clean and deals_clean
ALTER TABLE portfolio.deal_company_positions
ADD CONSTRAINT deal_company_positions_deal_id_fkey 
    FOREIGN KEY (deal_id) 
    REFERENCES public.deals_clean(deal_id) 
    ON DELETE CASCADE,
ADD CONSTRAINT deal_company_positions_company_id_fkey 
    FOREIGN KEY (company_id) 
    REFERENCES public.companies_clean(company_id) 
    ON DELETE CASCADE;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_deal_company_positions_deal_id 
    ON portfolio.deal_company_positions(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_company_positions_company_id 
    ON portfolio.deal_company_positions(company_id);
CREATE INDEX IF NOT EXISTS idx_deal_company_positions_status 
    ON portfolio.deal_company_positions(position_status);

-- ============================================
-- 3. ADD NET CAPITAL TRACKING COLUMNS
-- ============================================

-- Add net_capital_invested to track actual money invested (not calculated)
ALTER TABLE portfolio.deal_company_positions
ADD COLUMN IF NOT EXISTS net_capital_invested NUMERIC(15,2),
ADD COLUMN IF NOT EXISTS is_legacy_deal BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS investment_type VARCHAR(50) DEFAULT 'direct' CHECK (
    investment_type IN ('direct', 'partner', 'syndicate', 'fund')
),
ADD COLUMN IF NOT EXISTS partner_entity_id UUID REFERENCES core.partner_entities(id),
ADD COLUMN IF NOT EXISTS data_source VARCHAR(50) DEFAULT 'transaction' CHECK (
    data_source IN ('transaction', 'manual_entry', 'import', 'calculated')
);

COMMENT ON COLUMN portfolio.deal_company_positions.net_capital_invested IS 
    'Actual net capital invested - this is the entry point for legacy deals where NC is known';
COMMENT ON COLUMN portfolio.deal_company_positions.is_legacy_deal IS 
    'True for deals where we only have net capital, not gross capital';
COMMENT ON COLUMN portfolio.deal_company_positions.data_source IS 
    'Source of the data: transaction=from transactions_clean, manual_entry=legacy data, import=bulk upload';

-- ============================================
-- 4. CREATE VIEW FOR DEAL PORTFOLIO COMPOSITION
-- ============================================

CREATE OR REPLACE VIEW portfolio.deal_portfolio_composition AS
WITH position_values AS (
    SELECT 
        dcp.deal_id,
        dcp.company_id,
        c.company_name,
        c.company_type,
        dcp.shares_owned,
        dcp.share_class,
        dcp.purchase_price_per_share,
        dcp.cost_basis,
        -- Use net_capital_invested for legacy deals, otherwise calculate
        COALESCE(
            dcp.net_capital_invested, 
            dcp.cost_basis
        ) as net_capital,
        dcp.ownership_percentage,
        -- Get latest valuation
        cv.share_price as current_share_price,
        (dcp.shares_owned * COALESCE(cv.share_price, dcp.purchase_price_per_share)) as current_value,
        dcp.position_status,
        dcp.is_legacy_deal,
        dcp.data_source,
        d.deal_name,
        d.deal_code
    FROM portfolio.deal_company_positions dcp
    JOIN public.companies_clean c ON c.company_id = dcp.company_id
    JOIN public.deals_clean d ON d.deal_id = dcp.deal_id
    LEFT JOIN LATERAL (
        SELECT share_price 
        FROM portfolio.company_valuations 
        WHERE company_id = dcp.company_id 
        ORDER BY valuation_date DESC 
        LIMIT 1
    ) cv ON true
)
SELECT 
    deal_id,
    deal_name,
    deal_code,
    COUNT(DISTINCT company_id) as company_count,
    SUM(net_capital) as total_net_capital,
    SUM(current_value) as total_current_value,
    SUM(current_value) - SUM(net_capital) as total_unrealized_gain,
    CASE 
        WHEN SUM(net_capital) > 0 THEN 
            ROUND((SUM(current_value) / SUM(net_capital))::numeric, 2)
        ELSE 0
    END as portfolio_multiple,
    jsonb_agg(
        jsonb_build_object(
            'company_id', company_id,
            'company_name', company_name,
            'shares_owned', shares_owned,
            'net_capital', net_capital,
            'current_value', current_value,
            'ownership_pct', ownership_percentage,
            'is_legacy', is_legacy_deal
        ) ORDER BY current_value DESC
    ) as company_positions
FROM position_values
WHERE position_status = 'active'
GROUP BY deal_id, deal_name, deal_code;

COMMENT ON VIEW portfolio.deal_portfolio_composition IS 
    'Shows complete portfolio composition for deals including multi-company positions';

-- ============================================
-- 5. CREATE NET CAPITAL ENTRY FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION portfolio.record_net_capital_investment(
    p_deal_id INTEGER,
    p_company_id INTEGER,
    p_net_capital NUMERIC,
    p_shares NUMERIC DEFAULT NULL,
    p_share_price NUMERIC DEFAULT NULL,
    p_investor_id INTEGER DEFAULT NULL,
    p_transaction_id INTEGER DEFAULT NULL,
    p_is_legacy BOOLEAN DEFAULT false,
    p_notes TEXT DEFAULT NULL
) RETURNS portfolio.deal_company_positions AS $$
DECLARE
    v_position portfolio.deal_company_positions;
    v_cost_basis NUMERIC;
BEGIN
    -- Calculate cost basis
    IF p_shares IS NOT NULL AND p_share_price IS NOT NULL THEN
        v_cost_basis := p_shares * p_share_price;
    ELSE
        v_cost_basis := p_net_capital;
    END IF;

    -- Insert or update position
    INSERT INTO portfolio.deal_company_positions (
        deal_id,
        company_id,
        net_capital_invested,
        shares_owned,
        purchase_price_per_share,
        cost_basis,
        is_legacy_deal,
        data_source,
        purchase_date,
        position_status
    ) VALUES (
        p_deal_id,
        p_company_id,
        p_net_capital,
        COALESCE(p_shares, p_net_capital / COALESCE(p_share_price, 1000)), -- Default to 1000 if no price
        COALESCE(p_share_price, 1000),
        v_cost_basis,
        p_is_legacy,
        CASE 
            WHEN p_is_legacy THEN 'manual_entry'
            WHEN p_transaction_id IS NOT NULL THEN 'transaction'
            ELSE 'import'
        END,
        CURRENT_DATE,
        'active'
    )
    ON CONFLICT (deal_id, company_id) DO UPDATE SET
        net_capital_invested = EXCLUDED.net_capital_invested,
        shares_owned = EXCLUDED.shares_owned,
        purchase_price_per_share = EXCLUDED.purchase_price_per_share,
        cost_basis = EXCLUDED.cost_basis,
        is_legacy_deal = EXCLUDED.is_legacy_deal,
        updated_at = NOW()
    RETURNING * INTO v_position;

    -- Log the entry
    INSERT INTO audit.investment_entries (
        deal_id,
        company_id,
        net_capital,
        transaction_id,
        investor_id,
        entry_type,
        notes,
        created_at
    ) VALUES (
        p_deal_id,
        p_company_id,
        p_net_capital,
        p_transaction_id,
        p_investor_id,
        CASE WHEN p_is_legacy THEN 'legacy' ELSE 'standard' END,
        p_notes,
        NOW()
    );

    -- Trigger NAV recalculation
    PERFORM portfolio.update_token_nav(p_deal_id);

    RETURN v_position;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION portfolio.record_net_capital_investment IS 
    'Single entry point for recording net capital investments, handles both legacy and new deals';

-- ============================================
-- 6. CREATE AUDIT TABLE FOR TRACKING
-- ============================================

CREATE SCHEMA IF NOT EXISTS audit;

CREATE TABLE IF NOT EXISTS audit.investment_entries (
    id SERIAL PRIMARY KEY,
    deal_id INTEGER REFERENCES public.deals_clean(deal_id),
    company_id INTEGER REFERENCES public.companies_clean(company_id),
    net_capital NUMERIC(15,2) NOT NULL,
    transaction_id INTEGER REFERENCES public.transactions_clean(transaction_id),
    investor_id INTEGER REFERENCES public.investors_clean(investor_id),
    entry_type VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    created_by VARCHAR(255) DEFAULT current_user
);

CREATE INDEX idx_audit_investment_entries_deal ON audit.investment_entries(deal_id);
CREATE INDEX idx_audit_investment_entries_company ON audit.investment_entries(company_id);

-- ============================================
-- 7. MIGRATE EXISTING DATA
-- ============================================

-- Identify and mark legacy deals
UPDATE portfolio.deal_company_positions dcp
SET 
    is_legacy_deal = true,
    data_source = 'manual_entry',
    net_capital_invested = cost_basis
WHERE NOT EXISTS (
    SELECT 1 FROM public.transactions_clean t 
    WHERE t.deal_id = dcp.deal_id 
    AND t.gross_capital IS NOT NULL
);

-- ============================================
-- 8. CREATE HELPER FUNCTIONS
-- ============================================

-- Function to get all companies for a deal
CREATE OR REPLACE FUNCTION portfolio.get_deal_companies(p_deal_id INTEGER)
RETURNS TABLE (
    company_id INTEGER,
    company_name VARCHAR,
    shares_owned NUMERIC,
    net_capital NUMERIC,
    current_value NUMERIC,
    ownership_pct NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        dcp.company_id,
        c.company_name,
        dcp.shares_owned,
        COALESCE(dcp.net_capital_invested, dcp.cost_basis) as net_capital,
        dcp.current_value,
        dcp.ownership_percentage
    FROM portfolio.deal_company_positions dcp
    JOIN public.companies_clean c ON c.company_id = dcp.company_id
    WHERE dcp.deal_id = p_deal_id
    AND dcp.position_status = 'active'
    ORDER BY dcp.current_value DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get all deals for a company
CREATE OR REPLACE FUNCTION portfolio.get_company_deals(p_company_id INTEGER)
RETURNS TABLE (
    deal_id INTEGER,
    deal_name VARCHAR,
    shares_owned NUMERIC,
    net_capital NUMERIC,
    ownership_pct NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        dcp.deal_id,
        d.deal_name,
        dcp.shares_owned,
        COALESCE(dcp.net_capital_invested, dcp.cost_basis) as net_capital,
        dcp.ownership_percentage
    FROM portfolio.deal_company_positions dcp
    JOIN public.deals_clean d ON d.deal_id = dcp.deal_id
    WHERE dcp.company_id = p_company_id
    AND dcp.position_status = 'active'
    ORDER BY dcp.purchase_date DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 9. ADD CONSTRAINTS FOR DATA INTEGRITY
-- ============================================

-- Ensure unique positions
ALTER TABLE portfolio.deal_company_positions
ADD CONSTRAINT IF NOT EXISTS unique_deal_company_position 
    UNIQUE (deal_id, company_id, share_class);

-- Ensure positive values
ALTER TABLE portfolio.deal_company_positions
ADD CONSTRAINT IF NOT EXISTS positive_shares CHECK (shares_owned >= 0),
ADD CONSTRAINT IF NOT EXISTS positive_net_capital CHECK (net_capital_invested >= 0),
ADD CONSTRAINT IF NOT EXISTS positive_cost CHECK (cost_basis >= 0);

-- ============================================
-- 10. GRANT PERMISSIONS
-- ============================================

GRANT SELECT ON portfolio.deal_portfolio_composition TO authenticated;
GRANT SELECT, INSERT, UPDATE ON portfolio.deal_company_positions TO service_role;
GRANT EXECUTE ON FUNCTION portfolio.record_net_capital_investment TO service_role;
GRANT SELECT ON audit.investment_entries TO authenticated;

COMMIT;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check deals with multiple companies
SELECT 
    d.deal_name,
    COUNT(dcp.company_id) as company_count,
    SUM(COALESCE(dcp.net_capital_invested, dcp.cost_basis)) as total_net_capital
FROM public.deals_clean d
JOIN portfolio.deal_company_positions dcp ON d.deal_id = dcp.deal_id
GROUP BY d.deal_id, d.deal_name
HAVING COUNT(dcp.company_id) > 1
ORDER BY company_count DESC;

-- Check companies in multiple deals  
SELECT 
    c.company_name,
    COUNT(dcp.deal_id) as deal_count,
    SUM(COALESCE(dcp.net_capital_invested, dcp.cost_basis)) as total_net_capital
FROM public.companies_clean c
JOIN portfolio.deal_company_positions dcp ON c.company_id = dcp.company_id
GROUP BY c.company_id, c.company_name
HAVING COUNT(dcp.deal_id) > 1
ORDER BY deal_count DESC;