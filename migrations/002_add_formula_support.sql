-- Migration: Add Formula Support and Net Capital Entry Points
-- Purpose: Add missing formula columns and create proper NC entry points
-- Author: System Sync  
-- Date: 2025-01-28

BEGIN;

-- ============================================
-- 1. ADD FORMULA CONFIGURATION COLUMNS TO DEALS
-- ============================================

-- Create enum types for formula configuration
DO $$ BEGIN
    CREATE TYPE nc_calculation_method AS ENUM (
        'standard',      -- NC = GC - (SFR × GC) - Premium
        'direct',        -- NC = GC (Reddit, Scout, New Heights, Egypt)
        'structured',    -- NC = GC × (1 - SFR) (Figure AI)
        'premium_based', -- NC = GC × (PMSP/ISP) (Impossible, SpaceX 2)
        'complex',       -- NC = (GC × (1 - SFR)) × (PMSP/ISP) (OpenAI)
        'inverse',       -- NC = GC / (1 + SFR) (SpaceX 1)
        'legacy_input'   -- NC is provided directly, not calculated
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE premium_calculation_method AS ENUM (
        'valuation_based',  -- (PMSP/ISP - 1)
        'unit_price_based', -- (EUP/IUP)
        'built_in_nc',      -- Built into NC calculation
        'none'              -- No premium
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add formula support columns to deals_clean
ALTER TABLE public.deals_clean
ADD COLUMN IF NOT EXISTS nc_calculation_method nc_calculation_method DEFAULT 'legacy_input',
ADD COLUMN IF NOT EXISTS formula_template VARCHAR(50) DEFAULT 'standard',
ADD COLUMN IF NOT EXISTS fee_base_capital VARCHAR(2) DEFAULT 'GC' CHECK (fee_base_capital IN ('GC', 'NC')),
ADD COLUMN IF NOT EXISTS premium_calculation_method premium_calculation_method DEFAULT 'none',
ADD COLUMN IF NOT EXISTS management_fee_tier_1_percent NUMERIC(5,2),
ADD COLUMN IF NOT EXISTS management_fee_tier_2_percent NUMERIC(5,2),
ADD COLUMN IF NOT EXISTS tier_1_period INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS other_fees_allowed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS uses_net_capital_input BOOLEAN DEFAULT false;

-- Add comments for clarity
COMMENT ON COLUMN public.deals_clean.nc_calculation_method IS 
    'Method for calculating net capital. Use legacy_input for deals where NC is provided';
COMMENT ON COLUMN public.deals_clean.uses_net_capital_input IS 
    'TRUE for legacy deals where we have NC directly, not calculated from GC';

-- ============================================
-- 2. CREATE FORMULA TEMPLATES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.formula_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_name VARCHAR(50) UNIQUE NOT NULL,
    nc_formula TEXT NOT NULL,
    investor_proceeds_formula TEXT NOT NULL,
    investor_proceeds_discount_formula TEXT,
    eq_proceeds_formula TEXT,
    eq_proceeds_discount_formula TEXT,
    has_management_tiers BOOLEAN DEFAULT false,
    has_premium BOOLEAN DEFAULT false,
    has_other_fees BOOLEAN DEFAULT false,
    fee_base_capital VARCHAR(2) DEFAULT 'GC',
    special_rules JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert standard formula templates
INSERT INTO public.formula_templates (
    template_name, 
    nc_formula, 
    investor_proceeds_formula,
    has_management_tiers,
    has_premium,
    has_other_fees,
    fee_base_capital,
    special_rules
) VALUES 
    ('standard', 
     'NC = GC - (SFR × GC) - Premium', 
     'INP = (NC × (EUP/IUP)) - (MFR × GC × T) - (SFR × GC) - AF - (PFR × ((NC × (EUP/IUP)) - NC))',
     false, false, false, 'GC', null),
    
    ('reddit', 
     'NC = GC', 
     'INP = (NC × (EUP/IUP)) - (MFR × GC × T) - (SFR × GC) - Premium - AF - OF - (PFR × ((NC × (EUP/IUP)) - NC))',
     false, true, true, 'GC', '{"note": "Other fees included"}'),
    
    ('openai', 
     'NC = ((GC × (1 - SFR)) × (PMSP/ISP))', 
     'INP = (NC × (EUP/IUP)) - (MFR1 × GC) - (MFR2 × GC × (T - 1)) - AF - (PFR × ((NC × (EUP/IUP)) - NC))',
     true, false, false, 'GC', '{"tier_1_years": 1}'),
    
    ('figure', 
     'NC = GC × (1 - SFR)', 
     'INP = (NC × (EUP/IUP)) - (MFR × GC × T) - (SFR × GC) - Premium - AF - (PFR × ((NC × (EUP/IUP)) - NC))',
     false, true, false, 'GC', null),
    
    ('scout', 
     'NC = GC', 
     'INP = (NC × (EUP/IUP)) - (MFR × GC × T) - (SFR × GC) - Premium - AF - (PFR × ((NC × (EUP/IUP)) - NC))',
     false, true, false, 'GC', null),
    
    ('impossible', 
     'NC = GC × (PMSP/ISP)', 
     'INP = (NC × (EUP/IUP)) - (MFR × GC × T) - (SFR × GC) - AF - (PFR × ((NC × (EUP/IUP)) - NC))',
     false, false, false, 'GC', '{"unit_price_range": [19, 21]}'),
    
    ('spacex1', 
     'NC = GC / (1 + SFR)', 
     'INP = (NC × (EUP/IUP)) - MgmtFee - (SFR × NC) - AF - (PFR × ((NC × (EUP/IUP)) - NC))',
     true, true, false, 'NC', '{"tier_1_years": 2}'),
    
    ('spacex2', 
     'NC = GC × (PMSP/ISP)', 
     'INP = (NC × (EUP/IUP)) - (MFR × GC × T) - (SFR × GC) - AF - (PFR × ((NC × (EUP/IUP)) - NC))',
     false, false, false, 'GC', null),
    
    ('newheights', 
     'NC = GC', 
     'INP = (NC × (EUP/IUP)) - AF - (PFR × ((NC × (EUP/IUP)) - NC))',
     false, false, false, 'GC', '{"no_mgmt_fee": true, "no_struct_fee": true}'),
    
    ('egypt', 
     'NC = GC', 
     'INP = (NC × (EUP/IUP)) - (MFR × GC × T) - (SFR × GC) - Premium - AF - (PFR × ((NC × (EUP/IUP)) - NC))',
     false, true, false, 'GC', null),
    
    ('legacy_input', 
     'NC = INPUT', 
     'INP = NC × Exit_Multiple - Fees',
     false, false, false, 'NC', '{"is_legacy": true, "note": "Net capital provided directly"}')
ON CONFLICT (template_name) DO NOTHING;

-- ============================================
-- 3. MAP EXISTING DEALS TO TEMPLATES
-- ============================================

-- Update deals with their formula templates based on name patterns
UPDATE public.deals_clean SET 
    formula_template = CASE
        WHEN deal_name ILIKE '%impossible%' THEN 'impossible'
        WHEN deal_name ILIKE '%reddit%' THEN 'reddit'
        WHEN deal_name ILIKE '%openai%' OR deal_name ILIKE '%open ai%' THEN 'openai'
        WHEN deal_name ILIKE '%figure%' THEN 'figure'
        WHEN deal_name ILIKE '%scout%' THEN 'scout'
        WHEN deal_name ILIKE '%spacex%1%' OR deal_name ILIKE '%spacex 1%' THEN 'spacex1'
        WHEN deal_name ILIKE '%spacex%2%' OR deal_name ILIKE '%spacex 2%' THEN 'spacex2'
        WHEN deal_name ILIKE '%heights%' THEN 'newheights'
        WHEN deal_name ILIKE '%egypt%' OR deal_name ILIKE '%egy%' THEN 'egypt'
        ELSE 'legacy_input'
    END,
    nc_calculation_method = CASE
        WHEN deal_name ILIKE '%impossible%' THEN 'premium_based'
        WHEN deal_name ILIKE '%reddit%' THEN 'direct'
        WHEN deal_name ILIKE '%openai%' OR deal_name ILIKE '%open ai%' THEN 'complex'
        WHEN deal_name ILIKE '%figure%' THEN 'structured'
        WHEN deal_name ILIKE '%scout%' THEN 'direct'
        WHEN deal_name ILIKE '%spacex%1%' OR deal_name ILIKE '%spacex 1%' THEN 'inverse'
        WHEN deal_name ILIKE '%spacex%2%' OR deal_name ILIKE '%spacex 2%' THEN 'premium_based'
        WHEN deal_name ILIKE '%heights%' THEN 'direct'
        WHEN deal_name ILIKE '%egypt%' OR deal_name ILIKE '%egy%' THEN 'direct'
        ELSE 'legacy_input'
    END,
    uses_net_capital_input = CASE
        WHEN deal_name ILIKE '%impossible%' THEN false
        WHEN deal_name ILIKE '%reddit%' THEN false
        WHEN deal_name ILIKE '%openai%' THEN false
        WHEN deal_name ILIKE '%figure%' THEN false
        WHEN deal_name ILIKE '%scout%' THEN false
        WHEN deal_name ILIKE '%spacex%' THEN false
        WHEN deal_name ILIKE '%heights%' THEN false
        WHEN deal_name ILIKE '%egypt%' THEN false
        ELSE true -- Default to legacy for unknown deals
    END
WHERE formula_template IS NULL OR formula_template = 'standard';

-- ============================================
-- 4. ADD NET CAPITAL TRACKING TO TRANSACTIONS
-- ============================================

ALTER TABLE public.transactions_clean
ADD COLUMN IF NOT EXISTS net_capital_actual NUMERIC(15,2),
ADD COLUMN IF NOT EXISTS is_net_capital_provided BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS calculation_audit_id UUID;

COMMENT ON COLUMN public.transactions_clean.net_capital_actual IS 
    'Actual net capital invested (not calculated) - single entry point for legacy deals';
COMMENT ON COLUMN public.transactions_clean.is_net_capital_provided IS 
    'TRUE when net_capital is provided directly, not calculated from gross';

-- ============================================
-- 5. CREATE NET CAPITAL CALCULATION FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION public.calculate_net_capital(
    p_transaction_id INTEGER
) RETURNS NUMERIC AS $$
DECLARE
    v_transaction RECORD;
    v_deal RECORD;
    v_net_capital NUMERIC;
BEGIN
    -- Get transaction and deal details
    SELECT t.*, d.*
    INTO v_transaction
    FROM public.transactions_clean t
    JOIN public.deals_clean d ON t.deal_id = d.deal_id
    WHERE t.transaction_id = p_transaction_id;

    -- If net capital is provided directly, use it
    IF v_transaction.is_net_capital_provided THEN
        RETURN v_transaction.net_capital_actual;
    END IF;

    -- Otherwise calculate based on formula
    CASE v_transaction.nc_calculation_method
        WHEN 'direct' THEN
            v_net_capital := v_transaction.gross_capital;
        WHEN 'structured' THEN
            v_net_capital := v_transaction.gross_capital * (1 - COALESCE(v_transaction.eq_deal_structuring_fee_percent, 0) / 100);
        WHEN 'premium_based' THEN
            IF v_transaction.pre_money_sell_price IS NOT NULL AND v_transaction.initial_share_price > 0 THEN
                v_net_capital := v_transaction.gross_capital * (v_transaction.pre_money_sell_price / v_transaction.initial_share_price);
            ELSE
                v_net_capital := v_transaction.gross_capital;
            END IF;
        WHEN 'complex' THEN
            v_net_capital := (v_transaction.gross_capital * (1 - COALESCE(v_transaction.eq_deal_structuring_fee_percent, 0) / 100)) * 
                            (v_transaction.pre_money_sell_price / NULLIF(v_transaction.initial_share_price, 0));
        WHEN 'inverse' THEN
            v_net_capital := v_transaction.gross_capital / (1 + COALESCE(v_transaction.eq_deal_structuring_fee_percent, 0) / 100);
        WHEN 'legacy_input' THEN
            v_net_capital := COALESCE(v_transaction.net_capital_actual, v_transaction.initial_net_capital);
        ELSE -- 'standard'
            v_net_capital := v_transaction.gross_capital - 
                           (v_transaction.gross_capital * COALESCE(v_transaction.eq_deal_structuring_fee_percent, 0) / 100) -
                           COALESCE(v_transaction.premium_amount, 0);
    END CASE;

    RETURN v_net_capital;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. CREATE SINGLE ENTRY POINT FOR NET CAPITAL
-- ============================================

CREATE OR REPLACE FUNCTION public.record_transaction_net_capital(
    p_transaction_id INTEGER,
    p_net_capital NUMERIC,
    p_is_legacy BOOLEAN DEFAULT false,
    p_notes TEXT DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
    v_transaction RECORD;
    v_deal_id INTEGER;
    v_investor_id INTEGER;
BEGIN
    -- Get transaction details
    SELECT deal_id, investor_id 
    INTO v_deal_id, v_investor_id
    FROM public.transactions_clean
    WHERE transaction_id = p_transaction_id;

    -- Update transaction with net capital
    UPDATE public.transactions_clean
    SET 
        net_capital_actual = p_net_capital,
        is_net_capital_provided = true,
        initial_net_capital = COALESCE(initial_net_capital, p_net_capital),
        updated_at = NOW()
    WHERE transaction_id = p_transaction_id;

    -- Update deal if it's a legacy deal
    IF p_is_legacy THEN
        UPDATE public.deals_clean
        SET 
            uses_net_capital_input = true,
            nc_calculation_method = 'legacy_input',
            formula_template = 'legacy_input'
        WHERE deal_id = v_deal_id;
    END IF;

    -- Log the entry
    INSERT INTO audit.net_capital_entries (
        transaction_id,
        deal_id,
        investor_id,
        net_capital,
        entry_type,
        notes,
        created_at
    ) VALUES (
        p_transaction_id,
        v_deal_id,
        v_investor_id,
        p_net_capital,
        CASE WHEN p_is_legacy THEN 'legacy' ELSE 'calculated' END,
        p_notes,
        NOW()
    );

    -- Update portfolio positions
    PERFORM portfolio.update_investor_positions(v_investor_id, v_deal_id);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.record_transaction_net_capital IS 
    'Single entry point for recording net capital at transaction level';

-- ============================================
-- 7. CREATE AUDIT TABLE FOR NET CAPITAL
-- ============================================

CREATE TABLE IF NOT EXISTS audit.net_capital_entries (
    id SERIAL PRIMARY KEY,
    transaction_id INTEGER REFERENCES public.transactions_clean(transaction_id),
    deal_id INTEGER REFERENCES public.deals_clean(deal_id),
    investor_id INTEGER REFERENCES public.investors_clean(investor_id),
    net_capital NUMERIC(15,2) NOT NULL,
    entry_type VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    created_by VARCHAR(255) DEFAULT current_user
);

CREATE INDEX idx_audit_net_capital_transaction ON audit.net_capital_entries(transaction_id);
CREATE INDEX idx_audit_net_capital_deal ON audit.net_capital_entries(deal_id);

-- ============================================
-- 8. CREATE VIEW FOR NET CAPITAL SUMMARY
-- ============================================

CREATE OR REPLACE VIEW public.net_capital_summary AS
WITH transaction_nc AS (
    SELECT 
        t.transaction_id,
        t.deal_id,
        t.investor_id,
        d.deal_name,
        i.investor_name,
        t.gross_capital,
        -- Use actual NC if provided, otherwise calculate
        COALESCE(
            t.net_capital_actual,
            t.initial_net_capital,
            public.calculate_net_capital(t.transaction_id)
        ) as net_capital,
        t.is_net_capital_provided,
        d.uses_net_capital_input as is_legacy_deal,
        d.formula_template,
        t.transaction_date
    FROM public.transactions_clean t
    JOIN public.deals_clean d ON t.deal_id = d.deal_id
    JOIN public.investors_clean i ON t.investor_id = i.investor_id
)
SELECT 
    deal_id,
    deal_name,
    COUNT(DISTINCT investor_id) as investor_count,
    COUNT(transaction_id) as transaction_count,
    SUM(gross_capital) as total_gross_capital,
    SUM(net_capital) as total_net_capital,
    SUM(CASE WHEN is_net_capital_provided THEN net_capital ELSE 0 END) as total_nc_provided,
    SUM(CASE WHEN NOT is_net_capital_provided THEN net_capital ELSE 0 END) as total_nc_calculated,
    AVG(CASE WHEN gross_capital > 0 THEN net_capital / gross_capital ELSE 1 END)::NUMERIC(5,4) as avg_nc_ratio,
    formula_template,
    bool_or(is_legacy_deal) as has_legacy_data
FROM transaction_nc
GROUP BY deal_id, deal_name, formula_template
ORDER BY deal_name;

COMMENT ON VIEW public.net_capital_summary IS 
    'Summary of net capital by deal showing both provided and calculated amounts';

-- ============================================
-- 9. GRANT PERMISSIONS
-- ============================================

GRANT SELECT ON public.formula_templates TO authenticated;
GRANT SELECT ON public.net_capital_summary TO authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_net_capital TO service_role;
GRANT EXECUTE ON FUNCTION public.record_transaction_net_capital TO service_role;

COMMIT;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check formula template distribution
SELECT 
    formula_template,
    nc_calculation_method,
    COUNT(*) as deal_count,
    SUM(CASE WHEN uses_net_capital_input THEN 1 ELSE 0 END) as legacy_count
FROM public.deals_clean
GROUP BY formula_template, nc_calculation_method
ORDER BY deal_count DESC;

-- Check net capital status
SELECT 
    d.deal_name,
    d.formula_template,
    COUNT(t.transaction_id) as txn_count,
    SUM(CASE WHEN t.is_net_capital_provided THEN 1 ELSE 0 END) as nc_provided_count,
    SUM(t.gross_capital) as total_gc,
    SUM(COALESCE(t.net_capital_actual, t.initial_net_capital)) as total_nc
FROM public.deals_clean d
LEFT JOIN public.transactions_clean t ON d.deal_id = t.deal_id
GROUP BY d.deal_id, d.deal_name, d.formula_template
ORDER BY d.deal_name;