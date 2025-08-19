# Investor Portal Dashboard - API Documentation

## Endpoints

### GET /api/investors/[id]/dashboard

Returns complete dashboard data for an investor.

**Parameters**:
- `id` (path) - Investor ID

**Response** (200 OK):
```json
{
  "portfolio": {
    "totalValue": 2500000,
    "totalCommitted": 2000000,
    "totalDistributed": 500000,
    "unrealizedGain": 450000
  },
  "performance": {
    "irr": 18.5,
    "moic": 1.45,
    "dpi": 0.25,
    "tvpi": 1.25
  },
  "recentActivity": [
    {
      "id": "act_123",
      "type": "distribution",
      "description": "Q4 2024 Distribution - Deal ABC",
      "amount": 50000,
      "date": "2024-12-15"
    }
  ],
  "activeDeals": 5
}
```

**Error Responses**:
- 400: Invalid investor ID
- 404: Investor not found
- 500: Internal server error

---

### GET /api/investors/[id]/portfolio

Returns detailed portfolio holdings.

**Parameters**:
- `id` (path) - Investor ID

**Response** (200 OK):
```json
{
  "holdings": [
    {
      "dealId": 1,
      "dealName": "Growth Fund III",
      "units": 100,
      "costBasis": 100000,
      "currentValue": 145000,
      "unrealizedGain": 45000
    }
  ],
  "summary": {
    "totalHoldings": 5,
    "totalValue": 2500000,
    "totalGain": 450000
  }
}
```

---

### GET /api/investors/[id]/transactions

Returns transaction history.

**Parameters**:
- `id` (path) - Investor ID
- `limit` (query) - Number of records (default: 50)
- `offset` (query) - Pagination offset
- `type` (query) - Filter by type (commitment, distribution, etc.)

**Response** (200 OK):
```json
{
  "transactions": [
    {
      "id": 123,
      "type": "commitment",
      "dealId": 1,
      "dealName": "Growth Fund III",
      "amount": 100000,
      "date": "2024-01-15",
      "status": "completed"
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 50,
    "offset": 0
  }
}
```

---

## Service Layer Methods

### InvestorsService

```typescript
class InvestorsService {
  // Get complete dashboard data
  async getDashboardData(investorId: number): Promise<DashboardData>
  
  // Get portfolio holdings
  async getPortfolioData(investorId: number): Promise<PortfolioData>
  
  // Get transaction history
  async getTransactions(
    investorId: number, 
    filters?: TransactionFilters
  ): Promise<Transaction[]>
  
  // Get commitments
  async getCommitments(investorId: number): Promise<Commitment[]>
}
```

---

## Data Transformation

The API layer transforms service data to UI-friendly shapes:

```typescript
// Service returns
{
  summary: {
    currentValue: 2500000,
    totalCommitted: 2000000,
    totalDistributed: 500000,
    totalGains: 450000,
    portfolioIRR: 18.5,
    portfolioMOIC: 1.45,
    activeDeals: 5
  },
  recentActivity: [...]
}

// API transforms to
{
  portfolio: {
    totalValue: 2500000,
    totalCommitted: 2000000,
    totalDistributed: 500000,
    unrealizedGain: 450000
  },
  performance: {
    irr: 18.5,
    moic: 1.45,
    dpi: 0.25,
    tvpi: 1.25
  },
  recentActivity: [...],
  activeDeals: 5
}
```

---

## Error Handling

All endpoints follow consistent error response format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

Common error codes:
- `INVALID_INVESTOR_ID` - Invalid ID format
- `INVESTOR_NOT_FOUND` - Investor doesn't exist
- `UNAUTHORIZED` - No access to investor data
- `INTERNAL_ERROR` - Server error

---

## Caching

Dashboard data is cached for performance:

- Cache TTL: 60 seconds
- Cache key: `dashboard:${investorId}`
- Invalidation: On transaction or commitment change

---

## Rate Limiting

- 100 requests per minute per investor
- 429 response when exceeded
- Headers include rate limit info

---

## Authentication

Currently uses investor ID directly. Future versions will integrate:
- JWT authentication
- Session validation
- Role-based access control