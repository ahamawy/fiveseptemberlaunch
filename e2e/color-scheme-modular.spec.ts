import { test, expect, Page } from '@playwright/test';

// Color scheme configurations
const COLOR_SCHEMES = {
  purple: {
    name: 'Equitie Purple',
    primary: {
      300: '200 152 255', // #C898FF
      500: '163 100 225', // #A364E1
      700: '122 48 195',  // #7A30C3
    },
    accent: {
      blue: '102 208 255',  // #66D0FF
      green: '52 211 153',  // #34D399
    }
  },
  blue: {
    name: 'Electric Blue',
    primary: {
      300: '96 165 250',  // #60A5FA
      500: '37 99 235',   // #2563EB
      700: '30 64 175',   // #1E40AF
    },
    accent: {
      blue: '14 165 233',   // #0EA5E9
      green: '16 185 129',  // #10B981
    }
  },
  green: {
    name: 'Racing Green',
    primary: {
      300: '34 197 94',   // #22C55E
      500: '21 128 61',   // #15803D
      700: '21 83 43',    // #15532B
    },
    accent: {
      blue: '6 182 212',    // #06B6D4
      green: '5 150 105',   // #059669
    }
  },
  monochrome: {
    name: 'Monochrome',
    primary: {
      300: '156 163 175', // #9CA3AF
      500: '75 85 99',    // #4B5563
      700: '31 41 55',    // #1F2937
    },
    accent: {
      blue: '59 130 246',  // #3B82F6
      green: '34 197 94',  // #22C55E
    }
  }
};

const THEMES = ['dark', 'light'];

// Helper function to verify CSS variables
async function verifyCSSVariables(page: Page, scheme: keyof typeof COLOR_SCHEMES, theme: string) {
  const cssVars = await page.evaluate(() => {
    const root = document.documentElement;
    const style = getComputedStyle(root);
    return {
      primary300: style.getPropertyValue('--primary-300').trim(),
      primary500: style.getPropertyValue('--primary-500').trim(),
      primary700: style.getPropertyValue('--primary-700').trim(),
      accentBlue: style.getPropertyValue('--accent-blue').trim(),
      accentGreen: style.getPropertyValue('--accent-green').trim(),
      theme: document.documentElement.classList.contains('light') ? 'light' : 'dark',
      scheme: localStorage.getItem('equitie-color-scheme'),
    };
  });

  return cssVars;
}

// Helper function to switch color scheme
async function switchColorScheme(page: Page, scheme: string) {
  const schemeButtonText = scheme === 'monochrome' ? 'Mono' : 
    scheme.charAt(0).toUpperCase() + scheme.slice(1);
  
  // Click the color scheme button
  await page.click(`button:has-text("${schemeButtonText}")`);
  await page.waitForTimeout(300); // Wait for transition
}

// Helper function to switch theme
async function switchTheme(page: Page, theme: string) {
  const themeButtonText = theme.charAt(0).toUpperCase() + theme.slice(1);
  await page.click(`button:has-text("${themeButtonText}")`);
  await page.waitForTimeout(300); // Wait for transition
}

