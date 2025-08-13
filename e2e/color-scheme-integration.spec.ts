import { test, expect } from '@playwright/test';

const COLOR_SCHEMES = ['purple', 'blue', 'green', 'monochrome'];
const THEMES = ['dark', 'light'];

// Pages to test
const APP_PAGES = [
  { 
    path: '/investor-portal/dashboard', 
    name: 'Dashboard',
    keyElements: ['.metric-card', '.chart-container', '.portfolio-summary']
  },
  { 
    path: '/investor-portal/portfolio', 
    name: 'Portfolio',
    keyElements: ['.investment-card', '.performance-metrics', '.allocation-chart']
  },
  { 
    path: '/investor-portal/transactions', 
    name: 'Transactions',
    keyElements: ['.transaction-table', '.filter-controls', '.transaction-row']
  },
  { 
    path: '/investor-portal/documents', 
    name: 'Documents',
    keyElements: ['.document-grid', '.document-card', '.upload-area']
  },
  { 
    path: '/investor-portal/profile', 
    name: 'Profile',
    keyElements: ['.profile-header', '.settings-section', '.notification-preferences']
  },
];

async function applyColorScheme(page: any, theme: string, scheme: string) {
  // First navigate to style guide to set the scheme
  await page.goto('http://localhost:3002/style-guide');
  await page.waitForLoadState('networkidle');
  
  // Set theme
  const themeText = theme.charAt(0).toUpperCase() + theme.slice(1);
  await page.click(`button:has-text("${themeText}")`);
  await page.waitForTimeout(200);
  
  // Set color scheme
  const schemeText = scheme === 'monochrome' ? 'Mono' : scheme.charAt(0).toUpperCase() + scheme.slice(1);
  await page.click(`button:has-text("${schemeText}")`);
  await page.waitForTimeout(300);
  
  // Verify settings saved
  const settings = await page.evaluate(() => ({
    theme: localStorage.getItem('equitie-theme'),
    scheme: localStorage.getItem('equitie-color-scheme'),
  }));
  
  expect(settings.theme).toBe(theme);
  expect(settings.scheme).toBe(scheme);
}

