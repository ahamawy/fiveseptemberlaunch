import { test, expect } from '@playwright/test';

test.describe('Deals List Feature', () => {
  test('should load and display deals list', async ({ page }) => {
    // Navigate to deals list page
    await page.goto('/admin/deals-list');
    
    // Wait for the component to load
    await page.waitForSelector('h2:has-text("Deals")', { timeout: 10000 });
    
    // Check if the table is rendered
    const table = await page.locator('table');
    await expect(table).toBeVisible();
    
    // Check for table headers
    await expect(page.locator('th:has-text("Name")')).toBeVisible();
    await expect(page.locator('th:has-text("Company")')).toBeVisible();
    await expect(page.locator('th:has-text("Status")')).toBeVisible();
    await expect(page.locator('th:has-text("Total Funding")')).toBeVisible();
  });

  test('should show new deal button', async ({ page }) => {
    await page.goto('/admin/deals-list');
    
    const newDealButton = await page.locator('button:has-text("+ New Deal")');
    await expect(newDealButton).toBeVisible();
  });

  test('API should return deals data', async ({ request }) => {
    const response = await request.get('/api/deals-list?limit=5');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data).toHaveProperty('data');
    expect(data).toHaveProperty('pagination');
  });
});