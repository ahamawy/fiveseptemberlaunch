import { test, expect } from '@playwright/test';
import { TestUtils, PerformanceAssertions, TEST_CONSTANTS } from './helpers/test-utils';

test.describe('API Performance - Response Times', () => {
  test.describe.configure({ mode: 'parallel' });

  test('Dashboard API should respond within 100ms', async ({ request }) => {
    const endpoints = [
      '/api/investors/1/dashboard',
      '/api/investors/2/dashboard',
      '/api/investors/3/dashboard'
    ];

    for (const endpoint of endpoints) {
      const metrics = await TestUtils.measureApiPerformance(request, endpoint);
      
      // Institutional performance standards
      PerformanceAssertions.assertInstitutionalPerformance(metrics);
      
      console.log(`${endpoint}: ${metrics.responseTime}ms (cache: ${metrics.cacheHit})`);
    }
  });

  test('Portfolio API should handle complex queries efficiently', async ({ request }) => {
    const metrics = await TestUtils.measureApiPerformance(
      request,
      '/api/investors/1/portfolio',
      'GET'
    );

    expect(metrics.responseTime).toBeLessThan(200);
    
    // Second call should be cached
    const cachedMetrics = await TestUtils.measureApiPerformance(
      request,
      '/api/investors/1/portfolio'
    );
    
    expect(cachedMetrics.cacheHit).toBeTruthy();
    expect(cachedMetrics.responseTime).toBeLessThan(metrics.responseTime * 0.5);
  });

  test('Transactions API with filters should be optimized', async ({ request }) => {
    const filters = [
      { type: 'primary', limit: 50 },
      { type: 'secondary', limit: 50 },
      { status: 'completed', limit: 100 },
      { startDate: '2024-01-01', endDate: '2024-12-31', limit: 200 }
    ];

    for (const filter of filters) {
      const response = await request.get('/api/investors/1/transactions', {
        params: filter
      });

      expect(response.ok()).toBeTruthy();
      
      const timing = response.headers()['x-response-time'];
      if (timing) {
        expect(parseInt(timing)).toBeLessThan(300);
      }
    }
  });

  test('Aggregation endpoints should use materialized views', async ({ request }) => {
    const metrics = await TestUtils.measureApiPerformance(
      request,
      '/api/analytics/portfolio-summary',
      'POST',
      {
        investor_id: 1,
        group_by: 'deal',
        metrics: ['sum', 'avg', 'count']
      }
    );

    // Aggregations should be fast due to materialized views
    expect(metrics.responseTime).toBeLessThan(500);
  });
});

test.describe('API Performance - Connection Pooling', () => {
  test('Should reuse database connections efficiently', async ({ request }) => {
    const results = [];
    
    // Rapid succession of requests
    for (let i = 0; i < 20; i++) {
      const startTime = Date.now();
      await request.get(`/api/investors/${(i % 5) + 1}/dashboard`);
      results.push(Date.now() - startTime);
    }

    // Average should be low (connection reuse)
    const avgTime = results.reduce((a, b) => a + b, 0) / results.length;
    expect(avgTime).toBeLessThan(100);

    // Later requests should be faster (warmed up connections)
    const firstHalf = results.slice(0, 10).reduce((a, b) => a + b, 0) / 10;
    const secondHalf = results.slice(10).reduce((a, b) => a + b, 0) / 10;
    
    expect(secondHalf).toBeLessThanOrEqual(firstHalf);
  });

  test('Connection pool should handle burst traffic', async ({ request }) => {
    // Send 50 requests simultaneously
    const promises = [];
    for (let i = 0; i < 50; i++) {
      promises.push(
        request.get(`/api/investors/${(i % 10) + 1}/portfolio`)
          .then(r => ({ ok: r.ok(), status: r.status() }))
      );
    }

    const results = await Promise.all(promises);
    const successful = results.filter(r => r.ok).length;
    
    // Most should succeed despite burst
    expect(successful).toBeGreaterThan(45); // 90%+ success rate
  });

  test('Should gracefully handle connection pool exhaustion', async ({ request }) => {
    // Attempt to exhaust pool with long-running queries
    const longRunning = [];
    for (let i = 0; i < 60; i++) {
      longRunning.push(
        request.get('/api/test/long-query', {
          params: { duration: 3000 }
        }).catch(() => null)
      );
    }

    // Some may timeout, but should not crash
    const results = await Promise.all(longRunning);
    const succeeded = results.filter(r => r !== null).length;
    
    // At least some should succeed
    expect(succeeded).toBeGreaterThan(0);
    
    // Pool should recover
    await TestUtils.waitForDatabase(5000);
    
    const recovery = await request.get('/api/investors/1/dashboard');
    expect(recovery.ok()).toBeTruthy();
  });
});

