import { test, expect } from "@playwright/test";

test.describe("Landing Page Motion & Elegance", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Wait for initial animations to start
    await page.waitForTimeout(100);
  });

  test("Hero section animations are properly applied", async ({ page }) => {
    // Check that motion elements exist
    const hero = page.locator("section").first();
    await expect(hero).toBeVisible();

    // Check headline has gradient and animation classes
    const headline = page.locator("h1").first();
    await expect(headline).toBeVisible();
    
    // Verify gradient text styling
    const headlineStyles = await headline.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        backgroundClip: computed.backgroundClip || computed.webkitBackgroundClip,
        color: computed.color,
        backgroundImage: computed.backgroundImage,
      };
    });
    
    expect(headlineStyles.backgroundClip).toContain("text");
    expect(headlineStyles.color).toBe("rgba(0, 0, 0, 0)"); // transparent for gradient text
    expect(headlineStyles.backgroundImage).toContain("linear-gradient");

    // Check motion attributes are present
    const hasMotionAttributes = await headline.evaluate((el) => {
      return el.hasAttribute("style") && 
             (el.style.transform !== "" || el.style.opacity !== "");
    });
    
    // Motion should have been applied
    await page.waitForTimeout(600); // Wait for fadeUp animation
    const finalOpacity = await headline.evaluate((el) => 
      window.getComputedStyle(el).opacity
    );
    expect(Number(finalOpacity)).toBe(1);
  });

  test("Stats cards have hover interactions", async ({ page }) => {
    const statsSection = page.locator("section").nth(1);
    await expect(statsSection).toBeVisible();
    
    const firstCard = statsSection.locator("[class*='rounded-xl']").first();
    await expect(firstCard).toBeVisible();
    
    // Get initial transform
    const initialTransform = await firstCard.evaluate((el) => 
      window.getComputedStyle(el).transform
    );
    
    // Hover over the card
    await firstCard.hover();
    await page.waitForTimeout(200); // Wait for spring animation
    
    // Check transform has changed (should move up)
    const hoverTransform = await firstCard.evaluate((el) => 
      window.getComputedStyle(el).transform
    );
    
    expect(hoverTransform).not.toBe(initialTransform);
    
    // Check if card has glass morphism effect
    const cardStyles = await firstCard.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        background: computed.background,
        backdropFilter: computed.backdropFilter,
        border: computed.border,
      };
    });
    
    expect(cardStyles.border).toContain("rgba(255, 255, 255");
  });

  test("CTA button has primary interactions", async ({ page }) => {
    const ctaButton = page.locator("a[href*='investor-portal']").first();
    await expect(ctaButton).toBeVisible();
    
    // Check button has gradient background
    const buttonStyles = await ctaButton.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        background: computed.background,
        transform: computed.transform,
      };
    });
    
    // Hover interaction
    await ctaButton.hover();
    await page.waitForTimeout(200);
    
    const hoverStyles = await ctaButton.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        transform: computed.transform,
      };
    });
    
    // Button should lift on hover
    expect(hoverStyles.transform).not.toBe("none");
  });

  test("Background has proper gradient and effects", async ({ page }) => {
    const background = page.locator("[class*='Background']").first();
    
    if (await background.count() > 0) {
      const bgStyles = await background.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          background: computed.background,
          position: computed.position,
        };
      });
      
      expect(bgStyles.position).toBe("fixed");
    }
    
    // Check main gradient
    const main = page.locator("main").first();
    const mainStyles = await main.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        background: computed.background,
        minHeight: computed.minHeight,
      };
    });
    
    expect(mainStyles.background).toContain("linear-gradient");
    expect(mainStyles.minHeight).toBe("100vh");
  });

  test("Navigation has underline hover effects", async ({ page }) => {
    const nav = page.locator("nav, [class*='Nav']").first();
    
    if (await nav.count() > 0) {
      const navLink = nav.locator("a").first();
      
      if (await navLink.count() > 0) {
        await navLink.hover();
        await page.waitForTimeout(350); // Wait for underline animation
        
        // Check for underline pseudo element or border
        const linkStyles = await navLink.evaluate((el) => {
          const computed = window.getComputedStyle(el);
          const after = window.getComputedStyle(el, "::after");
          return {
            borderBottom: computed.borderBottom,
            afterContent: after.content,
            afterTransform: after.transform,
          };
        });
        
        // Should have some underline effect
        expect(
          linkStyles.borderBottom !== "none" || 
          linkStyles.afterContent !== "none"
        ).toBeTruthy();
      }
    }
  });

  test("Scroll animations trigger on viewport entry", async ({ page }) => {
    // Scroll to stats section
    await page.evaluate(() => window.scrollTo(0, 0));
    
    const statsSection = page.locator("section").nth(1);
    const initialOpacity = await statsSection.evaluate((el) => 
      window.getComputedStyle(el.querySelector("[class*='rounded-xl']") || el).opacity
    );
    
    // Scroll down to trigger animations
    await statsSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600); // Wait for animations
    
    const finalOpacity = await statsSection.evaluate((el) => 
      window.getComputedStyle(el.querySelector("[class*='rounded-xl']") || el).opacity
    );
    
    // Opacity should change from 0 to 1
    expect(Number(finalOpacity)).toBeGreaterThanOrEqual(Number(initialOpacity));
  });

  test("Brand colors are correctly applied", async ({ page }) => {
    // Check primary brand color usage
    const primaryElements = await page.locator("[class*='primary'], [class*='hero']").all();
    
    for (const element of primaryElements.slice(0, 3)) {
      const styles = await element.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          background: computed.background,
          backgroundColor: computed.backgroundColor,
          color: computed.color,
        };
      });
      
      // Should contain brand purple (#C898FF) or gradients
      const hasBrandColor = 
        styles.background.includes("200, 152, 255") || // RGB for #C898FF
        styles.background.includes("C898FF") ||
        styles.background.includes("gradient") ||
        styles.backgroundColor.includes("200, 152, 255");
      
      if (styles.background !== "none" || styles.backgroundColor !== "rgba(0, 0, 0, 0)") {
        expect(hasBrandColor).toBeTruthy();
      }
    }
  });

  test("Glass morphism effects are present", async ({ page }) => {
    // Check stats cards for glass morphism
    const statsCards = await page.locator("section").nth(1).locator("[class*='backdrop-blur']").all();
    
    if (statsCards.length > 0) {
      const firstCard = statsCards[0];
      const styles = await firstCard.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          backdropFilter: computed.backdropFilter,
          webkitBackdropFilter: computed.webkitBackdropFilter,
          background: computed.background,
        };
      });
      
      // Should have backdrop blur
      const hasBlur = 
        styles.backdropFilter?.includes("blur") || 
        styles.webkitBackdropFilter?.includes("blur");
      
      expect(hasBlur).toBeTruthy();
    } else {
      // If no glass elements found, check for semi-transparent backgrounds as alternative
      const cards = await page.locator("section").nth(1).locator("[class*='rounded-xl']").first();
      const bgColor = await cards.evaluate((el) => 
        window.getComputedStyle(el).backgroundColor
      );
      expect(bgColor).toContain("rgba");
    }
  });

  test("Motion respects prefers-reduced-motion", async ({ page }) => {
    // Set reduced motion preference
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.reload();
    
    const headline = page.locator("h1").first();
    await expect(headline).toBeVisible();
    
    // With reduced motion, animations should be instant or disabled
    const transition = await headline.evaluate((el) => 
      window.getComputedStyle(el).transition
    );
    
    // Should have no transition or very fast transition
    expect(
      transition === "none" || 
      transition.includes("0s") || 
      transition.includes("0ms")
    ).toBeTruthy();
  });

  test("Performance: Animations don't cause layout thrashing", async ({ page }) => {
    // Monitor for layout recalculations during animations
    const metrics = await page.evaluate(async () => {
      const observer = new PerformanceObserver((list) => {});
      observer.observe({ entryTypes: ["measure", "layout-shift"] });
      
      // Trigger some animations
      window.scrollTo(0, 100);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const entries = performance.getEntriesByType("layout-shift");
      return {
        layoutShifts: entries.length,
        cumulativeShift: entries.reduce((sum, entry: any) => sum + entry.value, 0),
      };
    });
    
    // Should have minimal layout shifts
    expect(metrics.cumulativeShift).toBeLessThan(0.1); // Good CLS score
  });
});

