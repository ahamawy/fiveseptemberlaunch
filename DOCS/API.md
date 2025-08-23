# API Endpoints Reference

## Public Endpoints

| Method | Endpoint                           | Description                            | Response                                                         |
| ------ | ---------------------------------- | -------------------------------------- | ---------------------------------------------------------------- | ------- |
| GET    | `/api/deals`                       | List all deals                         | `{ data: Deal[] }`                                               |
| POST   | `/api/deals`                       | Create deal (server-only)              | `{ success, data: Deal }`                                        |
| GET    | `/api/deals/[dealId]`              | Get single deal                        | `{ data: Deal }`                                                 |
| PUT    | `/api/deals/[id]`                  | Update deal (server-only)              | `{ success, data: Deal }`                                        |
| DELETE | `/api/deals/[id]`                  | Delete deal (server-only)              | `{ success }`                                                    |
| GET    | `/api/deals/[id]/formula`          | Get deal's active formula assignment   | `{ success, data: FormulaTemplate                                | null }` |
| POST   | `/api/deals/[id]/formula`          | Assign a formula template to a deal    | `{ formulaTemplateId }` → `{ success, data: FormulaTemplate }`   |
| POST   | `/api/deals/[id]/calculate`        | Execute calculation and store audit    | `{ investorId?, transactionId? }` → `{ success, data, auditId }` |
| GET    | `/api/deals/[id]/calculate`        | Calculation history for a deal         | `{ success, data: Audit[] }`                                     |
| GET    | `/api/investors/[id]`              | Get investor profile (id or public_id) | `{ data: Investor }`                                             |
| GET    | `/api/investors/[id]/dashboard`    | Dashboard metrics                      | `{ ... }`                                                        |
| GET    | `/api/investors/[id]/portfolio`    | Portfolio holdings                     | `{ ... }`                                                        |
| GET    | `/api/investors/[id]/transactions` | Transaction history                    | `{ data: Transaction[] }`                                        |
| GET    | `/api/investors/[id]/commitments`  | Commitments                            | `{ ... }`                                                        |
| GET    | `/api/transactions`                | All transactions                       | `{ data: Transaction[] }`                                        |
| POST   | `/api/transactions`                | Create transaction (server-only)       | `{ success, data: Transaction }`                                 |
| GET    | `/api/companies`                   | List companies                         | `{ data: Company[] }`                                            |
| POST   | `/api/companies`                   | Create company (server-only)           | `{ success, data: Company }`                                     |
| GET    | `/api/companies/[id]`              | Get company                            | `{ data: Company }`                                              |
| PUT    | `/api/companies/[id]`              | Update company (server-only)           | `{ success, data: Company }`                                     |
| DELETE | `/api/companies/[id]`              | Delete company (server-only)           | `{ success }`                                                    |
| GET    | `/api/documents`                   | Documents list                         | `{ data: Document[] }`                                           |
| POST   | `/api/documents`                   | Ingest document metadata (server-only) | `{ success, data }` (202 Accepted)                               |

## Admin Endpoints

| Method | Endpoint                   | Description                   | Request Body                   | Response                               |
| ------ | -------------------------- | ----------------------------- | ------------------------------ | -------------------------------------- |
| POST   | `/api/admin/chat`          | AI chat interface             | `{ message, file?, context? }` | `{ response, data?, actions? }`        |
| GET    | `/api/admin/formulas`      | List formula templates        | -                              | `{ success, data: FormulaTemplate[] }` |
| GET    | `/api/admin/formulas/[id]` | Get a formula template        | -                              | `{ success, data: FormulaTemplate }`   |
| POST   | `/api/admin/formulas`      | Create formula template       | `FormulaTemplate`              | `{ success, data }`                    |
| PUT    | `/api/admin/formulas/[id]` | Update formula template       | `Partial<FormulaTemplate>`     | `{ success, data }`                    |
| DELETE | `/api/admin/formulas/[id]` | Soft-delete (is_active=false) | -                              | `{ success }`                          |
| POST   | `/api/admin/formulas/test` | Test a formula with variables | `{ formula, variables }`       | `{ success, result? }`                 |
| POST   | `/api/admin/fees/apply`    | Apply fees                    | `{ transactionId, fees }`      | `{ success, appliedFees }`             |
| POST   | `/api/admin/fees/import`   | Import CSV                    | `{ csvData, dealId }`          | `{ success, preview }`                 |
| POST   | `/api/admin/fees/profiles` | Create profile                | `{ name, config, dealId }`     | `{ success, profileId }`               |
| GET    | `/api/admin/fees/profiles` | List profiles                 | -                              | `{ data: Profile[] }`                  |
| POST   | `/api/admin/ingest/upload` | Upload doc                    | `FormData: { file }`           | `{ success, extracted }`               |
| POST   | `/api/admin/ingest/parse`  | Parse with AI                 | `{ content, type }`            | `{ mapping, suggestions }`             |

