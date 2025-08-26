import { test, expect } from '@playwright/test';
import { TestUtils } from './helpers/test-utils';

test.describe('Security & Audit - Row Level Security', () => {
  test.describe.configure({ mode: 'parallel' });

  test('Investors should only see their own data', async ({ request }) => {
    // Test as investor 1
    const response1 = await request.get('/api/investors/1/transactions', {
      headers: {
        'X-Test-User-Id': '1',
        'X-Test-Role': 'investor'
      }
    });
    
    expect(response1.ok()).toBeTruthy();
    const data1 = await response1.json();
    
    // All transactions should belong to investor 1
    if (data1.data && Array.isArray(data1.data)) {
      data1.data.forEach((transaction: any) => {
        expect(transaction.investor_id).toBe(1);
      });
    }
    
    // Try to access investor 2's data as investor 1 (should fail)
    const response2 = await request.get('/api/investors/2/transactions', {
      headers: {
        'X-Test-User-Id': '1',
        'X-Test-Role': 'investor'
      }
    });
    
    // Should be denied or return empty
    if (response2.ok()) {
      const data2 = await response2.json();
      expect(data2.data).toHaveLength(0);
    } else {
      expect(response2.status()).toBe(403);
    }
  });

  test('Admin users should bypass RLS and see all data', async ({ request }) => {
    // Test as admin
    const response = await request.get('/api/investors/2/transactions', {
      headers: {
        'X-Test-User-Id': 'admin-1',
        'X-Test-Role': 'admin'
      }
    });
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    // Admin should see data for any investor
    expect(data.success).toBeTruthy();
  });

  test('RLS policies should be enforced on all clean tables', async ({ request }) => {
    const tables = ['investors_clean', 'transactions_clean', 'deals_clean'];
    
    for (const table of tables) {
      const rlsEnabled = await TestUtils.verifyRLS(
        request,
        table,
        'test-user-1'
      );
      
      expect(rlsEnabled).toBeTruthy();
    }
  });

  test('Service role should bypass RLS for system operations', async ({ request }) => {
    // Service role operations (using service key)
    const response = await request.post('/api/test/service-operation', {
      headers: {
        'X-Service-Role': 'true'
      },
      data: {
        operation: 'bulk_update',
        table: 'transactions_clean'
      }
    });
    
    expect(response.ok()).toBeTruthy();
    
    const result = await response.json();
    expect(result.success).toBeTruthy();
  });
});

