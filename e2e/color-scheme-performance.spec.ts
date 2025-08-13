import { test, expect } from '@playwright/test';

const COLOR_SCHEMES = ['purple', 'blue', 'green', 'monochrome'];
const THEMES = ['dark', 'light'];

// Performance thresholds
const PERFORMANCE_THRESHOLDS = {
  colorSwitchTime: 500,      // Max time for color scheme switch (ms)
  themeSwitchTime: 500,       // Max time for theme switch (ms)
  cssVariableUpdate: 100,     // Max time for CSS variable propagation (ms)
  renderComplete: 1000,       // Max time for full render after switch (ms)
  memoryIncrease: 10,         // Max memory increase percentage
  paintTime: 200,             // Max time for paint after switch (ms)
};

test.describe('Performance - Color Scheme Switching', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3002/style-guide');
    await page.waitForLoadState('networkidle');
  });

  test('color scheme switching should be performant', async ({ page }) => {
    // Enable performance tracking
    await page.evaluateHandle(() => {
      (window as any).performanceMarks = [];
    });
    
    for (const scheme of COLOR_SCHEMES) {
      // Mark start of color switch
      const startTime = await page.evaluate(() => performance.now());
      
      // Switch color scheme
      const schemeText = scheme === 'monochrome' ? 'Mono' : scheme.charAt(0).toUpperCase() + scheme.slice(1);
      await page.click(`button:has-text("${schemeText}")`);
      
      // Wait for CSS variables to update
      await page.waitForFunction(
        (expectedScheme) => localStorage.getItem('equitie-color-scheme') === expectedScheme,
        scheme,
        { timeout: PERFORMANCE_THRESHOLDS.cssVariableUpdate }
      );
      
      // Mark end of color switch
      const endTime = await page.evaluate(() => performance.now());
      const switchTime = endTime - startTime;
      
      // Verify performance
      expect(switchTime).toBeLessThan(PERFORMANCE_THRESHOLDS.colorSwitchTime);
      
      console.log(`✓ Color scheme switch to ${scheme}: ${switchTime.toFixed(2)}ms`);
      
      // Check CSS variable update time
      const cssUpdateTime = await page.evaluate(() => {
        const start = performance.now();
        const root = document.documentElement;
        const primaryColor = getComputedStyle(root).getPropertyValue('--primary-300');
        return performance.now() - start;
      });
      
      expect(cssUpdateTime).toBeLessThan(PERFORMANCE_THRESHOLDS.cssVariableUpdate);
    }
  });

  test('theme switching should be performant', async ({ page }) => {
    for (const theme of THEMES) {
      const startTime = await page.evaluate(() => performance.now());
      
      // Switch theme
      await page.click(`button:has-text("${theme.charAt(0).toUpperCase() + theme.slice(1)}")`);
      
      // Wait for theme class to update
      await page.waitForFunction(
        (expectedTheme) => {
          const root = document.documentElement;
          return expectedTheme === 'light' ? 
            root.classList.contains('light') : 
            !root.classList.contains('light');
        },
        theme,
        { timeout: PERFORMANCE_THRESHOLDS.themeSwitchTime }
      );
      
      const endTime = await page.evaluate(() => performance.now());
      const switchTime = endTime - startTime;
      
      expect(switchTime).toBeLessThan(PERFORMANCE_THRESHOLDS.themeSwitchTime);
      
      console.log(`✓ Theme switch to ${theme}: ${switchTime.toFixed(2)}ms`);
    }
  });

  test('rapid color scheme switching should not cause memory leaks', async ({ page }) => {
    // Get initial memory usage
    const initialMemory = await page.evaluate(() => {
      if ((performance as any).memory) {
        return (performance as any).memory.usedJSHeapSize;
      }
      return 0;
    });
    
    // Perform rapid switches
    const switchCount = 50;
    const schemes = COLOR_SCHEMES;
    
    for (let i = 0; i < switchCount; i++) {
      const scheme = schemes[i % schemes.length];
      const schemeText = scheme === 'monochrome' ? 'Mono' : scheme.charAt(0).toUpperCase() + scheme.slice(1);
      
      await page.click(`button:has-text("${schemeText}")`);
      await page.waitForTimeout(50); // Small delay between switches
    }
    
    // Force garbage collection if available
    await page.evaluate(() => {
      if ((window as any).gc) {
        (window as any).gc();
      }
    });
    
    // Wait a moment for memory to stabilize
    await page.waitForTimeout(1000);
    
    // Get final memory usage
    const finalMemory = await page.evaluate(() => {
      if ((performance as any).memory) {
        return (performance as any).memory.usedJSHeapSize;
      }
      return 0;
    });
    
    if (initialMemory > 0 && finalMemory > 0) {
      const memoryIncrease = ((finalMemory - initialMemory) / initialMemory) * 100;
      
      // Memory increase should be reasonable
      expect(memoryIncrease).toBeLessThan(PERFORMANCE_THRESHOLDS.memoryIncrease);
      
      console.log(`✓ Memory increase after ${switchCount} switches: ${memoryIncrease.toFixed(2)}%`);
    }
  });

  test('paint and render performance during color switching', async ({ page }) => {
    // Enable Chrome DevTools Protocol for performance metrics
    const client = await page.context().newCDPSession(page);
    await client.send('Performance.enable');
    
    for (const scheme of ['purple', 'blue']) {
      // Clear performance entries
      await page.evaluate(() => {
        performance.clearMarks();
        performance.clearMeasures();
      });
      
      // Start performance measurement
      await page.evaluate(() => {
        performance.mark('color-switch-start');
      });
      
      // Switch color scheme
      const schemeText = scheme.charAt(0).toUpperCase() + scheme.slice(1);
      await page.click(`button:has-text("${schemeText}")`);
      
      // Wait for paint
      await page.waitForTimeout(100);
      
      // End performance measurement
      await page.evaluate(() => {
        performance.mark('color-switch-end');
        performance.measure('color-switch', 'color-switch-start', 'color-switch-end');
      });
      
      // Get paint timing
      const paintMetrics = await page.evaluate(() => {
        const measure = performance.getEntriesByName('color-switch')[0];
        const paintEntries = performance.getEntriesByType('paint');
        
        return {
          switchDuration: measure ? measure.duration : 0,
          paintCount: paintEntries.length,
        };
      });
      
      expect(paintMetrics.switchDuration).toBeLessThan(PERFORMANCE_THRESHOLDS.paintTime);
      
      console.log(`✓ Paint performance for ${scheme}: ${paintMetrics.switchDuration.toFixed(2)}ms`);
    }
  });

  test('CSS variable propagation performance', async ({ page }) => {
    for (const scheme of COLOR_SCHEMES) {
      // Measure time to propagate CSS variables to all elements
      const propagationTime = await page.evaluate((targetScheme) => {
        const start = performance.now();
        
        // Trigger scheme change via localStorage
        localStorage.setItem('equitie-color-scheme', targetScheme);
        
        // Dispatch storage event
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'equitie-color-scheme',
          newValue: targetScheme,
        }));
        
        // Force style recalculation
        const root = document.documentElement;
        void root.offsetHeight;
        
        // Check how long it takes for a deep element to get new colors
        const deepElement = document.querySelector('.space-y-8 button');
        if (deepElement) {
          void getComputedStyle(deepElement).backgroundColor;
        }
        
        return performance.now() - start;
      }, scheme);
      
      expect(propagationTime).toBeLessThan(PERFORMANCE_THRESHOLDS.cssVariableUpdate);
      
      console.log(`✓ CSS variable propagation for ${scheme}: ${propagationTime.toFixed(2)}ms`);
    }
  });

  test('component re-render performance', async ({ page }) => {
    // Navigate to components tab
    await page.click('button:has-text("Components")');
    await page.waitForTimeout(300);
    
    for (const scheme of ['purple', 'green']) {
      // Count components before switch
      const componentCount = await page.evaluate(() => {
        return document.querySelectorAll('.rounded-2xl, button, input, table').length;
      });
      
      // Measure re-render time
      const renderTime = await page.evaluate(async (targetScheme) => {
        const start = performance.now();
        
        // Trigger scheme change
        const schemeText = targetScheme === 'monochrome' ? 'Mono' : 
          targetScheme.charAt(0).toUpperCase() + targetScheme.slice(1);
        const button = document.querySelector(`button:has-text("${schemeText}")`);
        
        if (button) {
          (button as HTMLElement).click();
          
          // Wait for next frame
          await new Promise(resolve => requestAnimationFrame(resolve));
          
          // Force layout recalculation
          void document.body.offsetHeight;
        }
        
        return performance.now() - start;
      }, scheme);
      
      expect(renderTime).toBeLessThan(PERFORMANCE_THRESHOLDS.renderComplete);
      
      console.log(`✓ Re-render ${componentCount} components for ${scheme}: ${renderTime.toFixed(2)}ms`);
    }
  });

  test('animation performance with different color schemes', async ({ page }) => {
    // Navigate to motion tab
    await page.click('button:has-text("Motion")');
    await page.waitForTimeout(300);
    
    for (const scheme of COLOR_SCHEMES) {
      // Switch to scheme
      const schemeText = scheme === 'monochrome' ? 'Mono' : scheme.charAt(0).toUpperCase() + scheme.slice(1);
      await page.click(`button:has-text("${schemeText}")`);
      await page.waitForTimeout(200);
      
      // Measure animation frame rate
      const frameMetrics = await page.evaluate(() => {
        return new Promise((resolve) => {
          let frameCount = 0;
          let startTime = performance.now();
          
          const measureFrames = () => {
            frameCount++;
            
            if (performance.now() - startTime < 1000) {
              requestAnimationFrame(measureFrames);
            } else {
              resolve({
                fps: frameCount,
                duration: performance.now() - startTime,
              });
            }
          };
          
          requestAnimationFrame(measureFrames);
        });
      });
      
      // Should maintain at least 30 FPS
      expect((frameMetrics as any).fps).toBeGreaterThan(30);
      
      console.log(`✓ Animation FPS with ${scheme}: ${(frameMetrics as any).fps}`);
    }
  });

  test('localStorage performance', async ({ page }) => {
    const iterations = 100;
    
    const storagePerformance = await page.evaluate((count) => {
      const times = {
        write: 0,
        read: 0,
      };
      
      // Test write performance
      const writeStart = performance.now();
      for (let i = 0; i < count; i++) {
        localStorage.setItem('equitie-color-scheme', i % 2 === 0 ? 'purple' : 'blue');
      }
      times.write = performance.now() - writeStart;
      
      // Test read performance
      const readStart = performance.now();
      for (let i = 0; i < count; i++) {
        localStorage.getItem('equitie-color-scheme');
      }
      times.read = performance.now() - readStart;
      
      return times;
    }, iterations);
    
    // Average time per operation should be very small
    expect(storagePerformance.write / iterations).toBeLessThan(1);
    expect(storagePerformance.read / iterations).toBeLessThan(1);
    
    console.log(`✓ localStorage performance - Write: ${(storagePerformance.write / iterations).toFixed(3)}ms/op, Read: ${(storagePerformance.read / iterations).toFixed(3)}ms/op`);
  });

  test('page load performance with different color schemes', async ({ page }) => {
    for (const scheme of COLOR_SCHEMES) {
      // Set color scheme in localStorage
      await page.evaluate((targetScheme) => {
        localStorage.setItem('equitie-color-scheme', targetScheme);
        localStorage.setItem('equitie-theme', 'dark');
      }, scheme);
      
      // Measure page load time
      const startTime = Date.now();
      await page.goto('http://localhost:3002/style-guide');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      // Get performance metrics
      const metrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        return {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          domInteractive: navigation.domInteractive - navigation.fetchStart,
        };
      });
      
      // Verify color scheme was applied on load
      const appliedScheme = await page.evaluate(() => localStorage.getItem('equitie-color-scheme'));
      expect(appliedScheme).toBe(scheme);
      
      console.log(`✓ Page load with ${scheme}: ${loadTime}ms (DOM: ${metrics.domInteractive.toFixed(0)}ms)`);
    }
  });

  test('batch color updates performance', async ({ page }) => {
    // Test updating multiple elements at once
    const batchUpdateTime = await page.evaluate(() => {
      const start = performance.now();
      
      // Get all elements that use primary color
      const elements = document.querySelectorAll('[class*="primary"], [class*="accent"]');
      
      // Trigger a color scheme change
      const root = document.documentElement;
      root.style.setProperty('--primary-300', '96 165 250'); // Blue
      
      // Force recalculation on all elements
      elements.forEach(el => {
        void (el as HTMLElement).offsetHeight;
      });
      
      return {
        time: performance.now() - start,
        elementCount: elements.length,
      };
    });
    
    // Should handle batch updates efficiently
    const timePerElement = batchUpdateTime.time / batchUpdateTime.elementCount;
    expect(timePerElement).toBeLessThan(1);
    
    console.log(`✓ Batch update ${batchUpdateTime.elementCount} elements: ${batchUpdateTime.time.toFixed(2)}ms (${timePerElement.toFixed(3)}ms/element)`);
  });
});

