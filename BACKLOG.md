### Backlog (prioritized)

P0 (gating)

- Update quick gates to use `data-testid` selectors and correct waits
- Add `data-testid` hooks on portal pages

P1 (stability)

- Memoize fetches per investor in route handlers
- Add skeleton loaders; standardize empty/error states

P2 (performance)

- Cache headers on high-traffic GETs (deals, portfolio)
- Lazy-load non-critical charts and images

P3 (hygiene)

- Zod runtime guards at API edge (log-only)
- Supabase read helper in repos
