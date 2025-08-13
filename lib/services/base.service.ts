/**
 * Base Service Class
 * Provides common functionality for all service classes
 */

import { getDataClient, simulateDelay } from '../db/client';
import type { IDataClient } from '../db/client';

export interface ServiceOptions {
  enableCache?: boolean;
  cacheTime?: number;
  enableLogging?: boolean;
}

export abstract class BaseService {
  protected dataClient: IDataClient;
  protected cache: Map<string, { data: any; timestamp: number }> = new Map();
  protected options: ServiceOptions;

  constructor(options: ServiceOptions = {}) {
    this.dataClient = getDataClient();
    this.options = {
      enableCache: true,
      cacheTime: 5 * 60 * 1000, // 5 minutes default
      enableLogging: process.env.NODE_ENV === 'development',
      ...options
    };
  }

  /**
   * Get cached data if available and not expired
   */
  protected getCached<T>(key: string): T | null {
    if (!this.options.enableCache) return null;

    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > (this.options.cacheTime || 0)) {
      this.cache.delete(key);
      return null;
    }

    if (this.options.enableLogging) {
      console.log(`📦 Cache hit: ${key}`);
    }

    return cached.data as T;
  }

  /**
   * Set cache data
   */
  protected setCache(key: string, data: any): void {
    if (!this.options.enableCache) return;

    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });

    if (this.options.enableLogging) {
      console.log(`💾 Cache set: ${key}`);
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    if (this.options.enableLogging) {
      console.log('🗑️ Cache cleared');
    }
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