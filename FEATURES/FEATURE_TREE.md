# EquiTie Platform — Combined Feature Tree (Exhaustive)
_Last updated: 2025-08-14_

## Feature Numbering Convention
All features follow the `domain.section.subsection` pattern

---

## 1. Deals
### 1.1 deals-data
#### 1.1.1 deals-data-crud
##### 1.1.1.1 deals-data-crud-read
- 1.1.1.1.1 deals-data-crud-read-by-id
- 1.1.1.1.2 deals-data-crud-read-list
- 1.1.1.1.3 deals-data-crud-read-search
- 1.1.1.1.4 deals-data-crud-read-filter-status
- 1.1.1.1.5 deals-data-crud-read-filter-company
- 1.1.1.1.6 deals-data-crud-read-filter-owner
- 1.1.1.1.7 deals-data-crud-read-sort
- 1.1.1.1.8 deals-data-crud-read-paginate
- 1.1.1.1.9 deals-data-crud-read-export

##### 1.1.1.2 deals-data-crud-create
- 1.1.1.2.1 deals-data-crud-create-validate
- 1.1.1.2.2 deals-data-crud-create-dedupe
- 1.1.1.2.3 deals-data-crud-create-from-template
- 1.1.1.2.4 deals-data-crud-create-bulk-import-csv
- 1.1.1.2.5 deals-data-crud-create-bulk-import-xlsx
- 1.1.1.2.6 deals-data-crud-create-audit-trail

##### 1.1.1.3 deals-data-crud-update
- 1.1.1.3.1 deals-data-crud-update-fields-core
- 1.1.1.3.2 deals-data-crud-update-fields-stage
- 1.1.1.3.3 deals-data-crud-update-fields-currency
- 1.1.1.3.4 deals-data-crud-update-bulk
- 1.1.1.3.5 deals-data-crud-update-etag
- 1.1.1.3.6 deals-data-crud-update-locking
- 1.1.1.3.7 deals-data-crud-update-audit-trail

##### 1.1.1.4 deals-data-crud-delete
- 1.1.1.4.1 deals-data-crud-delete-soft
- 1.1.1.4.2 deals-data-crud-delete-restore
- 1.1.1.4.3 deals-data-crud-delete-hard-admin

#### 1.1.2 deals-status
- 1.1.2.1 deals-status-set
- 1.1.2.2 deals-status-history
- 1.1.2.3 deals-status-guards
- 1.1.2.4 deals-status-revert
- 1.1.2.5 deals-status-bulk-update

#### 1.1.3 deals-identifiers
- 1.1.3.1 deals-identifiers-code-generate
- 1.1.3.2 deals-identifiers-slug-generate
- 1.1.3.3 deals-identifiers-alias-manage

### 1.2 deals-fees
#### 1.2.1 deals-fees-links
- 1.2.1.1 deals-fees-links-read
- 1.2.1.2 deals-fees-links-create
- 1.2.1.3 deals-fees-links-update
- 1.2.1.4 deals-fees-links-delete
- 1.2.1.5 deals-fees-links-version-list
- 1.2.1.6 deals-fees-links-version-activate

#### 1.2.2 deals-fees-validators
- 1.2.2.1 deals-fees-validators-termsheet-compare
- 1.2.2.2 deals-fees-validators-overlap-check
- 1.2.2.3 deals-fees-validators-basis-check

#### 1.2.3 deals-fees-previews
- 1.2.3.1 deals-fees-previews-partner
- 1.2.3.2 deals-fees-previews-investor

#### 1.2.4 deals-calculations
##### 1.2.4.1 deals-calculations-capital
- 1.2.4.1.1 deals-calculations-capital-summary
- 1.2.4.1.2 deals-calculations-capital-fx-normalize

##### 1.2.4.2 deals-calculations-capital-partner
- 1.2.4.2.1 deals-calculations-capital-partner-signed
- 1.2.4.2.2 deals-calculations-capital-partner-wired
- 1.2.4.2.3 deals-calculations-capital-partner-outstanding

##### 1.2.4.3 deals-calculations-capital-investor
- 1.2.4.3.1 deals-calculations-capital-investor-commitments
- 1.2.4.3.2 deals-calculations-capital-investor-calls
- 1.2.4.3.3 deals-calculations-capital-investor-receipts

- 1.2.4.4 deals-calculations-nav
- 1.2.4.5 deals-calculations-irr
- 1.2.4.6 deals-calculations-moic

##### 1.2.4.7 deals-calculations-fees
- 1.2.4.7.1 deals-calculations-fees-partner-management
- 1.2.4.7.2 deals-calculations-fees-partner-performance
- 1.2.4.7.3 deals-calculations-fees-partner-structuring
- 1.2.4.7.4 deals-calculations-fees-partner-premium
- 1.2.4.7.5 deals-calculations-fees-partner-other
- 1.2.4.7.6 deals-calculations-fees-investor-management
- 1.2.4.7.7 deals-calculations-fees-investor-performance
- 1.2.4.7.8 deals-calculations-fees-investor-structuring
- 1.2.4.7.9 deals-calculations-fees-investor-premium
- 1.2.4.7.10 deals-calculations-fees-investor-default

