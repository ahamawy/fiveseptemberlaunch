### Playwright Test Mapping & Gates

Run

```bash
npx playwright test
```

Quick gates (per PR)

- `e2e/quick-health-check.spec.ts` — basic routing + health
- `e2e/investor-portal.spec.ts` — dashboard loads, portfolio table, transactions
- `e2e/portfolio-test.spec.ts` — filters, cards/table toggle, charts render

Selector policy

- Prefer stable `data-testid` selectors over copy text. Avoid regex on headings subject to copy changes.
- Pages must expose minimal `data-testid` hooks for: main header, key KPIs, table body, cards grid, nav links.

Waiting policy

- Wait for API responses that the page actually calls (see API Ownership Matrix), not legacy endpoints.
- Avoid brittle `_rsc` navigations; prefer `waitForResponse('**/api/...')` then `expect(...).toBeVisible()`.

Nightly extended

- `e2e/full-app-health-check.spec.ts`
- `e2e/storage-assets.spec.ts`
- `e2e/landing-motion.spec.ts`
- `e2e/positioning-test.spec.ts`

Feature → Tests

- Dashboard → investor-portal.spec.ts (section: dashboard), quick-health-check.spec.ts
- Portfolio → portfolio-test.spec.ts, investor-portal.spec.ts (portfolio section)
- Deals → investor-portal.spec.ts (deals section)
- Transactions → investor-portal.spec.ts (transactions section)

Pass criteria

- No failures in quick gates for merge; nightly failures raise follow-ups but don’t block if quick gates green.

API assertions

- Investor portal APIs return `{ success: boolean, data: T, metadata? }`. Tests should assert on `data`, not a top-level collection key.
- Deals endpoints may enrich with valuations/doc counts; prefer presence assertions, not exact counts.

External assets

- Storage images may be blocked by ORB in CI. Tests should not fail on external image fetch; assert presence of logo container, not successful network image load.
