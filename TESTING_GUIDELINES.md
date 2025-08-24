### Testing Guidelines (Playwright)

Selectors

- Use `data-testid` for key UI: headers, KPIs, tables, cards grid, nav links.
- Avoid copy/text-based regex; copy is privacy-first and may change.

Waits

- Wait for the API the page calls (see `DOCS/API_OWNERSHIP_MATRIX.md`).
- Prefer `waitForResponse('**/api/...')` then `expect(locator).toBeVisible()`.
- Avoid depending on `_rsc` URLs.

API envelopes

- Assert on `{ success, data, metadata? }`; check `data` content.

Images

- External storage images may be blocked in CI (ORB). Assert logo container presence, not image network load.

Gates

- Quick gates must pass before merge (see `DOCS/PLAYWRIGHT_GATES.md`).