##### 1.2.4.8 deals-calculations-scenarios
- 1.2.4.8.1 deals-calculations-scenarios-exit
- 1.2.4.8.2 deals-calculations-scenarios-secondary
- 1.2.4.8.3 deals-calculations-scenarios-downround

### 1.3 deals-documents
- 1.3.1 deals-documents-links
- 1.3.2 deals-documents-upload
- 1.3.3 deals-documents-download
- 1.3.4 deals-documents-ocr
- 1.3.5 deals-documents-classify
- 1.3.6 deals-documents-extract-termsheet
- 1.3.7 deals-documents-extract-allocationsheet
- 1.3.8 deals-documents-extract-operatingagreement
- 1.3.9 deals-documents-extract-sideletter
- 1.3.10 deals-documents-watermark
- 1.3.11 deals-documents-evidence-log

### 1.4 deals-dashboard
- 1.4.1 deals-dashboard-overview
- 1.4.2 deals-dashboard-activity
- 1.4.3 deals-dashboard-metrics
- 1.4.4 deals-dashboard-actions
- 1.4.5 deals-dashboard-tiles-fees
- 1.4.6 deals-dashboard-tiles-docs
- 1.4.7 deals-dashboard-tiles-capital
- 1.4.8 deals-dashboard-tiles-risk

### 1.5 deals-analytics
- 1.5.1 deals-analytics-overview
- 1.5.2 deals-analytics-pipeline
- 1.5.3 deals-analytics-conversion
- 1.5.4 deals-analytics-cohorts
- 1.5.5 deals-analytics-moirr-snapshots

### 1.6 deals-wizard
- 1.6.1 deals-wizard-steps-metadata
- 1.6.2 deals-wizard-steps-fees
- 1.6.3 deals-wizard-steps-documents
- 1.6.4 deals-wizard-steps-participants
- 1.6.5 deals-wizard-steps-review
- 1.6.6 deals-wizard-steps-publish

### 1.7 deals-approval
- 1.7.1 deals-approval-gate-docs-complete
- 1.7.2 deals-approval-gate-fees-validated
- 1.7.3 deals-approval-gate-kyc-cleared
- 1.7.4 deals-approval-gate-compliance-check
- 1.7.5 deals-approval-gate-go-live-switch

### 1.8 deals-pipeline
- 1.8.1 deals-pipeline-board
- 1.8.2 deals-pipeline-swimlanes
- 1.8.3 deals-pipeline-drag-drop
- 1.8.4 deals-pipeline-sla-timers

### 1.9 deals-qna
- 1.9.1 deals-qna-thread
- 1.9.2 deals-qna-answer
- 1.9.3 deals-qna-moderation

### 1.10 deals-updates
- 1.10.1 deals-updates-create
- 1.10.2 deals-updates-read
- 1.10.3 deals-updates-digest

### 1.11 deals-entities
#### 1.11.1 deals-entities-spvs
- 1.11.1.1 deals-entities-spvs-create
- 1.11.1.2 deals-entities-spvs-update
- 1.11.1.3 deals-entities-spvs-link-company
- 1.11.1.4 deals-entities-spvs-link-deal
- 1.11.1.5 deals-entities-spvs-documents

### 1.12 deals-valuations
#### 1.12.1 deals-valuations-history
- 1.12.1.1 deals-valuations-history-read
- 1.12.1.2 deals-valuations-history-create
- 1.12.1.3 deals-valuations-history-update
- 1.12.1.4 deals-valuations-history-delete
- 1.12.2 deals-valuations-metrics-moic-irr
- 1.12.3 deals-valuations-sources
- 1.12.4 deals-valuations-backup-restore

### 1.13 deals-recommendations
- 1.13.1 deals-recommendations-generate
- 1.13.2 deals-recommendations-explain-reasons
- 1.13.3 deals-recommendations-status-tracking

### 1.14 deals-audit
- 1.14.1 deals-audit-trail-read
- 1.14.2 deals-audit-trail-diff
- 1.14.3 deals-audit-trail-export
- 1.14.4 deals-audit-trail-business-context

### 1.15 deals-data-quality
- 1.15.1 deals-data-quality-checks
- 1.15.2 deals-data-quality-remediation

---

## 2. Investors
### 2.1 investors-profiles
- 2.1.1 investors-data-crud-read
- 2.1.2 investors-data-crud-create
- 2.1.3 investors-data-crud-update
- 2.1.4 investors-data-crud-delete
- 2.1.5 investors-data-merge-dedupe
- 2.1.6 investors-data-notes
- 2.1.7 investors-data-tiers
- 2.1.8 investors-data-tags
#### 2.1.9 investors-data-enrichment
- 2.1.9.1 investors-data-enrichment-ingest
- 2.1.9.2 investors-data-enrichment-status
- 2.1.9.3 investors-data-enrichment-scoring
- 2.1.9.4 investors-data-enrichment-linkedin-sync

