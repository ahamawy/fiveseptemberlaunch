import { test, expect } from '@playwright/test';

// Expected color values for each scheme
const EXPECTED_COLORS = {
  purple: {
    primary300: '200 152 255',
    primary500: '163 100 225',
    primary700: '122 48 195',
    accentBlue: '102 208 255',
    accentGreen: '52 211 153',
  },
  blue: {
    primary300: '96 165 250',
    primary500: '37 99 235',
    primary700: '30 64 175',
    accentBlue: '14 165 233',
    accentGreen: '16 185 129',
  },
  green: {
    primary300: '34 197 94',
    primary500: '21 128 61',
    primary700: '21 83 43',
    accentBlue: '6 182 212',
    accentGreen: '5 150 105',
  },
  monochrome: {
    primary300: '156 163 175',
    primary500: '75 85 99',
    primary700: '31 41 55',
    accentBlue: '59 130 246',
    accentGreen: '34 197 94',
  },
};

test.describe('Comprehensive Color Scheme Test', () => {
  test('Validate all color schemes with complete assertions', async ({ page }) => {
    await page.goto('http://localhost:3002/style-guide');
    await page.waitForLoadState('networkidle');
    
    const combinations = [
      { theme: 'dark', scheme: 'purple' },
      { theme: 'dark', scheme: 'blue' },
      { theme: 'dark', scheme: 'green' },
      { theme: 'dark', scheme: 'monochrome' },
      { theme: 'light', scheme: 'purple' },
      { theme: 'light', scheme: 'blue' },
      { theme: 'light', scheme: 'green' },
      { theme: 'light', scheme: 'monochrome' },
    ];
    
    const testResults: any[] = [];
    
    for (const { theme, scheme } of combinations) {
      // Set theme
      await page.click(`button:has-text("${theme.charAt(0).toUpperCase() + theme.slice(1)}")`);
      await page.waitForTimeout(300);
      
      // Set color scheme
      const schemeButtonText = scheme === 'monochrome' ? 'Mono' : scheme.charAt(0).toUpperCase() + scheme.slice(1);
      await page.click(`button:has-text("${schemeButtonText}")`);
      await page.waitForTimeout(500);
      
      // Get comprehensive CSS variables and computed styles
      const testData = await page.evaluate(() => {
        const root = document.documentElement;
        const styles = getComputedStyle(root);
        
        // Get all color variables
        const colorVars = {
          // Primary colors
          primary50: styles.getPropertyValue('--primary-50').trim(),
          primary100: styles.getPropertyValue('--primary-100').trim(),
          primary200: styles.getPropertyValue('--primary-200').trim(),
          primary300: styles.getPropertyValue('--primary-300').trim(),
          primary400: styles.getPropertyValue('--primary-400').trim(),
          primary500: styles.getPropertyValue('--primary-500').trim(),
          primary600: styles.getPropertyValue('--primary-600').trim(),
          primary700: styles.getPropertyValue('--primary-700').trim(),
          primary800: styles.getPropertyValue('--primary-800').trim(),
          primary900: styles.getPropertyValue('--primary-900').trim(),
          
          // Accent colors
          accentBlue: styles.getPropertyValue('--accent-blue').trim(),
          accentGreen: styles.getPropertyValue('--accent-green').trim(),
          accentOrange: styles.getPropertyValue('--accent-orange').trim(),
          accentYellow: styles.getPropertyValue('--accent-yellow').trim(),
          accentPink: styles.getPropertyValue('--accent-pink').trim(),
          accentPurple: styles.getPropertyValue('--accent-purple').trim(),
          accentTeal: styles.getPropertyValue('--accent-teal').trim(),
          accentRed: styles.getPropertyValue('--accent-red').trim(),
          
          // Background colors
          bgDeep: styles.getPropertyValue('--bg-deep').trim(),
          bgMain: styles.getPropertyValue('--bg-main').trim(),
          bgSurface: styles.getPropertyValue('--bg-surface').trim(),
          
          // Text colors
          textPrimary: styles.getPropertyValue('--text-primary').trim(),
          textSecondary: styles.getPropertyValue('--text-secondary').trim(),
        };
        
        // Check component styles
        const components = {
          primaryButton: null as string | null,
          glassCard: null as string | null,
          gradientText: null as string | null,
        };
        
        const primaryBtn = document.querySelector('.bg-primary-300');
        if (primaryBtn) {
          components.primaryButton = getComputedStyle(primaryBtn).backgroundColor;
        }
        
        const glassCard = document.querySelector('[class*="backdrop-blur"]');
        if (glassCard) {
          components.glassCard = getComputedStyle(glassCard).backdropFilter;
        }
        
        const gradientText = document.querySelector('.text-gradient');
        if (gradientText) {
          components.gradientText = getComputedStyle(gradientText).backgroundImage;
        }
        
        return {
          theme: document.documentElement.classList.contains('light') ? 'light' : 'dark',
          scheme: localStorage.getItem('equitie-color-scheme'),
          colorVars,
          components,
        };
      });
      
      // Validate color scheme is correctly applied
      expect(testData.scheme).toBe(scheme);
      expect(testData.theme).toBe(theme);
      
      // Validate primary colors match expected values
      const expectedScheme = EXPECTED_COLORS[scheme as keyof typeof EXPECTED_COLORS];
      expect(testData.colorVars.primary300).toBe(expectedScheme.primary300);
      expect(testData.colorVars.primary500).toBe(expectedScheme.primary500);
      expect(testData.colorVars.primary700).toBe(expectedScheme.primary700);
      
      // Validate accent colors
      expect(testData.colorVars.accentBlue).toBe(expectedScheme.accentBlue);
      expect(testData.colorVars.accentGreen).toBe(expectedScheme.accentGreen);
      
      // Validate theme-specific background colors
      if (theme === 'light') {
        // Light theme should have light backgrounds
        expect(testData.colorVars.bgMain).toMatch(/2\d\d \d+ \d+|255 255 255/);
        expect(testData.colorVars.textPrimary).toMatch(/\d{1,2} \d{1,2} \d{1,2}/); // Dark text on light bg
      } else {
        // Dark theme should have dark backgrounds
        expect(testData.colorVars.bgDeep).toMatch(/\d{1,2} \d{1,2} \d{1,2}/);
        expect(testData.colorVars.textPrimary).toBe('255 255 255'); // White text on dark bg
      }
      
      // Validate components are using the correct colors
      if (testData.components.primaryButton) {
        const [r, g, b] = expectedScheme.primary300.split(' ');
        expect(testData.components.primaryButton).toContain(`${r}, ${g}, ${b}`);
      }
      
      if (testData.components.glassCard) {
        expect(testData.components.glassCard).toContain('blur');
      }
      
      if (testData.components.gradientText) {
        expect(testData.components.gradientText).toContain('gradient');
      }
      
      // Store results for summary
      testResults.push({
        combination: `${theme}-${scheme}`,
        passed: true,
        cssVars: testData.colorVars,
      });
      
      console.log(`✅ ${theme}-${scheme}: All assertions passed`);
      
      // Take screenshot with metadata in filename
      await page.screenshot({ 
        path: `test-results/comprehensive-${theme}-${scheme}-validated.png`,
        fullPage: false
      });
    }
    
    // Summary validation
    expect(testResults.length).toBe(8); // All 8 combinations tested
    expect(testResults.every(r => r.passed)).toBeTruthy(); // All tests passed
    
    console.log('\n📊 Test Summary:');
    console.log(`Total combinations tested: ${testResults.length}`);
    console.log(`All tests passed: ${testResults.every(r => r.passed)}`);
  });
  
  test('Verify color persistence and transitions', async ({ page }) => {
    await page.goto('http://localhost:3002/style-guide');
    await page.waitForLoadState('networkidle');
    
    // Test 1: Color scheme persists across page reload
    await page.click('button:has-text("Green")');
    await page.waitForTimeout(300);
    
    let currentScheme = await page.evaluate(() => localStorage.getItem('equitie-color-scheme'));
    expect(currentScheme).toBe('green');
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    currentScheme = await page.evaluate(() => localStorage.getItem('equitie-color-scheme'));
    expect(currentScheme).toBe('green');
    
    const cssVars = await page.evaluate(() => {
      const root = document.documentElement;
      return getComputedStyle(root).getPropertyValue('--primary-300').trim();
    });
    expect(cssVars).toBe(EXPECTED_COLORS.green.primary300);
    
    // Test 2: Smooth transitions between schemes
    const schemes = ['purple', 'blue', 'green', 'monochrome'];
    for (const scheme of schemes) {
      const buttonText = scheme === 'monochrome' ? 'Mono' : scheme.charAt(0).toUpperCase() + scheme.slice(1);
      await page.click(`button:has-text("${buttonText}")`);
      await page.waitForTimeout(200);
      
      const appliedScheme = await page.evaluate(() => localStorage.getItem('equitie-color-scheme'));
      expect(appliedScheme).toBe(scheme);
      
      const primaryColor = await page.evaluate(() => {
        const root = document.documentElement;
        return getComputedStyle(root).getPropertyValue('--primary-300').trim();
      });
      expect(primaryColor).toBe(EXPECTED_COLORS[scheme as keyof typeof EXPECTED_COLORS].primary300);
    }
    
    console.log('✅ Color persistence and transitions validated');
  });
  
  test('Validate gradient and animation compatibility', async ({ page }) => {
    await page.goto('http://localhost:3002/style-guide');
    await page.waitForLoadState('networkidle');
    
    for (const scheme of ['purple', 'blue', 'green', 'monochrome']) {
      const buttonText = scheme === 'monochrome' ? 'Mono' : scheme.charAt(0).toUpperCase() + scheme.slice(1);
      await page.click(`button:has-text("${buttonText}")`);
      await page.waitForTimeout(300);
      
      // Check gradient text animation
      const gradientAnimation = await page.evaluate(() => {
        const element = document.querySelector('.animate-gradient');
        if (element) {
          const styles = getComputedStyle(element);
          return {
            animation: styles.animation,
            backgroundImage: styles.backgroundImage,
          };
        }
        return null;
      });
      
      if (gradientAnimation) {
        expect(gradientAnimation.animation).toContain('gradient');
        expect(gradientAnimation.backgroundImage).toContain('linear-gradient');
      }
      
      // Check pulse animations
      await page.click('button:has-text("Motion")');
      await page.waitForTimeout(300);
      
      const pulseElements = await page.$$eval('[class*="animate-pulse"]', elements => 
        elements.map(el => getComputedStyle(el).animation)
      );
      
      for (const animation of pulseElements) {
        expect(animation).toContain('pulse');
      }
      
      console.log(`✅ Gradients and animations work with ${scheme} scheme`);
    }
  });
});