# Supabase Schema Documentation

## Critical Understanding

The Equitie database uses a unique table naming convention that must be understood correctly:

### Table Naming Convention

**IMPORTANT**: Tables with dots in their names are actually **table names in the public schema**, not schema.table references.

Examples (public schema table names):

- `"deals.deal"`
- `"companies.company"`
- `"investors.investor"`
- `"transactions.transaction.primary"` (legacy)

### Correct Query Syntax

✅ **CORRECT**:

```javascript
// Dot-named tables (public schema)
await supabase.from("deals.deal").select("*")
await supabase.from("companies.company").select("*")

// Regular public tables (no dot in the name)
await supabase.from("transactions").select("*")
await supabase.from("deal_valuations").select("deal_id, moic, irr, valuation_date")
```

❌ **INCORRECT**:

```javascript
// This will fail - "deals" is not a schema here; the dot is part of the table name
await supabase.schema("deals").from("deal").select("*")
```

### Key Tables and Their Locations

#### Public Schema (dot-named tables)

- `"deals.deal"` — Main deals table (deal_id, deal_name, deal_status, deal_type, deal_currency, underlying_company_id)
- `"companies.company"` — Companies (company_id, company_name, company_sector)
- `"investors.investor"` — Investors (investor_id, full_name)
- `"transactions.transaction.primary"` — Legacy transactions (not used by current APIs)

#### Public Schema (regular names)

- `deal_valuations` — MOIC and IRR values per deal (use latest by valuation_date)
- `transactions` — Transaction records (preferred over legacy dot-named table)
- `documents` — Document records

#### Core Schema

- `core.deals` — Exists but not used by current app paths
- `core.companies` — Exists but not used by current app paths

## Data Enrichment Pattern

APIs fetch rich data by:

1. Querying main tables from public schema ("deals.deal", "companies.company", "transactions")
2. Enriching with valuations from `deal_valuations` (keep only latest per deal by valuation_date)
3. Adding company details from `"companies.company"` (join by `underlying_company_id` → `company_id`)
4. Including investor names from `"investors.investor"` when needed

FK/Type notes:

- `deals.deal.deal_id` is bigint
- `companies.company.company_id` is bigint
- Join using bigint columns; do not mix with UUIDs from unrelated tables

## Real Data Examples

### Deals with High MOIC

- Figure AI Series B: 15x MOIC
- OpenAI Partnership: 10.3x MOIC
- SpaceX Partnership: 5.3x MOIC
- Marlo Direct Deal: 5x MOIC

### Transaction Data

- Real amounts in USD, EUR, GBP
- Linked to actual deal and investor names
- Capital calls, distributions tracked

## Service Layer Integration

All database queries go through the service layer:

- `lib/services/deals.service.ts`
- `lib/services/investors.service.ts`
- `lib/services/transactions.service.ts`

These services handle caching, error handling, and data transformation.
