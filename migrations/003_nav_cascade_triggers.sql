-- Migration: NAV Cascade Update Triggers
-- Purpose: Automatically update token NAV when company valuations change
-- Author: System Sync
-- Date: 2025-01-28

BEGIN;

-- ============================================
-- 1. ENHANCED NAV CALCULATION FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION portfolio.calculate_deal_nav(p_deal_id INTEGER)
RETURNS NUMERIC AS $$
DECLARE
    v_total_value NUMERIC := 0;
    v_total_tokens NUMERIC;
    v_nav NUMERIC;
BEGIN
    -- Calculate total portfolio value for the deal
    -- This handles many-to-many relationships properly
    SELECT 
        COALESCE(SUM(
            dcp.shares_owned * COALESCE(cv.latest_price, dcp.purchase_price_per_share)
        ), 0)
    INTO v_total_value
    FROM portfolio.deal_company_positions dcp
    LEFT JOIN LATERAL (
        SELECT share_price as latest_price
        FROM portfolio.company_valuations
        WHERE company_id = dcp.company_id
        ORDER BY valuation_date DESC
        LIMIT 1
    ) cv ON true
    WHERE dcp.deal_id = p_deal_id
    AND dcp.position_status = 'active';

    -- Get total tokens outstanding
    SELECT tokens_outstanding 
    INTO v_total_tokens
    FROM portfolio.deal_tokens
    WHERE deal_id = p_deal_id;

    -- Calculate NAV per token
    IF v_total_tokens > 0 THEN
        v_nav := v_total_value / v_total_tokens;
    ELSE
        v_nav := 0;
    END IF;

    RETURN v_nav;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 2. UPDATE TOKEN NAV FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION portfolio.update_token_nav(p_deal_id INTEGER DEFAULT NULL)
RETURNS VOID AS $$
DECLARE
    v_deal RECORD;
    v_nav NUMERIC;
    v_old_nav NUMERIC;
BEGIN
    -- If specific deal provided, update just that one
    IF p_deal_id IS NOT NULL THEN
        -- Get current NAV
        SELECT nav_per_token INTO v_old_nav
        FROM portfolio.deal_tokens
        WHERE deal_id = p_deal_id;

        -- Calculate new NAV
        v_nav := portfolio.calculate_deal_nav(p_deal_id);

        -- Update token NAV
        UPDATE portfolio.deal_tokens
        SET 
            nav_per_token = v_nav,
            last_nav_update = NOW(),
            updated_at = NOW()
        WHERE deal_id = p_deal_id;

        -- Log NAV change
        INSERT INTO portfolio.nav_history (
            deal_id,
            calculation_date,
            nav_per_token,
            total_portfolio_value,
            calculation_method
        ) VALUES (
            p_deal_id,
            CURRENT_DATE,
            v_nav,
            v_nav * (SELECT tokens_outstanding FROM portfolio.deal_tokens WHERE deal_id = p_deal_id),
            'weighted_portfolio'
        );

        -- Update investor positions
        PERFORM portfolio.update_investor_positions_for_deal(p_deal_id);

    ELSE
        -- Update all deals
        FOR v_deal IN 
            SELECT DISTINCT deal_id 
            FROM portfolio.deal_tokens
        LOOP
            PERFORM portfolio.update_token_nav(v_deal.deal_id);
        END LOOP;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 3. UPDATE INVESTOR POSITIONS
-- ============================================

CREATE OR REPLACE FUNCTION portfolio.update_investor_positions_for_deal(p_deal_id INTEGER)
RETURNS VOID AS $$
DECLARE
    v_nav NUMERIC;
BEGIN
    -- Get current NAV
    SELECT nav_per_token INTO v_nav
    FROM portfolio.deal_tokens
    WHERE deal_id = p_deal_id;

    -- Update all investor positions for this deal
    UPDATE portfolio.investor_token_positions itp
    SET 
        current_value = token_amount * v_nav,
        unrealized_gain_loss = (token_amount * v_nav) - cost_basis,
        last_updated = NOW()
    WHERE deal_id = p_deal_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 4. TRIGGER FOR COMPANY VALUATION CHANGES
-- ============================================

-- Function to handle company valuation updates
CREATE OR REPLACE FUNCTION portfolio.cascade_valuation_update()
RETURNS TRIGGER AS $$
DECLARE
    v_deal RECORD;
