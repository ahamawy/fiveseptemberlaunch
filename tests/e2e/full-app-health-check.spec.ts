import { test, expect } from '@playwright/test';

// Test configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const TIMEOUT = 10000; // 10 seconds max for page load

// Helper to check if page loads without errors
async function checkPageHealth(
  page: any,
  url: string,
  expectedTitle: string | RegExp,
  options: {
    checkAPI?: string | string[];
    expectedElements?: string[];
    allowedErrors?: string[];
  } = {}
) {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Capture console errors
  page.on('console', (msg: any) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (!options.allowedErrors?.some(allowed => text.includes(allowed))) {
        errors.push(`Console error: ${text}`);
      }
    }
  });
  
  // Capture network failures
  page.on('requestfailed', (request: any) => {
    const url = request.url();
    if (!url.includes('_next/static')) { // Ignore static asset failures
      errors.push(`Request failed: ${url} - ${request.failure()?.errorText}`);
    }
  });
  
  // Navigate to page
  const startTime = Date.now();
  const response = await page.goto(url, { 
    waitUntil: 'networkidle',
    timeout: TIMEOUT 
  }).catch((e: any) => {
    errors.push(`Navigation failed: ${e.message}`);
    return null;
  });
  
  const loadTime = Date.now() - startTime;
  
  // Check response status
  if (response) {
    const status = response.status();
    if (status >= 400) {
      errors.push(`Page returned status ${status}`);
    }
  }
  
  // Check for expected title/heading
  try {
    await expect(page.getByText(expectedTitle)).toBeVisible({ timeout: 5000 });
  } catch (e) {
    warnings.push(`Expected title/heading "${expectedTitle}" not found`);
  }
  
  // Check for expected elements
  if (options.expectedElements) {
    for (const element of options.expectedElements) {
      try {
        await expect(page.getByText(element)).toBeVisible({ timeout: 3000 });
      } catch (e) {
        warnings.push(`Expected element "${element}" not found`);
      }
    }
  }
  
  // Check API calls if specified
  if (options.checkAPI) {
    const apis = Array.isArray(options.checkAPI) ? options.checkAPI : [options.checkAPI];
    for (const api of apis) {
      try {
        const apiResponse = await page.waitForResponse(
          (response: any) => response.url().includes(api),
          { timeout: 5000 }
        );
        const apiStatus = apiResponse.status();
        if (apiStatus >= 400) {
          errors.push(`API ${api} returned status ${apiStatus}`);
        } else {
          const data = await apiResponse.json().catch(() => null);
          if (!data) {
            warnings.push(`API ${api} returned invalid JSON`);
          } else if (data.error) {
            errors.push(`API ${api} returned error: ${data.error}`);
          }
        }
      } catch (e) {
        warnings.push(`API ${api} was not called or timed out`);
      }
    }
  }
  
  // Performance warning
  if (loadTime > 3000) {
    warnings.push(`Slow load time: ${loadTime}ms`);
  }
  
  return {
    url,
    status: errors.length > 0 ? 'FAILED' : warnings.length > 0 ? 'WARNING' : 'PASSED',
    loadTime,
    errors,
    warnings
  };
}

