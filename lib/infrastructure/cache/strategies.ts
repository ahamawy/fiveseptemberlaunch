/**
 * Cache Strategies
 * Defines caching strategies for different data types and access patterns
 */

import { CacheOptions } from './redis-adapter';

export interface CacheStrategy {
  name: string;
  ttl: number; // Time to live in seconds
  tags?: string[];
  pattern: 'write-through' | 'write-behind' | 'read-through' | 'refresh-ahead' | 'cache-aside';
  compress?: boolean;
  invalidateOn?: string[]; // Event types that trigger invalidation
}

// Predefined cache strategies for different data types
export const CacheStrategies = {
  // Static/Reference Data - Long TTL
  REFERENCE_DATA: {
    name: 'reference-data',
    ttl: 86400, // 24 hours
    pattern: 'read-through',
    tags: ['reference'],
    compress: true
  } as CacheStrategy,

  // User Session Data - Medium TTL
  SESSION_DATA: {
    name: 'session-data',
    ttl: 7200, // 2 hours
    pattern: 'cache-aside',
    tags: ['session'],
    compress: false
  } as CacheStrategy,

  // Frequently Accessed Data - Short TTL
  HOT_DATA: {
    name: 'hot-data',
    ttl: 300, // 5 minutes
    pattern: 'refresh-ahead',
    tags: ['hot'],
    compress: false
  } as CacheStrategy,

  // Computed/Aggregated Data - Medium TTL
  COMPUTED_DATA: {
    name: 'computed-data',
    ttl: 1800, // 30 minutes
    pattern: 'write-through',
    tags: ['computed'],
    compress: true,
    invalidateOn: ['entity.updated', 'entity.deleted']
  } as CacheStrategy,

  // Real-time Data - Very Short TTL
  REAL_TIME: {
    name: 'real-time',
    ttl: 60, // 1 minute
    pattern: 'cache-aside',
    tags: ['realtime'],
    compress: false
  } as CacheStrategy,

  // API Response Cache - Short to Medium TTL
  API_RESPONSE: {
    name: 'api-response',
    ttl: 600, // 10 minutes
    pattern: 'cache-aside',
    tags: ['api'],
    compress: true
  } as CacheStrategy,

  // Search Results - Short TTL
  SEARCH_RESULTS: {
    name: 'search-results',
    ttl: 180, // 3 minutes
    pattern: 'cache-aside',
    tags: ['search'],
    compress: true
  } as CacheStrategy,

  // User Preferences - Long TTL
  USER_PREFERENCES: {
    name: 'user-preferences',
    ttl: 43200, // 12 hours
    pattern: 'write-through',
    tags: ['user', 'preferences'],
    compress: false
  } as CacheStrategy,

  // Feature Flags - Medium TTL
  FEATURE_FLAGS: {
    name: 'feature-flags',
    ttl: 300, // 5 minutes
    pattern: 'read-through',
    tags: ['features'],
    compress: false
  } as CacheStrategy,

  // Database Query Results - Variable TTL
  QUERY_RESULTS: {
    name: 'query-results',
    ttl: 900, // 15 minutes
    pattern: 'cache-aside',
    tags: ['database', 'query'],
    compress: true
  } as CacheStrategy
};

// Cache Key Generator
export class CacheKeyGenerator {
  private static readonly SEPARATOR = ':';

  /**
   * Generate a cache key for entities
   */
  static entity(type: string, id: string, tenantId?: string): string {
    const parts = ['entity', type, id];
    if (tenantId) {
      parts.unshift('tenant', tenantId);
    }
    return parts.join(this.SEPARATOR);
  }

  /**
   * Generate a cache key for collections
   */
  static collection(type: string, params?: Record<string, any>, tenantId?: string): string {
    const parts = ['collection', type];
    if (tenantId) {
      parts.unshift('tenant', tenantId);
    }
    if (params) {
      const paramStr = this.encodeParams(params);
      parts.push(paramStr);
    }
    return parts.join(this.SEPARATOR);
  }

  /**
   * Generate a cache key for queries
   */
  static query(query: string, params?: any[], tenantId?: string): string {
    const parts = ['query', this.hashString(query)];
    if (tenantId) {
      parts.unshift('tenant', tenantId);
    }
    if (params && params.length > 0) {
      parts.push(this.hashString(JSON.stringify(params)));
    }
    return parts.join(this.SEPARATOR);
  }

