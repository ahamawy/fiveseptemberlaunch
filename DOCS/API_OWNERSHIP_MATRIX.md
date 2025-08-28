### API Ownership Matrix (Investor Portal)

- Single data path: API route → repo (`lib/db/repos/**`) → Supabase (service client)
- Pages/components consume contracts from `lib/contracts/**` only.

| Area         | Route                                  | Repo/Service                                | Contract               | Notes                                                                  |
| ------------ | -------------------------------------- | ------------------------------------------- | ---------------------- | ---------------------------------------------------------------------- |
| Dashboard    | `GET /api/investors/[id]/dashboard`    | `investors.repo.getDashboard`               | `DashboardSummary`     | Returns portfolio/performance/recentActivity; uses service-role client |
| Portfolio    | `GET /api/investors/[id]/portfolio`    | `investors.repo.getPortfolio`               | `PortfolioResponse`    | Includes allocation, deals list with company assets                    |
| Transactions | `GET /api/investors/[id]/transactions` | `transactions.repo.getByInvestor` + enrich  | `TransactionItem[]`    | Company + deal metadata added from repos                               |
| Deals (list) | `GET /api/deals`                       | `dealsService.getDeals` (uses repos)        | `DealListItem[]`       | Latest valuations + documents count                                    |
| Companies    | `GET /api/companies`                   | repo + `utils/storage.findCompanyAssetUrls` | `CompanyWithAssets[]`  | Public storage URLs only                                               |
| Health       | `GET /api/health/supabase`             | `supabase/server-client`                    | `{ ok: boolean, ... }` | Non-blocking diagnostics                                               |
| Valuations   | `/api/valuations/*`                    | `valuationService.*`                        | various                | Server-only writes; cascades NAV via portfolio schema                  |
| Exit Scenarios | `/api/portfolio/exit-scenarios`      | `exitScenarioService.*`                     | `ExitScenarioResult`   | Multi-company; writes to `portfolio.exit_scenarios`                    |

#### Explicit Routes

| Route | Owner | Service/Repo | Contract |
|-------|-------|--------------|----------|
| POST `/api/valuations/company` | API | `valuationService.upsertCompanyValuation` | `{ success, data, affectedDeals }` |
| GET `/api/valuations/deal` | API | `valuationService.getDealPortfolio` | `{ success, data }` |
| POST `/api/portfolio/exit-scenarios` | API | `exitScenarioService.createScenario` | `{ success, data }` |

Ownership

- Data/API Owner: app/api/\*\* (investor routes)
- Data Access Owner: lib/db/repos/\*\*
- Domain Services Owner: lib/services/\*\*
- Contracts Owner: lib/contracts/\*\*

PR checklist (enforced manually)

- Uses repo/service (no raw `sb.from` in routes)
- Server routes use service-role client
- Dot-named tables via `from("deals.deal")`
- Response matches contract in `lib/contracts/**`
- Add note to `PLAYWRIGHT-STATUS.md` if UI flow impacted
