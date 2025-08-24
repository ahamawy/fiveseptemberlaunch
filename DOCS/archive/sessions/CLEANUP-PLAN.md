# Codebase Cleanup Plan

## Identified Issues

### 1. Test Pages (Should be removed or moved to __tests__)
- `/app/test-deals/` - Test page for deals
- `/app/test-real-data/` - Test page for real data
- `/app/test-aggregated-portfolio/` - Test page for portfolio
- `/app/test-summary/` - Test page for summary
- `/app/test-transactions/` - Test page for transactions
- `/app/test/` - Generic test page

### 2. Duplicate Config Files
- `./BRANDING/brand.config.ts` - Main brand config
- `./.claude/BRANDING/brand.config.ts` - Duplicate in .claude
- `./.claude/eqt-config/BRANDING/brand.config.ts` - Another duplicate
- `./TOOLING/playwright.config.ts` - Duplicate playwright config
- `./TOOLING/vitest.config.ts` - Duplicate vitest config
- `./TAILWIND/tailwind.config.js` - Duplicate tailwind config

### 3. Backup Files
- `/app/investor-portal/dashboard/page-backup.tsx` - Old dashboard backup

### 4. Duplicate Dashboard Pages
- `/app/investor-portal/dashboard/` - Main dashboard
- `/app/investor-portal/dashboard-simple/` - Simplified dashboard (redundant)

### 5. Test Files in Root
- `test-equation-simple.ts` - Should be in __tests__
- `test-real-deals.ts` - Should be in __tests__

### 6. Debug Routes
- `/app/api/debug/storage/[folder]/route.ts` - Debug endpoint (security risk)

## Cleanup Actions

### Phase 1: Remove Test Pages
```bash
rm -rf app/test-deals
rm -rf app/test-real-data
rm -rf app/test-aggregated-portfolio
rm -rf app/test-summary
rm -rf app/test-transactions
rm -rf app/test
```

### Phase 2: Consolidate Configs
- Keep only `./BRANDING/brand.config.ts` as source of truth
- Remove `.claude/` duplicates
- Keep root config files (next.config.js, tailwind.config.js, etc.)
- Remove TOOLING/ duplicates

### Phase 3: Clean Backups
```bash
rm app/investor-portal/dashboard/page-backup.tsx
```

### Phase 4: Consolidate Dashboards
- Merge useful features from dashboard-simple into main dashboard
- Remove dashboard-simple

### Phase 5: Move Test Files
```bash
mkdir -p __tests__
mv test-equation-simple.ts __tests__/
mv test-real-deals.ts __tests__/
```

### Phase 6: Remove Debug Endpoints
```bash
rm -rf app/api/debug
```

## Expected Benefits
- Reduce confusion from duplicate files
- Cleaner project structure
- Easier navigation
- Better security (no debug endpoints)
- Single source of truth for configs

## Files to Keep
- Main dashboard at `/app/investor-portal/dashboard/`
- Production configs in root
- Brand config at `/BRANDING/brand.config.ts`
- All production pages and APIs