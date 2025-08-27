/**
 * Base Service Class
 * Provides common functionality for all service classes
 * 
 * CRITICAL: All data operations MUST go through Supabase
 * Supabase is the SINGLE SOURCE OF TRUTH
 */

import { getDataClient, simulateDelay } from '../db/client';
import type { IDataClient } from '../db/client';
import { getCacheAdapter, ICacheAdapter, InMemoryCacheAdapter } from '../infrastructure/cache/redis-adapter';
import { CacheKeyGenerator, CacheStrategies, cacheManager } from '../infrastructure/cache/strategies';

export interface ServiceOptions {
  enableCache?: boolean;
  cacheTime?: number;
  enableLogging?: boolean;
  cacheStrategy?: string;
  useRedis?: boolean;
}

export abstract class BaseService {
  protected dataClient: IDataClient;
  protected cache: ICacheAdapter | null = null;
  protected fallbackCache: Map<string, { data: any; timestamp: number }> = new Map();
  protected options: ServiceOptions;
  private cacheInitPromise: Promise<void> | null = null;

  constructor(options: ServiceOptions = {}) {
    this.dataClient = getDataClient();
    this.options = {
      enableCache: true,
      cacheTime: 5 * 60 * 1000, // 5 minutes default
      enableLogging: process.env.NODE_ENV === 'development',
      useRedis: process.env.USE_REDIS === 'true',
      cacheStrategy: 'hot-data',
      ...options
    };

    // Initialize cache adapter asynchronously
    if (this.options.enableCache) {
      this.initializeCache();
    }
  }

  /**
   * Initialize cache adapter
   */
  private async initializeCache(): Promise<void> {
    if (this.cacheInitPromise) {
      return this.cacheInitPromise;
    }

    this.cacheInitPromise = (async () => {
      try {
        if (this.options.useRedis) {
          this.cache = await getCacheAdapter();
        } else {
          this.cache = new InMemoryCacheAdapter();
          await this.cache.connect();
        }
      } catch (error) {
        console.error('Failed to initialize cache adapter:', error);
        // Fall back to in-memory cache
        this.cache = new InMemoryCacheAdapter();
        await this.cache.connect();
      }
    })();

    return this.cacheInitPromise;
  }

  /**
   * Ensure cache is initialized
   */
  protected async ensureCache(): Promise<ICacheAdapter | null> {
    if (!this.options.enableCache) return null;
    
    if (!this.cache && this.cacheInitPromise) {
      await this.cacheInitPromise;
    }
    
    return this.cache;
  }

  /**
   * Get cached data if available and not expired
   */
  protected async getCached<T>(key: string): Promise<T | null> {
    if (!this.options.enableCache) return null;

    const cache = await this.ensureCache();
    
    if (cache) {
      try {
        const result = await cache.get<T>(key);
        if (result !== null && this.options.enableLogging) {
          console.log(`📦 Cache hit: ${key}`);
        }
        return result;
      } catch (error) {
        console.error('Cache get error:', error);
        // Fall back to local cache
        return this.getFallbackCached<T>(key);
      }
    }

    return this.getFallbackCached<T>(key);
  }

  /**
   * Get from fallback cache
   */
  private getFallbackCached<T>(key: string): T | null {
    const cached = this.fallbackCache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > (this.options.cacheTime || 0)) {
      this.fallbackCache.delete(key);
      return null;
    }

    if (this.options.enableLogging) {
      console.log(`📦 Fallback cache hit: ${key}`);
    }

