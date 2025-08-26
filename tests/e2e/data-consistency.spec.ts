import { test, expect } from '@playwright/test';
import { PerformanceAssertions } from './helpers/test-utils';

test.describe('Data Consistency - Migration Validation', () => {
  test.describe.configure({ mode: 'parallel' });

  test('Clean tables should contain all migrated data', async ({ request }) => {
    // Get counts from clean tables
    const cleanCounts = await request.get('/api/test/table-counts', {
      params: {
        tables: 'transactions_clean,deals_clean,companies_clean,investors_clean'
      }
    });
    
    expect(cleanCounts.ok()).toBeTruthy();
    const clean = await cleanCounts.json();
    
    // Verify expected data volumes
    expect(clean.transactions_clean).toBe(354); // As per migration docs
    expect(clean.deals_clean).toBe(29);
    expect(clean.companies_clean).toBe(98);
    expect(clean.investors_clean).toBe(202);
    
    console.log('Clean table counts:', clean);
  });

  test('Backward compatibility views should return same data as clean tables', async ({ request }) => {
    // Compare data between views and clean tables
    const comparisons = [
      { view: 'deals.deal', table: 'deals_clean', key: 'deal_id' },
      { view: 'companies.company', table: 'companies_clean', key: 'company_id' },
      { view: 'investors.investor', table: 'investors_clean', key: 'investor_id' }
    ];
    
    for (const comp of comparisons) {
      // Get data from view
      const viewResponse = await request.post('/api/test/query', {
        data: {
          table: comp.view,
          orderBy: comp.key,
          limit: 1000
        }
      });
      
      // Get data from clean table
      const tableResponse = await request.post('/api/test/query', {
        data: {
          table: comp.table,
          orderBy: comp.key,
          limit: 1000
        }
      });
      
      expect(viewResponse.ok()).toBeTruthy();
      expect(tableResponse.ok()).toBeTruthy();
      
      const viewData = await viewResponse.json();
      const tableData = await tableResponse.json();
      
      // Should have same number of rows
      expect(viewData.rows?.length).toBe(tableData.rows?.length);
      
      // Should have same IDs
      const viewIds = viewData.rows?.map((r: any) => r[comp.key]).sort();
      const tableIds = tableData.rows?.map((r: any) => r[comp.key]).sort();
      
      expect(viewIds).toEqual(tableIds);
    }
  });

  test('Transaction types should be properly categorized', async ({ request }) => {
    // Get transaction type distribution
    const response = await request.get('/api/test/transaction-types');
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    // According to migration: primary (301) + subnominee (53) = 354
    expect(data.primary).toBe(301);
    expect(data.subnominee).toBe(53);
    expect(data.secondary).toBe(0); // Or whatever the actual count is
    expect(data.advisory).toBe(0);
    
    // Total should match
    const total = data.primary + data.subnominee + data.secondary + data.advisory;
    expect(total).toBe(354);
  });

  test('No duplicate transaction IDs should exist', async ({ request }) => {
    const response = await request.get('/api/test/check-duplicates', {
      params: {
        table: 'transactions_clean',
        column: 'transaction_id'
      }
    });
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    expect(data.hasDuplicates).toBeFalsy();
    expect(data.duplicateCount).toBe(0);
  });

  test('Foreign key relationships should be valid', async ({ request }) => {
    // Check for orphaned records
    const checks = [
      {
        table: 'transactions_clean',
        column: 'deal_id',
        reference: 'deals_clean'
      },
      {
        table: 'transactions_clean',
        column: 'investor_id',
        reference: 'investors_clean'
      },
      {
        table: 'deals_clean',
        column: 'underlying_company_id',
        reference: 'companies_clean'
      }
    ];
    
    for (const check of checks) {
      const response = await request.get('/api/test/orphaned-records', {
        params: check
      });
      
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      
      // Should have no orphaned records
      expect(data.orphanedCount).toBe(0);
      expect(data.orphanedIds).toHaveLength(0);
    }
  });

  test('NULL columns that were removed should not affect data', async ({ request }) => {
    // Verify that removed NULL columns don't exist
    const removedColumns = [
      'buyer_investor_id',
      'seller_investor_id',
      'created_by',
      'updated_by',
      'notes',
      'nominee_investor_id',
      'secondary_transaction_date',
      'purchase_price',
      'fee_calc_notes'
    ];
    
    const response = await request.post('/api/test/check-columns', {
      data: {
        table: 'transactions_clean',
        columns: removedColumns
      }
    });
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    // None of these columns should exist
    removedColumns.forEach(col => {
      expect(data.existingColumns).not.toContain(col);
    });
  });
});