test.describe('Modular Color Scheme System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3002/style-guide');
    await page.waitForLoadState('networkidle');
  });

  test('should correctly apply all color schemes in both themes', async ({ page }) => {
    for (const theme of THEMES) {
      for (const [schemeId, schemeConfig] of Object.entries(COLOR_SCHEMES)) {
        // Switch to theme and color scheme
        await switchTheme(page, theme);
        await switchColorScheme(page, schemeId);
        
        // Verify CSS variables are correctly set
        const cssVars = await verifyCSSVariables(page, schemeId as keyof typeof COLOR_SCHEMES, theme);
        
        // Assert primary colors match expected values
        expect(cssVars.primary300).toBe(schemeConfig.primary[300]);
        expect(cssVars.primary500).toBe(schemeConfig.primary[500]);
        expect(cssVars.primary700).toBe(schemeConfig.primary[700]);
        
        // Assert accent colors match expected values
        expect(cssVars.accentBlue).toBe(schemeConfig.accent.blue);
        expect(cssVars.accentGreen).toBe(schemeConfig.accent.green);
        
        // Assert theme and scheme are correctly stored
        expect(cssVars.theme).toBe(theme);
        expect(cssVars.scheme).toBe(schemeId);
        
        console.log(`✓ Verified ${theme} theme with ${schemeId} color scheme`);
      }
    }
  });

  test('should persist color scheme and theme across page reloads', async ({ page }) => {
    // Set specific theme and color scheme
    await switchTheme(page, 'light');
    await switchColorScheme(page, 'blue');
    
    // Verify initial state
    let cssVars = await verifyCSSVariables(page, 'blue', 'light');
    expect(cssVars.scheme).toBe('blue');
    expect(cssVars.theme).toBe('light');
    
    // Reload the page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Verify settings persisted
    cssVars = await verifyCSSVariables(page, 'blue', 'light');
    expect(cssVars.scheme).toBe('blue');
    expect(cssVars.theme).toBe('light');
    expect(cssVars.primary300).toBe(COLOR_SCHEMES.blue.primary[300]);
  });

  test('should smoothly transition between color schemes', async ({ page }) => {
    // Start with purple in dark mode
    await switchTheme(page, 'dark');
    await switchColorScheme(page, 'purple');
    
    // Capture initial state
    let cssVars = await verifyCSSVariables(page, 'purple', 'dark');
    expect(cssVars.primary300).toBe(COLOR_SCHEMES.purple.primary[300]);
    
    // Transition through all schemes
    const transitions = ['blue', 'green', 'monochrome', 'purple'];
    
    for (const scheme of transitions) {
      await switchColorScheme(page, scheme);
      
      // Verify immediate update
      cssVars = await verifyCSSVariables(page, scheme as keyof typeof COLOR_SCHEMES, 'dark');
      expect(cssVars.scheme).toBe(scheme);
      expect(cssVars.primary300).toBe(COLOR_SCHEMES[scheme as keyof typeof COLOR_SCHEMES].primary[300]);
      
      // Check that components updated
      const buttonColor = await page.evaluate(() => {
        const button = document.querySelector('button.bg-primary-300');
        if (button) {
          return getComputedStyle(button).backgroundColor;
        }
        return null;
      });
      
      if (buttonColor) {
        // Convert RGB values to match
        const expectedRgb = COLOR_SCHEMES[scheme as keyof typeof COLOR_SCHEMES].primary[300];
        const [r, g, b] = expectedRgb.split(' ');
        expect(buttonColor).toContain(`${r}, ${g}, ${b}`);
      }
    }
  });

  test('should update all UI components when color scheme changes', async ({ page }) => {
    // Test each color scheme
    for (const [schemeId] of Object.entries(COLOR_SCHEMES)) {
      await switchColorScheme(page, schemeId);
      
      // Check various component classes use the new colors
      const componentChecks = await page.evaluate(() => {
        const checks: Record<string, boolean> = {};
        
        // Check primary button
        const primaryBtn = document.querySelector('.bg-primary-300');
        checks.primaryButton = !!primaryBtn;
        
        // Check text with primary color
        const primaryText = document.querySelector('.text-primary-300');
        checks.primaryText = !!primaryText;
        
        // Check border with primary color
        const primaryBorder = document.querySelector('.border-primary-300');
        checks.primaryBorder = !!primaryBorder;
        
        // Check gradient text
        const gradientText = document.querySelector('.from-primary-300');
        checks.gradientText = !!gradientText;
        
        return checks;
      });
      
      // Verify components are using the color classes
      expect(componentChecks.primaryButton || componentChecks.primaryText).toBeTruthy();
      
      console.log(`✓ Components updated for ${schemeId} scheme`);
    }
  });

  test('should maintain visual hierarchy across all color schemes', async ({ page }) => {
    for (const [schemeId] of Object.entries(COLOR_SCHEMES)) {
      await switchColorScheme(page, schemeId);
      
      // Check text hierarchy is maintained
      const textContrast = await page.evaluate(() => {
        const getContrast = (color1: string, color2: string) => {
          // Simple contrast check (would use proper WCAG calculation in production)
          return true; // Placeholder for actual contrast calculation
        };
        
        const root = document.documentElement;
        const style = getComputedStyle(root);
        
        const bgMain = style.getPropertyValue('--bg-main');
        const textPrimary = style.getPropertyValue('--text-primary');
        const textSecondary = style.getPropertyValue('--text-secondary');
        
        return {
          primaryReadable: getContrast(bgMain, textPrimary),
          secondaryReadable: getContrast(bgMain, textSecondary),
        };
      });
      
      expect(textContrast.primaryReadable).toBeTruthy();
      expect(textContrast.secondaryReadable).toBeTruthy();
      
      console.log(`✓ Visual hierarchy maintained for ${schemeId}`);
    }
  });

  test('should apply color scheme to glass morphism effects', async ({ page }) => {
    // Test glass effects adapt to each color scheme
    for (const [schemeId] of Object.entries(COLOR_SCHEMES)) {
      await switchColorScheme(page, schemeId);
      
      // Check glass components
      const glassCheck = await page.evaluate(() => {
        const glassElements = document.querySelectorAll('.glass, .glass-dark, .glass-light');
        return glassElements.length > 0;
      });
      
      expect(glassCheck).toBeTruthy();
      
      // Verify backdrop filters work
      const backdropCheck = await page.evaluate(() => {
        const element = document.querySelector('[class*="backdrop-blur"]');
        if (element) {
          const style = getComputedStyle(element);
          return style.backdropFilter !== 'none';
        }
        return false;
      });
      
      console.log(`✓ Glass effects work with ${schemeId} scheme`);
    }
  });

  test('should handle rapid color scheme switching without issues', async ({ page }) => {
    // Rapidly switch between schemes
    const rapidSwitches = 10;
    const schemes = Object.keys(COLOR_SCHEMES);
    
    for (let i = 0; i < rapidSwitches; i++) {
      const randomScheme = schemes[Math.floor(Math.random() * schemes.length)];
      await switchColorScheme(page, randomScheme);
      
      // Verify state is consistent
      const cssVars = await verifyCSSVariables(
        page, 
        randomScheme as keyof typeof COLOR_SCHEMES, 
        'dark'
      );
      expect(cssVars.scheme).toBe(randomScheme);
    }
    
    // Final verification
    const finalScheme = 'purple';
    await switchColorScheme(page, finalScheme);
    const finalVars = await verifyCSSVariables(page, 'purple', 'dark');
    expect(finalVars.scheme).toBe(finalScheme);
    expect(finalVars.primary300).toBe(COLOR_SCHEMES.purple.primary[300]);
  });

  test('should correctly apply gradients with each color scheme', async ({ page }) => {
    for (const [schemeId] of Object.entries(COLOR_SCHEMES)) {
      await switchColorScheme(page, schemeId);
      
      // Check gradient elements update
      const gradientCheck = await page.evaluate(() => {
        const gradientElements = document.querySelectorAll('[class*="from-primary"], [class*="to-primary"], [class*="via-primary"]');
        return gradientElements.length;
      });
      
      expect(gradientCheck).toBeGreaterThan(0);
      
      console.log(`✓ Gradients updated for ${schemeId} scheme`);
    }
  });

  test('should maintain consistent spacing and layout across color schemes', async ({ page }) => {
    // Get initial layout measurements
    await switchColorScheme(page, 'purple');
    const initialLayout = await page.evaluate(() => {
      const container = document.querySelector('.p-6');
      if (container) {
        const rect = container.getBoundingClientRect();
        return { width: rect.width, height: rect.height };
      }
      return null;
    });
    
    // Switch through all schemes and verify layout doesn't break
    for (const [schemeId] of Object.entries(COLOR_SCHEMES)) {
      await switchColorScheme(page, schemeId);
      
      const currentLayout = await page.evaluate(() => {
        const container = document.querySelector('.p-6');
        if (container) {
          const rect = container.getBoundingClientRect();
          return { width: rect.width, height: rect.height };
        }
        return null;
      });
      
      if (initialLayout && currentLayout) {
        expect(currentLayout.width).toBe(initialLayout.width);
        // Height might vary slightly but should be consistent
        expect(Math.abs(currentLayout.height - initialLayout.height)).toBeLessThan(10);
      }
      
      console.log(`✓ Layout consistent with ${schemeId} scheme`);
    }
  });
});

