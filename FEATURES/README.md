# Feature System Documentation

## System Version: 2.0.0 - MCP-Powered Architecture

Welcome to the EquiTie Feature System. This directory contains the complete feature tree, roadmap, and documentation for our MCP-enhanced platform.

## Quick Navigation

| Document | Purpose | Status |
|----------|---------|--------|
| [FEATURE_TREE_V2.md](./FEATURE_TREE_V2.md) | Complete system architecture map | ✅ Active |
| [ROADMAP_ALIGNMENT.md](./ROADMAP_ALIGNMENT.md) | Quarterly roadmap & priorities | ✅ Current |
| [VERSION_CONTROL.md](./VERSION_CONTROL.md) | Version management & migration | ✅ Active |
| [MCP_TOOLS.md](./MCP_TOOLS.md) | MCP tool documentation | 📝 Creating |

## Current Architecture

```
┌─────────────────────────────────────────┐
│            MCP Layer (Port 3100-3101)   │
├─────────────────────────────────────────┤
│         Docker Services (Containerized)  │
├─────────────────────────────────────────┤
│   SUPABASE (SINGLE SOURCE OF TRUTH)     │
├─────────────────────────────────────────┤
│      Service Layer (Business Logic)      │
├─────────────────────────────────────────┤
│         API Layer (Next.js Routes)       │
├─────────────────────────────────────────┤
│           UI Layer (React/Next)          │
└─────────────────────────────────────────┘
```

**CRITICAL**: All data flows through Supabase. No exceptions.

## MCP Tools Available

### Core Tools (Production Ready)
- `analyze_portfolio` - Deep portfolio analysis with AI insights
- `debug_transaction` - Transaction debugging and tracing
- `validate_fees` - Fee calculation verification
- `generate_report` - Automated report generation
- `sync_data` - Cross-system data synchronization

### Development Tools
- `feature_accelerator` - Generate features from templates
- `type_generator` - Auto-generate TypeScript types
- `test_generator` - Create test suites automatically

## Feature Numbering System

```
Domain.Layer.Section.Subsection.Component
```

- **0.x.x** - Infrastructure (Docker, MCP, Services)
- **1.x.x** - Data Layer (Database, Cache, Storage)
- **2.x.x** - Service Layer (Business Logic)
- **3.x.x** - API Layer (REST, GraphQL, WebSocket)
- **4.x.x** - UI Layer (Pages, Components)
- **5.x.x** - Feature Acceleration (AI, Automation)

## Quick Start for Developers

### 1. Generate a New Feature
```bash
# Use MCP-powered feature generator
npm run feature:generate -- \
  --name "portfolio-insights" \
  --domain 4.1.2 \
  --mcp-tools "analyze_portfolio,generate_report"
```

### 2. Check Feature Health
```bash
# Verify all features are operational
node SCRIPTS/health-check.js

# Check specific feature
npm run feature:check 4.1.1
```

### 3. Deploy with MCP
```bash
# Deploy feature with MCP integration
npm run deploy:feature -- --id 4.1.1 --env production
```

## Feature Development Workflow

### Phase 1: Planning
1. Check feature tree for conflicts
2. Assign feature ID from numbering system
3. Define MCP tools needed
4. Create feature specification

### Phase 2: Development
```typescript
// Example: MCP-aware feature implementation
import { mcpBridge } from '@/lib/services/mcp-bridge.service';

export async function portfolioInsights(investorId: string) {
  // Use MCP tool for analysis
  const analysis = await mcpBridge.execute('analyze_portfolio', {
    investorId,
    depth: 'detailed'
  });
  
  // Generate report using MCP
  const report = await mcpBridge.execute('generate_report', {
    data: analysis,
    format: 'pdf'
  });
  
  return { analysis, report };
}
```

### Phase 3: Testing
```bash
# Run MCP integration tests
npm run test:mcp-features

# Performance benchmark
npm run benchmark:feature 4.1.1
```

