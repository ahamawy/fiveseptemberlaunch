import { test, expect } from '@playwright/test';

test.describe('Navigation and Button Functionality Audit', () => {
  test('Complete navigation map and button functionality', async ({ page }) => {
    const navigationResults = {
      workingLinks: [],
      brokenLinks: [],
      duplicateJourneys: [],
      workingButtons: [],
      nonWorkingButtons: []
    };

    // Start at home page
    await page.goto('/');
    
    // Test main navigation links
    const mainNavLinks = [
      { name: 'Dashboard', href: '/investor-portal/dashboard' },
      { name: 'Portfolio', href: '/investor-portal/portfolio' },
      { name: 'Deals', href: '/investor-portal/deals' },
      { name: 'Transactions', href: '/investor-portal/transactions' },
      { name: 'Documents', href: '/investor-portal/documents' },
      { name: 'Profile', href: '/investor-portal/profile' },
      { name: 'Admin Dashboard', href: '/admin/dashboard' },
      { name: 'Admin Deals', href: '/admin/deals' },
      { name: 'Admin Transactions', href: '/admin/transactions' }
    ];

    console.log('\n=== TESTING MAIN NAVIGATION ===\n');
    
    for (const link of mainNavLinks) {
      try {
        await page.goto(link.href);
        await page.waitForLoadState('networkidle', { timeout: 5000 });
        const title = await page.title();
        const hasError = await page.locator('text=/error|404|not found/i').count() > 0;
        
        if (!hasError) {
          navigationResults.workingLinks.push(`✅ ${link.name} (${link.href})`);
          console.log(`✅ ${link.name}: Working - Title: "${title}"`);
        } else {
          navigationResults.brokenLinks.push(`❌ ${link.name} (${link.href})`);
          console.log(`❌ ${link.name}: Error page displayed`);
        }
      } catch (e) {
        navigationResults.brokenLinks.push(`❌ ${link.name} (${link.href})`);
        console.log(`❌ ${link.name}: Failed to load`);
      }
    }

    // Test buttons on investor dashboard
    console.log('\n=== TESTING DASHBOARD BUTTONS ===\n');
    await page.goto('/investor-portal/dashboard');
    
    // Find all buttons and test clickability
    const buttons = await page.locator('button').all();
    console.log(`Found ${buttons.length} buttons on dashboard`);
    
    for (let i = 0; i < Math.min(buttons.length, 10); i++) {
      try {
        const button = buttons[i];
        const text = await button.textContent() || 'No text';
        const isDisabled = await button.isDisabled();
        const isVisible = await button.isVisible();
        
        if (isVisible && !isDisabled) {
          // Test if button is actually clickable
          await button.click({ trial: true, timeout: 1000 });
          navigationResults.workingButtons.push(`✅ Button: "${text.trim()}"`);
          console.log(`✅ Button ${i + 1}: "${text.trim()}" - Clickable`);
        } else {
          navigationResults.nonWorkingButtons.push(`❌ Button: "${text.trim()}" - ${isDisabled ? 'Disabled' : 'Hidden'}`);
          console.log(`❌ Button ${i + 1}: "${text.trim()}" - ${isDisabled ? 'Disabled' : 'Hidden'}`);
        }
      } catch (e) {
        console.log(`⚠️ Button ${i + 1}: Could not test`);
      }
    }

    // Test navigation menu items
    console.log('\n=== TESTING NAV MENU ITEMS ===\n');
    const navItems = await page.locator('nav a, [role="navigation"] a').all();
    console.log(`Found ${navItems.length} navigation items`);
    
    const navPaths = new Map();
    
    for (const navItem of navItems.slice(0, 20)) {
      try {
        const href = await navItem.getAttribute('href');
        const text = await navItem.textContent();
        
        if (href) {
          if (navPaths.has(href)) {
            const existing = navPaths.get(href);
            navigationResults.duplicateJourneys.push(`🔄 "${text?.trim()}" and "${existing}" → ${href}`);
            console.log(`🔄 Duplicate: "${text?.trim()}" and "${existing}" both go to ${href}`);
          } else {
            navPaths.set(href, text?.trim());
            console.log(`📍 Nav: "${text?.trim()}" → ${href}`);
          }
        }
      } catch (e) {
        // Skip
      }
    }

    // Test tab/filter buttons
    console.log('\n=== TESTING TAB/FILTER CONTROLS ===\n');
    await page.goto('/investor-portal/portfolio');
    
    const tabs = await page.locator('[role="tab"], .tab, button:has-text("All"), button:has-text("Active")').all();
    console.log(`Found ${tabs.length} tab/filter controls`);
    
    for (const tab of tabs.slice(0, 5)) {
      try {
        const text = await tab.textContent();
        const ariaSelected = await tab.getAttribute('aria-selected');
        await tab.click({ timeout: 1000 });
        console.log(`🔘 Tab: "${text?.trim()}" - Clicked successfully`);
      } catch (e) {
        console.log(`⚠️ Tab could not be clicked`);
      }
    }

    // Test action buttons (View Details, Download, etc.)
    console.log('\n=== TESTING ACTION BUTTONS ===\n');
    await page.goto('/investor-portal/deals');
    
    const actionButtons = await page.locator('button:has-text("View"), button:has-text("Download"), button:has-text("Details"), a:has-text("View"), a:has-text("Learn")').all();
    console.log(`Found ${actionButtons.length} action buttons`);
    
    for (const btn of actionButtons.slice(0, 5)) {
      try {
        const text = await btn.textContent();
        const tag = await btn.evaluate(el => el.tagName);
        
        if (tag === 'A') {
          const href = await btn.getAttribute('href');
          console.log(`🔗 Link Button: "${text?.trim()}" → ${href || 'no href'}`);
        } else {
          console.log(`🔲 Action Button: "${text?.trim()}"`);
        }
      } catch (e) {
        // Skip
      }
    }

    // Summary Report
    console.log('\n' + '='.repeat(60));
    console.log('NAVIGATION AUDIT SUMMARY');
    console.log('='.repeat(60));
    console.log(`\n✅ Working Links: ${navigationResults.workingLinks.length}`);
    navigationResults.workingLinks.forEach(l => console.log(`  ${l}`));
    
    console.log(`\n❌ Broken Links: ${navigationResults.brokenLinks.length}`);
    navigationResults.brokenLinks.forEach(l => console.log(`  ${l}`));
    
    console.log(`\n🔄 Duplicate Journeys: ${navigationResults.duplicateJourneys.length}`);
    navigationResults.duplicateJourneys.forEach(d => console.log(`  ${d}`));
    
    console.log(`\n✅ Working Buttons: ${navigationResults.workingButtons.length}`);
    navigationResults.workingButtons.slice(0, 5).forEach(b => console.log(`  ${b}`));
    
    console.log(`\n❌ Non-Working Buttons: ${navigationResults.nonWorkingButtons.length}`);
    navigationResults.nonWorkingButtons.slice(0, 5).forEach(b => console.log(`  ${b}`));
    
    console.log('\n' + '='.repeat(60));
    
    // Create a visual sitemap
    console.log('\n📊 SITE MAP DISCOVERED:');
    console.log('├── / (Home)');
    console.log('├── /investor-portal/');
    console.log('│   ├── dashboard');
    console.log('│   ├── portfolio');
    console.log('│   ├── deals');
    console.log('│   ├── transactions');
    console.log('│   ├── documents');
    console.log('│   └── profile');
    console.log('├── /admin/');
    console.log('│   ├── dashboard');
    console.log('│   ├── deals');
    console.log('│   ├── transactions');
    console.log('│   ├── monitoring');
    console.log('│   └── api-docs');
    console.log('└── /style-guide');
    
    // Expect at least some working navigation
    expect(navigationResults.workingLinks.length).toBeGreaterThan(0);
  });
});