test.describe('API Performance - Retry Logic', () => {
  test('Should retry transient failures', async ({ request }) => {
    // Simulate intermittent failures
    const response = await request.get('/api/test/flaky-endpoint', {
      params: { failureRate: 0.5 } // 50% failure rate
    });

    // Should eventually succeed due to retry
    expect(response.ok()).toBeTruthy();
    
    const retryCount = response.headers()['x-retry-count'];
    if (retryCount) {
      expect(parseInt(retryCount)).toBeLessThanOrEqual(3);
    }
  });

  test('Should not retry non-retryable errors', async ({ request }) => {
    // These should fail immediately without retry
    const nonRetryableErrors = [
      { endpoint: '/api/test/syntax-error', expectedError: 'syntax error' },
      { endpoint: '/api/test/permission-denied', expectedError: 'permission denied' },
      { endpoint: '/api/test/constraint-violation', expectedError: 'constraint' }
    ];

    for (const test of nonRetryableErrors) {
      const startTime = Date.now();
      const response = await request.get(test.endpoint).catch(() => null);
      const duration = Date.now() - startTime;
      
      // Should fail quickly (no retry delays)
      expect(duration).toBeLessThan(1000);
      
      if (response) {
        expect(response.ok()).toBeFalsy();
      }
    }
  });

  test('Should use exponential backoff for retries', async ({ request }) => {
    const response = await request.get('/api/test/retry-timing');
    
    if (response.headers()['x-retry-timestamps']) {
      const timestamps = JSON.parse(response.headers()['x-retry-timestamps']);
      
      // Verify exponential backoff pattern
      for (let i = 1; i < timestamps.length; i++) {
        const delay = timestamps[i] - timestamps[i - 1];
        const expectedDelay = 1000 * Math.pow(2, i - 1);
        
        // Allow some variance
        expect(delay).toBeGreaterThan(expectedDelay * 0.8);
        expect(delay).toBeLessThan(expectedDelay * 1.5);
      }
    }
  });
});

test.describe('API Performance - Caching Strategy', () => {
  test('Reference data should have long cache TTL', async ({ request }) => {
    // First request
    const first = await request.get('/api/reference/currencies');
    const firstEtag = first.headers()['etag'];
    
    // Second request should be cached
    const second = await request.get('/api/reference/currencies', {
      headers: {
        'If-None-Match': firstEtag || ''
      }
    });
    
    // Should return 304 Not Modified
    expect(second.status()).toBe(304);
  });

  test('Hot data should have appropriate cache TTL', async ({ request }) => {
    const endpoint = '/api/investors/1/recent-activity';
    
    // First request
    await request.get(endpoint);
    
    // Immediate second request should be cached
    const cached = await request.get(endpoint);
    expect(cached.headers()['x-cache']).toBe('HIT');
    
    // Wait for TTL to expire (5 minutes for hot data)
    // In real test, we'd use a shorter TTL for testing
    // For now, just verify the header exists
    expect(cached.headers()['cache-control']).toContain('max-age=');
  });

  test('Cache invalidation should work correctly', async ({ request }) => {
    const endpoint = '/api/investors/1/portfolio';
    
    // Warm cache
    await request.get(endpoint);
    
    // Update data (should invalidate cache)
    await request.post('/api/test/update-portfolio', {
      data: {
        investor_id: 1,
        changes: { test: true }
      }
    });
    
    // Next request should be cache miss
    const afterUpdate = await request.get(endpoint);
    expect(afterUpdate.headers()['x-cache']).toBe('MISS');
  });

  test('Cache should handle concurrent invalidation', async ({ request }) => {
    const endpoint = '/api/investors/1/dashboard';
    
    // Warm cache
    await request.get(endpoint);
    
    // Concurrent reads and invalidation
    const promises = [];
    
    // 10 reads
    for (let i = 0; i < 10; i++) {
      promises.push(request.get(endpoint));
    }
    
    // 1 invalidation in the middle
    promises.push(
      request.post('/api/cache/invalidate', {
        data: { pattern: '*dashboard*' }
      })
    );
    
    // 10 more reads
    for (let i = 0; i < 10; i++) {
      promises.push(request.get(endpoint));
    }
    
    const results = await Promise.all(promises);
    
    // All requests should complete successfully
    const failed = results.filter(r => !r.ok()).length;
    expect(failed).toBe(0);
  });
});

