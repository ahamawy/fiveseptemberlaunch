# EQUITIE Institutional Documentation Index

## Purpose
A single entry point for business logic and Supabase mapping documentation. Use this index to navigate canonical references, fee calculation specs, schema mappings, and QA gates.

## Canonical References
- Formula Engine (templates, variables, validations): `BRANDING/FORMULA_ENGINE.md`
- Fee Calculation Bible (timing, sequences, partner splits): `BRANDING/FEE_CALCULATION_BIBLE.md`
- Supabase Gaps Analysis and Migrations: `BRANDING/SUPABASE_GAPS_ANALYSIS.md`
- Clean Schema & Feature Overview: `CLAUDE.md` (section: "Clean Schema with Formula Engine")
- Data Taxonomy: `BRANDING/CONSOLIDATED_DATA_MODEL.csv`
- Data Glossary: `BRANDING/DATA_GLOSSARY.csv`
- Entity Relationships: `BRANDING/ENTITY_RELATIONSHIPS.md`
- Enumerations: `BRANDING/ENUM_REFERENCE.md`

## Fee Engine Context
Authoritative implementation lives in `lib/services/fee-engine/` and `BRANDING/FORMULA_ENGINE.md`.

## Schema Mapping Addendum
- Formula Engine ↔ Clean Schema mapping and invariants: `BRANDING/FORMULA_ENGINE_SCHEMA_MAPPING.md`

## Operational Guides
- Docs QA Checklist (institutional grade bar): `BRANDING/DOCS_QA_CHECKLIST.md`
- Brand Tokens and UI components: `BRANDING/brand.config.ts` and `components/style-guide/*`

## Reading Order
1) `CLAUDE.md` → Clean tables and where features live
2) `BRANDING/FORMULA_ENGINE.md` → Templates and variable glossary
3) `BRANDING/FEE_CALCULATION_BIBLE.md` → Timing, sequences, partner splits
4) `BRANDING/FORMULA_ENGINE_SCHEMA_MAPPING.md` → DB field mapping and invariants
5) `BRANDING/SUPABASE_GAPS_ANALYSIS.md` → Migration and readiness checks

## Validation & Audit Requirements
- All fee calculations must:
  - Respect precedence ordering (structuring → premium → admin → management → performance)
  - Apply discounts as reductions (store discounts as NEGATIVE fee entries where applicable)
  - Round money to 2 decimals; units are integers (floor division)
  - Produce an audit trail with inputs, steps, and outputs (`formula_calculation_log`)

## Ownership & Update Policy
- Technical Owner: Fees/Deal Engine team (`/lib/services/fee-engine`)
- Document Owner: Platform Architecture
- Review Cadence: Monthly or after schema changes
- Versioning: Maintain change logs at bottom of each doc

## Last Updated
- 2024-11-26 (aligned with migrations adding enums and deal fields)

