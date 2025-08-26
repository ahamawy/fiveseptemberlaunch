const { test, expect } = require('@playwright/test');

test.describe('Critical System Health', () => {
  test('API endpoints are accessible', async ({ request }) => {
    const endpoints = [
      '/api/deals',
      '/api/companies',
      '/api/investors/4baa0ed0-5d62-448e-9072-2a4fc9e7e3e5/dashboard',
      '/api/investors/4baa0ed0-5d62-448e-9072-2a4fc9e7e3e5/portfolio'
    ];
    
    for (const endpoint of endpoints) {
      const res = await request.get(endpoint);
      console.log(`${endpoint}: ${res.status()}`);
      expect(res.status()).toBeLessThan(500);
    }
  });
  
  test('Pages load without errors', async ({ page }) => {
    const pages = [
      '/',
      '/investor-portal/dashboard',
      '/investor-portal/portfolio',
      '/admin/dashboard'
    ];
    
    for (const path of pages) {
      await page.goto(path);
      const title = await page.title();
      console.log(`${path}: ${title}`);
      expect(title).toBeTruthy();
    }
  });
});
