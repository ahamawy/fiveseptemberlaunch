import { test, expect } from '@playwright/test';

test.describe('Light Mode Visual Testing', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the site and set light mode
    await page.goto('/');
    
    // Set light mode via localStorage
    await page.evaluate(() => {
      localStorage.setItem('equitie-theme', 'light');
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    });
  });

  test('Style Guide - Light mode colors and contrasts', async ({ page, context }) => {
    // Set light mode in localStorage before navigation
    await context.addInitScript(() => {
      localStorage.setItem('equitie-theme', 'light');
    });
    
    await page.goto('/style-guide');
    await page.waitForLoadState('networkidle');
    
    // Ensure light mode is applied
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    });
    
    await page.waitForTimeout(500); // Give time for styles to apply
    
    // Take screenshot for visual comparison
    await page.screenshot({ 
      path: 'test-results/style-guide-light.png', 
      fullPage: false  // Just capture viewport to see navigation
    });

    // Check text contrast
    const primaryText = await page.locator('.text-text-primary').first();
    const primaryTextColor = await primaryText.evaluate((el) => 
      window.getComputedStyle(el).color
    );
    console.log('Primary text color:', primaryTextColor);

    // Check secondary text
    const secondaryText = await page.locator('.text-text-secondary').first();
    const secondaryTextColor = await secondaryText.evaluate((el) => 
      window.getComputedStyle(el).color
    );
    console.log('Secondary text color:', secondaryTextColor);

    // Check muted text
    const mutedText = await page.locator('.text-text-muted').first();
    const mutedTextColor = await mutedText.evaluate((el) => 
      window.getComputedStyle(el).color
    );
    console.log('Muted text color:', mutedTextColor);

    // Check background colors
    const deepBg = await page.locator('.bg-background-deep').first();
    const deepBgColor = await deepBg.evaluate((el) => 
      window.getComputedStyle(el).backgroundColor
    );
    console.log('Deep background color:', deepBgColor);

    // Check border visibility
    const borderElement = await page.locator('.border-surface-border').first();
    const borderColor = await borderElement.evaluate((el) => 
      window.getComputedStyle(el).borderColor
    );
    console.log('Border color:', borderColor);
  });

  test('Investor Portal Dashboard - Light mode visibility', async ({ page, context }) => {
    // Set light mode in localStorage before navigation
    await context.addInitScript(() => {
      localStorage.setItem('equitie-theme', 'light');
    });
    
    await page.goto('/investor-portal/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Ensure light mode is applied
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    });
    
    await page.waitForTimeout(500); // Give time for styles to apply
    
    // Take screenshot
    await page.screenshot({ 
      path: 'test-results/dashboard-light.png', 
      fullPage: true 
    });

    // Check card visibility
    const cards = await page.locator('[class*="Card"]').all();
    for (const card of cards.slice(0, 3)) {
      const bgColor = await card.evaluate((el) => 
        window.getComputedStyle(el).backgroundColor
      );
      const borderColor = await card.evaluate((el) => 
        window.getComputedStyle(el).borderColor
      );
      console.log('Card background:', bgColor, 'Border:', borderColor);
    }

    // Check text readability on cards
    const cardTexts = await page.locator('[class*="Card"] p').all();
    for (const text of cardTexts.slice(0, 5)) {
      const color = await text.evaluate((el) => 
        window.getComputedStyle(el).color
      );
      const fontSize = await text.evaluate((el) => 
        window.getComputedStyle(el).fontSize
      );
      console.log('Card text color:', color, 'Size:', fontSize);
    }
  });

  test('Profile Page - Light mode form elements', async ({ page }) => {
    await page.goto('/investor-portal/profile');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot
    await page.screenshot({ 
      path: 'test-results/profile-light.png', 
      fullPage: true 
    });

    // Check tab visibility
    const tabs = await page.locator('button').filter({ hasText: /Personal Info|Banking|Preferences/ });
    const tabCount = await tabs.count();
    
    for (let i = 0; i < tabCount; i++) {
      const tab = tabs.nth(i);
      const bgColor = await tab.evaluate((el) => 
        window.getComputedStyle(el).backgroundColor
      );
      const textColor = await tab.evaluate((el) => 
        window.getComputedStyle(el).color
      );
      console.log(`Tab ${i} - BG: ${bgColor}, Text: ${textColor}`);
    }

    // Check label visibility
    const labels = await page.locator('label').all();
    for (const label of labels.slice(0, 5)) {
      const color = await label.evaluate((el) => 
        window.getComputedStyle(el).color
      );
      console.log('Label color:', color);
    }
  });

  test('Transactions Page - Light mode table', async ({ page }) => {
    await page.goto('/investor-portal/transactions');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot
    await page.screenshot({ 
      path: 'test-results/transactions-light.png', 
      fullPage: true 
    });

    // Check table header visibility
    const tableHeaders = await page.locator('th').all();
    for (const th of tableHeaders) {
      const bgColor = await th.evaluate((el) => 
        window.getComputedStyle(el).backgroundColor
      );
      const textColor = await th.evaluate((el) => 
        window.getComputedStyle(el).color
      );
      const borderColor = await th.evaluate((el) => 
        window.getComputedStyle(el).borderColor
      );
      console.log('Table header - BG:', bgColor, 'Text:', textColor, 'Border:', borderColor);
    }

    // Check table cell visibility
    const tableCells = await page.locator('td').all();
    for (const td of tableCells.slice(0, 5)) {
      const textColor = await td.evaluate((el) => 
        window.getComputedStyle(el).color
      );
      const borderColor = await td.evaluate((el) => 
        window.getComputedStyle(el).borderColor
      );
      console.log('Table cell - Text:', textColor, 'Border:', borderColor);
    }
  });

  test('Documents Page - Light mode filters and search', async ({ page }) => {
    await page.goto('/investor-portal/documents');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot
    await page.screenshot({ 
      path: 'test-results/documents-light.png', 
      fullPage: true 
    });

    // Check search input visibility
    const searchInput = await page.locator('input[type="text"]').first();
    const inputBg = await searchInput.evaluate((el) => 
      window.getComputedStyle(el).backgroundColor
    );
    const inputBorder = await searchInput.evaluate((el) => 
      window.getComputedStyle(el).borderColor
    );
    const inputText = await searchInput.evaluate((el) => 
      window.getComputedStyle(el).color
    );
    console.log('Search input - BG:', inputBg, 'Border:', inputBorder, 'Text:', inputText);

    // Check button visibility
    const buttons = await page.locator('button').all();
    for (const btn of buttons.slice(0, 5)) {
      const bgColor = await btn.evaluate((el) => 
        window.getComputedStyle(el).backgroundColor
      );
      const textColor = await btn.evaluate((el) => 
        window.getComputedStyle(el).color
      );
      const borderColor = await btn.evaluate((el) => 
        window.getComputedStyle(el).borderColor
      );
      console.log('Button - BG:', bgColor, 'Text:', textColor, 'Border:', borderColor);
    }
  });

  test('Check contrast ratios', async ({ page }) => {
    await page.goto('/style-guide');
    
    // Function to calculate contrast ratio
    const checkContrast = async (selector1: string, selector2: string, description: string) => {
      const result = await page.evaluate(([sel1, sel2]) => {
        const el1 = document.querySelector(sel1) as HTMLElement;
        const el2 = document.querySelector(sel2) as HTMLElement;
        
        if (!el1 || !el2) return { error: 'Elements not found' };
        
        const getLuminance = (color: string) => {
          // Parse RGB values
          const rgb = color.match(/\d+/g);
          if (!rgb) return 0;
          
          const [r, g, b] = rgb.map(Number).map(val => {
            val = val / 255;
            return val <= 0.03928 
              ? val / 12.92 
              : Math.pow((val + 0.055) / 1.055, 2.4);
          });
          
          return 0.2126 * r + 0.7152 * g + 0.0722 * b;
        };
        
        const color1 = window.getComputedStyle(el1).color;
        const color2 = window.getComputedStyle(el2).backgroundColor || 
                      window.getComputedStyle(el2).color;
        
        const lum1 = getLuminance(color1);
        const lum2 = getLuminance(color2);
        
        const ratio = (Math.max(lum1, lum2) + 0.05) / (Math.min(lum1, lum2) + 0.05);
        
        return {
          color1,
          color2,
          ratio: ratio.toFixed(2),
          passes_AA: ratio >= 4.5,
          passes_AAA: ratio >= 7
        };
      }, [selector1, selector2]);
      
      console.log(`${description}:`, result);
      return result;
    };
    
    // Check various text/background combinations
    await checkContrast('.text-text-primary', '.bg-background-deep', 'Primary text on deep background');
    await checkContrast('.text-text-secondary', '.bg-background-deep', 'Secondary text on deep background');
    await checkContrast('.text-text-muted', '.bg-background-deep', 'Muted text on deep background');
    await checkContrast('.text-text-primary', '.bg-background-surface', 'Primary text on surface');
  });

  test('Visual regression - Compare dark vs light', async ({ page }) => {
    // Capture light mode
    await page.goto('/investor-portal/dashboard');
    await page.waitForLoadState('networkidle');
    const lightScreenshot = await page.screenshot({ fullPage: true });
    
    // Switch to dark mode
    await page.evaluate(() => {
      localStorage.setItem('equitie-theme', 'dark');
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    });
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    const darkScreenshot = await page.screenshot({ 
      path: 'test-results/dashboard-dark.png',
      fullPage: true 
    });
    
    // Save light mode screenshot
    await page.screenshot({ 
      path: 'test-results/dashboard-light-comparison.png',
      fullPage: true 
    });
    
    console.log('Screenshots saved for visual comparison');
  });
});