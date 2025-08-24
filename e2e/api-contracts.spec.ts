import { test, expect } from "@playwright/test";
import { DashboardDataSchema } from "../lib/contracts/api/dashboard";
import { PortfolioDataSchema } from "../lib/contracts/api/portfolio";

const INVESTOR_ID = 1;

test.describe("API Contracts", () => {
  test("Dashboard API matches schema", async ({ request }) => {
    const res = await request.get(`/api/investors/${INVESTOR_ID}/dashboard`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    const data = body.data ?? body;
    const parsed = DashboardDataSchema.parse(data);
    expect(parsed.portfolio.totalValue).toBeGreaterThanOrEqual(0);
  });

  test("Portfolio API matches schema", async ({ request }) => {
    const res = await request.get(`/api/investors/${INVESTOR_ID}/portfolio`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    const data = body.data ?? body;
    const parsed = PortfolioDataSchema.parse(data);
    expect(parsed.deals.length).toBeGreaterThan(0);
  });
});