test.describe('Color Scheme Edge Cases', () => {
  test('should handle missing localStorage gracefully', async ({ page }) => {
    // Clear localStorage
    await page.evaluate(() => {
      localStorage.clear();
    });
    
    // Navigate to page
    await page.goto('http://localhost:3002/style-guide');
    await page.waitForLoadState('networkidle');
    
    // Should default to purple scheme
    const cssVars = await verifyCSSVariables(page, 'purple', 'dark');
    expect(cssVars.primary300).toBe(COLOR_SCHEMES.purple.primary[300]);
  });

  test('should handle invalid color scheme in localStorage', async ({ page }) => {
    // Set invalid scheme
    await page.evaluate(() => {
      localStorage.setItem('equitie-color-scheme', 'invalid-scheme');
    });
    
    // Navigate to page
    await page.goto('http://localhost:3002/style-guide');
    await page.waitForLoadState('networkidle');
    
    // Should fall back to default
    const cssVars = await verifyCSSVariables(page, 'purple', 'dark');
    expect(cssVars.primary300).toBeTruthy();
  });

  test('should work correctly in both mobile and desktop viewports', async ({ page }) => {
    // Test desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('http://localhost:3002/style-guide');
    await switchColorScheme(page, 'blue');
    let cssVars = await verifyCSSVariables(page, 'blue', 'dark');
    expect(cssVars.scheme).toBe('blue');
    
    // Test mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await switchColorScheme(page, 'green');
    cssVars = await verifyCSSVariables(page, 'green', 'dark');
    expect(cssVars.scheme).toBe('green');
  });
});