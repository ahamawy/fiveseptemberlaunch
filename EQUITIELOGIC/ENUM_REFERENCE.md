# Enum Reference Documentation

## Overview
This document provides a comprehensive reference for all enumerated types (enums) used in the Supabase clean tables. Enums ensure data consistency and provide controlled vocabularies for specific fields.

## Core Business Enums

### 1. Investor Type (`investor_type_enum`)
Used in: `investors_clean.investor_type`

| Value | Description | Business Impact |
|-------|-------------|-----------------|
| `INDIVIDUAL` | Natural person investor | Standard KYC process, personal tax implications |
| `COMPANY` | Corporate entity investor | Enhanced due diligence, corporate documents required |

**Usage Notes:**
- Determines document requirements for onboarding
- Affects fee structures and tax treatment
- Impacts communication and reporting formats

### 2. Deal Type (`deal_type_enum`)
Used in: `deals_clean.deal_type`

| Value | Description | Fee Structure |
|-------|-------------|---------------|
| `primary` | Direct primary investment | Full fee structure applies |
| `secondary` | Secondary market transaction | Modified fee structure |
| `revenue_share` | Revenue sharing arrangement | Performance-based fees only |
| `advisory_shares` | Shares for advisory services | No investor fees |
| `spv` | Special Purpose Vehicle | Pass-through fee structure |
| `partnership` | Partnership co-investment | Split fee arrangement |
| `facilitated_direct` | Direct facilitation | Facilitation fee only |
| `facilitated_indirect` | Indirect facilitation | Reduced fee structure |

**Usage Notes:**
- Critical for fee calculation logic
- Determines legal document requirements
- Affects investor reporting

### 3. Deal Category (`deal_category_enum`)
Used in: `deals_clean.deal_category`

| Value | Description | Business Line |
|-------|-------------|---------------|
| `INVESTMENT` | Standard investment deal | Core business |
| `SECONDARY` | Secondary market opportunity | Liquidity service |
| `ADVISORY` | Advisory services deal | Fee-based service |
| `DISTRIBUTION` | Distribution/exit event | Liquidation process |

**Usage Notes:**
- High-level categorization for reporting
- Determines workflow processes
- Affects regulatory requirements

### 4. Deal Status (`deal_status_enum`)
Used in: `deals_clean.deal_status`

| Value | Description | Allowed Actions |
|-------|-------------|-----------------|
| `draft` | Deal being structured | Editing allowed |
| `raising` | Actively raising capital | Accepting investments |
| `active` | Deal closed, investment active | Monitoring only |
| `exited` | Deal fully exited | Read-only, distributions complete |
| `cancelled` | Deal cancelled | No further actions |

**Workflow:**
```
draft → raising → active → exited
         ↓
     cancelled
```

### 5. Company Type (`company_type_enum`)
Used in: `companies_clean.company_type`

| Value | Description | Role in Ecosystem |
|-------|-------------|-------------------|
| `portfolio` | Portfolio company | Investment target |
| `partner` | Partner entity | Co-investor or strategic partner |
| `holding` | Holding company/SPV | Legal structure for investments |

**Usage Notes:**
- A company can serve different roles in different deals
- Affects reporting categorization
- Determines required documentation

### 6. Funding Round (`funding_round_enum`)
Used in: `companies_clean.funding_round`

| Value | Description | Typical Valuation Range |
|-------|-------------|-------------------------|
| `seed` | Seed funding | < $2M |
| `series-a` | Series A round | $2M - $15M |
| `series-b` | Series B round | $15M - $50M |
| `series-c` | Series C round | $50M - $100M |
| `growth` | Growth equity | $100M - $500M |
| `pre-ipo` | Pre-IPO round | > $500M |

**Usage Notes:**
- Indicates company maturity
- Affects risk assessment
- Influences valuation methodology

### 7. Net Capital Calculation Method (`nc_calculation_method`)
Used in: `deals_clean.nc_calculation_method`

| Value | Description |
|-------|-------------|
| `standard` | NC = GC - (SFR × GC) - Premium |
| `direct` | NC = GC (Reddit, Scout, New Heights, Egypt) |
| `structured` | NC = GC × (1 - SFR) (Figure AI) |
| `premium_based` | NC = GC × (PMSP/ISP) (Impossible, SpaceX 2) |
| `complex` | (GC × (1 - SFR)) × (PMSP/ISP) (OpenAI) |
| `inverse` | NC = GC / (1 + SFR) (SpaceX 1) |

