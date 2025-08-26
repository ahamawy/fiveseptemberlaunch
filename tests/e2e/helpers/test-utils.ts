/**
 * Test Utilities for Institutional Scalability Testing
 */

import { Page, APIRequestContext, expect } from '@playwright/test';

export interface PerformanceMetrics {
  responseTime: number;
  queryTime?: number;
  cacheHit?: boolean;
  rowsReturned?: number;
}

export class TestUtils {
  /**
   * Measure API response time
   */
  static async measureApiPerformance(
    request: APIRequestContext,
    url: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: any
  ): Promise<PerformanceMetrics> {
    const startTime = Date.now();
    
    const response = await request[method.toLowerCase()](url, {
      data,
      headers: {
        'X-Test-Performance': 'true'
      }
    });
    
    const responseTime = Date.now() - startTime;
    const headers = response.headers();
    
    return {
      responseTime,
      queryTime: headers['x-query-time'] ? parseInt(headers['x-query-time']) : undefined,
      cacheHit: headers['x-cache-hit'] === 'true',
      rowsReturned: headers['x-rows-returned'] ? parseInt(headers['x-rows-returned']) : undefined
    };
  }

  /**
   * Generate test data for load testing
   */
  static generateTestData(count: number, type: 'investor' | 'transaction' | 'deal') {
    const data = [];
    
    for (let i = 0; i < count; i++) {
      switch (type) {
        case 'investor':
          data.push({
            full_name: `Test Investor ${i}`,
            email: `test${i}@example.com`,
            investor_type: 'individual',
            country: 'US'
          });
          break;
        case 'transaction':
          data.push({
            investor_id: Math.floor(Math.random() * 100) + 1,
            deal_id: Math.floor(Math.random() * 20) + 1,
            transaction_type: Math.random() > 0.5 ? 'primary' : 'secondary',
            amount: Math.floor(Math.random() * 1000000) + 10000,
            transaction_date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
          });
          break;
        case 'deal':
          data.push({
            deal_name: `Test Deal ${i}`,
            deal_type: 'primary',
            deal_currency: 'USD',
            underlying_company_id: Math.floor(Math.random() * 50) + 1
          });
          break;
      }
    }
    
    return data;
  }

  /**
   * Verify database constraints
   */
  static async verifyForeignKeyConstraint(
    request: APIRequestContext,
    table: string,
    column: string,
    referencedTable: string
  ): Promise<boolean> {
    const response = await request.post('/api/test/verify-constraint', {
      data: {
        table,
        column,
        referencedTable
      }
    });
    
    return response.ok();
  }

  /**
   * Check if RLS is enforced
   */
  static async verifyRLS(
    request: APIRequestContext,
    table: string,
    userId: string
  ): Promise<boolean> {
    const response = await request.get('/api/test/verify-rls', {
      params: {
        table,
        userId
      }
    });
    
    const data = await response.json();
    return data.rlsEnforced === true;
  }

