import { test, expect } from '@playwright/test';

test.describe('DevMenu Comprehensive Test Suite', () => {
  test.beforeEach(async ({ page }) => {
    // Start from home page
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('DevMenu appears on all pages and navigation works', async ({ page }) => {
    // Test pages to check
    const pagesToTest = [
      { path: '/', name: 'Home' },
      { path: '/investor-portal/dashboard', name: 'Investor Dashboard' },
      { path: '/admin/dashboard', name: 'Admin Dashboard' },
      { path: '/style-guide', name: 'Style Guide' },
    ];

    for (const testPage of pagesToTest) {
      await page.goto(testPage.path);
      await page.waitForLoadState('networkidle');
      
      // Verify DevMenu button is visible
      const devMenuButton = page.locator('button:has-text("Dev Menu")');
      await expect(devMenuButton).toBeVisible();
      
      // Open DevMenu
      await devMenuButton.click();
      await page.waitForTimeout(300);
      
      // Verify dropdown is visible
      const dropdown = page.locator('.absolute.bottom-full');
      await expect(dropdown).toBeVisible();
      
      // Close dropdown
      await page.keyboard.press('Escape');
      await page.waitForTimeout(200);
    }
  });

  test('Theme and color scheme switching works globally', async ({ page }) => {
    // Navigate to style guide
    await page.goto('/style-guide');
    
    // Open DevMenu
    const devMenuButton = page.locator('button:has-text("Dev Menu")');
    await devMenuButton.click();
    await page.waitForTimeout(300);
    
    const dropdown = page.locator('.absolute.bottom-full');
    
    // Test theme switching
    const lightButton = dropdown.locator('button:has-text("Light")').last();
    await lightButton.click();
    await page.waitForTimeout(500);
    
    // Verify light theme is applied
    const htmlClass = await page.locator('html').getAttribute('class');
    expect(htmlClass).toContain('light');
    
    // Verify localStorage
    const theme = await page.evaluate(() => localStorage.getItem('equitie-theme'));
    expect(theme).toBe('light');
    
    // Test color scheme switching
    await devMenuButton.click();
    await page.waitForTimeout(300);
    
    const blueButton = dropdown.locator('button:has-text("Blue")').last();
    await blueButton.click();
    await page.waitForTimeout(1000); // Wait for reload
    
    // Verify color scheme is applied
    const scheme = await page.evaluate(() => localStorage.getItem('equitie-color-scheme'));
    expect(scheme).toBe('blue');
  });

  test('Data source toggle (Mock/Supabase) works correctly', async ({ page }) => {
    await page.goto('/investor-portal/dashboard');
    
    // Open DevMenu
    const devMenuButton = page.locator('button:has-text("Dev Menu")');
    await devMenuButton.click();
    await page.waitForTimeout(300);
    
    const dropdown = page.locator('.absolute.bottom-full');
    
    // Check current data source status
    const supabaseButton = dropdown.locator('button:has-text("Supabase")').last();
    const mockButton = dropdown.locator('button:has-text("Mock")').last();
    
    // Switch to Mock
    await mockButton.click();
    await page.waitForTimeout(1000); // Wait for reload
    
    // Verify mock data is enabled
    const mockEnabled = await page.evaluate(() => localStorage.getItem('equitie-use-mock-data'));
    expect(mockEnabled).toBe('true');
    
    // Open DevMenu again
    await page.locator('button:has-text("Dev Menu")').click();
    await page.waitForTimeout(300);
    
    // Verify UI shows Mock is active
    const dataStatus = page.locator('text=🔧 Mock');
    await expect(dataStatus).toBeVisible();
    
    // Switch back to Supabase
    const dropdown2 = page.locator('.absolute.bottom-full');
    await dropdown2.locator('button:has-text("Supabase")').last().click();
    await page.waitForTimeout(1000);
    
    // Verify Supabase is enabled
    const mockDisabled = await page.evaluate(() => localStorage.getItem('equitie-use-mock-data'));
    expect(mockDisabled).toBe('false');
  });

  test('Navigation between different sections works', async ({ page }) => {
    await page.goto('/');
    
    // Open DevMenu
    const devMenuButton = page.locator('button:has-text("Dev Menu")');
    await devMenuButton.click();
    await page.waitForTimeout(300);
    
    // Navigate to Investor Portal Dashboard
    await page.locator('button:has-text("Dashboard")').first().click();
    await page.waitForTimeout(500);
    expect(page.url()).toContain('/investor-portal/dashboard');
    
    // Open DevMenu again and navigate to Admin
    await page.locator('button:has-text("Dev Menu")').click();
    await page.waitForTimeout(300);
    await page.locator('text=Admin Dashboard >> text=Overview').click();
    await page.waitForTimeout(500);
    expect(page.url()).toContain('/admin/dashboard');
    
    // Navigate to Style Guide
    await page.locator('button:has-text("Dev Menu")').click();
    await page.waitForTimeout(300);
    await page.locator('button:has-text("Style Guide")').click();
    await page.waitForTimeout(500);
    expect(page.url()).toContain('/style-guide');
  });

  test('Supabase connection status is displayed', async ({ page }) => {
    await page.goto('/investor-portal/dashboard');
    
    // Open DevMenu
    const devMenuButton = page.locator('button:has-text("Dev Menu")');
    await devMenuButton.click();
    await page.waitForTimeout(500);
    
    // Check for Supabase status indicators
    const statusTexts = ['✅ Connected', '⚙️ Configured', '❌ Missing', '❌ Error'];
    let statusFound = false;
    
    for (const status of statusTexts) {
      const element = page.locator(`text=${status}`);
      if (await element.count() > 0) {
        statusFound = true;
        break;
      }
    }
    
    expect(statusFound).toBe(true);
  });

  test('Page health indicators show for critical pages', async ({ page }) => {
    await page.goto('/investor-portal/dashboard');
    
    // Open DevMenu
    const devMenuButton = page.locator('button:has-text("Dev Menu")');
    await devMenuButton.click();
    await page.waitForTimeout(1000); // Give time for health checks
    
    // Look for health indicators (green or red dots)
    const healthIndicators = page.locator('.text-green-500, .text-red-500');
    const indicatorCount = await healthIndicators.count();
    
    // Should have at least some health indicators
    expect(indicatorCount).toBeGreaterThan(0);
  });

  test('Current page is highlighted in navigation', async ({ page }) => {
    await page.goto('/investor-portal/dashboard');
    
    // Open DevMenu
    const devMenuButton = page.locator('button:has-text("Dev Menu")');
    await devMenuButton.click();
    await page.waitForTimeout(300);
    
    // Find the active page indicator
    const activeIndicator = page.locator('.bg-primary-300.rounded-full.animate-pulse');
    await expect(activeIndicator).toBeVisible();
    
    // Verify it's next to the Dashboard button
    const dashboardButton = page.locator('button:has-text("Dashboard")').first();
    const buttonBox = await dashboardButton.boundingBox();
    const indicatorBox = await activeIndicator.boundingBox();
    
    if (buttonBox && indicatorBox) {
      // Indicator should be near the button
      expect(Math.abs(buttonBox.y - indicatorBox.y)).toBeLessThan(20);
    }
  });

  test('Style Guide button shortcut works', async ({ page }) => {
    await page.goto('/');
    
    // Find the palette icon button (Style Guide shortcut)
    const styleGuideButton = page.locator('button[title="Style Guide"]');
    await expect(styleGuideButton).toBeVisible();
    
    // Click it
    await styleGuideButton.click();
    await page.waitForTimeout(500);
    
    // Should navigate to style guide
    expect(page.url()).toContain('/style-guide');
  });

  test('Environment info is displayed correctly', async ({ page }) => {
    await page.goto('/');
    
    // Open DevMenu
    const devMenuButton = page.locator('button:has-text("Dev Menu")');
    await devMenuButton.click();
    await page.waitForTimeout(300);
    
    // Check environment info
    await expect(page.locator('text=Environment')).toBeVisible();
    await expect(page.locator('text=development')).toBeVisible();
    await expect(page.locator('text=Data Mode')).toBeVisible();
    await expect(page.locator('text=Host')).toBeVisible();
    
    // Verify host shows localhost
    const hostText = await page.locator('text=localhost').count();
    expect(hostText).toBeGreaterThan(0);
  });

  test('API quick access links work', async ({ page }) => {
    await page.goto('/');
    
    // Open DevMenu
    const devMenuButton = page.locator('button:has-text("Dev Menu")');
    await devMenuButton.click();
    await page.waitForTimeout(300);
    
    // Click on Deals API
    await page.locator('button:has-text("Deals API")').click();
    await page.waitForTimeout(500);
    
    // Should navigate to API endpoint
    expect(page.url()).toContain('/api/deals');
    
    // Verify JSON response
    const content = await page.textContent('body');
    expect(content).toBeTruthy();
    
    // Should be valid JSON
    const isJson = () => {
      try {
        JSON.parse(content!);
        return true;
      } catch {
        return false;
      }
    };
    
    expect(isJson()).toBe(true);
  });
});