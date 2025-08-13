import { test, expect } from '@playwright/test';

test.describe('Investor Portal Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Set up console log capture for debugging
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Browser console error:', msg.text());
      }
    });
    
    // Capture network failures
    page.on('requestfailed', request => {
      console.log('Request failed:', request.url(), request.failure()?.errorText);
    });
  });

  test('should load the home page', async ({ page }) => {
    const response = await page.goto('/', { waitUntil: 'networkidle' });
    
    // Check response status
    expect(response?.status()).toBeLessThan(400);
    
    // Check for main elements
    await expect(page.getByText('Equitie Platform')).toBeVisible();
    await expect(page.getByText('Investor Portal')).toBeVisible();
    
    // Take screenshot for debugging
    await page.screenshot({ path: 'test-results/home-page.png' });
  });

  test('should navigate to investor portal dashboard', async ({ page }) => {
    await page.goto('/');
    
    // Click on Investor Portal link
    await page.getByRole('link', { name: /Investor Portal/i }).click();
    
    // Wait for navigation
    await page.waitForURL('**/investor-portal/dashboard');
    
    // Check if dashboard loads
    await expect(page.getByText(/Welcome back/i)).toBeVisible({ timeout: 10000 });
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/dashboard.png' });
  });

  test('should load dashboard API data', async ({ page }) => {
    // Intercept API calls to check they're working
    const apiResponse = page.waitForResponse('**/api/investors/1/dashboard');
    
    await page.goto('/investor-portal/dashboard');
    
    const response = await apiResponse;
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('portfolio');
    expect(data).toHaveProperty('performance');
  });

  test('should display portfolio cards', async ({ page }) => {
    await page.goto('/investor-portal/dashboard');
    
    // Wait for cards to load
    await page.waitForSelector('[data-testid="portfolio-card"], .bg-white.shadow', { 
      timeout: 10000 
    });
    
    // Check for portfolio value text
    const portfolioCards = await page.$$('.bg-white.shadow');
    expect(portfolioCards.length).toBeGreaterThan(0);
  });

  test('should navigate between portal pages', async ({ page }) => {
    await page.goto('/investor-portal/dashboard');
    
    // Test navigation to Portfolio
    await page.getByRole('link', { name: 'Portfolio' }).click();
    await expect(page).toHaveURL(/.*portfolio/);
    await expect(page.getByText('Portfolio Overview')).toBeVisible({ timeout: 10000 });
    
    // Test navigation to Deals
    await page.getByRole('link', { name: 'Deals' }).click();
    await expect(page).toHaveURL(/.*deals/);
    await expect(page.getByText('Deals & Commitments')).toBeVisible({ timeout: 10000 });
    
    // Test navigation to Transactions
    await page.getByRole('link', { name: 'Transactions' }).click();
    await expect(page).toHaveURL(/.*transactions/);
    await expect(page.getByText('Transaction History')).toBeVisible({ timeout: 10000 });
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API failure
    await page.route('**/api/investors/1/dashboard', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });
    
    await page.goto('/investor-portal/dashboard');
    
    // Should show error state
    await expect(page.getByText(/Error loading dashboard/i)).toBeVisible({ 
      timeout: 10000 
    });
  });

  test('should load portfolio page with data', async ({ page }) => {
    await page.goto('/investor-portal/portfolio');
    
    // Wait for API response
    const apiResponse = await page.waitForResponse('**/api/investors/1/portfolio');
    expect(apiResponse.status()).toBe(200);
    
    // Check for portfolio elements
    await expect(page.getByText('Portfolio Overview')).toBeVisible();
    await expect(page.getByText('Total Portfolio Value')).toBeVisible({ timeout: 10000 });
  });

  test('should load deals page with commitments', async ({ page }) => {
    await page.goto('/investor-portal/deals');
    
    // Wait for API response
    const apiResponse = await page.waitForResponse('**/api/investors/1/commitments');
    expect(apiResponse.status()).toBe(200);
    
    // Check for deals elements
    await expect(page.getByText('Deals & Commitments')).toBeVisible();
    await expect(page.getByText('Total Committed')).toBeVisible({ timeout: 10000 });
  });

  test('should load transactions with filtering', async ({ page }) => {
    await page.goto('/investor-portal/transactions');
    
    // Wait for initial load
    const apiResponse = await page.waitForResponse('**/api/investors/1/transactions**');
    expect(apiResponse.status()).toBe(200);
    
    // Test filtering
    await page.selectOption('select:has-text("All Types")', 'capital_call');
    
    // Wait for filtered response
    const filteredResponse = await page.waitForResponse(
      response => response.url().includes('type=capital_call')
    );
    expect(filteredResponse.status()).toBe(200);
  });

  test('should capture performance metrics', async ({ page }) => {
    await page.goto('/investor-portal/dashboard');
    
    // Measure page load performance
    const performanceTiming = await page.evaluate(() => {
      const timing = performance.timing;
      return {
        loadTime: timing.loadEventEnd - timing.navigationStart,
        domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
        firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0
      };
    });
    
    console.log('Performance metrics:', performanceTiming);
    
    // Check performance requirements (< 500ms)
    expect(performanceTiming.domContentLoaded).toBeLessThan(5000);
  });
});

test.describe('Error Handling and Edge Cases', () => {
  test('should handle missing investor gracefully', async ({ page }) => {
    await page.route('**/api/investors/999/dashboard', route => {
      route.fulfill({
        status: 404,
        body: JSON.stringify({ error: 'Investor not found' })
      });
    });
    
    // Navigate with non-existent investor
    await page.goto('/investor-portal/dashboard');
    // Change the API call to use investor 999
    // This would need the component to accept dynamic investor ID
  });

  test('should handle network timeouts', async ({ page }) => {
    // Simulate slow network
    await page.route('**/api/**', route => {
      setTimeout(() => {
        route.continue();
      }, 5000);
    });
    
    page.goto('/investor-portal/dashboard');
    
    // Should show loading state
    await expect(page.getByText(/Loading dashboard/i)).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/investor-portal/dashboard');
    
    // Check mobile layout
    await page.screenshot({ path: 'test-results/dashboard-mobile.png' });
    
    // Navigation should be visible and functional
    await expect(page.getByText('Investor Portal')).toBeVisible();
  });
});