test.describe('Full Application Health Check', () => {
  test.describe.configure({ mode: 'parallel' });
  
  let results: any[] = [];
  
  test.afterAll(async () => {
    // Print summary report
    console.log('\n=================================');
    console.log('HEALTH CHECK SUMMARY REPORT');
    console.log('=================================\n');
    
    const failed = results.filter(r => r.status === 'FAILED');
    const warning = results.filter(r => r.status === 'WARNING');
    const passed = results.filter(r => r.status === 'PASSED');
    
    console.log(`✅ PASSED: ${passed.length} pages`);
    console.log(`⚠️  WARNING: ${warning.length} pages`);
    console.log(`❌ FAILED: ${failed.length} pages\n`);
    
    if (failed.length > 0) {
      console.log('FAILED PAGES (Need Immediate Fix):');
      failed.forEach(r => {
        console.log(`\n❌ ${r.url}`);
        r.errors.forEach((e: string) => console.log(`   - ${e}`));
      });
    }
    
    if (warning.length > 0) {
      console.log('\nWARNING PAGES (Need Review):');
      warning.forEach(r => {
        console.log(`\n⚠️  ${r.url}`);
        r.warnings.forEach((w: string) => console.log(`   - ${w}`));
      });
    }
    
    console.log('\n=================================\n');
  });
  
  test.describe('Admin Portal Pages', () => {
    test('Admin Dashboard', async ({ page }) => {
      const result = await checkPageHealth(
        page,
        '/admin/dashboard',
        /Dashboard|Admin/i,
        {
          checkAPI: '/api/admin/metrics',
          expectedElements: ['Dashboard']
        }
      );
      results.push(result);
      
      if (result.status === 'FAILED') {
        throw new Error(`Page failed: ${result.errors.join(', ')}`);
      }
    });
    
    test('Admin Deals', async ({ page }) => {
      const result = await checkPageHealth(
        page,
        '/admin/deals',
        /Deals/i,
        {
          checkAPI: '/api/deals',
          expectedElements: ['Deals']
        }
      );
      results.push(result);
      
      if (result.status === 'FAILED') {
        throw new Error(`Page failed: ${result.errors.join(', ')}`);
      }
    });
    
    test('Admin Investors', async ({ page }) => {
      const result = await checkPageHealth(
        page,
        '/admin/investors',
        /Investors/i,
        {
          checkAPI: '/api/investors',
          expectedElements: ['Investors']
        }
      );
      results.push(result);
      
      if (result.status === 'FAILED') {
        throw new Error(`Page failed: ${result.errors.join(', ')}`);
      }
    });
    
    test('Admin Transactions', async ({ page }) => {
      const result = await checkPageHealth(
        page,
        '/admin/transactions',
        /Transactions/i,
        {
          checkAPI: '/api/transactions',
          expectedElements: ['Transactions']
        }
      );
      results.push(result);
      
      if (result.status === 'FAILED') {
        throw new Error(`Page failed: ${result.errors.join(', ')}`);
      }
    });
    
    test('Admin Companies', async ({ page }) => {
      const result = await checkPageHealth(
        page,
        '/admin/companies',
        /Companies/i,
        {
          checkAPI: '/api/companies',
          expectedElements: ['Companies']
        }
      );
      results.push(result);
      
      if (result.status === 'FAILED') {
        throw new Error(`Page failed: ${result.errors.join(', ')}`);
      }
    });
    
    test('Admin Formulas', async ({ page }) => {
      const result = await checkPageHealth(
        page,
        '/admin/formulas',
        /Formula/i,
        {
          checkAPI: '/api/admin/formulas',
          expectedElements: ['Formula']
        }
      );
      results.push(result);
      
      if (result.status === 'FAILED') {
        throw new Error(`Page failed: ${result.errors.join(', ')}`);
      }
    });
    
    test('Admin Fees', async ({ page }) => {
      const result = await checkPageHealth(
        page,
        '/admin/fees',
        /Fee/i,
        {
          expectedElements: ['Fee']
        }
      );
      results.push(result);
      
      if (result.status === 'FAILED') {
        throw new Error(`Page failed: ${result.errors.join(', ')}`);
      }
    });
    
    test('Admin Chat', async ({ page }) => {
      const result = await checkPageHealth(
        page,
        '/admin/chat',
        /Chat|AI|Assistant/i,
        {
          expectedElements: ['Chat']
        }
      );
      results.push(result);
      
      if (result.status === 'FAILED') {
        throw new Error(`Page failed: ${result.errors.join(', ')}`);
      }
    });
    
    test('Admin Deal Equations', async ({ page }) => {
      const result = await checkPageHealth(
        page,
        '/admin/deal-equations',
        /Equation|Deal/i,
        {
          expectedElements: ['Deal', 'Equation']
        }
      );
      results.push(result);
      
      if (result.status === 'FAILED') {
        throw new Error(`Page failed: ${result.errors.join(', ')}`);
      }
    });
    
    test('Admin Formula Manager', async ({ page }) => {
      const result = await checkPageHealth(
        page,
        '/admin/formula-manager',
        /Formula/i,
        {
          expectedElements: ['Formula']
        }
      );
      results.push(result);
      
      if (result.status === 'FAILED') {
        throw new Error(`Page failed: ${result.errors.join(', ')}`);
      }
    });
  });
  
  test.describe('Investor Portal Pages', () => {
    test('Investor Dashboard', async ({ page }) => {
      const result = await checkPageHealth(
        page,
        '/investor-portal/dashboard',
        /Welcome|Dashboard|Portfolio/i,
        {
          checkAPI: '/api/investors/1/dashboard',
          expectedElements: ['Portfolio Value', 'Total Invested']
        }
      );
      results.push(result);
      
      if (result.status === 'FAILED') {
        throw new Error(`Page failed: ${result.errors.join(', ')}`);
      }
    });
    
    test('Investor Portfolio', async ({ page }) => {
      const result = await checkPageHealth(
        page,
        '/investor-portal/portfolio',
        /Portfolio/i,
        {
          checkAPI: '/api/investors/1/portfolio',
          expectedElements: ['Portfolio', 'Total']
        }
      );
      results.push(result);
      
      if (result.status === 'FAILED') {
        throw new Error(`Page failed: ${result.errors.join(', ')}`);
      }
    });
    
    test('Investor Deals', async ({ page }) => {
      const result = await checkPageHealth(
        page,
        '/investor-portal/deals',
        /Deals|Commitments/i,
        {
          checkAPI: '/api/investors/1/commitments',
          expectedElements: ['Deals', 'Total Committed']
        }
      );
      results.push(result);
      
      if (result.status === 'FAILED') {
        throw new Error(`Page failed: ${result.errors.join(', ')}`);
      }
    });
    
    test('Investor Transactions', async ({ page }) => {
      const result = await checkPageHealth(
        page,
        '/investor-portal/transactions',
        /Transaction/i,
        {
          checkAPI: '/api/investors/1/transactions',
          expectedElements: ['Transaction History']
        }
      );
      results.push(result);
      
      if (result.status === 'FAILED') {
        throw new Error(`Page failed: ${result.errors.join(', ')}`);
      }
    });
    
    test('Investor Documents', async ({ page }) => {
      const result = await checkPageHealth(
        page,
        '/investor-portal/documents',
        /Documents/i,
        {
          checkAPI: '/api/documents',
          expectedElements: ['Documents']
        }
      );
      results.push(result);
      
      if (result.status === 'FAILED') {
        throw new Error(`Page failed: ${result.errors.join(', ')}`);
      }
    });
    
    test('Investor Profile', async ({ page }) => {
      const result = await checkPageHealth(
        page,
        '/investor-portal/profile',
        /Profile/i,
        {
          expectedElements: ['Profile']
        }
      );
      results.push(result);
      
      if (result.status === 'FAILED') {
        throw new Error(`Page failed: ${result.errors.join(', ')}`);
      }
    });
  });
  
  test.describe('API Endpoints Health', () => {
    test('Supabase Connection', async ({ page }) => {
      await page.goto('/');
      
      // Test critical API endpoints directly
      const endpoints = [
        '/api/health/supabase',
        '/api/deals',
        '/api/investors',
        '/api/transactions',
        '/api/companies',
        '/api/documents'
      ];
      
      for (const endpoint of endpoints) {
        const response = await page.request.get(endpoint).catch(e => null);
        
        if (!response) {
          results.push({
            url: endpoint,
            status: 'FAILED',
            errors: [`Endpoint unreachable`],
            warnings: []
          });
        } else {
          const status = response.status();
          const data = await response.json().catch(() => null);
          
          if (status >= 400) {
            results.push({
              url: endpoint,
              status: 'FAILED',
              errors: [`Status ${status}: ${data?.error || 'Unknown error'}`],
              warnings: []
            });
          } else if (!data) {
            results.push({
              url: endpoint,
              status: 'WARNING',
              errors: [],
              warnings: ['Invalid JSON response']
            });
          } else {
            results.push({
              url: endpoint,
              status: 'PASSED',
              errors: [],
              warnings: []
            });
          }
        }
      }
    });
  });
  
  test.describe('Landing Pages', () => {
    test('Homepage', async ({ page }) => {
      const result = await checkPageHealth(
        page,
        '/',
        /Equitie/i,
        {
          expectedElements: ['Private Markets', 'Investor Portal']
        }
      );
      results.push(result);
      
      if (result.status === 'FAILED') {
        throw new Error(`Page failed: ${result.errors.join(', ')}`);
      }
    });
  });
});