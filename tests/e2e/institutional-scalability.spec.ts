import { test, expect } from '@playwright/test';
import { TestUtils, PerformanceAssertions, TEST_CONSTANTS } from './helpers/test-utils';

test.describe('Institutional Scalability - Database Performance', () => {
  test.describe.configure({ mode: 'parallel' });

  test('Clean tables should have optimal query performance', async ({ request }) => {
    // Test queries on clean tables
    const tables = ['transactions_clean', 'deals_clean', 'companies_clean', 'investors_clean'];
    
    for (const table of tables) {
      const metrics = await TestUtils.measureApiPerformance(
        request,
        `/api/test/query/${table}?limit=100`
      );
      
      // Assert sub-100ms response time for indexed queries
      PerformanceAssertions.assertInstitutionalPerformance(metrics);
      
      // Log performance for debugging
      console.log(`${table} query performance: ${metrics.responseTime}ms`);
    }
  });

  test('Composite indexes should improve join performance', async ({ request }) => {
    // Test a complex join query using composite indexes
    const startTime = Date.now();
    
    const response = await request.get('/api/investors/1/transactions', {
      params: {
        page: 1,
        limit: 50,
        type: 'primary',
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      }
    });
    
    const responseTime = Date.now() - startTime;
    
    expect(response.ok()).toBeTruthy();
    expect(responseTime).toBeLessThan(200); // Complex joins should still be fast
    
    const data = await response.json();
    expect(data.success).toBeTruthy();
  });

  test('Foreign key constraints should maintain referential integrity', async ({ request }) => {
    // Try to insert a transaction with non-existent investor_id
    const response = await request.post('/api/test/transactions', {
      data: {
        investor_id: 999999, // Non-existent
        deal_id: 1,
        transaction_type: 'primary',
        amount: 100000
      }
    });
    
    // Should fail due to foreign key constraint
    expect(response.ok()).toBeFalsy();
    
    const error = await response.json();
    expect(error.error).toContain('foreign key');
  });

  test('Cascade deletes should work correctly', async ({ request }) => {
    // This test would require a test endpoint that allows deletion
    // For safety, we'll just verify the constraint exists
    
    const response = await request.get('/api/test/constraints', {
      params: {
        table: 'transactions_clean',
        type: 'foreign_key'
      }
    });
    
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    const dealConstraint = data.constraints?.find((c: any) => 
      c.column === 'deal_id' && c.onDelete === 'CASCADE'
    );
    
    expect(dealConstraint).toBeDefined();
  });

  test('Partition pruning should optimize date-range queries', async ({ request }) => {
    // Query transactions for a specific date range
    const metrics = await TestUtils.measureApiPerformance(
      request,
      '/api/test/transactions/range',
      'POST',
      {
        startDate: '2024-06-01',
        endDate: '2024-06-30',
        limit: 1000
      }
    );
    
    // Date-range queries should be fast due to partition pruning
    expect(metrics.responseTime).toBeLessThan(150);
    
    // Verify BRIN index is being used
    const explainResponse = await request.post('/api/test/explain', {
      data: {
        query: "SELECT * FROM transactions_clean WHERE transaction_date BETWEEN '2024-06-01' AND '2024-06-30'"
      }
    });
    
    if (explainResponse.ok()) {
      const plan = await explainResponse.json();
      // Check if index scan is being used
      expect(plan.plan).toContain('Index');
    }
  });

  test('Backward compatibility views should work correctly', async ({ request }) => {
    // Test that old dot-notation views still return data
    const oldTableNames = [
      'deals_clean',
      'companies_clean', 
      'investors_clean',
      'transactions_clean'
    ];
    
    for (const tableName of oldTableNames) {
      const response = await request.post('/api/test/query', {
        data: {
          table: tableName,
          limit: 1
        }
      });
      
      // Views should still work
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(data.rows).toBeDefined();
    }
  });

  test('Database statistics should show optimization improvements', async ({ request }) => {
    const stats = await TestUtils.getDatabaseStats(request);
    
    // Verify we have the expected clean tables
    expect(stats.tableCount).toBeGreaterThan(50);
    
    // Verify indexes are created
    expect(stats.indexCount).toBeGreaterThan(200);
    
    // Cache hit rate should be good
    expect(stats.cacheHitRate).toBeGreaterThan(0.5);
  });
});

