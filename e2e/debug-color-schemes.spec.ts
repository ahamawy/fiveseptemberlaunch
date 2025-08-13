import { test, expect } from '@playwright/test';

test.describe('Debug Color Schemes', () => {
  test('Check console errors and color application', async ({ page }) => {
    // Listen for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Console error:', msg.text());
      }
    });
    
    page.on('pageerror', err => {
      console.log('Page error:', err.message);
    });
    
    await page.goto('/style-guide');
    await page.waitForLoadState('networkidle');
    
    // Check if ThemeProvider is loaded
    const hasThemeContext = await page.evaluate(() => {
      // Check if color scheme is in localStorage
      const scheme = localStorage.getItem('equitie-color-scheme');
      console.log('Current scheme in localStorage:', scheme);
      return scheme;
    });
    console.log('Color scheme from localStorage:', hasThemeContext);
    
    // Check CSS variables before clicking
    const cssVarsBefore = await page.evaluate(() => {
      const root = document.documentElement;
      return {
        primary300: getComputedStyle(root).getPropertyValue('--primary-300'),
        primary500: getComputedStyle(root).getPropertyValue('--primary-500'),
        accentBlue: getComputedStyle(root).getPropertyValue('--accent-blue'),
      };
    });
    console.log('CSS vars before:', cssVarsBefore);
    
    // Click Blue button
    await page.click('button:has-text("Blue")');
    await page.waitForTimeout(1000);
    
    // Check CSS variables after clicking Blue
    const cssVarsAfterBlue = await page.evaluate(() => {
      const root = document.documentElement;
      return {
        primary300: getComputedStyle(root).getPropertyValue('--primary-300'),
        primary500: getComputedStyle(root).getPropertyValue('--primary-500'),
        accentBlue: getComputedStyle(root).getPropertyValue('--accent-blue'),
        scheme: localStorage.getItem('equitie-color-scheme'),
      };
    });
    console.log('CSS vars after Blue click:', cssVarsAfterBlue);
    
    // Click Green button
    await page.click('button:has-text("Green")');
    await page.waitForTimeout(1000);
    
    // Check CSS variables after clicking Green
    const cssVarsAfterGreen = await page.evaluate(() => {
      const root = document.documentElement;
      return {
        primary300: getComputedStyle(root).getPropertyValue('--primary-300'),
        primary500: getComputedStyle(root).getPropertyValue('--primary-500'),
        accentBlue: getComputedStyle(root).getPropertyValue('--accent-blue'),
        scheme: localStorage.getItem('equitie-color-scheme'),
      };
    });
    console.log('CSS vars after Green click:', cssVarsAfterGreen);
    
    // Check if the style attribute is being set on root
    const rootStyleAttr = await page.evaluate(() => {
      return document.documentElement.getAttribute('style');
    });
    console.log('Root element style attribute:', rootStyleAttr);
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/debug-color-scheme.png' });
  });
});