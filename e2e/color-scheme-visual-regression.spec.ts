import { test, expect } from '@playwright/test';

// All possible combinations of themes and color schemes
const TEST_MATRIX = [
  { theme: 'dark', scheme: 'purple', name: 'Dark Purple (Default)' },
  { theme: 'dark', scheme: 'blue', name: 'Dark Electric Blue' },
  { theme: 'dark', scheme: 'green', name: 'Dark Racing Green' },
  { theme: 'dark', scheme: 'monochrome', name: 'Dark Monochrome' },
  { theme: 'light', scheme: 'purple', name: 'Light Purple' },
  { theme: 'light', scheme: 'blue', name: 'Light Electric Blue' },
  { theme: 'light', scheme: 'green', name: 'Light Racing Green' },
  { theme: 'light', scheme: 'monochrome', name: 'Light Monochrome' },
];

// Component sections to capture
const COMPONENT_SECTIONS = [
  { selector: '.sticky.top-0', name: 'header', description: 'Header with theme controls' },
  { selector: '#overview-section', name: 'overview', description: 'Overview section' },
  { selector: '#colors-section', name: 'colors', description: 'Color palette' },
  { selector: '#typography-section', name: 'typography', description: 'Typography examples' },
  { selector: '#components-section', name: 'components', description: 'Component showcase' },
  { selector: '#forms-section', name: 'forms', description: 'Form elements' },
  { selector: '#data-section', name: 'data', description: 'Data display' },
];

// Helper to apply theme and color scheme
async function applyThemeAndScheme(page: any, theme: string, scheme: string) {
  // Set theme
  const themeButton = theme.charAt(0).toUpperCase() + theme.slice(1);
  await page.click(`button:has-text("${themeButton}")`);
  await page.waitForTimeout(300);
  
  // Set color scheme
  const schemeButton = scheme === 'monochrome' ? 'Mono' : 
    scheme.charAt(0).toUpperCase() + scheme.slice(1);
  await page.click(`button:has-text("${schemeButton}")`);
  await page.waitForTimeout(500);
  
  // Verify applied
  const state = await page.evaluate(() => ({
    theme: document.documentElement.classList.contains('light') ? 'light' : 'dark',
    scheme: localStorage.getItem('equitie-color-scheme'),
  }));
  
  return state;
}