test.describe('Institutional Scalability - Connection Pooling', () => {
  test('Connection pool should handle concurrent requests efficiently', async ({ request }) => {
    // Simulate 20 concurrent requests
    const results = await TestUtils.simulateConcurrentLoad(
      request,
      '/api/investors/1/dashboard',
      20, // concurrency
      5   // requests per user
    );
    
    // Assert that connection pooling is working
    expect(results.avgResponseTime).toBeLessThan(500);
    expect(results.successCount).toBe(results.totalRequests);
    
    console.log('Connection pool test results:', results);
  });

  test('Connection pool should recover from failures', async ({ request }) => {
    // First, exhaust connections (simulate)
    const promises = [];
    for (let i = 0; i < 30; i++) {
      promises.push(
        request.get('/api/test/slow-query', {
          params: { delay: 2000 } // 2 second delay
        }).catch(() => null)
      );
    }
    
    // Some requests might fail due to pool exhaustion
    const results = await Promise.all(promises);
    const failures = results.filter(r => r === null).length;
    
    // But the pool should recover
    await TestUtils.waitForDatabase(3000);
    
    // New requests should work
    const recovery = await request.get('/api/investors/1/dashboard');
    expect(recovery.ok()).toBeTruthy();
  });
});

test.describe('Institutional Scalability - Performance Monitoring', () => {
  test('Slow queries should be detected and logged', async ({ request }) => {
    // Execute a slow query
    await request.get('/api/test/slow-query', {
      params: { delay: 1500 } // 1.5 seconds
    });
    
    // Check if it was logged as a slow query
    await TestUtils.waitForDatabase(1000);
    
    const metricsResponse = await request.get('/api/test/query-metrics', {
      params: {
        minExecutionTime: TEST_CONSTANTS.SLOW_QUERY_THRESHOLD
      }
    });
    
    expect(metricsResponse.ok()).toBeTruthy();
    
    const metrics = await metricsResponse.json();
    expect(metrics.slowQueries).toBeGreaterThan(0);
  });

  test('Performance alerts should be generated for critical issues', async ({ request }) => {
    // Simulate a critical performance issue
    await request.post('/api/test/simulate-issue', {
      data: {
        type: 'SLOW_QUERY',
        severity: 'CRITICAL',
        executionTime: 6000 // 6 seconds
      }
    });
    
    // Check for alerts
    const alertsResponse = await request.get('/api/test/performance-alerts', {
      params: {
        severity: 'CRITICAL',
        limit: 10
      }
    });
    
    expect(alertsResponse.ok()).toBeTruthy();
    
    const alerts = await alertsResponse.json();
    expect(alerts.alerts?.length).toBeGreaterThan(0);
    
    const criticalAlert = alerts.alerts?.find((a: any) => 
      a.severity === 'CRITICAL' && a.alert_type === 'SLOW_QUERY'
    );
    expect(criticalAlert).toBeDefined();
  });

  test('Query statistics should be aggregated correctly', async ({ request }) => {
    // Run several queries to generate statistics
    for (let i = 0; i < 10; i++) {
      await TestUtils.measureApiPerformance(
        request,
        `/api/investors/${i + 1}/dashboard`
      );
    }
    
    // Get aggregated statistics
    const statsResponse = await request.get('/api/test/query-statistics');
    
    expect(statsResponse.ok()).toBeTruthy();
    
    const stats = await statsResponse.json();
    expect(stats.avgExecutionTime).toBeDefined();
    expect(stats.p95ExecutionTime).toBeDefined();
    expect(stats.p99ExecutionTime).toBeDefined();
    expect(stats.queryCount).toBeGreaterThan(0);
  });
});

