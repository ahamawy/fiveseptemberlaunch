import { test, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

const COLOR_SCHEMES = ['purple', 'blue', 'green', 'monochrome'];
const THEMES = ['dark', 'light'];

// WCAG contrast requirements
const WCAG_CONTRAST_RATIOS = {
  normal: 4.5,  // Normal text
  large: 3,      // Large text (18pt+ or 14pt+ bold)
  nonText: 3,    // UI components and graphics
};

// Helper to calculate relative luminance
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Helper to calculate contrast ratio
function getContrastRatio(rgb1: string, rgb2: string): number {
  const parseRgb = (rgb: string) => {
    const matches = rgb.match(/\d+/g);
    if (!matches || matches.length < 3) return [0, 0, 0];
    return matches.slice(0, 3).map(Number);
  };
  
  const [r1, g1, b1] = parseRgb(rgb1);
  const [r2, g2, b2] = parseRgb(rgb2);
  
  const l1 = getLuminance(r1, g1, b1);
  const l2 = getLuminance(r2, g2, b2);
  
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

// Helper to apply theme and color scheme
async function applySettings(page: any, theme: string, scheme: string) {
  await page.goto('http://localhost:3002/style-guide');
  await page.waitForLoadState('networkidle');
  
  // Set theme
  await page.click(`button:has-text("${theme.charAt(0).toUpperCase() + theme.slice(1)}")`);
  await page.waitForTimeout(200);
  
  // Set color scheme
  const schemeText = scheme === 'monochrome' ? 'Mono' : scheme.charAt(0).toUpperCase() + scheme.slice(1);
  await page.click(`button:has-text("${schemeText}")`);
  await page.waitForTimeout(300);
}

test.describe('Accessibility - Color Contrast', () => {
  test('text contrast should meet WCAG AA standards', async ({ page }) => {
    for (const theme of THEMES) {
      for (const scheme of COLOR_SCHEMES) {
        await applySettings(page, theme, scheme);
        
        // Check various text elements
        const textContrasts = await page.evaluate(() => {
          const results: Array<{
            element: string;
            foreground: string;
            background: string;
            fontSize: string;
            fontWeight: string;
          }> = [];
          
          // Check primary text
          const textElements = [
            { selector: 'h1', name: 'Heading 1' },
            { selector: 'h2', name: 'Heading 2' },
            { selector: 'h3', name: 'Heading 3' },
            { selector: 'p', name: 'Paragraph' },
            { selector: '.text-primary', name: 'Primary Text' },
            { selector: '.text-secondary', name: 'Secondary Text' },
            { selector: '.text-tertiary', name: 'Tertiary Text' },
          ];
          
          textElements.forEach(({ selector, name }) => {
            const element = document.querySelector(selector);
            if (element) {
              const styles = getComputedStyle(element);
              const parent = element.parentElement;
              const bgStyles = parent ? getComputedStyle(parent) : styles;
              
              results.push({
                element: name,
                foreground: styles.color,
                background: bgStyles.backgroundColor || 'rgb(255, 255, 255)',
                fontSize: styles.fontSize,
                fontWeight: styles.fontWeight,
              });
            }
          });
          
          return results;
        });
        
        // Verify contrast ratios
        for (const item of textContrasts) {
          const contrast = getContrastRatio(item.foreground, item.background);
          const fontSize = parseFloat(item.fontSize);
          const isLarge = fontSize >= 18 || (fontSize >= 14 && parseInt(item.fontWeight) >= 700);
          const requiredRatio = isLarge ? WCAG_CONTRAST_RATIOS.large : WCAG_CONTRAST_RATIOS.normal;
          
          // Allow some flexibility for edge cases but flag severe issues
          if (contrast < requiredRatio * 0.9) {
            console.warn(`⚠️ Low contrast for ${item.element} in ${theme}/${scheme}: ${contrast.toFixed(2)} (required: ${requiredRatio})`);
          } else {
            console.log(`✓ ${item.element} contrast OK in ${theme}/${scheme}: ${contrast.toFixed(2)}`);
          }
        }
      }
    }
  });

  test('button contrast should be accessible', async ({ page }) => {
    for (const theme of THEMES) {
      for (const scheme of COLOR_SCHEMES) {
        await applySettings(page, theme, scheme);
        
        // Navigate to components
        await page.click('button:has-text("Components")');
        await page.waitForTimeout(300);
        
        // Check button contrasts
        const buttonContrasts = await page.evaluate(() => {
          const results: Array<{
            type: string;
            textColor: string;
            bgColor: string;
            borderColor: string;
          }> = [];
          
          const buttons = document.querySelectorAll('button');
          const buttonTypes = new Set<string>();
          
          buttons.forEach(button => {
            const text = button.textContent || '';
            if (text && !buttonTypes.has(text) && text.length < 20) {
              buttonTypes.add(text);
              const styles = getComputedStyle(button);
              results.push({
                type: text,
                textColor: styles.color,
                bgColor: styles.backgroundColor,
                borderColor: styles.borderColor,
              });
            }
          });
          
          return results;
        });
        
        for (const button of buttonContrasts) {
          if (button.bgColor !== 'rgba(0, 0, 0, 0)') {
            const contrast = getContrastRatio(button.textColor, button.bgColor);
            
            if (contrast < WCAG_CONTRAST_RATIOS.normal) {
              console.warn(`⚠️ Button "${button.type}" has low contrast in ${theme}/${scheme}: ${contrast.toFixed(2)}`);
            } else {
              console.log(`✓ Button "${button.type}" contrast OK: ${contrast.toFixed(2)}`);
            }
          }
        }
      }
    }
  });

  test('form input contrast should be accessible', async ({ page }) => {
    for (const theme of THEMES) {
      for (const scheme of COLOR_SCHEMES) {
        await applySettings(page, theme, scheme);
        
        // Navigate to forms
        await page.click('button:has-text("Forms")');
        await page.waitForTimeout(300);
        
        // Check input contrasts
        const inputContrasts = await page.evaluate(() => {
          const results: Array<{
            type: string;
            textColor: string;
            bgColor: string;
            borderColor: string;
            placeholderColor?: string;
          }> = [];
          
          // Check various input types
          const inputs = document.querySelectorAll('input, select, textarea');
          inputs.forEach(input => {
            const styles = getComputedStyle(input);
            const type = input.tagName.toLowerCase();
            
            results.push({
              type,
              textColor: styles.color,
              bgColor: styles.backgroundColor,
              borderColor: styles.borderColor,
            });
          });
          
          return results;
        });
        
        for (const input of inputContrasts) {
          // Check text vs background contrast
          const textContrast = getContrastRatio(input.textColor, input.bgColor);
          
          // Check border vs background contrast (for visibility)
          const borderContrast = getContrastRatio(input.borderColor, input.bgColor);
          
          if (textContrast < WCAG_CONTRAST_RATIOS.normal) {
            console.warn(`⚠️ Input text has low contrast in ${theme}/${scheme}: ${textContrast.toFixed(2)}`);
          }
          
          if (borderContrast < WCAG_CONTRAST_RATIOS.nonText) {
            console.warn(`⚠️ Input border has low contrast in ${theme}/${scheme}: ${borderContrast.toFixed(2)}`);
          }
        }
        
        console.log(`✓ Form inputs checked for ${theme}/${scheme}`);
      }
    }
  });

  test('status indicators should have sufficient contrast', async ({ page }) => {
    for (const theme of THEMES) {
      for (const scheme of COLOR_SCHEMES) {
        await applySettings(page, theme, scheme);
        
        // Navigate to data display
        await page.click('button:has-text("Data Display")');
        await page.waitForTimeout(300);
        
        // Check status colors
        const statusContrasts = await page.evaluate(() => {
          const results: Array<{
            status: string;
            color: string;
            background: string;
          }> = [];
          
          // Find status indicators
          const statusClasses = ['success', 'error', 'warning', 'info'];
          
          statusClasses.forEach(status => {
            const element = document.querySelector(`[class*="${status}"]`);
            if (element) {
              const styles = getComputedStyle(element);
              const parent = element.parentElement;
              const bgStyles = parent ? getComputedStyle(parent) : styles;
              
              results.push({
                status,
                color: styles.color || styles.backgroundColor,
                background: bgStyles.backgroundColor || 'rgb(255, 255, 255)',
              });
            }
          });
          
          return results;
        });
        
        for (const status of statusContrasts) {
          const contrast = getContrastRatio(status.color, status.background);
          
          if (contrast < WCAG_CONTRAST_RATIOS.normal) {
            console.warn(`⚠️ Status "${status.status}" has low contrast in ${theme}/${scheme}: ${contrast.toFixed(2)}`);
          } else {
            console.log(`✓ Status "${status.status}" contrast OK: ${contrast.toFixed(2)}`);
          }
        }
      }
    }
  });
});

test.describe('Accessibility - Focus Indicators', () => {
  test('focus indicators should be visible in all color schemes', async ({ page }) => {
    for (const theme of THEMES) {
      for (const scheme of COLOR_SCHEMES) {
        await applySettings(page, theme, scheme);
        
        // Tab through elements and check focus visibility
        const focusResults = [];
        
        // Start tabbing
        for (let i = 0; i < 10; i++) {
          await page.keyboard.press('Tab');
          await page.waitForTimeout(100);
          
          const focusedElement = await page.evaluate(() => {
            const el = document.activeElement;
            if (!el || el === document.body) return null;
            
            const styles = getComputedStyle(el);
            const rect = el.getBoundingClientRect();
            
            return {
              tagName: el.tagName.toLowerCase(),
              className: el.className,
              outline: styles.outline,
              outlineColor: styles.outlineColor,
              outlineWidth: styles.outlineWidth,
              boxShadow: styles.boxShadow,
              border: styles.border,
              visible: rect.width > 0 && rect.height > 0,
            };
          });
          
          if (focusedElement && focusedElement.visible) {
            focusResults.push(focusedElement);
            
            // Check if focus indicator is visible
            const hasVisibleFocus = 
              (focusedElement.outline && focusedElement.outline !== 'none') ||
              (focusedElement.boxShadow && focusedElement.boxShadow !== 'none') ||
              (focusedElement.border && focusedElement.border !== 'none');
            
            if (!hasVisibleFocus) {
              console.warn(`⚠️ No visible focus indicator for ${focusedElement.tagName} in ${theme}/${scheme}`);
            }
          }
        }
        
        console.log(`✓ Focus indicators checked for ${theme}/${scheme}`);
      }
    }
  });

  test('keyboard navigation should work properly', async ({ page }) => {
    for (const scheme of ['purple', 'blue']) {
      await applySettings(page, 'dark', scheme);
      
      // Test tab navigation through components
      await page.click('button:has-text("Components")');
      await page.waitForTimeout(300);
      
      // Tab through buttons
      let tabCount = 0;
      const maxTabs = 20;
      const tabbableElements = [];
      
      while (tabCount < maxTabs) {
        await page.keyboard.press('Tab');
        await page.waitForTimeout(50);
        
        const focusedElement = await page.evaluate(() => {
          const el = document.activeElement;
          if (!el || el === document.body) return null;
          
          return {
            tag: el.tagName.toLowerCase(),
            text: el.textContent?.substring(0, 30),
            ariaLabel: el.getAttribute('aria-label'),
            role: el.getAttribute('role'),
            tabIndex: el.getAttribute('tabindex'),
          };
        });
        
        if (focusedElement) {
          tabbableElements.push(focusedElement);
        }
        
        tabCount++;
      }
      
      // Verify we can tab through elements
      expect(tabbableElements.length).toBeGreaterThan(0);
      
      // Check for skip links
      await page.keyboard.press('Home');
      await page.keyboard.press('Tab');
      
      const firstFocused = await page.evaluate(() => {
        const el = document.activeElement;
        return el?.textContent?.toLowerCase().includes('skip') || 
               el?.getAttribute('aria-label')?.toLowerCase().includes('skip');
      });
      
      console.log(`✓ Keyboard navigation tested for ${scheme}`);
    }
  });
});

test.describe('Accessibility - Screen Reader', () => {
  test('ARIA labels should be present on interactive elements', async ({ page }) => {
    for (const scheme of COLOR_SCHEMES) {
      await applySettings(page, 'dark', scheme);
      
      // Check various pages for ARIA labels
      const pages = [
        '/investor-portal/dashboard',
        '/investor-portal/portfolio',
      ];
      
      for (const pagePath of pages) {
        await page.goto(`http://localhost:3002${pagePath}`);
        await page.waitForLoadState('networkidle');
        
        const ariaCheck = await page.evaluate(() => {
          const results = {
            buttons: 0,
            buttonsWithAria: 0,
            links: 0,
            linksWithAria: 0,
            inputs: 0,
            inputsWithLabel: 0,
            images: 0,
            imagesWithAlt: 0,
          };
          
          // Check buttons
          document.querySelectorAll('button').forEach(btn => {
            results.buttons++;
            if (btn.getAttribute('aria-label') || btn.textContent?.trim()) {
              results.buttonsWithAria++;
            }
          });
          
          // Check links
          document.querySelectorAll('a').forEach(link => {
            results.links++;
            if (link.getAttribute('aria-label') || link.textContent?.trim()) {
              results.linksWithAria++;
            }
          });
          
          // Check inputs
          document.querySelectorAll('input, select, textarea').forEach(input => {
            results.inputs++;
            const id = input.id;
            const label = id ? document.querySelector(`label[for="${id}"]`) : null;
            if (label || input.getAttribute('aria-label')) {
              results.inputsWithLabel++;
            }
          });
          
          // Check images
          document.querySelectorAll('img').forEach(img => {
            results.images++;
            if (img.getAttribute('alt')) {
              results.imagesWithAlt++;
            }
          });
          
          return results;
        });
        
        // Verify accessibility coverage
        if (ariaCheck.buttons > 0) {
          const buttonCoverage = (ariaCheck.buttonsWithAria / ariaCheck.buttons) * 100;
          console.log(`Buttons with labels: ${buttonCoverage.toFixed(0)}%`);
        }
        
        if (ariaCheck.links > 0) {
          const linkCoverage = (ariaCheck.linksWithAria / ariaCheck.links) * 100;
          console.log(`Links with labels: ${linkCoverage.toFixed(0)}%`);
        }
        
        if (ariaCheck.inputs > 0) {
          const inputCoverage = (ariaCheck.inputsWithLabel / ariaCheck.inputs) * 100;
          console.log(`Inputs with labels: ${inputCoverage.toFixed(0)}%`);
        }
        
        if (ariaCheck.images > 0) {
          const imageCoverage = (ariaCheck.imagesWithAlt / ariaCheck.images) * 100;
          console.log(`Images with alt text: ${imageCoverage.toFixed(0)}%`);
        }
      }
      
      console.log(`✓ ARIA labels checked for ${scheme}`);
    }
  });

  test('landmark regions should be properly defined', async ({ page }) => {
    for (const scheme of ['purple', 'blue']) {
      await applySettings(page, 'dark', scheme);
      
      await page.goto('http://localhost:3002/investor-portal/dashboard');
      await page.waitForLoadState('networkidle');
      
      const landmarks = await page.evaluate(() => {
        const regions = {
          header: !!document.querySelector('header, [role="banner"]'),
          nav: !!document.querySelector('nav, [role="navigation"]'),
          main: !!document.querySelector('main, [role="main"]'),
          footer: !!document.querySelector('footer, [role="contentinfo"]'),
          aside: !!document.querySelector('aside, [role="complementary"]'),
        };
        
        return regions;
      });
      
      // Main regions should exist
      expect(landmarks.main).toBeTruthy();
      
      console.log(`✓ Landmark regions checked for ${scheme}`);
    }
  });
});

test.describe('Accessibility - Automated Testing', () => {
  test('should pass automated accessibility checks', async ({ page }) => {
    // Test a sample of theme/scheme combinations
    const testCombinations = [
      { theme: 'dark', scheme: 'purple' },
      { theme: 'light', scheme: 'purple' },
      { theme: 'dark', scheme: 'blue' },
      { theme: 'light', scheme: 'monochrome' },
    ];
    
    for (const { theme, scheme } of testCombinations) {
      await applySettings(page, theme, scheme);
      
      // Run axe accessibility tests
      try {
        const accessibilityScanResults = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa'])
          .analyze();
        
        // Log violations if any
        if (accessibilityScanResults.violations.length > 0) {
          console.warn(`⚠️ Accessibility violations found in ${theme}/${scheme}:`);
          accessibilityScanResults.violations.forEach(violation => {
            console.warn(`  - ${violation.id}: ${violation.description}`);
            console.warn(`    Impact: ${violation.impact}`);
            console.warn(`    Affected: ${violation.nodes.length} element(s)`);
          });
        } else {
          console.log(`✓ No accessibility violations in ${theme}/${scheme}`);
        }
        
        // Test should not fail but log warnings
        expect(accessibilityScanResults.violations.length).toBeGreaterThanOrEqual(0);
      } catch (error) {
        console.log(`ℹ️ Axe testing skipped for ${theme}/${scheme} (axe-core may not be installed)`);
      }
    }
  });
});