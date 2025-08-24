import { test, expect } from '@playwright/test';

test.describe('Quick Health Check - Critical Paths', () => {
  const BASE_URL = 'http://localhost:3000';
  
  test('Homepage loads', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page).toHaveURL(BASE_URL + '/');
    // Check for new motion-driven homepage content
    await expect(page.getByText(/Private Markets/i)).toBeVisible({ timeout: 5000 });
  });
  
  test('Investor Dashboard with real data', async ({ page }) => {
    await page.goto(`${BASE_URL}/investor-portal/dashboard`);
    
    // Wait for API data to load
    await page.waitForResponse('**/api/investors/1/dashboard');
    
    // Check for key metrics
    await expect(page.getByText(/Portfolio Value/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/Total Invested/i)).toBeVisible({ timeout: 5000 });
  });
  
  test('Investor Portfolio page', async ({ page }) => {
    await page.goto(`${BASE_URL}/investor-portal/portfolio`);
    
    // Wait for API data
    await page.waitForResponse('**/api/investors/1/portfolio');
    
    // Check for portfolio content
    await expect(page.getByText(/Portfolio Overview/i)).toBeVisible({ timeout: 5000 });
  });
  
  test('Investor Transactions page', async ({ page }) => {
    await page.goto(`${BASE_URL}/investor-portal/transactions`);
    
    // Wait for API data
    await page.waitForResponse('**/api/investors/1/transactions');
    
    // Check for transactions content
    await expect(page.getByText(/Transaction History/i)).toBeVisible({ timeout: 5000 });
  });
  
  test('Investor Profile page', async ({ page }) => {
    await page.goto(`${BASE_URL}/investor-portal/profile`);
    
    // Wait for API data
    await page.waitForResponse('**/api/investors/1');
    
    // Check for profile content
    await expect(page.getByText(/Profile & Settings/i)).toBeVisible({ timeout: 5000 });
  });
  
  test('Navigation between pages', async ({ page }) => {
    // Start at dashboard
    await page.goto(`${BASE_URL}/investor-portal/dashboard`);
    await expect(page.getByText(/Welcome back/i)).toBeVisible({ timeout: 5000 });
    
    // Navigate to Portfolio
    await page.getByRole('link', { name: 'Portfolio' }).click();
    await expect(page).toHaveURL(/.*portfolio/);
    
    // Navigate to Transactions
    await page.getByRole('link', { name: 'Transactions' }).click();
    await expect(page).toHaveURL(/.*transactions/);
    
    // Navigate to Profile
    await page.getByRole('link', { name: 'Profile' }).click();
    await expect(page).toHaveURL(/.*profile/);
  });
  
  test('API endpoints return valid data', async ({ request }) => {
    // Test dashboard API
    const dashboard = await request.get(`${BASE_URL}/api/investors/1/dashboard`);
    expect(dashboard.ok()).toBeTruthy();
    const dashboardData = await dashboard.json();
    expect(dashboardData).toHaveProperty('portfolio');
    expect(dashboardData.portfolio).toHaveProperty('totalValue');
    
    // Test portfolio API
    const portfolio = await request.get(`${BASE_URL}/api/investors/1/portfolio`);
    expect(portfolio.ok()).toBeTruthy();
    const portfolioData = await portfolio.json();
    expect(portfolioData).toHaveProperty('deals');
    
    // Test transactions API
    const transactions = await request.get(`${BASE_URL}/api/investors/1/transactions`);
    expect(transactions.ok()).toBeTruthy();
    const transactionsData = await transactions.json();
    expect(transactionsData).toHaveProperty('transactions');
  });
  
  test('Check for console errors', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // Ignore known React dev warnings
        if (!text.includes('Warning:') && !text.includes('DevTools')) {
          errors.push(text);
        }
      }
    });
    
    await page.goto(`${BASE_URL}/investor-portal/dashboard`);
    await page.waitForTimeout(2000); // Wait for any lazy-loaded errors
    
    expect(errors).toHaveLength(0);
  });
});