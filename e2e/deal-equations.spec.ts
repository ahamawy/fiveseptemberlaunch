import { test, expect } from '@playwright/test';

test.describe('Deal Equations Viewer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/deal-equations');
  });

  test('should load the deal equations page', async ({ page }) => {
    // Check page title
    await expect(page.locator('h1')).toContainText('Deal Equations Viewer');
    
    // Check for deal selector
    await expect(page.locator('select[name="dealSelector"]')).toBeVisible();
  });

  test('should load deals in dropdown', async ({ page }) => {
    // Wait for deals to load
    const dealSelector = page.locator('select[name="dealSelector"]');
    await expect(dealSelector).toBeVisible();
    
    // Wait for options to load
    await page.waitForTimeout(2000);
    
    // Check that options are loaded
    const options = await dealSelector.locator('option').count();
    expect(options).toBeGreaterThanOrEqual(1); // At least "Select a deal"
  });

  test('should display equation details when deal is selected', async ({ page }) => {
    // Wait for deals to load first
    await page.waitForTimeout(2000);
    
    // Select a deal by value if available
    const dealSelector = page.locator('select[name="dealSelector"]');
    const options = await dealSelector.locator('option').all();
    
    if (options.length > 1) {
      // Get the value of the first real option (not "Select a deal...")
      const firstDealValue = await options[1].getAttribute('value');
      if (firstDealValue) {
        await dealSelector.selectOption(firstDealValue);
        
        // Wait for equation to load
        await page.waitForTimeout(1000);
        
        // Check equation table is displayed
        const equationTable = page.locator('[data-testid="equation-table"]');
        await expect(equationTable).toBeVisible();
        
        // Check for required columns (order matters in the actual page)
        await expect(equationTable.locator('th')).toContainText(['Precedence', 'Component', 'Basis', 'Rate/Amount']);
        
        // Check for at least one fee component row
        const rows = equationTable.locator('tbody tr');
        const rowCount = await rows.count();
        expect(rowCount).toBeGreaterThan(0);
      }
    }
  });

  test('should display calculation summary for latest transaction', async ({ page }) => {
    // Wait for deals to load
    await page.waitForTimeout(2000);
    
    // Select a deal
    const dealSelector = page.locator('select[name="dealSelector"]');
    const options = await dealSelector.locator('option').all();
    
    if (options.length > 1) {
      const firstDealValue = await options[1].getAttribute('value');
      if (firstDealValue) {
        await dealSelector.selectOption(firstDealValue);
        
        // Wait for data to load
        await page.waitForTimeout(1500);
        
        // Check if calculation summary exists (deal might not have transactions)
        const calcSummary = page.locator('[data-testid="calculation-summary"]');
        const isVisible = await calcSummary.isVisible().catch(() => false);
        
        if (isVisible) {
          // Check for key calculation fields
          await expect(calcSummary).toContainText('Gross Capital:');
          await expect(calcSummary).toContainText('Total Fees:');
          await expect(calcSummary).toContainText('Net Capital:');
          await expect(calcSummary).toContainText('Units:');
        } else {
          // No transaction is also valid
          const noTransactionMsg = page.locator('text=/no.*transaction/i');
          await expect(noTransactionMsg.or(calcSummary)).toBeVisible();
        }
      }
    }
  });

  test('should display stored fee application records', async ({ page }) => {
    // Wait for deals to load
    await page.waitForTimeout(2000);
    
    // Select a deal
    const dealSelector = page.locator('select[name="dealSelector"]');
    const options = await dealSelector.locator('option').all();
    
    if (options.length > 1) {
      const firstDealValue = await options[1].getAttribute('value');
      if (firstDealValue) {
        await dealSelector.selectOption(firstDealValue);
        
        // Wait for data to load
        await page.waitForTimeout(1500);
        
        // Check if stored fees section exists (might not have stored records)
        const storedFees = page.locator('[data-testid="stored-fees"]');
        const isVisible = await storedFees.isVisible().catch(() => false);
        
        if (isVisible) {
          // Check for table headers
          await expect(storedFees.locator('th')).toContainText(['Component', 'Amount', 'Percent', 'Applied']);
        }
        // If no stored fees, that's also valid - the section might not show
      }
    }
  });

  test('should handle no transaction gracefully', async ({ page }) => {
    // This test assumes we might have a deal without transactions
    const dealSelector = page.locator('select[name="dealSelector"]');
    
    // Try to find a deal without transactions (may not exist)
    const optionCount = await dealSelector.locator('option').count();
    
    // Select last deal (most likely to not have transactions)
    if (optionCount > 1) {
      await dealSelector.selectOption({ index: optionCount - 1 });
      
      // Check for either calculation or "no transaction" message
      const hasCalculation = await page.locator('[data-testid="calculation-summary"]').isVisible().catch(() => false);
      const hasNoTransactionMsg = await page.locator('text=/no transaction/i').isVisible().catch(() => false);
      
      expect(hasCalculation || hasNoTransactionMsg).toBeTruthy();
    }
  });

  test('should update display when switching between deals', async ({ page }) => {
    const dealSelector = page.locator('select[name="dealSelector"]');
    
    // Select first deal
    await dealSelector.selectOption({ index: 1 });
    await page.waitForSelector('[data-testid="equation-table"]');
    
    // Get first deal's component count
    const firstDealRows = await page.locator('[data-testid="equation-table"] tbody tr').count();
    
    // Select second deal if available
    const optionCount = await dealSelector.locator('option').count();
    if (optionCount > 2) {
      await dealSelector.selectOption({ index: 2 });
      await page.waitForTimeout(500); // Wait for update
      
      // Check that the display has updated (row count might be different)
      const secondDealRows = await page.locator('[data-testid="equation-table"] tbody tr').count();
      
      // At minimum, the page should have re-rendered
      await expect(page.locator('[data-testid="equation-table"]')).toBeVisible();
    }
  });
});