## Health Endpoints

| Method | Endpoint               | Description     | Response                        |
| ------ | ---------------------- | --------------- | ------------------------------- |
| GET    | `/api/health`          | System health   | `{ status: 'ok', timestamp }`   |
| GET    | `/api/health/supabase` | Supabase status | `{ connected, tables, error? }` |

## Query Parameters

### Pagination

```text
?page=1&limit=20
```

### Filtering

```text
?stage=active&type=primary
?status=pending&investor_id=123
```

### Sorting

### Journey Scoping (Investor)

- Investor-facing endpoints accept a specific investor via path params.
- UI pages also accept a query parameter for routing:

```text
/investor-portal/dashboard?investor=<id>
/investor-portal/portfolio?investor=<id>
/investor-portal/transactions?investor=<id>
/investor-portal/deals?investor=<id>
```

Fallback order used by UI pages:

1. `?investor=<id>` query parameter
2. `localStorage.equitie-current-investor-id`
3. `1` (development default)

```text
?sort=created_at&order=desc
```

## Response Formats

### Success Response

```json
{
  "success": true,
  "data": {...},
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

## Authentication

Read endpoints are available without auth in development.

Write endpoints are server-only and protected:

- In development: allowed without special headers
- In production: require header `x-admin-key: <ADMIN_API_KEY>`

Supabase usage:

- Server-only reads/writes use a dedicated service-role client from `lib/db/supabase/server-client.ts`
- Do not expose service keys to the browser. Client-side uses anon key for read-only where applicable
- Environment checklist (development):
  - `NEXT_PUBLIC_SUPABASE_URL` must be set
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` must be set
  - `SUPABASE_SERVICE_ROLE_KEY` must be set for admin/formula endpoints
  - Node.js v20+ is required

Cross-schema and dot-named tables:

- Use explicit schemas only for true schema-qualified tables.
- For dot-named tables (the dot is part of the table name in public schema), use `.from("deals.deal")` and `.from("companies.company")`.

```ts
// Dot-named public tables
const { data: deals } = await supabase.from("deals.deal").select("*");
const { data: companies } = await supabase
  .from("companies.company")
  .select("*");

// Regular public tables
const { data: tx } = await supabase.from("transactions").select("*");
const { data: vals } = await supabase
  .from("deal_valuations")
  .select("deal_id, moic, irr, valuation_date")
  .order("valuation_date", { ascending: false });
```

Valuations (keep latest per deal):

```ts
const { data: valuations } = await supabase
  .from("deal_valuations")
  .select("deal_id, moic, irr, valuation_date")
  .in("deal_id", dealIds)
  .order("valuation_date", { ascending: false });

const valuationsMap = new Map<number, { moic: number; irr: number | null }>();
(valuations || []).forEach((v) => {
  if (!valuationsMap.has(v.deal_id)) {
    valuationsMap.set(v.deal_id, {
      moic: parseFloat(v.moic as any) || 1.0,
      irr: v.irr ? parseFloat(v.irr as any) : null,
    });
  }
});
```

Headers used in examples:

```text
X-Investor-Id: 1
x-admin-key: <ADMIN_API_KEY>
```

## Rate Limiting

No rate limiting in development. Production limits:

- Public: 100 req/min
- Admin: 1000 req/min
