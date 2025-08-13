# Troubleshooting Guide - Investor Portal Dashboard

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test           # Unit tests
npm run test:e2e   # E2E tests with Playwright
```

## 🔍 Common Issues and Solutions

### 1. Application Not Starting

**Issue**: `npm run dev` fails or page shows 404

**Solutions**:
- Ensure all dependencies are installed: `npm install`
- Check Node.js version: `node --version` (should be 18.x or higher)
- Clear Next.js cache: `rm -rf .next && npm run dev`
- Check if port 3000 is available: `lsof -i :3000`

### 2. API Routes Returning 500 Errors

**Issue**: Dashboard shows "Error loading dashboard data"

**Solutions**:
- Check if mock data files exist in `/lib/mock-data/`
- Verify API routes are properly configured in `/app/api/`
- Check browser console for specific error messages
- Use DevTools (bottom-right corner in dev mode) to inspect network requests

### 3. Styling Issues

**Issue**: Components not styled properly

**Solutions**:
- Ensure Tailwind CSS is configured: Check `tailwind.config.js`
- Verify `globals.css` imports Tailwind directives
- Clear browser cache and hard refresh (Cmd+Shift+R / Ctrl+Shift+R)

### 4. TypeScript Errors

**Issue**: Type errors during build

**Solutions**:
- Run `npm run typecheck` to identify issues
- Ensure `tsconfig.json` is properly configured
- Check that all imports use correct paths (use `@/` for root imports)

## 🛠 Development Tools

### Built-in DevTools

When running in development mode, you'll see a "🛠 DevTools" button in the bottom-right corner. This provides:

1. **Logs Tab**: View application logs with filtering by level
2. **Network Tab**: Monitor API calls and response times
3. **Performance Tab**: Track page load metrics and memory usage

### Error Boundary

The application includes a global error boundary that:
- Catches React component errors
- Displays user-friendly error messages
- Shows detailed stack traces in development
- Provides a "Reload page" option

### Logging Utility

Use the logger for debugging:

```typescript
import { logger } from '@/lib/utils/logger';

// Log different levels
logger.debug('Debug message', { data });
logger.info('Info message');
logger.warn('Warning message');
logger.error('Error message', error);
```

## 📊 Performance Monitoring

### Expected Performance Metrics

- Dashboard load: < 500ms
- API responses: < 250ms
- First paint: < 400ms
- Time to interactive: < 1s

### How to Check Performance

1. Open DevTools (browser or built-in)
2. Go to Performance tab
3. Record page load
4. Check for bottlenecks

## 🧪 Testing

### Running Tests

```bash
# Unit tests
npm test

# E2E tests (headless)
npm run test:e2e

# E2E tests with UI
npm run test:e2e:ui

# E2E tests with debugging
npm run test:e2e:debug
```

### Test Coverage Areas

1. **Unit Tests** (`/tests/investor-portal.spec.ts`)
   - Mock data generators
   - Performance calculations
   - Data relationships

2. **E2E Tests** (`/e2e/investor-portal.spec.ts`)
   - Page navigation
   - API integration
   - Error handling
   - Responsive design

## 🔧 Configuration

### Environment Variables (`.env.local`)

```env
# Core Settings
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000

# Feature Flags
NEXT_PUBLIC_ENABLE_DEVTOOLS=true
NEXT_PUBLIC_LOG_LEVEL=debug
NEXT_PUBLIC_USE_MOCK_DATA=true

# Performance
NEXT_PUBLIC_PERFORMANCE_THRESHOLD_MS=500
```

### Next.js Configuration (`next.config.js`)

- Source maps enabled in development
- Detailed error reporting
- Request logging for debugging

## 📋 Debugging Checklist

When encountering issues, check:

- [ ] Browser console for errors
- [ ] Network tab for failed requests
- [ ] Server logs in terminal
- [ ] DevTools panel for application logs
- [ ] Test results for specific failures
- [ ] TypeScript compilation errors

## 🚨 Error Codes Reference

| Code | Description | Solution |
|------|-------------|----------|
| 404 | Page not found | Check routing in `/app/` directory |
| 500 | Server error | Check API route handlers and logs |
| ECONNREFUSED | Can't connect to server | Ensure dev server is running |
| MODULE_NOT_FOUND | Missing dependency | Run `npm install` |

## 📝 Learnings from Implementation

### Key Discoveries

1. **Next.js App Router**: Requires proper file structure in `/app` directory
2. **API Routes**: Must export named functions (GET, POST, etc.)
3. **Client Components**: Need `'use client'` directive for hooks
4. **TypeScript Paths**: Use `@/` for clean imports
5. **Mock Data**: Centralize in `/lib/mock-data` for consistency

### Best Practices Implemented

1. **Error Handling**: Global error boundary + try-catch in API routes
2. **Performance**: Pagination, lazy loading, optimized re-renders
3. **Developer Experience**: Built-in DevTools, comprehensive logging
4. **Testing**: Both unit and E2E tests for confidence
5. **Type Safety**: Full TypeScript coverage with strict mode

## 🆘 Getting Help

If you're still stuck:

1. Check the browser console for specific error messages
2. Review the server logs in your terminal
3. Run the test suite to identify broken functionality
4. Use the built-in DevTools to inspect application state
5. Check this guide's Common Issues section

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Playwright Testing](https://playwright.dev/docs/intro)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Note**: This application uses mock data. For production, you'll need to:
1. Connect to real Supabase database
2. Implement authentication
3. Add real-time data fetching
4. Configure production environment variables