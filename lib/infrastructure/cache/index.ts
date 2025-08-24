/**
 * Cache Infrastructure Exports
 * Central export for all cache-related functionality
 */

export * from './redis-adapter';
export * from './strategies';

import { getCacheAdapter, ICacheAdapter } from './redis-adapter';
import { CacheKeyGenerator, CacheStrategies, cacheManager } from './strategies';

// Re-export commonly used items
export {
  getCacheAdapter,
  ICacheAdapter,
  CacheKeyGenerator,
  CacheStrategies,
  cacheManager
};

// Cache configuration
export interface CacheConfig {
  enabled: boolean;
  useRedis: boolean;
  redisUrl?: string;
  defaultTTL: number;
  maxMemorySize: number;
  evictionPolicy: 'lru' | 'lfu' | 'ttl';
}

// Default cache configuration
export const defaultCacheConfig: CacheConfig = {
  enabled: true,
  useRedis: process.env.USE_REDIS === 'true',
  redisUrl: process.env.REDIS_URL,
  defaultTTL: 3600, // 1 hour
  maxMemorySize: 1000, // Max items in memory cache
  evictionPolicy: 'lru'
};

// Cache initialization helper
let globalCacheInstance: ICacheAdapter | null = null;

export async function initializeGlobalCache(config?: Partial<CacheConfig>): Promise<ICacheAdapter> {
  if (globalCacheInstance) {
    return globalCacheInstance;
  }

  const finalConfig = { ...defaultCacheConfig, ...config };
  
  globalCacheInstance = await getCacheAdapter();
  
  // Warm up cache if needed
  if (process.env.CACHE_WARMUP === 'true') {
    await warmupCache();
  }
  
  return globalCacheInstance;
}

// Cache warmup function
async function warmupCache(): Promise<void> {
  const warmer = cacheManager.getWarmer();
  
  // Register warmup tasks
  warmer.register('reference-data', async () => {
    // Warm up reference data
    console.log('Warming up reference data cache...');
  }, 3600000); // Every hour
  
  warmer.register('feature-flags', async () => {
    // Warm up feature flags
    console.log('Warming up feature flags cache...');
  }, 300000); // Every 5 minutes
  
  // Run initial warmup
  await warmer.warmupAll();
}

// Cache health check
export async function checkCacheHealth(): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy';
  details: any;
}> {
  try {
    const cache = await getCacheAdapter();
    const testKey = 'health-check-' + Date.now();
    const testValue = { test: true, timestamp: Date.now() };
    
    // Test write
    await cache.set(testKey, testValue, { ttl: 60 });
    
    // Test read
    const retrieved = await cache.get(testKey);
    
    // Test delete
    await cache.delete(testKey);
    
    // Get stats
    const stats = await cache.getStats();
    
    if (retrieved && retrieved.test === true) {
      return {
        status: 'healthy',
        details: {
          operational: true,
          stats,
          timestamp: new Date().toISOString()
        }
      };
    } else {
      return {
        status: 'degraded',
        details: {
          operational: true,
          issue: 'Read/write mismatch',
          stats,
          timestamp: new Date().toISOString()
        }
      };
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      details: {
        operational: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }
    };
  }
}