**Usage Notes:**
- Controls NC derivation per deal template
- Validated against `formula_templates` text

### 8. Premium Calculation Method (`premium_calculation_method`)
Used in: `deals_clean.premium_calculation_method`

| Value | Description |
|-------|-------------|
| `valuation_based` | (PMSP/ISP - 1) based premium |
| `unit_price_based` | (EUP/IUP) based premium |
| `built_in_nc` | Premium inherent in NC formula |
| `none` | No premium applied |

**Usage Notes:**
- Determines where premium is computed and applied
- Some templates build premium into NC

## Document & Compliance Enums

### 7. Document Category (`document_category_enum`)
Used in: `documents.document_category`

| Value | Description | Legal Significance |
|-------|-------------|-------------------|
| `passport` | Passport copy | KYC requirement |
| `partner_llc_agreement` | LLC operating agreement | Legal structure document |
| `partner_side_letter` | Side letter agreement | Special terms |
| `term_sheet` | Investment term sheet | Pre-agreement terms |
| `closing_agreement` | Final closing documents | Legally binding |
| `subscription_agreement` | Subscription documents | Investment commitment |
| `kyc` | KYC documentation | Compliance requirement |
| `other` | Other documents | Various purposes |

### 8. KYC Status (`kyc_status_enum`)
Used in: `investors_clean.kyc_status`

| Value | Description | Next Steps |
|-------|-------------|------------|
| `pending` | KYC not started | Initiate KYC process |
| `in_progress` | KYC ongoing | Complete verification |
| `verified` | KYC complete | Eligible to invest |
| `rejected` | KYC failed | Review and resubmit |
| `expired` | KYC expired | Renewal required |

**Compliance Rules:**
- Must be `verified` before processing transactions
- Expires after regulatory period (typically 2 years)
- Rejection requires manual review

### 9. KYC Document Type (`kyc_doc_type_enum`)
Used in: Related KYC tables

| Value | Description | Verification Level |
|-------|-------------|-------------------|
| `passport` | International passport | Primary ID |
| `national_id` | National ID card | Primary ID |
| `driver_license` | Driving license | Secondary ID |
| `utility_bill` | Utility bill | Address proof |
| `bank_statement` | Bank statement | Address & financial proof |
| `tax_document` | Tax documentation | Income verification |
| `other` | Other documents | Case-by-case |

## Financial Enums

### 10. Currency (`currency_enum`)
Used in: Various financial fields

| Value | Description | ISO Code |
|-------|-------------|----------|
| `USD` | US Dollar | Primary currency |
| `EUR` | Euro | European deals |
| `GBP` | British Pound | UK deals |
| `AED` | UAE Dirham | Middle East |
| `SAR` | Saudi Riyal | Saudi deals |
| `QAR` | Qatari Riyal | Qatar deals |

### 11. Fee Type (`fee_type_enum`)
Used in: Fee calculation contexts

| Value | Description | Calculation Basis |
|-------|-------------|-------------------|
| `management` | Annual management fee | % of AUM |
| `structuring` | Deal structuring fee | % of commitment |
| `performance` | Performance/carry fee | % of gains |
| `admin` | Administrative fee | Fixed or % |
| `premium` | Premium/success fee | % at exit |
| `other` | Other fees | Various |

### 12. Fee Component Type (`fee_component_type`)
Used in: Detailed fee breakdowns

| Value | Description | Timing |
|-------|-------------|--------|
| `STRUCTURING` | Upfront structuring | At investment |
| `MANAGEMENT` | Ongoing management | Annual |
| `PERFORMANCE` | Performance carry | At exit |
| `ADMIN` | Administrative | As incurred |
| `PREMIUM` | Success premium | At exit |
| `OTHER` | Other components | Various |

### 13. Net Capital Input Mode (`net_capital_input_mode`)
Used in: process semantics (documented)

| Value | Description | Where Used |
|-------|-------------|------------|
| `calculated` | NC derived per template | Default flow |
| `provided_txn` | NC provided at transaction | `transactions_clean.net_capital_actual` with `is_net_capital_provided=true` |
| `provided_position` | NC provided at position (deal↔company) | `portfolio.record_net_capital_investment(...)` |

