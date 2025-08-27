# Entity Relationships Documentation

## Core Entity Hierarchy

```
┌─────────────────┐
│   INVESTORS    │ ─────┐
└────────┬────────┘      │
         │               │
         │ 1:N           │ 1:N
         ↓               ↓
┌─────────────────┐     ┌──────────────────┐
│  TRANSACTIONS   │     │  INVESTOR_UNITS  │
└────────┬────────┘     └────────┬─────────┘
         │                       │
         │ N:1                   │ N:1
         ↓                       ↓
┌─────────────────┐     ┌──────────────────┐
│     DEALS       │←────┘                   │
└────────┬────────┘                         │
         │                                  │
         │ N:1 (multiple relationships)     │
         ↓                                  │
┌─────────────────┐                        │
│   COMPANIES     │←───────────────────────┘
└─────────────────┘
         ↑
         │ 1:N
┌─────────────────┐
│   DOCUMENTS     │
└─────────────────┘
```

## Table Relationships

### 1. INVESTORS_CLEAN (Core Entity)
**Primary Key:** `investor_id`

**Relationships:**
- **Has Many** → TRANSACTIONS_CLEAN (via `investor_id`)
- **Has Many** → INVESTOR_UNITS (via `investor_id`)
- **Has Many** → DOCUMENTS (via `investor_id`)
- **Can Be** → Subnominee in TRANSACTIONS_CLEAN (via `subnominee_investor_id`)

**Business Context:**
- Central entity representing all individuals and entities investing through the platform
- Tracks complete KYC, compliance, and profile information
- Serves as the foundation for all investment activities

### 2. DEALS_CLEAN (Investment Opportunities)
**Primary Key:** `deal_id`

**Relationships:**
- **Has Many** → TRANSACTIONS_CLEAN (via `deal_id`)
- **Has Many** → INVESTOR_UNITS (via `deal_id`)
- **Has Many** → DOCUMENTS (via `deal_id`)
- **Belongs To** → COMPANIES_CLEAN as `underlying_company_id` (portfolio company)
- **Belongs To** → COMPANIES_CLEAN as `holding_entity` (SPV/holding company)
- **Belongs To** → COMPANIES_CLEAN as `partner_company_id` (co-investor)

**Business Context:**
- Represents investment opportunities or deals
- Can have multiple company relationships (portfolio, holding, partner)
- Tracks all financial terms and fee structures

### 3. COMPANIES_CLEAN (Legal Entities)
**Primary Key:** `company_id`

**Relationships:**
- **Referenced By** → DEALS_CLEAN (3 different foreign keys)
- **Has Many** → DOCUMENTS (via `company_id`)

**Company Types:**
- `portfolio`: Companies being invested in
- `partner`: Co-investment partners
- `holding`: SPVs or holding entities

**Business Context:**
- Represents all legal entities in the ecosystem
- A single company can play multiple roles across different deals

### 4. TRANSACTIONS_CLEAN (Financial Movements)
**Primary Key:** `transaction_id`

**Relationships:**
- **Belongs To** → INVESTORS_CLEAN (via `investor_id`)
- **Belongs To** → DEALS_CLEAN (via `deal_id`)
- **Has Optional** → INVESTORS_CLEAN as subnominee (via `subnominee_investor_id`)
- **Has Many** → DOCUMENTS (via `transaction_id`)

**Transaction Types:**
- `primary`: Direct investment transactions
- `secondary`: Secondary market transactions
- `advisory`: Advisory fee transactions
- `subnominee`: Nominee structure transactions

**Business Context:**
- Records all financial transactions
- Supports complex fee structures and nominee arrangements
- Single source of truth for all transaction types

### 5. INVESTOR_UNITS (Investment Positions)
**Primary Key:** `id` (UUID)

**Relationships:**
- **Belongs To** → INVESTORS_CLEAN (via `investor_id`)
- **Belongs To** → DEALS_CLEAN (via `deal_id`)
- **Optional Mapping** → `formula_templates` (by deal `formula_template` value; no direct FK)
- **Has Optional** → CALCULATION_AUDIT_LOG (via `calculation_audit_id`)

**Business Context:**
- Tracks investor positions in deals
- Maintains current valuations and performance metrics
- Links to fee calculation frameworks