### 2.2 investors-profiles-kyc
- 2.2.1 investors-data-kyc-read
- 2.2.2 investors-data-kyc-upload
- 2.2.3 investors-data-kyc-approve
- 2.2.4 investors-data-kyc-reject
- 2.2.5 investors-data-kyc-pep-check
- 2.2.6 investors-data-kyc-sanctions-screen
- 2.2.7 investors-data-kyc-expiry-reminder

### 2.3 investors-banking
- 2.3.1 investors-banking-link-account
- 2.3.2 investors-banking-verify
- 2.3.3 investors-banking-payout-preferences

### 2.4 investors-payments
#### 2.4.1 investors-payments-method
- 2.4.1.1 investors-payments-method-wire
- 2.4.1.2 investors-payments-method-card
- 2.4.1.3 investors-payments-method-banktransfer
- 2.4.1.4 investors-payments-method-unlink

#### 2.4.2 investors-payments-inbound
- 2.4.2.1 investors-payments-inbound-capitalcall
- 2.4.2.2 investors-payments-inbound-topup
- 2.4.2.3 investors-payments-inbound-fees
- 2.4.2.4 investors-payments-inbound-unapplied
- 2.4.2.5 investors-payments-inbound-refund-request

#### 2.4.3 investors-payments-outbound
- 2.4.3.1 investors-payments-outbound-distributions
- 2.4.3.2 investors-payments-outbound-refunds

#### 2.4.4 investors-statements
- 2.4.4.1 investors-statements-monthly
- 2.4.4.2 investors-statements-annual
- 2.4.4.3 investors-statements-tax

### 2.5 investors-commitments
- 2.5.1 investors-commitments-create
- 2.5.2 investors-commitments-update
- 2.5.3 investors-commitments-cancel
- 2.5.4 investors-commitments-docsign

### 2.6 investors-wallet
- 2.6.1 investors-wallet-balance
- 2.6.2 investors-wallet-topup
- 2.6.3 investors-wallet-apply-fees

### 2.7 investors-referrals
- 2.7.1 investors-referrals-invite
- 2.7.2 investors-referrals-track

### 2.8 investors-notifications
- 2.8.1 investors-notifications-preferences
- 2.8.2 investors-notifications-digests

### 2.9 investors-dashboard
- 2.9.1 investors-dashboard-overview
- 2.9.2 investors-dashboard-activity
- 2.9.3 investors-dashboard-metrics
- 2.9.4 investors-dashboard-actions

### 2.10 investors-documents
- 2.10.1 investors-documents-upload
- 2.10.2 investors-documents-verify
- 2.10.3 investors-documents-status

### 2.11 investors-analytics
- 2.11.1 investors-analytics-portfolio-metrics
- 2.11.2 investors-analytics-diversification
- 2.11.3 investors-analytics-risk-profile
- 2.11.4 investors-analytics-cashflows

### 2.12 investors-positions
#### 2.12.1 investors-positions-units
- 2.12.1.1 investors-positions-units-read
- 2.12.1.2 investors-positions-units-create
- 2.12.1.3 investors-positions-units-update
- 2.12.1.4 investors-positions-units-close-realize

#### 2.12.2 investors-positions-snapshots
- 2.12.2.1 investors-positions-snapshots-generate
- 2.12.2.2 investors-positions-snapshots-read
- 2.12.2.3 investors-positions-snapshots-export

### 2.13 investors-activity
- 2.13.1 investors-activity-feed
- 2.13.2 investors-activity-filters
- 2.13.3 investors-activity-analytics

### 2.14 investors-patterns
- 2.14.1 investors-patterns-detect
- 2.14.2 investors-patterns-performance
- 2.14.3 investors-patterns-search

### 2.15 investors-prospects
- 2.15.1 investors-prospects-import
- 2.15.2 investors-prospects-qualify
- 2.15.3 investors-prospects-match-existing
- 2.15.4 investors-prospects-enrichment

### 2.16 investors-recommendations
- 2.16.1 investors-recommendations-queue
- 2.16.2 investors-recommendations-feedback
- 2.16.3 investors-recommendations-status

---

## 3. Transactions
### 3.1 transactions-data
- 3.1.1 transactions-data-crud-read
- 3.1.2 transactions-data-crud-create
- 3.1.3 transactions-data-crud-update
- 3.1.4 transactions-data-crud-delete
- 3.1.5 transactions-data-journal-double-entry
- 3.1.6 transactions-data-fx-rates
- 3.1.7 transactions-data-audit-log

### 3.2 transactions-reconcile
- 3.2.1 transactions-reconcile-bank-ingest
- 3.2.2 transactions-reconcile-match-engine
- 3.2.3 transactions-reconcile-manual-override
- 3.2.4 transactions-reconcile-reason-codes
- 3.2.5 transactions-reconcile-idempotency

