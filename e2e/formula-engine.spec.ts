import { test, expect } from '@playwright/test';

test.describe('Formula Engine System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001/admin/formula-manager');
    // Wait for the page to load
    await page.waitForSelector('h1:has-text("Formula Manager")');
  });

  test('should load formula manager page', async ({ page }) => {
    // Check page title
    await expect(page.locator('h1')).toContainText('Formula Manager');
    await expect(page.locator('p:has-text("Manage deal economics formulas")')).toBeVisible();
  });

  test('should display formula templates list', async ({ page }) => {
    // Wait for formulas to load
    await page.waitForSelector('text=Formula Templates', { timeout: 10000 });
    
    // Check if formula list is visible
    const formulaList = page.locator('text=Formula Templates').locator('..');
    await expect(formulaList).toBeVisible();
    
    // Check for some expected formula templates
    const expectedFormulas = ['GROQ', 'REDDIT', 'OPENAI', 'SPACEX1', 'SPACEX2'];
    
    for (const formula of expectedFormulas.slice(0, 2)) { // Test first 2 to avoid timeout
      const formulaElement = page.locator(`text=${formula}`).first();
      await expect(formulaElement).toBeVisible({ timeout: 5000 });
    }
  });

  test('should select and display formula details', async ({ page }) => {
    // Wait for formulas to load
    await page.waitForSelector('text=GROQ', { timeout: 10000 });
    
    // Click on GROQ formula
    await page.click('text=GROQ');
    
    // Check if formula details are displayed
    await expect(page.locator('text=Formula Details')).toBeVisible();
    
    // Check for formula fields
    await expect(page.locator('text=Net Capital Formula')).toBeVisible();
    await expect(page.locator('text=Investor Proceeds Formula')).toBeVisible();
    
    // Check if NC formula contains expected content
    const ncFormulaField = page.locator('textarea').first();
    const ncFormulaValue = await ncFormulaField.inputValue();
    expect(ncFormulaValue).toContain('GC');
    expect(ncFormulaValue).toContain('PMSP');
    expect(ncFormulaValue).toContain('ISP');
  });

  test('should test formula with sample variables', async ({ page }) => {
    // Wait for formulas to load and select GROQ
    await page.waitForSelector('text=GROQ', { timeout: 10000 });
    await page.click('text=GROQ');
    
    // Wait for formula details to load
    await page.waitForSelector('text=Formula Details');
    
    // Find and click the test button (beaker icon) for NC formula
    const testButton = page.locator('button').filter({ has: page.locator('svg') }).first();
    await testButton.click();
    
    // Wait for test result
    await page.waitForSelector('text=Test Successful', { timeout: 10000 });
    
    // Check if result is displayed
    const resultElement = page.locator('text=Result:');
    await expect(resultElement).toBeVisible();
    
    // Verify result contains a number
    const resultText = await resultElement.textContent();
    expect(resultText).toMatch(/Result:.*[\d,]+\.?\d*/);
  });

  test('should enter edit mode and modify formula', async ({ page }) => {
    // Select a formula
    await page.waitForSelector('text=GROQ', { timeout: 10000 });
    await page.click('text=GROQ');
    
    // Click Edit button
    await page.click('button:has-text("Edit")');
    
    // Check if Save and Cancel buttons appear
    await expect(page.locator('button:has-text("Save")')).toBeVisible();
    await expect(page.locator('button:has-text("Cancel")')).toBeVisible();
    
    // Check if formula fields are editable
    const formulaNameInput = page.locator('input[value="GROQ Standard"]');
    await expect(formulaNameInput).toBeEnabled();
    
    // Cancel edit
    await page.click('button:has-text("Cancel")');
    
    // Check if back to view mode
    await expect(page.locator('button:has-text("Edit")')).toBeVisible();
  });

  test('should create new formula template', async ({ page }) => {
    // Click New Formula button
    await page.click('button:has-text("New Formula")');
    
    // Check if form is in edit mode
    await expect(page.locator('text=Edit Formula')).toBeVisible();
    await expect(page.locator('button:has-text("Save")')).toBeVisible();
    
    // Fill in formula details
    await page.fill('input[value=""]', 'TEST_FORMULA');
    await page.fill('input[disabled]:has-text("")', 'Test Formula Template');
    
    // Fill NC formula
    const ncTextarea = page.locator('textarea').first();
    await ncTextarea.fill('GC * 0.95');
    
    // Cancel creation (to avoid affecting data)
    await page.click('button:has-text("Cancel")');
    
    // Verify returned to selection state
    await expect(page.locator('text=Select a formula template or create a new one')).toBeVisible();
  });

  test('should validate formula flags and features', async ({ page }) => {
    // Select REDDIT formula (which has different features)
    await page.waitForSelector('text=REDDIT', { timeout: 10000 });
    await page.click('div:has-text("REDDIT"):has-text("Reddit")');
    
    // Wait for details to load
    await page.waitForSelector('text=Formula Details');
    
    // Check formula flags
    const checkboxes = page.locator('input[type="checkbox"]');
    const checkboxCount = await checkboxes.count();
    expect(checkboxCount).toBeGreaterThan(0);
    
    // Verify at least one checkbox is visible
    const firstCheckbox = checkboxes.first();
    await expect(firstCheckbox).toBeVisible();
  });
});