### 6. DOCUMENTS (Document Management)
**Primary Key:** `id` (UUID)

**Relationships:**
- **Belongs To Optional** → INVESTORS_CLEAN (via `investor_id`)
- **Belongs To Optional** → DEALS_CLEAN (via `deal_id`)
- **Belongs To Optional** → COMPANIES_CLEAN (via `company_id`)
- **Belongs To Optional** → TRANSACTIONS_CLEAN (via `transaction_id`)

**Business Context:**
- Centralized document storage
- Can be associated with any entity type
- Tracks legal documents, KYC, agreements

## Cardinality Rules

### One-to-Many (1:N)
- One INVESTOR can have many TRANSACTIONS
- One INVESTOR can have many INVESTOR_UNITS
- One DEAL can have many TRANSACTIONS
- One DEAL can have many INVESTOR_UNITS
- One COMPANY can be referenced by many DEALS

### Many-to-One (N:1)
- Many TRANSACTIONS belong to one DEAL
- Many TRANSACTIONS belong to one INVESTOR
- Many INVESTOR_UNITS belong to one INVESTOR
- Many INVESTOR_UNITS belong to one DEAL

### Optional Relationships
- DOCUMENTS can optionally belong to any main entity
- TRANSACTIONS can optionally have a subnominee investor
- DEALS have optional relationships to partner companies

## Data Flow Patterns

### Investment Flow
1. **Investor Onboarding**
   - Create INVESTOR record
   - Upload KYC DOCUMENTS
   - Complete compliance checks

2. **Deal Participation**
   - DEAL created with COMPANY associations
   - INVESTOR creates TRANSACTION in DEAL
   - System creates INVESTOR_UNITS record
   - Legal DOCUMENTS attached to TRANSACTION

3. **Portfolio Management**
   - INVESTOR_UNITS track ongoing valuations
   - Performance metrics calculated
   - Distributions processed through TRANSACTIONS

4. **Exit Process**
   - DEAL marked as exited
   - Exit TRANSACTIONS created
   - INVESTOR_UNITS updated with realized gains
   - Final DOCUMENTS generated

## Key Business Concepts

### Unit-Based Investment Model
- All investments are denominated in units
- Standard initial unit price (typically 1000)
- Units track ownership percentage
- Current valuations update unit prices

### Fee Structure Hierarchy
1. **Deal-Level Fees** (in DEALS_CLEAN)
   - EquiTie fees (structuring, management, performance, premium)
   - Partner fees (if co-investment)

2. **Transaction-Level Fees** (in TRANSACTIONS_CLEAN)
   - Applied per investor transaction
   - Can have discounts or special terms
   - Locked after processing

### Nominee Structures
- Investors can act as nominees for others
- Tracked via `nominee` flag and `subnominee_investor_id`
- Maintains beneficial ownership clarity

### Document Categories
- Legal documents (agreements, term sheets)
- KYC/compliance documents
- Transaction documents
- Company information

## Data Integrity Rules

1. **Referential Integrity**
   - All foreign keys must reference existing records
   - Cascading rules prevent orphaned records

2. **Business Logic Constraints**
   - Transaction dates must be after deal dates
   - Exit dates must be after purchase dates
   - Fees cannot be negative
   - Units purchased must be positive

3. **Status Transitions**
   - Deals: Draft → Raising → Active → Exited/Cancelled
   - Transactions: Pending → Completed/Cancelled
   - Documents: Draft → Pending → Executed/Expired

4. **Calculation Consistency**
   - Gross capital = units × unit_price
   - Current value = units × current_unit_price
   - Net proceeds consider all applicable fees

## Migration Notes

### Legacy View Compatibility
The system maintains backward compatibility through views:
- `investors.investor` → `investors_clean`
- `deals.deal` → `deals_clean`
- `companies.company` → `companies_clean`
- `transactions.transaction.primary` → `transactions_clean` (filtered)

### Primary Key Naming Convention
Clean tables use explicit primary key names:
- `investor_id` (not `id`)
- `deal_id` (not `id`)
- `company_id` (not `id`)
- `transaction_id` (not `id`)

This ensures clarity in joins and prevents ambiguity in queries.