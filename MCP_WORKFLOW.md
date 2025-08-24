# 🚀 MCP-Powered Feature Development Workflow

## Quick Start

```bash
# Start all MCP servers
docker-compose -f docker-compose.mcp.yml up -d

# Run feature accelerator
npx tsx scripts/feature-accelerator.ts

# Or use individual MCP servers
curl http://localhost:3100  # Supabase MCP
curl http://localhost:3101  # Equitie MCP
curl http://localhost:3104  # Filesystem MCP
curl http://localhost:3105  # Memory MCP
curl http://localhost:3108  # Feature Generator
```

## Available MCP Servers

| Server | Port | Purpose | Status |
|--------|------|---------|--------|
| **Supabase** | 3100 | Database operations | ✅ Running |
| **Equitie** | 3101 | Domain logic | ✅ Running |
| **Filesystem** | 3104 | File operations | ✅ Running |
| **Memory** | 3105 | Context persistence | ✅ Running |
| **Feature Gen** | 3108 | Auto-generate code | 🔄 Available |
| **Context7** | 3102 | Smart context | 🔄 Available |
| **GitHub** | 3103 | Repo operations | 🔄 Available |
| **Test Gen** | 3109 | Generate tests | 🔄 Available |
| **API Gen** | 3110 | Generate APIs | 🔄 Available |

## Feature Development Flow

### 1. Select Feature from Tree
```bash
# View available features
curl http://localhost:3108/features

# Or check FEATURES/FEATURE_TREE.md
# Example: 1.1.1.1 deals-data-crud-read
```

### 2. Generate Boilerplate
```bash
# Generate files for feature
curl http://localhost:3108/generate/1.1.1.1

# This creates:
# - API route: /app/api/deals-data/route.ts
# - Component: /components/DealsData.tsx
# - Service: /lib/services/deals.service.ts
# - Test: /e2e/deals-data.spec.ts
```

### 3. Use MCP Tools

#### Database Operations (Supabase MCP)
```typescript
// Via MCP bridge in code
import { mcpBridge } from '@/lib/services/mcp-bridge.service';

// Create table if needed
await mcpBridge.executeSQL(`
  CREATE TABLE IF NOT EXISTS deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    status TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )
`);
```

#### File Operations (Filesystem MCP)
```bash
# Search for patterns
curl -X POST http://localhost:3104/search \
  -d '{"pattern": "deals", "path": "/workspace"}'

# Create files
curl -X POST http://localhost:3104/write \
  -d '{"path": "app/api/deals/route.ts", "content": "..."}'
```

#### Context Memory (Memory MCP)
```bash
# Store context
curl -X POST http://localhost:3105/store \
  -d '{"key": "current_feature", "value": "1.1.1.1"}'

# Retrieve context
curl http://localhost:3105/get/current_feature
```

## Feature Accelerator Script

The `scripts/feature-accelerator.ts` automates the entire flow:

```bash
# Run interactive feature builder
npx tsx scripts/feature-accelerator.ts

# Menu:
# 1. Select feature from tree
# 2. Generate all files
# 3. Update database
# 4. Create tests
# 5. Commit changes
```

## Example: Implement Deal CRUD

```bash
# 1. Start MCPs
docker-compose -f docker-compose.mcp.yml up -d

# 2. Run accelerator
npx tsx scripts/feature-accelerator.ts

# 3. Select feature
# Enter: 1.1.1.1 (deals-data-crud-read)

# 4. Files created:
# ✅ /app/api/deals/route.ts
# ✅ /components/DealsData.tsx
# ✅ /lib/services/deals.service.ts
# ✅ /e2e/deals-data.spec.ts

# 5. Test
npm run dev
# Visit: http://localhost:3001/deals

# 6. Run tests
npx playwright test deals-data.spec.ts
```

## Advanced MCP Usage

### Combine Multiple MCPs
```javascript
// Use multiple MCPs together
async function buildFeature(featureId) {
  // 1. Get feature spec from Context7
  const spec = await fetch(`http://localhost:3102/feature/${featureId}`);
  
  // 2. Generate code with Feature Gen
  const code = await fetch(`http://localhost:3108/generate/${featureId}`);
  
  // 3. Create files with Filesystem MCP
  await fetch('http://localhost:3104/write', {
    method: 'POST',
    body: JSON.stringify(code.files)
  });
  
  // 4. Update database with Supabase MCP
  await fetch('http://localhost:3100/migrate', {
    method: 'POST',
    body: JSON.stringify(spec.schema)
  });
  
  // 5. Generate tests with Test Gen
  await fetch(`http://localhost:3109/generate/${featureId}`);
  
  // 6. Commit with GitHub MCP
  await fetch('http://localhost:3103/commit', {
    method: 'POST',
    body: JSON.stringify({
      message: `feat: Implement ${featureId}`,
      files: code.paths
    })
  });
}
```

## Tips for Rapid Development

1. **Keep MCPs Running**: Leave Docker containers up for instant access
2. **Use Memory MCP**: Store context between sessions
3. **Batch Operations**: Generate multiple features at once
4. **Template Library**: Customize templates in `feature-generator.mjs`
5. **Test Automation**: Use Test Gen MCP for instant test coverage

## Troubleshooting

```bash
# Check MCP status
docker ps | grep mcp

# View logs
docker logs mcp-supabase

# Restart specific MCP
docker-compose -f docker-compose.mcp.yml restart mcp-equitie

# Stop all MCPs
docker-compose -f docker-compose.mcp.yml down
```

## GitHub Repository

Code pushed to: https://github.com/ahamawy/fiveseptemberlaunch

---
*With MCP workflow, implement features 10x faster!*