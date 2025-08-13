You are pairing with me on Equitie.

Task: Implement <feature-code> <feature-slug>.

Context:
- Feature Attributes: (paste from the feature folder's FEATURE.md)
- DB tables/views: (paste the relevant defs from DB/schema.sql or migrations)
- API route(s): (paste the exact route(s) from API/routes.md)
- Acceptance:
  - [ ] Contract validated by zod
  - [ ] RLS policy updated/added
  - [ ] Unit + E2E tests written and passing
  - [ ] Docs updated (feature map + FEATURE.md success metrics)

Constraints:
- TypeScript, Next.js App Router
- Vitest for unit; Playwright for e2e
- Supabase client (parameterized SQL), no string interpolation
- Use brand tokens via `BRAND_CONFIG` helpers when touching UI

Write:
- Minimal code, tests, and short notes. No extra commentary.
