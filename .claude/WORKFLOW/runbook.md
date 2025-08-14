# Runbook

- Feature fails Playwright on error path → ensure `ErrorBoundary` + `ErrorState` and MSW mock added.
- RLS forbids reads → check tenant_id filter; service role should not be used from client.
- Migration conflicts → bump migration filename (`NNN_<slug>.sql`) and re-run.
- Schema drift → update `SCHEMA_VERSION` + note in PR.