test.describe('Visual Regression - Color Schemes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3002/style-guide');
    await page.waitForLoadState('networkidle');
    
    // Ensure consistent viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
  });

  test('capture full page screenshots for all theme/scheme combinations', async ({ page }) => {
    for (const config of TEST_MATRIX) {
      // Apply theme and scheme
      const state = await applyThemeAndScheme(page, config.theme, config.scheme);
      
      // Verify state
      expect(state.theme).toBe(config.theme);
      expect(state.scheme).toBe(config.scheme);
      
      // Wait for any animations to complete
      await page.waitForTimeout(500);
      
      // Capture full page screenshot
      await page.screenshot({
        path: `test-results/visual-regression/full-page-${config.theme}-${config.scheme}.png`,
        fullPage: true,
      });
      
      console.log(`✓ Captured full page: ${config.name}`);
    }
  });

  test('capture component sections for each combination', async ({ page }) => {
    for (const config of TEST_MATRIX) {
      // Apply theme and scheme
      await applyThemeAndScheme(page, config.theme, config.scheme);
      
      // Navigate through tabs and capture each section
      const tabs = ['overview', 'colors', 'typography', 'components', 'forms', 'data'];
      
      for (const tab of tabs) {
        // Click on tab
        await page.click(`button:has-text("${tab.charAt(0).toUpperCase() + tab.slice(1)}")`);
        await page.waitForTimeout(300);
        
        // Capture the content area
        const contentArea = await page.$('.space-y-8');
        if (contentArea) {
          await contentArea.screenshot({
            path: `test-results/visual-regression/${tab}-${config.theme}-${config.scheme}.png`,
          });
          console.log(`✓ Captured ${tab} section: ${config.name}`);
        }
      }
    }
  });

  test('capture interactive states for buttons', async ({ page }) => {
    for (const config of TEST_MATRIX) {
      await applyThemeAndScheme(page, config.theme, config.scheme);
      
      // Navigate to components tab
      await page.click('button:has-text("Components")');
      await page.waitForTimeout(300);
      
      // Find button section
      const buttonSection = await page.$('div:has(> h3:has-text("Buttons"))');
      if (buttonSection) {
        // Normal state
        await buttonSection.screenshot({
          path: `test-results/visual-regression/buttons-normal-${config.theme}-${config.scheme}.png`,
        });
        
        // Hover state on primary button
        const primaryButton = await buttonSection.$('button:has-text("Primary")');
        if (primaryButton) {
          await primaryButton.hover();
          await page.waitForTimeout(100);
          await buttonSection.screenshot({
            path: `test-results/visual-regression/buttons-hover-${config.theme}-${config.scheme}.png`,
          });
        }
        
        console.log(`✓ Captured button states: ${config.name}`);
      }
    }
  });

  test('capture card variations', async ({ page }) => {
    for (const config of TEST_MATRIX) {
      await applyThemeAndScheme(page, config.theme, config.scheme);
      
      // Navigate to components tab
      await page.click('button:has-text("Components")');
      await page.waitForTimeout(300);
      
      // Find cards section
      const cardsSection = await page.$('div:has(> h3:has-text("Cards"))');
      if (cardsSection) {
        await cardsSection.screenshot({
          path: `test-results/visual-regression/cards-${config.theme}-${config.scheme}.png`,
        });
        console.log(`✓ Captured cards: ${config.name}`);
      }
    }
  });

  test('capture gradient effects', async ({ page }) => {
    for (const config of TEST_MATRIX) {
      await applyThemeAndScheme(page, config.theme, config.scheme);
      
      // Capture header with gradient text
      const header = await page.$('.text-gradient');
      if (header) {
        await header.screenshot({
          path: `test-results/visual-regression/gradient-text-${config.theme}-${config.scheme}.png`,
        });
      }
      
      // Navigate to components for gradient cards
      await page.click('button:has-text("Components")');
      await page.waitForTimeout(300);
      
      const gradientCard = await page.$('.bg-gradient-to-br');
      if (gradientCard) {
        await gradientCard.screenshot({
          path: `test-results/visual-regression/gradient-card-${config.theme}-${config.scheme}.png`,
        });
      }
      
      console.log(`✓ Captured gradients: ${config.name}`);
    }
  });

  test('capture glass morphism effects', async ({ page }) => {
    for (const config of TEST_MATRIX) {
      await applyThemeAndScheme(page, config.theme, config.scheme);
      
      // Find glass elements
      const glassElements = await page.$$('.glass, [class*="backdrop-blur"]');
      
      for (let i = 0; i < Math.min(glassElements.length, 3); i++) {
        await glassElements[i].screenshot({
          path: `test-results/visual-regression/glass-${i}-${config.theme}-${config.scheme}.png`,
        });
      }
      
      console.log(`✓ Captured glass effects: ${config.name}`);
    }
  });

  test('capture data visualization elements', async ({ page }) => {
    for (const config of TEST_MATRIX) {
      await applyThemeAndScheme(page, config.theme, config.scheme);
      
      // Navigate to data tab
      await page.click('button:has-text("Data Display")');
      await page.waitForTimeout(300);
      
      // Capture table
      const table = await page.$('table');
      if (table) {
        await table.screenshot({
          path: `test-results/visual-regression/table-${config.theme}-${config.scheme}.png`,
        });
      }
      
      // Capture badges and status indicators
      const badges = await page.$('div:has(> h3:has-text("Status"))');
      if (badges) {
        await badges.screenshot({
          path: `test-results/visual-regression/badges-${config.theme}-${config.scheme}.png`,
        });
      }
      
      console.log(`✓ Captured data elements: ${config.name}`);
    }
  });

  test('capture form elements', async ({ page }) => {
    for (const config of TEST_MATRIX) {
      await applyThemeAndScheme(page, config.theme, config.scheme);
      
      // Navigate to forms tab
      await page.click('button:has-text("Forms")');
      await page.waitForTimeout(300);
      
      const formSection = await page.$('.space-y-8');
      if (formSection) {
        // Normal state
        await formSection.screenshot({
          path: `test-results/visual-regression/forms-normal-${config.theme}-${config.scheme}.png`,
        });
        
        // Focus state on input
        const input = await formSection.$('input[type="text"]');
        if (input) {
          await input.focus();
          await page.waitForTimeout(100);
          await formSection.screenshot({
            path: `test-results/visual-regression/forms-focus-${config.theme}-${config.scheme}.png`,
          });
        }
      }
      
      console.log(`✓ Captured form elements: ${config.name}`);
    }
  });

  test('capture animation states', async ({ page }) => {
    for (const config of TEST_MATRIX) {
      await applyThemeAndScheme(page, config.theme, config.scheme);
      
      // Navigate to motion tab
      await page.click('button:has-text("Motion")');
      await page.waitForTimeout(300);
      
      // Capture animated elements at different points
      const animatedSection = await page.$('.space-y-8');
      if (animatedSection) {
        // Initial state
        await animatedSection.screenshot({
          path: `test-results/visual-regression/animation-start-${config.theme}-${config.scheme}.png`,
        });
        
        // Mid animation (wait for animation to be in progress)
        await page.waitForTimeout(1000);
        await animatedSection.screenshot({
          path: `test-results/visual-regression/animation-mid-${config.theme}-${config.scheme}.png`,
        });
      }
      
      console.log(`✓ Captured animations: ${config.name}`);
    }
  });

  test('verify color consistency across components', async ({ page }) => {
    for (const config of TEST_MATRIX) {
      await applyThemeAndScheme(page, config.theme, config.scheme);
      
      // Collect color values from various elements
      const colorSamples = await page.evaluate(() => {
        const samples: Record<string, string> = {};
        
        // Sample primary button
        const primaryBtn = document.querySelector('.bg-primary-300');
        if (primaryBtn) {
          samples.primaryButton = getComputedStyle(primaryBtn).backgroundColor;
        }
        
        // Sample primary text
        const primaryText = document.querySelector('.text-primary-300');
        if (primaryText) {
          samples.primaryText = getComputedStyle(primaryText).color;
        }
        
        // Sample border
        const primaryBorder = document.querySelector('.border-primary-300');
        if (primaryBorder) {
          samples.primaryBorder = getComputedStyle(primaryBorder).borderColor;
        }
        
        return samples;
      });
      
      // Verify colors are consistent (all using the same primary-300 value)
      const colorValues = Object.values(colorSamples);
      if (colorValues.length > 1) {
        const firstColor = colorValues[0];
        for (const color of colorValues) {
          // Colors should be the same (accounting for rgb vs rgba format)
          expect(color).toContain(firstColor.replace('rgb(', '').replace(')', '').split(',').slice(0, 3).join(',').trim());
        }
      }
      
      console.log(`✓ Verified color consistency: ${config.name}`);
    }
  });
});

