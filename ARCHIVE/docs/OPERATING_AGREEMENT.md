### Operating Agreement (Investor Portal)

Scope

- Investor portal runtime only; admin/dev/test do not block portal progress.

Branching & commits

- Branch per feature: `feature/<scope>-<short>` (e.g., `feature/portal-testids`)
- Commits: `<scope>: <summary>` (e.g., `dashboard: add testids for KPIs`)

PR checklist (must match docs)

- Uses repos (no raw `sb.from` in routes/components)
- Envelope `{ success, data, metadata? }` returned
- Contracts from `lib/contracts/**`
- Dot-table rule applied (`from("deals.deal")`)
- Data-testid hooks present for key UI
- Quick Playwright gates green

Testing

- Quick gates required per PR (see `DOCS/PLAYWRIGHT_GATES.md`)
- Selectors via `data-testid` only; wait on actual API endpoints

Docs hygiene

- Update `PLAYWRIGHT-STATUS.md` after running gates
- Link any new API/contract in docs index