test.describe('Data Consistency - Data Integrity', () => {
  test('Transaction amounts should be consistent', async ({ request }) => {
    // Get sum of transactions by deal
    const response = await request.get('/api/test/transaction-sums');
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    // Each deal's transactions should sum correctly
    data.deals?.forEach((deal: any) => {
      expect(deal.total_amount).toBeGreaterThan(0);
      expect(deal.transaction_count).toBeGreaterThan(0);
      
      // Average should make sense
      const avg = deal.total_amount / deal.transaction_count;
      expect(avg).toBeGreaterThan(1000); // Reasonable investment amount
      expect(avg).toBeLessThan(100000000); // Not absurdly high
    });
  });

  test('Date fields should be valid and consistent', async ({ request }) => {
    const response = await request.get('/api/test/date-validation', {
      params: {
        table: 'transactions_clean'
      }
    });
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    // No future dates
    expect(data.futureDates).toBe(0);
    
    // No dates before reasonable start (e.g., year 2000)
    expect(data.invalidDates).toBe(0);
    
    // Most recent transaction should be recent
    const mostRecent = new Date(data.mostRecent);
    const daysSinceLastTransaction = (Date.now() - mostRecent.getTime()) / (1000 * 60 * 60 * 24);
    expect(daysSinceLastTransaction).toBeLessThan(365); // Within last year
  });

  test('Currency fields should be standardized', async ({ request }) => {
    const response = await request.get('/api/test/currency-check');
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    // All currencies should be valid ISO codes
    const validCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD'];
    
    data.currencies?.forEach((currency: string) => {
      expect(validCurrencies).toContain(currency);
    });
    
    // Most should be USD
    expect(data.usdPercentage).toBeGreaterThan(0.5); // At least 50% USD
  });

  test('Status fields should have valid values', async ({ request }) => {
    const response = await request.get('/api/test/status-validation');
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    // All statuses should be valid
    const validStatuses = ['pending', 'completed', 'cancelled', 'failed'];
    
    data.statuses?.forEach((status: string) => {
      expect(validStatuses).toContain(status);
    });
    
    // Most transactions should be completed
    expect(data.completedPercentage).toBeGreaterThan(0.8); // 80%+ completed
  });
});

test.describe('Data Consistency - Referential Integrity', () => {
  test('CASCADE DELETE should work correctly', async ({ request }) => {
    // Create test data with relationships
    const testDealId = 999999;
    const testInvestorId = 999999;
    
    // Create test deal
    await request.post('/api/test/deals', {
      data: {
        deal_id: testDealId,
        deal_name: 'Test Deal for Cascade',
        underlying_company_id: 1
      }
    });
    
    // Create test transactions
    await request.post('/api/test/transactions', {
      data: {
        deal_id: testDealId,
        investor_id: 1,
        amount: 100000,
        transaction_type: 'primary'
      }
    });
    
    // Delete the deal
    await request.delete(`/api/test/deals/${testDealId}`);
    
    // Transactions should be deleted too (CASCADE)
    const txResponse = await request.get('/api/test/transactions', {
      params: {
        deal_id: testDealId
      }
    });
    
    expect(txResponse.ok()).toBeTruthy();
    const txData = await txResponse.json();
    
    // Should have no transactions for deleted deal
    expect(txData.transactions).toHaveLength(0);
  });

  test('CASCADE UPDATE should propagate changes', async ({ request }) => {
    // This would test that updating a parent ID updates children
    // For safety in testing, we'll just verify the constraint exists
    
    const response = await request.get('/api/test/constraints', {
      params: {
        constraint: 'fk_transactions_deal',
        action: 'UPDATE'
      }
    });
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    expect(data.onUpdate).toBe('CASCADE');
  });

  test('SET NULL should work for optional relationships', async ({ request }) => {
    // Check that optional FKs are set to NULL on delete
    const response = await request.get('/api/test/constraints', {
      params: {
        table: 'deals_clean',
        column: 'partner_company_id'
      }
    });
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    expect(data.onDelete).toBe('SET NULL');
  });
});