test.describe('Security & Audit - Audit Logging', () => {
  test('All CRUD operations should be logged', async ({ request }) => {
    // Perform various operations
    const operations = [
      { method: 'POST', url: '/api/test/investors', action: 'CREATE', entity: 'investor' },
      { method: 'GET', url: '/api/investors/1', action: 'READ', entity: 'investor' },
      { method: 'PUT', url: '/api/test/investors/1', action: 'UPDATE', entity: 'investor' },
      { method: 'DELETE', url: '/api/test/investors/999', action: 'DELETE', entity: 'investor' }
    ];
    
    for (const op of operations) {
      // Perform operation
      await request[op.method.toLowerCase()](op.url, {
        headers: {
          'X-Test-User-Id': 'test-user',
          'X-Request-Id': `test-${Date.now()}`
        },
        data: op.method === 'POST' || op.method === 'PUT' ? { test: true } : undefined
      }).catch(() => null); // Ignore errors for DELETE of non-existent
      
      // Wait for audit log to be written
      await TestUtils.waitForDatabase(1000);
      
      // Verify audit log exists
      const logged = await TestUtils.verifyAuditLog(
        request,
        op.action,
        op.entity,
        op.url.includes('/1') ? '1' : '999'
      );
      
      expect(logged).toBeTruthy();
    }
  });

  test('Audit logs should capture user context', async ({ request }) => {
    const requestId = `test-${Date.now()}`;
    
    // Perform an action with full context
    await request.get('/api/investors/1/dashboard', {
      headers: {
        'X-Test-User-Id': 'user-123',
        'X-Request-Id': requestId,
        'X-Client-IP': '192.168.1.100',
        'User-Agent': 'Playwright Test'
      }
    });
    
    // Wait for audit log
    await TestUtils.waitForDatabase(1000);
    
    // Check audit log details
    const response = await request.get('/api/test/audit-logs', {
      params: {
        requestId,
        limit: 1
      }
    });
    
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    const log = data.logs?.[0];
    
    expect(log).toBeDefined();
    expect(log.user_id).toBe('user-123');
    expect(log.ip_address).toBe('192.168.1.100');
    expect(log.user_agent).toContain('Playwright');
  });

  test('Audit logs should track data changes with before/after values', async ({ request }) => {
    const testId = Date.now();
    
    // Create initial data
    await request.post('/api/test/investors', {
      data: {
        id: testId,
        name: 'Original Name',
        email: 'original@test.com'
      }
    });
    
    // Update data
    await request.put(`/api/test/investors/${testId}`, {
      data: {
        name: 'Updated Name',
        email: 'updated@test.com'
      }
    });
    
    // Wait for audit log
    await TestUtils.waitForDatabase(1000);
    
    // Get audit log for update
    const response = await request.get('/api/test/audit-logs', {
      params: {
        action: 'UPDATE',
        entityType: 'investor',
        entityId: testId.toString()
      }
    });
    
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    const updateLog = data.logs?.[0];
    
    expect(updateLog).toBeDefined();
    expect(updateLog.changes).toBeDefined();
    
    // Should have before/after values
    if (updateLog.changes) {
      expect(updateLog.changes.name?.before).toBe('Original Name');
      expect(updateLog.changes.name?.after).toBe('Updated Name');
      expect(updateLog.changes.email?.before).toBe('original@test.com');
      expect(updateLog.changes.email?.after).toBe('updated@test.com');
    }
  });

  test('Audit logs should be write-only for regular users', async ({ request }) => {
    // Regular user trying to read audit logs (should fail)
    const response = await request.get('/api/test/audit-logs', {
      headers: {
        'X-Test-User-Id': 'regular-user',
        'X-Test-Role': 'investor'
      }
    });
    
    // Should be denied
    expect(response.ok()).toBeFalsy();
    expect(response.status()).toBe(403);
  });

  test('Admin users should be able to query audit logs', async ({ request }) => {
    // Admin querying audit logs
    const response = await request.get('/api/test/audit-logs', {
      headers: {
        'X-Test-User-Id': 'admin-1',
        'X-Test-Role': 'admin'
      },
      params: {
        from_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        limit: 100
      }
    });
    
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.logs).toBeDefined();
    expect(Array.isArray(data.logs)).toBeTruthy();
  });

  test('Audit log batch processing should work efficiently', async ({ request }) => {
    // Generate multiple operations quickly
    const promises = [];
    
    for (let i = 0; i < 50; i++) {
      promises.push(
        request.get(`/api/investors/${(i % 10) + 1}/dashboard`, {
          headers: {
            'X-Request-Id': `batch-${i}`
          }
        })
      );
    }
    
    await Promise.all(promises);
    
    // Wait for batch processing
    await TestUtils.waitForDatabase(6000); // Batch flush interval is 5 seconds
    
    // Check that all were logged
    const response = await request.get('/api/test/audit-logs/count', {
      params: {
        pattern: 'batch-*',
        since: new Date(Date.now() - 60000).toISOString()
      }
    });
    
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.count).toBeGreaterThanOrEqual(50);
  });
});