## Transaction & Status Enums

### 14. Transaction Status (`txn_status_enum`)
Used in: Transaction workflows

| Value | Description | Reversible |
|-------|-------------|------------|
| `pending` | Awaiting processing | Yes |
| `completed` | Successfully processed | No |
| `cancelled` | Cancelled by user/system | N/A |
| `refunded` | Refunded transaction | No |

### 15. Task Status (`task_status_enum`)
Used in: Background job processing

| Value | Description | Retry Logic |
|-------|-------------|-------------|
| `scheduled` | Scheduled for execution | N/A |
| `running` | Currently executing | Monitor timeout |
| `succeeded` | Completed successfully | No retry |
| `failed` | Execution failed | Auto-retry 3x |
| `cancelled` | Manually cancelled | No retry |

## User & Access Enums

### 16. User Role (`user_role`)
Used in: Access control

| Value | Description | Access Level |
|-------|-------------|--------------|
| `superadmin` | System administrator | Full access |
| `admin` | Platform administrator | Admin functions |
| `investor` | Active investor | Investment access |
| `shareholder` | Shareholder only | Read-only portfolio |
| `advisory` | Advisory role | Limited access |
| `viewer` | View-only access | Read-only |

**Permission Hierarchy:**
```
superadmin > admin > investor > shareholder > advisory > viewer
```

## Communication Enums

### 17. Communication Preference (`comm_preference_enum`)
Used in: Investor preferences

| Value | Description | Channel |
|-------|-------------|---------|
| `email` | Email only | Primary |
| `sms` | SMS/text messages | Mobile |
| `phone` | Phone calls | Direct |
| `none` | No communications | Opt-out |

## Risk & Profile Enums

### 18. Risk Profile (`risk_profile_enum`)
Used in: Investor profiling

| Value | Description | Allocation Guide |
|-------|-------------|------------------|
| `conservative` | Low risk tolerance | < 20% high-risk |
| `moderate` | Balanced approach | 20-50% high-risk |
| `aggressive` | Higher risk tolerance | 50-80% high-risk |
| `very_aggressive` | Maximum risk | > 80% high-risk |

## Legal Document Categories

### 19. Legal Document Category (`legal_doc_category_enum`)
Used in: Legal document classification

| Value | Description | Requirements |
|-------|-------------|--------------|
| `subscription` | Subscription agreement | Investor signature |
| `side_letter` | Side letter terms | Special provisions |
| `llc_agreement` | LLC agreement | Entity formation |
| `nda` | Non-disclosure | Confidentiality |
| `term_sheet` | Terms outline | Non-binding |
| `closing_agreement` | Final agreement | All parties |
| `other` | Other legal docs | Various |

## System & Audit Enums

### 20. Event Source (`event_source_enum`)
Used in: Audit logging

| Value | Description | Origin |
|-------|-------------|--------|
| `user` | User action | Manual |
| `agent::FinancialLogicArchitect` | Financial AI agent | Automated |
| `agent::ComplianceAgent` | Compliance AI agent | Automated |
| `agent::DataQualityAgent` | Data quality AI | Automated |
| `agent::DatabaseSchemaEngineer` | Schema AI agent | Automated |
| `agent::AdvisorAgent` | Advisory AI agent | Automated |
| `system` | System process | Automated |
| `api` | API call | External |
| `webhook` | Webhook trigger | External |

## Usage Guidelines

### Adding New Enum Values
1. Never remove existing values (breaks data integrity)
2. Add new values to the end of the enum
3. Update this documentation
4. Consider backward compatibility
5. Update application code to handle new values

### Enum Best Practices
1. Use UPPERCASE for business constants (INDIVIDUAL, COMPANY)
2. Use lowercase for technical values (pending, completed)
3. Use snake_case for multi-word values (pre_ipo, in_progress)
4. Keep descriptions concise but clear
5. Document business rules and impacts

### Migration Considerations
- Existing data must map to valid enum values
- Default values should be specified where appropriate
- Consider using 'other' or 'unknown' for unmapped legacy data
- Test enum constraints before production deployment

## Related Documentation
- See `DATA_GLOSSARY.csv` for complete field definitions
- See `ENTITY_RELATIONSHIPS.md` for table relationships
- See `CLAUDE.md` for implementation guidelines