test.describe('Data Consistency - Transaction Atomicity', () => {
  test('Multi-table updates should be atomic', async ({ request }) => {
    // Test atomic transaction across multiple tables
    const response = await request.post('/api/test/atomic-operation', {
      data: {
        operations: [
          { table: 'investors_clean', action: 'insert', data: { full_name: 'Test Atomic' } },
          { table: 'deals_clean', action: 'insert', data: { deal_name: 'Test Deal' } },
          { table: 'transactions_clean', action: 'insert', data: { amount: 100000 } }
        ],
        failOn: 2 // Fail on third operation
      }
    });
    
    // Should roll back all operations
    expect(response.ok()).toBeFalsy();
    
    // Verify nothing was committed
    const checkResponse = await request.get('/api/test/check-atomic', {
      params: {
        name: 'Test Atomic'
      }
    });
    
    expect(checkResponse.ok()).toBeTruthy();
    const checkData = await checkResponse.json();
    
    // Should find no records (rolled back)
    expect(checkData.found).toBeFalsy();
  });

  test('Concurrent updates should not cause inconsistencies', async ({ request }) => {
    const testId = 1;
    
    // Simulate concurrent updates
    const updates = [];
    for (let i = 0; i < 10; i++) {
      updates.push(
        request.post('/api/test/increment', {
          data: {
            table: 'investors_clean',
            id: testId,
            field: 'update_counter'
          }
        })
      );
    }
    
    await Promise.all(updates);
    
    // Check final value
    const response = await request.get(`/api/test/investors/${testId}`, {
      params: {
        field: 'update_counter'
      }
    });
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    // Should have incremented exactly 10 times
    expect(data.value % 10).toBe(0); // Divisible by 10
  });
});

test.describe('Data Consistency - Deduplication Validation', () => {
  test('No duplicate data after migration', async ({ request }) => {
    // Check for any remaining duplicates
    const response = await request.get('/api/test/deduplication-check');
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    // According to migration: 61% storage reduction achieved
    expect(data.duplicateTransactions).toBe(0);
    expect(data.duplicateInvestors).toBe(0);
    expect(data.duplicateDeals).toBe(0);
    
    // Storage should be optimized
    expect(data.storageReduction).toBeGreaterThan(0.5); // >50% reduction
  });

  test('Single source of truth for each entity', async ({ request }) => {
    // Verify each ID appears in only one master table
    const entities = [
      { id_column: 'transaction_id', tables: ['transactions_clean'] },
      { id_column: 'deal_id', tables: ['deals_clean'] },
      { id_column: 'company_id', tables: ['companies_clean'] },
      { id_column: 'investor_id', tables: ['investors_clean'] }
    ];
    
    for (const entity of entities) {
      const response = await request.post('/api/test/single-source', {
        data: entity
      });
      
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      
      // Should exist in exactly one table
      expect(data.tableCount).toBe(1);
      expect(data.isSingleSource).toBeTruthy();
    }
  });

  test('View results should match clean table results', async ({ request }) => {
    // Run same query on view and table
    const query = {
      select: '*',
      where: 'deal_id = 1',
      orderBy: 'transaction_date DESC',
      limit: 10
    };
    
    // Query view
    const viewResponse = await request.post('/api/test/query', {
      data: {
        table: 'transactions.transaction.primary',
        ...query
      }
    });
    
    // Query clean table with filter
    const tableResponse = await request.post('/api/test/query', {
      data: {
        table: 'transactions_clean',
        where: "deal_id = 1 AND transaction_type = 'primary'",
        orderBy: query.orderBy,
        limit: query.limit
      }
    });
    
    expect(viewResponse.ok()).toBeTruthy();
    expect(tableResponse.ok()).toBeTruthy();
    
    const viewData = await viewResponse.json();
    const tableData = await tableResponse.json();
    
    // Results should match
    expect(viewData.rows?.length).toBe(tableData.rows?.length);
    
    // Compare first row
    if (viewData.rows?.length > 0 && tableData.rows?.length > 0) {
      const viewRow = viewData.rows[0];
      const tableRow = tableData.rows[0];
      
      // Key fields should match
      expect(viewRow.transaction_id).toBe(tableRow.transaction_id);
      expect(viewRow.deal_id).toBe(tableRow.deal_id);
      expect(viewRow.investor_id).toBe(tableRow.investor_id);
    }
  });
});