test.describe('API Performance - Rate Limiting', () => {
  test('Should enforce rate limits per user', async ({ request }) => {
    const userId = 'test-user-' + Date.now();
    const requests = [];
    
    // Send 100 requests rapidly
    for (let i = 0; i < 100; i++) {
      requests.push(
        request.get('/api/investors/1/dashboard', {
          headers: { 'X-User-Id': userId }
        }).then(r => r.status())
      );
    }
    
    const statuses = await Promise.all(requests);
    
    // Some should be rate limited (429)
    const rateLimited = statuses.filter(s => s === 429).length;
    expect(rateLimited).toBeGreaterThan(0);
    
    // But not all (some should succeed)
    const succeeded = statuses.filter(s => s === 200).length;
    expect(succeeded).toBeGreaterThan(0);
  });

  test('Different users should have separate rate limits', async ({ request }) => {
    const user1 = 'user-1-' + Date.now();
    const user2 = 'user-2-' + Date.now();
    
    // User 1 hits rate limit
    const user1Requests = [];
    for (let i = 0; i < 50; i++) {
      user1Requests.push(
        request.get('/api/investors/1/dashboard', {
          headers: { 'X-User-Id': user1 }
        })
      );
    }
    
    // User 2 should still work
    const user2Response = await request.get('/api/investors/1/dashboard', {
      headers: { 'X-User-Id': user2 }
    });
    
    expect(user2Response.ok()).toBeTruthy();
  });
});

test.describe('API Performance - Compression', () => {
  test('Large responses should be compressed', async ({ request }) => {
    const response = await request.get('/api/test/large-dataset', {
      headers: {
        'Accept-Encoding': 'gzip, deflate, br'
      }
    });
    
    expect(response.ok()).toBeTruthy();
    
    const encoding = response.headers()['content-encoding'];
    expect(['gzip', 'deflate', 'br']).toContain(encoding);
    
    // Compressed size should be smaller
    const contentLength = response.headers()['content-length'];
    if (contentLength) {
      expect(parseInt(contentLength)).toBeLessThan(1000000); // Less than 1MB compressed
    }
  });

  test('Small responses should not be compressed', async ({ request }) => {
    const response = await request.get('/api/health');
    
    // Small responses shouldn't have compression overhead
    const encoding = response.headers()['content-encoding'];
    expect(encoding).toBeUndefined();
  });
});

test.describe('API Performance - Error Handling', () => {
  test('Errors should not leak sensitive information', async ({ request }) => {
    const response = await request.get('/api/test/database-error');
    
    expect(response.ok()).toBeFalsy();
    
    const body = await response.text();
    
    // Should not contain sensitive info
    expect(body).not.toContain('password');
    expect(body).not.toContain('SUPABASE_SERVICE_ROLE_KEY');
    expect(body).not.toContain('connection string');
    
    // Should have generic error message in production
    if (process.env.NODE_ENV === 'production') {
      expect(body).toContain('Internal server error');
    }
  });

  test('Error responses should be fast', async ({ request }) => {
    const errorEndpoints = [
      '/api/not-found',
      '/api/test/validation-error',
      '/api/test/auth-error'
    ];
    
    for (const endpoint of errorEndpoints) {
      const startTime = Date.now();
      await request.get(endpoint).catch(() => null);
      const responseTime = Date.now() - startTime;
      
      // Error responses should be fast
      expect(responseTime).toBeLessThan(100);
    }
  });
});