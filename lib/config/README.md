# Configuration System

## Overview

The configuration system provides a centralized, type-safe way to manage all application settings, environment variables, and feature flags. It automatically detects and validates Supabase connectivity, manages data source modes, and provides comprehensive diagnostics.

## Quick Start

```typescript
import { config, getAppConfig } from '@/lib/config';

// Quick checks
const isDev = config.isDevelopment();
const hasSupabase = config.hasSupabase();
const dataMode = config.getDataMode(); // 'mock' | 'supabase' | 'mcp'

// Full diagnostics
const diagnostics = config.getDiagnostics();
console.log(diagnostics.supabase.projectId);
console.log(diagnostics.environment.nodeVersion);
```

## Configuration Hierarchy

1. **AppConfig** (`lib/config/index.ts`) - Central export point
2. **SchemaConfig** (`lib/db/schema-manager/config.ts`) - Core configuration class
3. **Environment Files** - Source of truth for settings
   - `.env.local` - Local development overrides
   - `.env.features` - Feature flags
   - `.env.example` - Template with all options

## Data Source Modes

The system automatically determines the appropriate data source:

### Mock Mode
- Used when `NEXT_PUBLIC_USE_MOCK_DATA=true`
- Or when Supabase credentials are missing/invalid
- Returns static data from `lib/mock-data/`

### Supabase Mode
- Used when valid Supabase credentials are present
- And `NEXT_PUBLIC_USE_MOCK_DATA=false`
- Connects to real Supabase database

### MCP Mode (Development Only)
- Used when MCP tools are available
- And `NEXT_PUBLIC_ENABLE_MCP=true`
- Provides advanced schema management

## Supabase Connectivity

### Status Checking

```typescript
import { getSupabaseConnectivity } from '@/lib/db/supabase/status';

const status = await getSupabaseConnectivity();
console.log(status.connected);    // true if connected
console.log(status.projectId);    // 'ikezqzljrupkzmyytgok'
console.log(status.tables);       // Table accessibility
```

### Health Endpoint

```bash
# Check Supabase status
curl http://localhost:3000/api/health/supabase

# Response includes:
# - Connection status
# - Project information
# - Table accessibility
# - Configuration flags
# - Error details (if any)
```

### DevToolbar Integration

The DevToolbar shows live Supabase status:
- ✅ Connected - Successfully connected to database
- ⚙️ Configured - Credentials present but not connected
- ❌ Missing - No credentials configured

## Environment Variables

### Required for Supabase

```env
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### Data Source Control

```env
# Toggle between mock and real data
NEXT_PUBLIC_USE_MOCK_DATA=true|false

# Enable Supabase (additional safety check)
NEXT_PUBLIC_ENABLE_SUPABASE=true|false
```

### Feature Flags

```env
# Development tools
NEXT_PUBLIC_ENABLE_DEVTOOLS=true
NEXT_PUBLIC_LOG_LEVEL=debug

# Performance monitoring
NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING=true
NEXT_PUBLIC_PERFORMANCE_THRESHOLD_MS=500
```

## API Reference

### `config` Object

Quick access to common configuration checks:

```typescript
config.isDevelopment()     // boolean
config.isProduction()      // boolean
config.isUsingMockData()   // boolean
config.hasSupabase()       // boolean
config.getDataMode()       // 'mock' | 'supabase' | 'mcp'
config.getDiagnostics()    // Full diagnostics object
config.validateNode()      // Node.js version check
config.getProjectInfo()    // Supabase project details
```

### `getAppConfig()` Function

Returns the singleton configuration instance:

```typescript
const appConfig = getAppConfig();
appConfig.hasValidSupabaseCredentials();
appConfig.getSupabaseProjectInfo();
appConfig.validateNodeVersion();
```

## Diagnostics Object

The `getDiagnostics()` method returns comprehensive information:

```typescript
{
  environment: {
    mode: 'development' | 'production',
    nodeVersion: { ok: boolean, version: string, required: string },
    dataSource: 'mock' | 'supabase' | 'mcp'
  },
  supabase: {
    configured: boolean,
    valid: boolean,
    enabled: boolean,
    projectId: string | null,
    url: string | null
  },
  features: {
    mockData: boolean,
    mcp: boolean,
    devTools: boolean,
    logging: boolean
  }
}
```

## Cache Management

Clear caches when switching data sources:

```bash
# Clear all caches
curl -X POST http://localhost:3000/api/cache/clear

# Clear specific service cache
curl -X POST http://localhost:3000/api/cache/clear?selective=deals
```

## Troubleshooting

### Supabase Not Connecting

1. Check Node.js version (requires >= 20)
2. Verify credentials in `.env.local`
3. Check `/api/health/supabase` for details
4. Ensure `NEXT_PUBLIC_USE_MOCK_DATA=false`

### Data Source Not Switching

1. Clear browser localStorage
2. Clear caches via `/api/cache/clear`
3. Hard refresh the page
4. Check DevToolbar status

### Configuration Not Loading

1. Restart Next.js dev server
2. Check `.env.local` file exists
3. Verify no syntax errors in env files
4. Check console for error messages

## Best Practices

1. **Always use the config module** - Don't access `process.env` directly
2. **Check connectivity before operations** - Use status module for validation
3. **Handle all data modes** - Code should work with mock and real data
4. **Use type-safe methods** - Leverage TypeScript types
5. **Monitor in DevToolbar** - Keep an eye on status during development