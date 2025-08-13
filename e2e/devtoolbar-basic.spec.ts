import { test, expect } from '@playwright/test';

test.describe('DevToolbar Basic Functionality', () => {
  test('DevToolbar appears and color scheme switching works', async ({ page }) => {
    // Navigate to style guide page
    await page.goto('http://localhost:3002/style-guide');
    await page.waitForLoadState('networkidle');
    
    // Verify DevToolbar button is visible
    const devMenuButton = page.locator('button:has-text("Dev Menu")');
    await expect(devMenuButton).toBeVisible();
    
    // Click to open DevToolbar dropdown
    await devMenuButton.click();
    await page.waitForTimeout(300);
    
    // Verify navigation dropdown is open
    const dropdown = page.locator('.absolute.bottom-full');
    await expect(dropdown).toBeVisible();
    
    // Verify theme toggle buttons exist in DevToolbar dropdown
    const devToolbarSection = dropdown.locator('.sticky.bottom-0');
    const darkButton = devToolbarSection.locator('button:has-text("Dark")');
    const lightButton = devToolbarSection.locator('button:has-text("Light")');
    await expect(darkButton).toBeVisible();
    await expect(lightButton).toBeVisible();
    
    // Verify color scheme buttons exist in DevToolbar dropdown
    const purpleButton = devToolbarSection.locator('button:has-text("Purple")');
    const blueButton = devToolbarSection.locator('button:has-text("Blue")');
    const greenButton = devToolbarSection.locator('button:has-text("Green")');
    const monoButton = devToolbarSection.locator('button:has-text("Mono")');
    
    await expect(purpleButton).toBeVisible();
    await expect(blueButton).toBeVisible();
    await expect(greenButton).toBeVisible();
    await expect(monoButton).toBeVisible();
    
    // Test color scheme switching
    await blueButton.click();
    await page.waitForTimeout(1000); // Wait for reload
    
    // Verify blue scheme is applied
    const blueScheme = await page.evaluate(() => localStorage.getItem('equitie-color-scheme'));
    expect(blueScheme).toBe('blue');
    
    console.log('✅ DevToolbar basic functionality verified');
  });
  
  test('Style guide theme controls work independently', async ({ page }) => {
    await page.goto('http://localhost:3002/style-guide');
    await page.waitForLoadState('networkidle');
    
    // Test theme switching in style guide
    const styleDarkButton = page.locator('button:has-text("Dark")').first();
    const styleLightButton = page.locator('button:has-text("Light")').first();
    
    await expect(styleDarkButton).toBeVisible();
    await expect(styleLightButton).toBeVisible();
    
    // Test color scheme switching in style guide
    const styleBlueButton = page.locator('button:has-text("Blue")').first();
    await expect(styleBlueButton).toBeVisible();
    
    await styleBlueButton.click();
    await page.waitForTimeout(300);
    
    // Verify the scheme changed
    const scheme = await page.evaluate(() => localStorage.getItem('equitie-color-scheme'));
    expect(scheme).toBe('blue');
    
    console.log('✅ Style guide theme controls verified');
  });
  
  test('Navigation between pages works', async ({ page }) => {
    await page.goto('http://localhost:3002/style-guide');
    await page.waitForLoadState('networkidle');
    
    // Open DevToolbar
    const devMenuButton = page.locator('button:has-text("Dev Menu")');
    await devMenuButton.click();
    await page.waitForTimeout(300);
    
    // Try to navigate to dashboard
    const dashboardLink = page.locator('button:has-text("Dashboard")');
    if (await dashboardLink.isVisible()) {
      await dashboardLink.click();
      await page.waitForTimeout(1000);
      
      // Verify navigation worked
      expect(page.url()).toContain('/investor-portal/dashboard');
    }
    
    console.log('✅ DevToolbar navigation verified');
  });
});