import { test, expect } from '@playwright/test';

test.describe('Color Scheme Testing', () => {
  test('All color schemes work in both light and dark modes', async ({ page }) => {
    await page.goto('/style-guide');
    await page.waitForLoadState('networkidle');
    
    const colorSchemes = ['purple', 'blue', 'green', 'monochrome'];
    const themes = ['dark', 'light'];
    
    for (const theme of themes) {
      for (const scheme of colorSchemes) {
        // Set theme
        await page.click(`button:has-text("${theme.charAt(0).toUpperCase() + theme.slice(1)}")`);
        
        // Set color scheme
        await page.click(`button:has-text("${scheme === 'monochrome' ? 'Mono' : scheme.charAt(0).toUpperCase() + scheme.slice(1)}")`);
        
        // Wait for changes to apply
        await page.waitForTimeout(500);
        
        // Take screenshot
        await page.screenshot({ 
          path: `test-results/${theme}-${scheme}.png`, 
          fullPage: false 
        });
        
        // Check that primary color CSS variable was applied
        const primaryColor = await page.evaluate(() => {
          return getComputedStyle(document.documentElement).getPropertyValue('--primary-300');
        });
        
        console.log(`${theme} mode with ${scheme} scheme: Primary color = ${primaryColor}`);
        
        // Verify the color changed based on scheme
        if (scheme === 'purple') {
          expect(primaryColor.trim()).toBe('200 152 255');
        } else if (scheme === 'blue') {
          expect(primaryColor.trim()).toBe('96 165 250');
        } else if (scheme === 'green') {
          expect(primaryColor.trim()).toBe('34 197 94');
        } else if (scheme === 'monochrome') {
          expect(primaryColor.trim()).toBe('156 163 175');
        }
      }
    }
  });
  
  test('Color scheme persists after page reload', async ({ page }) => {
    await page.goto('/style-guide');
    
    // Set to blue scheme
    await page.click('button:has-text("Blue")');
    await page.waitForTimeout(500);
    
    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Check that blue scheme is still active
    const primaryColor = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).getPropertyValue('--primary-300');
    });
    
    expect(primaryColor.trim()).toBe('96 165 250'); // Blue scheme primary color
  });
});