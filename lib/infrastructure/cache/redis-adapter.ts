/**
 * Redis Cache Adapter
 * Provides distributed caching for institutional-grade scalability
 */

import { createClient, RedisClientType } from 'redis';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  tags?: string[]; // Cache tags for invalidation
  compress?: boolean; // Compress large values
}

export interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  size: number;
  hitRate: number;
}

export interface ICacheAdapter {
  get<T = any>(key: string): Promise<T | null>;
  set<T = any>(key: string, value: T, options?: CacheOptions): Promise<void>;
  delete(key: string): Promise<void>;
  deleteByPattern(pattern: string): Promise<void>;
  deleteByTags(tags: string[]): Promise<void>;
  has(key: string): Promise<boolean>;
  clear(): Promise<void>;
  getStats(): Promise<CacheStats>;
  size(): Promise<number>;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
}

// Redis Cache Adapter Implementation
export class RedisCacheAdapter implements ICacheAdapter {
  private client: RedisClientType | null = null;
  private isConnected: boolean = false;
  private stats: CacheStats;
  private readonly defaultTTL: number = 3600; // 1 hour
  private readonly maxRetries: number = 3;
  private readonly retryDelay: number = 1000;

  constructor(
    private readonly redisUrl?: string,
    private readonly keyPrefix: string = 'cache:'
  ) {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      size: 0,
      hitRate: 0
    };
  }

  async connect(): Promise<void> {
    if (this.isConnected) return;

    try {
      this.client = createClient({
        url: this.redisUrl || process.env.REDIS_URL || 'redis://localhost:6379',
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > this.maxRetries) {
              return new Error('Max reconnection attempts reached');
            }
            return Math.min(retries * 100, 3000);
          }
        }
      });

      this.client.on('error', (err) => {
        console.error('Redis Client Error:', err);
      });

      this.client.on('connect', () => {
        console.log('Redis Client Connected');
        this.isConnected = true;
      });

      this.client.on('ready', () => {
        console.log('Redis Client Ready');
      });

      await this.client.connect();
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (!this.client || !this.isConnected) return;

    try {
      await this.client.quit();
      this.isConnected = false;
      this.client = null;
    } catch (error) {
      console.error('Error disconnecting from Redis:', error);
    }
  }

  private ensureConnected(): void {
    if (!this.client || !this.isConnected) {
      throw new Error('Redis client is not connected');
    }
  }

  private getFullKey(key: string): string {
    return `${this.keyPrefix}${key}`;
  }

  async get<T = any>(key: string): Promise<T | null> {
    this.ensureConnected();

    try {
      const fullKey = this.getFullKey(key);
      const value = await this.client!.get(fullKey);

      if (value === null) {
        this.stats.misses++;
        this.updateHitRate();
        return null;
      }

      this.stats.hits++;
      this.updateHitRate();

      // Parse JSON value
      try {
        return JSON.parse(value) as T;
      } catch {
        // Return as string if not JSON
        return value as unknown as T;
      }
    } catch (error) {
      console.error(`Error getting cache key ${key}:`, error);
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }
  }

  async set<T = any>(key: string, value: T, options?: CacheOptions): Promise<void> {
    this.ensureConnected();

    try {
      const fullKey = this.getFullKey(key);
      const ttl = options?.ttl || this.defaultTTL;
      
      // Serialize value
      const serialized = typeof value === 'string' ? value : JSON.stringify(value);

      // Set with TTL
      await this.client!.setEx(fullKey, ttl, serialized);

      // Handle tags
      if (options?.tags && options.tags.length > 0) {
        await this.addToTags(key, options.tags);
      }

      this.stats.sets++;
    } catch (error) {
      console.error(`Error setting cache key ${key}:`, error);
      throw error;
    }
  }

  async delete(key: string): Promise<void> {
    this.ensureConnected();

    try {
      const fullKey = this.getFullKey(key);
      await this.client!.del(fullKey);
      
      // Remove from tags
      await this.removeFromTags(key);
      
      this.stats.deletes++;
    } catch (error) {
      console.error(`Error deleting cache key ${key}:`, error);
    }
  }

  async deleteByPattern(pattern: string): Promise<void> {
    this.ensureConnected();

    try {
      const fullPattern = this.getFullKey(pattern);
      const keys = await this.client!.keys(fullPattern);

      if (keys.length > 0) {
        await this.client!.del(keys);
        this.stats.deletes += keys.length;
      }
    } catch (error) {
      console.error(`Error deleting by pattern ${pattern}:`, error);
    }
  }

  async deleteByTags(tags: string[]): Promise<void> {
    this.ensureConnected();

    try {
      const keysToDelete = new Set<string>();

      // Get all keys associated with each tag
      for (const tag of tags) {
        const tagKey = `${this.keyPrefix}tags:${tag}`;
        const members = await this.client!.sMembers(tagKey);
        members.forEach(key => keysToDelete.add(key));
      }

      // Delete all keys
      if (keysToDelete.size > 0) {
        const keys = Array.from(keysToDelete).map(k => this.getFullKey(k));
        await this.client!.del(keys);
        this.stats.deletes += keys.length;
      }

      // Clean up tag sets
      const tagKeys = tags.map(tag => `${this.keyPrefix}tags:${tag}`);
      await this.client!.del(tagKeys);
    } catch (error) {
      console.error('Error deleting by tags:', error);
    }
  }

  async has(key: string): Promise<boolean> {
    this.ensureConnected();

    try {
      const fullKey = this.getFullKey(key);
      const exists = await this.client!.exists(fullKey);
      return exists === 1;
    } catch (error) {
      console.error(`Error checking key existence ${key}:`, error);
      return false;
    }
  }

  async clear(): Promise<void> {
    this.ensureConnected();

    try {
      const pattern = `${this.keyPrefix}*`;
      const keys = await this.client!.keys(pattern);

      if (keys.length > 0) {
        await this.client!.del(keys);
        this.stats.deletes += keys.length;
      }

      // Reset stats
      this.stats = {
        hits: 0,
        misses: 0,
        sets: 0,
        deletes: 0,
        size: 0,
        hitRate: 0
      };
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  async getStats(): Promise<CacheStats> {
    this.ensureConnected();

    try {
      // Update size
      const keys = await this.client!.keys(`${this.keyPrefix}*`);
      this.stats.size = keys.length;

      return { ...this.stats };
    } catch (error) {
      console.error('Error getting stats:', error);
      return this.stats;
    }
  }

  async size(): Promise<number> {
    this.ensureConnected();

    try {
      const keys = await this.client!.keys(`${this.keyPrefix}*`);
      return keys.length;
    } catch (error) {
      console.error('Error getting cache size:', error);
      return 0;
    }
  }

  private async addToTags(key: string, tags: string[]): Promise<void> {
    if (!this.client) return;

    try {
      for (const tag of tags) {
        const tagKey = `${this.keyPrefix}tags:${tag}`;
        await this.client.sAdd(tagKey, key);
      }
    } catch (error) {
      console.error('Error adding to tags:', error);
    }
  }

  private async removeFromTags(key: string): Promise<void> {
    if (!this.client) return;

    try {
      // Find all tags containing this key
      const tagPattern = `${this.keyPrefix}tags:*`;
      const tagKeys = await this.client.keys(tagPattern);

      for (const tagKey of tagKeys) {
        await this.client.sRem(tagKey, key);
      }
    } catch (error) {
      console.error('Error removing from tags:', error);
    }
  }

  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
  }
}