  /**
   * Generate a cache key for API responses
   */
  static api(endpoint: string, method: string, params?: Record<string, any>): string {
    const parts = ['api', method.toLowerCase(), endpoint.replace(/\//g, '_')];
    if (params) {
      parts.push(this.encodeParams(params));
    }
    return parts.join(this.SEPARATOR);
  }

  /**
   * Generate a cache key for user-specific data
   */
  static user(userId: string, dataType: string, params?: Record<string, any>): string {
    const parts = ['user', userId, dataType];
    if (params) {
      parts.push(this.encodeParams(params));
    }
    return parts.join(this.SEPARATOR);
  }

  /**
   * Generate a cache key for computed data
   */
  static computed(operation: string, inputs: any[], tenantId?: string): string {
    const parts = ['computed', operation, this.hashString(JSON.stringify(inputs))];
    if (tenantId) {
      parts.unshift('tenant', tenantId);
    }
    return parts.join(this.SEPARATOR);
  }

  /**
   * Encode parameters into a stable string
   */
  private static encodeParams(params: Record<string, any>): string {
    const sorted = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    return this.hashString(sorted);
  }

  /**
   * Hash a string to create a shorter key
   */
  private static hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }
}

// Cache Warmer for proactive caching
export class CacheWarmer {
  private warmupTasks: Map<string, () => Promise<void>> = new Map();
  private intervals: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Register a warmup task
   */
  register(key: string, task: () => Promise<void>, intervalMs?: number): void {
    this.warmupTasks.set(key, task);
    
    if (intervalMs) {
      // Clear existing interval if any
      const existing = this.intervals.get(key);
      if (existing) {
        clearInterval(existing);
      }
      
      // Set new interval
      const interval = setInterval(async () => {
        try {
          await task();
        } catch (error) {
          console.error(`Cache warmup failed for ${key}:`, error);
        }
      }, intervalMs);
      
      this.intervals.set(key, interval);
    }
  }

  /**
   * Run all warmup tasks
   */
  async warmupAll(): Promise<void> {
    const tasks = Array.from(this.warmupTasks.values());
    await Promise.allSettled(tasks.map(task => task()));
  }

  /**
   * Run specific warmup task
   */
  async warmup(key: string): Promise<void> {
    const task = this.warmupTasks.get(key);
    if (task) {
      await task();
    }
  }

  /**
   * Stop all warmup intervals
   */
  stopAll(): void {
    for (const interval of this.intervals.values()) {
      clearInterval(interval);
    }
    this.intervals.clear();
  }
}

// Cache Invalidator for managing cache invalidation
export class CacheInvalidator {
  private invalidationRules: Map<string, string[]> = new Map();

  /**
   * Register invalidation rule
   */
  register(eventType: string, cachePatterns: string[]): void {
    this.invalidationRules.set(eventType, cachePatterns);
  }

  /**
   * Get cache patterns to invalidate for an event
   */
  getPatternsForEvent(eventType: string): string[] {
    return this.invalidationRules.get(eventType) || [];
  }

  /**
   * Register common invalidation rules
   */
  registerCommonRules(): void {
    // Entity changes
    this.register('entity.created', ['collection:*']);
    this.register('entity.updated', ['entity:*', 'collection:*', 'computed:*']);
    this.register('entity.deleted', ['entity:*', 'collection:*', 'computed:*']);
    
    // User changes
    this.register('user.updated', ['user:*']);
    this.register('user.preferences.updated', ['user:*:preferences']);
    
    // System changes
    this.register('system.config.updated', ['*']);
    this.register('feature.flag.updated', ['features:*']);
    
    // Data changes
    this.register('data.import.completed', ['*']);
    this.register('data.sync.completed', ['query:*', 'collection:*']);
  }
}

// Cache Manager for coordinating cache operations
export class CacheManager {
  private strategies: Map<string, CacheStrategy> = new Map();
  private warmer: CacheWarmer;
  private invalidator: CacheInvalidator;

  constructor() {
    this.warmer = new CacheWarmer();
    this.invalidator = new CacheInvalidator();
    
    // Register default strategies
    Object.values(CacheStrategies).forEach(strategy => {
      this.strategies.set(strategy.name, strategy);
    });
    
    // Register common invalidation rules
    this.invalidator.registerCommonRules();
  }

  /**
   * Get cache options for a strategy
   */
  getOptionsForStrategy(strategyName: string): CacheOptions {
    const strategy = this.strategies.get(strategyName) || CacheStrategies.HOT_DATA;
    return {
      ttl: strategy.ttl,
      tags: strategy.tags,
      compress: strategy.compress
    };
  }

  /**
   * Register custom strategy
   */
  registerStrategy(strategy: CacheStrategy): void {
    this.strategies.set(strategy.name, strategy);
    
    // Register invalidation rules if specified
    if (strategy.invalidateOn) {
      strategy.invalidateOn.forEach(eventType => {
        this.invalidator.register(eventType, [strategy.name + ':*']);
      });
    }
  }

  /**
   * Get cache warmer
   */
  getWarmer(): CacheWarmer {
    return this.warmer;
  }

  /**
   * Get cache invalidator
   */
  getInvalidator(): CacheInvalidator {
    return this.invalidator;
  }
}

// Export singleton
export const cacheManager = new CacheManager();