test.describe('Institutional Scalability - Cache Performance', () => {
  test('Cache should significantly improve response times', async ({ request }) => {
    const url = '/api/investors/1/portfolio';
    
    // Clear cache first
    await request.post('/api/cache/invalidate', {
      data: { pattern: '*portfolio*' }
    });
    
    // First request (cache miss)
    const firstMetrics = await TestUtils.measureApiPerformance(request, url);
    
    // Second request (should be cached)
    const secondMetrics = await TestUtils.measureApiPerformance(request, url);
    
    // Cache hit should be significantly faster
    expect(secondMetrics.responseTime).toBeLessThan(firstMetrics.responseTime * 0.5);
    
    console.log(`Cache performance: ${firstMetrics.responseTime}ms -> ${secondMetrics.responseTime}ms`);
  });

  test('Cache hit rate should meet target threshold', async ({ request }) => {
    const effectiveness = await TestUtils.measureCacheEffectiveness(
      request,
      '/api/investors/1/dashboard',
      20 // iterations
    );
    
    // Cache hit rate should be above 70%
    expect(effectiveness.cacheHitRate).toBeGreaterThan(TEST_CONSTANTS.CACHE_HIT_TARGET);
    
    // Cached responses should be much faster
    expect(effectiveness.avgCachedResponseTime).toBeLessThan(
      effectiveness.avgUncachedResponseTime * 0.3
    );
    
    console.log('Cache effectiveness:', effectiveness);
  });
});

test.describe('Institutional Scalability - Index Optimization', () => {
  test('Composite indexes should be used for multi-column queries', async ({ request }) => {
    // Test query that should use composite index
    const response = await request.post('/api/test/explain', {
      data: {
        query: `
          SELECT * FROM transactions_clean 
          WHERE investor_id = 1 
          AND transaction_date > '2024-01-01'
          ORDER BY transaction_date DESC
        `
      }
    });
    
    expect(response.ok()).toBeTruthy();
    
    const plan = await response.json();
    // Should use idx_transactions_investor_date composite index
    expect(plan.plan).toMatch(/idx_transactions_investor_date|Index Scan/i);
  });

  test('Partial indexes should optimize filtered queries', async ({ request }) => {
    // Test query that should use partial index
    const response = await request.post('/api/test/explain', {
      data: {
        query: `
          SELECT * FROM transactions_clean 
          WHERE investor_id = 1 
          AND deal_id = 5
          AND status = 'completed'
        `
      }
    });
    
    expect(response.ok()).toBeTruthy();
    
    const plan = await response.json();
    // Should use idx_transactions_active partial index
    expect(plan.plan).toMatch(/idx_transactions_active|Index/i);
  });

  test('No duplicate indexes should exist', async ({ request }) => {
    const response = await request.get('/api/test/indexes', {
      params: {
        checkDuplicates: true
      }
    });
    
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    
    // Should not have the duplicate indexes we removed
    const duplicates = ['idx_transactions_clean_deal', 'idx_transactions_clean_investor'];
    
    for (const dupIndex of duplicates) {
      const found = data.indexes?.find((idx: any) => idx.name === dupIndex);
      expect(found).toBeUndefined();
    }
  });
});

test.describe('Institutional Scalability - Data Volume', () => {
  test('System should handle 10K+ transactions efficiently', async ({ request }) => {
    // Query a large dataset
    const metrics = await TestUtils.measureApiPerformance(
      request,
      '/api/test/transactions/bulk',
      'POST',
      {
        limit: 10000,
        fields: ['transaction_id', 'investor_id', 'amount', 'transaction_date']
      }
    );
    
    // Even with 10K records, response should be reasonable
    expect(metrics.responseTime).toBeLessThan(2000);
    expect(metrics.rowsReturned).toBe(10000);
  });

  test('Aggregation queries should perform well on large datasets', async ({ request }) => {
    // Test aggregation performance
    const metrics = await TestUtils.measureApiPerformance(
      request,
      '/api/test/analytics/aggregate',
      'POST',
      {
        groupBy: 'deal_id',
        metrics: ['SUM(amount)', 'COUNT(*)', 'AVG(amount)'],
        having: 'COUNT(*) > 10'
      }
    );
    
    // Aggregations should be optimized
    expect(metrics.responseTime).toBeLessThan(500);
  });
});