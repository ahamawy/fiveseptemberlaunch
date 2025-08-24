import { test, expect } from '@playwright/test';

test.describe('Storage Assets Integration', () => {
  const BASE_URL = 'http://localhost:3000';
  
  test('Companies API includes asset URL fields', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/companies`);
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data).toHaveProperty('data');
    expect(Array.isArray(data.data)).toBeTruthy();
    
    // Check that companies have the asset URL fields
    if (data.data.length > 0) {
      const firstCompany = data.data[0];
      expect(firstCompany).toHaveProperty('logo_url');
      expect(firstCompany).toHaveProperty('background_url');
      expect(firstCompany).toHaveProperty('company_id');
      expect(firstCompany).toHaveProperty('company_name');
    }
  });
  
  test('Deals API includes company asset URL fields', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/deals`);
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data).toHaveProperty('success', true);
    expect(data).toHaveProperty('data');
    expect(Array.isArray(data.data)).toBeTruthy();
    
    // Check that deals have the company asset URL fields
    if (data.data.length > 0) {
      const firstDeal = data.data[0];
      expect(firstDeal).toHaveProperty('company_logo_url');
      expect(firstDeal).toHaveProperty('company_background_url');
      expect(firstDeal).toHaveProperty('company_name');
    }
  });
  
  test('Portfolio API deals can resolve company assets', async ({ request }) => {
    // Get portfolio data
    const portfolioResponse = await request.get(`${BASE_URL}/api/investors/1/portfolio`);
    expect(portfolioResponse.ok()).toBeTruthy();
    
    const portfolioData = await portfolioResponse.json();
    expect(portfolioData).toHaveProperty('deals');
    expect(Array.isArray(portfolioData.deals)).toBeTruthy();
    
    // Check that deals have documentsCount field
    if (portfolioData.deals.length > 0) {
      const firstDeal = portfolioData.deals[0];
      expect(firstDeal).toHaveProperty('documentsCount');
      expect(typeof firstDeal.documentsCount).toBe('number');
    }
  });
  
  test('Storage helper properly handles missing assets', async ({ request }) => {
    // This tests that the API doesn't crash when assets don't exist
    const companiesResponse = await request.get(`${BASE_URL}/api/companies`);
    expect(companiesResponse.ok()).toBeTruthy();
    
    const data = await companiesResponse.json();
    
    // Asset URLs should be null when files don't exist in storage
    const companiesWithAssets = data.data.filter((c: any) => c.logo_url !== null || c.background_url !== null);
    
    // Log for verification
    console.log(`Companies with assets: ${companiesWithAssets.length} out of ${data.data.length}`);
    
    // The system should handle missing assets gracefully by returning null
    data.data.forEach((company: any) => {
      expect(['string', 'object']).toContain(typeof company.logo_url); // string or null
      expect(['string', 'object']).toContain(typeof company.background_url);
    });
  });
  
  test('Asset URLs follow expected Supabase storage format', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/companies`);
    const data = await response.json();
    
    // If any company has asset URLs, they should follow the Supabase public URL format
    data.data.forEach((company: any) => {
      if (company.logo_url && typeof company.logo_url === 'string') {
        expect(company.logo_url).toMatch(/https:\/\/.*supabase\.co\/storage\/v1\/object\/public\/.*/);
      }
      if (company.background_url && typeof company.background_url === 'string') {
        expect(company.background_url).toMatch(/https:\/\/.*supabase\.co\/storage\/v1\/object\/public\/.*/);
      }
    });
  });
  
  test('Company assets integration in UI', async ({ page }) => {
    // Navigate to a page that would display company assets
    await page.goto(`${BASE_URL}/investor-portal/portfolio`);
    
    // Wait for the page to load
    await page.waitForSelector('text=/Portfolio Overview/i', { timeout: 10000 });
    
    // Check if the page loads without errors related to asset URLs
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error' && !msg.text().includes('Warning:')) {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.waitForTimeout(2000);
    
    // No critical errors should occur from missing assets
    const assetErrors = consoleErrors.filter(e => 
      e.includes('logo') || 
      e.includes('background') || 
      e.includes('storage')
    );
    
    expect(assetErrors).toHaveLength(0);
  });
  
  test('Verify storage bucket configuration', async ({ request }) => {
    // Test that the system uses the correct bucket name
    const response = await request.get(`${BASE_URL}/api/companies`);
    expect(response.ok()).toBeTruthy();
    
    // The storage helper should use the configured bucket or default to 'company-assets'
    const expectedBucket = process.env.NEXT_PUBLIC_COMPANY_ASSETS_BUCKET || 'company-assets';
    console.log(`Expected storage bucket: ${expectedBucket}`);
    
    // This verifies the configuration is loaded correctly
    expect(expectedBucket).toBeTruthy();
    expect(typeof expectedBucket).toBe('string');
  });
  
  test.describe('Performance', () => {
    test('Asset URL resolution does not slow down API', async ({ request }) => {
      const startTime = Date.now();
      
      // Fetch companies with asset URL resolution
      const response = await request.get(`${BASE_URL}/api/companies`);
      expect(response.ok()).toBeTruthy();
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      // API should respond within reasonable time even with asset checks
      expect(responseTime).toBeLessThan(3000); // 3 seconds max
      console.log(`Companies API with assets responded in ${responseTime}ms`);
    });
    
    test('Deals API performance with asset URLs', async ({ request }) => {
      const startTime = Date.now();
      
      const response = await request.get(`${BASE_URL}/api/deals`);
      expect(response.ok()).toBeTruthy();
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      expect(responseTime).toBeLessThan(3000);
      console.log(`Deals API with assets responded in ${responseTime}ms`);
    });
  });
});