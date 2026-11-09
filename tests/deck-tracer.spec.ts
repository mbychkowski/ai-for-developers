import { test, expect } from '@playwright/test';

test.describe('Deck tracer page', () => {
  test('renders all slides as static HTML on a 16:9 canvas with JavaScript disabled', async ({ browser }) => {
    // Create a context with JavaScript explicitly disabled
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();

    const response = await page.goto('decks/tracer-deck/');
    expect(response?.status()).toBe(200);

    // Header elements: title, way home, topic links, and updated date
    const homeLink = page.getByRole('link', { name: /home|all decks|←/i });
    await expect(homeLink).toBeVisible();
    await expect(page.locator('header').getByRole('heading', { level: 1, name: 'Tracer Deck' })).toBeVisible();
    await expect(page.locator('header').getByRole('link', { name: 'Agentic Engineering' })).toBeVisible();
    await expect(page.locator('header').getByText(/Updated Nov 1, 2026/)).toBeVisible();

    // Verify all slides render as static HTML without needing <Slide> imported in MDX
    const slides = page.locator('[data-slide]');
    await expect(slides).toHaveCount(2);

    // Slide 1 has layout="title" and its contents
    const slide1 = slides.nth(0);
    await expect(slide1.getByRole('heading', { name: 'Tracer Deck Title' })).toBeVisible();
    await expect(slide1.getByText('A tracer subtitle.')).toBeVisible();

    // Slide 2 is present in DOM as static HTML, but hidden before hydration / without JS
    const slide2 = slides.nth(1);
    await expect(slide2).toBeHidden();

    // Check canvas aspect ratio / fixed 1280x720 canvas
    const canvas = slide1.locator('.slide-canvas');
    await expect(canvas).toBeVisible();
    // Canvas dimensions defined in CSS: 1280x720
    const canvasBox = await canvas.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return { width: style.width, height: style.height };
    });
    expect(canvasBox.width).toBe('1280px');
    expect(canvasBox.height).toBe('720px');

    await context.close();
  });

  test('home link navigates back to the home page', async ({ page }) => {
    await page.goto('decks/tracer-deck/');
    const homeLink = page.getByRole('link', { name: /home|all decks|←/i });
    await homeLink.click();
    await expect(page).toHaveURL(/.*\/ai-for-developers\/$/);
  });

  test('topic link in deck header navigates to the topic page', async ({ page }) => {
    await page.goto('decks/tracer-deck/');
    await page.getByRole('link', { name: 'Agentic Engineering' }).click();
    await expect(page).toHaveURL(/.*\/topics\/agentic-engineering\/$/);
  });

  test('every internal link on deck page resolves under base path', async ({ page, request }) => {
    await page.goto('decks/tracer-deck/');
    const hrefs = await page.locator('a[href]').evaluateAll((links) =>
      links
        .map((a) => a.getAttribute('href'))
        .filter((h): h is string => Boolean(h && h.startsWith('/ai-for-developers/'))),
    );

    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) {
      const res = await request.get(href);
      expect(res.status(), `Failed to resolve ${href}`).toBe(200);
    }
  });
});

