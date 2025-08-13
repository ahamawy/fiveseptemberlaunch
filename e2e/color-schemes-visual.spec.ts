import { test, expect } from '@playwright/test';

test.describe('Visual Color Scheme Testing', () => {
  test('Color schemes apply to UI elements correctly', async ({ page }) => {
    await page.goto('/style-guide');
    await page.waitForLoadState('networkidle');
    
    // Test Blue scheme
    await page.click('button:has-text("Blue")');
    await page.waitForTimeout(1000);
    
    // Check that the Overview button (active) has the blue color
    const overviewButton = await page.locator('button:has-text("Overview")').first();
    const overviewBg = await overviewButton.evaluate((el) => 
      window.getComputedStyle(el).backgroundColor
    );
    console.log('Blue scheme - Overview button bg:', overviewBg);
    
    // Check primary heading color
    const heading = await page.locator('h1').first();
    const headingColor = await heading.evaluate((el) => 
      window.getComputedStyle(el).color
    );
    console.log('Blue scheme - Heading color:', headingColor);
    
    // Test Green scheme
    await page.click('button:has-text("Green")');
    await page.waitForTimeout(1000);
    
    const overviewBgGreen = await overviewButton.evaluate((el) => 
      window.getComputedStyle(el).backgroundColor
    );
    console.log('Green scheme - Overview button bg:', overviewBgGreen);
    
    // Test Monochrome scheme
    await page.click('button:has-text("Mono")');
    await page.waitForTimeout(1000);
    
    const overviewBgMono = await overviewButton.evaluate((el) => 
      window.getComputedStyle(el).backgroundColor
    );
    console.log('Monochrome scheme - Overview button bg:', overviewBgMono);
    
    // Verify colors are different
    expect(overviewBg).not.toBe(overviewBgGreen);
    expect(overviewBg).not.toBe(overviewBgMono);
    expect(overviewBgGreen).not.toBe(overviewBgMono);
  });
  
  test('Check color scheme on investor portal', async ({ page }) => {
    await page.goto('/investor-portal/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Set blue scheme
    await page.evaluate(() => {
      localStorage.setItem('equitie-color-scheme', 'blue');
    });
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Check that primary elements use blue color
    const primaryColor = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).getPropertyValue('--primary-300');
    });
    
    console.log('Dashboard with blue scheme - Primary color:', primaryColor);
    expect(primaryColor.trim()).toBe('96 165 250'); // Blue color
    
    // Check visual elements
    const activeNav = await page.locator('.bg-primary-500, .bg-primary-300').first();
    if (await activeNav.count() > 0) {
      const navBg = await activeNav.evaluate((el) => 
        window.getComputedStyle(el).backgroundColor
      );
      console.log('Active navigation bg:', navBg);
    }
  });
});