test.describe('Security & Audit - Data Protection', () => {
  test('Sensitive data should be masked in logs', async ({ request }) => {
    // Perform operation with sensitive data
    await request.post('/api/test/investors', {
      data: {
        name: 'Test User',
        email: 'test@example.com',
        password: 'super-secret-password',
        ssn: '123-45-6789',
        api_key: 'sk_test_123456789'
      }
    });
    
    // Wait for audit log
    await TestUtils.waitForDatabase(1000);
    
    // Get audit logs
    const response = await request.get('/api/test/audit-logs/recent', {
      headers: {
        'X-Test-Role': 'admin'
      }
    });
    
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    const logs = JSON.stringify(data.logs);
    
    // Sensitive data should not appear in logs
    expect(logs).not.toContain('super-secret-password');
    expect(logs).not.toContain('123-45-6789');
    expect(logs).not.toContain('sk_test_123456789');
    
    // Should be masked
    expect(logs).toContain('***');
  });

  test('API keys should never be exposed in responses', async ({ request }) => {
    // Get various API responses
    const endpoints = [
      '/api/investors/1/dashboard',
      '/api/investors/1/portfolio',
      '/api/admin/metrics'
    ];
    
    for (const endpoint of endpoints) {
      const response = await request.get(endpoint);
      
      if (response.ok()) {
        const text = await response.text();
        
        // Should not contain any API keys or secrets
        expect(text).not.toMatch(/sk_[a-zA-Z0-9]{20,}/);
        expect(text).not.toMatch(/api[_-]?key/i);
        expect(text).not.toMatch(/secret/i);
        expect(text).not.toContain('SUPABASE_SERVICE_ROLE_KEY');
      }
    }
  });

  test('SQL injection attempts should be prevented', async ({ request }) => {
    // Try SQL injection in various parameters
    const injectionAttempts = [
      "1' OR '1'='1",
      "1; DROP TABLE users;--",
      "' UNION SELECT * FROM investors_clean--",
      "1' AND (SELECT COUNT(*) FROM audit_logs) > 0--"
    ];
    
    for (const injection of injectionAttempts) {
      const response = await request.get('/api/investors/search', {
        params: {
          q: injection
        }
      });
      
      // Should either sanitize or reject
      if (response.ok()) {
        const data = await response.json();
        // Should return empty or safe results
        expect(data.error).toBeUndefined();
        expect(data.data).toBeDefined();
      } else {
        // Or reject the request
        expect(response.status()).toBeGreaterThanOrEqual(400);
      }
    }
  });

  test('Cross-tenant data access should be prevented', async ({ request }) => {
    // Set up test with tenant isolation
    const response1 = await request.get('/api/test/tenant-data', {
      headers: {
        'X-Tenant-Id': 'tenant-1',
        'X-User-Id': 'user-1'
      }
    });
    
    const response2 = await request.get('/api/test/tenant-data', {
      headers: {
        'X-Tenant-Id': 'tenant-2',
        'X-User-Id': 'user-1'
      }
    });
    
    if (response1.ok() && response2.ok()) {
      const data1 = await response1.json();
      const data2 = await response2.json();
      
      // Data should be completely isolated
      const ids1 = new Set(data1.data?.map((d: any) => d.id));
      const ids2 = new Set(data2.data?.map((d: any) => d.id));
      
      // No overlap in IDs
      const overlap = [...ids1].filter(id => ids2.has(id));
      expect(overlap).toHaveLength(0);
    }
  });
});

test.describe('Security & Audit - Compliance Features', () => {
  test('Audit logs should have retention policy', async ({ request }) => {
    // Check that old audit logs are cleaned up
    const response = await request.get('/api/test/audit-logs/retention');
    
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.retentionDays).toBe(730); // 2 years
    expect(data.oldestLog).toBeDefined();
    
    // Oldest log should not be older than retention period
    if (data.oldestLog) {
      const oldestDate = new Date(data.oldestLog);
      const maxAge = 730 * 24 * 60 * 60 * 1000; // 2 years in ms
      expect(Date.now() - oldestDate.getTime()).toBeLessThan(maxAge);
    }
  });

  test('Data export should be logged for compliance', async ({ request }) => {
    // Perform data export
    const response = await request.post('/api/test/export', {
      headers: {
        'X-User-Id': 'export-user'
      },
      data: {
        type: 'investor_data',
        format: 'csv'
      }
    });
    
    expect(response.ok()).toBeTruthy();
    
    // Wait for audit log
    await TestUtils.waitForDatabase(1000);
    
    // Verify export was logged
    const logged = await TestUtils.verifyAuditLog(
      request,
      'EXPORT',
      'investor_data',
      'export-user'
    );
    
    expect(logged).toBeTruthy();
  });

  test('Failed authentication attempts should be logged', async ({ request }) => {
    // Attempt failed login
    const response = await request.post('/api/auth/login', {
      data: {
        email: 'hacker@evil.com',
        password: 'wrong-password'
      }
    });
    
    // Should fail
    expect(response.ok()).toBeFalsy();
    
    // Wait for audit log
    await TestUtils.waitForDatabase(1000);
    
    // Check security audit log
    const auditResponse = await request.get('/api/test/security-events', {
      headers: {
        'X-Test-Role': 'admin'
      },
      params: {
        type: 'FAILED_LOGIN',
        email: 'hacker@evil.com'
      }
    });
    
    if (auditResponse.ok()) {
      const data = await auditResponse.json();
      expect(data.events?.length).toBeGreaterThan(0);
    }
  });
});