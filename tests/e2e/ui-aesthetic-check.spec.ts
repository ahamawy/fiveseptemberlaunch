import { test, expect } from '@playwright/test';

test.describe('UI Aesthetic Health Check', () => {
  const BASE_URL = 'http://localhost:3000';
  
  test('Check for CSS errors and missing styles', async ({ page }) => {
    const cssErrors: string[] = [];
    const warnings: string[] = [];
    
    // Capture console errors
    page.on('console', msg => {
      const text = msg.text();
      if (msg.type() === 'error') {
        if (text.includes('CSS') || text.includes('style') || text.includes('Failed to load resource')) {
          cssErrors.push(text);
        }
      } else if (msg.type() === 'warning') {
        if (text.includes('CSS') || text.includes('style')) {
          warnings.push(text);
        }
      }
    });
    
    // Navigate to dashboard
    await page.goto(`${BASE_URL}/investor-portal/dashboard`);
    await page.waitForTimeout(2000);
    
    // Check if key CSS classes are present
    const glassElements = await page.$$('[class*="glass"]');
    const gradientElements = await page.$$('[class*="gradient"]');
    
    console.log(`Found ${glassElements.length} glass elements`);
    console.log(`Found ${gradientElements.length} gradient elements`);
    
    // Check if CSS variables are defined
    const cssVars = await page.evaluate(() => {
      const styles = getComputedStyle(document.documentElement);
      return {
        bgDeep: styles.getPropertyValue('--bg-deep'),
        primary300: styles.getPropertyValue('--primary-300'),
        textPrimary: styles.getPropertyValue('--text-primary'),
        glassBgOpacity: styles.getPropertyValue('--glass-bg-opacity'),
        accentBlue: styles.getPropertyValue('--accent-blue')
      };
    });
    
    console.log('CSS Variables:', cssVars);
    
    // Check for missing variables
    Object.entries(cssVars).forEach(([key, value]) => {
      if (!value || value.trim() === '') {
        cssErrors.push(`Missing CSS variable: --${key}`);
      }
    });
    
    // Check computed styles on key elements
    const cardStyles = await page.evaluate(() => {
      const card = document.querySelector('[class*="card"]');
      if (!card) return null;
      const styles = getComputedStyle(card);
      return {
        background: styles.background,
        backdropFilter: styles.backdropFilter,
        border: styles.border,
        borderRadius: styles.borderRadius
      };
    });
    
    console.log('Card Styles:', cardStyles);
    
    // Report findings
    if (cssErrors.length > 0) {
      console.error('CSS Errors found:', cssErrors);
    }
    if (warnings.length > 0) {
      console.warn('CSS Warnings:', warnings);
    }
    
    expect(cssErrors).toHaveLength(0);
  });
  
  test('Check glass morphism effects', async ({ page }) => {
    await page.goto(`${BASE_URL}/investor-portal/dashboard`);
    await page.waitForSelector('[class*="glass"]', { timeout: 5000 });
    
    // Check if backdrop-filter is applied
    const glassEffects = await page.evaluate(() => {
      const elements = document.querySelectorAll('[class*="glass"]');
      const results = [];
      elements.forEach((el: any) => {
        const styles = getComputedStyle(el);
        results.push({
          hasBackdropFilter: styles.backdropFilter !== 'none',
          backdropFilter: styles.backdropFilter,
          background: styles.background,
          border: styles.border
        });
      });
      return results;
    });
    
    console.log('Glass Effects:', glassEffects);
    
    // At least some elements should have backdrop-filter
    const hasWorkingGlass = glassEffects.some(e => e.hasBackdropFilter);
    expect(hasWorkingGlass).toBeTruthy();
  });
  
  test('Check gradient text and backgrounds', async ({ page }) => {
    await page.goto(`${BASE_URL}/investor-portal/dashboard`);
    
    // Check for gradient text
    const gradientText = await page.evaluate(() => {
      const elements = document.querySelectorAll('.text-gradient, [class*="gradient"]');
      const results = [];
      elements.forEach((el: any) => {
        const styles = getComputedStyle(el);
        results.push({
          backgroundImage: styles.backgroundImage,
          webkitBackgroundClip: styles.webkitBackgroundClip,
          color: styles.color
        });
      });
      return results;
    });
    
    console.log('Gradient Elements:', gradientText);
    
    // Check if gradients are applied
    const hasGradients = gradientText.some(e => 
      e.backgroundImage && e.backgroundImage.includes('gradient')
    );
    
    expect(hasGradients).toBeTruthy();
  });
  
  test('Check dark theme application', async ({ page }) => {
    await page.goto(`${BASE_URL}/investor-portal/dashboard`);
    
    // Check body background color
    const bodyStyles = await page.evaluate(() => {
      const styles = getComputedStyle(document.body);
      return {
        backgroundColor: styles.backgroundColor,
        color: styles.color
      };
    });
    
    console.log('Body Styles:', bodyStyles);
    
    // Should have dark background
    expect(bodyStyles.backgroundColor).toMatch(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  });
  
  test('Check for broken Tailwind classes', async ({ page }) => {
    await page.goto(`${BASE_URL}/investor-portal/dashboard`);
    
    // Check if Tailwind utilities are working
    const tailwindCheck = await page.evaluate(() => {
      // Check for common Tailwind classes
      const testElement = document.createElement('div');
      testElement.className = 'bg-primary-300 text-white p-4 rounded-lg';
      document.body.appendChild(testElement);
      
      const styles = getComputedStyle(testElement);
      const result = {
        hasPadding: styles.padding !== '0px',
        hasRoundedCorners: styles.borderRadius !== '0px',
        hasBackgroundColor: styles.backgroundColor !== 'rgba(0, 0, 0, 0)'
      };
      
      document.body.removeChild(testElement);
      return result;
    });
    
    console.log('Tailwind Check:', tailwindCheck);
    
    expect(tailwindCheck.hasPadding).toBeTruthy();
    expect(tailwindCheck.hasRoundedCorners).toBeTruthy();
  });
  
  test('Visual regression - take screenshots', async ({ page }) => {
    await page.goto(`${BASE_URL}/investor-portal/dashboard`);
    await page.waitForTimeout(2000);
    
    // Take screenshots for visual comparison
    await page.screenshot({ 
      path: 'test-results/ui-dashboard.png',
      fullPage: true 
    });
    
    // Check portfolio page
    await page.goto(`${BASE_URL}/investor-portal/portfolio`);
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: 'test-results/ui-portfolio.png',
      fullPage: true 
    });
    
    console.log('Screenshots saved to test-results/');
  });
});