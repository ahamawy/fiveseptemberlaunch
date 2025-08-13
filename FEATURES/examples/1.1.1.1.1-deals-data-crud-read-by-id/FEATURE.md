# 1.1.1.1.1 deals-data-crud-read-by-id

FOLDER: DEALS_DATA_CRUD_READ_BY_ID

## Feature Attributes
- **Purpose:** Fetch a single deal by `deal_id` with strict tenant/RLS checks.
- **Scope:** GET `/deals/:dealId`; returns normalized DTO incl. identifiers and current stage.
- **Depends on:** `deals.deal`, `deals.identifier (alias/slug)`, `deals.status_history` (for last stage).
- **Interfaces:** `GET /deals/:dealId`
- **Success:** p95 < 150ms; 100% DTO schema pass; 404 on missing or wrong-tenant.
- **Hands-off:** Deep-links to `1.4.1 deals-dashboard-overview` and `1.2.1.1 deals-fees-links-read`.
- **Edges:** soft-deleted deal hidden; invalid UUID; user lacks RBAC; legacy public view mapping.

## Required Files
- **README:** This file; keep DTO + route contract current.
- **Tests:** `tests/unit.spec.ts` (DTO), `tests/e2e.spec.ts` (render & fallback), optional SQL.
- **Other:** `routes/deals.get.ts`, `repo/deals.read.ts`, `dto/deal.ts`.
