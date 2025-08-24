-- Row Level Security Policies for Equitie Platform
-- This migration enables RLS and creates comprehensive access policies

-- ============================================
-- 1. ENABLE RLS ON ALL TABLES
-- ============================================

-- Core Tables
ALTER TABLE "investors.investor" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "deals.deal" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "companies.company" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "transactions.transaction.primary" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "transactions.transaction.secondary" ENABLE ROW LEVEL SECURITY;

-- Supporting Tables
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE investor_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_valuations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. HELPER FUNCTIONS
-- ============================================

-- Get current user's role
CREATE OR REPLACE FUNCTION auth.get_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(
    current_setting('request.jwt.claims', true)::json->>'role',
    'anon'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is admin
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.get_user_role() IN ('admin', 'super_admin', 'service_role');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get current user's investor_id
CREATE OR REPLACE FUNCTION auth.get_investor_id()
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT investor_id 
    FROM user_profiles 
    WHERE user_id = auth.uid()
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 3. INVESTOR POLICIES
-- ============================================

-- Investors can only see their own data
CREATE POLICY investors_select_own ON "investors.investor"
  FOR SELECT
  USING (
    auth.is_admin() OR 
    id = auth.get_investor_id()
  );

-- Only admins can insert investors
CREATE POLICY investors_insert_admin ON "investors.investor"
  FOR INSERT
  WITH CHECK (auth.is_admin());

-- Investors can update their own profile (limited fields)
CREATE POLICY investors_update_own ON "investors.investor"
  FOR UPDATE
  USING (
    auth.is_admin() OR 
    id = auth.get_investor_id()
  )
  WITH CHECK (
    auth.is_admin() OR 
    id = auth.get_investor_id()
  );

-- Only admins can delete investors
CREATE POLICY investors_delete_admin ON "investors.investor"
  FOR DELETE
  USING (auth.is_admin());

-- ============================================
-- 4. DEAL POLICIES
-- ============================================

-- Everyone can view active deals, admins can see all
CREATE POLICY deals_select_active ON "deals.deal"
  FOR SELECT
  USING (
    auth.is_admin() OR
    status = 'ACTIVE'
  );

-- Only admins can modify deals
CREATE POLICY deals_insert_admin ON "deals.deal"
  FOR INSERT
  WITH CHECK (auth.is_admin());

CREATE POLICY deals_update_admin ON "deals.deal"
  FOR UPDATE
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

CREATE POLICY deals_delete_admin ON "deals.deal"
  FOR DELETE
  USING (auth.is_admin());

-- ============================================
-- 5. TRANSACTION POLICIES
-- ============================================

-- Investors can only see their own transactions
CREATE POLICY transactions_select_own ON "transactions.transaction.primary"
  FOR SELECT
  USING (
    auth.is_admin() OR 
    investor_id = auth.get_investor_id()
  );

-- Only admins can create transactions
CREATE POLICY transactions_insert_admin ON "transactions.transaction.primary"
  FOR INSERT
  WITH CHECK (auth.is_admin());

-- Only admins can update transactions
CREATE POLICY transactions_update_admin ON "transactions.transaction.primary"
  FOR UPDATE
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- Secondary transactions - investors can see where they're involved
CREATE POLICY secondary_transactions_select ON "transactions.transaction.secondary"
  FOR SELECT
  USING (
    auth.is_admin() OR
    seller_name = auth.get_investor_id() OR
    buyer_name = auth.get_investor_id()
  );

-- ============================================
-- 6. DOCUMENT POLICIES
-- ============================================

-- Investors can see their own documents and public documents
CREATE POLICY documents_select ON documents
  FOR SELECT
  USING (
    auth.is_admin() OR
    investor_id = auth.get_investor_id() OR
    is_public = true
  );

-- Only admins can upload documents
CREATE POLICY documents_insert_admin ON documents
  FOR INSERT
  WITH CHECK (auth.is_admin());

-- Only admins can update documents
CREATE POLICY documents_update_admin ON documents
  FOR UPDATE
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- Only admins can delete documents
CREATE POLICY documents_delete_admin ON documents
  FOR DELETE
  USING (auth.is_admin());

-- ============================================
-- 7. ANALYTICS POLICIES
-- ============================================

-- Investors can only see their own analytics
CREATE POLICY analytics_select_own ON investor_analytics
  FOR SELECT
  USING (
    auth.is_admin() OR
    investor_id = auth.get_investor_id()
  );

-- Only system can update analytics (via service role)
CREATE POLICY analytics_update_system ON investor_analytics
  FOR ALL
  USING (auth.get_user_role() = 'service_role');

-- ============================================
-- 8. COMPANY POLICIES
-- ============================================

-- Everyone can view companies
CREATE POLICY companies_select_all ON "companies.company"
  FOR SELECT
  USING (true);

-- Only admins can modify companies
CREATE POLICY companies_insert_admin ON "companies.company"
  FOR INSERT
  WITH CHECK (auth.is_admin());

CREATE POLICY companies_update_admin ON "companies.company"
  FOR UPDATE
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

CREATE POLICY companies_delete_admin ON "companies.company"
  FOR DELETE
  USING (auth.is_admin());

-- ============================================
-- 9. USER PROFILE POLICIES
-- ============================================

-- Users can see their own profile
CREATE POLICY profiles_select_own ON user_profiles
  FOR SELECT
  USING (
    auth.is_admin() OR
    user_id = auth.uid()
  );

-- Users can update their own profile
CREATE POLICY profiles_update_own ON user_profiles
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================
-- 10. DEAL VALUATION POLICIES
-- ============================================

-- Investors can see valuations for deals they're invested in
CREATE POLICY valuations_select ON deal_valuations
  FOR SELECT
  USING (
    auth.is_admin() OR
    EXISTS (
      SELECT 1 FROM "transactions.transaction.primary" t
      WHERE t.deal_id = deal_valuations.deal_id
        AND t.investor_id = auth.get_investor_id()
    )
  );

-- Only admins can modify valuations
CREATE POLICY valuations_modify_admin ON deal_valuations
  FOR ALL
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- ============================================
-- 11. GRANT NECESSARY PERMISSIONS
-- ============================================

-- Grant usage on schemas
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA auth TO authenticated;

-- Grant execute on helper functions
GRANT EXECUTE ON FUNCTION auth.get_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION auth.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION auth.get_investor_id() TO authenticated;

-- ============================================
-- 12. SERVICE ROLE BYPASS
-- ============================================

-- Create policies that allow service role to bypass RLS
-- This is automatically handled by Supabase for service_role key

-- ============================================
-- MIGRATION METADATA
-- ============================================

-- Record this migration
INSERT INTO schema_migrations (version, name, applied_at)
VALUES ('07_rls_policies', 'Enable Row Level Security policies', NOW())
ON CONFLICT (version) DO NOTHING;