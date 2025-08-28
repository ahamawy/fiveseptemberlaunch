# Feature Tree V2 - MCP-Enhanced System Architecture

## System Version: 2.0.0 (MCP-Powered)
**Last Updated**: 2025-08-27
**Status**: Production-Ready with MCP Integration

## Core Architecture Layers

### 0. Infrastructure Layer (MCP-Enabled)
```
0.1 Docker Services
  0.1.1 mcp-supabase (Port 3100)
  0.1.2 mcp-equitie (Port 3101)
  0.1.3 supabase-local (Port 54321-54327)
  0.1.4 redis-cache (Port 6379)
  0.1.5 postgres-local (Port 5432)

0.2 MCP Tools Registry
  0.2.1 analyze_portfolio
  0.2.2 debug_transaction
  0.2.3 validate_fees
  0.2.4 generate_report
  0.2.5 sync_data
  0.2.6 feature_accelerator

0.3 Service Mesh
  0.3.1 equitie-network (bridge)
  0.3.2 health-monitoring
  0.3.3 service-discovery
```

### 1. Data Layer (SUPABASE: SINGLE SOURCE OF TRUTH)
```
1.1 SUPABASE PRODUCTION TABLES (_clean suffix) - AUTHORITATIVE
  1.1.1 investors_clean (Supabase only)
  1.1.2 deals_clean (Supabase only)
  1.1.3 companies_clean (Supabase only)
  1.1.4 transactions_clean (Supabase only)
  1.1.5 documents (Supabase only)
  1.1.6 formula_templates (Supabase only)
  1.1.7 formula_calculation_log (Supabase only)
  1.1.8 portfolio.deal_company_positions (Supabase only)
  1.1.9 portfolio.company_valuations (Supabase only)
  1.1.10 portfolio.deal_tokens (Supabase only)
  1.1.11 portfolio.investor_token_positions (Supabase only)
  1.1.12 audit.investment_entries / audit.net_capital_entries / audit.nav_cascade_log (Supabase only)

1.2 Views (Backward Compatibility - Still in Supabase)
  1.2.1 investors.investor → Supabase view
  1.2.2 deals.deal → Supabase view
  1.2.3 companies.company → Supabase view
  1.2.4 transactions.transaction.* → Supabase views

1.3 Cache Layer (Supabase data only)
  1.3.1 Redis caches Supabase queries
  1.3.2 Query optimization for Supabase
  1.3.3 Invalidation on Supabase updates
```

### 2. Service Layer (Business Logic)
```
2.1 Core Services
  2.1.1 InvestorsService (MCP-aware)
  2.1.2 DealsService (MCP-aware)
  2.1.3 TransactionsService
  2.1.4 DocumentsService
  2.1.5 FormulaEngineService
  2.1.6 ValuationService (NAV cascade, positions)
  2.1.7 ExitScenarioService (multi-company)

2.2 MCP Bridge Services
  2.2.1 MCPBridgeService
  2.2.2 SupabaseAdapter
  2.2.3 FeatureAccelerator

2.3 Infrastructure Services
  2.3.1 CacheService
  2.3.2 AuditLogger
  2.3.3 PerformanceMonitor
```

### 3. API Layer (Next.js App Router)
```
3.1 Public APIs (/api)
  3.1.1 /api/investors
  3.1.2 /api/deals
  3.1.3 /api/transactions
  3.1.4 /api/companies
  3.1.5 /api/documents
  3.1.6 /api/valuations/* (server-only writes)
  3.1.7 /api/portfolio/exit-scenarios (server-only writes)

3.2 Admin APIs (/api/admin)
  3.2.1 /api/admin/metrics
  3.2.2 /api/admin/formulas
  3.2.3 /api/admin/fees
  3.2.4 /api/admin/equations
  3.2.5 /api/admin/chat (AI-powered)

3.3 MCP APIs (/api/mcp)
  3.3.1 /api/mcp/status
  3.3.2 /api/mcp/query
  3.3.3 /api/mcp/migrations
  3.3.4 /api/mcp/tables
```

### 4. Application Layer (UI)
```
4.1 Investor Portal (15.1.1)
  4.1.1 Dashboard
    4.1.1.1 Portfolio Overview
    4.1.1.2 Performance Charts
    4.1.1.3 Recent Activity
    4.1.1.4 Quick Actions
  4.1.2 Portfolio
    4.1.2.1 Deal Cards
    4.1.2.2 Asset Allocation
    4.1.2.3 Performance Metrics
  4.1.3 Deals
    4.1.3.1 Deal List
    4.1.3.2 Deal Details
    4.1.3.3 Deal Documents
  4.1.4 Transactions
    4.1.4.1 Transaction History
    4.1.4.2 Transaction Details
    4.1.4.3 Export Functions
  4.1.5 Documents
    4.1.5.1 Document Library
    4.1.5.2 Document Viewer
    4.1.5.3 Download Manager

4.2 Admin Portal
  4.2.1 Dashboard
  4.2.2 Formula Manager
  4.2.3 Fee Engine
  4.2.4 Monitoring
  4.2.5 API Documentation

4.3 Landing Pages
  4.3.1 Homepage
  4.3.2 Style Guide
  4.3.3 Login
```

