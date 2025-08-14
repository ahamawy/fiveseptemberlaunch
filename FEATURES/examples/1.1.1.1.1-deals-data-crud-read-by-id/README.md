# Feature Module: 1.1.1.1.1 deals-data-crud-read-by-id

## Overview
This feature module implements the GET /api/deals/:dealId endpoint to fetch a single deal by ID with proper validation and error handling.

## Architecture

### Components
1. **DTO (Data Transfer Object)** - `dto/deal.ts`
   - Defines the response schema using Zod
   - Validates data structure
   - Transforms internal data to API format

2. **Repository** - `repo/deals.read.ts`
   - Handles data fetching logic
   - Switches between mock and Supabase data sources
   - Implements access control checks

3. **Route Handler** - `routes/deals.get.ts`
   - Processes HTTP requests
   - Validates parameters
   - Returns proper HTTP responses

4. **API Bridge** - `app/api/deals/[dealId]/route.ts`
   - Next.js API route that delegates to feature module

## Configuration

### Environment Variables
```env
# Enable features system
NEXT_PUBLIC_ENABLE_FEATURES=true
NEXT_PUBLIC_FEATURE_DEALS_READ=true

# Data mode (mock or Supabase)
NEXT_PUBLIC_USE_MOCK_DATA=true
NEXT_PUBLIC_ENABLE_SUPABASE=false
```

## Testing

### Unit Tests
```bash
npm test -- FEATURES/examples/1.1.1.1.1-deals-data-crud-read-by-id/tests/unit.spec.ts
```

### E2E Tests
```bash
npm run test:e2e -- FEATURES/examples/1.1.1.1.1-deals-data-crud-read-by-id/tests/e2e.spec.ts
```

### Manual Testing
```bash
# Test with curl
curl http://localhost:3000/api/deals/1

# Expected response
{
  "id": 1,
  "name": "Alpha Tech Series A",
  "stage": "active",
  "company": {
    "id": 1,
    "name": "Alpha Tech"
  },
  "identifiers": {
    "code": "ALPHA-A",
    "slug": "alpha-tech-series-a",
    "aliases": []
  }
}
```

## Performance Targets
- p95 latency: < 150ms
- p99 latency: < 300ms

## Troubleshooting

### Common Issues

1. **500 Internal Server Error**
   - Check environment variables are set correctly
   - Ensure NEXT_PUBLIC_USE_MOCK_DATA=true for local development
   - Verify the dev server has reloaded after config changes

2. **404 Not Found**
   - Verify the deal ID exists in mock data
   - Check route handler is properly registered

3. **Schema validation errors**
   - Ensure DTO matches the expected response format
   - Check data transformation in repository

## Integration with Main App

This feature integrates with the main application through:
1. Service layer (`lib/services/deals.service.ts`)
2. Mock data (`lib/mock-data/deals.ts`)
3. Schema manager (`lib/db/schema-manager`)

## Future Enhancements
- [ ] Add caching layer
- [ ] Implement proper RLS checks for Supabase
- [ ] Add request rate limiting
- [ ] Support batch fetching