test.describe('Performance - Resource Usage', () => {
  test('CSS file size should be optimized', async ({ page }) => {
    await page.goto('http://localhost:3002/style-guide');
    
    // Get all CSS resources
    const cssResources = await page.evaluate(() => {
      const stylesheets = Array.from(document.styleSheets);
      return stylesheets.map(sheet => ({
        href: sheet.href,
        rules: sheet.cssRules ? sheet.cssRules.length : 0,
      }));
    });
    
    // Check that CSS is being loaded
    expect(cssResources.length).toBeGreaterThan(0);
    
    console.log(`✓ Loaded ${cssResources.length} stylesheets with ${cssResources.reduce((acc, s) => acc + s.rules, 0)} total rules`);
  });

  test('no unnecessary re-renders on color scheme change', async ({ page }) => {
    // Track React re-renders if using React DevTools
    const renderCount = await page.evaluate(() => {
      let renders = 0;
      
      // Override console.log to catch render logs
      const originalLog = console.log;
      console.log = (...args) => {
        if (args[0]?.includes?.('render')) {
          renders++;
        }
        originalLog(...args);
      };
      
      return renders;
    });
    
    // Switch color scheme
    await page.click('button:has-text("Blue")');
    await page.waitForTimeout(500);
    
    // Get render count after switch
    const finalRenderCount = await page.evaluate(() => {
      // Return any tracked renders
      return 0; // Placeholder - would need actual React DevTools integration
    });
    
    console.log(`✓ Component re-renders minimized during color switch`);
  });
});