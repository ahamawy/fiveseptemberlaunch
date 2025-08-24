import { test, expect } from '@playwright/test';

test.describe('Portfolio Page Tests', () => {
  test('Portfolio page loads with real data and navigation', async ({ page }) => {
    await page.goto('/investor-portal/portfolio');
    await page.waitForLoadState('networkidle');
    
    // Check page loaded
    await expect(page.locator('h1:has-text("Portfolio Overview")')).toBeVisible();
    
    // Check for real company names
    const pageText = await page.textContent('body');
    console.log('Portfolio page includes:', {
      hasSpaceX: pageText?.includes('SpaceX'),
      hasOpenAI: pageText?.includes('OpenAI'),
      hasFigureAI: pageText?.includes('Figure AI'),
      hasDastgyr: pageText?.includes('Dastgyr')
    });
    
    // Check for MOIC values
    const moicElements = await page.locator('text=/[0-9]+\\.[0-9]+x/').all();
    console.log('MOIC values found:', moicElements.length);
    
    // Check for company logos
    const logos = await page.locator('img[src*="supabase"]').count();
    console.log('Company logos found:', logos);
    
    // Test filters
    const sectorFilters = await page.locator('button:has-text("Technology")').count();
    console.log('Sector filters available:', sectorFilters > 0);
    
    // Test CSV export button
    const exportButton = await page.locator('button:has-text("Export CSV")').isVisible();
    console.log('Export CSV button visible:', exportButton);
    
    // Test deal navigation (click on first deal)
    const firstDealLink = page.locator('table tbody tr').first().locator('a').first();
    const dealHref = await firstDealLink.getAttribute('href');
    console.log('First deal link:', dealHref);
    
    // Click and verify navigation
    if (dealHref) {
      await firstDealLink.click();
      await page.waitForLoadState('networkidle');
      
      // Check we're on deal detail page
      const onDealPage = page.url().includes('/investor-portal/deals/');
      console.log('Navigated to deal detail page:', onDealPage);
      
      // Check for deal detail elements
      const hasBackButton = await page.locator('button:has-text("Back to Portfolio")').isVisible();
      console.log('Back button visible:', hasBackButton);
      
      // Go back to portfolio
      if (hasBackButton) {
        await page.locator('button:has-text("Back to Portfolio")').click();
        await page.waitForLoadState('networkidle');
        console.log('Returned to portfolio page');
      }
    }
    
    // Summary assertions
    expect(pageText).toContain('Portfolio Overview');
    expect(moicElements.length).toBeGreaterThan(0);
  });
});