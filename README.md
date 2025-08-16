# Equitie Investor Portal

## Quick Start
```bash
npm install
npm run dev   # http://localhost:3000
```

## Status
- ✅ All 25 tests passing
- ✅ Supabase integrated
- ✅ Mock/Production modes working

## Key Pages
- `/investor-portal/dashboard` - Main dashboard
- `/investor-portal/portfolio` - Holdings
- `/investor-portal/transactions` - Transaction history
- `/investor-portal/deals` - Available deals

## Environment Setup
```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
NEXT_PUBLIC_USE_MOCK_DATA=false  # true for mock mode
```

## Testing
```bash
npx playwright test        # Run all tests
npx playwright test --ui   # Debug mode
```

## Current Branch: legacydealengines
Working on admin fee management features.