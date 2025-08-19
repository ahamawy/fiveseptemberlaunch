# Fees — API

## Endpoints

- Profiles
  - `POST /api/admin/fees/profiles`
  - `GET /api/admin/fees/profiles`
- Imports (legacy)
  - `POST /api/admin/fees/import`
  - `GET /api/admin/fees/import`
  - `POST /api/admin/fees/apply`
- Imports (v2)
  - `POST /api/admin/fees/apply-v2`
- Smart Import
  - `POST /api/admin/fees/smart-import`
  - `POST /api/admin/fees/smart-import/[session_id]/apply`
- Chat (enhanced)
  - `POST /api/admin/chat`

## Conventions

- Strict typing; validate inputs; return structured JSON with audit notes when applicable.

## References

- `DOCS/API.md`
- `DOCS/EQUITIE_BOT_CONTEXT.md`
