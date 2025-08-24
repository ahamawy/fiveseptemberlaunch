# API Routes (Feature-coded)

Pattern: `/domain/module/feature` (idempotent GET/DELETE; write via POST/PATCH).
Examples:
- 1.1.1.1.1 deals-data-crud-read-by-id → `GET /deals/:dealId`
- 1.2.1.2 deals-fees-links-create → `POST /deals/:dealId/fees`
- 2.4.2.1 investors-payments-inbound-capitalcall → `POST /investors/:id/payments/inbound/capital-call`
- 3.2.2 transactions-reconcile-match-engine → `POST /transactions/reconcile/run`
Keep the code in the route handler and the code in `FEATURE.md` synchronized.