test.describe('Decks on the home page', () => {
  test('deck cards appear before essays, most recently updated first', async ({ page }) => {
    await page.goto('');

    // Check headings order: Decks section comes before Recent Essays
    const headings = await page.getByRole('heading', { level: 2 }).allTextContents();
    const decksIndex = headings.findIndex((h) => h.includes('Decks'));
    const essaysIndex = headings.findIndex((h) => h.includes('Recent Essays'));

    expect(decksIndex).toBeGreaterThanOrEqual(0);
    expect(essaysIndex).toBeGreaterThan(decksIndex);

    // Decks ordered most recently updated first
    // Newer Deck is Nov 5, Tracer Deck is Nov 1
    const deckCards = page.locator('#decks ~ div article, [aria-labelledby="decks"] article');
    await expect(deckCards).toHaveCount(2);

    const firstDeckTitle = deckCards.nth(0).getByRole('heading', { level: 3 });
    const secondDeckTitle = deckCards.nth(1).getByRole('heading', { level: 3 });
    await expect(firstDeckTitle).toHaveText('Newer Deck');
    await expect(secondDeckTitle).toHaveText('Tracer Deck');

    // Deck card metadata: description, topic chips, updated date
    const firstDeck = deckCards.nth(0);
    await expect(firstDeck.getByText('A newer deck to verify ordering.')).toBeVisible();
    await expect(firstDeck.getByText('Updated Nov 5, 2026')).toBeVisible();
    await expect(firstDeck.getByRole('link', { name: 'Agentic Engineering' })).toBeVisible();
    await expect(firstDeck.getByRole('link', { name: 'Testing' })).toBeVisible();
  });
});

test.describe('Decks on Topic pages', () => {
  test('topic page lists its decks before its essays', async ({ page }) => {
    await page.goto('topics/agentic-engineering/');

    const headings = await page.getByRole('heading', { level: 2 }).allTextContents();
    const decksIndex = headings.findIndex((h) => h.includes('Decks'));
    const essaysIndex = headings.findIndex((h) => h.includes('Essays'));

    expect(decksIndex).toBeGreaterThanOrEqual(0);
    expect(essaysIndex).toBeGreaterThan(decksIndex);

    const deckCards = page.locator('[aria-labelledby="decks"] article');
    await expect(deckCards).toHaveCount(2);
    await expect(deckCards.nth(0).getByRole('heading', { level: 3 })).toHaveText('Newer Deck');
    await expect(deckCards.nth(1).getByRole('heading', { level: 3 })).toHaveText('Tracer Deck');
  });

  test('decks section is absent when a topic has no decks', async ({ page }) => {
    // design has no published decks (only draft-deck)
    await page.goto('topics/design/');

    const headings = await page.getByRole('heading', { level: 2 }).allTextContents();
    const hasDecksHeading = headings.some((h) => h.includes('Decks'));
    expect(hasDecksHeading).toBe(false);

    // Essays section still exists
    const hasEssaysHeading = headings.some((h) => h.includes('Essays'));
    expect(hasEssaysHeading).toBe(true);
  });
});

test.describe('Draft Decks in production and dev', () => {
  test('a draft deck is absent from production listings and returns 404', async ({ page }) => {
    const response = await page.goto('decks/draft-deck/');
    expect(response?.status()).toBe(404);

    await page.goto('');
    await expect(page.getByText('Draft Deck')).not.toBeVisible();

    await page.goto('topics/design/');
    await expect(page.getByText('Draft Deck')).not.toBeVisible();
  });

  test('a draft deck is visible and marked Draft under the dev server', async ({ page }) => {
    const devBaseUrl = 'http://localhost:4322/ai-for-developers/';

    // Navigating directly to draft deck renders the page in dev
    const response = await page.goto(`${devBaseUrl}decks/draft-deck/`);
    expect(response?.status()).toBe(200);
    await expect(page.locator('header').getByRole('heading', { level: 1, name: 'Draft Deck' })).toBeVisible();

    // Draft card appears on home page listing in dev marked with Draft badge
    await page.waitForLoadState('networkidle');
    await page.goto(devBaseUrl);
    const draftCard = page.locator('article', { hasText: 'Draft Deck' });
    await expect(draftCard).toBeVisible();
    await expect(draftCard.getByText('Draft', { exact: true })).toBeVisible();

    // Draft card appears on its topic page in dev
    await page.waitForLoadState('networkidle');
    await page.goto(`${devBaseUrl}topics/design/`);
    const topicDraftCard = page.locator('article', { hasText: 'Draft Deck' });
    await expect(topicDraftCard).toBeVisible();
    await expect(topicDraftCard.getByText('Draft', { exact: true })).toBeVisible();
  });
});
