# PRD — Equitie (Condensed)

## Mission
Digitized, modular equity/SPV deal platform covering deals, investors, transactions, documents, fees, secondaries, and comms.

## Scope Anchors
- **Feature Codes**: Every task references a leaf like `1.2.4.7.1 deals-calculations-fees-partner-management`.
- **SLOs** (defaults): p95 API < 250ms, dashboards < 500ms, OCR jobs < 2m, fee calc drift = 0.
- **Security**: RLS on every table; PII encrypted at rest; least-privilege service roles.
- **Auditability**: Append-only logs for comms, state changes, and financial postings.

## Domains (top-level)
1. **Deals** — data CRUD, status machine, identifiers, fees (links/validators/previews), calculations (capital, IRR/MOIC/NAV/scenarios), documents (links/upload/download/OCR/classify/extract), dashboard/analytics, wizards, approval gates, pipeline, Q&A, updates.
2. **Investors** — profiles CRUD, KYC, banking, payments inbound/outbound, statements, commitments, wallet, referrals, notifications, dashboard, investor docs.
3. **Transactions** — transaction store + journal, FX, reconciliation (bank ingest/match/manual/reason/idempotency), fee links, reports.
4. **Companies** — master data, rounds, metrics, news, documents.
5. **Documents** — canonical doc store, versions, links, classification, extraction, validation, review, signing/webhooks.
6. **Valuations** — NAV snapshots, IRR/MOIC snapshots, AUM rollups.
7. **Fees** — schedules (versioned), calculators, ledger/postings, analytics.
8. **Secondaries** — listings, bids, matches, transfer, settlement, windows/disclosures.
9. **Authentication** — users/sessions/SSO, RBAC, hardening (2FA, API keys, rate limits, encryption), status, consents.
10. **AI** — router/cache/judge, doc parsers, embeddings + guardrails + metrics.
11. **Calculation Engine** — waterfall, moic/irr, currency, tax, partner splits, AUM aggregator, rounding rules.
12. **API Infra** — gateway, middleware, validation, formatting, errors, rate-limit, idempotency, versioning, webhooks.
13. **UI Library** — tokens, CVA components, patterns.
14. **Admin** — livedeal flows, transactions ops, templates, communications, dashboard, approvals.
15. **Investor App** — portal, deal experience, transactions UI, secondary UI, performance, notifications, doc viewer, CRM/education/news/chat.
16. **Communications** — orchestrator, templates, immutable log, preferences, analytics, channels.
17. **Integrations** — mailchimp, slack, whatsapp, drive, sheets, docsend, docusign, bank, stripe, quickbooks, hubspot, webhook manager.
18. **Accounting** — export to QBO, journal batches, rev-rec, chart of accounts, period close, audit trail.
19. **Monitoring/Testing** — perf, error, health, fixtures, e2e, unit utils, analytics tracker, feature flags, dashboards.
20. **Tax Reporting** — withholding rules, W-8/W-9, board packs, country profiles.
21. **News** — deals/companies feeds, digests, alerts, sources.
22. **Mobile** — navigation/cards/offline/biometrics/push.
23. **Database/Ops** — migrations, views, policies, seeds, backups.

## Definition of Done (per feature)
- API route & handler implemented; schema updated; RLS policy present.
- Unit tests + happy + edge paths; fixtures seeded.
- Docs: add entry in `DB/feature_tables_map.md` and, where relevant, in `API/routes.md`.
- Monitoring: basic metric or log counter added.
- Demo: screenshot/GIF or JSON sample attached to PR.

## Non-Goals (phase 1)
- Multi-tenant UI themes per customer (we keep single brand).
- Cross-ledger accounting beyond exports (ERP owns the ledger of record).
