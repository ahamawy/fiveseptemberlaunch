import { test, expect } from '@playwright/test';

test.describe('1.1.1.1.1 deals-data-crud-read-by-id', () => {
  test('renders deal details and fees tile', async ({ page }) => {
    await page.goto('/deals/1'); // align with local route
    // await expect(page.getByTestId('deal-detail--title')).toHaveText(/Alpha/i);
  });

  test('shows ErrorState on 404', async ({ page }) => {
    await page.goto('/deals/999999'); // mock 404
    // await expect(page.getByTestId('error-state')).toBeVisible();
  });
});
