# API Endpoints Reference

## Public Endpoints

| Method | Endpoint | Description | Response |
|--------|----------|-------------|----------|
| GET | `/api/deals` | List all deals | `{ data: Deal[], success: boolean }` |
| GET | `/api/deals/[dealId]` | Get single deal | `{ data: Deal, success: boolean }` |
| GET | `/api/investors/[id]` | Get investor profile | `{ data: Investor, success: boolean }` |
| GET | `/api/investors/[id]/dashboard` | Dashboard metrics | `{ data: DashboardData, success: boolean }` |
| GET | `/api/investors/[id]/portfolio` | Portfolio holdings | `{ data: Portfolio[], success: boolean }` |
| GET | `/api/investors/[id]/transactions` | Transaction history | `{ data: Transaction[], success: boolean }` |
| GET | `/api/investors/[id]/commitments` | Commitments | `{ data: Commitment[], success: boolean }` |
| GET | `/api/transactions` | All transactions | `{ data: Transaction[], success: boolean }` |
| GET | `/api/documents` | Documents list | `{ data: Document[], success: boolean }` |

## Admin Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/api/admin/chat` | AI chat interface | `{ message, file?, context? }` | `{ response, data?, actions? }` |
| POST | `/api/admin/fees/apply` | Apply fees | `{ transactionId, fees }` | `{ success, appliedFees }` |
| POST | `/api/admin/fees/import` | Import CSV | `{ csvData, dealId }` | `{ success, preview }` |
| POST | `/api/admin/fees/profiles` | Create profile | `{ name, config, dealId }` | `{ success, profileId }` |
| GET | `/api/admin/fees/profiles` | List profiles | - | `{ data: Profile[] }` |
| POST | `/api/admin/ingest/upload` | Upload doc | `FormData: { file }` | `{ success, extracted }` |
| POST | `/api/admin/ingest/parse` | Parse with AI | `{ content, type }` | `{ mapping, suggestions }` |

## Health Endpoints

| Method | Endpoint | Description | Response |
|--------|----------|-------------|----------|
| GET | `/api/health` | System health | `{ status: 'ok', timestamp }` |
| GET | `/api/health/supabase` | Supabase status | `{ connected, tables, error? }` |

## Query Parameters

### Pagination
```
?page=1&limit=20
```

### Filtering
```
?stage=active&type=primary
?status=pending&investor_id=123
```

### Sorting
```
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
Currently using mock authentication. Headers:
```
X-Investor-Id: 1
```

## Rate Limiting
No rate limiting in development. Production limits:
- Public: 100 req/min
- Admin: 1000 req/min