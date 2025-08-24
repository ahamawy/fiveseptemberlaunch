import { test, expect } from '@playwright/test';

test.describe('Debug Page Content', () => {
  const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

  test('Portfolio page - check actual content', async ({ page }) => {
    await page.goto(`${BASE_URL}/investor-portal/portfolio`);
    await page.waitForTimeout(5000); // Wait for JS to execute
    
    // Get all text content
    const textContent = await page.textContent('body');
    console.log('\n=== PORTFOLIO PAGE CONTENT ===');
    
    // Check for loading/error states
    const hasLoading = textContent?.includes('Loading');
    const hasError = textContent?.includes('Error');
    const hasNoHoldings = textContent?.includes('No holdings');
    
    console.log('Has Loading:', hasLoading);
    console.log('Has Error:', hasError);
    console.log('Has No Holdings:', hasNoHoldings);
    
    // Check for company names
    const companies = ['SpaceX', 'OpenAI', 'Marlo', 'Figure AI'];
    for (const company of companies) {
      const found = textContent?.includes(company);
      console.log(`Has "${company}":`, found);
    }
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/portfolio-debug.png', fullPage: true });
    console.log('Screenshot saved: test-results/portfolio-debug.png');
  });

  test('Deals page - check actual content', async ({ page }) => {
    await page.goto(`${BASE_URL}/investor-portal/deals`);
    await page.waitForTimeout(5000); // Wait for JS to execute
    
    // Get all text content
    const textContent = await page.textContent('body');
    console.log('\n=== DEALS PAGE CONTENT ===');
    
    // Check for loading/error states
    const hasLoading = textContent?.includes('Loading');
    const hasError = textContent?.includes('Error');
    const hasNoDeals = textContent?.includes('No deals');
    
    console.log('Has Loading:', hasLoading);
    console.log('Has Error:', hasError);
    console.log('Has No Deals:', hasNoDeals);
    
    // Check for deal types
    const dealTypes = ['Partnership', 'Series', 'Direct Deal', 'SPV'];
    for (const type of dealTypes) {
      const found = textContent?.includes(type);
      console.log(`Has "${type}":`, found);
    }
    
    // Check for specific deal names
    const dealNames = ['SpaceX Partnership', 'OpenAI Partnership', 'Figure AI Series B'];
    for (const name of dealNames) {
      const found = textContent?.includes(name);
      console.log(`Has "${name}":`, found);
    }
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/deals-debug.png', fullPage: true });
    console.log('Screenshot saved: test-results/deals-debug.png');
  });
});