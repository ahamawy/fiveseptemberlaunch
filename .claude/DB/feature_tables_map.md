# Feature ↔ Table Map (excerpts)

- 1.1.1.1.1 deals-data-crud-read-by-id → `deals.deal`, `deals.identifier`, `deals.status_history`
- 1.2.4.7.* deals-calculations-fees-* → `fees.schedule`, `fees.version`, `fees.component`, `fees.ledger`
- 2.2.* investors-kyc-* → `investors.kyc_case`, `documents.link`, `documents.metadata`
- 3.2.* transactions-reconcile-* → `transactions.bank_line`, `transactions.match`, `transactions.reason_code`
(Add the rest as you finalize modules; stick to this pattern.)
