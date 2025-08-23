### Playwright Test Mapping & Gates

Run
```bash
npx playwright test
```

Quick gates (per PR)
- `e2e/quick-health-check.spec.ts` — basic routing + health
- `e2e/investor-portal.spec.ts` — dashboard loads, portfolio table, transactions
- `e2e/portfolio-test.spec.ts` — filters, cards/table toggle, charts render

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