### 5. Feature Acceleration Layer (NEW)
```
5.1 MCP-Powered Features
  5.1.1 Zero-Shot Development
    5.1.1.1 Feature templates
    5.1.1.2 Auto-generation
    5.1.1.3 Type safety
  5.1.2 AI-Assisted Features
    5.1.2.1 Code generation
    5.1.2.2 Query optimization
    5.1.2.3 Bug detection

5.2 Feature Registry
  5.2.1 Feature flags
  5.2.2 A/B testing
  5.2.3 Progressive rollout

5.3 Developer Experience
  5.3.1 Hot reload
  5.3.2 Type generation
  5.3.3 Auto-documentation
```

## Feature Numbering System

```
Domain.Layer.Section.Subsection.Component
  0 = Infrastructure (MCP, Docker, Services)
  1 = Data (Database, Cache, Storage)
  2 = Service (Business Logic, Integrations)
  3 = API (REST, GraphQL, WebSocket)
  4 = UI (Pages, Components, Interactions)
  5 = Features (New capabilities, AI-powered)
```

## Roadmap Integration Points

### Phase 1: Foundation (COMPLETED ✅)
- [x] Docker infrastructure setup
- [x] MCP server deployment
- [x] Supabase integration
- [x] Service layer implementation
- [x] Cache strategy

### Phase 2: Enhancement (IN PROGRESS 🚧)
- [ ] Formula engine optimization
- [ ] Performance monitoring
- [ ] Advanced caching
- [ ] Real-time updates
- [ ] WebSocket integration

### Phase 3: Intelligence (PLANNED 📋)
- [ ] AI-powered insights
- [ ] Predictive analytics
- [ ] Smart recommendations
- [ ] Automated testing
- [ ] Self-healing systems

### Phase 4: Scale (FUTURE 🔮)
- [ ] Multi-tenant support
- [ ] Global CDN
- [ ] Edge computing
- [ ] Distributed caching
- [ ] Microservices migration

## MCP Tool Mapping

| Feature Area | MCP Tool | Purpose |
|-------------|----------|---------|
| Portfolio Analysis | `analyze_portfolio` | Deep portfolio insights |
| Transaction Debug | `debug_transaction` | Transaction troubleshooting |
| Fee Validation | `validate_fees` | Fee calculation verification |
| Report Generation | `generate_report` | Automated reporting |
| Data Sync | `sync_data` | Cross-system synchronization |
| Feature Creation | `feature_accelerator` | Rapid feature development |

## Version Control

| Version | Date | Changes |
|---------|------|---------|
| 2.0.0 | 2025-08-27 | MCP integration, Docker services |
| 1.5.0 | 2025-08-26 | Formula engine, clean schema |
| 1.0.0 | 2025-08-01 | Initial feature tree |

## Quick Commands

```bash
# Start all services
docker-compose up -d

# Check MCP status
curl http://localhost:3100/status
curl http://localhost:3101/status

# Generate new feature
npm run feature:generate -- --name "new-feature"

# Run health checks
node SCRIPTS/health-check.js

# View feature map
cat DOCS/feature-map.json | jq '.'
```

## Dependencies

- **Runtime**: Node.js 20+, Docker 24+
- **Database**: PostgreSQL 15+, Supabase
- **Cache**: Redis 7+
- **MCP**: @modelcontextprotocol/sdk
- **Framework**: Next.js 14+, React 18+

## Security Considerations

- All MCP tools require authentication
- Service-to-service communication encrypted
- Database connections use SSL
- API rate limiting enabled
- CORS policies enforced

## Monitoring & Observability

```yaml
metrics:
  - service_health: /api/admin/metrics
  - cache_stats: /api/cache/stats
  - mcp_status: /api/mcp/status
  - db_performance: Supabase dashboard
  - error_tracking: Console + Logs

alerts:
  - service_down: Immediate
  - high_latency: > 2s
  - cache_miss_rate: > 30%
  - error_rate: > 1%
  - mcp_failure: Critical
```

## Feature Flag Configuration

```typescript
// Feature flags for progressive rollout
export const FEATURES = {
  MCP_ENABLED: true,
  FORMULA_ENGINE_V2: true,
  REAL_TIME_SYNC: false,
  AI_INSIGHTS: false,
  ADVANCED_CACHING: true,
  WEBSOCKET_UPDATES: false,
};
```

## Next Steps

1. **Immediate** (This Week)
   - Complete formula engine optimization
   - Add real-time transaction updates
   - Implement WebSocket for live data

2. **Short Term** (This Month)
   - Deploy AI-powered insights
   - Add predictive analytics
   - Enhance monitoring dashboard

3. **Long Term** (This Quarter)
   - Multi-tenant architecture
   - Global deployment strategy
   - Microservices migration plan

---

*This feature tree is the single source of truth for system architecture. All features must align with this structure.*