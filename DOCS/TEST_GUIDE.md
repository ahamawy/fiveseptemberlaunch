# Test Guide

## Unit (Vitest)
- DTO schemas and pure mappers.
- Repo functions with mocked clients.
- Edge cases: empty result, validation error, permission error.

## E2E (Playwright)
- Start dev server (Next.js) at :3000.
- Use MSW to simulate API responses deterministically.
- Assert UX: skeleton -> content OR error -> retry.

## Conventions
- `data-testid="<slug>--<element>"`
- Feature code in `describe()` title.
