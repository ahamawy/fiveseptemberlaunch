# DB/feature_tables_map.md

A quick mapping from **feature codes** to **tables** (non-exhaustive).

## Deals
- 1.1.1.* deals-data-crud → `deals.deal`, `deals.identifier`, `deals.owner_map`
- 1.1.2.* deals-status-* → `deals.status_history`, `ref.deal_stage`
- 1.1.3.* deals-identifiers-* → `deals.identifier`
- 1.2.1.* deals-fees-links-* → `fees.link_deal`, `fees.schedule`, `fees.schedule_version`
- 1.2.2.* validators → `fees.validator_run`
- 1.2.3.* previews → `fees.preview_cache`
- 1.2.4.* calculations → `valuations.nav_snapshot`, `valuations.metric_snapshot`, `fees.ledger`, `calc.waterfall_run`
- 1.3.* documents → `documents.document`, `documents.version`, `documents.link`, `documents.classification`, `documents.extraction`, `documents.ocr_job`, `documents.evidence_log`

## Investors
- 2.1.* profiles CRUD → `investors.investor`
- 2.2.* KYC → `kyc.case`, `kyc.check`
- 2.3.* banking → `payments.method`
- 2.4.* payments → `payments.inbound`, `payments.outbound`, `investors.statement`
- 2.5.* commitments → `investors.commitment`
- 2.6.* wallet → `investors.wallet`, `investors.wallet_ledger`

## Transactions
- 3.1.* data/journal/fx → `transactions.transaction`, `transactions.journal`, `fx.rate`
- 3.2.* reconcile → `reconcile.bank_line`, `reconcile.match`
- 3.3.* fees links → `fees.posting` (links to `transactions.transaction`)
- 3.4.* reports → materialized views

## Companies
- 4.1.* → `companies.company`, `companies.round`, `companies.metric`

## Fees
- 7.* → `fees.schedule*`, `fees.ledger`, `fees.posting`

## Secondaries
- 8.* → `secondary.listing`, `secondary.bid`, `secondary.match`, `secondary.transfer`, `secondary.window`

## Comms
- 16.* → `comms.template`, `comms.send`, `comms.event`, `comms.preference`, `comms.immutable_log`

## Integrations / Accounting / Tax / News / Mobile / Ops
- 17.* → `integrations.credential`, `api.webhook_in/out`, `api.event_outbox`, `api.delivery_attempt`
- 18.* → `accounting.journal_batch`, `accounting.journal_line`, `accounting.export_batch`, `accounting.period_close`, `revrec.schedule`
- 20.* → `tax.withholding_rule`, `tax.form`, `tax.withholding_applied`
- 21.* → `news.source`, `news.item`, `news.subscription`, `news.digest`
- 22.* → `mobile.push_token`
- 23.* → `ops.audit_log`, `ops.health_check`