### 3.3 transactions-fees
- 3.3.1 transactions-fees-links-read
- 3.3.2 transactions-fees-links-create
- 3.3.3 transactions-fees-links-update
- 3.3.4 transactions-fees-links-delete

### 3.4 transactions-reports
- 3.4.1 transactions-reports-period-statements
- 3.4.2 transactions-reports-exports
- 3.4.3 transactions-reports-anomalies

### 3.5 transactions-primary-fees
- 3.5.1 transactions-primary-fees-lock
- 3.5.2 transactions-primary-fees-recalculate
- 3.5.3 transactions-primary-fees-discounts
- 3.5.4 transactions-primary-fees-audit

### 3.6 transactions-secondary
- 3.6.1 transactions-secondary-list
- 3.6.2 transactions-secondary-execute
- 3.6.3 transactions-secondary-settlement
- 3.6.4 transactions-secondary-documents
- 3.6.5 transactions-secondary-reporting

### 3.7 transactions-advisory
- 3.7.1 transactions-advisory-create
- 3.7.2 transactions-advisory-update
- 3.7.3 transactions-advisory-reporting

### 3.8 transactions-subnominee
- 3.8.1 transactions-subnominee-add
- 3.8.2 transactions-subnominee-allocate
- 3.8.3 transactions-subnominee-reconcile

### 3.9 transactions-documents
- 3.9.1 transactions-documents-link
- 3.9.2 transactions-documents-roles
- 3.9.3 transactions-documents-signed-dates
- 3.9.4 transactions-documents-audit

### 3.10 transactions-legal
- 3.10.1 transactions-legal-status-track
- 3.10.2 transactions-legal-lifecycle
- 3.10.3 transactions-legal-expiry-management

### 3.11 transactions-backups
- 3.11.1 transactions-backups-primary
- 3.11.2 transactions-backups-fees-fix
- 3.11.3 transactions-backups-restore

---

## 4. Companies
### 4.1 companies-data
- 4.1.1 companies-data-crud-read
- 4.1.2 companies-data-crud-create
- 4.1.3 companies-data-crud-update
- 4.1.4 companies-data-crud-delete
- 4.1.5 companies-identifiers
#### 4.1.6 companies-rounds
- 4.1.6.1 companies-rounds-create
- 4.1.6.2 companies-rounds-update
- 4.1.6.3 companies-rounds-history
#### 4.1.7 companies-metrics
- 4.1.7.1 companies-metrics-valuation
- 4.1.7.2 companies-metrics-arr
- 4.1.7.3 companies-metrics-gm
- 4.1.8 companies-news
- 4.1.9 companies-documents

### 4.2 companies-assets
- 4.2.1 companies-assets-upload
- 4.2.2 companies-assets-library
- 4.2.3 companies-assets-primary-set
- 4.2.4 companies-assets-metadata
- 4.2.5 companies-assets-order

### 4.3 companies-enrichment
- 4.3.1 companies-enrichment-ingest
- 4.3.2 companies-enrichment-contacts
- 4.3.3 companies-enrichment-flags
- 4.3.4 companies-enrichment-sync

### 4.4 companies-milestones
- 4.4.1 companies-milestones-crud
- 4.4.2 companies-milestones-timeline

### 4.5 companies-stories
- 4.5.1 companies-stories-crud

### 4.6 companies-tags
- 4.6.1 companies-tags-crud

### 4.7 companies-news-extensions
- 4.7.1 companies-news-sentiment
- 4.7.2 companies-news-source-tracking
- 4.7.3 companies-news-alerts

---

## 5. Documents
### 5.1 documents-data
- 5.1.1 documents-data-crud-read
- 5.1.2 documents-data-crud-create
- 5.1.3 documents-data-crud-update
- 5.1.4 documents-data-crud-delete
- 5.1.5 documents-data-versioning
- 5.1.6 documents-data-security
- 5.1.7 documents-data-watermark
- 5.1.8 documents-data-access-control

### 5.2 document-containers
- 5.2.1 document-containers-create
- 5.2.2 document-containers-link-external-id
- 5.2.3 document-containers-hash-verify

### 5.3 document-linking
- 5.3.1 document-linking-deal
- 5.3.2 document-linking-investor
- 5.3.3 document-linking-transaction

### 5.4 document-intelligence
- 5.4.1 document-ocr
#### 5.4.2 document-classify
- 5.4.2.1 document-classify-termsheet
- 5.4.2.2 document-classify-allocationsheet
- 5.4.2.3 document-classify-operatingagreement
- 5.4.2.4 document-classify-sideletter
- 5.4.2.5 document-classify-subscription-agreement
- 5.4.2.6 document-classify-engagement-letter
#### 5.4.3 document-extract
- 5.4.3.1 document-extract-termsheet
- 5.4.3.2 document-extract-allocationsheet
- 5.4.3.3 document-extract-operatingagreement
- 5.4.3.4 document-extract-sideletter
- 5.4.3.5 document-extract-subscription-agreement
- 5.4.3.6 document-extract-engagement-letter
- 5.4.4 document-validate-schema
- 5.4.5 document-review-queue

