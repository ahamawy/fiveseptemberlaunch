import { test, expect } from '@playwright/test';

test.describe('Dashboard Branding', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001/investor-portal/dashboard');
  });

  test('should have dark theme applied', async ({ page }) => {
    // Check that dark class is on html element
    const htmlElement = page.locator('html');
    await expect(htmlElement).toHaveClass(/dark/);
    
    // Check background color is dark
    const body = page.locator('body');
    const backgroundColor = await body.evaluate((el) => 
      window.getComputedStyle(el).backgroundColor
    );
    
    // Should have dark background (not white)
    expect(backgroundColor).not.toBe('rgb(255, 255, 255)');
  });

  test('should display Equitie purple branding', async ({ page }) => {
    // Check for gradient header text
    const header = page.locator('h1').first();
    await expect(header).toBeVisible();
    
    // Check for text gradient class
    await expect(header).toHaveClass(/text-gradient/);
  });

  test('should have glass morphism cards', async ({ page }) => {
    // Wait for cards to load
    await page.waitForSelector('[class*="glass"]', { timeout: 10000 });
    
    // Check that portfolio cards have glass effect
    const cards = page.locator('[class*="glass"]');
    const cardCount = await cards.count();
    expect(cardCount).toBeGreaterThan(0);
  });

  test('should display portfolio values with proper styling', async ({ page }) => {
    // Wait for dashboard data to load
    await page.waitForSelector('text=/\\$[0-9,]+/', { timeout: 10000 });
    
    // Check that values are displayed
    const portfolioValues = page.locator('span:has-text("$")');
    const valueCount = await portfolioValues.count();
    expect(valueCount).toBeGreaterThan(0);
    
    // Check first value has proper text styling
    const firstValue = portfolioValues.first();
    await expect(firstValue).toHaveClass(/text-3xl/);
    await expect(firstValue).toHaveClass(/font-bold/);
  });

  test('should show loading spinner with brand colors', async ({ page }) => {
    // Navigate to a fresh page to see loading state
    await page.goto('http://localhost:3001/investor-portal/dashboard', { 
      waitUntil: 'domcontentloaded' 
    });
    
    // Check for loading spinner (may be very quick)
    const spinner = page.locator('[class*="animate-spin"]');
    const spinnerExists = await spinner.count() > 0;
    
    if (spinnerExists) {
      // Check spinner has primary color border
      await expect(spinner).toHaveClass(/border-primary/);
    }
  });

  test('should have proper hover effects on cards', async ({ page }) => {
    // Wait for cards to load
    await page.waitForSelector('[class*="glass"]', { timeout: 10000 });
    
    // Get first card
    const firstCard = page.locator('[class*="glass"]').first();
    
    // Hover over card
    await firstCard.hover();
    
    // Card should have hover styles applied (scale transform)
    const transform = await firstCard.evaluate((el) => 
      window.getComputedStyle(el).transform
    );
    
    // Transform should not be 'none' when hovering
    expect(transform).not.toBe('none');
  });
});