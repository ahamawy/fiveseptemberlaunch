# Redis Caching Infrastructure

## Overview

Enterprise-grade caching infrastructure that supports both Redis (distributed) and in-memory caching with automatic fallback capabilities.

## Features

- **Dual Mode**: Redis for production, in-memory for development
- **Automatic Fallback**: Falls back to in-memory if Redis is unavailable
- **Cache Strategies**: Pre-configured strategies for different data types
- **Tag-based Invalidation**: Clear cache by tags or patterns
- **Performance Monitoring**: Built-in metrics and health checks
- **Cache Warming**: Proactive cache population
- **Circuit Breaker**: Protects against cache failures

## Quick Start

### Local Development (In-Memory Cache)

```bash
# Uses in-memory cache by default
npm run dev
```

### With Redis

```bash
# Start Redis
npm run redis:up

# Set environment variable
USE_REDIS=true

# Start application
npm run dev

# View Redis data
npm run redis:commander
# Open http://localhost:8081
```

## Configuration

### Environment Variables

```env
# Enable Redis caching
USE_REDIS=true

# Redis connection URL
REDIS_URL=redis://localhost:6379

# Cache warmup on startup
CACHE_WARMUP=false

# Default TTL in seconds
CACHE_DEFAULT_TTL=3600
```

## Usage

### In Services

```typescript
import { BaseService } from '@/lib/services/base.service';

class MyService extends BaseService {
  async getData(id: string) {
    // Check cache first
    const cached = await this.getCached<Data>(`data:${id}`);
    if (cached) return cached;
    
    // Fetch from database
    const data = await this.fetchFromDB(id);
    
    // Store in cache with tags
    await this.setCache(`data:${id}`, data, ['data', 'entity']);
    
    return data;
  }
  
  async invalidateData() {
    // Clear by pattern
    await this.clearCacheByPattern('data:*');
    
    // Or clear by tags
    await this.clearCacheByTags(['data']);
  }
}
```

### Direct Cache Access

```typescript
import { getCacheAdapter } from '@/lib/infrastructure/cache';

const cache = await getCacheAdapter();

// Set with TTL and tags
await cache.set('key', value, {
  ttl: 300, // 5 minutes
  tags: ['api', 'user']
});

// Get
const value = await cache.get('key');

// Delete by tags
await cache.deleteByTags(['user']);

// Get statistics
const stats = await cache.getStats();
```

## Cache Strategies

Pre-configured strategies for common use cases:

| Strategy | TTL | Use Case |
|----------|-----|----------|
| `REFERENCE_DATA` | 24 hours | Static/reference data |
| `SESSION_DATA` | 2 hours | User sessions |
| `HOT_DATA` | 5 minutes | Frequently accessed data |
| `COMPUTED_DATA` | 30 minutes | Calculated/aggregated data |
| `REAL_TIME` | 1 minute | Near real-time data |
| `API_RESPONSE` | 10 minutes | API response caching |
| `SEARCH_RESULTS` | 3 minutes | Search query results |
| `USER_PREFERENCES` | 12 hours | User settings |
| `FEATURE_FLAGS` | 5 minutes | Feature toggles |
| `QUERY_RESULTS` | 15 minutes | Database queries |

### Using Strategies

```typescript
import { CacheStrategies, cacheManager } from '@/lib/infrastructure/cache/strategies';

// Get options for a strategy
const options = cacheManager.getOptionsForStrategy('hot-data');

// Register custom strategy
cacheManager.registerStrategy({
  name: 'custom-data',
  ttl: 600,
  pattern: 'cache-aside',
  tags: ['custom'],
  compress: true
});
```

## Cache Key Generation

Consistent key generation helpers:

```typescript
import { CacheKeyGenerator } from '@/lib/infrastructure/cache/strategies';

// Entity keys
const key1 = CacheKeyGenerator.entity('user', '123', 'tenant-1');
// Returns: "tenant:tenant-1:entity:user:123"

// Collection keys
const key2 = CacheKeyGenerator.collection('users', { active: true });
// Returns: "collection:users:hash"

// Query keys
const key3 = CacheKeyGenerator.query('SELECT * FROM users', [true]);
// Returns: "query:hash1:hash2"

// API response keys
const key4 = CacheKeyGenerator.api('/api/users', 'GET', { page: 1 });
// Returns: "api:get:api_users:hash"

// User-specific keys
const key5 = CacheKeyGenerator.user('user-123', 'preferences');
// Returns: "user:user-123:preferences"
```

## Monitoring

### API Endpoints

```bash
# Get cache statistics
GET /api/cache/stats

# Invalidate cache
POST /api/cache/invalidate
{
  "pattern": "user:*",  // Clear by pattern
  "tags": ["user"],     // Clear by tags
  "all": true          // Clear all
}

# Delete specific key
DELETE /api/cache/invalidate?key=cache:key
```

### Dashboard Integration

The monitoring dashboard at `/admin/monitoring` displays:
- Cache hit rate
- Cache size
- Response times
- Health status
- Performance metrics

## Performance

### Benchmarks

With Redis (local):
- Write: ~0.5ms per operation
- Read: ~0.3ms per operation
- ~6,000 operations/second

With In-Memory:
- Write: ~0.01ms per operation
- Read: ~0.005ms per operation
- ~100,000 operations/second

## Best Practices

1. **Use Tags**: Tag related cache entries for bulk invalidation
2. **Set Appropriate TTLs**: Balance freshness vs performance
3. **Monitor Hit Rate**: Aim for >80% hit rate
4. **Implement Fallbacks**: Always handle cache misses gracefully
5. **Avoid Cache Stampede**: Use cache warming for popular keys
6. **Size Management**: Monitor cache size and implement eviction policies

## Troubleshooting

### Redis Connection Issues

```bash
# Check Redis is running
docker ps | grep redis

# Test connection
npm run redis:cli
> ping

# View logs
npm run redis:logs
```

### Cache Not Working

1. Check environment variables are set
2. Verify Redis is running (if USE_REDIS=true)
3. Check network connectivity
4. Review application logs for errors

### Performance Issues

1. Check cache hit rate (should be >80%)
2. Review TTL settings (too short = many misses)
3. Monitor Redis memory usage
4. Consider implementing cache warming

## Docker Commands

```bash
# Start Redis
npm run redis:up

# Stop Redis
npm run redis:down

# View logs
npm run redis:logs

# Access Redis CLI
npm run redis:cli

# Start Redis Commander (GUI)
npm run redis:commander
```

## Architecture

```
┌─────────────────┐
│   Application   │
└────────┬────────┘
         │
    ┌────▼────┐
    │BaseService│
    └────┬────┘
         │
  ┌──────▼──────┐
  │CacheAdapter │
  └──────┬──────┘
         │
    ┌────▼────┐
    │  Redis? │
    └─┬─────┬─┘
      │     │
   Yes│     │No
      │     │
┌─────▼──┐ ┌▼────────┐
│  Redis │ │In-Memory│
└────────┘ └─────────┘
```

## Future Enhancements

- [ ] Redis Cluster support
- [ ] Redis Sentinel for HA
- [ ] Cache preloading on startup
- [ ] Advanced eviction policies
- [ ] Compression for large values
- [ ] Encrypted cache values
- [ ] Multi-tier caching (L1/L2)
- [ ] GraphQL query caching
- [ ] Edge caching with CDN