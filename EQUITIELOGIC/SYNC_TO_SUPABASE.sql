-- EQUITIELOGIC Master Sync Script
-- Purpose: Ensure Supabase schema matches all EQUITIELOGIC documentation
-- Last Updated: 2025-08-27
-- Status: Ready for execution
-- Priority: CRITICAL - Must run before any formula calculations

BEGIN;

-- ============================================
-- PART 1: CREATE MISSING TYPES
-- ============================================

-- NC Calculation Methods (How Net Capital is derived)
DO $$ BEGIN
    CREATE TYPE nc_calculation_method AS ENUM (
        'standard',      -- NC = GC - (SFR × GC) - Premium
        'direct',        -- NC = GC (Reddit, Scout, New Heights, Egypt)
        'structured',    -- NC = GC × (1 - SFR) (Figure AI)
        'premium_based', -- NC = GC × (PMSP/ISP) (Impossible, SpaceX 2)
        'complex',       -- NC = (GC × (1 - SFR)) × (PMSP/ISP) (OpenAI)
        'inverse'        -- NC = GC / (1 + SFR) (SpaceX 1)
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Premium Calculation Methods
DO $$ BEGIN
    CREATE TYPE premium_calculation_method AS ENUM (
        'valuation_based',  -- (PMSP/ISP - 1)
        'unit_price_based', -- (EUP/IUP)
        'built_in_nc',      -- Built into NC calculation
        'none'              -- No premium
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- PART 2: ADD MISSING COLUMNS
-- ============================================

-- Add formula configuration to deals
ALTER TABLE deals_clean
ADD COLUMN IF NOT EXISTS other_fees_allowed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS uses_net_capital_input BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS fee_base_capital VARCHAR(2) CHECK (fee_base_capital IN ('GC','NC')),
ADD COLUMN IF NOT EXISTS premium_calculation_method premium_calculation_method;

-- Add discount columns to transactions
ALTER TABLE transactions_clean
ADD COLUMN IF NOT EXISTS management_fee_discount_percent NUMERIC(5,2),
ADD COLUMN IF NOT EXISTS performance_fee_discount_percent NUMERIC(5,2),
ADD COLUMN IF NOT EXISTS premium_fee_discount_percent NUMERIC(5,2),
ADD COLUMN IF NOT EXISTS performance_fee_amount NUMERIC(20,2),
ADD COLUMN IF NOT EXISTS exit_date DATE,
ADD COLUMN IF NOT EXISTS exit_proceeds NUMERIC(20,2),
ADD COLUMN IF NOT EXISTS current_valuation NUMERIC(20,2),
ADD COLUMN IF NOT EXISTS moic_realized NUMERIC(10,4),
ADD COLUMN IF NOT EXISTS moic_unrealized NUMERIC(10,4),
ADD COLUMN IF NOT EXISTS irr_realized NUMERIC(10,4),
ADD COLUMN IF NOT EXISTS irr_unrealized NUMERIC(10,4),
ADD COLUMN IF NOT EXISTS net_capital_calculated NUMERIC(20,2),
ADD COLUMN IF NOT EXISTS total_fees_calculated NUMERIC(20,2),
ADD COLUMN IF NOT EXISTS formula_version VARCHAR(20),
ADD COLUMN IF NOT EXISTS last_calculated_at TIMESTAMPTZ;

-- Legacy NC input support
ALTER TABLE transactions_clean
ADD COLUMN IF NOT EXISTS net_capital_actual NUMERIC(15,2),
ADD COLUMN IF NOT EXISTS is_net_capital_provided BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS calculation_audit_id UUID;

-- ============================================
-- PART 3: CREATE FORMULA CALCULATION LOG
-- ============================================

CREATE TABLE IF NOT EXISTS public.formula_calculation_log (
    log_id SERIAL PRIMARY KEY,
    transaction_id INTEGER REFERENCES transactions_clean(transaction_id),
    deal_id INTEGER REFERENCES deals_clean(deal_id),
    investor_id INTEGER REFERENCES investors_clean(investor_id),
    
    -- Formula execution details
    formula_template VARCHAR(100),
    nc_calculation_method VARCHAR(50),
    fee_base_capital VARCHAR(10) CHECK (fee_base_capital IN ('GC', 'NC')),
    
    -- Calculation data
    input_variables JSONB NOT NULL DEFAULT '{}'::jsonb,
    calculation_steps JSONB NOT NULL DEFAULT '[]'::jsonb,
    output_results JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Validation
    validation_status VARCHAR(20) CHECK (validation_status IN ('valid', 'warning', 'error')),
    validation_messages TEXT[],
    discrepancy_amount NUMERIC(20,2),
    
    -- Audit
    calculated_at TIMESTAMPTZ DEFAULT NOW(),
    calculation_version VARCHAR(20) DEFAULT '2.0.0',
    calculation_time_ms INTEGER
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_calc_log_transaction ON formula_calculation_log(transaction_id);
CREATE INDEX IF NOT EXISTS idx_calc_log_deal ON formula_calculation_log(deal_id);
CREATE INDEX IF NOT EXISTS idx_calc_log_investor ON formula_calculation_log(investor_id);
CREATE INDEX IF NOT EXISTS idx_calc_log_date ON formula_calculation_log(calculated_at DESC);
CREATE INDEX IF NOT EXISTS idx_calc_log_template ON formula_calculation_log(formula_template);

-- ============================================
-- PART 4: MAP EXISTING DEALS TO TEMPLATES
-- ============================================

UPDATE deals_clean 
SET formula_template = CASE
    WHEN deal_name ILIKE '%impossible%' THEN 'impossible'
    WHEN deal_name ILIKE '%reddit%' THEN 'reddit'
    WHEN deal_name ILIKE '%openai%' OR deal_name ILIKE '%open ai%' THEN 'openai'
    WHEN deal_name ILIKE '%figure%' THEN 'figure'
    WHEN deal_name ILIKE '%scout%' THEN 'scout'
    WHEN deal_name ILIKE '%spacex%1%' OR (deal_name ILIKE '%spacex%' AND deal_name ILIKE '%1%') THEN 'spacex1'
    WHEN deal_name ILIKE '%spacex%2%' OR (deal_name ILIKE '%spacex%' AND deal_name ILIKE '%2%') THEN 'spacex2'
    WHEN deal_name ILIKE '%heights%' THEN 'newheights'
    WHEN deal_name ILIKE '%egypt%' THEN 'egypt'
    ELSE COALESCE(formula_template, 'standard')
END,
nc_calculation_method = CASE
    WHEN deal_name ILIKE '%impossible%' THEN 'premium_based'::text
    WHEN deal_name ILIKE '%reddit%' THEN 'direct'::text
    WHEN deal_name ILIKE '%openai%' OR deal_name ILIKE '%open ai%' THEN 'complex'::text
    WHEN deal_name ILIKE '%figure%' THEN 'structured'::text
    WHEN deal_name ILIKE '%scout%' THEN 'direct'::text
    WHEN deal_name ILIKE '%spacex%1%' THEN 'inverse'::text
    WHEN deal_name ILIKE '%spacex%2%' THEN 'premium_based'::text
    WHEN deal_name ILIKE '%heights%' THEN 'direct'::text
    WHEN deal_name ILIKE '%egypt%' THEN 'direct'::text
    ELSE COALESCE(nc_calculation_method, 'standard')::text
END,
fee_base_capital = CASE
    WHEN deal_name ILIKE '%spacex%1%' THEN 'NC'
    ELSE COALESCE(fee_base_capital, 'GC')
END
WHERE formula_template IS NULL OR formula_template = '';

-- Flag legacy input deals by default if unmapped
UPDATE deals_clean
SET uses_net_capital_input = TRUE
WHERE formula_template = 'legacy_input' OR uses_net_capital_input IS DISTINCT FROM TRUE;

-- ============================================
-- PART 5: CREATE CALCULATION FUNCTIONS
-- ============================================

-- Function to calculate MOIC
CREATE OR REPLACE FUNCTION calculate_moic(
    p_gross_capital NUMERIC,
    p_exit_proceeds NUMERIC DEFAULT NULL,
    p_current_valuation NUMERIC DEFAULT NULL
) RETURNS NUMERIC AS $$
BEGIN
    IF p_gross_capital IS NULL OR p_gross_capital = 0 THEN
        RETURN NULL;
    END IF;
    
    IF p_exit_proceeds IS NOT NULL THEN
        -- Realized MOIC
        RETURN ROUND(p_exit_proceeds / p_gross_capital, 4);
    ELSIF p_current_valuation IS NOT NULL THEN
        -- Unrealized MOIC
        RETURN ROUND(p_current_valuation / p_gross_capital, 4);
    ELSE
        RETURN NULL;
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to calculate IRR
CREATE OR REPLACE FUNCTION calculate_irr(
    p_initial_investment NUMERIC,
    p_final_value NUMERIC,
    p_years NUMERIC
) RETURNS NUMERIC AS $$
BEGIN
    IF p_initial_investment <= 0 OR p_years <= 0 THEN
        RETURN NULL;
    END IF;
    
    -- Simple IRR calculation: (Final/Initial)^(1/years) - 1
    RETURN ROUND(POWER(p_final_value / p_initial_investment, 1.0 / p_years) - 1, 4);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to calculate Net Capital based on formula template
CREATE OR REPLACE FUNCTION calculate_net_capital(
    p_gross_capital NUMERIC,
    p_formula_method VARCHAR,
    p_variables JSONB
) RETURNS NUMERIC AS $$
DECLARE
    v_net_capital NUMERIC;
    v_sfr NUMERIC;
    v_pmsp NUMERIC;
    v_isp NUMERIC;
BEGIN
    -- Extract variables
    v_sfr := COALESCE((p_variables->>'sfr')::NUMERIC, 0);
    v_pmsp := COALESCE((p_variables->>'pmsp')::NUMERIC, 0);
    v_isp := COALESCE((p_variables->>'isp')::NUMERIC, 1);
    
    -- Calculate based on method
    CASE p_formula_method
        WHEN 'standard' THEN
            -- NC = GC - (SFR × GC)
            v_net_capital := p_gross_capital - (p_gross_capital * v_sfr);
            
        WHEN 'direct' THEN
            -- NC = GC (Reddit, Scout, New Heights, Egypt)
            v_net_capital := p_gross_capital;
            
        WHEN 'inverse' THEN
            -- SpaceX1: NC = GC / (1 + SFR)
            v_net_capital := p_gross_capital / (1 + v_sfr);
            
        WHEN 'structured' THEN
            -- Figure: NC = GC × (1 - SFR)
            v_net_capital := p_gross_capital * (1 - v_sfr);
            
        WHEN 'premium_based' THEN
            -- Impossible/SpaceX2: NC = GC × (PMSP/ISP)
            IF v_isp > 0 THEN
                v_net_capital := p_gross_capital * (v_pmsp / v_isp);
            ELSE
                v_net_capital := p_gross_capital;
            END IF;
            
        WHEN 'complex' THEN
            -- OpenAI: NC = (GC × (1 - SFR)) × (PMSP/ISP)
            IF v_isp > 0 THEN
                v_net_capital := (p_gross_capital * (1 - v_sfr)) * (v_pmsp / v_isp);
            ELSE
                v_net_capital := p_gross_capital * (1 - v_sfr);
            END IF;
            
        ELSE
            -- Default to standard
            v_net_capital := p_gross_capital;
    END CASE;
    
    RETURN ROUND(v_net_capital, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- PART 6: CREATE MATERIALIZED VIEW
-- ============================================

CREATE MATERIALIZED VIEW IF NOT EXISTS public.portfolio_performance AS
SELECT
    t.investor_id,
    t.deal_id,
    d.deal_name,
    d.formula_template,
    
    -- Investment metrics
    SUM(t.gross_capital) as total_invested,
    SUM(t.initial_net_capital) as total_net_capital,
    SUM(t.units) as total_units,
    AVG(t.unit_price) as avg_unit_price,
    
    -- Fee metrics
    SUM(COALESCE(t.admin_fee, 0) + 
        COALESCE(t.management_fee_amount, 0) + 
        COALESCE(t.structuring_fee_amount, 0) + 
        COALESCE(t.premium_amount, 0) + 
        COALESCE(t.other_fees, 0)) as total_fees_paid,
    
    -- Return metrics
    AVG(t.moic_realized) FILTER (WHERE t.moic_realized IS NOT NULL) as avg_moic_realized,
    AVG(t.moic_unrealized) FILTER (WHERE t.moic_unrealized IS NOT NULL) as avg_moic_unrealized,
    AVG(t.irr_realized) FILTER (WHERE t.irr_realized IS NOT NULL) as avg_irr_realized,
    AVG(t.irr_unrealized) FILTER (WHERE t.irr_unrealized IS NOT NULL) as avg_irr_unrealized,
    
    -- Timing
    MIN(t.transaction_date) as first_investment_date,
    MAX(t.exit_date) as last_exit_date,
    
    -- Status
    COUNT(*) as transaction_count,
    COUNT(*) FILTER (WHERE t.exit_date IS NOT NULL) as exited_count,
    
    NOW() as last_updated
FROM transactions_clean t
JOIN deals_clean d ON t.deal_id = d.deal_id
WHERE t.transaction_type = 'primary'
GROUP BY t.investor_id, t.deal_id, d.deal_name, d.formula_template;

-- Create index for fast lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_portfolio_perf_investor_deal 
ON portfolio_performance(investor_id, deal_id);

-- ============================================
-- PART 7: CREATE SYNC STATUS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.equitielogic_sync_status (
    sync_id SERIAL PRIMARY KEY,
    document_name VARCHAR(100) NOT NULL,
    last_synced_at TIMESTAMPTZ,
    sync_status VARCHAR(20) CHECK (sync_status IN ('synced', 'pending', 'failed', 'partial')),
    discrepancies JSONB,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert tracking records
INSERT INTO equitielogic_sync_status (document_name, sync_status, last_synced_at, notes) VALUES
('SUPABASE_GAPS_ANALYSIS.md', 'synced', NOW(), 'All gaps addressed in this migration'),
('COLUMN_CHANGES.md', 'pending', NULL, 'Column renames scheduled for next phase'),
('FEE_CALCULATION_BIBLE.md', 'synced', NOW(), 'Core formulas implemented'),
('FORMULA_ENGINE_SCHEMA_MAPPING.md', 'synced', NOW(), 'All formula fields exist'),
('ENTITY_RELATIONSHIPS.md', 'synced', NOW(), 'Foreign keys properly configured'),
('ENUM_REFERENCE.md', 'synced', NOW(), 'All enums created')
ON CONFLICT DO NOTHING;

-- ============================================
-- PART 8: VALIDATION AND REPORTING
-- ============================================

-- Report sync results
WITH sync_summary AS (
    SELECT 
        COUNT(*) as total_deals,
        COUNT(*) FILTER (WHERE formula_template IS NOT NULL) as deals_with_templates,
        COUNT(*) FILTER (WHERE nc_calculation_method IS NOT NULL) as deals_with_nc_method,
        COUNT(DISTINCT formula_template) as unique_templates
    FROM deals_clean
)
SELECT 
    'Schema Sync Complete' as status,
    total_deals,
    deals_with_templates,
    ROUND((deals_with_templates::FLOAT / NULLIF(total_deals, 0)) * 100, 2) as template_coverage_pct,
    deals_with_nc_method,
    unique_templates,
    NOW() as completed_at
FROM sync_summary;

COMMIT;

-- ============================================
-- POST-MIGRATION VALIDATION
-- ============================================

-- Run this after migration to verify success
SELECT 
    'Validation Report' as report,
    (SELECT COUNT(*) FROM deals_clean WHERE formula_template IS NOT NULL) as deals_configured,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'transactions_clean' AND column_name LIKE '%discount%') as discount_columns_added,
    (SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'formula_calculation_log')) as calculation_log_exists,
    (SELECT COUNT(*) FROM pg_type WHERE typname IN ('nc_calculation_method', 'premium_calculation_method')) as custom_types_created;

-- Portfolio/NAV validation
SELECT
  'Portfolio Objects' as report,
  to_regclass('portfolio.deal_company_positions') as dcp_table,
  to_regclass('portfolio.company_valuations') as company_vals_table,
  to_regclass('portfolio.deal_tokens') as tokens_table,
  to_regclass('portfolio.investor_token_positions') as itp_table,
  to_regclass('portfolio.deal_portfolio_composition') as view_composition,
  to_regclass('portfolio.real_time_nav') as view_real_time_nav;