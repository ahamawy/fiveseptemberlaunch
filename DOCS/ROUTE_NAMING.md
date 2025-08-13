# Route Naming

- REST with nouns: `/deals`, `/investors`, `/transactions`
- Feature code ↔ route mapping stored in `API/routes.md` of the Config pack.
- For calculations/jobs: `/calc/<domain>/<feature>` or POST to `/.../run` for non-idempotent workloads.