    return cached.data as T;
  }

  /**
   * Set cache data
   */
  protected async setCache(key: string, data: any, tags?: string[]): Promise<void> {
    if (!this.options.enableCache) return;

    const cache = await this.ensureCache();
    
    if (cache) {
      try {
        const strategy = cacheManager.getOptionsForStrategy(
          this.options.cacheStrategy || 'hot-data'
        );
        
        await cache.set(key, data, {
          ...strategy,
          ttl: Math.floor((this.options.cacheTime || 300000) / 1000),
          tags: tags || strategy.tags
        });

        if (this.options.enableLogging) {
          console.log(`💾 Cache set: ${key}`);
        }
      } catch (error) {
        console.error('Cache set error:', error);
        // Fall back to local cache
        this.setFallbackCache(key, data);
      }
    } else {
      this.setFallbackCache(key, data);
    }
  }

  /**
   * Set fallback cache
   */
  private setFallbackCache(key: string, data: any): void {
    this.fallbackCache.set(key, {
      data,
      timestamp: Date.now()
    });

    if (this.options.enableLogging) {
      console.log(`💾 Fallback cache set: ${key}`);
    }
  }

  /**
   * Clear cache
   */
  async clearCache(): Promise<void> {
    const cache = await this.ensureCache();
    
    if (cache) {
      try {
        await cache.clear();
      } catch (error) {
        console.error('Cache clear error:', error);
      }
    }
    
    this.fallbackCache.clear();
    
    if (this.options.enableLogging) {
      console.log('🗑️ Cache cleared');
    }
  }

  /**
   * Delete cache by pattern
   */
  protected async clearCacheByPattern(pattern: string): Promise<void> {
    const cache = await this.ensureCache();
    
    if (cache) {
      try {
        await cache.deleteByPattern(pattern);
      } catch (error) {
        console.error('Cache delete by pattern error:', error);
      }
    }
  }

  /**
   * Delete cache by tags
   */
  protected async clearCacheByTags(tags: string[]): Promise<void> {
    const cache = await this.ensureCache();
    
    if (cache) {
      try {
        await cache.deleteByTags(tags);
      } catch (error) {
        console.error('Cache delete by tags error:', error);
      }
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<any> {
    const cache = await this.ensureCache();
    
    if (cache) {
      try {
        return await cache.getStats();
      } catch (error) {
        console.error('Failed to get cache stats:', error);
      }
    }
    
    return {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      size: this.fallbackCache.size,
      hitRate: 0
    };
  }

  /**
   * Log service action
   */
  protected log(action: string, details?: any): void {
    if (this.options.enableLogging) {
      console.log(`[${this.constructor.name}] ${action}`, details || '');
    }
  }

  /**
   * Handle service errors
   */
  protected handleError(error: any, context: string): never {
    console.error(`[${this.constructor.name}] Error in ${context}:`, error);
    
    // You can add error tracking here (e.g., Sentry)
    if (process.env.NEXT_PUBLIC_ENABLE_ERROR_TRACKING === 'true') {
      // Track error to external service
    }

    throw error;
  }

  /**
   * Validate required fields
   */
  protected validateRequired(data: any, fields: string[], context: string): void {
    const missing = fields.filter(field => !data[field]);
    if (missing.length > 0) {
      throw new Error(`${context}: Missing required fields: ${missing.join(', ')}`);
    }
  }

  /**
   * Apply pagination to array
   */
  protected paginate<T>(items: T[], page: number = 1, limit: number = 10): {
    data: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  } {
    const total = items.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const end = start + limit;

    return {
      data: items.slice(start, end),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }

  /**
   * Sort array by field
   */
  protected sortBy<T>(items: T[], field: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
    return [...items].sort((a, b) => {
      const aVal = a[field];
      const bVal = b[field];

      if (aVal === bVal) return 0;
      
      if (order === 'asc') {
        return aVal < bVal ? -1 : 1;
      } else {
        return aVal > bVal ? -1 : 1;
      }
    });
  }

  /**
   * Filter by search term
   */
  protected searchFilter<T>(items: T[], searchTerm: string, fields: (keyof T)[]): T[] {
    if (!searchTerm) return items;

    const term = searchTerm.toLowerCase();
    return items.filter(item => {
      return fields.some(field => {
        const value = item[field];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(term);
        }
        return false;
      });
    });
  }

  /**
   * Simulate API delay (for development)
   */
  protected async delay(ms?: number): Promise<void> {
    await simulateDelay(ms);
  }

  /**
   * Format response with metadata
   */
  protected formatResponse<T>(data: T, metadata?: any): {
    success: boolean;
    data: T;
    metadata?: any;
    timestamp: string;
  } {
    return {
      success: true,
      data,
      metadata,
      timestamp: new Date().toISOString()
    };
  }
}