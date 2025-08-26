/**
 * Performance Monitoring System
 * Tracks database query performance and system metrics
 */

import { getServiceClient } from "@/lib/db/supabase/server-client";

export interface QueryMetric {
  query_id: string;
  query_text: string;
  execution_time: number;
  rows_returned: number;
  timestamp: Date;
  user_id?: string;
  api_endpoint?: string;
  cache_hit: boolean;
  error?: string;
}

export interface SystemMetric {
  metric_name: string;
  metric_value: number;
  metric_unit: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface PerformanceAlert {
  alert_type: 'SLOW_QUERY' | 'HIGH_LOAD' | 'ERROR_RATE' | 'CACHE_MISS';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  details: Record<string, any>;
  timestamp: Date;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metricsBuffer: QueryMetric[] = [];
  private systemMetricsBuffer: SystemMetric[] = [];
  private alertsBuffer: PerformanceAlert[] = [];
  private flushInterval = 10000; // 10 seconds
  private flushTimer?: NodeJS.Timeout;
  
  // Thresholds
  private readonly SLOW_QUERY_THRESHOLD = 1000; // 1 second
  private readonly HIGH_ERROR_RATE_THRESHOLD = 0.05; // 5%
  private readonly LOW_CACHE_HIT_THRESHOLD = 0.7; // 70%

  private constructor() {
    this.startMonitoring();
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Track a query execution
   */
  async trackQuery(
    queryText: string,
    executionTime: number,
    rowsReturned: number,
    cacheHit: boolean = false,
    error?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    const metric: QueryMetric = {
      query_id: this.generateQueryId(),
      query_text: this.sanitizeQuery(queryText),
      execution_time: executionTime,
      rows_returned: rowsReturned,
      timestamp: new Date(),
      cache_hit: cacheHit,
      error,
      ...metadata
    };

    this.metricsBuffer.push(metric);

    // Check for performance issues
    if (executionTime > this.SLOW_QUERY_THRESHOLD) {
      await this.createAlert(
        'SLOW_QUERY',
        executionTime > 5000 ? 'CRITICAL' : executionTime > 3000 ? 'HIGH' : 'MEDIUM',
        `Slow query detected: ${executionTime}ms`,
        { query: queryText, execution_time: executionTime }
      );
    }
  }

  /**
   * Track system metrics
   */
  async trackSystemMetric(
    name: string,
    value: number,
    unit: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    const metric: SystemMetric = {
      metric_name: name,
      metric_value: value,
      metric_unit: unit,
      timestamp: new Date(),
      metadata
    };

    this.systemMetricsBuffer.push(metric);
  }

  /**
   * Create a performance alert
   */
  private async createAlert(
    type: PerformanceAlert['alert_type'],
    severity: PerformanceAlert['severity'],
    message: string,
    details: Record<string, any>
  ): Promise<void> {
    const alert: PerformanceAlert = {
      alert_type: type,
      severity,
      message,
      details,
      timestamp: new Date()
    };

    this.alertsBuffer.push(alert);

    // Log critical alerts immediately
    if (severity === 'CRITICAL') {
      console.error(`[CRITICAL ALERT] ${message}`, details);
      await this.flushAlerts();
    }
  }

  /**
   * Analyze query patterns
   */
  async analyzeQueryPatterns(): Promise<{
    slowQueries: any[];
    frequentQueries: any[];
    errorProne: any[];
    cacheStats: any;
  }> {
    try {
      const sb = getServiceClient();
      
      // Get slow queries
      const { data: slowQueries } = await sb
        .from('query_metrics')
        .select('query_text, AVG(execution_time) as avg_time, COUNT(*) as count')
        .gt('execution_time', this.SLOW_QUERY_THRESHOLD)
        .order('avg_time', { ascending: false })
        .limit(10);

      // Get frequent queries
      const { data: frequentQueries } = await sb
        .from('query_metrics')
        .select('query_text, COUNT(*) as count, AVG(execution_time) as avg_time')
        .order('count', { ascending: false })
        .limit(10);

      // Get error-prone queries
      const { data: errorProne } = await sb
        .from('query_metrics')
        .select('query_text, COUNT(*) as error_count')
        .not('error', 'is', null)
        .order('error_count', { ascending: false })
        .limit(10);

      // Calculate cache statistics
      const { data: cacheStats } = await sb
        .from('query_metrics')
        .select('cache_hit, COUNT(*) as count');

      const cacheHits = cacheStats?.find(s => s.cache_hit)?.count || 0;
      const cacheMisses = cacheStats?.find(s => !s.cache_hit)?.count || 0;
      const cacheHitRate = cacheHits / (cacheHits + cacheMisses) || 0;

      return {
        slowQueries: slowQueries || [],
        frequentQueries: frequentQueries || [],
        errorProne: errorProne || [],
        cacheStats: {
          hits: cacheHits,
          misses: cacheMisses,
          hitRate: cacheHitRate
        }
      };
    } catch (error) {
      console.error('Failed to analyze query patterns:', error);
      return {
        slowQueries: [],
        frequentQueries: [],
        errorProne: [],
        cacheStats: { hits: 0, misses: 0, hitRate: 0 }
      };
    }
  }

  /**
   * Get performance dashboard data
   */
  async getDashboardData(): Promise<{
    avgResponseTime: number;
    errorRate: number;
    cacheHitRate: number;
    activeConnections: number;
    slowQueriesCount: number;
    alerts: PerformanceAlert[];
  }> {
    try {
      const sb = getServiceClient();
      
      // Calculate average response time
      const { data: avgTime } = await sb
        .from('query_metrics')
        .select('execution_time')
        .gte('timestamp', new Date(Date.now() - 3600000).toISOString()); // Last hour

      const avgResponseTime = avgTime?.length 
        ? avgTime.reduce((sum, m) => sum + m.execution_time, 0) / avgTime.length 
        : 0;

      // Calculate error rate
      const errorCount = avgTime?.filter(m => m.error).length || 0;
      const errorRate = avgTime?.length ? errorCount / avgTime.length : 0;

      // Get cache hit rate
      const analysis = await this.analyzeQueryPatterns();
      
      // Get recent alerts
      const { data: alerts } = await sb
        .from('performance_alerts')
        .select('*')
        .gte('timestamp', new Date(Date.now() - 3600000).toISOString())
        .order('timestamp', { ascending: false })
        .limit(10);

      return {
        avgResponseTime,
        errorRate,
        cacheHitRate: analysis.cacheStats.hitRate,
        activeConnections: 0, // Would need to query pg_stat_activity
        slowQueriesCount: analysis.slowQueries.length,
        alerts: alerts || []
      };
    } catch (error) {
      console.error('Failed to get dashboard data:', error);
      return {
        avgResponseTime: 0,
        errorRate: 0,
        cacheHitRate: 0,
        activeConnections: 0,
        slowQueriesCount: 0,
        alerts: []
      };
    }
  }

  /**
   * Start monitoring
   */
  private startMonitoring(): void {
    this.flushTimer = setInterval(async () => {
      await this.flush();
    }, this.flushInterval);
  }

  /**
   * Flush metrics to database
   */
  private async flush(): Promise<void> {
    await Promise.all([
      this.flushQueryMetrics(),
      this.flushSystemMetrics(),
      this.flushAlerts()
    ]);
  }

  /**
   * Flush query metrics
   */
  private async flushQueryMetrics(): Promise<void> {
    if (this.metricsBuffer.length === 0) return;

    const batch = [...this.metricsBuffer];
    this.metricsBuffer = [];

    try {
      const sb = getServiceClient();
      const { error } = await sb
        .from('query_metrics')
        .insert(batch.map(m => ({
          ...m,
          timestamp: m.timestamp.toISOString()
        })));

      if (error) {
        console.error('Failed to write query metrics:', error);
        this.metricsBuffer.unshift(...batch);
      }
    } catch (error) {
      console.error('Query metrics flush error:', error);
      this.metricsBuffer.unshift(...batch);
    }
  }

  /**
   * Flush system metrics
   */
  private async flushSystemMetrics(): Promise<void> {
    if (this.systemMetricsBuffer.length === 0) return;

    const batch = [...this.systemMetricsBuffer];
    this.systemMetricsBuffer = [];

    try {
      const sb = getServiceClient();
      const { error } = await sb
        .from('system_metrics')
        .insert(batch.map(m => ({
          ...m,
          timestamp: m.timestamp.toISOString(),
          metadata: m.metadata ? JSON.stringify(m.metadata) : null
        })));

      if (error) {
        console.error('Failed to write system metrics:', error);
        this.systemMetricsBuffer.unshift(...batch);
      }
    } catch (error) {
      console.error('System metrics flush error:', error);
      this.systemMetricsBuffer.unshift(...batch);
    }
  }

  /**
   * Flush alerts
   */
  private async flushAlerts(): Promise<void> {
    if (this.alertsBuffer.length === 0) return;

    const batch = [...this.alertsBuffer];
    this.alertsBuffer = [];

    try {
      const sb = getServiceClient();
      const { error } = await sb
        .from('performance_alerts')
        .insert(batch.map(a => ({
          ...a,
          timestamp: a.timestamp.toISOString(),
          details: JSON.stringify(a.details)
        })));

      if (error) {
        console.error('Failed to write alerts:', error);
        this.alertsBuffer.unshift(...batch);
      }
    } catch (error) {
      console.error('Alerts flush error:', error);
      this.alertsBuffer.unshift(...batch);
    }
  }

  /**
   * Generate a unique query ID
   */
  private generateQueryId(): string {
    return `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Sanitize query text for storage
   */
  private sanitizeQuery(query: string): string {
    // Remove sensitive data patterns
    return query
      .replace(/password\s*=\s*'[^']*'/gi, "password='***'")
      .replace(/token\s*=\s*'[^']*'/gi, "token='***'")
      .replace(/key\s*=\s*'[^']*'/gi, "key='***'")
      .substring(0, 1000); // Limit length
  }

  /**
   * Shutdown monitoring
   */
  async shutdown(): Promise<void> {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    await this.flush();
  }
}

// Middleware for tracking API performance
export function withPerformanceTracking<T extends any[], R>(
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    const monitor = PerformanceMonitor.getInstance();
    const startTime = Date.now();
    let error: string | undefined;

    try {
      const result = await handler(...args);
      return result;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unknown error';
      throw err;
    } finally {
      const executionTime = Date.now() - startTime;
      await monitor.trackQuery(
        'API call',
        executionTime,
        0,
        false,
        error
      );
    }
  };
}

// Export singleton
export const performanceMonitor = PerformanceMonitor.getInstance();