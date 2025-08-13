# API/routes.md — Conventions & Examples

Base: `/api`

## Deals
- `GET /deals/:dealId` — 1.1.1.1.1 deals-data-crud-read-by-id
- `GET /deals` — 1.1.1.1.2 list (+ search/sort/paginate/filter) [q, status, company, owner]
- `POST /deals` — 1.1.1.2 deals-data-crud-create
- `PATCH /deals/:dealId` — 1.1.1.3 deals-data-crud-update
- `DELETE /deals/:dealId` — 1.1.1.4 deals-data-crud-delete
- `POST /deals/:dealId/status` — 1.1.2.1 set
- `GET /deals/:dealId/fees` — 1.2.1.1 read
- `POST /deals/:dealId/fees` — 1.2.1.2 create (link schedule version)
- `PATCH /deals/:dealId/fees/:id` — 1.2.1.3 update
- `DELETE /deals/:dealId/fees/:id` — 1.2.1.4 delete
- `GET /deals/:dealId/calc/fees` — 1.2.4.7 aggregate
- `POST /deals/:dealId/scenarios/exit` — 1.2.4.8.1

## Documents
- `GET /deals/:dealId/documents` — 1.3.1 links
- `POST /deals/:dealId/documents/upload` — 1.3.2
- `GET /documents/:docId/download` — 1.3.3
- `POST /documents/:docId/ocr` — 1.3.4
- `POST /documents/:docId/extract/:type` — 1.3.6–1.3.9

## Investors
- `GET /investors/:id` — 2.1.1
- `POST /investors` — 2.1.2
- `PATCH /investors/:id` — 2.1.3
- `DELETE /investors/:id` — 2.1.4
- `GET /investors/:id/kyc` — 2.2.1
- `POST /investors/:id/kyc/upload` — 2.2.2
- `POST /investors/:id/kyc/approve` — 2.2.3
- `POST /investors/:id/payments/inbound/:kind` — 2.4.2.*
- `POST /investors/:id/payments/outbound/:kind` — 2.4.3.*

## Transactions
- `GET/POST/PATCH/DELETE /transactions` — 3.1.*
- `POST /reconcile/bank/ingest` — 3.2.1
- `POST /reconcile/match/run` — 3.2.2