### Phase 4: Deployment
```yaml
# Feature flag configuration
features:
  portfolio_insights:
    enabled: true
    mcp_required: true
    rollout_percentage: 25
    segments: ['beta_users']
```

## MCP Integration Patterns

### Pattern 1: Direct Tool Usage
```typescript
// Direct MCP tool invocation
const result = await mcp.tools.analyze_portfolio({
  investorId: '123'
});
```

### Pattern 2: Service Layer Integration
```typescript
// MCP-aware service
class InvestorService extends MCPService {
  async getInsights(id: string) {
    return this.withMCP('analyze_portfolio', { id });
  }
}
```

### Pattern 3: Cached MCP Results
```typescript
// Cache MCP results for performance
const cached = await cache.getOrSet(
  `mcp:portfolio:${id}`,
  () => mcp.tools.analyze_portfolio({ id }),
  { ttl: 300 } // 5 minutes
);
```

## Feature Status Dashboard

| Feature Area | Status | MCP Enabled | Performance |
|--------------|--------|-------------|-------------|
| Investor Dashboard | ✅ Live | Yes | 187ms P95 |
| Portfolio Analysis | ✅ Live | Yes | 234ms P95 |
| Transaction History | ✅ Live | Partial | 156ms P95 |
| Document Management | ✅ Live | No | 89ms P95 |
| Formula Engine | ✅ Live | Yes | 298ms P95 |
| Admin Dashboard | ✅ Live | Yes | 201ms P95 |

## Monitoring & Observability

### Key Metrics
```typescript
// Monitor MCP tool usage
export const metrics = {
  mcp_tool_calls: counter('mcp.tool.calls'),
  mcp_tool_latency: histogram('mcp.tool.latency'),
  mcp_tool_errors: counter('mcp.tool.errors'),
  feature_adoption: gauge('feature.adoption.rate')
};
```

### Health Checks
```bash
# Check MCP server status
curl http://localhost:3100/health
curl http://localhost:3101/health

# Check feature health
curl http://localhost:3001/api/health/features
```

## Troubleshooting

### Common Issues

#### MCP Tool Not Available
```bash
# Check MCP server status
docker ps | grep mcp

# Restart MCP servers
docker-compose restart mcp-supabase mcp-equitie

# Check logs
docker logs equitie-mcp-supabase --tail 50
```

#### Feature Not Loading
```bash
# Check feature flags
npm run features:status

# Verify dependencies
npm run feature:deps 4.1.1

# Clear cache
npm run cache:clear
```

## Best Practices

### 1. Always Version Features
- Use semantic versioning for features
- Document breaking changes
- Provide migration guides

### 2. MCP Tool Selection
- Choose appropriate tools for the task
- Cache MCP results when possible
- Handle MCP failures gracefully

### 3. Performance Optimization
- Batch MCP calls when possible
- Use progressive enhancement
- Monitor tool latency

### 4. Documentation
- Document MCP tool usage
- Provide code examples
- Keep feature tree updated

## Contributing

### Adding a New Feature
1. Fork the repository
2. Create feature branch: `feature/[feature-id]-description`
3. Update feature tree
4. Implement with MCP integration
5. Add tests
6. Submit PR with feature documentation

### Updating Feature Tree
1. Edit `FEATURE_TREE_V2.md`
2. Update version in `VERSION_CONTROL.md`
3. Add to roadmap in `ROADMAP_ALIGNMENT.md`
4. Update this README

## Resources

- [MCP Documentation](https://modelcontextprotocol.io/docs)
- [Supabase Docs](https://supabase.io/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Docker Compose](https://docs.docker.com/compose/)

## Support

- **Internal**: Slack #engineering channel
- **Issues**: GitHub Issues
- **Emergency**: PagerDuty rotation

---

*Last Updated: 2025-08-27 | Version: 2.0.0-stable | MCP-Powered*