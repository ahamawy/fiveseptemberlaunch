import { test, expect } from '@playwright/test';
import { TestUtils, PerformanceAssertions, TEST_CONSTANTS } from './helpers/test-utils';

test.describe('Load Testing - High Concurrency', () => {
  test.describe.configure({ mode: 'serial' }); // Run serially to avoid overwhelming the server

  test('Should handle 100+ concurrent users', async ({ request }) => {
    const results = await TestUtils.simulateConcurrentLoad(
      request,
      '/api/investors/1/dashboard',
      100, // 100 concurrent users
      3    // 3 requests each
    );
    
    // Performance assertions
    PerformanceAssertions.assertScalability(results);
    
    // Specific thresholds for 100 users
    expect(results.avgResponseTime).toBeLessThan(1000);
    expect(results.p95ResponseTime).toBeLessThan(2000);
    expect(results.failureCount).toBeLessThan(5); // Less than 5% failure rate
    
    console.log('100 concurrent users test:', {
      avgResponseTime: results.avgResponseTime,
      p95: results.p95ResponseTime,
      p99: results.p99ResponseTime,
      failureRate: (results.failureCount / results.totalRequests) * 100 + '%'
    });
  });

  test('Should handle sustained load over time', async ({ request }) => {
    const duration = 30000; // 30 seconds
    const requestsPerSecond = 10;
    const startTime = Date.now();
    const results: any[] = [];
    
    while (Date.now() - startTime < duration) {
      const promises = [];
      
      // Send batch of requests
      for (let i = 0; i < requestsPerSecond; i++) {
        promises.push(
          TestUtils.measureApiPerformance(
            request,
            `/api/investors/${(i % 10) + 1}/portfolio`
          ).catch(err => ({ responseTime: 99999, error: err }))
        );
      }
      
      const batchResults = await Promise.all(promises);
      results.push(...batchResults);
      
      // Wait before next batch
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Analyze results
    const successfulRequests = results.filter(r => r.responseTime < 5000);
    const avgResponseTime = successfulRequests.reduce((a, b) => a + b.responseTime, 0) / successfulRequests.length;
    const successRate = successfulRequests.length / results.length;
    
    // Should maintain performance under sustained load
    expect(avgResponseTime).toBeLessThan(1500);
    expect(successRate).toBeGreaterThan(0.95); // 95% success rate
    
    console.log('Sustained load test:', {
      totalRequests: results.length,
      avgResponseTime,
      successRate: (successRate * 100).toFixed(2) + '%'
    });
  });

  test('Should handle spike traffic patterns', async ({ request }) => {
    const results: any[] = [];
    
    // Normal load
    let loadResults = await TestUtils.simulateConcurrentLoad(
      request,
      '/api/investors/1/transactions',
      10,  // 10 users
      2    // 2 requests each
    );
    results.push({ phase: 'normal', ...loadResults });
    
    // Wait a bit
    await TestUtils.waitForDatabase(2000);
    
    // Spike load (10x normal)
    loadResults = await TestUtils.simulateConcurrentLoad(
      request,
      '/api/investors/1/transactions',
      100, // 100 users (spike)
      2    // 2 requests each
    );
    results.push({ phase: 'spike', ...loadResults });
    
    // Wait for recovery
    await TestUtils.waitForDatabase(3000);
    
    // Return to normal
    loadResults = await TestUtils.simulateConcurrentLoad(
      request,
      '/api/investors/1/transactions',
      10,  // Back to 10 users
      2    // 2 requests each
    );
    results.push({ phase: 'recovery', ...loadResults });
    
    // System should handle spike and recover
    const spikePerformance = results.find(r => r.phase === 'spike');
    const recoveryPerformance = results.find(r => r.phase === 'recovery');
    
    // Spike should still be handled
    expect(spikePerformance.failureCount).toBeLessThan(spikePerformance.totalRequests * 0.1);
    
    // Recovery should return to normal
    expect(recoveryPerformance.avgResponseTime).toBeLessThan(
      results.find(r => r.phase === 'normal').avgResponseTime * 1.5
    );
    
    console.log('Spike traffic test:', results);
  });
});

test.describe('Load Testing - Data Volume', () => {
  test('Should handle 10K+ transactions efficiently', async ({ request }) => {
    // Query large dataset
    const startTime = Date.now();
    
    const response = await request.post('/api/test/transactions/bulk', {
      data: {
        limit: 10000,
        includeRelations: true
      },
      timeout: 30000 // 30 second timeout for large query
    });
    
    const responseTime = Date.now() - startTime;
    
    expect(response.ok()).toBeTruthy();
    expect(responseTime).toBeLessThan(5000); // Should handle 10K records in under 5 seconds
    
    const data = await response.json();
    expect(data.count).toBe(10000);
    
    console.log(`10K transactions query: ${responseTime}ms`);
  });

  test('Should handle complex aggregations on large datasets', async ({ request }) => {
    const queries = [
      {
        name: 'Monthly aggregation',
        query: {
          groupBy: "DATE_TRUNC('month', transaction_date)",
          metrics: ['SUM(amount)', 'COUNT(*)', 'AVG(amount)'],
          limit: 100
        }
      },
      {
        name: 'Deal performance',
        query: {
          groupBy: 'deal_id',
          metrics: ['SUM(amount)', 'COUNT(DISTINCT investor_id)', 'MAX(amount)'],
          having: 'SUM(amount) > 1000000',
          limit: 50
        }
      },
      {
        name: 'Investor portfolio',
        query: {
          groupBy: 'investor_id',
          metrics: ['COUNT(DISTINCT deal_id)', 'SUM(amount)', 'MIN(transaction_date)'],
          orderBy: 'SUM(amount) DESC',
          limit: 100
        }
      }
    ];
    
    for (const q of queries) {
      const metrics = await TestUtils.measureApiPerformance(
        request,
        '/api/test/analytics/aggregate',
        'POST',
        q.query
      );
      
      // Complex aggregations should still be fast
      expect(metrics.responseTime).toBeLessThan(1000);
      
      console.log(`${q.name}: ${metrics.responseTime}ms`);
    }
  });

  test('Should handle pagination efficiently', async ({ request }) => {
    const pageSize = 100;
    const pages = 10;
    const results: any[] = [];
    
    for (let page = 1; page <= pages; page++) {
      const metrics = await TestUtils.measureApiPerformance(
        request,
        '/api/investors/1/transactions',
        'GET',
        {
          page,
          limit: pageSize
        }
      );
      
      results.push({
        page,
        responseTime: metrics.responseTime,
        rowsReturned: metrics.rowsReturned
      });
    }
    
    // All pages should be fast
    const avgResponseTime = results.reduce((a, b) => a + b.responseTime, 0) / results.length;
    expect(avgResponseTime).toBeLessThan(200);
    
    // Later pages shouldn't be significantly slower
    const firstPageTime = results[0].responseTime;
    const lastPageTime = results[results.length - 1].responseTime;
    expect(lastPageTime).toBeLessThan(firstPageTime * 2);
    
    console.log('Pagination test:', {
      avgResponseTime,
      firstPage: firstPageTime,
      lastPage: lastPageTime
    });
  });
});

test.describe('Load Testing - Connection Pool', () => {
  test('Connection pool should prevent exhaustion', async ({ request }) => {
    // Try to exhaust the connection pool
    const promises = [];
    const connectionLimit = 50; // Assuming production pool size
    
    for (let i = 0; i < connectionLimit * 2; i++) {
      promises.push(
        request.get('/api/test/hold-connection', {
          params: { duration: 5000 } // Hold for 5 seconds
        }).catch(() => null)
      );
    }
    
    const results = await Promise.all(promises);
    const successful = results.filter(r => r !== null).length;
    
    // Should handle gracefully even when pool is exhausted
    expect(successful).toBeGreaterThan(connectionLimit * 0.8); // At least 80% should succeed
    
    console.log(`Connection pool test: ${successful}/${promises.length} succeeded`);
  });

  test('Connection pool should recover from stress', async ({ request }) => {
    // Stress the pool
    const stressPromises = [];
    for (let i = 0; i < 100; i++) {
      stressPromises.push(
        request.get(`/api/investors/${(i % 10) + 1}/dashboard`)
          .catch(() => null)
      );
    }
    
    await Promise.all(stressPromises);
    
    // Wait for recovery
    await TestUtils.waitForDatabase(5000);
    
    // Should work normally after stress
    const recovery = await TestUtils.measureApiPerformance(
      request,
      '/api/investors/1/dashboard'
    );
    
    expect(recovery.responseTime).toBeLessThan(500);
    console.log(`Recovery after stress: ${recovery.responseTime}ms`);
  });
});

test.describe('Load Testing - Cache Under Load', () => {
  test('Cache should maintain effectiveness under load', async ({ request }) => {
    // Clear cache
    await request.post('/api/cache/invalidate', {
      data: { pattern: '*' }
    });
    
    // Generate load with repeated requests
    const url = '/api/investors/1/portfolio';
    const results: any[] = [];
    
    for (let batch = 0; batch < 10; batch++) {
      const promises = [];
      
      // 20 concurrent requests to same endpoint
      for (let i = 0; i < 20; i++) {
        promises.push(TestUtils.measureApiPerformance(request, url));
      }
      
      const batchResults = await Promise.all(promises);
      results.push(...batchResults);
      
      await TestUtils.waitForDatabase(100);
    }
    
    // Calculate cache hit rate
    const cacheHits = results.filter(r => r.cacheHit === true).length;
    const cacheHitRate = cacheHits / results.length;
    
    // Cache should be effective under load
    expect(cacheHitRate).toBeGreaterThan(0.8); // 80%+ cache hit rate
    
    // Cached responses should be fast
    const cachedResults = results.filter(r => r.cacheHit === true);
    const avgCachedTime = cachedResults.reduce((a, b) => a + b.responseTime, 0) / cachedResults.length;
    expect(avgCachedTime).toBeLessThan(50);
    
    console.log('Cache under load:', {
      cacheHitRate: (cacheHitRate * 100).toFixed(2) + '%',
      avgCachedTime: avgCachedTime.toFixed(2) + 'ms'
    });
  });

  test('Cache invalidation should work under load', async ({ request }) => {
    const url = '/api/investors/1/dashboard';
    
    // Warm up cache
    await TestUtils.measureApiPerformance(request, url);
    
    // Start concurrent reads
    const readPromises = [];
    for (let i = 0; i < 50; i++) {
      readPromises.push(
        TestUtils.measureApiPerformance(request, url)
      );
    }
    
    // Invalidate cache in the middle
    setTimeout(() => {
      request.post('/api/cache/invalidate', {
        data: { pattern: '*dashboard*' }
      });
    }, 100);
    
    const results = await Promise.all(readPromises);
    
    // Some should be cache hits, some misses (after invalidation)
    const cacheHits = results.filter(r => r.cacheHit === true).length;
    const cacheMisses = results.filter(r => r.cacheHit === false).length;
    
    expect(cacheHits).toBeGreaterThan(0);
    expect(cacheMisses).toBeGreaterThan(0);
    
    console.log(`Cache invalidation under load: ${cacheHits} hits, ${cacheMisses} misses`);
  });
});

test.describe('Load Testing - Database Performance', () => {
  test('Should handle mixed read/write workload', async ({ request }) => {
    const duration = 20000; // 20 seconds
    const startTime = Date.now();
    const results = {
      reads: [],
      writes: [],
      updates: [],
      deletes: []
    } as any;
    
    while (Date.now() - startTime < duration) {
      const promises = [];
      
      // 70% reads
      for (let i = 0; i < 7; i++) {
        promises.push(
          TestUtils.measureApiPerformance(
            request,
            `/api/investors/${(i % 10) + 1}/transactions`
          ).then(r => { results.reads.push(r); return r; })
        );
      }
      
      // 20% writes
      for (let i = 0; i < 2; i++) {
        promises.push(
          TestUtils.measureApiPerformance(
            request,
            '/api/test/transactions',
            'POST',
            TestUtils.generateTestData(1, 'transaction')[0]
          ).then(r => { results.writes.push(r); return r; })
        );
      }
      
      // 10% updates
      promises.push(
        TestUtils.measureApiPerformance(
          request,
          '/api/test/transactions/1',
          'PUT',
          { amount: Math.random() * 100000 }
        ).then(r => { results.updates.push(r); return r; })
      );
      
      await Promise.all(promises);
      await TestUtils.waitForDatabase(500);
    }
    
    // Analyze performance by operation type
    const avgRead = results.reads.reduce((a: number, b: any) => a + b.responseTime, 0) / results.reads.length;
    const avgWrite = results.writes.reduce((a: number, b: any) => a + b.responseTime, 0) / results.writes.length;
    const avgUpdate = results.updates.reduce((a: number, b: any) => a + b.responseTime, 0) / results.updates.length;
    
    // All operations should perform well
    expect(avgRead).toBeLessThan(200);
    expect(avgWrite).toBeLessThan(500);
    expect(avgUpdate).toBeLessThan(300);
    
    console.log('Mixed workload performance:', {
      reads: { count: results.reads.length, avgTime: avgRead },
      writes: { count: results.writes.length, avgTime: avgWrite },
      updates: { count: results.updates.length, avgTime: avgUpdate }
    });
  });

  test('Should handle index rebuilding without downtime', async ({ request }) => {
    // Start continuous queries
    let keepQuerying = true;
    const queryResults: any[] = [];
    
    const queryLoop = async () => {
      while (keepQuerying) {
        const result = await TestUtils.measureApiPerformance(
          request,
          '/api/investors/1/transactions'
        );
        queryResults.push(result);
        await TestUtils.waitForDatabase(100);
      }
    };
    
    // Start querying
    const queryPromise = queryLoop();
    
    // Trigger index rebuild (simulated)
    await TestUtils.waitForDatabase(2000);
    await request.post('/api/test/rebuild-index', {
      data: {
        table: 'transactions_clean',
        index: 'idx_transactions_investor_date'
      }
    });
    
    // Continue for a bit
    await TestUtils.waitForDatabase(3000);
    keepQuerying = false;
    await queryPromise;
    
    // Check for any timeouts or failures
    const failures = queryResults.filter(r => r.responseTime > 5000).length;
    const failureRate = failures / queryResults.length;
    
    expect(failureRate).toBeLessThan(0.05); // Less than 5% affected
    
    console.log(`Index rebuild impact: ${failures}/${queryResults.length} slow queries`);
  });
});

test.describe('Load Testing - Memory and Resources', () => {
  test('Memory usage should remain stable under load', async ({ request }) => {
    // Get initial memory stats
    const initialStats = await request.get('/api/test/system-stats');
    const initialMemory = (await initialStats.json()).memory;
    
    // Generate sustained load
    for (let i = 0; i < 100; i++) {
      await TestUtils.simulateConcurrentLoad(
        request,
        '/api/investors/1/dashboard',
        20,
        1
      );
    }
    
    // Get final memory stats
    const finalStats = await request.get('/api/test/system-stats');
    const finalMemory = (await finalStats.json()).memory;
    
    // Memory increase should be reasonable (not a leak)
    const memoryIncrease = finalMemory - initialMemory;
    expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024); // Less than 100MB increase
    
    console.log(`Memory stability: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB increase`);
  });

  test('Should handle maximum payload sizes', async ({ request }) => {
    // Test with large bulk operations
    const largePayload = TestUtils.generateTestData(1000, 'transaction');
    
    const metrics = await TestUtils.measureApiPerformance(
      request,
      '/api/test/transactions/bulk',
      'POST',
      { transactions: largePayload }
    );
    
    // Should handle large payloads
    expect(metrics.responseTime).toBeLessThan(10000);
    
    console.log(`Large payload (1000 records): ${metrics.responseTime}ms`);
  });
});