test.describe("Brand Compliance", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("No emoji characters in UI", async ({ page }) => {
    const bodyText = await page.locator("body").innerText();
    
    // Check for common emoji ranges
    const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
    const hasEmoji = emojiRegex.test(bodyText);
    
    expect(hasEmoji).toBeFalsy();
  });

  test("Icons use SVG with currentColor", async ({ page }) => {
    const svgIcons = await page.locator("svg").all();
    
    for (const icon of svgIcons.slice(0, 5)) {
      const attributes = await icon.evaluate((el) => ({
        fill: el.getAttribute("fill"),
        stroke: el.getAttribute("stroke"),
        className: el.className.baseVal || el.className,
      }));
      
      // Icons should use currentColor or have appropriate classes
      const usesCurrentColor = 
        attributes.fill === "currentColor" || 
        attributes.stroke === "currentColor" ||
        attributes.fill === "none" ||
        attributes.className.includes("w-") && attributes.className.includes("h-");
      
      expect(usesCurrentColor).toBeTruthy();
    }
  });

  test("Typography uses correct font hierarchy", async ({ page }) => {
    const h1 = page.locator("h1").first();
    const h1Styles = await h1.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        fontSize: computed.fontSize,
        fontWeight: computed.fontWeight,
        lineHeight: computed.lineHeight,
      };
    });
    
    // H1 should be large and bold
    expect(parseInt(h1Styles.fontSize)).toBeGreaterThanOrEqual(32);
    expect(parseInt(h1Styles.fontWeight)).toBeGreaterThanOrEqual(600);
    
    // Check paragraph text
    const paragraph = page.locator("p").first();
    if (await paragraph.count() > 0) {
      const pStyles = await paragraph.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          fontSize: computed.fontSize,
          lineHeight: computed.lineHeight,
        };
      });
      
      expect(parseInt(pStyles.fontSize)).toBeGreaterThanOrEqual(14);
      expect(parseInt(pStyles.fontSize)).toBeLessThanOrEqual(20);
    }
  });

  test("Dark theme is properly implemented", async ({ page }) => {
    const body = page.locator("body");
    const bodyStyles = await body.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        backgroundColor: computed.backgroundColor,
        color: computed.color,
      };
    });
    
    // Parse RGB values
    const bgMatch = bodyStyles.backgroundColor.match(/\d+/g);
    const colorMatch = bodyStyles.color.match(/\d+/g);
    
    if (bgMatch && colorMatch) {
      const bgLuminance = (parseInt(bgMatch[0]) + parseInt(bgMatch[1]) + parseInt(bgMatch[2])) / 3;
      const textLuminance = (parseInt(colorMatch[0]) + parseInt(colorMatch[1]) + parseInt(colorMatch[2])) / 3;
      
      // Dark background
      expect(bgLuminance).toBeLessThan(50);
      // Light text
      expect(textLuminance).toBeGreaterThan(200);
    }
  });
});