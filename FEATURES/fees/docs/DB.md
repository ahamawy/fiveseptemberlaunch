# Fees — Database (References Only)

## Tables

- `fees.fee_schedule`
- `fees.schedule_version`
- `fees.fee_application`
- `fees.legacy_import`

## Views (analytics)

- `analytics.v_fee_import_preview`
- `analytics.v_fee_profiles`

## Rules

- PREMIUM precedence = 1; discounts stored as negative in `fees.fee_application`.
- Round money to 2 decimals; units are integers (floor).

## References

- `ARCHON_FEE_ENGINE_CONTEXT.md`
- `DB/schema.sql`, `DB/migrations/*`
