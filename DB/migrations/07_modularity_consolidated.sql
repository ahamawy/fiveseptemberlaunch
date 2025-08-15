-- 07_modularity_consolidated.sql
-- Consolidated, modular, idempotent migration pack
-- NOTE: The "Dependent Views Window" (Section K) contains breaking renames and enum swaps.
-- Run Sections A–J first (safe). Then schedule a brief window to run Section K.

/* =========================================================
   Section 0) Schemas & Namespaces (idempotent)
   ========================================================= */

CREATE SCHEMA IF NOT EXISTS core;
CREATE SCHEMA IF NOT EXISTS ref;
CREATE SCHEMA IF NOT EXISTS fees;
CREATE SCHEMA IF NOT EXISTS analytics;

/* =========================================================
   Section A) Canonical Companies + IDs (safe)
   ========================================================= */

-- Keep companies.company (int PK) as canonical
-- Provide a marketing/UUID-compatible view for UI cards without duplicating data
CREATE OR REPLACE VIEW public.companies_v AS
SELECT
  -- Substitute with a stable UUID generator if desired (e.g., uuid_generate_v5 with a constant namespace)
  gen_random_uuid() AS id,
  c.company_name AS name,
  c.company_website AS website,
  c.company_sector AS sector,
  now() AS created_at,
  now() AS updated_at
FROM public."companies.company" c;

-- Make sure downstream FKs align to int PK (no-ops if already aligned)
-- (These are additive constraints; existing mismatched columns must be altered separately in app windows.)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname='documents_company_id_fkey') THEN
    ALTER TABLE public.documents
      ADD CONSTRAINT documents_company_id_fkey
      FOREIGN KEY (company_id) REFERENCES public."companies.company"(company_id);
  END IF;
END $$;

/* =========================================================
   Section B) Enums (staging only; full swaps in Section K)
   ========================================================= */

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='deal_type') THEN
    CREATE TYPE deal_type AS ENUM ('INVESTMENT','SECONDARY','ADVISORY');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='investor_type') THEN
    CREATE TYPE investor_type AS ENUM ('INDIVIDUAL','ENTITY','FAMILY_OFFICE','FUND');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='document_category') THEN
    CREATE TYPE document_category AS ENUM ('TERMSHEET','ALLOCATION_SHEET','OPERATING_AGREEMENT','SIDE_LETTER','SUBSCRIPTION','ENGAGEMENT','OTHER');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='legal_doc_status') THEN
    CREATE TYPE legal_doc_status AS ENUM ('pending','sent','signed','countersigned','completed','expired');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='transaction_status') THEN
    CREATE TYPE transaction_status AS ENUM ('pending','completed','cancelled');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='fee_component_type') THEN
    CREATE TYPE fee_component_type AS ENUM ('STRUCTURING','MANAGEMENT','PERFORMANCE','PREMIUM','ADMIN');
  END IF;
END $$;

/* =========================================================
   Section C) FX & Currency Hygiene (safe)
   ========================================================= */

CREATE TABLE IF NOT EXISTS ref.currencies (
  code        text PRIMARY KEY,
  decimals    int  NOT NULL,
  symbol      text
);

CREATE TABLE IF NOT EXISTS ref.fx_rates (
  as_of   date NOT NULL,
  base    text NOT NULL REFERENCES ref.currencies(code),
  quote   text NOT NULL REFERENCES ref.currencies(code),
  rate    numeric NOT NULL,
  source  text,
  PRIMARY KEY (as_of, base, quote)
);

-- Existing core.fx_rates / core.fx_ledger are kept for backward-compat.
CREATE TABLE IF NOT EXISTS core.fx_rates (
  fx_rate_id serial PRIMARY KEY,
  rate_date date NOT NULL,
  base_currency char(3) NOT NULL,
  quote_currency char(3) NOT NULL,
  rate numeric(12,6) NOT NULL,
  source text,
  UNIQUE(rate_date, base_currency, quote_currency)
);

