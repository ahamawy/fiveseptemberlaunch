import { test, expect } from '@playwright/test';

test.describe('Diagnostic: Content Loading Issues', () => {
  const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

  test('Deals page - detailed content check', async ({ page }) => {
    console.log('\n=== DEALS PAGE DIAGNOSTIC ===');
    
    // Navigate and wait for page load
    await page.goto(`${BASE_URL}/investor-portal/deals`);
    await page.waitForLoadState('networkidle');
    
    // Check for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ Console Error:', msg.text());
      }
    });
    
    // Wait a bit for content to render
    await page.waitForTimeout(3000);
    
    // 1. Check page structure
    const pageTitle = await page.title();
    console.log('Page title:', pageTitle);
    
    // 2. Check for loading states
    const loadingElements = await page.locator('text=/loading|Loading|LOADING/i').count();
    console.log('Loading elements found:', loadingElements);
    
    // 3. Check for error messages
    const errorElements = await page.locator('text=/error|Error|ERROR|failed|Failed|FAILED/i').count();
    console.log('Error elements found:', errorElements);
    
    // 4. Check for deal cards or list items
    const dealCards = await page.locator('[class*="card"], [class*="Card"], [class*="deal"], [class*="Deal"]').count();
    console.log('Deal card elements found:', dealCards);
    
    // 5. Check for any text content
    const allText = await page.textContent('body');
    const hasPartnership = allText?.includes('Partnership');
    const hasSeries = allText?.includes('Series');
    const hasDirect = allText?.includes('Direct');
    console.log('Contains "Partnership":', hasPartnership);
    console.log('Contains "Series":', hasSeries);
    console.log('Contains "Direct":', hasDirect);
    
    // 6. Check for specific deal names we know exist
    const knownDeals = ['SpaceX', 'OpenAI', 'Figure AI', 'Marlo', 'Reddit'];
    for (const deal of knownDeals) {
      const found = allText?.includes(deal);
      console.log(`Contains "${deal}":`, found);
    }
    
    // 7. Check for data attributes or empty states
    const emptyStates = await page.locator('text=/no deals|No deals|No Deals|empty|Empty|EMPTY/i').count();
    console.log('Empty state elements:', emptyStates);
    
    // 8. Check network requests
    const apiResponses: any[] = [];
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        apiResponses.push({
          url: response.url(),
          status: response.status(),
          ok: response.ok()
        });
      }
    });
    
    // Reload to capture network activity
    await page.reload();
    await page.waitForTimeout(2000);
    
    console.log('\nAPI Calls made:');
    apiResponses.forEach(r => {
      console.log(`  ${r.status} ${r.ok ? '✓' : '✗'} ${r.url}`);
    });
    
    // 9. Take screenshot for manual inspection
    await page.screenshot({ path: 'test-results/deals-page-diagnostic.png', fullPage: true });
    console.log('\n📸 Screenshot saved: test-results/deals-page-diagnostic.png');
    
    // 10. Get the actual HTML structure
    const mainContent = await page.locator('main').innerHTML();
    const hasContent = mainContent.length > 500;
    console.log('Main content length:', mainContent.length);
    console.log('Has substantial content:', hasContent);
  });

  test('Transactions page - detailed content check', async ({ page }) => {
    console.log('\n=== TRANSACTIONS PAGE DIAGNOSTIC ===');
    
    // Navigate and wait for page load
    await page.goto(`${BASE_URL}/investor-portal/transactions`);
    await page.waitForLoadState('networkidle');
    
    // Check for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ Console Error:', msg.text());
      }
    });
    
    // Wait a bit for content to render
    await page.waitForTimeout(3000);
    
    // 1. Check page structure
    const pageTitle = await page.title();
    console.log('Page title:', pageTitle);
    
    // 2. Check for transaction elements
    const transactionRows = await page.locator('tr, [class*="row"], [class*="Row"], [class*="transaction"], [class*="Transaction"]').count();
    console.log('Transaction row elements found:', transactionRows);
    
    // 3. Check for currency symbols
    const dollarSigns = await page.locator('text=/$').count();
    const amounts = await page.locator('text=/[0-9]+,[0-9]+|[0-9]+\\.[0-9]+/').count();
    console.log('Dollar signs found:', dollarSigns);
    console.log('Number patterns found:', amounts);
    
    // 4. Check text content
    const allText = await page.textContent('body');
    const hasUSD = allText?.includes('USD');
    const hasEUR = allText?.includes('EUR');
    const hasAmount = /\$[0-9,]+/.test(allText || '');
    console.log('Contains "USD":', hasUSD);
    console.log('Contains "EUR":', hasEUR);
    console.log('Contains $ amounts:', hasAmount);
    
    // 5. Check for known transaction details
    const knownCompanies = ['SpaceX', 'OpenAI', 'Figure AI', 'Marlo', 'EWT'];
    for (const company of knownCompanies) {
      const found = allText?.includes(company);
      console.log(`Contains "${company}":`, found);
    }
    
    // 6. Check for empty states
    const emptyStates = await page.locator('text=/no transactions|No transactions|No Transactions|empty|Empty|EMPTY/i').count();
    console.log('Empty state elements:', emptyStates);
    
    // 7. Check network requests
    const apiResponses: any[] = [];
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        apiResponses.push({
          url: response.url(),
          status: response.status(),
          ok: response.ok()
        });
      }
    });
    
    // Reload to capture network activity
    await page.reload();
    await page.waitForTimeout(2000);
    
    console.log('\nAPI Calls made:');
    apiResponses.forEach(r => {
      console.log(`  ${r.status} ${r.ok ? '✓' : '✗'} ${r.url}`);
    });
    
    // 8. Take screenshot
    await page.screenshot({ path: 'test-results/transactions-page-diagnostic.png', fullPage: true });
    console.log('\n📸 Screenshot saved: test-results/transactions-page-diagnostic.png');
    
    // 9. Get the actual HTML structure
    const mainContent = await page.locator('main').innerHTML();
    const hasContent = mainContent.length > 500;
    console.log('Main content length:', mainContent.length);
    console.log('Has substantial content:', hasContent);
  });

  test('API vs UI data comparison', async ({ page }) => {
    console.log('\n=== API vs UI COMPARISON ===');
    
    // 1. Fetch deals from API
    const dealsResponse = await page.request.get(`${BASE_URL}/api/deals?limit=10`);
    const dealsData = await dealsResponse.json();
    console.log('\nDeals API Response:');
    console.log('  Status:', dealsResponse.status());
    console.log('  Deal count:', dealsData.data?.length || 0);
    if (dealsData.data?.length > 0) {
      console.log('  First deal:', {
        name: dealsData.data[0].name,
        company: dealsData.data[0].company_name,
        moic: dealsData.data[0].moic
      });
    }
    
    // 2. Fetch transactions from API
    const txResponse = await page.request.get(`${BASE_URL}/api/transactions?limit=10`);
    const txData = await txResponse.json();
    console.log('\nTransactions API Response:');
    console.log('  Status:', txResponse.status());
    console.log('  Transaction count:', txData.data?.length || 0);
    if (txData.data?.length > 0) {
      console.log('  First transaction:', {
        deal: txData.data[0].deal_name,
        amount: txData.data[0].amount,
        currency: txData.data[0].currency
      });
    }
    
    // 3. Now check if UI shows this data
    console.log('\n=== Checking UI for API data ===');
    
    // Check deals page
    await page.goto(`${BASE_URL}/investor-portal/deals`);
    await page.waitForTimeout(3000);
    
    if (dealsData.data?.length > 0) {
      const firstDealName = dealsData.data[0].name;
      const dealVisible = await page.locator(`text="${firstDealName}"`).count();
      console.log(`\nDeal "${firstDealName}" visible on page:`, dealVisible > 0);
    }
    
    // Check transactions page
    await page.goto(`${BASE_URL}/investor-portal/transactions`);
    await page.waitForTimeout(3000);
    
    if (txData.data?.length > 0) {
      const firstTxDeal = txData.data[0].deal_name;
      const txVisible = await page.locator(`text="${firstTxDeal}"`).count();
      console.log(`Transaction for "${firstTxDeal}" visible on page:`, txVisible > 0);
    }
  });
});