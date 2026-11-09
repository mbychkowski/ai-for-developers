import { test, expect } from '@playwright/test';

test.describe('Deck player on desktop', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure desktop viewport
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  test('at desktop size exactly one Slide is visible, scaled to fit', async ({ page }) => {
    await page.goto('decks/tracer-deck/');

    const slides = page.locator('[data-slide]');
    await expect(slides).toHaveCount(2);

    const slide1 = slides.nth(0);
    const slide2 = slides.nth(1);

    await expect(slide1).toBeVisible();
    await expect(slide2).toBeHidden();

    // Check that --deck-scale is computed and applied
    const deckRoot = page.locator('.deck-root');
    await expect(deckRoot).toHaveClass(/is-ready/);
    const deckScale = await deckRoot.evaluate((el) => {
      return el.style.getPropertyValue('--deck-scale');
    });
    expect(Number.parseFloat(deckScale)).toBeGreaterThan(0);
  });

  test('button navigation advances and rewinds slides, and buttons disable at the ends', async ({ page }) => {
    await page.goto('decks/tracer-deck/');

    const prevButton = page.getByRole('button', { name: /previous slide/i });
    const nextButton = page.getByRole('button', { name: /next slide/i });
    const slide1 = page.locator('[data-slide]').nth(0);
    const slide2 = page.locator('[data-slide]').nth(1);

    // Initial state: slide 1
    await expect(prevButton).toBeDisabled();
    await expect(nextButton).toBeEnabled();
    await expect(slide1).toBeVisible();
    await expect(slide2).toBeHidden();

    // Click next
    await nextButton.click();
    await expect(slide1).toBeHidden();
    await expect(slide2).toBeVisible();
    await expect(prevButton).toBeEnabled();
    await expect(nextButton).toBeDisabled();

    // Click previous
    await prevButton.click();
    await expect(slide1).toBeVisible();
    await expect(slide2).toBeHidden();
    await expect(prevButton).toBeDisabled();
    await expect(nextButton).toBeEnabled();
  });

  test('keyboard navigation works with arrows, Page Up/Down, Space/Enter, Home/End', async ({ page }) => {
    await page.goto('decks/tracer-deck/');
    await expect(page.locator('.deck-root.is-ready')).toBeVisible();

    const slide1 = page.locator('[data-slide]').nth(0);
    const slide2 = page.locator('[data-slide]').nth(1);

    // ArrowRight
    await page.keyboard.press('ArrowRight');
    await expect(slide2).toBeVisible();
    await expect(slide1).toBeHidden();

    // ArrowLeft
    await page.keyboard.press('ArrowLeft');
    await expect(slide1).toBeVisible();
    await expect(slide2).toBeHidden();

    // ArrowDown
    await page.keyboard.press('ArrowDown');
    await expect(slide2).toBeVisible();
    await expect(slide1).toBeHidden();

    // ArrowUp
    await page.keyboard.press('ArrowUp');
    await expect(slide1).toBeVisible();
    await expect(slide2).toBeHidden();

    // PageDown
    await page.keyboard.press('PageDown');
    await expect(slide2).toBeVisible();

    // PageUp
    await page.keyboard.press('PageUp');
    await expect(slide1).toBeVisible();

    // Space
    await page.keyboard.press('Space');
    await expect(slide2).toBeVisible();

    // Backspace
    await page.keyboard.press('Backspace');
    await expect(slide1).toBeVisible();

    // Enter
    await page.keyboard.press('Enter');
    await expect(slide2).toBeVisible();

    // Home jumps to start
    await page.keyboard.press('Home');
    await expect(slide1).toBeVisible();

    // End jumps to end
    await page.keyboard.press('End');
    await expect(slide2).toBeVisible();
  });

  test('counter and progress bar reflect the current Slide', async ({ page }) => {
    await page.goto('decks/tracer-deck/');

    const counter = page.locator('.deck-root').getByText(/\d+ \/ \d+/);
    await expect(counter).toHaveText('1 / 2');

    const progressBar = page.locator('.deck-root .bg-accent');
    await expect(progressBar).toHaveCSS('width', /.+/);
    const width1 = await progressBar.evaluate((el) => el.style.width);
    expect(width1).toBe('50%');

    // Advance to slide 2
    const nextButton = page.getByRole('button', { name: /next slide/i });
    await nextButton.click();

    await expect(counter).toHaveText('2 / 2');
    const width2 = await progressBar.evaluate((el) => el.style.width);
    expect(width2).toBe('100%');
  });

  test('hash updates on navigation without adding history entries', async ({ page }) => {
    await page.goto('decks/tracer-deck/');
    expect(page.url()).not.toContain('#');

    const nextButton = page.getByRole('button', { name: /next slide/i });
    await nextButton.click();

    await expect(page).toHaveURL(/.*\/decks\/tracer-deck\/#2$/);

    const historyLength = await page.evaluate(() => window.history.length);

    const prevButton = page.getByRole('button', { name: /previous slide/i });
    await prevButton.click();
    await expect(page).toHaveURL(/.*\/decks\/tracer-deck\/#1$/);

    const historyLengthAfter = await page.evaluate(() => window.history.length);
    expect(historyLengthAfter).toBe(historyLength);
  });

  test('deep link opening #n starts at that Slide and clamps out-of-range numbers', async ({ page }) => {
    // Open #2
    await page.goto('decks/tracer-deck/#2');
    const slide2 = page.locator('[data-slide]').nth(1);
    await expect(slide2).toBeVisible();
    await expect(page.locator('.deck-root').getByText('2 / 2')).toBeVisible();

    // Clamps large number (#99 -> slide 2)
    await page.goto('decks/tracer-deck/#99');
    await expect(slide2).toBeVisible();
    await expect(page.locator('.deck-root').getByText('2 / 2')).toBeVisible();

    // Clamps non-positive number (#0 -> slide 1)
    await page.goto('decks/tracer-deck/#0');
    const slide1 = page.locator('[data-slide]').nth(0);
    await expect(slide1).toBeVisible();
    await expect(page.locator('.deck-root').getByText('1 / 2')).toBeVisible();

    // Clamps non-numeric hash (#foo -> slide 1)
    await page.goto('decks/tracer-deck/#foo');
    await expect(slide1).toBeVisible();
    await expect(page.locator('.deck-root').getByText('1 / 2')).toBeVisible();
  });

  test('manual hash edits move the view', async ({ page }) => {
    await page.goto('decks/tracer-deck/');
    const slide1 = page.locator('[data-slide]').nth(0);
    const slide2 = page.locator('[data-slide]').nth(1);

    await expect(slide1).toBeVisible();

    // Manually edit hash in location
    await page.evaluate(() => {
      window.location.hash = '#2';
    });

    await expect(slide2).toBeVisible();
    await expect(slide1).toBeHidden();
    await expect(page.locator('.deck-root').getByText('2 / 2')).toBeVisible();

    // Manually edit hash back to #1
    await page.evaluate(() => {
      window.location.hash = '#1';
    });

    await expect(slide1).toBeVisible();
    await expect(slide2).toBeHidden();
    await expect(page.locator('.deck-root').getByText('1 / 2')).toBeVisible();
  });

  test('only the first Slide is visible before the player hydrates (JS disabled)', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();

    await page.goto('decks/tracer-deck/');

    const slides = page.locator('[data-slide]');
    await expect(slides).toHaveCount(2);

    const slide1 = slides.nth(0);
    const slide2 = slides.nth(1);

    await expect(slide1).toBeVisible();
    await expect(slide2).toBeHidden();

    // Controls should not be visible before hydration
    await expect(page.getByRole('button', { name: /previous slide/i })).toBeHidden();
    await expect(page.getByRole('button', { name: /next slide/i })).toBeHidden();

    await context.close();
  });

  test('Deck and Slides carry accessible labels and position announcements', async ({ page }) => {
    await page.goto('decks/tracer-deck/');

    // Deck has roledescription="slide deck" and label
    const deckRoot = page.locator('.deck-root');
    await expect(deckRoot).toHaveAttribute('aria-roledescription', 'slide deck');
    await expect(deckRoot).toHaveAttribute('aria-label', 'Tracer Deck');

    // Each slide has accessible label
    const slides = page.locator('[data-slide]');
    await expect(slides.nth(0)).toHaveAttribute('aria-label', 'Slide 1 of 2');
    await expect(slides.nth(1)).toHaveAttribute('aria-label', 'Slide 2 of 2');

    // Counter has aria-live="polite"
    const liveRegion = page.locator('[aria-live="polite"]');
    await expect(liveRegion).toBeVisible();
    await expect(liveRegion).toHaveText('1 / 2');
  });
});