test.describe('Visual Regression - Responsive Design', () => {
  const VIEWPORTS = [
    { name: 'mobile', width: 375, height: 667 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1920, height: 1080 },
  ];

  test('capture responsive layouts for each color scheme', async ({ page }) => {
    await page.goto('http://localhost:3002/style-guide');
    
    for (const viewport of VIEWPORTS) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      
      for (const scheme of ['purple', 'blue', 'green', 'monochrome']) {
        await applyThemeAndScheme(page, 'dark', scheme);
        
        await page.screenshot({
          path: `test-results/visual-regression/responsive-${viewport.name}-${scheme}.png`,
          fullPage: false,
        });
        
        console.log(`✓ Captured ${viewport.name} layout with ${scheme} scheme`);
      }
    }
  });
});

test.describe('Visual Regression - Accessibility', () => {
  test('capture focus states for all color schemes', async ({ page }) => {
    await page.goto('http://localhost:3002/style-guide');
    
    for (const config of TEST_MATRIX) {
      await applyThemeAndScheme(page, config.theme, config.scheme);
      
      // Tab through interactive elements
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);
      
      // Capture focused element
      const focusedElement = await page.evaluateHandle(() => document.activeElement);
      if (focusedElement) {
        await focusedElement.screenshot({
          path: `test-results/visual-regression/focus-${config.theme}-${config.scheme}.png`,
        });
      }
      
      console.log(`✓ Captured focus state: ${config.name}`);
    }
  });
});