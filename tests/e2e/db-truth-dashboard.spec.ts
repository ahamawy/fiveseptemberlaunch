import { test, expect } from "@playwright/test";

function parseCurrency(text: string): number {
  const digits = text.replace(/[^0-9.]/g, "");
  return Number(digits || 0);
}

const INVESTOR_ID = 1;

test.describe("DB truth on dashboard", () => {
  test("UI total value matches API (±1%)", async ({ page, request }) => {
    const api = await request.get(`/api/investors/${INVESTOR_ID}/dashboard`);
    expect(api.ok()).toBeTruthy();
    const body = await api.json();
    const data = body.data ?? body;
    const apiValue = Number(data.portfolio.totalValue || 0);

    await page.goto(`/investor-portal/dashboard?investor=${INVESTOR_ID}`);
    const kpi = page.getByTestId("kpi-total-portfolio-value");
    await expect(kpi).toBeVisible({ timeout: 15000 });
    const text = await kpi.innerText();
    const uiValue = parseCurrency(text);

    // Allow small rounding differences (±1%)
    const tolerance = Math.max(1, Math.round(apiValue * 0.01));
    expect(Math.abs(uiValue - apiValue)).toBeLessThanOrEqual(tolerance);
  });
});
