import { test, expect } from '@playwright/test';

test.describe('Fee Management System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/admin/fees/profiles');
  });

  test('should load fee profiles page', async ({ page }) => {
    // Check page title
    await expect(page.locator('h1')).toContainText('Fee Calculator Profiles');
    
    // Check main sections exist
    await expect(page.locator('text=Create Profile')).toBeVisible();
    await expect(page.locator('text=Existing Profiles')).toBeVisible();
  });

  test('should create a new fee profile', async ({ page }) => {
    // Fill in profile form
    await page.fill('input[placeholder="Enter profile name..."]', 'Test Profile');
    await page.fill('input[placeholder="Enter deal ID..."]', '100');
    await page.selectOption('select', 'LEGACY');
    
    // Add configuration
    const config = {
      tiers: [
        {
          threshold: 0,
          management_fee: 0.02,
          performance_fee: 0.20,
          admin_fee: 0.005
        }
      ],
      hurdle_rate: 0.08,
      catch_up: true
    };
    
    await page.fill('textarea', JSON.stringify(config, null, 2));
    
    // Click create button
    await page.click('button:has-text("Create Profile")');
    
    // Check success message
    await expect(page.locator('text=Profile created')).toBeVisible();
  });

  test('should edit an existing profile', async ({ page }) => {
    // Wait for profiles to load
    await page.waitForSelector('text=Existing Profiles');
    
    // Click edit on first profile if exists
    const editButton = page.locator('button:has-text("Edit")').first();
    const editButtonCount = await editButton.count();
    
    if (editButtonCount > 0) {
      await editButton.click();
      
      // Check that form is populated
      const profileNameInput = page.locator('input[placeholder="Enter profile name..."]');
      await expect(profileNameInput).not.toBeEmpty();
      
      // Update the name
      await profileNameInput.fill('Updated Test Profile');
      
      // Click update button
      await page.click('button:has-text("Update Profile")');
      
      // Check success message
      await expect(page.locator('text=Profile updated')).toBeVisible();
    }
  });

  test('should clone a profile', async ({ page }) => {
    // Wait for profiles to load
    await page.waitForSelector('text=Existing Profiles');
    
    // Click clone on first profile if exists
    const cloneButton = page.locator('button:has-text("Clone")').first();
    const cloneButtonCount = await cloneButton.count();
    
    if (cloneButtonCount > 0) {
      await cloneButton.click();
      
      // Check that form is populated with copy name
      const profileNameInput = page.locator('input[placeholder="Enter profile name..."]');
      const nameValue = await profileNameInput.inputValue();
      expect(nameValue).toContain('(Copy)');
      
      // Create the cloned profile
      await page.click('button:has-text("Create Profile")');
      
      // Check success message
      await expect(page.locator('text=Profile created')).toBeVisible();
    }
  });

  test('should toggle premium calculation', async ({ page }) => {
    // Check premium toggle in create form
    const premiumCheckbox = page.locator('input[type="checkbox"]').first();
    await premiumCheckbox.check();
    
    // Verify it's checked
    await expect(premiumCheckbox).toBeChecked();
    
    // Uncheck it
    await premiumCheckbox.uncheck();
    await expect(premiumCheckbox).not.toBeChecked();
  });
});

