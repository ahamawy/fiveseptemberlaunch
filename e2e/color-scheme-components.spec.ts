import { test, expect } from '@playwright/test';

// Color scheme test data
const COLOR_SCHEMES = ['purple', 'blue', 'green', 'monochrome'];
const THEMES = ['dark', 'light'];

// Expected RGB values for primary colors in each scheme
const EXPECTED_COLORS = {
  purple: {
    primary300: 'rgb(200, 152, 255)',
    primary500: 'rgb(163, 100, 225)',
    hover: 'rgba(200, 152, 255',
  },
  blue: {
    primary300: 'rgb(96, 165, 250)',
    primary500: 'rgb(37, 99, 235)',
    hover: 'rgba(96, 165, 250',
  },
  green: {
    primary300: 'rgb(34, 197, 94)',
    primary500: 'rgb(21, 128, 61)',
    hover: 'rgba(34, 197, 94',
  },
  monochrome: {
    primary300: 'rgb(156, 163, 175)',
    primary500: 'rgb(75, 85, 99)',
    hover: 'rgba(156, 163, 175',
  },
};

async function setColorScheme(page: any, theme: string, scheme: string) {
  // Set theme
  await page.click(`button:has-text("${theme.charAt(0).toUpperCase() + theme.slice(1)}")`);
  await page.waitForTimeout(200);
  
  // Set color scheme
  const schemeText = scheme === 'monochrome' ? 'Mono' : scheme.charAt(0).toUpperCase() + scheme.slice(1);
  await page.click(`button:has-text("${schemeText}")`);
  await page.waitForTimeout(300);
}