// In-Memory Fallback Cache Adapter
export class InMemoryCacheAdapter implements ICacheAdapter {
  private cache: Map<string, { value: any; expires: number; tags?: string[] }> = new Map();
  private tagIndex: Map<string, Set<string>> = new Map();
  private stats: CacheStats;

  constructor(private readonly maxSize: number = 1000) {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      size: 0,
      hitRate: 0
    };
  }

  async connect(): Promise<void> {
    // No-op for in-memory
  }

  async disconnect(): Promise<void> {
    this.clear();
  }

  async get<T = any>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    // Check expiration
    if (entry.expires > 0 && Date.now() > entry.expires) {
      this.cache.delete(key);
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    this.stats.hits++;
    this.updateHitRate();
    return entry.value as T;
  }

  async set<T = any>(key: string, value: T, options?: CacheOptions): Promise<void> {
    // Implement LRU eviction if at max size
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        await this.delete(firstKey);
      }
    }

    const ttl = options?.ttl || 3600;
    const expires = ttl > 0 ? Date.now() + (ttl * 1000) : 0;

    this.cache.set(key, { value, expires, tags: options?.tags });

    // Update tag index
    if (options?.tags) {
      for (const tag of options.tags) {
        if (!this.tagIndex.has(tag)) {
          this.tagIndex.set(tag, new Set());
        }
        this.tagIndex.get(tag)!.add(key);
      }
    }

    this.stats.sets++;
    this.stats.size = this.cache.size;
  }

  async delete(key: string): Promise<void> {
    const entry = this.cache.get(key);
    if (entry) {
      // Remove from tag index
      if (entry.tags) {
        for (const tag of entry.tags) {
          this.tagIndex.get(tag)?.delete(key);
        }
      }
      this.cache.delete(key);
      this.stats.deletes++;
      this.stats.size = this.cache.size;
    }
  }

  async deleteByPattern(pattern: string): Promise<void> {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    const keysToDelete = Array.from(this.cache.keys()).filter(key => regex.test(key));
    
    for (const key of keysToDelete) {
      await this.delete(key);
    }
  }

  async deleteByTags(tags: string[]): Promise<void> {
    const keysToDelete = new Set<string>();
    
    for (const tag of tags) {
      const keys = this.tagIndex.get(tag);
      if (keys) {
        keys.forEach(key => keysToDelete.add(key));
      }
    }

    for (const key of keysToDelete) {
      await this.delete(key);
    }
  }

  async has(key: string): Promise<boolean> {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    // Check expiration
    if (entry.expires > 0 && Date.now() > entry.expires) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  async clear(): Promise<void> {
    this.cache.clear();
    this.tagIndex.clear();
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      size: 0,
      hitRate: 0
    };
  }

  async getStats(): Promise<CacheStats> {
    this.stats.size = this.cache.size;
    return { ...this.stats };
  }

  async size(): Promise<number> {
    return this.cache.size;
  }

  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
  }
}

// Cache Factory
export class CacheFactory {
  static async create(useRedis: boolean = true, redisUrl?: string): Promise<ICacheAdapter> {
    if (useRedis && process.env.NODE_ENV === 'production') {
      try {
        const redisAdapter = new RedisCacheAdapter(redisUrl);
        await redisAdapter.connect();
        return redisAdapter;
      } catch (error) {
        console.warn('Failed to connect to Redis, falling back to in-memory cache:', error);
        return new InMemoryCacheAdapter();
      }
    }
    
    return new InMemoryCacheAdapter();
  }
}

// Export singleton instance
let cacheInstance: ICacheAdapter | null = null;

export async function getCacheAdapter(): Promise<ICacheAdapter> {
  if (!cacheInstance) {
    cacheInstance = await CacheFactory.create(
      process.env.USE_REDIS === 'true',
      process.env.REDIS_URL
    );
  }
  return cacheInstance;
}