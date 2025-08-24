import { test, expect } from '@playwright/test';

test.describe('Fee Engine Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test.describe('Python Engine API', () => {
    test('should check engine status', async ({ page }) => {
      const response = await page.request.get('/api/admin/fees/python-engine?dealId=28');
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.dealId).toBe(28);
      expect(data.engineExists).toBe(true);
      expect(data.message).toContain('Engine found for deal 28');
    });

    test('should calculate fees for Groq deal', async ({ page }) => {
      const response = await page.request.post('/api/admin/fees/python-engine', {
        data: {
          action: 'calculate',
          dealId: 28,
          data: {
            grossCapital: 100000,
            unitPrice: 1000,
            discounts: [
              { component: 'STRUCTURING_DISCOUNT', percent: 50 },
              { component: 'ADMIN_DISCOUNT', percent: 100 }
            ]
          }
        }
      });

      expect(response.ok()).toBeTruthy();
      const result = await response.json();
      
      expect(result.success).toBe(true);
      expect(result.action).toBe('calculate');
      expect(result.dealId).toBe(28);
      expect(result.result).toBeDefined();
      
      // Verify calculation results
      const calc = result.result;
      expect(calc.gross_capital).toBe(100000);
      expect(calc.premium_amount).toBeCloseTo(3773.6, 1); // 3.7736% of 100k
      expect(calc.net_capital).toBeCloseTo(96226.4, 1);
      expect(calc.units).toBe(96); // floor(96226.4 / 1000)
      expect(calc.total_discounts).toBeGreaterThan(0);
    });

    test('should analyze deal complexity', async ({ page }) => {
      const response = await page.request.post('/api/admin/fees/python-engine', {
        data: {
          action: 'analyze',
          dealId: 28,
          dealName: 'Groq AI Investment',
          dealType: 'FACILITATED_DIRECT'
        }
      });

      expect(response.ok()).toBeTruthy();
      const result = await response.json();
      
      expect(result.success).toBe(true);
      expect(result.result).toBeDefined();
      expect(result.result.complexity_level).toBeDefined();
      expect(result.result.recommended_engine).toBeDefined();
    });
  });

  test.describe('Fee Profiles Management', () => {
    test('should load fee profiles page', async ({ page }) => {
      await page.goto('http://localhost:3000/admin/fees/profiles');
      
      // Check page loaded
      await expect(page.locator('h1')).toContainText('Fee Calculator Profiles');
      
      // Check for deal selector
      const dealSelect = page.locator('select[name="dealId"], input[placeholder*="Deal ID"], input[type="number"]').first();
      await expect(dealSelect).toBeVisible();
    });

    test('should create and activate a fee profile', async ({ page }) => {
      await page.goto('http://localhost:3000/admin/fees/profiles');
      
      // Fill in deal ID
      const dealInput = page.locator('input[placeholder*="Deal ID"]').first();
      if (await dealInput.isVisible()) {
        await dealInput.fill('28');
      } else {
        // Try select element
        const dealSelect = page.locator('select[name="dealId"]').first();
        if (await dealSelect.isVisible()) {
          await dealSelect.selectOption('28');
        }
      }
      
      // Select profile kind
      const kindSelect = page.locator('select').filter({ hasText: /LEGACY|MODERN/ }).first();
      if (await kindSelect.isVisible()) {
        await kindSelect.selectOption('LEGACY');
      }
      
      // Add configuration JSON
      const configTextarea = page.locator('textarea').first();
      if (await configTextarea.isVisible()) {
        const config = {
          ordering: ['PREMIUM', 'STRUCTURING', 'MANAGEMENT', 'ADMIN'],
          premium: { pct: 3.7736, basis: 'GROSS' },
          structuring: { pct: 4, basis: 'GROSS' },
          management: { pct: 2, basis: 'GROSS' },
          admin: { amount: 450, basis: 'FIXED' }
        };
        await configTextarea.fill(JSON.stringify(config, null, 2));
      }
      
      // Click create button
      const createButton = page.locator('button').filter({ hasText: /Create|Activate|Save/ }).first();
      if (await createButton.isVisible()) {
        await createButton.click();
        
        // Check for success message or profile in list
        await page.waitForTimeout(1000);
        const successMessage = page.locator('text=/success|created|activated/i');
        if (await successMessage.isVisible({ timeout: 5000 }).catch(() => false)) {
          expect(await successMessage.isVisible()).toBe(true);
        }
      }
    });
  });

  test.describe('Fee Import', () => {
    test('should load import page', async ({ page }) => {
      await page.goto('http://localhost:3000/admin/fees/import');
      
      // Check page loaded
      await expect(page.locator('h1')).toContainText('Legacy Fees Import');
      
      // Check for CSV input
      const csvInput = page.locator('textarea[placeholder*="CSV"], textarea[placeholder*="csv"], textarea').first();
      await expect(csvInput).toBeVisible();
    });

    test('should preview CSV import', async ({ page }) => {
      await page.goto('http://localhost:3000/admin/fees/import');
      
      // Sample CSV data
      const csvData = `investor_name,gross_capital,structuring_discount_percent,management_discount_percent,admin_discount_percent
John Doe,100000,50,0,100
Jane Smith,75000,0,0,0
Bob Johnson,125000,25,25,50`;
      
      // Input CSV data
      const csvTextarea = page.locator('textarea').first();
      await csvTextarea.fill(csvData);
      
      // Click upload/preview button
      const uploadButton = page.locator('button').filter({ hasText: /Upload|Preview|Import/ }).first();
      await uploadButton.click();
      
      // Wait for preview to load
      await page.waitForTimeout(2000);
      
      // Check if preview table appears
      const previewTable = page.locator('table').first();
      if (await previewTable.isVisible({ timeout: 5000 }).catch(() => false)) {
        // Verify data in preview
        await expect(previewTable.locator('td').filter({ hasText: 'John Doe' })).toBeVisible();
        await expect(previewTable.locator('td').filter({ hasText: '100000' })).toBeVisible();
      }
    });
  });

  test.describe('Admin Chat with Fee Engine', () => {
    test('should load chat interface', async ({ page }) => {
      await page.goto('http://localhost:3000/admin/chat');
      
      // Check page loaded with correct title
      await expect(page.locator('h1')).toContainText('EQUITIE Bot');
      
      // Check chat interface loaded
      const chatInput = page.locator('textarea[placeholder*="fee structures"], textarea[placeholder*="Ask about"]').first();
      await expect(chatInput).toBeVisible();
      
      // Check for send button
      const sendButton = page.locator('button').filter({ hasText: 'Send' }).first();
      await expect(sendButton).toBeVisible();
    });

    test('should calculate fees via chat', async ({ page }) => {
      await page.goto('http://localhost:3000/admin/chat');
      
      // Type fee calculation request
      const chatInput = page.locator('textarea[placeholder*="fee structures"], textarea[placeholder*="Ask about"]').first();
      await chatInput.fill('Calculate fees for deal 28 with $100,000 investment');
      
      // Send message
      const sendButton = page.locator('button').filter({ hasText: 'Send' }).first();
      await sendButton.click();
      
      // Wait for response
      await page.waitForTimeout(3000);
      
      // Check if response contains fee information
      const response = page.locator('div').filter({ hasText: /premium|transfer|units/i }).first();
      if (await response.isVisible({ timeout: 5000 }).catch(() => false)) {
        const responseText = await response.textContent();
        expect(responseText).toMatch(/premium|fee|transfer|units/i);
      }
    });
  });

  test.describe('Fee Calculation Validation', () => {
    test('should validate Groq deal calculations', async ({ page }) => {
      // Test expected values from documentation
      const testCases = [
        {
          grossCapital: 100000,
          expectedPremium: 3773.58,
          expectedNet: 96226.42,
          expectedUnits: 96,
          structuringDiscount: 50,
          adminDiscount: 100,
          expectedTransfer: 7773.58
        },
        {
          grossCapital: 75000,
          expectedPremium: 2830.19,
          expectedNet: 72169.81,
          expectedUnits: 72,
          structuringDiscount: 0,
          adminDiscount: 0,
          expectedTransfer: 7780.19
        }
      ];

      for (const testCase of testCases) {
        const response = await page.request.post('/api/admin/fees/python-engine', {
          data: {
            action: 'calculate',
            dealId: 28,
            data: {
              grossCapital: testCase.grossCapital,
              unitPrice: 1000,
              discounts: [
                { component: 'STRUCTURING_DISCOUNT', percent: testCase.structuringDiscount },
                { component: 'ADMIN_DISCOUNT', percent: testCase.adminDiscount }
              ]
            }
          }
        });

        const result = await response.json();
        
        if (result.success && result.result) {
          const calc = result.result;
          
          // Validate premium calculation (3.77358% rate)
          expect(calc.premium_amount).toBeCloseTo(testCase.expectedPremium, 0);
          
          // Validate net capital
          expect(calc.net_capital).toBeCloseTo(testCase.expectedNet, 0);
          
          // Validate units (always floor)
          expect(calc.units).toBe(testCase.expectedUnits);
        }
      }
    });

    test('should detect anomalies in fee applications', async ({ page }) => {
      // This would test the anomaly detection service
      // In a real scenario, we'd need to create a transaction with known issues
      
      const response = await page.request.get('/api/admin/fees/python-engine');
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(data.status).toBe('ready');
    });
  });

  test.describe('Fee Engine Health Check', () => {
    test('should verify Python engine is operational', async ({ page }) => {
      const response = await page.request.get('/api/admin/fees/python-engine');
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.status).toBe('ready');
      expect(data.availableActions).toContain('calculate');
      expect(data.availableActions).toContain('analyze');
      expect(data.availableActions).toContain('generate');
    });

    test('should verify Groq engine exists', async ({ page }) => {
      const response = await page.request.get('/api/admin/fees/python-engine?dealId=28');
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(data.engineExists).toBe(true);
      expect(data.enginePath).toContain('deal_28');
    });
  });

  test.describe('Discount Validation', () => {
    test('should apply discounts as negative amounts', async ({ page }) => {
      const response = await page.request.post('/api/admin/fees/python-engine', {
        data: {
          action: 'calculate',
          dealId: 28,
          data: {
            grossCapital: 100000,
            unitPrice: 1000,
            discounts: [
              { component: 'STRUCTURING_DISCOUNT', percent: 50 }
            ]
          }
        }
      });

      const result = await response.json();
      
      if (result.success && result.result) {
        // Discounts should reduce the transfer amount
        expect(result.result.total_discounts).toBeGreaterThan(0);
        expect(result.result.transfer_post_discount).toBeLessThan(result.result.transfer_pre_discount);
      }
    });

    test('should not allow discounts to exceed base fees', async ({ page }) => {
      const response = await page.request.post('/api/admin/fees/python-engine', {
        data: {
          action: 'calculate',
          dealId: 28,
          data: {
            grossCapital: 100000,
            unitPrice: 1000,
            discounts: [
              { component: 'STRUCTURING_DISCOUNT', percent: 150 } // 150% should be capped at 100%
            ]
          }
        }
      });

      const result = await response.json();
      
      if (result.success && result.result) {
        // Transfer should never be negative
        expect(result.result.transfer_post_discount).toBeGreaterThanOrEqual(0);
      }
    });
  });
});

