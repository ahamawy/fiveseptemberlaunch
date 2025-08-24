### Folders Overview (Investor Portal)

`app/`

- `investor-portal/` — pages for dashboard, portfolio, deals, transactions, documents
- `api/` — server routes; investor routes must use repos and service-role client

`lib/`

- `db/` — supabase clients, repos, schema helpers
- `services/` — domain logic orchestrating repos
- `contracts/` — canonical API response types
- `utils/` — shared utilities (investor resolution, storage)

`components/`

- `ui/` — design system
- `portfolio/` — portal-specific components

`DOCS/`

- Process and technical docs (schema, gates, policies)