test.describe('Fee Import System', () => {
  test('should load fee import page', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/fees/import');
    
    // Check page elements
    await expect(page.locator('h1')).toContainText('Legacy Fees Import');
    await expect(page.locator('text=Upload CSV')).toBeVisible();
  });

  test('should validate CSV upload', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/fees/import');
    
    // Create a test CSV content
    const csvContent = `deal_id,transaction_id,component,basis,percent,amount,notes
101,1001,management_fee,capital,2.0,,Test management fee
101,1001,admin_fee,capital,0.5,,Test admin fee`;
    
    // Create a file from the CSV content
    const buffer = Buffer.from(csvContent);
    const fileName = 'test-fees.csv';
    
    // Set the file input
    await page.setInputFiles('input[type="file"]', {
      name: fileName,
      mimeType: 'text/csv',
      buffer: buffer
    });
    
    // Click validate button
    await page.click('button:has-text("Validate CSV")');
    
    // Check for validation results
    await expect(page.locator('text=Validation Results')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Smart Import System', () => {
  test('should load smart import page', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/fees/smart-import');
    
    // Check page elements
    await expect(page.locator('h1')).toContainText('Smart Fee Import');
    await expect(page.locator('text=Upload CSV File')).toBeVisible();
  });

  test('should handle column mapping', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/fees/smart-import');
    
    // Create a test CSV with different column names
    const csvContent = `Investor Name,Deal Name,Investment Amount,Mgmt Fee,Admin Fee
Alpha Ventures,Groq AI,500000,10000,2500
Beta Capital,Groq AI,300000,6000,1500`;
    
    const buffer = Buffer.from(csvContent);
    const fileName = 'smart-import-test.csv';
    
    // Set the file input
    await page.setInputFiles('input[type="file"]', {
      name: fileName,
      mimeType: 'text/csv',
      buffer: buffer
    });
    
    // Click upload button
    await page.click('button:has-text("Upload & Parse")');
    
    // Wait for mapping section to appear
    await expect(page.locator('text=Map Columns')).toBeVisible({ timeout: 10000 });
    
    // Check that CSV columns are displayed
    await expect(page.locator('text=Investor Name')).toBeVisible();
    await expect(page.locator('text=Deal Name')).toBeVisible();
    await expect(page.locator('text=Investment Amount')).toBeVisible();
  });

  test('should validate mapped data', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/fees/smart-import');
    
    // Upload and map CSV (reusing previous test logic)
    const csvContent = `investor,deal,gross,management_fee,admin_fee
Test Investor,Test Deal,100000,2000,500`;
    
    const buffer = Buffer.from(csvContent);
    await page.setInputFiles('input[type="file"]', {
      name: 'validate-test.csv',
      mimeType: 'text/csv',
      buffer: buffer
    });
    
    await page.click('button:has-text("Upload & Parse")');
    
    // Wait for mapping section
    await page.waitForSelector('text=Map Columns', { timeout: 10000 });
    
    // Click validate button if visible
    const validateButton = page.locator('button:has-text("Validate Mapping")');
    const validateCount = await validateButton.count();
    
    if (validateCount > 0) {
      await validateButton.click();
      
      // Check for validation results
      await expect(page.locator('text=Validation Results')).toBeVisible({ timeout: 10000 });
    }
  });
});

test.describe('Fee Matching Engine', () => {
  test('should match fees with transactions', async ({ page }) => {
    // This would typically require API testing
    const response = await page.request.post('http://localhost:3000/api/admin/fees/match', {
      data: {
        fee_records: [
          {
            investor_name: 'Alpha Ventures',
            deal_name: 'Groq AI',
            gross_amount: 500000,
            management_fee: 10000
          }
        ],
        auto_apply: false
      }
    });
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
  });

  test('should get unmatched fees', async ({ page }) => {
    const response = await page.request.get('http://localhost:3000/api/admin/fees/match');
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data).toHaveProperty('unmatched_count');
  });
});

test.describe('Fee Profiles API', () => {
  test('should create profile via API', async ({ page }) => {
    const response = await page.request.post('http://localhost:3000/api/admin/fees/profiles', {
      data: {
        deal_id: 999,
        name: 'API Test Profile',
        kind: 'MODERN',
        config: {
          tiers: [
            {
              threshold: 0,
              management_fee: 0.025,
              performance_fee: 0.15
            }
          ]
        }
      }
    });
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
  });

  test('should list profiles via API', async ({ page }) => {
    const response = await page.request.get('http://localhost:3000/api/admin/fees/profiles');
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
  });
});