### 5.5 document-signing
- 5.5.1 document-signing-envelope-create
- 5.5.2 document-signing-envelope-status
- 5.5.3 document-signing-webhooks

### 5.6 documents-agreements
- 5.6.1 documents-agreement-types-crud
- 5.6.2 documents-agreement-types-assign
- 5.6.3 documents-agreement-types-requirements

### 5.7 documents-legal-status
- 5.7.1 documents-legal-status-track
- 5.7.2 documents-legal-status-alerts
- 5.7.3 documents-legal-status-reports

### 5.8 documents-linking-extensions
- 5.8.1 documents-linking-transaction-roles
- 5.8.2 documents-linking-transaction-lifecycle
- 5.8.3 documents-linking-audit

### 5.9 documents-metadata
- 5.9.1 documents-metadata-legal-flags
- 5.9.2 documents-metadata-expiry
- 5.9.3 documents-metadata-signatories

---

## 6. Valuations
### 6.1 valuations-core
- 6.1.1 valuations-events-add
- 6.1.2 valuations-events-update
- 6.1.3 valuations-fx-normalize

- 6.2 valuations-moic-snapshots
- 6.3 valuations-irr-snapshots
- 6.4 valuations-aum-rollup

### 6.5 valuations-deal-history
- 6.5.1 valuations-deal-history-crud
- 6.5.2 valuations-deal-history-moic-irr
- 6.5.3 valuations-deal-history-visualize

### 6.6 valuations-investor-snapshots
- 6.6.1 valuations-investor-snapshots-generate
- 6.6.2 valuations-investor-snapshots-timeseries

### 6.7 valuations-portfolio-analytics
- 6.7.1 valuations-portfolio-analytics-aggregate
- 6.7.2 valuations-portfolio-analytics-historical

---

## 7. Fees
### 7.1 fee-schedules
- 7.1.1 fee-schedules-crud-read
- 7.1.2 fee-schedules-crud-create
- 7.1.3 fee-schedules-crud-update
- 7.1.4 fee-schedules-crud-delete
- 7.1.5 fee-schedules-versioning

### 7.2 fee-calculators
- 7.2.1 fee-calculators-management
- 7.2.2 fee-calculators-performance
- 7.2.3 fee-calculators-structuring
- 7.2.4 fee-calculators-premium
- 7.2.5 fee-calculators-other
- 7.2.6 fee-calculators-default

### 7.3 fee-ledger
- 7.3.1 fee-ledger-postings
- 7.3.2 fee-ledger-reconciliation

### 7.4 fee-analytics
- 7.4.1 fee-analytics-deal
- 7.4.2 fee-analytics-investor
- 7.4.3 fee-analytics-partner

### 7.5 fee-discounts
- 7.5.1 fee-discounts-structuring
- 7.5.2 fee-discounts-management
- 7.5.3 fee-discounts-admin
- 7.5.4 fee-discounts-policy

### 7.6 fee-locking
- 7.6.1 fee-locking-enable
- 7.6.2 fee-locking-audit
- 7.6.3 fee-locking-override

---

## 8. Secondaries
### 8.1 secondary-market
- 8.1.1 secondary-list
- 8.1.2 secondary-bid
- 8.1.3 secondary-match
- 8.1.4 secondary-transfer
- 8.1.5 secondary-ewt
- 8.1.6 secondary-order-book
- 8.1.7 secondary-disclosures
- 8.1.8 secondary-settlement
- 8.1.9 secondary-subnominee-allocation

---

## 9. Authentication
### 9.1 authentication-data
- 9.1.1 authentication-data-crud-read
- 9.1.2 authentication-data-crud-create
- 9.1.3 authentication-data-crud-update
- 9.1.4 authentication-data-crud-delete

### 9.2 authentication-sessions
- 9.2.1 authentication-sessions-magic-links
- 9.2.2 authentication-sessions-sso-hooks
- 9.2.3 authentication-sessions-rotation

### 9.3 authentication-rbac
- 9.3.1 authentication-rbac-roles
- 9.3.2 authentication-rbac-permissions
- 9.3.3 authentication-rbac-row-level

### 9.4 authentication-hardening
- 9.4.1 authentication-2fa
- 9.4.2 authentication-api-keys
- 9.4.3 authentication-security-headers
- 9.4.4 authentication-rate-limits
- 9.4.5 authentication-encryption

### 9.5 authentication-status
- 9.5.1 authentication-status-update
- 9.5.2 authentication-status-revoke

- 9.6 authentication-consents

### 9.7 authentication-users-profiles
- 9.7.1 authentication-users-profiles-create
- 9.7.2 authentication-users-profiles-permissions
- 9.7.3 authentication-users-profiles-link-investor-company

