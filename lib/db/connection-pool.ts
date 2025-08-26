/**
 * Database Connection Pool Configuration
 * Optimizes database connections for institutional scale
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

export interface PoolConfig {
  // Connection limits
  maxConnections: number;
  minConnections: number;
  connectionTimeout: number;
  idleTimeout: number;
  
  // Performance settings
  statementTimeout: number;
  queryTimeout: number;
  
  // Retry configuration
  maxRetries: number;
  retryDelay: number;
  
  // Health check
  healthCheckInterval: number;
  
  // Read replica configuration
  enableReadReplicas: boolean;
  readReplicaUrls?: string[];
}

// Default pool configuration for production
export const defaultPoolConfig: PoolConfig = {
  maxConnections: 20,
  minConnections: 5,
  connectionTimeout: 30000, // 30 seconds
  idleTimeout: 10000, // 10 seconds
  statementTimeout: 60000, // 1 minute
  queryTimeout: 30000, // 30 seconds
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  healthCheckInterval: 30000, // 30 seconds
  enableReadReplicas: false,
  readReplicaUrls: []
};

// Environment-specific configurations
export const poolConfigs = {
  development: {
    ...defaultPoolConfig,
    maxConnections: 5,
    minConnections: 1,
    enableReadReplicas: false
  },
  staging: {
    ...defaultPoolConfig,
    maxConnections: 10,
    minConnections: 3,
    enableReadReplicas: false
  },
  production: {
    ...defaultPoolConfig,
    maxConnections: 50,
    minConnections: 10,
    enableReadReplicas: true,
    readReplicaUrls: process.env.READ_REPLICA_URLS?.split(',') || []
  }
};

export class ConnectionPool {
  private writePool: SupabaseClient | null = null;
  private readPools: SupabaseClient[] = [];
  private currentReadIndex = 0;
  private config: PoolConfig;
  private healthCheckTimer?: NodeJS.Timeout;

  constructor(config?: Partial<PoolConfig>) {
    const env = process.env.NODE_ENV || 'development';
    const envConfig = poolConfigs[env as keyof typeof poolConfigs] || defaultPoolConfig;
    this.config = { ...envConfig, ...config };
  }

  /**
   * Initialize connection pools
   */
  async initialize(): Promise<void> {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
      throw new Error("Database configuration missing");
    }

    // Create write pool (primary database)
    this.writePool = createClient(url, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      db: {
        schema: 'public'
      },
      global: {
        headers: {
          'x-connection-type': 'write',
          'x-pool-size': String(this.config.maxConnections)
        }
      }
    });

    // Create read pools (replicas)
    if (this.config.enableReadReplicas && this.config.readReplicaUrls?.length) {
      this.readPools = this.config.readReplicaUrls.map(replicaUrl => 
        createClient(replicaUrl, serviceKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          },
          db: {
            schema: 'public'
          },
          global: {
            headers: {
              'x-connection-type': 'read',
              'x-pool-size': String(Math.floor(this.config.maxConnections / 2))
            }
          }
        })
      );
    }

    // Start health checks
    this.startHealthChecks();
  }

  /**
   * Get a connection for write operations
   */
  getWriteConnection(): SupabaseClient {
    if (!this.writePool) {
      throw new Error("Connection pool not initialized");
    }
    return this.writePool;
  }

  /**
   * Get a connection for read operations (load balanced)
   */
  getReadConnection(): SupabaseClient {
    // If no read replicas, use write pool
    if (!this.readPools.length) {
      return this.getWriteConnection();
    }

    // Round-robin load balancing
    const pool = this.readPools[this.currentReadIndex];
    this.currentReadIndex = (this.currentReadIndex + 1) % this.readPools.length;
    return pool;
  }

  /**
   * Execute a query with retry logic
   */
  async executeWithRetry<T>(
    operation: (client: SupabaseClient) => Promise<T>,
    isWrite: boolean = false
  ): Promise<T> {
    const client = isWrite ? this.getWriteConnection() : this.getReadConnection();
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.config.maxRetries; attempt++) {
      try {
        return await operation(client);
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on certain errors
        if (this.isNonRetryableError(error)) {
          throw error;
        }

        // Wait before retry with exponential backoff
        const delay = this.config.retryDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError || new Error("Operation failed after retries");
  }

  /**
   * Check if an error should not be retried
   */
  private isNonRetryableError(error: any): boolean {
    const message = error?.message?.toLowerCase() || '';
    return (
      message.includes('syntax error') ||
      message.includes('permission denied') ||
      message.includes('unique constraint') ||
      message.includes('foreign key constraint')
    );
  }

  /**
   * Start periodic health checks
   */
  private startHealthChecks(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }

    this.healthCheckTimer = setInterval(async () => {
      await this.performHealthCheck();
    }, this.config.healthCheckInterval);
  }

  /**
   * Perform health check on all pools
   */
  private async performHealthCheck(): Promise<void> {
    const checks = [];

    // Check write pool
    if (this.writePool) {
      checks.push(this.checkConnection(this.writePool, 'write'));
    }

    // Check read pools
    this.readPools.forEach((pool, index) => {
      checks.push(this.checkConnection(pool, `read-${index}`));
    });

    await Promise.allSettled(checks);
  }

  /**
   * Check a single connection
   */
  private async checkConnection(
    client: SupabaseClient, 
    type: string
  ): Promise<void> {
    try {
      const { error } = await client
        .from('investors_clean')
        .select('investor_id')
        .limit(1);

      if (error) {
        console.error(`Health check failed for ${type} pool:`, error);
      }
    } catch (error) {
      console.error(`Health check error for ${type} pool:`, error);
    }
  }

  /**
   * Gracefully shutdown the pool
   */
  async shutdown(): Promise<void> {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }
    
    // In a real implementation, we'd close connections here
    this.writePool = null;
    this.readPools = [];
  }

  /**
   * Get pool statistics
   */
  getStats(): {
    writePoolActive: boolean;
    readPoolsCount: number;
    config: PoolConfig;
  } {
    return {
      writePoolActive: !!this.writePool,
      readPoolsCount: this.readPools.length,
      config: this.config
    };
  }
}

// Singleton instance
let poolInstance: ConnectionPool | null = null;

/**
 * Get or create the connection pool
 */
export async function getConnectionPool(): Promise<ConnectionPool> {
  if (!poolInstance) {
    poolInstance = new ConnectionPool();
    await poolInstance.initialize();
  }
  return poolInstance;
}

/**
 * Execute a read query with connection pooling
 */
export async function executeRead<T>(
  operation: (client: SupabaseClient) => Promise<T>
): Promise<T> {
  const pool = await getConnectionPool();
  return pool.executeWithRetry(operation, false);
}

/**
 * Execute a write query with connection pooling
 */
export async function executeWrite<T>(
  operation: (client: SupabaseClient) => Promise<T>
): Promise<T> {
  const pool = await getConnectionPool();
  return pool.executeWithRetry(operation, true);
}