# Defensive Coding Guide

- Always validate inputs with zod; never trust query/body params.
- Use typed error helpers and surface friendly messages with ErrorBoundary.
- Network: wrap fetch with timeout + retry (exponential backoff) for idempotent GETs.
- UI: always render one of {LoadingSkeleton, ErrorState, EmptyState, Content}.
- Tables: include `data-testid` with `<slug>--<element>` consistently for tests.
- SQL: prefer `on delete cascade` only when it matches business rules; otherwise soft-delete with `deleted_at`.
- RLS: default deny; test with service role vs user role.
