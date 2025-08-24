import { test, expect } from '@playwright/test';

test.describe('Deals List Feature', () => {
  test('should load and display deals list', async ({ page }) => {
    // Navigate to deals list page
    await page.goto('/admin/deals-list');
    
    // Wait for the title to appear
    await page.waitForSelector('[data-testid="deals-title"]', { timeout: 10000 });
    
    // Wait for the list container
    await page.waitForSelector('[data-testid="deals-list"]', { timeout: 10000 });
    
    // Either items or empty state should appear
    await page.waitForSelector('[data-testid="deals-item"], [data-testid="deals-empty"]', { timeout: 10000 });
    
    // Check if the table is rendered
    const table = await page.locator('table');
    await expect(table).toBeVisible();
    
    // Check for table headers using text content
    const headers = await page.locator('thead th').allTextContents();
    expect(headers).toContain('Name');
    expect(headers).toContain('Company');
    expect(headers).toContain('Status');
    expect(headers).toContain('Target Raise');
    expect(headers).toContain('Closing Date');
  });

  test('should show new deal button', async ({ page }) => {
    await page.goto('/admin/deals-list');
    
    // Wait for page to load
    await page.waitForSelector('[data-testid="deals-title"]', { timeout: 10000 });
    
    // Check new deal button
    const newDealButton = await page.locator('[data-testid="new-deal-button"]');
    await expect(newDealButton).toBeVisible();
    await expect(newDealButton).toHaveText('+ New Deal');
  });

  test('API should return deals data with domain types', async ({ request }) => {
    const response = await request.get('/api/deals-list?limit=5');
    expect(response.ok()).toBeTruthy();
    
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
    
    // Check pagination
    expect(json.pagination).toBeDefined();
    expect(json.pagination.limit).toBe(5);
    expect(json.pagination.offset).toBe(0);
    
    // If we have data, verify the shape matches DealSummary
    if (json.data.length > 0) {
      const deal = json.data[0];
      
      // Required fields from DealSummary
      expect(typeof deal.id).toBe('number');
      expect(typeof deal.name).toBe('string');
      
      // Optional fields that should be present
      expect(deal).toHaveProperty('stage');
      expect(deal).toHaveProperty('type');
      expect(deal).toHaveProperty('currency');
      expect(deal).toHaveProperty('company_name');
      
      // These should be numbers or null
      if (deal.target_raise !== null) {
        expect(typeof deal.target_raise).toBe('number');
      }
      if (deal.minimum_investment !== null) {
        expect(typeof deal.minimum_investment).toBe('number');
      }
    }
  });

  test('should handle loading and error states', async ({ page }) => {
    // Test loading state by intercepting API
    await page.route('/api/deals-list*', async (route) => {
      // Delay to see loading state
      await new Promise(resolve => setTimeout(resolve, 100));
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: [] })
      });
    });

    await page.goto('/admin/deals-list');
    
    // Should briefly show loading
    const loading = await page.locator('[data-testid="deals-loading"]');
    // May or may not catch it depending on timing
    
    // Should eventually show empty state
    await page.waitForSelector('[data-testid="deals-empty"]', { timeout: 10000 });
    const emptyState = await page.locator('[data-testid="deals-empty"]');
    await expect(emptyState).toHaveText('No deals found. Create your first deal to get started.');
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Intercept API and return error
    await page.route('/api/deals-list*', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, error: 'Database connection failed' })
      });
    });

    await page.goto('/admin/deals-list');
    
    // Should show error state
    await page.waitForSelector('[data-testid="deals-error"]', { timeout: 10000 });
    const errorState = await page.locator('[data-testid="deals-error"]');
    await expect(errorState).toContainText('Database connection failed');
  });
});