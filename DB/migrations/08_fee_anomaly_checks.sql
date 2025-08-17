-- Fee Anomaly Detection Views (non-destructive)
-- Uses existing tables: fees.fee_application, fees.legacy_import

CREATE SCHEMA IF NOT EXISTS analytics;

-- Drop old views if they exist
DROP VIEW IF EXISTS analytics.v_fee_anomalies CASCADE;
DROP VIEW IF EXISTS analytics.v_fee_validation CASCADE;
DROP VIEW IF EXISTS analytics.v_discount_validation CASCADE;
DROP VIEW IF EXISTS analytics.v_fee_health_summary CASCADE;

-- 1) Basic anomaly checks
-- - Discounts should be negative amounts
-- - Applied should be true for persisted rows
-- - Amount should be >= 0 for non-discount components
CREATE VIEW analytics.v_fee_anomalies AS
SELECT
  fa.id AS fee_application_id,
  fa.transaction_id,
  fa.deal_id,
  fa.component,
  fa.amount,
  fa.percent,
  fa.applied,
  fa.notes,
  CASE
    WHEN fa.component ILIKE '%DISCOUNT%' AND (fa.amount IS NULL OR fa.amount >= 0)
      THEN 'DISCOUNT_NOT_NEGATIVE'
    WHEN fa.component NOT ILIKE '%DISCOUNT%' AND (fa.amount IS NOT NULL AND fa.amount < 0)
      THEN 'NON_DISCOUNT_NEGATIVE'
    WHEN fa.applied IS FALSE THEN 'NOT_APPLIED'
    ELSE NULL
  END AS anomaly
FROM fees.fee_application fa
WHERE (
  (fa.component ILIKE '%DISCOUNT%' AND (fa.amount IS NULL OR fa.amount >= 0))
  OR (fa.component NOT ILIKE '%DISCOUNT%' AND (fa.amount IS NOT NULL AND fa.amount < 0))
  OR (fa.applied IS FALSE)
);

-- 2) Transaction-level validation summary
-- Pre = sum positive amounts; Discounts = abs(sum negative amounts); Post = Pre - Discounts
CREATE VIEW analytics.v_fee_validation AS
WITH agg AS (
  SELECT
    fa.transaction_id,
    fa.deal_id,
    SUM(CASE WHEN fa.amount >= 0 OR fa.amount IS NULL THEN COALESCE(fa.amount, 0) ELSE 0 END) AS total_pre,
    ABS(SUM(CASE WHEN fa.amount < 0 THEN fa.amount ELSE 0 END)) AS total_discounts
  FROM fees.fee_application fa
  GROUP BY fa.transaction_id, fa.deal_id
)
SELECT
  a.transaction_id,
  a.deal_id,
  a.total_pre,
  a.total_discounts,
  (a.total_pre - a.total_discounts) AS total_post
FROM agg a;

-- 3) Discount validation
-- Flags discounts whose magnitude exceeds corresponding positive component amount (by name heuristic)
-- This uses a simple heuristic matching by component stem before '_DISCOUNT'
CREATE VIEW analytics.v_discount_validation AS
WITH base AS (
  SELECT transaction_id, deal_id, component, amount
  FROM fees.fee_application
  WHERE component NOT ILIKE '%DISCOUNT%'
),
disc AS (
  SELECT transaction_id, deal_id, component, ABS(COALESCE(amount,0)) AS discount_amount,
         REGEXP_REPLACE(component, '_DISCOUNT$', '') AS base_component
  FROM fees.fee_application
  WHERE component ILIKE '%_DISCOUNT'
)
SELECT
  d.transaction_id,
  d.deal_id,
  d.component AS discount_component,
  b.component AS base_component,
  b.amount AS base_amount,
  d.discount_amount,
  CASE WHEN d.discount_amount > COALESCE(b.amount, 0) THEN true ELSE false END AS exceeds_base
FROM disc d
LEFT JOIN base b
  ON b.transaction_id = d.transaction_id
 AND b.deal_id = d.deal_id
 AND b.component = d.base_component;

-- 4) Health summary
CREATE VIEW analytics.v_fee_health_summary AS
SELECT
  COALESCE(100 - (SELECT COUNT(*) FROM analytics.v_fee_anomalies) * 5, 100) AS health_score,
  (SELECT COUNT(*) FROM analytics.v_fee_anomalies) AS anomalies,
  (SELECT COUNT(*) FROM analytics.v_discount_validation WHERE exceeds_base) AS over_discounts;