CREATE TABLE IF NOT EXISTS core.fx_ledger (
  fx_ledger_id serial PRIMARY KEY,
  ref_table text NOT NULL,
  ref_id text NOT NULL,
  amount_original numeric(18,2) NOT NULL,
  currency_original char(3) NOT NULL,
  converted_to char(3) NOT NULL DEFAULT 'USD',
  rate_date date NOT NULL,
  rate numeric(12,6) NOT NULL,
  amount_converted numeric(18,2) GENERATED ALWAYS AS (amount_original * rate) STORED,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS fx_ledger_ref_idx ON core.fx_ledger(ref_table, ref_id);

-- Trigger to log FX and keep legacy USD column updated (non-breaking)
CREATE OR REPLACE FUNCTION public.deals_log_fx_and_update_usd() RETURNS trigger AS $$
DECLARE r numeric(12,6);
BEGIN
  SELECT rate INTO r
  FROM core.fx_rates
  WHERE rate_date = COALESCE(NEW.deal_date::date, CURRENT_DATE)
    AND base_currency = NEW.deal_currency
    AND quote_currency = 'USD'
  ORDER BY rate_date DESC
  LIMIT 1;

  IF r IS NULL THEN RETURN NEW; END IF;

  INSERT INTO core.fx_ledger(ref_table, ref_id, amount_original, currency_original, converted_to, rate_date, rate)
  VALUES ('deals.deal', NEW.deal_id::text, NEW.partner_subscription_capital, NEW.deal_currency, 'USD',
          COALESCE(NEW.deal_date::date, CURRENT_DATE), r)
  ON CONFLICT DO NOTHING;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='deals.deal' AND column_name='subscription_capital_usd'
  ) THEN
    NEW.subscription_capital_usd := ROUND(NEW.partner_subscription_capital * r, 2);
  END IF;

  RETURN NEW;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_deals_fx ON public."deals.deal";
CREATE TRIGGER trg_deals_fx
BEFORE INSERT OR UPDATE OF partner_subscription_capital, deal_currency, deal_date
ON public."deals.deal"
FOR EACH ROW EXECUTE FUNCTION public.deals_log_fx_and_update_usd();

/* =========================================================
   Section D) Documents & Workflow (safe)
   ========================================================= */

ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS bucket        text,
  ADD COLUMN IF NOT EXISTS storage_path  text,
  ADD COLUMN IF NOT EXISTS sha256        text UNIQUE,
  ADD COLUMN IF NOT EXISTS source_system text,
  ADD COLUMN IF NOT EXISTS origin_url    text;

-- Legal document workflow unique tuple (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname='u_doc_work'
  ) THEN
    ALTER TABLE public.legal_document_status
      ADD CONSTRAINT u_doc_work UNIQUE (document_id, investor_id, deal_id, document_type);
  END IF;
END $$;

/* =========================================================
   Section E) Fees & Discounts (safe foundations)
   ========================================================= */

CREATE TABLE IF NOT EXISTS fees.fee_schedule (
  id          bigserial PRIMARY KEY,
  scope_type  text CHECK (scope_type IN ('DEAL','INVESTOR','GLOBAL')),
  scope_id    bigint,
  component   fee_component_type NOT NULL,
  basis       text CHECK (basis IN ('GROSS','NET','UNITS','FLAT')) NOT NULL,
  rate_percent numeric,
  amount       numeric,
  starts_on   date,
  ends_on     date,
  version     int DEFAULT 1,
  is_active   boolean DEFAULT true
);

CREATE TABLE IF NOT EXISTS fees.fee_application (
  id               bigserial PRIMARY KEY,
  transaction_id   int REFERENCES public."transactions.transaction.primary"(transaction_id),
  component        fee_component_type NOT NULL,
  basis            text NOT NULL,
  rate_percent     numeric,
  amount           numeric NOT NULL,
  discount_percent numeric DEFAULT 0,
  discount_amount  numeric DEFAULT 0,
  calc_method      text,
  calc_hash        text,
  locked_by        uuid,
  locked_at        timestamptz,
  created_at       timestamptz DEFAULT now()
);

-- Updated_at helper (used later when standardising timestamps)
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$ LANGUAGE plpgsql;

/* =========================================================
   Section F) SPVs (safe; parallel structure)
   ========================================================= */

CREATE TABLE IF NOT EXISTS public.spvs2 (
  id             bigserial PRIMARY KEY,
  spv_name       text UNIQUE NOT NULL,
  company_id     int REFERENCES public."companies.company"(company_id),
  linked_deal_id int REFERENCES public."deals.deal"(deal_id),
  jurisdiction   text,
  entity_type    text,
  formation_date date,
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now()
);

/* =========================================================
   Section G) Valuations & Snapshots (safe)
   ========================================================= */

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname='u_deal_val'
  ) THEN
    ALTER TABLE public.deal_valuations
      ADD CONSTRAINT u_deal_val UNIQUE (deal_id, valuation_date);
  END IF;
END $$;

CREATE OR REPLACE VIEW public."companies.company_latest_valuation" AS
SELECT c.company_id,
       v.valuation_id,
       v.valuation_date,
       v.valuation_post_money
