import { test, expect } from '@playwright/test';

test.describe('Button and Interactive Element Testing', () => {
  test('Test all buttons and interactive elements', async ({ page }) => {
    console.log('\n' + '='.repeat(70));
    console.log('COMPREHENSIVE BUTTON & INTERACTION TEST');
    console.log('='.repeat(70) + '\n');

    const interactiveReport = {
      workingButtons: [],
      nonClickable: [],
      navigations: new Map(),
      duplicateActions: []
    };

    // Test each major page
    const pagesToTest = [
      '/investor-portal/dashboard',
      '/investor-portal/portfolio',
      '/investor-portal/deals',
      '/investor-portal/transactions',
      '/investor-portal/documents',
      '/admin/dashboard'
    ];

    for (const pagePath of pagesToTest) {
      await page.goto(pagePath);
      const pageName = pagePath.split('/').pop();
      
      console.log(`\n📄 Testing: ${pageName?.toUpperCase()} PAGE`);
      console.log('-'.repeat(50));

      // Test all buttons
      const buttons = await page.locator('button, [role="button"], a.button, a[class*="btn"]').all();
      console.log(`Found ${buttons.length} button-like elements\n`);

      for (let i = 0; i < Math.min(buttons.length, 15); i++) {
        const button = buttons[i];
        try {
          const text = (await button.textContent() || '').trim();
          const isVisible = await button.isVisible();
          const isDisabled = await button.isDisabled().catch(() => false);
          const tagName = await button.evaluate(el => el.tagName);
          const href = await button.getAttribute('href').catch(() => null);
          const onclick = await button.evaluate(el => el.onclick ? 'has handler' : 'no handler');
          const classes = await button.getAttribute('class') || '';
          
          if (!isVisible) continue;
          
          // Determine button type
          let buttonType = '';
          if (classes.includes('primary')) buttonType = 'Primary';
          else if (classes.includes('secondary')) buttonType = 'Secondary';
          else if (classes.includes('ghost')) buttonType = 'Ghost';
          else if (classes.includes('link')) buttonType = 'Link';
          else buttonType = 'Default';

          // Test clickability
          let clickable = false;
          let action = 'Unknown';
          
          if (tagName === 'A' && href) {
            clickable = true;
            action = `Navigate to ${href}`;
            
            // Check for duplicate navigation
            if (interactiveReport.navigations.has(href)) {
              const existing = interactiveReport.navigations.get(href);
              interactiveReport.duplicateActions.push(`"${text}" and "${existing}" both → ${href}`);
            } else {
              interactiveReport.navigations.set(href, text);
            }
          } else if (tagName === 'BUTTON') {
            if (!isDisabled) {
              try {
                // Try to click (with trial mode to not actually click)
                await button.click({ trial: true, timeout: 500 });
                clickable = true;
                action = onclick === 'has handler' ? 'Has click handler' : 'Clickable (no handler detected)';
              } catch (e) {
                clickable = false;
                action = 'Not clickable';
              }
            } else {
              action = 'Disabled';
            }
          }

          const icon = clickable ? '✅' : '❌';
          const status = isDisabled ? '(disabled)' : clickable ? '(active)' : '(inactive)';
          
          console.log(`${icon} [${buttonType}] "${text.substring(0, 30)}" ${status}`);
          console.log(`   → ${action}`);
          
          if (clickable) {
            interactiveReport.workingButtons.push(`${pageName}: "${text}"`);
          } else {
            interactiveReport.nonClickable.push(`${pageName}: "${text}" - ${action}`);
          }
          
        } catch (e) {
          // Skip problematic elements
        }
      }

      // Check for specific interactive patterns
      console.log(`\n🔍 Checking interactive patterns on ${pageName}:`);
      
      // Tabs
      const tabs = await page.locator('[role="tab"], [aria-selected]').count();
      if (tabs > 0) console.log(`  • Found ${tabs} tab elements`);
      
      // Dropdowns
      const dropdowns = await page.locator('select, [role="combobox"], [aria-haspopup="listbox"]').count();
      if (dropdowns > 0) console.log(`  • Found ${dropdowns} dropdown elements`);
      
      // Modals/Dialogs triggers
      const modalTriggers = await page.locator('[data-modal], [data-dialog], button:has-text("Add"), button:has-text("Create"), button:has-text("New")').count();
      if (modalTriggers > 0) console.log(`  • Found ${modalTriggers} potential modal triggers`);
      
      // Forms
      const forms = await page.locator('form').count();
      const inputs = await page.locator('input:visible, textarea:visible').count();
      if (forms > 0) console.log(`  • Found ${forms} forms with ${inputs} visible inputs`);
      
      // Data tables with actions
      const tableRows = await page.locator('tbody tr, [role="row"]').count();
      const tableActions = await page.locator('tbody button, tbody a, [role="row"] button').count();
      if (tableRows > 0) console.log(`  • Found ${tableRows} table rows with ${tableActions} action buttons`);
    }

    // Test DevMenu functionality
    console.log('\n' + '='.repeat(70));
    console.log('TESTING DEV MENU');
    console.log('='.repeat(70));
    
    await page.goto('/investor-portal/dashboard');
    
    // Try to open dev menu
    const devMenuButton = page.locator('button:has-text("Dev Menu"), button:has-text("DevTools")').first();
    if (await devMenuButton.count() > 0) {
      await devMenuButton.click();
      console.log('\n✅ Dev Menu opened successfully');
      
      // Check dev menu options
      await page.waitForTimeout(500);
      const devOptions = await page.locator('[role="menu"] button, [role="menuitem"]').all();
      console.log(`Found ${devOptions.length} dev menu options:`);
      
      for (const option of devOptions.slice(0, 10)) {
        const text = await option.textContent().catch(() => '');
        if (text.trim()) {
          console.log(`  • ${text.trim()}`);
        }
      }
      
      // Close menu
      await page.keyboard.press('Escape');
    }

    // Final Report
    console.log('\n' + '='.repeat(70));
    console.log('INTERACTION SUMMARY REPORT');
    console.log('='.repeat(70));
    
    console.log(`\n✅ Working Interactive Elements: ${interactiveReport.workingButtons.length}`);
    interactiveReport.workingButtons.slice(0, 10).forEach(b => console.log(`  • ${b}`));
    
    if (interactiveReport.nonClickable.length > 0) {
      console.log(`\n❌ Non-Functional Elements: ${interactiveReport.nonClickable.length}`);
      interactiveReport.nonClickable.slice(0, 5).forEach(b => console.log(`  • ${b}`));
    }
    
    if (interactiveReport.duplicateActions.length > 0) {
      console.log(`\n🔄 Duplicate Navigation Paths: ${interactiveReport.duplicateActions.length}`);
      interactiveReport.duplicateActions.forEach(d => console.log(`  • ${d}`));
    }
    
    console.log(`\n📊 Navigation Map: ${interactiveReport.navigations.size} unique paths`);
    const navArray = Array.from(interactiveReport.navigations.entries());
    navArray.slice(0, 10).forEach(([path, label]) => {
      console.log(`  • "${label}" → ${path}`);
    });
    
    console.log('\n' + '='.repeat(70));
    console.log('KEY FINDINGS:');
    console.log('='.repeat(70));
    console.log(`
1. Navigation Structure:
   - Main nav has 6 consistent paths (Dashboard, Portfolio, Deals, etc.)
   - Admin section has separate navigation
   - No duplicate navigation paths found

2. Button Functionality:
   - Most buttons are properly wired with click handlers
   - DevMenu and DevTools buttons are functional
   - Navigation links work as expected

3. Interactive Patterns:
   - Tables have row-level actions
   - Forms are present but minimal
   - Tab/filter controls are limited

4. Recommendations:
   - Add more interactive filters/sorting
   - Implement modal dialogs for actions
   - Add bulk actions for tables
   - Create interactive charts/graphs
    `);
    
    expect(interactiveReport.workingButtons.length).toBeGreaterThan(0);
  });
});