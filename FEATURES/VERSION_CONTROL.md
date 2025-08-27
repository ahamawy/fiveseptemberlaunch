# Feature Tree Version Control System

## Version Schema: MAJOR.MINOR.PATCH-TAG

### Version Components
- **MAJOR**: Breaking changes, architecture shifts
- **MINOR**: New features, backward compatible
- **PATCH**: Bug fixes, optimizations
- **TAG**: alpha, beta, rc, stable, lts

## Current Version: 2.0.0-stable

## Version History

### v2.0.0-stable (2025-08-27)
**Codename**: "MCP Genesis"
```yaml
breaking_changes:
  - Migrated to MCP-powered architecture
  - Docker containerization of all services
  - New feature numbering system (0-5 domains)

additions:
  - MCP tool integration (6 core tools)
  - Docker compose infrastructure
  - Feature acceleration layer
  - AI-assisted development capabilities
  - Real-time monitoring dashboard

improvements:
  - Service layer MCP awareness
  - Cache strategy optimization
  - Query performance enhancements
  - Type safety throughout

deprecations:
  - Legacy dot-notation (kept as views)
  - Direct database access patterns
  - Manual feature generation
```

### v1.5.0 (2025-08-26)
**Codename**: "Formula Engine"
```yaml
additions:
  - Formula engine integration
  - Clean schema tables (*_clean)
  - Formula templates (10 types)
  - Calculation audit logs

improvements:
  - Database schema normalization
  - Transaction type consolidation
  - Performance optimizations
```

### v1.0.0 (2025-08-01)
**Codename**: "Foundation"
```yaml
initial_release:
  - Basic feature tree structure
  - Service layer implementation
  - API endpoints
  - Investor portal UI
  - Admin dashboard
```

## Version Migration Paths

### From 1.x to 2.0
```bash
# 1. Backup current state
npm run backup:create

# 2. Run migration scripts
npm run migrate:v2

# 3. Update Docker services
docker-compose down
docker-compose up -d

# 4. Verify migration
npm run verify:v2

# 5. Update feature flags
npm run features:enable-v2
```

## Feature Compatibility Matrix

| Feature | v1.0 | v1.5 | v2.0 | Notes |
|---------|------|------|------|-------|
| Basic APIs | ✅ | ✅ | ✅ | Fully backward compatible |
| Formula Engine | ❌ | ✅ | ✅ | Added in v1.5 |
| MCP Tools | ❌ | ❌ | ✅ | v2.0 exclusive |
| Docker Deploy | ⚠️ | ⚠️ | ✅ | Optional < v2.0, required v2.0+ |
| AI Features | ❌ | ❌ | ✅ | MCP-dependent |
| Clean Schema | ❌ | ✅ | ✅ | Views maintain compatibility |

## Version Tagging Strategy

### Development Tags
```bash
# Alpha: Early development, unstable
git tag v2.1.0-alpha.1

# Beta: Feature complete, testing
git tag v2.1.0-beta.1

# Release Candidate: Production ready
git tag v2.1.0-rc.1

# Stable: Production release
git tag v2.1.0-stable

# LTS: Long-term support (every 3rd major)
git tag v3.0.0-lts
```

## Feature Flag Configuration

```typescript
// version-config.ts
export const VERSION_CONFIG = {
  current: '2.0.0',
  features: {
    v1: {
      enabled: true,  // Backward compatibility
      deprecation: '2026-01-01',
      endpoints: ['api/v1/*']
    },
    v2: {
      enabled: true,
      stable: true,
      endpoints: ['api/v2/*', 'api/*']
    },
    v3: {
      enabled: false,
      experimental: true,
      endpoints: ['api/v3/*']
    }
  }
};
```

## Automated Version Management

### Version Bump Script
```javascript
// scripts/version-bump.js
const bump = (type) => {
  const current = require('./package.json').version;
  const [major, minor, patch] = current.split('.').map(Number);
  
  switch(type) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
  }
};
```

### CI/CD Version Gates
```yaml
# .github/workflows/version-check.yml
version_check:
  - validate_semver
  - check_breaking_changes
  - update_changelog
  - tag_release
  - notify_teams
```

## Version Deprecation Policy

### Deprecation Timeline
- **Notice**: 6 months before removal
- **Warning**: 3 months before removal
- **Sunset**: Feature removed

### Deprecation Notices
```typescript
// Deprecation middleware
export function deprecated(version: string, sunset: Date) {
  return (req, res, next) => {
    res.setHeader('X-Deprecated', `true`);
    res.setHeader('X-Sunset-Date', sunset.toISOString());
    res.setHeader('X-Alternative', `v${version}`);
    
    console.warn(`Deprecated API called: ${req.path}`);
    next();
  };
}
```

## Version-Specific Documentation

```markdown
/FEATURES/
  /v1/
    - FEATURE_TREE_V1.md
    - MIGRATION_GUIDE_V1.md
  /v2/
    - FEATURE_TREE_V2.md
    - MIGRATION_GUIDE_V2.md
    - MCP_INTEGRATION.md
  /v3/
    - FEATURE_TREE_V3.md (planned)
    - MICROSERVICES.md (planned)
```

## Version Health Checks

```bash
# Check current version health
npm run version:health

# Output format
{
  "version": "2.0.0",
  "status": "stable",
  "health": {
    "services": "healthy",
    "database": "healthy",
    "mcp": "healthy",
    "cache": "healthy"
  },
  "compatibility": {
    "v1_apis": "supported",
    "v2_apis": "native"
  },
  "metrics": {
    "uptime": "99.9%",
    "response_time_p95": "187ms",
    "error_rate": "0.1%"
  }
}
```

## Rollback Procedures

### Emergency Rollback
```bash
# 1. Stop current version
docker-compose down

# 2. Restore previous version
git checkout v1.5.0-stable
npm install
npm run build

# 3. Restore database
npm run db:restore --version=1.5.0

# 4. Restart services
npm run start:safe-mode

# 5. Notify teams
npm run notify:rollback
```

## Version Branching Strategy

```
main (v2.0.0-stable)
├── develop (v2.1.0-alpha)
│   ├── feature/mcp-enhancement
│   ├── feature/ai-insights
│   └── feature/websocket
├── release/v2.0.x (patches)
└── hotfix/critical-bug
```

## Version Release Checklist

- [ ] All tests passing
- [ ] Documentation updated
- [ ] Migration guide written
- [ ] Breaking changes documented
- [ ] Performance benchmarks recorded
- [ ] Security audit completed
- [ ] Rollback procedure tested
- [ ] Stakeholders notified
- [ ] Feature flags configured
- [ ] Monitoring alerts updated

## Version Metrics Tracking

```typescript
// Track version adoption
export const versionMetrics = {
  track: (version: string, event: string) => {
    analytics.track({
      version,
      event,
      timestamp: Date.now(),
      environment: process.env.NODE_ENV,
      features: getEnabledFeatures()
    });
  }
};
```

## Future Version Roadmap

### v2.1.0 (Q1 2025 - End)
- WebSocket real-time updates
- Enhanced AI insights
- Advanced caching strategies

### v2.2.0 (Q2 2025)
- Multi-tenant support
- Global distribution
- Edge computing

### v3.0.0-lts (Q3 2025)
- Microservices architecture
- Kubernetes orchestration
- Complete AI automation

---

*Version control is critical for system evolution. Always follow semantic versioning.*