FROM public."companies.company" c
JOIN LATERAL (
  SELECT vv.*
  FROM public."valuations.valuation" vv
  WHERE vv.company_id = c.company_id
  ORDER BY vv.valuation_date DESC, vv.valuation_id DESC
  LIMIT 1
) v ON TRUE;

-- Materializable snapshot (example; customize columns as needed)
CREATE MATERIALIZED VIEW IF NOT EXISTS analytics.mv_investment_snapshots AS
SELECT s.investor_id, s.deal_id, s.company_id, s.snapshot_date,
       s.total_units, s.net_capital, s.entry_valuation, s.last_valuation,
       CASE WHEN s.entry_valuation = 0 THEN NULL
            ELSE (s.last_valuation / s.entry_valuation) END AS moic,
       (s.net_capital * CASE WHEN s.entry_valuation = 0 THEN 1
                             ELSE (s.last_valuation / s.entry_valuation) END) AS current_value
FROM public.investment_snapshots s;

/* =========================================================
   Section H) Events & Auditability (safe)
   ========================================================= */

ALTER TABLE public.portfolio_events
  ADD COLUMN IF NOT EXISTS correlation_id uuid,
  ADD COLUMN IF NOT EXISTS causation_id   uuid,
  ADD COLUMN IF NOT EXISTS partition_key  text,
  ADD COLUMN IF NOT EXISTS retries        int DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_audit_trail_table_when
  ON public.audit_trail(table_name, changed_at DESC);

CREATE INDEX IF NOT EXISTS idx_docsend_views_deal_inv_when
  ON public.docsend_views(deal_id, investor_id, created_at DESC);

/* =========================================================
   Section I) Notifications & Users (safe)
   ========================================================= */

DO $$ BEGIN
  -- Make user_id uuid-compatible and add FK to auth.users
  BEGIN
    ALTER TABLE public.notifications
      ALTER COLUMN user_id TYPE uuid USING NULLIF(user_id,'')::uuid;
  EXCEPTION WHEN others THEN
    -- Skip if already uuid-compatible
    NULL;
  END;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname='notifications_user_fkey'
  ) THEN
    ALTER TABLE public.notifications
      ADD CONSTRAINT notifications_user_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);
  END IF;
END $$;

/* =========================================================
   Section J) Analytics Views (safe; app-facing stable shapes)
   ========================================================= */

CREATE OR REPLACE VIEW analytics.v_deals AS
SELECT d.deal_id,
       d.deal_name,
       d.deal_type,
       d.deal_category,
       d.deal_date,
       d.exit_date,
       d.deal_currency,
       d.partner_company_id,
       d.underlying_company_id,
       d.holding_entity,
       d.partner_subscription_capital,
       d.subscription_capital_usd AS partner_subscription_capital_usd,
       d.transaction_count,
       d.deal_exited
FROM public."deals.deal" d;

CREATE OR REPLACE VIEW analytics.v_transactions AS
SELECT t.transaction_id,
       t.deal_id,
       t.investor_id,
       t.transaction_date,
       t.units,
       t.unit_price,
       t.gross_capital,
       t.net_capital,
       t.status
FROM public."transactions.transaction.primary" t;

CREATE OR REPLACE VIEW analytics.v_companies AS
SELECT c.company_id,
       c.company_name,
       c.company_type,
       c.company_website,
       c.sector,
       c.funding_round,
       lv.valuation_id,
       lv.valuation_date,
       lv.valuation_post_money
FROM public."companies.company" c
LEFT JOIN public."companies.company_latest_valuation" lv USING (company_id);

CREATE OR REPLACE VIEW analytics.v_investors AS
SELECT i.id AS investor_id,
       i.full_name,
       i.primary_email,
       i.country_of_residence,
       i.investor_type,
       i.kyc_status,
       i.investor_status,
       i."createdAt" AS created_at
FROM public."investors.investor" i;

/* =========================================================
   Section K) Dependent Views Window (breaking changes)
   - Run during a short maintenance window.
   - Drop/recreate all dependent views/mviews first.
   - Apply enum swaps & renames.
   - Recreate all views/mviews against new shapes.
   ========================================================= */

-- BEGIN;  -- Uncomment to run as a single transaction

