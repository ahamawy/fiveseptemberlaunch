### Roadmap (Investor Portal)

72-hour quick wins
- Update quick gate tests to `data-testid` and correct waits
- Add minimal `data-testid` to pages (dashboard KPIs, portfolio table/cards, nav)
- Add memoized fetch in route handlers to reduce duplicate loads
- Add skeleton loaders to portfolio and dashboard sections
- Set short `s-maxage` + `stale-while-revalidate` headers on `/api/deals` and `/api/investors/[id]/portfolio`

1-week plan
- Centralize enrichment in repos; services only compose
- Add supabase-read helper in repos for dot-table reads and error normalization
- Add Zod guards at API edges for investor routes (log only)
- Playwright reliability pass: selectors, waits, perf timings

Non-goals
- No schema changes; no breaking contract changes