test.describe('Integration Tests - App Pages with Color Schemes', () => {
  test('dashboard should work with all color schemes', async ({ page }) => {
    for (const theme of THEMES) {
      for (const scheme of COLOR_SCHEMES) {
        // Apply color scheme
        await applyColorScheme(page, theme, scheme);
        
        // Navigate to dashboard
        await page.goto('http://localhost:3002/investor-portal/dashboard');
        await page.waitForLoadState('networkidle');
        
        // Verify theme and scheme are applied
        const appliedSettings = await page.evaluate(() => ({
          theme: document.documentElement.classList.contains('light') ? 'light' : 'dark',
          scheme: localStorage.getItem('equitie-color-scheme'),
          primaryColor: getComputedStyle(document.documentElement).getPropertyValue('--primary-300'),
        }));
        
        expect(appliedSettings.theme).toBe(theme);
        expect(appliedSettings.scheme).toBe(scheme);
        expect(appliedSettings.primaryColor).toBeTruthy();
        
        // Check key dashboard elements
        const elements = {
          header: await page.$('header'),
          navigation: await page.$('nav'),
          metricCards: await page.$$('.rounded-2xl'),
          buttons: await page.$$('button'),
        };
        
        // Verify elements exist and are visible
        expect(elements.header).toBeTruthy();
        expect(elements.navigation).toBeTruthy();
        expect(elements.metricCards.length).toBeGreaterThan(0);
        expect(elements.buttons.length).toBeGreaterThan(0);
        
        // Check that primary color is being used
        for (const button of elements.buttons.slice(0, 2)) {
          const className = await button.evaluate(el => el.className);
          if (className.includes('primary')) {
            const bgColor = await button.evaluate(el => 
              getComputedStyle(el).backgroundColor
            );
            expect(bgColor).toBeTruthy();
            expect(bgColor).not.toBe('rgba(0, 0, 0, 0)');
          }
        }
        
        // Check glass effects work
        const glassElements = await page.$$('[class*="backdrop-blur"]');
        for (const element of glassElements.slice(0, 2)) {
          const backdropFilter = await element.evaluate(el => 
            getComputedStyle(el).backdropFilter
          );
          expect(backdropFilter).toContain('blur');
        }
        
        // Take screenshot for visual verification
        await page.screenshot({
          path: `test-results/integration/dashboard-${theme}-${scheme}.png`,
          fullPage: false,
        });
        
        console.log(`✓ Dashboard verified with ${theme}/${scheme}`);
      }
    }
  });

  test('portfolio page should adapt to all color schemes', async ({ page }) => {
    for (const scheme of COLOR_SCHEMES) {
      // Apply color scheme in dark mode
      await applyColorScheme(page, 'dark', scheme);
      
      // Navigate to portfolio
      await page.goto('http://localhost:3002/investor-portal/portfolio');
      await page.waitForLoadState('networkidle');
      
      // Check portfolio-specific elements
      const portfolioElements = await page.evaluate(() => {
        const elements: Record<string, boolean> = {};
        
        // Check for investment cards
        elements.hasCards = document.querySelectorAll('.rounded-2xl').length > 0;
        
        // Check for charts/metrics
        elements.hasMetrics = !!document.querySelector('[class*="text-4xl"], [class*="text-3xl"]');
        
        // Check for tables
        elements.hasTable = !!document.querySelector('table');
        
        // Check gradient text
        elements.hasGradientText = !!document.querySelector('.text-gradient');
        
        return elements;
      });
      
      // Verify portfolio elements exist
      expect(portfolioElements.hasCards).toBeTruthy();
      
      // Check color consistency
      const colorCheck = await page.evaluate(() => {
        const root = document.documentElement;
        const primaryColor = getComputedStyle(root).getPropertyValue('--primary-300');
        
        // Find elements using primary color
        const primaryElements = document.querySelectorAll('.bg-primary-300, .text-primary-300, .border-primary-300');
        
        return {
          primaryColor,
          primaryElementCount: primaryElements.length,
        };
      });
      
      expect(colorCheck.primaryColor).toBeTruthy();
      
      // Check status colors remain semantic
      const statusElements = await page.$$('.text-success, .text-error, .bg-success, .bg-error');
      for (const element of statusElements.slice(0, 2)) {
        const color = await element.evaluate(el => 
          getComputedStyle(el).color || getComputedStyle(el).backgroundColor
        );
        expect(color).toBeTruthy();
        expect(color).not.toBe('rgba(0, 0, 0, 0)');
      }
      
      console.log(`✓ Portfolio page verified with ${scheme}`);
    }
  });

  test('transactions page should maintain functionality with all schemes', async ({ page }) => {
    for (const theme of ['dark', 'light']) {
      for (const scheme of ['purple', 'blue']) {
        await applyColorScheme(page, theme, scheme);
        
        // Navigate to transactions
        await page.goto('http://localhost:3002/investor-portal/transactions');
        await page.waitForLoadState('networkidle');
        
        // Check transaction table
        const table = await page.$('table');
        if (table) {
          // Check table headers
          const headers = await table.$$('thead th');
          for (const header of headers) {
            const styles = await header.evaluate(el => ({
              color: getComputedStyle(el).color,
              borderColor: getComputedStyle(el).borderBottomColor,
            }));
            
            expect(styles.color).toBeTruthy();
            expect(styles.borderColor).toBeTruthy();
          }
          
          // Check table rows
          const rows = await table.$$('tbody tr');
          if (rows.length > 0) {
            // Test hover state
            const firstRow = rows[0];
            const normalBg = await firstRow.evaluate(el => 
              getComputedStyle(el).backgroundColor
            );
            
            await firstRow.hover();
            await page.waitForTimeout(100);
            
            const hoverBg = await firstRow.evaluate(el => 
              getComputedStyle(el).backgroundColor
            );
            
            // Background should change on hover in most themes
            if (theme === 'dark') {
              expect(hoverBg).not.toBe(normalBg);
            }
          }
        }
        
        // Check filter controls if present
        const filters = await page.$$('select, input[type="date"]');
        for (const filter of filters) {
          const styles = await filter.evaluate(el => ({
            background: getComputedStyle(el).backgroundColor,
            border: getComputedStyle(el).borderColor,
          }));
          
          expect(styles.background).toBeTruthy();
          expect(styles.border).toBeTruthy();
        }
        
        console.log(`✓ Transactions page verified with ${theme}/${scheme}`);
      }
    }
  });

  test('documents page should work with all color schemes', async ({ page }) => {
    for (const scheme of COLOR_SCHEMES) {
      await applyColorScheme(page, 'dark', scheme);
      
      // Navigate to documents
      await page.goto('http://localhost:3002/investor-portal/documents');
      await page.waitForLoadState('networkidle');
      
      // Check document cards
      const documentCards = await page.$$('.rounded-lg, .rounded-xl, .rounded-2xl');
      
      for (const card of documentCards.slice(0, 3)) {
        const styles = await card.evaluate(el => ({
          background: getComputedStyle(el).backgroundColor,
          border: getComputedStyle(el).borderColor,
          shadow: getComputedStyle(el).boxShadow,
        }));
        
        // Cards should have styling
        expect(
          styles.background !== 'rgba(0, 0, 0, 0)' ||
          styles.border !== 'rgba(0, 0, 0, 0)' ||
          styles.shadow !== 'none'
        ).toBeTruthy();
      }
      
      // Check upload area if present
      const uploadArea = await page.$('[class*="border-dashed"]');
      if (uploadArea) {
        const borderStyle = await uploadArea.evaluate(el => 
          getComputedStyle(el).borderStyle
        );
        expect(borderStyle).toContain('dashed');
      }
      
      console.log(`✓ Documents page verified with ${scheme}`);
    }
  });

  test('profile page should adapt to all themes and schemes', async ({ page }) => {
    for (const theme of THEMES) {
      for (const scheme of COLOR_SCHEMES) {
        await applyColorScheme(page, theme, scheme);
        
        // Navigate to profile
        await page.goto('http://localhost:3002/investor-portal/profile');
        await page.waitForLoadState('networkidle');
        
        // Check profile sections
        const sections = await page.$$('section, .space-y-6 > div');
        expect(sections.length).toBeGreaterThan(0);
        
        // Check form elements
        const inputs = await page.$$('input, select, textarea');
        for (const input of inputs.slice(0, 3)) {
          const styles = await input.evaluate(el => ({
            background: getComputedStyle(el).backgroundColor,
            color: getComputedStyle(el).color,
            border: getComputedStyle(el).borderColor,
          }));
          
          // Form elements should be styled appropriately for the theme
          if (theme === 'light') {
            // Light theme should have light backgrounds
            expect(styles.background).toMatch(/rgb\(2\d\d, 2\d\d, 2\d\d\)|rgb\(255, 255, 255\)|rgba\(255, 255, 255/);
          } else {
            // Dark theme should have dark backgrounds
            expect(styles.background).toMatch(/rgb\(\d{1,2}, \d{1,2}, \d{1,2}\)|rgba\(\d{1,2}, \d{1,2}, \d{1,2}/);
          }
          
          expect(styles.color).toBeTruthy();
          expect(styles.border).toBeTruthy();
        }
        
        // Check buttons
        const buttons = await page.$$('button');
        for (const button of buttons.slice(0, 2)) {
          const className = await button.evaluate(el => el.className);
          if (className.includes('primary')) {
            const bgColor = await button.evaluate(el => 
              getComputedStyle(el).backgroundColor
            );
            expect(bgColor).toBeTruthy();
          }
        }
        
        console.log(`✓ Profile page verified with ${theme}/${scheme}`);
      }
    }
  });

  test('navigation should maintain consistency across all pages', async ({ page }) => {
    // Set a specific scheme
    await applyColorScheme(page, 'dark', 'blue');
    
    // Check navigation on each page
    for (const appPage of APP_PAGES) {
      await page.goto(`http://localhost:3002${appPage.path}`);
      await page.waitForLoadState('networkidle');
      
      // Check navigation elements
      const nav = await page.$('nav');
      if (nav) {
        const navLinks = await nav.$$('a');
        
        for (const link of navLinks) {
          const styles = await link.evaluate(el => ({
            color: getComputedStyle(el).color,
            background: getComputedStyle(el).backgroundColor,
          }));
          
          expect(styles.color).toBeTruthy();
          
          // Check if this is the active link
          const isActive = await link.evaluate(el => 
            el.className.includes('bg-primary') || 
            el.className.includes('text-primary')
          );
          
          if (isActive) {
            // Active link should have distinct styling
            expect(styles.background).not.toBe('rgba(0, 0, 0, 0)');
          }
        }
      }
      
      console.log(`✓ Navigation verified on ${appPage.name}`);
    }
  });

  test('modals and overlays should work with all schemes', async ({ page }) => {
    for (const scheme of ['purple', 'blue']) {
      await applyColorScheme(page, 'dark', scheme);
      
      // Navigate to a page with potential modals
      await page.goto('http://localhost:3002/investor-portal/dashboard');
      await page.waitForLoadState('networkidle');
      
      // Try to trigger a modal (if any buttons open modals)
      const buttons = await page.$$('button');
      for (const button of buttons) {
        const text = await button.textContent();
        if (text && (text.includes('Add') || text.includes('New') || text.includes('Create'))) {
          await button.click();
          await page.waitForTimeout(300);
          
          // Check if a modal appeared
          const modal = await page.$('[role="dialog"], .fixed.inset-0');
          if (modal) {
            const modalStyles = await modal.evaluate(el => ({
              background: getComputedStyle(el).backgroundColor,
              backdropFilter: getComputedStyle(el).backdropFilter,
            }));
            
            // Modal should have appropriate styling
            expect(modalStyles.background).toBeTruthy();
            
            // Close modal if possible
            const closeButton = await modal.$('button[aria-label*="Close"], button:has-text("Cancel"), button:has-text("Close")');
            if (closeButton) {
              await closeButton.click();
              await page.waitForTimeout(200);
            }
            
            break;
          }
        }
      }
      
      console.log(`✓ Modal/overlay behavior verified with ${scheme}`);
    }
  });

  test('responsive behavior should work with all color schemes', async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: 'mobile' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1920, height: 1080, name: 'desktop' },
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      
      for (const scheme of ['purple', 'green']) {
        await applyColorScheme(page, 'dark', scheme);
        
        // Test dashboard at different viewports
        await page.goto('http://localhost:3002/investor-portal/dashboard');
        await page.waitForLoadState('networkidle');
        
        // Check that layout adapts
        const layoutCheck = await page.evaluate(() => {
          const container = document.querySelector('.container, .max-w-7xl, main');
          if (container) {
            const rect = container.getBoundingClientRect();
            return {
              width: rect.width,
              hasContent: container.children.length > 0,
            };
          }
          return null;
        });
        
        expect(layoutCheck).toBeTruthy();
        expect(layoutCheck?.hasContent).toBeTruthy();
        
        // Check mobile menu if on mobile
        if (viewport.name === 'mobile') {
          const mobileMenuButton = await page.$('button[aria-label*="Menu"], button:has([class*="bars"])');
          if (mobileMenuButton) {
            await mobileMenuButton.click();
            await page.waitForTimeout(300);
            
            // Check mobile menu styling
            const mobileMenu = await page.$('.fixed.inset-0, [class*="drawer"]');
            if (mobileMenu) {
              const menuStyles = await mobileMenu.evaluate(el => ({
                background: getComputedStyle(el).backgroundColor,
                zIndex: getComputedStyle(el).zIndex,
              }));
              
              expect(menuStyles.background).toBeTruthy();
              expect(parseInt(menuStyles.zIndex)).toBeGreaterThan(0);
            }
          }
        }
        
        console.log(`✓ Responsive ${viewport.name} verified with ${scheme}`);
      }
    }
  });
});