### 9.8 authentication-activity
- 9.8.1 authentication-activity-user-log
- 9.8.2 authentication-activity-session-insights

- 9.9 authentication-audit-trail

---

## 10. AI
### 10.1 ai-orchestration
- 10.1.1 ai-router
- 10.1.2 ai-cache-costs
- 10.1.3 ai-judge

### 10.2 ai-doc-parsers
- 10.2.1 ai-doc-parsers-legal
- 10.2.2 ai-doc-parsers-financial
- 10.2.3 ai-doc-parsers-termsheets

### 10.3 ai-embeddings
- 10.3.1 ai-embeddings-index
- 10.3.2 ai-embeddings-search

### 10.4 ai-guardrails
- 10.4.1 ai-guardrails-pii-redaction
- 10.4.2 ai-guardrails-policy-checks

- 10.5 ai-metrics

### 10.6 ai-recommendations
- 10.6.1 ai-recommendations-deals
- 10.6.2 ai-recommendations-personalization
- 10.6.3 ai-recommendations-feedback-loop

### 10.7 ai-enrichment
- 10.7.1 ai-enrichment-companies
- 10.7.2 ai-enrichment-investors
- 10.7.3 ai-enrichment-news-sentiment

### 10.8 ai-anomaly-detection
- 10.8.1 ai-anomaly-detection-docsend
- 10.8.2 ai-anomaly-detection-payments

- 10.9 ai-insights-portfolio

---

## 11. Calculation Engine
- 11.1 calculation-engine-waterfall
- 11.2 calculation-engine-moic-irr
- 11.3 calculation-engine-currency-converter
- 11.4 calculation-engine-tax
- 11.5 calculation-engine-partner-splits
- 11.6 calculation-engine-aum-aggregator
- 11.7 calculation-engine-rounding-rules
- 11.8 calculation-engine-fee-discounts
- 11.9 calculation-engine-fee-locking
- 11.10 calculation-engine-valuation-snapshots

---

## 12. API Infrastructure
- 12.1 api-gateway
- 12.2 middleware-stack
- 12.3 request-validation
- 12.4 response-formatter
- 12.5 error-handler
- 12.6 rate-limiter
- 12.7 idempotency
- 12.8 versioning
- 12.9 webhooks-outbound
- 12.10 webhooks-inbound

### 12.11 events-bus
- 12.11.1 events-bus-portfolio
- 12.11.2 events-bus-audit-hooks
- 12.11.3 events-bus-replay

### 12.12 notifications-dispatcher
- 12.12.1 notifications-dispatcher-ttl
- 12.12.2 notifications-dispatcher-priority
- 12.12.3 notifications-dispatcher-routing

### 12.13 audit-trail-service
- 12.13.1 audit-trail-service-writer
- 12.13.2 audit-trail-service-reader

- 12.14 data-quality-service

---

## 13. UI Library
- 13.1 design-tokens
### 13.2 forms
- 13.2.1 forms-field-inputs
- 13.2.2 forms-validation-schemas
- 13.3 data-tables
- 13.4 charts
- 13.5 cards
- 13.6 modals
- 13.7 toasts
- 13.8 skeletons
- 13.9 mobile-primitives
- 13.10 theme

---

## 14. Admin
### 14.1 admin-livedeal
- 14.1.1 admin-livedeal-create-termsheet
- 14.1.2 admin-livedeal-create-allocationsheet
- 14.1.3 admin-livedeal-create-operatingagreement
- 14.1.4 admin-livedeal-create-sideletter
- 14.1.5 admin-livedeal-create-subscription-agreement

### 14.2 admin-transactions
- 14.2.1 admin-transactions-tracker
- 14.2.2 admin-transactions-overrides
- 14.2.3 admin-transactions-batch

### 14.3 admin-documents
[14.3.1 - 14.3.19 document management features]

### 14.4 admin-templates
[14.4.1 - 14.4.16 template management features]

### 14.5 admin-communications
[14.5.1 - 14.5.15 communication management features]

- 14.6 admin-dashboard
- 14.7 admin-approvals
- 14.8 admin-pipeline
- 14.9 admin-ops
- 14.10 admin-reports
- 14.11 admin-users
- 14.12 admin-settings
- 14.13 admin-tags
- 14.14 admin-discounts

### 14.15 admin-analytics
- 14.15.1 admin-analytics-portfolio
- 14.15.2 admin-analytics-investor
- 14.15.3 admin-analytics-real-time

### 14.16 admin-notifications
- 14.16.1 admin-notifications-compose
- 14.16.2 admin-notifications-bulk

### 14.17 admin-audit
- 14.17.1 admin-audit-search
- 14.17.2 admin-audit-export
- 14.17.3 admin-audit-diff

### 14.18 admin-prospects
- 14.18.1 admin-prospects-review
- 14.18.2 admin-prospects-assign

### 14.19 admin-company-enrichment
- 14.19.1 admin-company-enrichment-review

