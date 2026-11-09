import { test, expect } from '@playwright/test';

// iPhone 14 portrait viewport
const PORTRAIT_VIEWPORT = { width: 390, height: 844 };
// Desktop landscape viewport
const DESKTOP_VIEWPORT = { width: 1280, height: 800 };

test.describe('Deck player in stacked mode on portrait phones', () => {
  test('in portrait viewport all Slides are visible in a vertical stack and scaled to width', async ({ page }) => {
    await page.setViewportSize(PORTRAIT_VIEWPORT);
    await page.goto('decks/tracer-deck/');

    // Wait for player to hydrate
    await expect(page.locator('.deck-root.is-ready')).toBeVisible();

    const slides = page.locator('[data-slide]');
    await expect(slides).toHaveCount(2);

    const slide1 = slides.nth(0);
    const slide2 = slides.nth(1);

    // Both slides should be visible simultaneously in stacked mode
    await expect(slide1).toBeVisible();
    await expect(slide2).toBeVisible();

    // Bottom desktop navigation bar should be hidden
    await expect(page.getByRole('button', { name: /previous slide/i })).toBeHidden();
    await expect(page.getByRole('button', { name: /next slide/i })).toBeHidden();

    // Check that slide canvas is scaled to available width
    const box1 = await slide1.boundingBox();
    expect(box1).not.toBeNull();
    // Padding on stage is px-3 (12px each side) -> width around 390 - 24 = 366px
    expect(box1!.width).toBeLessThanOrEqual(PORTRAIT_VIEWPORT.width);
    expect(box1!.width).toBeGreaterThan(300);

    // Slide 2 is stacked vertically below slide 1
    const box2 = await slide2.boundingBox();
    expect(box2).not.toBeNull();
    expect(box2!.y).toBeGreaterThan(box1!.y + box1!.height - 10);
  });

  test('keyboard and swipe Slide navigation are inactive in stacked mode; page scrolls normally', async ({ page }) => {
    await page.setViewportSize(PORTRAIT_VIEWPORT);
    await page.goto('decks/tracer-deck/');
    await expect(page.locator('.deck-root.is-ready')).toBeVisible();

    const slide1 = page.locator('[data-slide]').nth(0);
    const slide2 = page.locator('[data-slide]').nth(1);

    // Both slides are visible in stacked mode
    await expect(slide1).toBeVisible();
    await expect(slide2).toBeVisible();

    // ArrowRight or Space should not hide slide 1 or trigger stage slide navigation
    await page.keyboard.press('ArrowRight');
    await expect(slide1).toBeVisible();
    await expect(slide2).toBeVisible();

    // Swipe should not alter visibility
    const stage = page.locator('.deck-root > div').first();
    await stage.evaluate((el) => {
      const touch1 = new Touch({ identifier: 0, target: el, clientX: 200, clientY: 300 });
      const touch2 = new Touch({ identifier: 0, target: el, clientX: 50, clientY: 300 });
      el.dispatchEvent(new TouchEvent('touchstart', { touches: [touch1] }));
      el.dispatchEvent(new TouchEvent('touchend', { changedTouches: [touch2] }));
    });

    await expect(slide1).toBeVisible();
    await expect(slide2).toBeVisible();
  });

  test('switching from one-at-a-time to stacked scrolls current Slide into view', async ({ page }) => {
    // Start at desktop size
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await page.goto('decks/tracer-deck/');
    await expect(page.locator('.deck-root.is-ready')).toBeVisible();

    // Navigate to slide 2
    const nextButton = page.getByRole('button', { name: /next slide/i });
    await nextButton.click();
    const slide2 = page.locator('[data-slide]').nth(1);
    await expect(slide2).toBeVisible();

    // Resize to portrait phone
    await page.setViewportSize(PORTRAIT_VIEWPORT);

    // In portrait, slide 2 should be scrolled into view
    await expect(slide2).toBeInViewport();
  });

  test('switching from stacked back to one-at-a-time keeps the current Slide and resets window scroll', async ({ page }) => {
    // Test on a deck with 6 slides to ensure significant vertical scrolling
    await page.setViewportSize(PORTRAIT_VIEWPORT);
    await page.goto('decks/newer-deck/');
    await expect(page.locator('.deck-root.is-ready')).toBeVisible();

    const slide4 = page.locator('[data-slide]').nth(3);
    // Scroll deep into the deck (align slide 4 to center of viewport)
    await slide4.evaluate((el) => el.scrollIntoView({ block: 'center' }));

    // Give scroll observer time to update current slide
    await page.waitForTimeout(250);

    // Verify window has scrolled down in stacked mode
    const scrollYBefore = await page.evaluate(() => window.scrollY);
    expect(scrollYBefore).toBeGreaterThan(200);

    // Switch to desktop landscape
    await page.setViewportSize(DESKTOP_VIEWPORT);

    // In desktop:
    // 1. Slide 4 should be visible and other slides hidden
    await expect(slide4).toBeVisible();
    const slide1 = page.locator('[data-slide]').nth(0);
    await expect(slide1).toBeHidden();
    await expect(page.locator('.deck-root').getByText('4 / 6')).toBeVisible();

    // 2. Window scroll position is reset to 0 so desktop letterboxing is not displaced
    const scrollYAfter = await page.evaluate(() => window.scrollY);
    expect(scrollYAfter).toBe(0);
  });

  test('multi-slide deck: rotating from desktop to portrait scrolls current Slide into view', async ({ page }) => {
    // Start at desktop size on multi-slide deck
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await page.goto('decks/newer-deck/#4');
    await expect(page.locator('.deck-root.is-ready')).toBeVisible();

    const slide4 = page.locator('[data-slide]').nth(3);
    await expect(slide4).toBeVisible();

    // Switch to portrait phone
    await page.setViewportSize(PORTRAIT_VIEWPORT);

    // Slide 4 should be scrolled into view in portrait stack
    await expect(slide4).toBeInViewport();
  });
});
