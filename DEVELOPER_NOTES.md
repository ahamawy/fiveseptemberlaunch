# Developer Notes

## What Changed Today (2025-08-15)

### Fixed
1. **Transactions Page** - Added data transformation for API response format mismatch
2. **Playwright Tests** - Updated from port 3003 to 3000, fixed selectors for new UI
3. **Test Assertions** - Updated to match current component structure

### Key Files Modified
- `app/investor-portal/transactions/page.tsx` - Data mapping fix
- `playwright.config.ts` - Port update
- `e2e/*.spec.ts` - Test updates

## Common Issues

### Transactions Not Loading?
API returns `{data, success}` but UI expects `{transactions, pagination, summary}`.
Fix is in transactions page lines 69-90.

### Tests Failing?
- Check dev server is on port 3000
- Run `npm run build` if assets are missing
- API field names: snake_case → camelCase mapping needed

## API Response Formats

### Dashboard
```json
{
  "portfolio": {...},
  "performance": {...},
  "recentActivity": [...]
}
```

### Transactions  
```json
{
  "success": true,
  "data": [...],  // Not "transactions"!
  "timestamp": "..."
}
```

## Service Layer
All data access goes through `/lib/services/`:
- `dealsService`
- `investorsService`
- `transactionsService`

## Data Modes
Toggle in `.env.local`:
- `NEXT_PUBLIC_USE_MOCK_DATA=true` - Mock data
- `NEXT_PUBLIC_USE_MOCK_DATA=false` - Supabase

## Testing Quick Reference
```bash
# After code changes
npx playwright test

# Debug failing test
npx playwright test --ui

# Single test
npx playwright test -g "transactions"
```