BEGIN
    -- Find all deals affected by this company valuation change
    FOR v_deal IN 
        SELECT DISTINCT deal_id
        FROM portfolio.deal_company_positions
        WHERE company_id = NEW.company_id
        AND position_status = 'active'
    LOOP
        -- Update NAV for each affected deal
        PERFORM portfolio.update_token_nav(v_deal.deal_id);
    END LOOP;

    -- Log the cascade
    INSERT INTO audit.nav_cascade_log (
        trigger_type,
        company_id,
        new_valuation,
        affected_deals,
        created_at
    ) VALUES (
        'company_valuation_update',
        NEW.company_id,
        NEW.share_price,
        (SELECT array_agg(deal_id) 
         FROM portfolio.deal_company_positions 
         WHERE company_id = NEW.company_id),
        NOW()
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on company valuations
DROP TRIGGER IF EXISTS trg_cascade_valuation_update ON portfolio.company_valuations;
CREATE TRIGGER trg_cascade_valuation_update
    AFTER INSERT OR UPDATE OF share_price
    ON portfolio.company_valuations
    FOR EACH ROW
    EXECUTE FUNCTION portfolio.cascade_valuation_update();

-- ============================================
-- 5. TRIGGER FOR POSITION CHANGES
-- ============================================

CREATE OR REPLACE FUNCTION portfolio.cascade_position_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Update NAV when position changes
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        PERFORM portfolio.update_token_nav(NEW.deal_id);
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM portfolio.update_token_nav(OLD.deal_id);
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger on deal company positions
DROP TRIGGER IF EXISTS trg_cascade_position_update ON portfolio.deal_company_positions;
CREATE TRIGGER trg_cascade_position_update
    AFTER INSERT OR UPDATE OR DELETE
    ON portfolio.deal_company_positions
    FOR EACH ROW
    EXECUTE FUNCTION portfolio.cascade_position_update();

-- ============================================
-- 6. AUDIT LOG FOR CASCADE UPDATES
-- ============================================

CREATE TABLE IF NOT EXISTS audit.nav_cascade_log (
    id SERIAL PRIMARY KEY,
    trigger_type VARCHAR(50),
    company_id INTEGER,
    deal_id INTEGER,
    new_valuation NUMERIC,
    old_valuation NUMERIC,
    affected_deals INTEGER[],
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_nav_cascade_log_company ON audit.nav_cascade_log(company_id);
CREATE INDEX idx_nav_cascade_log_deal ON audit.nav_cascade_log(deal_id);
CREATE INDEX idx_nav_cascade_log_created ON audit.nav_cascade_log(created_at);

-- ============================================
-- 7. BATCH VALUATION UPDATE FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION portfolio.batch_update_valuations(
    p_valuations JSONB
) RETURNS TABLE (
    company_id INTEGER,
    old_price NUMERIC,
    new_price NUMERIC,
    deals_affected INTEGER
) AS $$
DECLARE
    v_valuation JSONB;
    v_company_id INTEGER;
    v_new_price NUMERIC;
    v_old_price NUMERIC;
    v_deals_count INTEGER;
BEGIN
    -- Process each valuation
    FOR v_valuation IN SELECT * FROM jsonb_array_elements(p_valuations)
    LOOP
        v_company_id := (v_valuation->>'company_id')::INTEGER;
        v_new_price := (v_valuation->>'share_price')::NUMERIC;

        -- Get old price
        SELECT share_price INTO v_old_price
        FROM portfolio.company_valuations
        WHERE company_id = v_company_id
        ORDER BY valuation_date DESC
        LIMIT 1;

        -- Insert new valuation
        INSERT INTO portfolio.company_valuations (
            company_id,
            valuation_date,
            share_price,
            valuation_method,
            valuation_source,
            created_at
        ) VALUES (
            v_company_id,
            CURRENT_DATE,
            v_new_price,
            COALESCE(v_valuation->>'method', 'market'),
            COALESCE(v_valuation->>'source', 'quarterly_mark'),
            NOW()
        );

        -- Count affected deals
        SELECT COUNT(DISTINCT deal_id) INTO v_deals_count
        FROM portfolio.deal_company_positions
        WHERE company_id = v_company_id
        AND position_status = 'active';

        -- Return result
        company_id := v_company_id;
        old_price := v_old_price;
        new_price := v_new_price;
        deals_affected := v_deals_count;
        RETURN NEXT;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 8. REAL-TIME NAV VIEW
-- ============================================

CREATE OR REPLACE VIEW portfolio.real_time_nav AS
WITH current_values AS (
    SELECT 
        dt.deal_id,
        d.deal_name,
        dt.token_symbol,
        dt.nav_per_token,
        dt.tokens_outstanding,
        dt.nav_per_token * dt.tokens_outstanding as total_nav,
        dt.last_nav_update,
        -- Check if NAV needs update
        CASE 
            WHEN EXISTS (
                SELECT 1 
                FROM portfolio.deal_company_positions dcp
                JOIN portfolio.company_valuations cv ON cv.company_id = dcp.company_id
                WHERE dcp.deal_id = dt.deal_id
                AND cv.created_at > dt.last_nav_update
            ) THEN true
            ELSE false
        END as needs_update,
        -- Calculate real-time NAV
        portfolio.calculate_deal_nav(dt.deal_id) as real_time_nav
    FROM portfolio.deal_tokens dt
    JOIN public.deals_clean d ON d.deal_id = dt.deal_id
)
SELECT 
    *,
    real_time_nav - nav_per_token as nav_change,
    CASE 
        WHEN nav_per_token > 0 THEN 
            ((real_time_nav - nav_per_token) / nav_per_token * 100)::NUMERIC(5,2)
        ELSE 0
    END as nav_change_pct
FROM current_values
ORDER BY deal_name;

COMMENT ON VIEW portfolio.real_time_nav IS 
    'Real-time NAV calculation showing current values and pending updates';

-- ============================================
-- 9. MONITORING FUNCTIONS
-- ============================================

-- Function to check NAV health
CREATE OR REPLACE FUNCTION portfolio.check_nav_health()
RETURNS TABLE (
    deal_id INTEGER,
    deal_name VARCHAR,
    last_update TIMESTAMP,
    hours_since_update NUMERIC,
    needs_update BOOLEAN,
    health_status VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        dt.deal_id,
        d.deal_name,
        dt.last_nav_update,
        EXTRACT(EPOCH FROM (NOW() - dt.last_nav_update)) / 3600 as hours_since_update,
        EXISTS (
            SELECT 1 
            FROM portfolio.deal_company_positions dcp
            JOIN portfolio.company_valuations cv ON cv.company_id = dcp.company_id
            WHERE dcp.deal_id = dt.deal_id
            AND cv.created_at > dt.last_nav_update
        ) as needs_update,
        CASE 
            WHEN dt.last_nav_update < NOW() - INTERVAL '7 days' THEN 'STALE'
            WHEN dt.last_nav_update < NOW() - INTERVAL '1 day' THEN 'AGING'
            ELSE 'FRESH'
        END as health_status
    FROM portfolio.deal_tokens dt
    JOIN public.deals_clean d ON d.deal_id = dt.deal_id
    ORDER BY dt.last_nav_update ASC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 10. SCHEDULED UPDATE FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION portfolio.scheduled_nav_update()
RETURNS JSONB AS $$
DECLARE
    v_updates INTEGER := 0;
    v_errors INTEGER := 0;
    v_deal RECORD;
    v_start_time TIMESTAMP := NOW();
BEGIN
    -- Update all deals that need it
    FOR v_deal IN 
        SELECT deal_id 
        FROM portfolio.real_time_nav 
        WHERE needs_update = true
    LOOP
        BEGIN
            PERFORM portfolio.update_token_nav(v_deal.deal_id);
            v_updates := v_updates + 1;
        EXCEPTION WHEN OTHERS THEN
            v_errors := v_errors + 1;
            -- Log error
            INSERT INTO audit.nav_cascade_log (
                trigger_type,
                deal_id,
                created_at
            ) VALUES (
                'scheduled_update_error: ' || SQLERRM,
                v_deal.deal_id,
                NOW()
            );
        END;
    END LOOP;

    RETURN jsonb_build_object(
        'updates', v_updates,
        'errors', v_errors,
        'duration_ms', EXTRACT(EPOCH FROM (NOW() - v_start_time)) * 1000,
        'timestamp', NOW()
    );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 11. GRANT PERMISSIONS
-- ============================================

GRANT SELECT ON portfolio.real_time_nav TO authenticated;
GRANT EXECUTE ON FUNCTION portfolio.check_nav_health TO authenticated;
GRANT EXECUTE ON FUNCTION portfolio.scheduled_nav_update TO service_role;
GRANT SELECT ON audit.nav_cascade_log TO authenticated;

COMMIT;

-- ============================================
-- TEST THE CASCADE
-- ============================================

-- Test by updating a company valuation
/*
UPDATE portfolio.company_valuations
SET share_price = share_price * 1.1
WHERE company_id = 1;

-- Check cascade results
SELECT * FROM audit.nav_cascade_log ORDER BY created_at DESC LIMIT 5;
SELECT * FROM portfolio.real_time_nav WHERE needs_update = true;
*/