-- 1) Drop dependents (extend this list to all known dependents in your project)
DROP MATERIALIZED VIEW IF EXISTS public.mv_deal_performance_summary;
DROP VIEW IF EXISTS public.deal_dashboard;
DROP VIEW IF EXISTS public.investment_structure_view;
DROP VIEW IF EXISTS public.v_deals;
DROP VIEW IF EXISTS public.v_deal_performance;
DROP VIEW IF EXISTS public.v_deal_transactions;
DROP VIEW IF EXISTS public.unified_entity_search;
DROP VIEW IF EXISTS public.enhanced_investor_analytics;
DROP VIEW IF EXISTS public.transaction_history_view;
DROP VIEW IF EXISTS public.agent_investor_summary;
DROP VIEW IF EXISTS public.agent_transaction_feed;
DROP VIEW IF EXISTS public.activity_feed;
DROP VIEW IF EXISTS public.deals;

-- 2) Standardize timestamps (snake_case)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='deals.deal' AND column_name='createdAt') THEN
    EXECUTE 'ALTER TABLE public."deals.deal" RENAME COLUMN "createdAt" TO created_at';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='deals.deal' AND column_name='updatedAt') THEN
    EXECUTE 'ALTER TABLE public."deals.deal" RENAME COLUMN "updatedAt" TO updated_at';
  END IF;
END $$;

DROP TRIGGER IF EXISTS trg_deals_updated_at ON public."deals.deal";
CREATE TRIGGER trg_deals_updated_at BEFORE UPDATE ON public."deals.deal"
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3) Column renames & drops
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='deals.deal' AND column_name='subscription_capital_usd'
  ) THEN
    EXECUTE 'ALTER TABLE public."deals.deal" RENAME COLUMN subscription_capital_usd TO partner_subscription_capital_usd';
  END IF;
END $$;

ALTER TABLE public."deals.deal" DROP COLUMN IF EXISTS closing_date;

-- 4) Enum conversions (swap pattern) — example for deal_category
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='deal_category_enum') THEN
    CREATE TYPE deal_category_enum AS ENUM ('INVESTMENT','SECONDARY','ADVISORY','DISTRIBUTION');
  END IF;
END $$;

ALTER TABLE public."deals.deal" ALTER COLUMN deal_category DROP DEFAULT;
ALTER TABLE public."deals.deal"
  ALTER COLUMN deal_category TYPE deal_category_enum
  USING (
    CASE UPPER(COALESCE(deal_category,''))
      WHEN 'INVESTMENT' THEN 'INVESTMENT'::deal_category_enum
      WHEN 'SECONDARY' THEN 'SECONDARY'::deal_category_enum
      WHEN 'ADVISORY' THEN 'ADVISORY'::deal_category_enum
      WHEN 'DISTRIBUTION' THEN 'DISTRIBUTION'::deal_category_enum
      ELSE 'INVESTMENT'::deal_category_enum
    END
  );
ALTER TABLE public."deals.deal" ALTER COLUMN deal_category SET DEFAULT 'INVESTMENT'::deal_category_enum;

-- Repeat swap pattern for other columns: legal_document_status.status → legal_doc_status, etc., as needed.

-- 5) Recreate all previously dropped views/mviews against new shapes (examples shown)
CREATE OR REPLACE VIEW public.investment_structure_view AS
SELECT d.deal_id,
       d.deal_name,
       d.deal_type,
       d.deal_category,
       CASE
         WHEN s.spv_name IS NOT NULL THEN 'SPV'
         WHEN d.deal_type = 'PARTNERSHIP'::deal_type THEN 'Partnership'
         WHEN d.deal_type IN ('INVESTMENT'::deal_type,'SECONDARY'::deal_type) THEN 'Direct'
         ELSE 'Advisory'
       END AS investment_structure,
       s.spv_name,
       s.jurisdiction,
       c.company_name,
       c.company_sector AS sector,
       d.partner_subscription_capital AS subscription_capital,
       d.partner_subscription_capital_usd AS subscription_capital_usd,
       d.exit_date
FROM public."deals.deal" d
LEFT JOIN public.spvs s ON d.deal_id = s.linked_deal_id
LEFT JOIN public."companies.company" c ON d.underlying_company_id = c.company_id;

-- Recreate other project-specific views here...

-- COMMIT;  -- Uncomment when executing the window

/* =========================================================
   Section L) RLS (Supabase) — example policy (safe)
   ========================================================= */

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  -- investor facing read policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='documents' AND policyname='p_docs_investor'
  ) THEN
    CREATE POLICY p_docs_investor ON public.documents
      FOR SELECT USING (
        auth.uid() = (
          SELECT user_id FROM public.user_profiles
          WHERE investor_id = public.documents.investor_id
        )
      );
  END IF;
END $$;


