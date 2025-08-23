# Supabase Schema Documentation

## Critical Understanding

The Equitie database uses a unique table naming convention that must be understood correctly:

### Table Naming Convention

**IMPORTANT**: Tables with dots in their names are actually **table names in the public schema**, not schema.table references.

Examples:
- `"deals.deal"` is a table name in the public schema
- `"companies.company"` is a table name in the public schema  
- `"investors.investor"` is a table name in the public schema
- `"transactions.transaction.primary"` is a table name in the public schema

### Correct Query Syntax

✅ **CORRECT**:
```javascript
// These are table names in public schema
await supabase.from("deals.deal").select("*")
await supabase.from("companies.company").select("*")
await supabase.from("investors.investor").select("*")
```

❌ **INCORRECT**:
```javascript
// This will fail - "deals" is not a schema
await supabase.schema("deals").from("deal").select("*")
```

### Key Tables and Their Locations

#### Public Schema (with dot notation names)
- `"deals.deal"` - Main deals table with deal_id, deal_name, deal_status
- `"companies.company"` - Companies with company_id, company_name
- `"investors.investor"` - Investors with investor_id, full_name
- `"transactions.transaction.primary"` - Primary transactions

#### Public Schema (regular names)
- `deal_valuations` - MOIC and IRR values per deal
- `transactions` - Transaction records
- `documents` - Document records

#### Core Schema
- `core.deals` - Alternative deals table (less commonly used)
- `core.companies` - Alternative companies table

## Data Enrichment Pattern

APIs fetch rich data by:
1. Querying main tables from public schema
2. Enriching with valuations from `deal_valuations`
3. Adding company details from `"companies.company"`
4. Including investor names from `"investors.investor"`

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