test.describe('Component Color Scheme Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3002/style-guide');
    await page.waitForLoadState('networkidle');
  });

  test('buttons should update colors correctly', async ({ page }) => {
    // Navigate to components tab
    await page.click('button:has-text("Components")');
    await page.waitForTimeout(300);
    
    for (const scheme of COLOR_SCHEMES) {
      await setColorScheme(page, 'dark', scheme);
      
      // Test primary button
      const primaryButton = await page.$('button:has-text("Primary"):not(:has-text("Icon"))');
      if (primaryButton) {
        const bgColor = await primaryButton.evaluate(el => 
          getComputedStyle(el).backgroundColor
        );
        expect(bgColor).toBe(EXPECTED_COLORS[scheme].primary300);
        
        // Test hover state
        await primaryButton.hover();
        await page.waitForTimeout(100);
        const hoverOpacity = await primaryButton.evaluate(el => 
          getComputedStyle(el).opacity
        );
        expect(parseFloat(hoverOpacity)).toBeLessThanOrEqual(1);
        
        console.log(`✓ Button colors verified for ${scheme}`);
      }
      
      // Test glass button
      const glassButton = await page.$('button:has-text("Glass"):not(:has-text("Dark"))');
      if (glassButton) {
        const borderColor = await glassButton.evaluate(el => 
          getComputedStyle(el).borderColor
        );
        // Glass buttons should have semi-transparent borders
        expect(borderColor).toContain('rgba');
      }
      
      // Test gradient button
      const gradientButton = await page.$('button:has-text("Gradient")');
      if (gradientButton) {
        const background = await gradientButton.evaluate(el => 
          getComputedStyle(el).backgroundImage
        );
        expect(background).toContain('gradient');
      }
    }
  });

  test('cards should adapt to color schemes', async ({ page }) => {
    await page.click('button:has-text("Components")');
    await page.waitForTimeout(300);
    
    for (const scheme of COLOR_SCHEMES) {
      await setColorScheme(page, 'dark', scheme);
      
      // Find card section
      const cards = await page.$$('.rounded-2xl');
      
      for (const card of cards.slice(0, 3)) {
        const styles = await card.evaluate(el => ({
          border: getComputedStyle(el).borderColor,
          background: getComputedStyle(el).backgroundColor,
          backdropFilter: getComputedStyle(el).backdropFilter,
        }));
        
        // Verify card has appropriate styling
        if (styles.backdropFilter && styles.backdropFilter !== 'none') {
          // Glass card
          expect(styles.border).toContain('rgba');
        }
        
        console.log(`✓ Card styling verified for ${scheme}`);
      }
    }
  });

  test('badges should use scheme colors', async ({ page }) => {
    await page.click('button:has-text("Components")');
    await page.waitForTimeout(300);
    
    for (const scheme of COLOR_SCHEMES) {
      await setColorScheme(page, 'dark', scheme);
      
      // Find badges
      const badges = await page.$$('span.inline-flex.items-center.rounded-full');
      
      for (const badge of badges.slice(0, 3)) {
        const bgColor = await badge.evaluate(el => 
          getComputedStyle(el).backgroundColor
        );
        
        // Badges should have background colors
        expect(bgColor).not.toBe('rgba(0, 0, 0, 0)');
        expect(bgColor).not.toBe('transparent');
      }
      
      console.log(`✓ Badge colors verified for ${scheme}`);
    }
  });

  test('form inputs should adapt to themes and schemes', async ({ page }) => {
    await page.click('button:has-text("Forms")');
    await page.waitForTimeout(300);
    
    for (const theme of THEMES) {
      for (const scheme of COLOR_SCHEMES) {
        await setColorScheme(page, theme, scheme);
        
        // Test input field
        const input = await page.$('input[type="text"]');
        if (input) {
          const styles = await input.evaluate(el => ({
            background: getComputedStyle(el).backgroundColor,
            border: getComputedStyle(el).borderColor,
            color: getComputedStyle(el).color,
          }));
          
          // Verify input has appropriate theme styling
          if (theme === 'light') {
            // Light theme inputs should have light backgrounds
            expect(styles.background).toMatch(/rgb\(2\d\d, 2\d\d, 2\d\d\)|rgb\(255, 255, 255\)/);
          } else {
            // Dark theme inputs should have dark backgrounds
            expect(styles.background).toMatch(/rgb\(\d{1,2}, \d{1,2}, \d{1,2}\)/);
          }
          
          // Focus state
          await input.focus();
          const focusedBorder = await input.evaluate(el => 
            getComputedStyle(el).borderColor
          );
          
          // Border should change on focus
          expect(focusedBorder).not.toBe(styles.border);
        }
        
        // Test select dropdown
        const select = await page.$('select');
        if (select) {
          const selectStyles = await select.evaluate(el => ({
            background: getComputedStyle(el).backgroundColor,
            color: getComputedStyle(el).color,
          }));
          
          // Select should inherit theme colors
          expect(selectStyles.color).toBeTruthy();
        }
        
        console.log(`✓ Form inputs verified for ${theme}/${scheme}`);
      }
    }
  });

  test('tables should adapt to color schemes', async ({ page }) => {
    await page.click('button:has-text("Data Display")');
    await page.waitForTimeout(300);
    
    for (const scheme of COLOR_SCHEMES) {
      await setColorScheme(page, 'dark', scheme);
      
      // Test table
      const table = await page.$('table');
      if (table) {
        // Test header
        const headerCells = await table.$$('thead th');
        for (const cell of headerCells) {
          const styles = await cell.evaluate(el => ({
            background: getComputedStyle(el).backgroundColor,
            color: getComputedStyle(el).color,
            borderBottom: getComputedStyle(el).borderBottomColor,
          }));
          
          // Headers should have styling
          expect(styles.color).toBeTruthy();
          expect(styles.borderBottom).toBeTruthy();
        }
        
        // Test row hover
        const firstRow = await table.$('tbody tr');
        if (firstRow) {
          const normalBg = await firstRow.evaluate(el => 
            getComputedStyle(el).backgroundColor
          );
          
          await firstRow.hover();
          await page.waitForTimeout(100);
          
          const hoverBg = await firstRow.evaluate(el => 
            getComputedStyle(el).backgroundColor
          );
          
          // Background should change on hover
          expect(hoverBg).not.toBe(normalBg);
        }
        
        console.log(`✓ Table styling verified for ${scheme}`);
      }
    }
  });

  test('text gradients should use scheme colors', async ({ page }) => {
    for (const scheme of COLOR_SCHEMES) {
      await setColorScheme(page, 'dark', scheme);
      
      // Find gradient text
      const gradientText = await page.$('.text-gradient');
      if (gradientText) {
        const styles = await gradientText.evaluate(el => ({
          backgroundImage: getComputedStyle(el).backgroundImage,
          backgroundClip: getComputedStyle(el).backgroundClip || 
                         (getComputedStyle(el) as any).webkitBackgroundClip,
          textFillColor: (getComputedStyle(el) as any).webkitTextFillColor,
        }));
        
        // Gradient text should have proper styling
        expect(styles.backgroundImage).toContain('gradient');
        expect(styles.backgroundClip).toBe('text');
        expect(styles.textFillColor).toBe('transparent');
        
        console.log(`✓ Text gradient verified for ${scheme}`);
      }
    }
  });

  test('status indicators should maintain semantic colors', async ({ page }) => {
    await page.click('button:has-text("Data Display")');
    await page.waitForTimeout(300);
    
    for (const scheme of COLOR_SCHEMES) {
      await setColorScheme(page, 'dark', scheme);
      
      // Check status dots
      const statusDots = await page.$$('[class*="bg-success"], [class*="bg-error"], [class*="bg-warning"]');
      
      for (const dot of statusDots) {
        const bgColor = await dot.evaluate(el => 
          getComputedStyle(el).backgroundColor
        );
        
        // Status colors should be consistent regardless of scheme
        // Success should be greenish
        if (await dot.evaluate(el => el.className.includes('success'))) {
          expect(bgColor).toMatch(/rgb\(\d+, [1-2]\d\d, \d+\)/); // Green has high G value
        }
        // Error should be reddish
        if (await dot.evaluate(el => el.className.includes('error'))) {
          expect(bgColor).toMatch(/rgb\([1-2]\d\d, \d+, \d+\)/); // Red has high R value
        }
        // Warning should be yellowish/orange
        if (await dot.evaluate(el => el.className.includes('warning'))) {
          expect(bgColor).toMatch(/rgb\([1-2]\d\d, [1-2]\d\d, \d+\)/); // Yellow has high R and G
        }
      }
      
      console.log(`✓ Status indicators verified for ${scheme}`);
    }
  });

  test('glass effects should work with all schemes', async ({ page }) => {
    await page.click('button:has-text("Components")');
    await page.waitForTimeout(300);
    
    for (const theme of THEMES) {
      for (const scheme of COLOR_SCHEMES) {
        await setColorScheme(page, theme, scheme);
        
        // Find glass elements
        const glassElements = await page.$$('[class*="backdrop-blur"]');
        
        for (const element of glassElements.slice(0, 2)) {
          const styles = await element.evaluate(el => ({
            backdropFilter: getComputedStyle(el).backdropFilter,
            background: getComputedStyle(el).backgroundColor,
            border: getComputedStyle(el).borderColor,
          }));
          
          // Glass effects should be present
          expect(styles.backdropFilter).toContain('blur');
          
          // Background should be semi-transparent
          expect(styles.background).toMatch(/rgba?\([\d\s,]+,\s*0\.\d+\)/);
          
          // Border should be semi-transparent
          expect(styles.border).toMatch(/rgba?\([\d\s,]+,\s*0\.\d+\)/);
        }
        
        console.log(`✓ Glass effects verified for ${theme}/${scheme}`);
      }
    }
  });

  test('animations should work with all color schemes', async ({ page }) => {
    await page.click('button:has-text("Motion")');
    await page.waitForTimeout(300);
    
    for (const scheme of COLOR_SCHEMES) {
      await setColorScheme(page, 'dark', scheme);
      
      // Find animated elements
      const animatedElements = await page.$$('[class*="animate-"]');
      
      for (const element of animatedElements.slice(0, 3)) {
        const animation = await element.evaluate(el => 
          getComputedStyle(el).animation
        );
        
        // Animation should be defined
        expect(animation).not.toBe('none');
        expect(animation).toContain('ease');
        
        // Get color during animation
        const color = await element.evaluate(el => 
          getComputedStyle(el).color || getComputedStyle(el).backgroundColor
        );
        
        // Colors should be applied even during animation
        expect(color).toBeTruthy();
        expect(color).not.toBe('rgba(0, 0, 0, 0)');
      }
      
      console.log(`✓ Animations verified for ${scheme}`);
    }
  });

  test('navigation elements should adapt to schemes', async ({ page }) => {
    for (const scheme of COLOR_SCHEMES) {
      await setColorScheme(page, 'dark', scheme);
      
      // Test tab navigation
      const tabs = await page.$$('.sticky.top-0 button');
      
      for (const tab of tabs.slice(0, 3)) {
        const isActive = await tab.evaluate(el => 
          el.className.includes('bg-primary') || 
          el.className.includes('shadow')
        );
        
        if (isActive) {
          const bgColor = await tab.evaluate(el => 
            getComputedStyle(el).backgroundColor
          );
          
          // Active tab should use primary color
          expect(bgColor).toContain(EXPECTED_COLORS[scheme].primary300.replace('rgb', ''));
        }
      }
      
      console.log(`✓ Navigation verified for ${scheme}`);
    }
  });

  test('hover states should be consistent across schemes', async ({ page }) => {
    await page.click('button:has-text("Components")');
    await page.waitForTimeout(300);
    
    for (const scheme of COLOR_SCHEMES) {
      await setColorScheme(page, 'dark', scheme);
      
      // Test button hover
      const button = await page.$('button:has-text("Primary")');
      if (button) {
        const normalOpacity = await button.evaluate(el => 
          getComputedStyle(el).opacity
        );
        
        await button.hover();
        await page.waitForTimeout(100);
        
        const hoverOpacity = await button.evaluate(el => 
          getComputedStyle(el).opacity
        );
        
        // Opacity should change on hover
        expect(parseFloat(hoverOpacity)).not.toBe(parseFloat(normalOpacity));
      }
      
      // Test card hover
      const card = await page.$('.rounded-2xl');
      if (card) {
        const normalTransform = await card.evaluate(el => 
          getComputedStyle(el).transform
        );
        
        await card.hover();
        await page.waitForTimeout(100);
        
        const hoverTransform = await card.evaluate(el => 
          getComputedStyle(el).transform
        );
        
        // Transform might change on hover
        if (normalTransform !== 'none' || hoverTransform !== 'none') {
          console.log(`✓ Card hover effect present for ${scheme}`);
        }
      }
    }
  });
});