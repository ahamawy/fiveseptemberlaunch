### UI Health Gate (Playwright-backed)

Purpose
Ensure investor portal functionality is never merged in a degraded state. Health is tied to Supabase connectivity and core portal journeys.

Signals
- Health API: `GET /api/health/supabase` → `{ ok: true }` or detailed diagnostics (non-blocking)
- Banner: `components/dev/HealthBanner.tsx` shows degraded status without breaking navigation

Playwright gates (must pass)
- `e2e/quick-health-check.spec.ts`
- `e2e/investor-portal.spec.ts`
- `e2e/portfolio-test.spec.ts`
- `e2e/full-app-health-check.spec.ts` (nightly)

CI policy
- PR pipeline runs quick gates; nightly runs full suite.
- If Health API returns `{ ok: false }`, quick gates still run; failures block merge.

When to pause enhancements
- If health is degraded and any quick gate fails, pause UI changes that touch data paths; proceed only with purely presentational updates.


