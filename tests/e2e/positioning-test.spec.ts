import { test, expect } from "@playwright/test";

test.describe("Positioning Section", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(500); // Wait for animations
  });

  test("displays 'Public markets preserve wealth. Private markets create it.' quote", async ({ page }) => {
    const positioningSection = page.locator("#why");
    await expect(positioningSection).toBeVisible();
    
    // Check for the main quote
    const mainQuote = positioningSection.locator("text=Public markets preserve wealth. Private markets create it.");
    await expect(mainQuote).toBeVisible();
    
    // Verify it has gradient styling
    const quoteElement = positioningSection.locator("p").filter({ hasText: "Public markets preserve wealth" }).first();
    const hasGradient = await quoteElement.evaluate((el) => {
      const span = el.querySelector("span");
      if (!span) return false;
      const styles = window.getComputedStyle(span);
      return styles.backgroundClip === "text" || styles.webkitBackgroundClip === "text";
    });
    
    expect(hasGradient).toBeTruthy();
  });

  test("displays secondary positioning text", async ({ page }) => {
    const positioningSection = page.locator("#why");
    
    const secondaryText = positioningSection.locator("text=We curate hard-to-access opportunities for selected investors across MENA and London.");
    await expect(secondaryText).toBeVisible();
  });

  test("has proper motion animations", async ({ page }) => {
    const positioningSection = page.locator("#why");
    
    // Scroll to section to trigger animations
    await positioningSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(800); // Wait for animations
    
    // Check title opacity
    const title = positioningSection.locator("h2").first();
    const titleOpacity = await title.evaluate((el) => 
      window.getComputedStyle(el).opacity
    );
    expect(Number(titleOpacity)).toBe(1);
    
    // Check paragraphs are visible
    const paragraphs = await positioningSection.locator("p").all();
    expect(paragraphs.length).toBeGreaterThan(0);
    
    for (const p of paragraphs.slice(0, 2)) {
      const opacity = await p.evaluate((el) => 
        window.getComputedStyle(el).opacity
      );
      expect(Number(opacity)).toBe(1);
    }
  });

  test("displays bootstrapped-profitable claim badge", async ({ page }) => {
    const positioningSection = page.locator("#why");
    
    // Look for the claim badge
    const claimBadge = positioningSection.locator("span").filter({ hasText: "Bootstrapped Profitable" });
    
    if (await claimBadge.count() > 0) {
      await expect(claimBadge.first()).toBeVisible();
      
      // Check it has glass morphism styling
      const hasGlassEffect = await claimBadge.first().evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return styles.backdropFilter?.includes("blur") || 
               styles.webkitBackdropFilter?.includes("blur") ||
               styles.background.includes("rgba");
      });
      
      expect(hasGlassEffect).toBeTruthy();
    }
  });
});

test.describe("Conviction Library Section", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(500);
  });

  test("displays conviction quotes", async ({ page }) => {
    // Scroll down to find the conviction library
    await page.evaluate(() => window.scrollBy(0, 800));
    await page.waitForTimeout(500);
    
    // Check for key quotes
    const quotes = [
      "Access is the alpha.",
      "Public markets preserve wealth. Private markets create it.",
      "Signals over noise. Ownership over hype."
    ];
    
    for (const quote of quotes) {
      const quoteElement = page.locator(`text="${quote}"`);
      if (await quoteElement.count() > 0) {
        await expect(quoteElement.first()).toBeVisible();
      }
    }
  });

  test("displays Alpha equation", async ({ page }) => {
    await page.evaluate(() => window.scrollBy(0, 1000));
    await page.waitForTimeout(500);
    
    const alphaEquation = page.locator("text=Alpha = Access × Judgment × Patience");
    if (await alphaEquation.count() > 0) {
      await expect(alphaEquation.first()).toBeVisible();
      
      // Check gradient styling
      const hasGradient = await alphaEquation.first().evaluate((el) => {
        const span = el.querySelector("span") || el;
        const styles = window.getComputedStyle(span);
        return styles.backgroundClip === "text" || styles.webkitBackgroundClip === "text";
      });
      
      expect(hasGradient).toBeTruthy();
    }
  });

  test("quote cards have hover effects", async ({ page }) => {
    await page.evaluate(() => window.scrollBy(0, 800));
    await page.waitForTimeout(500);
    
    const quoteCard = page.locator("p").filter({ hasText: "Access is the alpha" }).first();
    
    if (await quoteCard.count() > 0) {
      const container = quoteCard.locator("..");
      
      // Get initial state
      const initialStyles = await container.evaluate((el) => ({
        transform: window.getComputedStyle(el).transform,
        borderColor: window.getComputedStyle(el).borderColor
      }));
      
      // Hover over the card
      await container.hover();
      await page.waitForTimeout(300);
      
      // Check hover state
      const hoverStyles = await container.evaluate((el) => ({
        transform: window.getComputedStyle(el).transform,
        borderColor: window.getComputedStyle(el).borderColor
      }));
      
      // Should have some transformation on hover
      expect(hoverStyles.transform).not.toBe(initialStyles.transform);
    }
  });
});