### 14.20 admin-glossary
- 14.20.1 admin-glossary-crud
- 14.20.2 admin-glossary-review

---

## 15. Investor App
### 15.1 investor-portal
- **15.1.1 investor-portal-dashboard** ✅ (Current Feature)
- 15.1.2 investor-portal-onboarding-kyc
- 15.1.3 investor-portal-profile
- 15.1.4 investor-portal-banking
- 15.1.5 investor-portal-settings
- 15.1.6 investor-portal-referrals

### 15.2 investor-deal-experience
- 15.2.1 investor-deal-experience-browse
- 15.2.2 investor-deal-experience-detail
- 15.2.3 investor-deal-experience-investor-commitment
- 15.2.4 investor-deal-experience-tracker
- 15.2.5 investor-deal-experience-qna
- 15.2.6 investor-deal-experience-updates
- 15.2.7 investor-deal-experience-exit-info
- 15.2.8 investor-deal-experience-recommendations

### 15.3 investor-transaction-ui
- 15.3.1 investor-transaction-ui-viewer
- 15.3.2 investor-transaction-ui-statements
- 15.3.3 investor-transaction-ui-disputes
- 15.3.4 investor-transaction-ui-tax-docs

### 15.4 investor-secondary-ui
- 15.4.1 investor-secondary-ui-browse
- 15.4.2 investor-secondary-ui-list
- 15.4.3 investor-secondary-ui-bid
- 15.4.4 investor-secondary-ui-transfer

### 15.5 investor-performance
- 15.5.1 investor-performance-overview
- 15.5.2 investor-performance-comparisons
- 15.5.3 investor-performance-projections
- 15.5.4 investor-performance-attribution
- 15.5.5 investor-performance-snapshots

### 15.6 investor-notifications
- 15.6.1 investor-notifications-hub
- 15.6.2 investor-notifications-preferences
- 15.6.3 investor-notifications-history
- 15.6.4 investor-notifications-digests

### 15.7 investor-document-viewer
- 15.7.1 investor-document-viewer-secure-pdf
- 15.7.2 investor-document-viewer-watermark
- 15.7.3 investor-document-viewer-legal-status

- 15.8 investor-crm-personalisation

### 15.9 investor-education
- 15.9.1 investor-education-glossary

### 15.10 investor-news
- 15.10.1 investor-news-company-sentiment

- 15.11 investor-chat-support

---

## 16. Communications
### 16.1 comms-orchestrator
- 16.1.1 comms-orchestrator-campaigns
- 16.1.2 comms-orchestrator-scheduling
- 16.1.3 comms-orchestrator-throttling

- 16.2 comms-templates
- 16.3 comms-log-immutable
- 16.4 comms-preferences

### 16.5 comms-analytics
- 16.5.1 comms-analytics-investors-delivery
- 16.5.2 comms-analytics-investors-engagement

### 16.6 comms-channels
- 16.6.1 comms-channels-email
- 16.6.2 comms-channels-whatsapp
- 16.6.3 comms-channels-sms
- 16.6.4 comms-channels-push
- 16.6.5 comms-channels-inapp

### 16.7 comms-notifications
- 16.7.1 comms-notifications-dispatch
- 16.7.2 comms-notifications-preferences-sync
- 16.7.3 comms-notifications-expiry

### 16.8 comms-docsend
- 16.8.1 comms-docsend-views-ingest
- 16.8.2 comms-docsend-alerts-atypical
- 16.8.3 comms-docsend-digests

---

## 17. Integrations
### 17.1 integrations-mailchimp
- 17.1.1 integrations-mailchimp-sync
- 17.1.2 integrations-mailchimp-send

### 17.2 integrations-slack
- 17.2.1 integrations-slack-alerts
- 17.2.2 integrations-slack-commands

### 17.3 integrations-whatsapp
- 17.3.1 integrations-whatsapp-send
- 17.3.2 integrations-whatsapp-webhook

### 17.4 integrations-drive
- 17.4.1 integrations-drive-upload
- 17.4.2 integrations-drive-link

### 17.5 integrations-sheets
- 17.5.1 integrations-sheets-import
- 17.5.2 integrations-sheets-export
#### 17.5.3 integrations-sheets-sync-jobs
- 17.5.3.1 integrations-sheets-sync-jobs-create
- 17.5.3.2 integrations-sheets-sync-jobs-schedule
- 17.5.3.3 integrations-sheets-sync-jobs-bidirectional
- 17.5.3.4 integrations-sheets-sync-jobs-monitor

### 17.6 integrations-docsend
- 17.6.1 integrations-docsend-csvimport
- 17.6.2 integrations-docsend-link-track
- 17.6.3 integrations-docsend-views-ingest
- 17.6.4 integrations-docsend-alerts
- 17.6.5 integrations-docsend-link-deal-investor

