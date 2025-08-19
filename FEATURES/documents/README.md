# Documents — Canonical Feature Index

## Feature Code

`5` — Documents domain (see `FEATURES/FEATURE_TREE.md`).

## Scope

- Canonical document store, upload, classification, extraction, linking.

## Entry Points

- UI (investor app)
  - `app/investor-portal/documents/page.tsx`
- API
  - `app/api/documents/route.ts`
- Services
  - `lib/services/documents.service.ts`
  - `lib/services/document-processor.service.ts`

## Key Docs

- Platform: `DOCS/API.md`, `CLAUDE.md`
- Bot: `EQUITIE_BOT_INTEGRATION.md`

## Invariants / Rules

- Stable storage and metadata; no schema changes.

## Tests

- See `tests/investor-portal.spec.ts`

## Owners

- Feature owners: Documents team
