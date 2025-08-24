import { test, expect } from "@playwright/test";

test.describe("Investor Portal smoke", () => {
  test("Dashboard renders KPIs and sections", async ({ page }) => {
    await page.goto("/investor-portal/dashboard?investor=1");

    const kpi = page.getByTestId("kpi-total-portfolio-value");
    await expect(kpi).toBeVisible({ timeout: 30000 });

    const perf = page.getByTestId("section-performance-metrics");
    await expect(perf).toBeVisible({ timeout: 30000 });

    const recent = page.getByTestId("section-recent-activity");
    await expect(recent).toBeVisible({ timeout: 30000 });
  });

  test("Portfolio shows totals, allocations, and deals table", async ({ page }) => {
    await page.goto("/investor-portal/portfolio?investor=1");

    const total = page.getByTestId("portfolio-total-value");
    await expect(total).toBeVisible({ timeout: 30000 });

    const allocSector = page.getByTestId("portfolio-allocation-by-sector");
    await expect(allocSector).toBeVisible({ timeout: 30000 });

    const allocType = page.getByTestId("portfolio-allocation-by-type");
    await expect(allocType).toBeVisible({ timeout: 30000 });

    const dealsTable = page.getByTestId("portfolio-deals-table");
    await expect(dealsTable).toBeVisible({ timeout: 30000 });
  });
});
