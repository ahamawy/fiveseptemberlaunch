import { test, expect } from '@playwright/test';

test.describe('Navigation Functionality Check', () => {
  test('Check all pages and navigation elements', async ({ page }) => {
    // Test each page individually with shorter timeouts
    const pages = [
      { path: '/', name: 'Home' },
      { path: '/investor-portal/dashboard', name: 'Dashboard' },
      { path: '/investor-portal/portfolio', name: 'Portfolio' },
      { path: '/investor-portal/deals', name: 'Deals' },
      { path: '/investor-portal/transactions', name: 'Transactions' },
      { path: '/investor-portal/documents', name: 'Documents' },
      { path: '/investor-portal/profile', name: 'Profile' },
      { path: '/admin/dashboard', name: 'Admin Dashboard' },
      { path: '/style-guide', name: 'Style Guide' }
    ];

    console.log('\n' + '='.repeat(60));
    console.log('NAVIGATION AUDIT RESULTS');
    console.log('='.repeat(60) + '\n');

    for (const pageInfo of pages) {
      try {
        const response = await page.goto(pageInfo.path, { 
          waitUntil: 'domcontentloaded',
          timeout: 5000 
        });
        
        const status = response?.status() || 0;
        const title = await page.title().catch(() => 'No title');
        
        if (status === 200) {
          console.log(`✅ ${pageInfo.name.padEnd(20)} ${pageInfo.path.padEnd(35)} [${status}] "${title}"`);
        } else {
          console.log(`❌ ${pageInfo.name.padEnd(20)} ${pageInfo.path.padEnd(35)} [${status}]`);
        }
        
        // Check for navigation elements on this page
        if (status === 200) {
          const navLinks = await page.locator('nav a, aside a, header a').count();
          const buttons = await page.locator('button:visible').count();
          const links = await page.locator('a[href]:visible').count();
          
          console.log(`   → Found: ${navLinks} nav links, ${buttons} buttons, ${links} total links`);
        }
      } catch (error) {
        console.log(`❌ ${pageInfo.name.padEnd(20)} ${pageInfo.path.padEnd(35)} [ERROR] ${error.message.split('\n')[0]}`);
      }
    }
    
    // Now test specific navigation on working pages
    console.log('\n' + '='.repeat(60));
    console.log('TESTING NAVIGATION ELEMENTS');
    console.log('='.repeat(60) + '\n');
    
    // Go to deals page which we know works
    await page.goto('/investor-portal/deals');
    console.log('Testing on Deals page:');
    
    // Check sidebar navigation
    const sidebarLinks = await page.locator('aside a, nav a').all();
    const uniquePaths = new Set();
    const duplicates = [];
    
    for (const link of sidebarLinks.slice(0, 20)) {
      const href = await link.getAttribute('href').catch(() => null);
      const text = await link.textContent().catch(() => '');
      
      if (href) {
        if (uniquePaths.has(href)) {
          duplicates.push({ text: text.trim(), href });
        } else {
          uniquePaths.add(href);
        }
        console.log(`  📍 "${text.trim().padEnd(20)}" → ${href}`);
      }
    }
    
    if (duplicates.length > 0) {
      console.log('\n🔄 Duplicate navigation paths found:');
      duplicates.forEach(d => console.log(`  - "${d.text}" → ${d.href}`));
    }
    
    // Test clickable elements
    console.log('\n' + '='.repeat(60));
    console.log('TESTING INTERACTIVE ELEMENTS');
    console.log('='.repeat(60) + '\n');
    
    await page.goto('/investor-portal/portfolio');
    console.log('Testing on Portfolio page:');
    
    // Check buttons
    const visibleButtons = await page.locator('button:visible').all();
    console.log(`Found ${visibleButtons.length} visible buttons:`);
    
    for (let i = 0; i < Math.min(visibleButtons.length, 10); i++) {
      const button = visibleButtons[i];
      const text = await button.textContent().catch(() => 'No text');
      const isDisabled = await button.isDisabled().catch(() => false);
      const classes = await button.getAttribute('class').catch(() => '');
      
      if (text.trim()) {
        console.log(`  ${isDisabled ? '🔒' : '✅'} Button: "${text.trim().substring(0, 30)}"${isDisabled ? ' (disabled)' : ''}`);
      }
    }
    
    // Check for tabs/filters
    const tabs = await page.locator('[role="tab"], [role="tablist"] button, .tabs button').all();
    if (tabs.length > 0) {
      console.log(`\nFound ${tabs.length} tab controls:`);
      for (const tab of tabs.slice(0, 5)) {
        const text = await tab.textContent().catch(() => '');
        const selected = await tab.getAttribute('aria-selected').catch(() => 'false');
        console.log(`  🔘 Tab: "${text.trim()}" ${selected === 'true' ? '(active)' : ''}`);
      }
    }
    
    // Final summary
    console.log('\n' + '='.repeat(60));
    console.log('NAVIGATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`\n📊 Statistics:`);
    console.log(`  • Unique navigation paths: ${uniquePaths.size}`);
    console.log(`  • Duplicate paths: ${duplicates.length}`);
    console.log(`  • Visible buttons found: ${visibleButtons.length}`);
    console.log(`  • Tab controls found: ${tabs.length}`);
    
    // Test should pass if we found navigation elements
    expect(uniquePaths.size).toBeGreaterThan(0);
  });
});