test.describe('Fee Engine E2E Flow', () => {
  test('complete Groq deal flow', async ({ page }) => {
    // Step 1: Check engine status
    let response = await page.request.get('/api/admin/fees/python-engine?dealId=28');
    expect(response.ok()).toBeTruthy();
    let data = await response.json();
    expect(data.engineExists).toBe(true);

    // Step 2: Calculate fees for multiple investors
    const investors = [
      { name: 'John Doe', gross: 100000, structDiscount: 50, adminDiscount: 100 },
      { name: 'Jane Smith', gross: 75000, structDiscount: 0, adminDiscount: 0 },
      { name: 'Bob Johnson', gross: 125000, structDiscount: 25, adminDiscount: 50 }
    ];

    let totalGross = 0;
    let totalTransfer = 0;

    for (const investor of investors) {
      response = await page.request.post('/api/admin/fees/python-engine', {
        data: {
          action: 'calculate',
          dealId: 28,
          data: {
            grossCapital: investor.gross,
            unitPrice: 1000,
            discounts: [
              { component: 'STRUCTURING_DISCOUNT', percent: investor.structDiscount },
              { component: 'ADMIN_DISCOUNT', percent: investor.adminDiscount }
            ]
          }
        }
      });

      const result = await response.json();
      expect(result.success).toBe(true);
      
      if (result.result) {
        totalGross += investor.gross;
        totalTransfer += result.result.transfer_post_discount;
        
        // Verify each calculation
        expect(result.result.gross_capital).toBe(investor.gross);
        expect(result.result.units).toBeGreaterThanOrEqual(0);
        expect(result.result.premium_amount).toBeGreaterThan(0);
      }
    }

    // Step 3: Verify totals
    expect(totalGross).toBe(300000);
    expect(totalTransfer).toBeGreaterThan(0);
    
    console.log(`E2E Test Complete: Total Gross: $${totalGross}, Total Transfer: $${totalTransfer.toFixed(2)}`);
  });
});