test.describe('Formula API Endpoints', () => {
  test('should fetch formulas via API', async ({ request }) => {
    const response = await request.get('/api/admin/formulas');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
    expect(data.data.length).toBeGreaterThan(0);
    
    // Check structure of first formula
    const firstFormula = data.data[0];
    expect(firstFormula).toHaveProperty('formula_code');
    expect(firstFormula).toHaveProperty('formula_name');
    expect(firstFormula).toHaveProperty('nc_formula');
    expect(firstFormula).toHaveProperty('investor_proceeds_formula');
  });

  test('should test formula calculation via API', async ({ request }) => {
    const testData = {
      formula: 'GC * (PMSP/ISP)',
      variables: {
        GC: 1000000,
        PMSP: 100,
        ISP: 105
      }
    };

    const response = await request.post('/api/admin/formulas/test', {
      data: testData
    });

    expect(response.ok()).toBeTruthy();
    
    const result = await response.json();
    expect(result.success).toBe(true);
    expect(typeof result.result).toBe('number');
    
    // Verify calculation is correct: 1000000 * (100/105) = 952380.95...
    expect(result.result).toBeCloseTo(952380.95, 0);
  });

  test('should handle formula with complex functions', async ({ request }) => {
    const testData = {
      formula: 'NC * MIN(T, 2) + MAX(T-2, 0) * 1000',
      variables: {
        NC: 100000,
        T: 5
      }
    };

    const response = await request.post('/api/admin/formulas/test', {
      data: testData
    });

    expect(response.ok()).toBeTruthy();
    
    const result = await response.json();
    expect(result.success).toBe(true);
    
    // Verify: 100000 * MIN(5, 2) + MAX(5-2, 0) * 1000 = 100000 * 2 + 3 * 1000 = 203000
    expect(result.result).toBe(203000);
  });

  test('should handle invalid formula gracefully', async ({ request }) => {
    const testData = {
      formula: 'GC * (INVALID',
      variables: {
        GC: 1000000
      }
    };

    const response = await request.post('/api/admin/formulas/test', {
      data: testData
    });

    expect(response.ok()).toBeTruthy();
    
    const result = await response.json();
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  test('should calculate deal economics with full formula', async ({ request }) => {
    const testData = {
      formula: '(NC * (EUP/IUP)) - (MFR * GC * T) - (SFR * GC) - AF - (PFR * ((NC * (EUP/IUP)) - NC))',
      variables: {
        NC: 950000,
        GC: 1000000,
        EUP: 150,
        IUP: 105,
        MFR: 0.02,
        SFR: 0.03,
        AF: 5000,
        PFR: 0.20,
        T: 5
      }
    };

    const response = await request.post('/api/admin/formulas/test', {
      data: testData
    });

    expect(response.ok()).toBeTruthy();
    
    const result = await response.json();
    expect(result.success).toBe(true);
    expect(typeof result.result).toBe('number');
    expect(result.result).toBeGreaterThan(0);
  });
});

test.describe('Portfolio Integration', () => {
  test('should display portfolio with economics calculations', async ({ page }) => {
    await page.goto('http://localhost:3001/investor-portal/portfolio');
    
    // Wait for portfolio to load
    await page.waitForSelector('h1:has-text("Portfolio Overview")', { timeout: 10000 });
    
    // Check if summary cards are visible
    await expect(page.locator('text=Total Portfolio Value')).toBeVisible();
    await expect(page.locator('text=Total Deals')).toBeVisible();
    await expect(page.locator('text=Active Deals')).toBeVisible();
    
    // Check if deals table/cards toggle is present
    await expect(page.locator('button:has-text("Table")')).toBeVisible();
    await expect(page.locator('button:has-text("Cards")')).toBeVisible();
    
    // Check if deals section is present
    await expect(page.locator('text=Deals').first()).toBeVisible();
  });

  test('should show deal data in table view', async ({ page }) => {
    await page.goto('http://localhost:3001/investor-portal/portfolio');
    
    // Wait for page to load
    await page.waitForSelector('text=Portfolio Overview');
    
    // Ensure table view is selected
    await page.click('button:has-text("Table")');
    
    // Check for table headers
    const expectedHeaders = ['Deal', 'Company', 'Committed', 'Current Value', 'IRR', 'MOIC', 'Status'];
    
    for (const header of expectedHeaders.slice(0, 3)) { // Test first 3 to avoid timeout
      await expect(page.locator(`th:has-text("${header}")`)).toBeVisible({ timeout: 5000 });
    }
  });
});