### 17.7 integrations-docusign
- 17.7.1 integrations-docusign-envelope-create
- 17.7.2 integrations-docusign-envelope-status
- 17.7.3 integrations-docusign-legal-status-sync

### 17.8 integrations-bank
- 17.8.1 integrations-bank-bank-ingest
- 17.8.2 integrations-bank-statement-parse
- 17.8.3 integrations-bank-webhook

### 17.9 integrations-stripe
- 17.9.1 integrations-stripe-checkout-session
- 17.9.2 integrations-stripe-webhooks
- 17.9.3 integrations-stripe-payouts

### 17.10 integrations-quickbooks
- 17.10.1 integrations-quickbooks-sync
- 17.10.2 integrations-quickbooks-journals

### 17.11 integrations-hubspot
- 17.11.1 integrations-hubspot-sync-contacts
- 17.11.2 integrations-hubspot-sync-companies
- 17.11.3 integrations-hubspot-prospects-sync
- 17.11.4 integrations-hubspot-activities

### 17.12 integrations-webhook-manager
- 17.12.1 integrations-webhook-manager-secrets
- 17.12.2 integrations-webhook-manager-retries

---

## 18. Accounting
### 18.1 accounting-export
- 18.1.1 accounting-export-quickbooks-sync
- 18.1.2 accounting-export-ledger-post
- 18.1.3 accounting-export-rollback

### 18.2 revenue-recognition
- 18.2.1 revenue-recognition-fees
- 18.2.2 revenue-recognition-premium

- 18.3 chart-of-accounts
- 18.4 close-periods
- 18.5 audit-trail
- 18.6 revenue-recognition-advisory
- 18.7 accounting-portfolio-valuation-journal
- 18.8 accounting-attachments-transaction-documents

---

## 19. Monitoring & Testing
- 19.1 perf-monitor
- 19.2 error-tracking
- 19.3 health-checks
- 19.4 test-fixtures
- 19.5 e2e-framework
- 19.6 unit-test-utils
- 19.7 analytics-tracker
- 19.8 feature-flags
- 19.9 observability-dashboards

### 19.10 data-quality
- 19.10.1 data-quality-checks
- 19.10.2 data-quality-log
- 19.10.3 data-quality-slo

### 19.11 audit-observability
- 19.11.1 audit-observability-benchmarks

- 19.12 anomalies-transactions

### 19.13 real-time-metrics
- 19.13.1 real-time-metrics-dashboard
- 19.13.2 real-time-metrics-alerts

### 19.14 business-events-monitor
- 19.14.1 business-events-replay
- 19.14.2 business-events-deadletter

### 19.15 usage-analytics
- 19.15.1 usage-analytics-user-activity-feed
- 19.15.2 usage-analytics-funnel-analysis

---

## 20. Tax & Reporting
### 20.1 investor-tax
- 20.1.1 investor-tax-withholding
- 20.1.2 investor-tax-forms-w8
- 20.1.3 investor-tax-forms-w9

- 20.2 board-packs
- 20.3 country-profiles

---

## 21. News
- 21.1 news-deals
- 21.2 news-companies
- 21.3 news-digests
- 21.4 news-alerts
- 21.5 news-sources

### 21.6 news-sentiment
- 21.6.1 news-sentiment-company
- 21.6.2 news-sentiment-market

### 21.7 news-sourcing
- 21.7.1 news-sourcing-urls
- 21.7.2 news-sourcing-dedup

---

## 22. Mobile
- 22.1 mobile-navigation
- 22.2 mobile-cards
- 22.3 mobile-offline
- 22.4 mobile-biometrics
- 22.5 mobile-push
- 22.6 mobile-legal-doc-status
- 22.7 mobile-investor-performance-snapshots

---

## 23. Database
- 23.1 database-schema-migrations
- 23.2 database-views
- 23.3 database-policies
- 23.4 database-seeds
- 23.5 database-backups

### 23.6 database-audit-trail
- 23.6.1 database-audit-trail-table
- 23.6.2 database-audit-trail-policies

### 23.7 database-data-quality
- 23.7.1 database-data-quality-logs
- 23.7.2 database-data-quality-views

### 23.8 database-backups-jobs
- 23.8.1 database-backups-snapshots
- 23.8.2 database-backups-restore

### 23.9 database-event-streams
- 23.9.1 database-event-triggers
- 23.9.2 database-event-archival

### 23.10 database-materialized-views
- 23.10.1 database-views-investor-analytics
- 23.10.2 database-views-portfolio-analytics

---

## Implementation Status

### Current Implementation
- **15.1.1 investor-portal-dashboard** ✅ 
  - Dashboard API with shape mapping
  - Service layer integration
  - Supabase connection
  - Mock/real data switching

### Infrastructure Ready
- Service layer pattern established
- Supabase adapter configured
- API routes standardized
- Caching layer implemented
- Brand tokens integrated

### Quick Ship Ready
All features can now be rapidly implemented using:
- Existing service patterns
- ultrathink/ context files
- Established API patterns
- Supabase integration