  /**
   * Simulate concurrent requests
   */
  static async simulateConcurrentLoad(
    request: APIRequestContext,
    url: string,
    concurrency: number,
    requestsPerUser: number
  ): Promise<{
    totalRequests: number;
    successCount: number;
    failureCount: number;
    avgResponseTime: number;
    maxResponseTime: number;
    minResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
  }> {
    const results: PerformanceMetrics[] = [];
    
    // Create batches of concurrent requests
    for (let batch = 0; batch < requestsPerUser; batch++) {
      const promises = [];
      
      for (let i = 0; i < concurrency; i++) {
        promises.push(this.measureApiPerformance(request, url));
      }
      
      const batchResults = await Promise.all(promises);
      results.push(...batchResults);
      
      // Small delay between batches to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Calculate statistics
    const responseTimes = results.map(r => r.responseTime).sort((a, b) => a - b);
    const successCount = results.filter(r => r.responseTime < 5000).length;
    
    return {
      totalRequests: results.length,
      successCount,
      failureCount: results.length - successCount,
      avgResponseTime: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
      maxResponseTime: Math.max(...responseTimes),
      minResponseTime: Math.min(...responseTimes),
      p95ResponseTime: responseTimes[Math.floor(responseTimes.length * 0.95)],
      p99ResponseTime: responseTimes[Math.floor(responseTimes.length * 0.99)]
    };
  }

  /**
   * Verify audit log entry
   */
  static async verifyAuditLog(
    request: APIRequestContext,
    action: string,
    entityType: string,
    entityId: string
  ): Promise<boolean> {
    const response = await request.get('/api/test/audit-logs', {
      params: {
        action,
        entityType,
        entityId,
        limit: 1
      }
    });
    
    if (!response.ok()) return false;
    
    const data = await response.json();
    return data.logs && data.logs.length > 0;
  }

  /**
   * Check cache effectiveness
   */
  static async measureCacheEffectiveness(
    request: APIRequestContext,
    url: string,
    iterations: number = 10
  ): Promise<{
    cacheHitRate: number;
    avgCachedResponseTime: number;
    avgUncachedResponseTime: number;
  }> {
    const results: PerformanceMetrics[] = [];
    
    // Clear cache first
    await request.post('/api/cache/invalidate', {
      data: { pattern: '*' }
    });
    
    // Run multiple iterations
    for (let i = 0; i < iterations; i++) {
      const metrics = await this.measureApiPerformance(request, url);
      results.push(metrics);
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    const cacheHits = results.filter(r => r.cacheHit === true);
    const cacheMisses = results.filter(r => r.cacheHit === false);
    
    return {
      cacheHitRate: cacheHits.length / results.length,
      avgCachedResponseTime: cacheHits.length > 0 
        ? cacheHits.reduce((a, b) => a + b.responseTime, 0) / cacheHits.length 
        : 0,
      avgUncachedResponseTime: cacheMisses.length > 0
        ? cacheMisses.reduce((a, b) => a + b.responseTime, 0) / cacheMisses.length
        : 0
    };
  }

  /**
   * Wait for database operation to complete
   */
  static async waitForDatabase(ms: number = 1000): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Setup test data in database
   */
  static async setupTestData(
    request: APIRequestContext,
    investorCount: number = 10,
    transactionCount: number = 100
  ): Promise<{
    investorIds: number[];
    transactionIds: number[];
    dealIds: number[];
  }> {
    // This would call a test setup endpoint
    const response = await request.post('/api/test/setup', {
      data: {
        investorCount,
        transactionCount
      }
    });
    
    const data = await response.json();
    return data;
  }

  /**
   * Cleanup test data
   */
  static async cleanupTestData(request: APIRequestContext): Promise<void> {
    await request.post('/api/test/cleanup');
  }

  /**
   * Assert performance threshold
   */
  static assertPerformance(
    metrics: PerformanceMetrics,
    maxResponseTime: number = 1000,
    message?: string
  ) {
    expect(metrics.responseTime, message || `Response time ${metrics.responseTime}ms exceeds threshold ${maxResponseTime}ms`).toBeLessThan(maxResponseTime);
  }

  /**
   * Get database statistics
   */
  static async getDatabaseStats(request: APIRequestContext): Promise<{
    tableCount: number;
    indexCount: number;
    connectionCount: number;
    cacheHitRate: number;
  }> {
    const response = await request.get('/api/test/db-stats');
    return response.json();
  }
}

export class PerformanceAssertions {
  /**
   * Assert query performance meets institutional standards
   */
  static assertInstitutionalPerformance(metrics: PerformanceMetrics) {
    // Sub-100ms for indexed queries
    expect(metrics.responseTime).toBeLessThan(100);
    
    // Cache should be utilized effectively
    if (metrics.cacheHit !== undefined) {
      expect(metrics.cacheHit).toBeTruthy();
    }
  }

  /**
   * Assert scalability metrics
   */
  static assertScalability(loadTestResults: any) {
    // 95% of requests should complete within 1 second
    expect(loadTestResults.p95ResponseTime).toBeLessThan(1000);
    
    // 99% of requests should complete within 3 seconds
    expect(loadTestResults.p99ResponseTime).toBeLessThan(3000);
    
    // Less than 1% failure rate
    const failureRate = loadTestResults.failureCount / loadTestResults.totalRequests;
    expect(failureRate).toBeLessThan(0.01);
  }

  /**
   * Assert data consistency
   */
  static assertDataConsistency(
    originalCount: number,
    newCount: number,
    operation: 'migration' | 'deduplication'
  ) {
    if (operation === 'migration') {
      // No data loss during migration
      expect(newCount).toBeGreaterThanOrEqual(originalCount);
    } else if (operation === 'deduplication') {
      // Should have fewer records after deduplication
      expect(newCount).toBeLessThan(originalCount);
    }
  }
}

// Export test data constants
export const TEST_CONSTANTS = {
  SLOW_QUERY_THRESHOLD: 1000, // 1 second
  ACCEPTABLE_RESPONSE_TIME: 100, // 100ms
  HIGH_LOAD_CONCURRENCY: 50,
  CACHE_HIT_TARGET: 0.7, // 70%
  MAX_ERROR_RATE: 0.05, // 5%
};